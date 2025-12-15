import express from 'express';
import { sendEmailOTP, verifyEmailOTP, resetPasswordAfterOTP, loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/send-otp', sendEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.post('/reset-password', resetPasswordAfterOTP);

export default router;