// Shared OTP store for the application
// In production, replace this with Redis or database storage
class OTPStore {
  constructor() {
    this.store = new Map();
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP with timestamp
  setOTP(email, otp) {
    this.store.set(email, {
      otp: otp,
      timestamp: Date.now()
    });
  }

  // Get OTP data for email
  getOTP(email) {
    return this.store.get(email);
  }

  // Remove OTP for email
  removeOTP(email) {
    return this.store.delete(email);
  }

  // Check if OTP exists and is not expired
  isValidOTP(email, otp) {
    const otpData = this.getOTP(email);
    
    if (!otpData) {
      return { valid: false, reason: 'OTP not found' };
    }

    // Check if expired (10 minutes)
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    if (now - otpData.timestamp > tenMinutes) {
      this.removeOTP(email); // Clean up expired OTP
      return { valid: false, reason: 'OTP expired' };
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      return { valid: false, reason: 'Invalid OTP' };
    }

    return { valid: true };
  }

  // Clean up expired OTPs
  cleanupExpired() {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    for (const [email, data] of this.store.entries()) {
      if (now - data.timestamp > tenMinutes) {
        this.store.delete(email);
      }
    }
  }

  // Get store size (for monitoring)
  getSize() {
    return this.store.size;
  }

  // Get all stored emails (for debugging - remove in production)
  getAllEmails() {
    return Array.from(this.store.keys());
  }
}

// Create singleton instance
const otpStore = new OTPStore();

export default otpStore; 