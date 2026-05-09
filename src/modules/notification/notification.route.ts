import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMyNotifications, getUnreadCount, markAsRead } from "./notification.controller";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);

router.get("/unread-count", authMiddleware, getUnreadCount);

router.patch("/mark-as-read", authMiddleware, markAsRead);

export default router;