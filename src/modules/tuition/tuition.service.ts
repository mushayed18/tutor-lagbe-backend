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

// 1. Pass requester to the function
const getAllTuitions = async (
  requester: any,
  query: { page?: number; limit?: number },
) => {
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
          subscriptionExpiresAt: true, // Need this for the premium logic below
          subscriptionRole: true,
        },
      },
      // 2. Check if THIS requester has bookmarked this tuition
      bookmarks: {
        where: {
          userId: requester.id,
        },
        select: {
          id: true,
        },
      },

      applications: {
        where: { tutorId: requester.id },
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit * 2,
  });

  const isPremiumActive = (user: any) => {
    return (
      user.subscriptionType === "PREMIUM" &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date()
    );
  };

  // Sort logic (unchanged)
  tuitions.sort((a, b) => {
    const aPremium = isPremiumActive(a.parent);
    const bPremium = isPremiumActive(b.parent);
    if (aPremium && !bPremium) return -1;
    if (!aPremium && bPremium) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 3. Format the result to include a simple boolean 'isBookmarked'
  const formattedTuitions = tuitions.slice(0, limit).map((t) => ({
    ...t,
    isBookmarked: t.bookmarks.length > 0, // If the array has an item, they bookmarked it
    hasApplied: t.applications.length > 0,
    bookmarks: undefined, // Remove the raw array from the response to keep it clean
    applications: undefined,
  }));

  return formattedTuitions;
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
      // Check for a bookmark by the current user
      bookmarks: {
        where: {
          userId: requester.id,
        },
        select: {
          id: true,
        },
      },
      // ADD THIS: Check if the current user has applied
      applications: {
        where: {
          tutorId: requester.id,
        },
        select: {
          id: true,
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

    // Convert arrays to simple booleans
    isBookmarked: tuition.bookmarks.length > 0,
    hasApplied: tuition.applications.length > 0, // NEW BOOLEAN

    parent: {
      id: tuition.parent.id,
      name: tuition.parent.name,
      photo: tuition.parent.photo,
      location: tuition.parent.location,
      subscriptionType: tuition.parent.subscriptionType,
      phone: null,
      email: null,
    },

    // Cleanup: remove the raw arrays from the final object
    bookmarks: undefined,
    applications: undefined,
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
