import OTP from '../models/Otp.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pick_your_pickle_secret_key_change_this';
const SPECIFIC_ADMIN_EMAIL = "rishutripathi161@gmail.com";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

// --- AUTHENTICATION ---

// 1. Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // STRICT ADMIN CHECK
    // If the user in DB has role 'admin', but the email doesn't match the hardcoded admin email,
    // deny access or treat as unauthorized.
    if (user.role === 'admin' && user.email !== SPECIFIC_ADMIN_EMAIL) {
        // Downgrade or block
        return res.status(403).json({ message: "Unauthorized: Invalid Admin Credentials" });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// 2. Initiate Signup (Step 1: Send OTP)
export const initiateSignup = async (req, res) => {
  try {
      const { name, email } = req.body;
      if (!name || !email) return res.status(400).json({ message: "Name and Email required" });

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists. Please login." });
      }

      // Send OTP
      await sendOtpLogic(email, 'signup');
      res.status(200).json({ message: "Verification code sent to email." });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error initiating signup" });
  }
};

// 3. Complete Signup (Step 2: Verify OTP & Create Password)
export const completeSignup = async (req, res) => {
    try {
        const { name, email, otp, password } = req.body;

        if (!name || !email || !otp || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Verify OTP
        const otpDoc = await OTP.findOne({ email });
        if (!otpDoc) return res.status(400).json({ message: "OTP expired or invalid" });

        const isValidOtp = await bcrypt.compare(otp, otpDoc.otp);
        if (!isValidOtp) return res.status(400).json({ message: "Invalid OTP" });

        // Double check user existence
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User (ALWAYS Customer, unless seeded manually)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'customer' // Enforce customer role for public signups
        });

        // Cleanup OTP
        await OTP.deleteOne({ _id: otpDoc._id });

        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser._id, newUser.role)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error completing signup" });
    }
};

// --- OTP HELPERS ---

// Helper function to handle OTP generation and sending
const sendOtpLogic = async (email, purpose) => {
    const otp = generateOTP();
    console.log(`[DEBUG] OTP for ${email} (${purpose}): ${otp}`);

    const hashedOtp = await bcrypt.hash(otp, 10);
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: hashedOtp });

    const subject = `${purpose === 'signup' ? 'Verify Account' : 'Reset Password'} - OTP`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${otp}</h2>
        <p>is your verification code for Pick Your Pickle.</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    return await sendEmail(email, subject, html);
};

export const sendEmailOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check user existence based on purpose
    const userExists = await User.findOne({ email });
    
    if (purpose === 'forgot-password' && !userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    // Note: For 'signup' we usually use initiateSignup, but this route is kept for generic use or forgot password

    await sendOtpLogic(email, purpose || 'general');
    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error sending OTP" });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpDoc = await OTP.findOne({ email });

    if (!otpDoc) return res.status(400).json({ message: "OTP expired or invalid" });

    const isValid = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    res.status(200).json({ message: "OTP Verified Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error verifying OTP" });
  }
};

export const resetPasswordAfterOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Validate OTP again for security
    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc) return res.status(400).json({ message: "OTP expired" });
    const isValid = await bcrypt.compare(otp, otpDoc.otp);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};