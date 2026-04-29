import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMyNotifications } from "./notification.controller";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);

export default router;