import { verifyPasswordECC } from '../../lib/cryptography';
import { getUsersCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  // Only allow POST requests for login
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    const users = await getUsersCollection();

    // Find user by email
    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Verify password using ECC
    let isPasswordValid = false;

    if (user.password.algorithm === 'ECC-secp256k1') {
      // New ECC password system
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login time
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Return success response without sensitive data
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
      lastLoginAt: new Date(),
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

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