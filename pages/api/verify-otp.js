import otpStore from '../../lib/otpStore.js';
import { getUsersCollection } from '../../lib/mongodb';

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

    // OTP is valid - now check if user exists in MongoDB
    try {
      const users = await getUsersCollection();
      
      // Find user by email
      const user = await users.findOne({ email: gmail.toLowerCase() });

      if (!user) {
        // Remove OTP since it's been used
        otpStore.removeOTP(gmail);
        
        return res.status(404).json({ 
          success: false, 
          message: 'No account found with this email address. Please sign up first.' 
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        // Remove OTP since it's been used
        otpStore.removeOTP(gmail);
        
        return res.status(401).json({ 
          success: false, 
          message: 'Account is deactivated. Please contact support.' 
        });
      }

      // Check if account is locked
      if (user.security?.accountLocked) {
        // Remove OTP since it's been used
        otpStore.removeOTP(gmail);
        
        return res.status(401).json({ 
          success: false, 
          message: 'Account is temporarily locked. Please contact support.' 
        });
      }

      // Update user's last login time and reset login attempts
      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date(),
            'security.loginAttempts': 0,
            'security.accountLocked': false
          }
        }
      );

      // OTP is valid and user exists - remove it from store (one-time use)
      otpStore.removeOTP(gmail);

      // Return user data similar to login API
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: {
          identity: user.profile?.identity || {
            icNumber: user.profile?.icNumber || null,
            fullName: user.profile?.fullName || null,
            gender: user.profile?.gender || null,
            citizenship: user.profile?.citizenship || null,
            country: user.profile?.country || null
          },
          address: user.profile?.address || {
            street: user.profile?.address || null,
            postCode: user.profile?.postCode || null,
            city: user.profile?.city || null,
            state: user.profile?.state || null,
            country: user.profile?.country || null
          },
          kyc: user.profile?.kyc || {
            documentUploaded: false,
            documentProcessed: false,
            verificationStatus: 'not_submitted',
            submittedAt: null
          }
        },
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        profileComplete: user.profileComplete || false,
        security: {
          passwordAlgorithm: user.security?.passwordAlgorithm || user.password?.algorithm,
          accountLocked: false,
          loginAttempts: 0
        }
      };

      // Log successful OTP login
      console.log('✅ User logged in via OTP successfully:', {
        userId: user._id,
        username: user.username,
        email: user.email,
        loginMethod: 'otp',
        profileComplete: user.profileComplete || false,
        hasICData: !!(user.profile?.identity?.icNumber),
        kycStatus: user.profile?.kyc?.verificationStatus || 'not_submitted'
      });

      // Success response
      console.log(`OTP verified successfully for ${gmail}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully',
        user: userResponse
      });

    } catch (dbError) {
      console.error('Database error during OTP verification:', dbError);
      
      // Remove OTP since we had an error
      otpStore.removeOTP(gmail);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Database error. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
} 