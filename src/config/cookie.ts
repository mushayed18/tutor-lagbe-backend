// export const cookieOptions = {
//   httpOnly: true,
//   // Automatically resolves to true on Render servers since NODE_ENV defaults to production
//   secure: process.env.NODE_ENV === "production" || true,

//   // 🌟 CRITICAL: Allows cross-site cookie transfers across distinct server hosting clouds
//   sameSite: "none" as const,

//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
// };


export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // ✅ Correct for same-domain apps with redirects
  path: "/",                 // ✅ Add this so cookie is sent on ALL routes
  maxAge: 7 * 24 * 60 * 60, // ✅ Seconds, not ms
};