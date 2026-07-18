import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { SubscriptionService } from "./subscription.service";

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const result = await SubscriptionService.createCheckoutSession(requester);

    res.status(200).json({
      success: true,
      message: "Checkout session created",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// IMPORTANT: req.body here must be the raw Buffer, not parsed JSON.
// See app.ts — this route is mounted with express.raw() before express.json().
const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      config.stripe_webhook_secret as string,
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await SubscriptionService.handleWebhookEvent(event);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler failed:", error);
    // 500 so Stripe retries delivery instead of silently dropping it
    res.status(500).json({ received: false });
  }
};

const getMySubscription = async (req: Request, res: Response) => {
  try {
    const result = await SubscriptionService.getMySubscription(req.user);
    res
      .status(200)
      .json({ success: true, message: "Subscription fetched", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPlan = async (req: Request, res: Response) => {
  try {
    const result = SubscriptionService.getPlanForRole(
      req.user.role as "TUTOR" | "PARENT",
    );
    res
      .status(200)
      .json({ success: true, message: "Plan fetched", data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export { createCheckoutSession, handleWebhook, getMySubscription, getPlan };
