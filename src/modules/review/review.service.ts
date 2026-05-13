import { prisma } from "../../lib/prisma";

const checkEligibility = async (requesterId: string, targetUserId: string) => {
  // 1. Check for a valid HireRelation
  // This ensures the tutor was officially hired by this parent
  const hasHiredRelation = await prisma.hireRelation.findFirst({
    where: {
      tutorId: requesterId,
      parentId: targetUserId,
    },
  });

  // If no hiring history exists, they cannot review
  if (!hasHiredRelation) {
    return false;
  }

  // 2. Check if a review already exists
  // We don't want multiple reviews from the same person for the same target
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: requesterId,
      targetUserId: targetUserId,
    },
  });

  // If they have already reviewed, they can't review again (canReview = false)
  // If no review exists, they are eligible (canReview = true)
  return !existingReview;
};

const getUserReviews = async (
  targetUserId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  // 1. Fetch reviews and count simultaneously
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { targetUserId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    }),
    prisma.review.count({
      where: { targetUserId },
    }),
  ]);

  return {
    reviews,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

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
  const hasHiredRelation = await prisma.hireRelation.findFirst({
    where: {
      OR: [
        {
          tutorId: requester.id,
          parentId: targetUserId,
        },
        {
          tutorId: targetUserId,
          parentId: requester.id,
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

const updateReview = async (requester: any, reviewId: string, payload: any) => {
  // 1. Find review
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // 2. Ownership check 🔥
  if (review.reviewerId !== requester.id) {
    throw new Error("You are not allowed to update this review");
  }

  // 3. Update
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });

  return updatedReview;
};

const deleteReview = async (requester: any, reviewId: string) => {
  // 1. Find review
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // 2. Ownership check
  if (review.reviewerId !== requester.id) {
    throw new Error("You are not allowed to delete this review");
  }

  // 3. Delete
  await prisma.review.delete({
    where: { id: reviewId },
  });

  return;
};

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  checkEligibility,
};
