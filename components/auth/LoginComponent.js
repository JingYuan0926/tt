import React, { useState } from 'react';
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

// Validation schemas
const signinSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
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
  userData 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [signinMode, setSigninMode] = useState('regular');
  const [userGmail, setUserGmail] = useState('');

  // Initialize forms
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

  // Handle regular signin submission
  const onRegularSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const authenticatedUser = {
        ...userData,
        username: values.username,
        loginMethod: 'regular',
        loginTime: new Date().toISOString()
      };

      onLogin(authenticatedUser);
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
      
      const authenticatedUser = {
        ...userData,
        email: userGmail,
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
            <a 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-primary hover:underline"
                disabled={isSubmitting || isTransitioning}
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

  return (
    <>
      {signinMode === 'regular' && renderRegularSignin()}
      {signinMode === 'otp-gmail' && renderGmailInput()}
      {signinMode === 'otp-verify' && renderOtpVerification()}
    </>
  );
};

export default LoginComponent; 