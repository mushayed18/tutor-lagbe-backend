import { Request, Response } from "express";
import { createReviewSchema } from "./review.validation";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const validatedData = createReviewSchema.parse(req.body);

    const result = await ReviewService.createReview(
      requester,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createReview };