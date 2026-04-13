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

export { updateProfile };