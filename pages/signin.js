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

// Validation schema using Zod for form validation
const signinSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});



export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState(false);

  // Helper functions for modals
  const showErrorModal = (title, message, details = null) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details
    });
  };

  const showSuccessModal = () => {
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

  // Initialize form with react-hook-form and Zod validation
  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100); // Small delay to ensure smooth entrance

    return () => clearTimeout(timer);
  }, []);

  // Handle form submission
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Simulate authentication process (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace this with actual authentication logic
      // For now, we'll just show a success message
      showSuccessModal();
      
      // Reset form after successful submission
      form.reset();
      
      // TODO: Redirect to dashboard or home page
      // window.location.href = '/dashboard';
      
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

  return (
    <div className={`${inter.variable} min-h-screen flex items-center justify-center bg-gray-50 p-4 pt-20 font-[family-name:var(--font-inter)]`}>
      <Card 
        className={`w-full max-w-md mx-auto transform transition-all duration-700 ease-out ${
          isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Enter your password" 
                        {...field}
                        disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>

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
        </CardContent>
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
              <CardTitle className="text-2xl font-bold text-center">Sign In Successful</CardTitle>
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