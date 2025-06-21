import { verifyPasswordECC } from '../../lib/cryptography';
import { getUsersCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  // Only allow POST requests for login
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, identifier, password } = req.body;

  // Support multiple input formats:
  // - { email, password }
  // - { username, password }
  // - { identifier, password } where identifier can be email or username
  const loginIdentifier = identifier || email || username;

  // Validation
  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  // Determine if the identifier is an email or username
  const isEmail = loginIdentifier.includes('@');
  
  // Email validation if it's an email
  if (isEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginIdentifier)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
  }

  try {
    const users = await getUsersCollection();

    // Find user by email or username
    let user;
    if (isEmail) {
      // Search by email
      user = await users.findOne({ email: loginIdentifier.toLowerCase() });
    } else {
      // Search by username (case-insensitive)
      user = await users.findOne({ username: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Check if account is locked (enhanced security from new structure)
    if (user.security?.accountLocked) {
      return res.status(401).json({ 
        error: 'Account is temporarily locked due to multiple failed login attempts. Please contact support.' 
      });
    }

    // Verify password using ECC
    let isPasswordValid = false;

    // Support both old and new password structure
    const passwordAlgorithm = user.password.algorithm || user.security?.passwordAlgorithm;
    
    if (passwordAlgorithm === 'ECC-secp256k1') {
      // ECC password system
      isPasswordValid = verifyPasswordECC(
        password,
        user.password.hash,
        user.password.salt,
        user.password.publicKey
      );
    } else {
      // Legacy password system (if you had bcrypt before)
      return res.status(500).json({ 
        error: 'Unsupported password format',
        details: 'Please contact support to update your account.'
      });
    }

    if (!isPasswordValid) {
      // Increment login attempts for enhanced security
      const currentAttempts = (user.security?.loginAttempts || 0) + 1;
      const shouldLockAccount = currentAttempts >= 5; // Lock after 5 failed attempts

      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            'security.loginAttempts': currentAttempts,
            'security.accountLocked': shouldLockAccount,
            updatedAt: new Date()
          }
        }
      );

      if (shouldLockAccount) {
        return res.status(401).json({ 
          error: 'Account locked due to multiple failed login attempts. Please contact support.' 
        });
      }

      return res.status(401).json({ 
        error: 'Invalid email/username or password',
        attemptsRemaining: 5 - currentAttempts
      });
    }

    // Reset login attempts on successful login and update login time
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

    // Return success response without sensitive data
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
        passwordAlgorithm: passwordAlgorithm,
        accountLocked: false,
        loginAttempts: 0
      }
    };

    // Log successful login with profile completeness status
    console.log('✅ User logged in successfully:', {
      userId: user._id,
      username: user.username,
      email: user.email,
      loginMethod: isEmail ? 'email' : 'username',
      hasICData: !!(user.profile?.identity?.icNumber),
      profileComplete: user.profileComplete || false,
      kycStatus: user.profile?.kyc?.verificationStatus || 'not_submitted'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('ECC verification failed')) {
      return res.status(500).json({ 
        error: 'Authentication system error',
        details: 'Unable to verify your credentials. Please try again.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Login failed'
    });
  }
} 