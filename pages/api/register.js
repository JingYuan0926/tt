import { hashPasswordECC } from '../../lib/cryptography';
import { getUsersCollection } from '../../lib/mongodb';

export default async function handler(req, res) {
  // Test connection with GET request
  if (req.method === 'GET') {
    try {
      const users = await getUsersCollection();
      const userCount = await users.countDocuments();
      return res.status(200).json({ 
        success: true, 
        message: 'MongoDB connection successful!',
        totalUsers: userCount
      });
    } catch (error) {
      return res.status(500).json({ 
        error: 'Connection test failed', 
        details: error.message 
      });
    }
  }

  // Handle user registration
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    username, 
    email, 
    password,
    // Personal details from the signup form (extracted from IC)
    icNumber,
    fullName,
    address,
    postCode,
    city,
    state,
    country,
    citizenship,
    gender,
    // Additional IC document metadata
    kycFileName,
    kycFileSize,
    kycFileType,
    icDocumentProcessed
  } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Username validation
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  // IC Number validation (Malaysian format: 123456-78-9012)
  if (icNumber) {
    const icRegex = /^\d{6}-\d{2}-\d{4}$/;
    if (!icRegex.test(icNumber)) {
      return res.status(400).json({ 
        error: 'Invalid IC number format. Expected format: 123456-78-9012' 
      });
    }
  }

  // Postal code validation for Malaysia (5 digits)
  if (postCode) {
    const postCodeRegex = /^\d{5}$/;
    if (!postCodeRegex.test(postCode)) {
      return res.status(400).json({ 
        error: 'Invalid postal code format. Expected 5 digits.' 
      });
    }
  }

  try {
    const users = await getUsersCollection();

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [
        { username }, 
        { email: email.toLowerCase() },
        // Also check for duplicate IC number if provided
        ...(icNumber ? [{ 'profile.identity.icNumber': icNumber }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
      }
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'Email already registered. Please use a different email address.' });
      }
      if (existingUser.profile?.identity?.icNumber === icNumber) {
        return res.status(400).json({ error: 'IC number already registered. Please contact support if this is an error.' });
      }
    }

    // Hash password using Elliptic Curve Cryptography
    const passwordData = hashPasswordECC(password);

    // Create comprehensive user document with IC data
    const newUser = {
      username,
      email: email.toLowerCase(),
      password: {
        hash: passwordData.hash,
        salt: passwordData.salt,
        publicKey: passwordData.publicKey,
        algorithm: passwordData.algorithm
      },
      profile: {
        // Identity information from IC document
        identity: {
          icNumber: icNumber || null,
          fullName: fullName || null,
          gender: gender || null,
          citizenship: citizenship || 'Malaysian',
          country: country || 'Malaysia'
        },
        // Address information from IC document
        address: {
          street: address || null,
          postCode: postCode || null,
          city: city || null,
          state: state || null,
          country: country || 'Malaysia'
        },
        // KYC document information
        kyc: {
          documentUploaded: !!kycFileName,
          fileName: kycFileName || null,
          fileSize: kycFileSize || null,
          fileType: kycFileType || null,
          documentProcessed: icDocumentProcessed || false,
          verificationStatus: icNumber ? 'pending' : 'not_submitted',
          submittedAt: kycFileName ? new Date() : null
        }
      },
      // Account metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: false,
      profileComplete: !!(icNumber && fullName && address && postCode && city && state),
      
      // Security and compliance
      security: {
        passwordAlgorithm: passwordData.algorithm,
        accountLocked: false,
        loginAttempts: 0,
        lastPasswordChange: new Date()
      }
    };

    // Insert user into database
    const result = await users.insertOne(newUser);

    // Return success response without sensitive data
    const userResponse = {
      _id: result.insertedId,
      username: newUser.username,
      email: newUser.email,
      profile: {
        identity: newUser.profile.identity,
        address: newUser.profile.address,
        kyc: {
          documentUploaded: newUser.profile.kyc.documentUploaded,
          documentProcessed: newUser.profile.kyc.documentProcessed,
          verificationStatus: newUser.profile.kyc.verificationStatus,
          submittedAt: newUser.profile.kyc.submittedAt
        }
      },
      createdAt: newUser.createdAt,
      isActive: newUser.isActive,
      emailVerified: newUser.emailVerified,
      profileComplete: newUser.profileComplete,
      passwordAlgorithm: newUser.security.passwordAlgorithm
    };

    // Log successful registration with IC data status
    console.log('✅ User registered successfully:', {
      userId: result.insertedId,
      username: newUser.username,
      email: newUser.email,
      hasICData: !!icNumber,
      kycUploaded: !!kycFileName,
      profileComplete: newUser.profileComplete
    });

    return res.status(201).json({ 
      success: true,
      message: `User registered successfully with ECC encryption!${icNumber ? ' IC document data has been processed and stored.' : ''}`,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error - check which field is duplicated
      const duplicateField = error.keyPattern;
      if (duplicateField.username) {
        return res.status(400).json({ 
          error: 'Username already exists',
          details: 'Please choose a different username'
        });
      } else if (duplicateField.email) {
        return res.status(400).json({ 
          error: 'Email already registered',
          details: 'Please use a different email address'
        });
      } else if (duplicateField['profile.identity.icNumber']) {
        return res.status(400).json({ 
          error: 'IC number already registered',
          details: 'This IC number is already associated with another account'
        });
      } else {
        return res.status(400).json({ 
          error: 'Duplicate information detected',
          details: 'Some information provided is already registered'
        });
      }
    }

    // Handle ECC specific errors
    if (error.message && error.message.includes('ECC hashing failed')) {
      return res.status(500).json({ 
        error: 'Password encryption failed',
        details: 'Unable to secure your password. Please try again.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
    });
  }
} 