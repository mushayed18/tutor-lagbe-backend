export const cookieOptions = {
  httpOnly: true,
  // Automatically resolves to true on Render servers since NODE_ENV defaults to production
  secure: process.env.NODE_ENV === "production" || true,

  // 🌟 CRITICAL: Allows cross-site cookie transfers across distinct server hosting clouds
  sameSite: "none" as const,

  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
