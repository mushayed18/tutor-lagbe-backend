import { BrevoClient } from "@getbrevo/brevo";
import config from "../config";

// Initialize the modern Brevo Client using the key from your config file
const brevo = new BrevoClient({
  apiKey: config.brevo_api_key || "",
});

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  if (!config.brevo_api_key) {
    console.error(
      "⚠️ Setup Error: BREVO_API_KEY is missing from configurations!",
    );
    throw new Error("Email service misconfigured");
  }

  try {
    // Fire the email over a reliable, unblockable HTTPS API request structure
    await brevo.transactionalEmails.sendTransacEmail({
      subject: "Your TutorLagbe Verification Code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to TutorLagbe!</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4F46E5; font-size: 42px; letter-spacing: 8px; margin: 20px 0;">${otp}</h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
      sender: {
        name: "TutorLagbe",
        email: config.email_user || "", // 🌟 Make sure this matches your exact Brevo signup email!
      },
      to: [
        {
          email: email,
        },
      ],
    });

    console.log(
      `✅ OTP email successfully delivered via Brevo API to ${email}`,
    );
  } catch (error) {
    console.error("❌ Full Brevo API Connection Error:", error);
    throw new Error("Failed to send OTP email via Brevo API");
  }
};
