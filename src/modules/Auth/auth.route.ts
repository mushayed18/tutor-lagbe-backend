// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, verifyEmail } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post("/verify-email", verifyEmail);

export default router;