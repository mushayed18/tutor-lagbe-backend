import { Router } from "express";
import { getUserProfile, updateProfile, getMe } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/multer.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.patch(
  "/me",
  authMiddleware,
  upload.single("photo"), 
  updateProfile
);

router.get("/:id", authMiddleware, getUserProfile);

export default router;