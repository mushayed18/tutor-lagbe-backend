import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.JWT_EXPIRES_IN,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  brevo_api_key: process.env.BREVO_API_KEY,

  // Stripe
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  stripe_currency: process.env.STRIPE_CURRENCY || "bdt",

  // Prices are in the smallest currency unit (poisha for BDT: 100 = ৳1)
  subscription_price_tutor:
    Number(process.env.SUBSCRIPTION_PRICE_TUTOR) || 50000, // ৳500/mo
  subscription_price_parent:
    Number(process.env.SUBSCRIPTION_PRICE_PARENT) || 80000, // ৳800/mo

  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
};
