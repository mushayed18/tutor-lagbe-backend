import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addBookmark, getMyBookmarks, removeBookmark } from "./bookmark.controller";

const router = Router();

router.post("/", authMiddleware, addBookmark);

router.delete("/:tuitionId", authMiddleware, removeBookmark);

router.get("/", authMiddleware, getMyBookmarks);

export default router;
