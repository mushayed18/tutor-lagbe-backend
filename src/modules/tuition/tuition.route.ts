import { Router } from "express";
import {
  createTuition,
  deleteTuition,
  getAllTuitions,
  getMyTuitions,
  getSingleTuition,
  updateTuition,
} from "./tuition.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

// Only PARENT can create
router.post("/", authMiddleware, requireRole("PARENT"), createTuition);

router.get("/", authMiddleware, getAllTuitions);
router.get(
    "/my-posts",
    authMiddleware,
    requireRole("PARENT"),
    getMyTuitions,
);

router.get("/:id", authMiddleware, getSingleTuition);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("PARENT"),
  updateTuition
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("PARENT"),
  deleteTuition
);

export default router;
