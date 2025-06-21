import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
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
import { ErrorModal } from "@/components/ui/modal";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
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

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // Add transition state
  
  // OTP flow states
  const [signinMode, setSigninMode] = useState('regular'); // 'regular', 'otp-gmail', 'otp-verify'
  const [userGmail, setUserGmail] = useState(''); // Store gmail for OTP verification step
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('Sign In Successful');

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
    }, 150); // Match the animation duration
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

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100); // Small delay to ensure smooth entrance

    return () => clearTimeout(timer);
  }, []);

  // Handle regular signin submission
  const onRegularSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Simulate authentication process (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace this with actual authentication logic
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
      // TODO: Replace with actual API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store gmail and move to OTP verification step with transition
      setUserGmail(values.gmail);
      setIsTransitioning(true);
      setTimeout(() => {
        setSigninMode('otp-verify');
        setIsTransitioning(false);
      }, 150);
      
      showSuccessModal('OTP Sent Successfully');
      
    } catch (error) {
      console.error('Send OTP error:', error);
      
      showErrorModal(
        'Failed to Send OTP',
        error.message || 'Unable to send OTP. Please try again.',
        [
          'Check your internet connection',
          'Verify your Gmail address is correct',
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
      // TODO: Replace with actual API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Handle successful OTP verification
      showSuccessModal();
      
      // Reset everything with transition back to regular
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
        'Invalid OTP',
        error.message || 'The OTP you entered is incorrect. Please try again.',
        [
          'Double-check the 6-digit code',
          'Make sure you\'re entering the latest OTP',
          'Request a new OTP if this one has expired'
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
        {/* Form Content with Smooth Transitions */}
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...regularForm}>
            <form onSubmit={regularForm.handleSubmit(onRegularSubmit)} className="space-y-4">
              
              {/* Username Field */}
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
                        disabled={isSubmitting || isTransitioning}
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
                disabled={isSubmitting || isTransitioning}
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
            disabled={isSubmitting || isTransitioning}
          >
            Sign in with OTP
          </Button>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Sign Up Link */}
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
        {/* Form Content with Smooth Transitions */}
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...gmailForm}>
            <form onSubmit={gmailForm.handleSubmit(onGmailSubmit)} className="space-y-4">
              
              {/* Gmail Field */}
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

              {/* Send OTP Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning}
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </Form>

          {/* Back Button */}
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
        {/* Form Content with Smooth Transitions */}
        <div className={`transition-all duration-150 space-y-4 ${
          isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              
              {/* OTP Field */}
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

              {/* Verify OTP Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isTransitioning}
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </Form>

          {/* Resend OTP Button */}
          <Button 
            type="button"
            variant="outline" 
            className="w-full mt-4"
            onClick={() => onGmailSubmit({ gmail: userGmail })}
            disabled={isSubmitting || isTransitioning}
          >
            Resend OTP
          </Button>

          {/* Back Button */}
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
    <div className={`${inter.variable} min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20 font-[family-name:var(--font-inter)]`}>
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