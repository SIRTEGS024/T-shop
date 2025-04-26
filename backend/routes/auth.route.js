import express from 'express'
import { login, logout, signup, refreshToken, getProfile, verifyEmail, forgotPassword, resetPassword, resendVericationToken } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/verify-email", verifyEmail);

router.post("/refresh-verification-token", protectRoute, resendVericationToken );

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/profile", protectRoute, getProfile);

export default router;