import { Router } from "express";
import { createTuition, getAllTuitions } from "./tuition.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

// Only PARENT can create
router.post(
  "/",
  authMiddleware,
  requireRole("PARENT"),
  createTuition
);

router.get("/", getAllTuitions);

export default router;