const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: { expires: 600 } // Documents expire after 600 seconds (10 minutes)
  },
  attempts: { 
    type: Number, 
    default: 0 
  }
});

// Method to verify OTP
otpSchema.methods.verifyOtp = async function(candidateOtp) {
  return await bcrypt.compare(candidateOtp, this.otp);
};

module.exports = mongoose.model('OTP', otpSchema);