export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ✅ keep this
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none" // ✅ MUST be "none" for cross-domain on Render
      : "lax", // ✅ lax is fine for localhost
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
} as const;
