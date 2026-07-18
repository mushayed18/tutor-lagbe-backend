import Stripe from "stripe";
import config from "../config";

if (!config.stripe_secret_key) {
  // Don't throw at import time — lets the rest of the app boot even if
  // Stripe env vars aren't set yet, but subscription routes will fail loudly.
  console.warn("⚠️  STRIPE_SECRET_KEY is not set. Subscription payments will fail.");
}

export const stripe = new Stripe(config.stripe_secret_key as string);