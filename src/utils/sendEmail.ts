import nodemailer from "nodemailer";
import config from "../config";
import { promises as dns } from "dns";

// ✅ Resolve Gmail IP ourselves using IPv4 only
async function getGmailIPv4(): Promise<string> {
  const addresses = await dns.resolve4("smtp.gmail.com");
  return addresses[0]; // returns first IPv4 address
}

export const sendOtpEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  // ✅ Resolve to IPv4 first, then connect directly to that IP
  const gmailIP = await getGmailIPv4();
  console.log("Resolved Gmail IPv4:", gmailIP);

  const transporter = nodemailer.createTransport({
    host: gmailIP, // ✅ Use IP directly, bypasses IPv6 DNS resolution
    port: 587,
    secure: false,
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
    tls: {
      rejectUnauthorized: false,
      servername: "smtp.gmail.com", // ✅ Required for TLS when using IP directly
    },
  } as nodemailer.TransportOptions);

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
