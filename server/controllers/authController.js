import OTP from '../models/Otp.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcrypt';

// Generate 6-digit numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send Email OTP
export const sendEmailOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose: 'signup' or 'forgot-password'
    
    // Basic validation
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Logic based on purpose
    const userExists = await User.findOne({ email });
    if (purpose === 'signup' && userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (purpose === 'forgot-password' && !userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Rate Limiting: Check if OTP was sent recently (e.g., last 1 minute)
    
    const otp = generateOTP();
    
    // --- DEBUG LOG FOR DEVELOPMENT ---
    console.log(`[DEBUG] OTP for ${email} (${purpose}): ${otp}`);
    // ---------------------------------

    const hashedOtp = await bcrypt.hash(otp, 10);

    // Delete existing OTPs for this email to ensure only one valid OTP exists
    await OTP.deleteMany({ email });

    // Save to DB
    await OTP.create({
      email,
      otp: hashedOtp
    });

    // Send Email
    const subject = `${purpose === 'signup' ? 'Welcome' : 'Reset Password'} - OTP Verification`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${otp}</h2>
        <p>is your One Time Password (OTP) for Pick Your Pickle.</p>
        <p>This OTP is valid for 10 minutes. Do not share this with anyone.</p>
      </div>
    `;

    // We attempt to send email, but don't fail the request if SMTP is bad (common in dev)
    const emailSent = await sendEmail(email, subject, html);
    
    if (!emailSent) {
        return res.status(200).json({ message: "OTP generated. Check server logs (SMTP not configured)." });
    }

    res.status(200).json({ message: "OTP sent successfully to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sending OTP" });
  }
};

// 2. Verify Email OTP
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const otpDoc = await OTP.findOne({ email });

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Check Max Attempts
    if (otpDoc.attempts >= 5) {
      await OTP.deleteOne({ _id: otpDoc._id }); // Security measure
      return res.status(400).json({ message: "Too many failed attempts. Request a new OTP." });
    }

    // Verify Hash
    const isValid = await bcrypt.compare(otp, otpDoc.otp);

    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Valid OTP
    res.status(200).json({ message: "OTP Verified Successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error verifying OTP" });
  }
};

// 3. Reset Password After OTP
export const resetPasswordAfterOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields required" });

    // Re-verify OTP to ensure security (Atomic operation)
    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc) return res.status(400).json({ message: "OTP expired. Please verify again." });

    const isValid = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    // OTP is valid, proceed to reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findOneAndUpdate(
      { email }, 
      { password: hashedPassword }
    );

    // Cleanup OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(200).json({ message: "Password reset successfully. Please login." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error resetting password" });
  }
};