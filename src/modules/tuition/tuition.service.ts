import { prisma } from "../../lib/prisma";
import { AuthUser } from "../../types/common";
import { CreateTuitionInput } from "./tuition.validation";

const createTuition = async (
  requester: AuthUser,
  payload: CreateTuitionInput
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
      parent: true,
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

export const TuitionService = {
  createTuition,
  getAllTuitions,
};