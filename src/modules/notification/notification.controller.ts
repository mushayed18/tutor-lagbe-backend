import { Request, Response } from "express";
import { NotificationService } from "./notification.service";

const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const result = await NotificationService.getMyNotifications(
      req.user,
      req.query,
    );

    res.json({
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

export {
  getMyNotifications,
};
