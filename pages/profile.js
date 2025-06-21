import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ErrorModal } from "@/components/ui/modal";
import userData from '../data/users.json';

// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Validation schema for regular signin
const signinSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

// Validation schema for Gmail input (OTP flow step 1)
const gmailSchema = z.object({
  gmail: z.string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid Gmail address." })
    .refine((email) => email.endsWith('@gmail.com'), {
      message: "Please enter a valid Gmail address.",
    }),
});

// Validation schema for OTP verification (OTP flow step 2)
const otpSchema = z.object({
  otp: z.string()
    .min(6, { message: "OTP must be 6 digits." })
    .max(6, { message: "OTP must be 6 digits." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers." }),
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
  const router = useRouter();
  // Get the first user from the data
  const user = userData[0];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  // Signin form states (copied from signin.js)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // OTP flow states
  const [signinMode, setSigninMode] = useState('regular');
  const [userGmail, setUserGmail] = useState('');

  // Signup states (copied from signup.js)
  const [currentStep, setCurrentStep] = useState(1);
  const [kycFile, setKycFile] = useState(null);
  const [isProcessingIC, setIsProcessingIC] = useState(false);
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('Sign In Successful');
  const [checkDetailsModal, setCheckDetailsModal] = useState(false);
  const [isCheckDetailsModalVisible, setIsCheckDetailsModalVisible] = useState(false);

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

  const showSuccessModal = (title = 'Sign In Successful!') => {
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

  const closeCheckDetailsModal = () => {
    setIsCheckDetailsModalVisible(false);
    setTimeout(() => {
      setCheckDetailsModal(false);
    }, 150);
  };

  // Initialize forms with react-hook-form and Zod validation
  const regularForm = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const gmailForm = useForm({
    resolver: zodResolver(gmailSchema),
    defaultValues: {
      gmail: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Signup form initialization
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

  // Handle switching between signin and signup modes
  const handleSwitchToSignup = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('signup');
      setCurrentStep(1);
      regularForm.reset();
      gmailForm.reset();
      otpForm.reset();
      setSigninMode('regular');
      setUserGmail('');
      setIsTransitioning(false);
    }, 150);
  };

  const handleSwitchToSignin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode('signin');
      setCurrentStep(1);
      signupForm.reset();
      setKycFile(null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    clearUserFromLocalStorage();
    // Reset all forms when logging out
    regularForm.reset();
    gmailForm.reset();
    otpForm.reset();
    signupForm.reset();
    setSigninMode('regular');
    setAuthMode('signin');
    setCurrentStep(1);
    setUserGmail('');
    setKycFile(null);
  };

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle regular signin submission
  const onRegularSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Simulate authentication process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, use the first user from userData
      // In a real app, you'd validate credentials against a backend
      const authenticatedUser = {
        ...user,
        username: values.username,
        loginMethod: 'regular',
        loginTime: new Date().toISOString()
      };

      // Save to localStorage and update state
      saveUserToLocalStorage(authenticatedUser);
      setCurrentUser(authenticatedUser);
      setIsLoggedIn(true);
      
      showSuccessModal();
      regularForm.reset();
      
    } catch (error) {
      console.error('Sign in error:', error);
      
      showErrorModal(
        'Sign In Failed',
        error.message || 'Invalid username or password. Please try again.',
        [
          'Check your username and password',
          'Make sure Caps Lock is not enabled',
          'Contact support if you continue to have issues'
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle switching to OTP signin mode
  const handleOtpSigninClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSigninMode('otp-gmail');
      regularForm.reset();
      setIsTransitioning(false);
    }, 150);
  };

  // Handle back button clicks
  const handleBackToRegular = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSigninMode('regular');
      gmailForm.reset();
      otpForm.reset();
      setUserGmail('');
      setIsTransitioning(false);
    }, 150);
  };

  const handleBackToGmail = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSigninMode('otp-gmail');
      otpForm.reset();
      setIsTransitioning(false);
    }, 150);
  };

  // Handle Gmail submission (send OTP)
  const onGmailSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gmail: values.gmail
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send OTP');
      }
      
      setUserGmail(values.gmail);
      setIsTransitioning(true);
      setTimeout(() => {
        setSigninMode('otp-verify');
        setIsTransitioning(false);
      }, 150);
      
      showSuccessModal('OTP Sent Successfully!');
      
    } catch (error) {
      console.error('Send OTP error:', error);
      
      showErrorModal(
        'Failed to Send OTP',
        error.message || 'Unable to send OTP. Please try again.',
        [
          'Check your internet connection',
          'Verify your Gmail address is correct',
          'Make sure you have a valid Resend API key configured',
          'Try again in a few moments'
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gmail: userGmail,
          otp: values.otp
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'OTP verification failed');
      }
      
      console.log('OTP verification successful:', result.user);
      
      // Create authenticated user for OTP login
      const authenticatedUser = {
        ...user,
        email: userGmail,
        loginMethod: 'otp',
        loginTime: new Date().toISOString()
      };

      // Save to localStorage and update state
      saveUserToLocalStorage(authenticatedUser);
      setCurrentUser(authenticatedUser);
      setIsLoggedIn(true);
      
      showSuccessModal('Sign In Successful!');
      
      setIsTransitioning(true);
      setTimeout(() => {
        otpForm.reset();
        gmailForm.reset();
        setUserGmail('');
        setSigninMode('regular');
        setIsTransitioning(false);
      }, 150);
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      showErrorModal(
        'OTP Verification Failed',
        error.message || 'The OTP you entered is incorrect. Please try again.',
        [
          'Double-check the 6-digit code',
          'Make sure you\'re entering the latest OTP',
          'Request a new OTP if this one has expired',
          'Check your email for the most recent code'
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render regular signin form
  const renderRegularSignin = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...regularForm}>
            <form onSubmit={regularForm.handleSubmit(onRegularSubmit)} className="space-y-4">
              
              <FormField
                control={regularForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field}
                        disabled={isSubmitting || isTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={regularForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Enter your password" 
                        {...field}
                        disabled={isSubmitting || isTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleOtpSigninClick}
            disabled={isSubmitting || isTransitioning}
          >
            Sign in with OTP
          </Button>

          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </>
  );

  // Render Gmail input form (OTP flow step 1)
  const renderGmailInput = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in with OTP</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...gmailForm}>
            <form onSubmit={gmailForm.handleSubmit(onGmailSubmit)} className="space-y-4">
              
              <FormField
                control={gmailForm.control}
                name="gmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gmail Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter your Gmail address" 
                        {...field}
                        disabled={isSubmitting || isTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning}
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>

          <Button 
            type="button"
            variant="outline" 
            className="w-full mt-4"
            onClick={handleBackToRegular}
            disabled={isSubmitting || isTransitioning}
          >
            Back to Password Sign in
          </Button>
        </div>
      </CardContent>
    </>
  );

  // Render OTP verification form (OTP flow step 2)
  const renderOtpVerification = () => (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to {userGmail}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Enter here" 
                        maxLength={6}
                        {...field}
                        disabled={isSubmitting || isTransitioning}
                        className="text-center text-lg tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning}
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </Form>

          <Button 
            type="button"
            variant="outline" 
            className="w-full mt-4"
            onClick={() => onGmailSubmit({ gmail: userGmail })}
            disabled={isSubmitting || isTransitioning}
          >
            Resend OTP
          </Button>

          <Button 
            type="button"
            variant="ghost" 
            className="w-full mt-2"
            onClick={handleBackToGmail}
            disabled={isSubmitting || isTransitioning}
          >
            Change Gmail Address
          </Button>
        </div>
      </CardContent>
    </>
  );

  // Login Form Component (exact copy from signin.js)
  if (!isLoggedIn) {
    return (
      <div className={`${inter.className} min-h-screen flex items-start justify-center bg-white p-4 pt-20`}>
        <Card 
          className={`w-full max-w-md mx-auto transform transition-all duration-700 ease-out ${
            isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Render different forms based on current signin mode */}
          {signinMode === 'regular' && renderRegularSignin()}
          {signinMode === 'otp-gmail' && renderGmailInput()}
          {signinMode === 'otp-verify' && renderOtpVerification()}
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
          className="text-center border-b-4 border-gray-900 pb-6 mb-8 animate-in slide-in-from-top duration-700"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">PROFILE</h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
            <span>ACCOUNT</span>
            <span>•</span>
            <span>{displayUser.accountNumber}</span>
            <span>•</span>
            <span>MEMBER SINCE {displayUser.registrationDate}</span>
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
            <div className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-4xl font-bold text-gray-700">
                    {displayUser.fullName.split(' ').map(name => name[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{displayUser.fullName}</h2>
                  <p className="text-gray-600 text-lg">@{displayUser.username}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      displayUser.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {displayUser.status.charAt(0).toUpperCase() + displayUser.status.slice(1)}
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
                  <p className="text-lg text-gray-900">{displayUser.fullName}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">IC Number</label>
                  <p className="text-lg text-gray-900">{displayUser.icNumber}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <p className="text-lg text-gray-900">{displayUser.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Citizenship</label>
                  <p className="text-lg text-gray-900">{displayUser.citizenship}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-8 border-b border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Contact Information</h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{displayUser.email}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <p className="text-lg text-gray-900">@{displayUser.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Registration Date</label>
                  <p className="text-lg text-gray-900">{displayUser.registrationDate}</p>
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
                <p className="text-lg text-gray-900 whitespace-pre-line">{displayUser.address}</p>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                  <p className="text-lg text-gray-900">{displayUser.city}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                  <p className="text-lg text-gray-900">{displayUser.state}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Post Code</label>
                  <p className="text-lg text-gray-900">{displayUser.postCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                  <p className="text-lg text-gray-900">{displayUser.country}</p>
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
                <p className="text-lg text-gray-900 font-mono">{displayUser.accountNumber}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <p className="text-lg text-gray-900 font-mono">{displayUser.userId}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">KYC Document</label>
                <p className="text-lg text-gray-900">{displayUser.kycFileName}</p>
                <p className="text-sm text-gray-600">
                  {displayUser.kycFileType} • {(displayUser.kycFileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-lg text-gray-900">{new Date(displayUser.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
