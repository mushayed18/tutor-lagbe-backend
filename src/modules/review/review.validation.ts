import { z } from "zod";

export const createReviewSchema = z.object({
  targetUserId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;