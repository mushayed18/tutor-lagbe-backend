import express from "express";
import { AdminController } from "./admin.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = express.Router();

// Only ADMIN can access
router.get(
  "/users",
  authMiddleware,
  requireRole("ADMIN"),
  AdminController.getUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  requireRole("ADMIN"),
  AdminController.getSingleUser
);

router.patch(
  "/users/:id/ban",
  authMiddleware,
  requireRole("ADMIN"),
  AdminController.toggleUserBan
);

router.get(
  "/tuitions",
  authMiddleware,
  requireRole("ADMIN"),
  AdminController.getAllTuitions
);

router.delete(
  "/tuitions/:id",
  authMiddleware,
  requireRole("ADMIN"),
  AdminController.deleteTuition
);

export default router;