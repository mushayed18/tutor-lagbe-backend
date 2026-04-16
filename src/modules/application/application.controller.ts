import { Request, Response } from "express";
import { ApplicationService } from "./application.service";

const applyToTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const { tuitionId } = req.body;

    const result = await ApplicationService.applyToTuition(
      requester,
      tuitionId
    );

    res.status(201).json({
      success: true,
      message: "Applied successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { applyToTuition };