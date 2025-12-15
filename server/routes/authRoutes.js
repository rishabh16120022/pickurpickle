import express from 'express';
import { 
    sendEmailOTP, 
    verifyEmailOTP, 
    resetPasswordAfterOTP, 
    loginUser, 
    initiateSignup, 
    completeSignup 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);

// New 2-step signup flow
router.post('/signup/initiate', initiateSignup); // Step 1: Send OTP
router.post('/signup/complete', completeSignup); // Step 2: Verify & Create

// General/Forgot Password OTP routes
router.post('/send-otp', sendEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.post('/reset-password', resetPasswordAfterOTP);

export default router;