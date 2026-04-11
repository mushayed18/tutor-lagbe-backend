// src/controllers/Auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema } from './auth.validation';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Call service
    const result = await AuthService.register(validatedData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { email: result.email },
    });
  } catch (error: any) {
    console.error('Register Error:', error);

    // Handle Zod validation errors
    if (error.errors) {
      res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};