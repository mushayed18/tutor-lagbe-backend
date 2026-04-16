import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";
import { CreateTuitionInput } from "./tuition.validation";

const createTuition = async (
  requester: AuthUser,
  payload: CreateTuitionInput,
) => {
  // requester = logged in user (from auth middleware)

  const tuition = await prisma.tuition.create({
    data: {
      parentId: requester.id,

      title: payload.title,
      description: payload.description,
      subject: payload.subject,
      classLevel: payload.classLevel,
      salary: payload.salary,
      location: payload.location,
      daysPerWeek: payload.daysPerWeek,
      timeSlot: payload.timeSlot,
    },
  });

  return tuition;
};

const getAllTuitions = async (query: { page?: number; limit?: number }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const tuitions = await prisma.tuition.findMany({
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          photo: true,
          subscriptionType: true,
          subscriptionRole: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit * 2, // fetch extra for better sorting
  });

  //  Premium logic
  const isPremiumActive = (user: any) => {
    return (
      user.subscriptionType === "PREMIUM" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date()
    );
  };

  // Sort
  tuitions.sort((a, b) => {
    const aPremium = isPremiumActive(a.parent);
    const bPremium = isPremiumActive(b.parent);

    if (aPremium && !bPremium) return -1;
    if (!aPremium && bPremium) return 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Final slice
  return tuitions.slice(0, limit);
};

const getSingleTuition = async (requester: any, tuitionId: string) => {
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
    include: {
      parent: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  return {
    ...tuition,
    applicationsCount: tuition._count.applications,

    parent: {
      id: tuition.parent.id,
      name: tuition.parent.name,
      photo: tuition.parent.photo,
      location: tuition.parent.location,
      subscriptionType: tuition.parent.subscriptionType,
      phone: null,
      email: null,
    },
  };
};

const getMyTuitions = async (
  requester: AuthUser,
  query: { page?: any; limit?: any },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const tuitions = await prisma.tuition.findMany({
    where: {
      parentId: requester.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          photo: true,
          subscriptionType: true,
          subscriptionRole: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  // Format response (clean API design)
  const result = tuitions.map((tuition) => ({
    id: tuition.id,
    title: tuition.title,
    description: tuition.description,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    salary: tuition.salary,
    location: tuition.location,
    daysPerWeek: tuition.daysPerWeek,
    timeSlot: tuition.timeSlot,
    status: tuition.status,
    createdAt: tuition.createdAt,

    applicationsCount: tuition._count.applications,

    parent: tuition.parent,
  }));

  return {
    meta: {
      page,
      limit,
      count: result.length,
    },
    data: result,
  };
};

const updateTuition = async (
  requester: AuthUser,
  tuitionId: string,
  payload: Partial<CreateTuitionInput>,
) => {
  // 1. Find tuition
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  // 2. Ownership check 🔥
  if (tuition.parentId !== requester.id) {
    throw new Error("You are not authorized to update this tuition");
  }

  if (tuition.status === "CLOSED") {
    throw new Error("Cannot update closed tuition");
  }

  // 3. Update
  const updated = await prisma.tuition.update({
    where: { id: tuitionId },
    data: payload,
  });

  return updated;
};

const deleteTuition = async (requester: AuthUser, tuitionId: string) => {
  // 1. Find tuition
  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
  });

  if (!tuition) {
    throw new Error("Tuition not found");
  }

  // 2. Ownership check 🔥
  if (tuition.parentId !== requester.id) {
    throw new Error("You are not authorized to delete this tuition");
  }

  // 3. Delete
  await prisma.tuition.delete({
    where: { id: tuitionId },
  });

  return { id: tuitionId };
};

export const TuitionService = {
  createTuition,
  getAllTuitions,
  getSingleTuition,
  getMyTuitions,
  updateTuition,
  deleteTuition,
};
