const express = require('express');
const router = express.Router();
const { sendEmailOTP, verifyEmailOTP, resetPasswordAfterOTP } = require('../controllers/authController');

router.post('/send-otp', sendEmailOTP);
router.post('/verify-otp', verifyEmailOTP);
router.post('/reset-password', resetPasswordAfterOTP);

module.exports = router;