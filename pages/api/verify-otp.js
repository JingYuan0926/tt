import otpStore from '../../lib/otpStore.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { gmail, otp } = req.body;

    // Validate input
    if (!gmail || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gmail address and OTP are required' 
      });
    }

    // Validate Gmail format
    if (!gmail.endsWith('@gmail.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid Gmail address' 
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP must be 6 digits' 
      });
    }

    // Clean up expired OTPs
    otpStore.cleanupExpired();

    // Verify OTP using the store utility
    const validation = otpStore.isValidOTP(gmail, otp);
    
    if (!validation.valid) {
      let message;
      switch (validation.reason) {
        case 'OTP not found':
          message = 'OTP not found or expired. Please request a new OTP.';
          break;
        case 'OTP expired':
          message = 'OTP has expired. Please request a new OTP.';
          break;
        case 'Invalid OTP':
          message = 'Invalid OTP. Please check your code and try again.';
          break;
        default:
          message = 'OTP verification failed. Please try again.';
      }
      
      return res.status(400).json({ 
        success: false, 
        message: message 
      });
    }

    // OTP is valid - remove it from store (one-time use)
    otpStore.removeOTP(gmail);

    // Success response
    console.log(`OTP verified successfully for ${gmail}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        email: gmail,
        verified: true,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
} 