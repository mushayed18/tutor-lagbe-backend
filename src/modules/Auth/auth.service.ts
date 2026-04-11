// src/controllers/Auth/auth.service.ts
import { prisma } from '../../lib/prisma';
import { sendOtpEmail } from '../../utils/sendEmail';
import bcrypt from 'bcryptjs';
import { RegisterInput } from './auth.validation';

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const AuthService = {
  async register(payload: RegisterInput) {
    const { name, email, password, phone, role } = payload;

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.isVerified) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save/Update OTP
    const existingOtp = await prisma.otp.findFirst({ where: { email } });
    if (existingOtp) {
      await prisma.otp.update({
        where: { id: existingOtp.id },
        data: { otp, expiresAt },
      });
    } else {
      await prisma.otp.create({
        data: { email, otp, expiresAt },
      });
    }

    // Send OTP email
    await sendOtpEmail(email, otp);

    return {
      message: 'Please check your email for the OTP.',
      email,
    };
  },
};