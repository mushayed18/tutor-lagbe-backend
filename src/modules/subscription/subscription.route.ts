import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  createCheckoutSession,
  getMySubscription,
  getPlan,
} from "./subscription.controller";

const router = Router();

// NOTE: the webhook itself is NOT mounted here — it's registered directly
// in app.ts, before the global express.json() parser (Stripe needs the raw body).

router.post(
  "/checkout",
  authMiddleware,
  requireRole("TUTOR", "PARENT"),
  createCheckoutSession,
);
router.get("/plan", authMiddleware, requireRole("TUTOR", "PARENT"), getPlan);
router.get("/me", authMiddleware, getMySubscription);

export default router;
