// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, logout, register, verifyEmail, forgotPassword, resetPassword, changePassword } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/change-password", authMiddleware, changePassword);

export default router;