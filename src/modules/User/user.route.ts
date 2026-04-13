import { Router } from "express";
import { getUserProfile, updateProfile } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/multer.middleware";

const router = Router();

router.patch(
  "/me",
  authMiddleware,
  upload.single("photo"), 
  updateProfile
);

router.get("/:id", authMiddleware, getUserProfile);

export default router;