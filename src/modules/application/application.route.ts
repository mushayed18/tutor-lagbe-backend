import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { applyToTuition } from "./application.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("TUTOR"),
  applyToTuition
);

export default router;
