import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { applyToTuition, getApplicationsForTuition, getMyApplications, updateApplicationStatus } from "./application.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("TUTOR"),
  applyToTuition
);

router.get(
  "/my",
  authMiddleware,
  requireRole("TUTOR"),
  getMyApplications
);

router.get(
  "/tuition/:tuitionId",
  authMiddleware,
  requireRole("PARENT"),
  getApplicationsForTuition
);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("PARENT"),
  updateApplicationStatus
);

export default router;
