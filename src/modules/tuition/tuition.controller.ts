import { Request, Response } from "express";
import { createTuitionSchema } from "./tuition.validation";
import { TuitionService } from "./tuition.service";

const createTuition = async (req: Request, res: Response) => {
  try {
    const requester = req.user;

    // validate body
    const validatedData = createTuitionSchema.parse(req.body);

    const result = await TuitionService.createTuition(
      requester,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Tuition created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTuitions = async (req: Request, res: Response) => {
  try {
    const result = await TuitionService.getAllTuitions(req.query);

    res.status(200).json({
      success: true,
      message: "Tuitions fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createTuition, getAllTuitions };