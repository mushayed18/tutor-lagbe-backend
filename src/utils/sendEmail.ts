import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend_api_key);

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  try {
    await resend.emails.send({
      from: "TutorLagbe <onboarding@resend.dev>",
      to: email,
      subject: "Your TutorLagbe Verification Code",
      html: `
        <h2>Welcome to TutorLagbe!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #4F46E5; font-size: 42px; letter-spacing: 8px;">${otp}</h1>
        <p><strong>This code will expire in 10 minutes.</strong></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ Full email error:", error);
    throw new Error("Failed to send OTP email");
  }
};
