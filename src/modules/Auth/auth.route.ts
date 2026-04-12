// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, logout, register, verifyEmail, forgotPassword, resetPassword } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;