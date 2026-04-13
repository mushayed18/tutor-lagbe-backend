import { Router } from "express";
import { updateProfile } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/multer.middleware";

const router = Router();

router.patch(
  "/me",
  authMiddleware,
  upload.single("photo"), // 🔥 important
  updateProfile
);

export default router;