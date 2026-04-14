import { z } from "zod";

export const createReviewSchema = z.object({
  targetUserId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(3).max(500).optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;