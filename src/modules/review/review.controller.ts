import { Request, Response } from "express";
import { createReviewSchema, updateReviewSchema } from "./review.validation";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const validatedData = createReviewSchema.parse(req.body);

    const result = await ReviewService.createReview(requester, validatedData);

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

const updateReview = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const reviewId = req.params.id as string;

    const validatedData = updateReviewSchema.parse(req.body);

    const result = await ReviewService.updateReview(
      requester,
      reviewId,
      validatedData,
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const reviewId = req.params.id as string;

    await ReviewService.deleteReview(requester, reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { createReview, updateReview, deleteReview };
