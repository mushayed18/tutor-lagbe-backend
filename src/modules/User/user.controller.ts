import { Request, Response } from "express";
import { UserService } from "./user.service";

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const result = await UserService.updateProfile(userId, req);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  try {
    const requester = req.user; // from middleware
    const targetUserId = req.params.id as string;

    const result = await UserService.getUserProfile(
      requester,
      targetUserId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const result = await UserService.getMe(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export { updateProfile, getUserProfile, getMe };