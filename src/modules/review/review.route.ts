import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  checkEligibility,
} from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/check-eligibility/:targetUserId",
  authMiddleware,
  checkEligibility,
);
router.get("/user/:userId", authMiddleware, getUserReviews);
router.post("/", authMiddleware, createReview);
router.patch("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
