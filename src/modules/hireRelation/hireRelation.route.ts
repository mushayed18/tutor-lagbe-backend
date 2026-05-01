import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMyConnections } from "./hireRelation.controller";

const router = Router();

router.get("/my-connections", authMiddleware, getMyConnections);

export default router;


