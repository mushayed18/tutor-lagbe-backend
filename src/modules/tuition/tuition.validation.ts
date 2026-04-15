import { z } from "zod";

export const createTuitionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  subject: z.string().min(2),
  classLevel: z.string().min(1),
  salary: z.number().min(1000),
  location: z.string().min(3),

  daysPerWeek: z.number().min(1).max(7),
  timeSlot: z.string().min(3),
});

export type CreateTuitionInput = z.infer<typeof createTuitionSchema>;