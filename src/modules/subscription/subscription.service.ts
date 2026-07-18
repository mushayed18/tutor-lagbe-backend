import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { AuthUser } from "../../types/common";

type SubRole = "TUTOR" | "PARENT";

const PLAN_LABELS: Record<SubRole, string> = {
  TUTOR: "TutorLagbe Tutor Premium — 1 Month",
  PARENT: "TutorLagbe Parent Premium — 1 Month",
};

const getPriceForRole = (role: SubRole) =>
  role === "TUTOR"
    ? config.subscription_price_tutor
    : config.subscription_price_parent;

const getPlanForRole = (role: SubRole) => ({
  role,
  amount: getPriceForRole(role),
  currency: config.stripe_currency.toUpperCase(),
  durationDays: 30,
});

const createCheckoutSession = async (requester: AuthUser) => {
  if (requester.role !== "TUTOR" && requester.role !== "PARENT") {
    throw new Error("Only tutors and parents can purchase a subscription");
  }

  const role = requester.role as SubRole;

  const user = await prisma.user.findUnique({ where: { id: requester.id } });
  if (!user) throw new Error("User not found");

  const amount = getPriceForRole(role);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: config.stripe_currency,
          unit_amount: amount,
          product_data: {
            name: PLAN_LABELS[role],
            description: "Unlocks 1 month of premium TutorLagbe benefits",
          },
        },
        quantity: 1,
      },
    ],
    // metadata is how we identify the user + role when the webhook fires later
    metadata: {
      userId: user.id,
      subscriptionRole: role,
    },
    success_url: `${config.frontend_url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription/cancel`,
  });

  return { url: session.url, sessionId: session.id };
};

const fulfillCheckout = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const subscriptionRole = session.metadata?.subscriptionRole as
    | SubRole
    | undefined;

  if (!userId || !subscriptionRole) return;
  if (session.payment_status !== "paid") return;

  // Idempotency: Stripe can send the same webhook event more than once.
  const existing = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existing) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  // If they still have active premium time left, extend from there instead of from "now"
  const base =
    user.subscriptionExpiresAt && user.subscriptionExpiresAt > now
      ? user.subscriptionExpiresAt
      : now;

  const newExpiry = new Date(base);
  newExpiry.setMonth(newExpiry.getMonth() + 1);

  const amount = session.amount_total ?? getPriceForRole(subscriptionRole);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: "PREMIUM",
        subscriptionRole,
        subscriptionExpiresAt: newExpiry,
      },
    }),
    prisma.payment.create({
      data: {
        userId,
        type:
          subscriptionRole === "TUTOR"
            ? "TUTOR_SUBSCRIPTION"
            : "PARENT_SUBSCRIPTION",
        amount,
        currency: (session.currency || config.stripe_currency).toUpperCase(),
        status: "SUCCESS",
        stripeCheckoutSessionId: session.id,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id,
        periodEnd: newExpiry,
      },
    }),
  ]);
};

const recordFailedPayment = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  const subscriptionRole = session.metadata?.subscriptionRole as
    | SubRole
    | undefined;
  if (!userId || !subscriptionRole) return;

  const existing = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existing) return;

  await prisma.payment.create({
    data: {
      userId,
      type:
        subscriptionRole === "TUTOR"
          ? "TUTOR_SUBSCRIPTION"
          : "PARENT_SUBSCRIPTION",
      amount: session.amount_total ?? 0,
      currency: (session.currency || config.stripe_currency).toUpperCase(),
      status: "FAILED",
      stripeCheckoutSessionId: session.id,
    },
  });
};

const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed":
      await fulfillCheckout(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.async_payment_failed":
      await recordFailedPayment(event.data.object as Stripe.Checkout.Session);
      break;
    default:
      break; // ignore other event types
  }
};

const getMySubscription = async (requester: AuthUser) => {
  const user = await prisma.user.findUnique({
    where: { id: requester.id },
    select: {
      subscriptionType: true,
      subscriptionRole: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  const isActive =
    user.subscriptionType === "PREMIUM" &&
    !!user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt > new Date();

  return { ...user, isActive };
};

export const SubscriptionService = {
  createCheckoutSession,
  handleWebhookEvent,
  getMySubscription,
  getPlanForRole,
};
