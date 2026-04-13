import { Router } from "express";
import { createReview } from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createReview);

export default router;