import nodemailer from "nodemailer";
import config from "../config";
import dns from "node:dns";

// Force Node's internal DNS lookup system to prefer IPv4 addresses (A records) over IPv6 (AAAA records)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
  tls: {
    rejectUnauthorized: false, // Bypasses self-signed certificate blocks on cloud firewalls
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
