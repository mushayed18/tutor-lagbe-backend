import { z } from "zod";

export const createPortfolioSchema = z.object({
  headline: z.string().min(5),
  bio: z.string().min(10),

  university: z.string().min(2),
  department: z.string().min(2),
  experience: z.string().min(2),

  subjects: z.string().min(2),
  preferredClasses: z.string().min(2),

  expectedSalary: z.number().positive(),
  availability: z.string().min(2),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;