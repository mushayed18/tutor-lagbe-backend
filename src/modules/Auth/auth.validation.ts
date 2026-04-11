// src/controllers/Auth/auth.validation.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please provide a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  role: z.enum(["TUTOR", "PARENT"], {
    message: "Role must be TUTOR or PARENT",
  }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email' }),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits' }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Valid email required" }),
  password: z.string().min(6, { message: "Password required" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
