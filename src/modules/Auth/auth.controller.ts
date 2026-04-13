// src/controllers/Auth/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  registerSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from "./auth.validation";
import { cookieOptions } from "../../config/cookie";
import { loginSchema, forgotPasswordSchema } from "./auth.validation";

const register = async (req: Request, res: Response) => {
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
    console.error("Register Error:", error);

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
      message: error.message || "Registration failed",
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);

    const result = await AuthService.verifyEmail(validatedData);

    // 🍪 SET COOKIE
    res.cookie("token", result.token, cookieOptions);

    // remove password before sending
    const { password, ...userData } = result.user;

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: userData,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await AuthService.login(validatedData);

    // 🍪 Set cookie
    res.cookie("token", result.token, cookieOptions);

    // remove password before sending
    const { password, ...userData } = result.user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userData,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const logout = (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);

    const result = await AuthService.forgotPassword(validatedData);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);

    const result = await AuthService.resetPassword(validatedData);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    // user comes from middleware
    const userId = req.user.id;

    const result = await AuthService.changePassword(userId, validatedData);

    // OPTIONAL SECURITY STEP
    res.clearCookie("token", cookieOptions);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
