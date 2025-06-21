import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schema for regular signin (supports both email and username)
const signinSchema = z.object({
  identifier: z.string()
    .min(1, { message: "Email or username is required." })
    .refine((value) => {
      // If it contains @, validate as email
      if (value.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      // Otherwise, validate as username (minimum 3 characters)
      return value.length >= 3;
    }, {
      message: "Please enter a valid email address or username (minimum 3 characters)."
    }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const gmailSchema = z.object({
  gmail: z.string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid Gmail address." })
    .refine((email) => email.endsWith('@gmail.com'), {
      message: "Please enter a valid Gmail address.",
    }),
});

const otpSchema = z.object({
  otp: z.string()
    .min(6, { message: "OTP must be 6 digits." })
    .max(6, { message: "OTP must be 6 digits." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers." }),
});

const LoginComponent = ({ 
  onLogin, 
  onSwitchToSignup, 
  showErrorModal, 
  showSuccessModal,
  userData,
  isTransitioning: parentIsTransitioning = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signinMode, setSigninMode] = useState('regular');
  const [userGmail, setUserGmail] = useState('');
  
  // Dynamic input state
  const [identifierType, setIdentifierType] = useState(''); // 'email' or 'username'

  // Initialize forms
  const regularForm = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
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

  // Watch identifier field to determine input type
  const identifierValue = regularForm.watch('identifier');
  useEffect(() => {
    if (identifierValue) {
      setIdentifierType(identifierValue.includes('@') ? 'email' : 'username');
    } else {
      setIdentifierType('');
    }
  }, [identifierValue]);

  // Handle regular signin submission
  const onRegularSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Call the actual login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Handle specific error cases from the login API
        if (response.status === 401) {
          const errorDetails = [];
          
          if (result.attemptsRemaining !== undefined) {
            errorDetails.push(`${result.attemptsRemaining} attempts remaining before account lockout`);
          }
          
          if (result.error.includes('locked')) {
            errorDetails.push('Contact support to unlock your account');
          } else {
            errorDetails.push('Check your email/username and password');
            errorDetails.push('Make sure Caps Lock is not enabled');
          }

          throw new Error(result.error, { cause: { details: errorDetails } });
        }
        
        throw new Error(result.error || result.message || 'Login failed');
      }

      // Success! Store user data and redirect
      const userData = result.user;
      
      // Log successful login
      console.log('✅ User logged in successfully:', {
        userId: userData._id,
        username: userData.username,
        email: userData.email,
        loginMethod: identifierType,
        profileComplete: userData.profileComplete,
        hasICData: !!userData.profile?.identity?.icNumber,
        kycStatus: userData.profile?.kyc?.verificationStatus
      });

      const authenticatedUser = {
        ...userData,
        loginMethod: 'regular',
        loginTime: new Date().toISOString()
      };

      onLogin(authenticatedUser);
      regularForm.reset();
      
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Extract error details if available
      const errorDetails = error.cause?.details || [
        'Check your email/username and password',
        'Make sure Caps Lock is not enabled',
        'Contact support if you continue to have issues'
      ];
      
      showErrorModal(
        'Sign In Failed',
        error.message || 'Invalid email/username or password. Please try again.',
        errorDetails
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
      
      // Success! Handle successful OTP verification
      console.log('OTP verification successful:', result.user);
      
      const authenticatedUser = {
        ...result.user,
        loginMethod: 'otp',
        loginTime: new Date().toISOString()
      };

      onLogin(authenticatedUser);
      
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
          (isTransitioning || parentIsTransitioning) ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...regularForm}>
            <form onSubmit={regularForm.handleSubmit(onRegularSubmit)} className="space-y-4">
              
              {/* Email/Username Field */}
              <FormField
                control={regularForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email or Username
                      {identifierType && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({identifierType === 'email' ? 'Email detected' : 'Username detected'})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder={
                          identifierType === 'email' 
                            ? "Enter your email address" 
                            : identifierType === 'username'
                            ? "Enter your username"
                            : "Enter your email or username"
                        }
                        {...field}
                        disabled={isSubmitting || isTransitioning || parentIsTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
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
                        disabled={isSubmitting || isTransitioning || parentIsTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning || parentIsTransitioning}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Sign in with OTP Button */}
          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleOtpSigninClick}
            disabled={isSubmitting || isTransitioning || parentIsTransitioning}
          >
            Sign in with OTP
          </Button>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <a 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-primary hover:underline"
                disabled={isSubmitting || isTransitioning || parentIsTransitioning}
              >
                Sign up
              </button>
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
          (isTransitioning || parentIsTransitioning) ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
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
                        disabled={isSubmitting || isTransitioning || parentIsTransitioning}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning || parentIsTransitioning}
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
            disabled={isSubmitting || isTransitioning || parentIsTransitioning}
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
          (isTransitioning || parentIsTransitioning) ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
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
                        disabled={isSubmitting || isTransitioning || parentIsTransitioning}
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
                disabled={isSubmitting || isTransitioning || parentIsTransitioning}
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
            disabled={isSubmitting || isTransitioning || parentIsTransitioning}
          >
            Resend OTP
          </Button>

          <Button 
            type="button"
            variant="ghost" 
            className="w-full mt-2"
            onClick={handleBackToGmail}
            disabled={isSubmitting || isTransitioning || parentIsTransitioning}
          >
            Change Gmail Address
          </Button>
        </div>
      </CardContent>
    </>
  );

  return (
    <>
      {signinMode === 'regular' && renderRegularSignin()}
      {signinMode === 'otp-gmail' && renderGmailInput()}
      {signinMode === 'otp-verify' && renderOtpVerification()}
    </>
  );
};

export default LoginComponent; 