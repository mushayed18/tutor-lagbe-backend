import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  const mailOptions = {
    from: `"TutorLagbe" <${config.email_user}>`,
    to: email,
    subject: "Your TutorLagbe Verification Code",
    html: `
      <h2>Welcome to TutorLagbe!</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4F46E5; font-size: 42px; letter-spacing: 8px;">${otp}</h1>
      <p><strong>This code will expire in 10 minutes.</strong></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`, result.messageId);
  } catch (error) {
    console.error("❌ Full email error:", error);
    throw new Error("Failed to send OTP email");
  }
};
