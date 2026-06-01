import nodemailer from 'nodemailer';
import config from '../config';   

// Create transporter once (reusable)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email_user,      
    pass: config.email_pass,      
  },
});

/**
 * Send OTP to user's email
 * @param email - user's email
 * @param otp - 6 digit code
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  // ✅ TEMPORARY DEBUG LOGS
  console.log("EMAIL_USER:", config.email_user);
  console.log("EMAIL_PASS exists:", !!config.email_pass);
  console.log("EMAIL_PASS length:", config.email_pass?.length);
  
  const mailOptions = {
    from: `"TutorLagbe" <${config.email_user}>`,
    to: email,
    subject: 'Your TutorLagbe Verification Code',
    html: `
      <h2>Welcome to TutorLagbe!</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4F46E5; font-size: 42px; letter-spacing: 8px;">${otp}</h1>
      <p><strong>This code will expire in 10 minutes.</strong></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send OTP email');
  }
};