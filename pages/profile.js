import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorModal } from "@/components/ui/modal";
import userData from '../data/users.json';

// Import modular components
import LoginComponent from '@/components/auth/LoginComponent';
import SignupComponent from '@/components/auth/SignupComponent';
import KycFormComponent from '@/components/auth/KycFormComponent';

// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Validation schema for signup using Zod
const signupSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).max(20, {
    message: "Username must not exceed 20 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  confirmPassword: z.string(),
  // Personal details (optional, auto-filled from IC)
  icNumber: z.string().optional(),
  fullName: z.string().optional(),
  address: z.string().optional(),
  postCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  citizenship: z.string().optional(),
  gender: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  // Get the first user from the data
  const user = userData[0];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Signup form states
  const [currentStep, setCurrentStep] = useState(1);
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('Sign In Successful');

  // LocalStorage functions
  const saveUserToLocalStorage = (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
    }
  };

  const getUserFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      const isStoredLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      return {
        user: storedUser ? JSON.parse(storedUser) : null,
        isLoggedIn: isStoredLoggedIn
      };
    }
    return { user: null, isLoggedIn: false };
  };

  const clearUserFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
    }
  };

  // Load user from localStorage on component mount
  useEffect(() => {
    const { user: storedUser, isLoggedIn: storedIsLoggedIn } = getUserFromLocalStorage();
    if (storedIsLoggedIn && storedUser) {
      setIsLoggedIn(true);
      setCurrentUser(storedUser);
    }
  }, []);

  // Helper functions for modals
  const showErrorModal = (title, message, details = null) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details
    });
  };

  const showSuccessModal = (title = 'Success!') => {
    setSuccessModalTitle(title);
    setSuccessModal(true);
    setIsModalVisible(true);
  };

  const closeErrorModal = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeSuccessModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSuccessModal(false);
    }, 150);
  };

  // Initialize signup form
  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      icNumber: "",
      fullName: "",
      address: "",
      postCode: "",
      city: "",
      state: "",
      country: "Malaysia",
      citizenship: "Malaysian",
      gender: "",
    },
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    clearUserFromLocalStorage();
    // Reset all forms when logging out
    signupForm.reset();
    setAuthMode('signin');
    setCurrentStep(1);
  };

  // Handle login from LoginComponent
  const handleLogin = (authenticatedUser) => {
    saveUserToLocalStorage(authenticatedUser);
    setCurrentUser(authenticatedUser);
    setIsLoggedIn(true);
  };

  // Switch between signin and signup modes
  const switchToSignup = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('signup');
      setCurrentStep(1);
      signupForm.reset();
      setIsTransitioning(false);
    }, 150);
  };

  const switchToSignin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('signin');
      setCurrentStep(1);
      signupForm.reset();
      setIsTransitioning(false);
    }, 150);
  };

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle step navigation with smooth transitions for signup
  const nextStep = async () => {
    if (currentStep === 1) {
      const stepFields = ['username', 'email', 'password', 'confirmPassword'];
      const isValid = await signupForm.trigger(stepFields);
      if (isValid) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(2);
          setIsTransitioning(false);
        }, 150);
      }
    } else if (currentStep === 2) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 150);
  };

  // Save account data to MongoDB
  const saveAccountToJSON = async (accountData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register user');
      }
      
      console.log('✅ User registered successfully:', result.message);
      console.log('👤 New user:', result.user);
      
      return result.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  // Handle signup form submission
  const onSignupSubmit = async (values) => {
    if (currentStep < 3) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    
    try {
      const savedUser = await saveAccountToJSON(values);
      
      // Create authenticated user with signup data
      const authenticatedUser = {
        ...savedUser,
        loginMethod: 'signup',
        loginTime: new Date().toISOString()
      };

      // Automatically log the user in after successful signup
      saveUserToLocalStorage(authenticatedUser);
      setCurrentUser(authenticatedUser);
      setIsLoggedIn(true);
      
      showSuccessModal('Account Created Successfully! You are now logged in.');
      
      // Reset signup form and states
      setTimeout(() => {
        signupForm.reset();
        setCurrentStep(1);
        setAuthMode('signin'); // Reset to signin mode for next time
        closeSuccessModal();
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific error types from MongoDB register API
      if (error.message.includes('Username already exists') || error.message.includes('Email already registered') || error.message.includes('IC number already registered')) {
        showErrorModal(
          'Account Already Exists',
          error.message,
          [
            'Please use a different username if username is taken',
            'Use a different email address if email is already registered',
            'Contact support if you believe this is an error'
          ]
        );
      } else if (error.message.includes('Password must be at least 6 characters')) {
        showErrorModal(
          'Invalid Password',
          error.message,
          [
            'Password must be at least 6 characters long',
            'Choose a strong password for better security'
          ]
        );
      } else if (error.message.includes('Invalid IC number format') || error.message.includes('Invalid postal code format')) {
        showErrorModal(
          'Invalid Format',
          error.message,
          [
            'Please check your IC number format (123456-78-9012)',
            'Postal code should be 5 digits',
            'Verify all information is entered correctly'
          ]
        );
      } else if (error.message.includes('Password encryption failed') || error.message.includes('ECC')) {
        showErrorModal(
          'System Security Error',
          'Unable to secure your password. Please try again.',
          [
            'This is a temporary system issue',
            'Please try registering again',
            'Contact support if the problem persists'
          ]
        );
      } else {
        showErrorModal(
          'Account Creation Failed',
          error.message || 'An unexpected error occurred while creating your account.',
          [
            'Please check your internet connection',
            'Verify all required fields are filled correctly',
            'Try submitting the form again',
            'Contact support if the problem persists'
          ]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main component render - Login/Signup Forms
  if (!isLoggedIn) {
    return (
      <div className={`${inter.className} min-h-screen flex items-start justify-center bg-white p-4 pt-20`}>
        <Card 
          className={`w-full max-w-md mx-auto transform transition-all duration-700 ease-out ${
            isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Render different forms based on current auth mode and step */}
          {authMode === 'signin' && (
            <LoginComponent
              onLogin={handleLogin}
              onSwitchToSignup={switchToSignup}
              showErrorModal={showErrorModal}
              showSuccessModal={showSuccessModal}
              userData={user}
              isTransitioning={isTransitioning}
            />
          )}
          
          {authMode === 'signup' && currentStep === 1 && (
            <SignupComponent
              onSignup={nextStep}
              onSwitchToSignin={switchToSignin}
              signupForm={signupForm}
              currentStep={currentStep}
              isSubmitting={isSubmitting}
              isTransitioning={isTransitioning}
            />
          )}

          {authMode === 'signup' && (currentStep === 2 || currentStep === 3) && (
            <KycFormComponent
              signupForm={signupForm}
              currentStep={currentStep}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              onSubmit={onSignupSubmit}
              isSubmitting={isSubmitting}
              isTransitioning={isTransitioning}
              showErrorModal={showErrorModal}
              onSwitchToSignin={switchToSignin}
            />
          )}
        </Card>

        {/* Modal Components */}
        <ErrorModal
          isOpen={errorModal.isOpen}
          onClose={closeErrorModal}
          title={errorModal.title}
          message={errorModal.message}
          details={errorModal.details}
        />

        {/* Success Modal */}
        {successModal && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
              isModalVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeSuccessModal();
              }
            }}
          >
            <Card 
              className={`w-full max-w-md mx-auto transform transition-all duration-150 ${
                isModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">{successModalTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={closeSuccessModal}
                  className="w-full"
                >
                  OK
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Use currentUser data if available, otherwise fallback to default user
  const displayUser = currentUser || user;

  // Helper function to map MongoDB user data to display format
  const mapUserDataForDisplay = (userData) => {
    if (!userData) return null;
    
    // If it's already in the correct format (from JSON file), return as is
    if (userData.fullName && userData.icNumber) {
      return userData;
    }
    
    // Map MongoDB structure to display format
    return {
      // Basic user info
      username: userData.username || '',
      email: userData.email || '',
      
      // Personal info from profile.identity
      fullName: userData.profile?.identity?.fullName || userData.username || 'User',
      icNumber: userData.profile?.identity?.icNumber || 'Not provided',
      gender: userData.profile?.identity?.gender || 'Not specified',
      citizenship: userData.profile?.identity?.citizenship || userData.profile?.identity?.country || 'Not specified',
      
      // Address info from profile.address
      address: userData.profile?.address?.street || 'Not provided',
      city: userData.profile?.address?.city || 'Not provided',
      state: userData.profile?.address?.state || 'Not provided',
      postCode: userData.profile?.address?.postCode || 'Not provided',
      country: userData.profile?.address?.country || userData.profile?.identity?.country || 'Malaysia',
      
      // Account info
      registrationDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      status: userData.isActive ? 'active' : 'inactive',
      
      // Account details (for compatibility with JSON structure)
      accountNumber: userData._id?.toString().slice(-8).toUpperCase() || 'N/A',
      userId: userData._id?.toString() || 'N/A',
      
      // KYC info
      kycFileName: userData.profile?.kyc?.fileName || 'No document uploaded',
      kycFileType: userData.profile?.kyc?.fileType || 'N/A',
      kycFileSize: userData.profile?.kyc?.fileSize || 0,
      
      // Timestamps
      timestamp: userData.updatedAt || userData.createdAt || new Date().toISOString(),
    };
  };

  // Get properly mapped user data for display
  const mappedDisplayUser = mapUserDataForDisplay(displayUser);

  // Helper function to safely get user initials
  const getUserInitials = (user) => {
    if (!user || !user.fullName) return 'U';
    
    try {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    } catch (error) {
      console.warn('Error getting user initials:', error);
      return user.username ? user.username.substring(0, 2).toUpperCase() : 'U';
    }
  };

  return (
    <div className="min-h-screen bg-white pt-5">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8 relative">
        {/* Edit Profile and Logout Icons */}
        <div className="absolute top-8 right-4 md:right-8 flex gap-3 z-10">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full shadow-lg transition-colors duration-200"
            onClick={() => console.log('Edit profile clicked')}
            title="Edit Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-3 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full shadow-lg transition-colors duration-200"
            onClick={handleLogout}
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>
          </motion.button>
        </div>

        {/* Profile Header - matching NewsHeader style */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center border-b-4 border-gray-900 pb-6 mb-8 animate-in slide-in-from-bottom duration-700"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">PROFILE</h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
            <span>ACCOUNT</span>
            <span>•</span>
            <span>MEMBER SINCE {mappedDisplayUser.registrationDate}</span>
            {currentUser && (
              <>
                <span>•</span>
                <span>LOGIN: {currentUser.loginMethod?.toUpperCase()}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Picture and Basic Info */}
          <div className="bg-white mb-8">
            <div className="bg-white h-32"></div>
            <div className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-4xl font-bold text-gray-700">
                    {getUserInitials(mappedDisplayUser)}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{mappedDisplayUser.fullName}</h2>
                  <p className="text-gray-600 text-lg">@{mappedDisplayUser.username}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      mappedDisplayUser.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mappedDisplayUser.status.charAt(0).toUpperCase() + mappedDisplayUser.status.slice(1)}
                    </span>
                    {currentUser && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {currentUser.loginMethod === 'regular' ? 'Password Login' : 'OTP Login'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            {/* Personal Information */}
            <div className="bg-white p-8 border-b border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Personal Information</h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.fullName}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">IC Number</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.icNumber}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Citizenship</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.citizenship}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-8 border-b border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Contact Information</h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.email}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <p className="text-lg text-gray-900">@{mappedDisplayUser.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Registration Date</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.registrationDate}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Address Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white p-8 mb-8 border-b border-gray-400"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Address Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-lg text-gray-900 whitespace-pre-line">{mappedDisplayUser.address}</p>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.city}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.state}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Post Code</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.postCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                  <p className="text-lg text-gray-900">{mappedDisplayUser.country}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white p-8 border-b border-gray-400"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Account Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                <p className="text-lg text-gray-900 font-mono">{mappedDisplayUser.accountNumber}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <p className="text-lg text-gray-900 font-mono">{mappedDisplayUser.userId}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">KYC Document</label>
                <p className="text-lg text-gray-900">{mappedDisplayUser.kycFileName}</p>
                <p className="text-sm text-gray-600">
                  {mappedDisplayUser.kycFileType} • {(mappedDisplayUser.kycFileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-lg text-gray-900">{new Date(mappedDisplayUser.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
