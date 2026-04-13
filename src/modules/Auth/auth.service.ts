import { prisma } from "../../lib/prisma";
import { sendOtpEmail } from "../../utils/sendEmail";
import bcrypt from "bcryptjs";
import { ChangePasswordInput, RegisterInput } from "./auth.validation";
import {
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.validation";
import { generateToken } from "../../utils/jwt";
import { LoginInput } from "./auth.validation";

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (payload: RegisterInput) => {
  const { name, email, password, phone, role } = payload;

  // 1. Check if verified user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.isVerified) {
    throw new Error("Email already registered");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Generate OTP
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 4. Upsert OTP (IMPORTANT FIX)
  await prisma.otp.upsert({
    where: { email }, // make email UNIQUE in schema
    update: {
      otp,
      expiresAt,
      name,
      phone,
      role,
      hashedPassword,
      type: "REGISTER",
    },
    create: {
      email,
      otp,
      expiresAt,
      name,
      phone,
      role,
      hashedPassword,
      type: "REGISTER",
    },
  });

  // 5. Send Email
  await sendOtpEmail(email, otp);

  return {
    message: "Please check your email for OTP",
    email,
  };
};

const verifyEmail = async (payload: VerifyEmailInput) => {
  const { email, otp } = payload;

  // 1. Find OTP record
  const otpRecord = await prisma.otp.findUnique({
    where: { email },
  });

  if (!otpRecord) {
    throw new Error("No OTP request found");
  }

  // 2. Check OTP
  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // 3. Check expiration
  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name: otpRecord.name!,
      email: otpRecord.email,
      password: otpRecord.hashedPassword!,
      phone: otpRecord.phone!,
      role: otpRecord.role!,
      isVerified: true,
    },
  });

  // 5. Delete OTP record
  await prisma.otp.delete({
    where: { email },
  });

  // 6. Generate JWT
  const token = generateToken(user);

  return { token, user };
};

const login = async (payload: LoginInput) => {
  const { email, password } = payload;

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Check verified
  if (!user.isVerified) {
    throw new Error("Please verify your email first");
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // 4. Generate token
  const token = generateToken(user);

  return { token, user };
};

const forgotPassword = async (payload: ForgotPasswordInput) => {
  const { email } = payload;

  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ⚠️ Security: Don't reveal user existence
  if (!user) {
    return {
      message: "If this email exists, an OTP has been sent",
    };
  }

  // 2. Generate OTP
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 3. Store OTP (type = RESET_PASSWORD)
  await prisma.otp.upsert({
    where: { email },
    update: {
      otp,
      expiresAt,
      type: "RESET_PASSWORD",
    },
    create: {
      email,
      otp,
      expiresAt,
      type: "RESET_PASSWORD",
    },
  });

  // 4. Send email
  await sendOtpEmail(email, otp);

  return {
    message: "If this email exists, an OTP has been sent",
  };
};

const resetPassword = async (payload: ResetPasswordInput) => {
  const { email, otp, newPassword } = payload;

  // 1. Find OTP record
  const otpRecord = await prisma.otp.findUnique({
    where: { email },
  });

  if (!otpRecord) {
    throw new Error("Invalid request");
  }

  // 2. Check type (VERY IMPORTANT)
  if (otpRecord.type !== "RESET_PASSWORD") {
    throw new Error("Invalid OTP type");
  }

  // 3. Match OTP
  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // 4. Check expiry
  if (otpRecord.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  // 5. Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 6. Update user password
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  // 7. Delete OTP
  await prisma.otp.delete({
    where: { email },
  });

  return {
    message: "Password reset successful",
  };
};

const changePassword = async (userId: string, payload: ChangePasswordInput) => {
  const { currentPassword, newPassword } = payload;

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Compare current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  // 3. Prevent same password reuse (🔥 good practice)
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    throw new Error("New password must be different from current password");
  }

  // 4. Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 5. Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

export const AuthService = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
