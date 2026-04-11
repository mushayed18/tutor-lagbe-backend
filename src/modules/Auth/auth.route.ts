// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, register, verifyEmail } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

export default router;