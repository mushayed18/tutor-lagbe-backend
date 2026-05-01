import { Router } from "express";
import { PortfolioController } from "./portfolio.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, PortfolioController.createPortfolio);
router.patch("/", authMiddleware, PortfolioController.updatePortfolio);
router.get("/me", authMiddleware, PortfolioController.getMyPortfolio);
router.get("/:userId", PortfolioController.getPortfolioByUserId);

export default router;