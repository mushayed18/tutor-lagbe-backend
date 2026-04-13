import { prisma } from "../../lib/prisma";

const createReview = async (requester: any, payload: any) => {
  const { targetUserId, rating, comment } = payload;

  // 1. Prevent self-review ❌
  if (requester.id === targetUserId) {
    throw new Error("You cannot review yourself");
  }

  // 2. Check target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  if (requester.role === targetUser.role) {
    throw new Error("You cannot review users with the same role");
  }

  // 3. Check HIRED relationship (VERY IMPORTANT)
  const hasHiredRelation = await prisma.application.findFirst({
    where: {
      status: "HIRED",
      OR: [
        // Tutor reviewing Parent
        {
          tutorId: requester.id,
          tuition: {
            parentId: targetUserId,
          },
        },
        // Parent reviewing Tutor
        {
          tutorId: targetUserId,
          tuition: {
            parentId: requester.id,
          },
        },
      ],
    },
  });

  if (!hasHiredRelation) {
    throw new Error("You can only review after hiring");
  }

  // 4. Prevent duplicate review
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: requester.id,
      targetUserId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this user");
  }

  // 5. Create review
  const review = await prisma.review.create({
    data: {
      reviewerId: requester.id,
      targetUserId,
      rating,
      comment,
    },
  });

  return review;
};

export const ReviewService = {
  createReview,
};
