import { useState, useEffect } from "react";
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
import { ErrorModal, SuccessModal } from "@/components/ui/modal";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Validation schema using Zod for form validation
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

// Theme Toggle Component
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50"
    >
      {isDark ? (
        // Sun icon for light mode
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </Button>
  );
}

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycFile, setKycFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });

  // Helper functions for modals
  const showErrorModal = (title, message, details = null) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details
    });
  };

  const showSuccessModal = (title, message, details = null) => {
    setSuccessModal({
      isOpen: true,
      title,
      message,
      details
    });
  };

  const closeErrorModal = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeSuccessModal = () => {
    setSuccessModal(prev => ({ ...prev, isOpen: false }));
  };

  // Initialize form with react-hook-form and Zod validation
  const form = useForm({
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

  // Handle file upload for KYC document
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (accept common document formats)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showErrorModal(
          'Invalid File Type',
          'Please upload a valid document format.',
          ['Supported formats: JPEG, PNG, PDF', 'Make sure the file extension is correct']
        );
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showErrorModal(
          'File Too Large',
          `File size is ${fileSizeMB}MB. Maximum allowed size is 5MB.`,
          ['Try compressing the image', 'Use a different image with smaller file size']
        );
        return;
      }
      
      setKycFile(file);
    }
  };

  // Parse IC document using Google Gemini API
  const parseICDocument = async () => {
    if (!kycFile) {
      showErrorModal(
        'No Document Selected',
        'Please upload an IC document first before proceeding.',
        ['Click "Choose File" to select your IC document', 'Ensure the document is clear and readable']
      );
      return;
    }

    try {
      // Show loading state with better styling
      const loadingMessage = document.createElement('div');
      loadingMessage.id = 'parsing-loading';
      loadingMessage.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
                    align-items: center; justify-content: center;">
          <div style="background: white; padding: 30px; border-radius: 12px; 
                      box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; 
                      max-width: 300px; animation: pulse 2s infinite;">
                         <div style="margin-bottom: 15px; display: flex; justify-content: center;">
               <svg style="width: 32px; height: 32px; color: #4f46e5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px; color: #333;">
               Analyzing IC Document
             </div>
            <div style="font-size: 14px; color: #666; line-height: 1.4;">
              Please wait while our AI processes your document...<br>
              This may take 10-30 seconds
            </div>
            <div style="margin-top: 15px; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); 
                          animation: loading 2s infinite; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        </style>
      `;
      document.body.appendChild(loadingMessage);

      // Convert file to base64
      const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      };

      const imageData = await fileToBase64(kycFile);
      
      // Call the Gemini API endpoint
      const response = await fetch('/api/parse-ic-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageData,
          mimeType: kycFile.type
        }),
      });

      const result = await response.json();

      // Remove loading message
      document.getElementById('parsing-loading')?.remove();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to parse IC document');
      }

      if (result.success && result.data) {
        // Auto-fill the form with parsed data
        Object.keys(result.data).forEach(key => {
          if (result.data[key] && result.data[key].trim() !== '') {
            form.setValue(key, result.data[key]);
          }
        });

        // Show success message
        showSuccessModal(
          'Document Parsed Successfully',
          'Your IC document has been analyzed and personal details have been auto-filled.',
          ['Please review all extracted information', 'Make any necessary corrections before submitting', 'All fields can be edited manually if needed']
        );
      } else {
        throw new Error('No data extracted from the document');
      }

    } catch (error) {
      // Remove loading message if it exists
      document.getElementById('parsing-loading')?.remove();
      
      console.error('Error parsing IC document:', error);
      showErrorModal(
        'Document Parsing Failed',
        `Unable to process your IC document: ${error.message}`,
        [
          'Ensure the image is clear and well-lit',
          'Make sure the IC document is fully visible',
          'Check that the file format is supported (JPEG, PNG, PDF)',
          'Try taking a new photo with better lighting'
        ]
      );
    }
  };

  // Handle step navigation
  const nextStep = async () => {
    if (currentStep === 1) {
      const stepFields = ['username', 'email', 'password', 'confirmPassword'];
      const isValid = await form.trigger(stepFields);
      if (isValid) {
        setCurrentStep(2);
      } else {
        console.log('Validation errors:', form.formState.errors);
      }
    } else if (currentStep === 2) {
      if (kycFile) {
        // Parse document and auto-fill step 3
        await parseICDocument();
        setCurrentStep(3);
      } else {
        showErrorModal(
          'Document Required',
          'Please upload your IC document before proceeding to the next step.',
          ['Click "Choose File" to select your document', 'Supported formats: JPEG, PNG, PDF']
        );
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Modular function to save account data to JSON file
  const saveAccountToJSON = async (accountData) => {
    try {
      // Prepare data with KYC file information
      const dataToSave = {
        ...accountData,
        kycFileName: kycFile?.name || null,
        kycFileSize: kycFile?.size || null,
        kycFileType: kycFile?.type || null
      };
      
      // Send to API endpoint
      const response = await fetch('/api/save-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save user');
      }
      
      console.log('✅ Account saved to file:', result.filePath);
      console.log(`📊 Total users: ${result.totalUsers}`);
      console.log('👤 New user:', result.user);
      
      return result.user;
    } catch (error) {
      console.error('Error saving account:', error);
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (values) => {
    if (currentStep < 3) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save account data to JSON file
      const savedAccount = await saveAccountToJSON(values);
      
      // Show success modal with account details
      showSuccessModal(
        'Account Created Successfully',
        'Your account has been created and saved successfully!',
        [
          `User ID: ${savedAccount.userId}`,
          `Account Number: ${savedAccount.accountNumber}`,
          `Username: ${savedAccount.username}`,
          `Registration Date: ${savedAccount.registrationDate}`
        ]
      );
      
      // Reset form after successful submission
      form.reset();
      setKycFile(null);
      setCurrentStep(1);
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific error types
      if (error.message.includes('Duplicate')) {
        showErrorModal(
          'Account Already Exists',
          error.message,
          [
            'Please use a different username if username is taken',
            'Use a different email address if email is already registered',
            'Contact support if you believe this is an error'
          ]
        );
      } else if (error.message.includes('API configuration')) {
        showErrorModal(
          'System Configuration Error',
          'There is a system configuration issue. Please contact support.',
          ['This is not an issue with your input', 'Please try again later or contact support']
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

  return (
    <div className={`${inter.variable} min-h-screen flex items-center justify-center bg-background p-4 font-[family-name:var(--font-inter)]`}>
      {/* Theme Toggle Button */}
      <ThemeToggle />
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            {currentStep === 1 && "Enter your account details to get started"}
            {currentStep === 2 && "Upload your Malaysian IC document"}
            {currentStep === 3 && "Verify your personal details"}
          </CardDescription>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <>
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

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email address" 
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
                            placeholder="Create a strong password" 
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Confirm your password" 
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Next Button */}
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="w-full"
                  >
                    Next Step
                  </Button>
                </>
              )}

              {/* Step 2: KYC Document Upload */}
              {currentStep === 2 && (
                <>
                  {/* KYC Document Upload */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="kyc-upload">KYC Document Upload</Label>
                      <Input
                        id="kyc-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        disabled={isSubmitting}
                        className="cursor-pointer mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your Malaysian IC (JPEG, PNG, or PDF - Max 10MB)
                      </p>
                      {kycFile && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                          ✓ File selected: {kycFile.name}
                        </p>
                      )}
                    </div>

                    {/* AI Processing Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            AI-Powered Document Processing
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                            Our AI will automatically extract your personal details from the IC document.
                          </p>
                          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            <div>• Ensure the document is well-lit and clearly visible</div>
                            <div>• All text should be readable and not blurred</div>
                            <div>• Processing takes 10-30 seconds</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button"
                      onClick={nextStep}
                      className="flex-1" 
                      disabled={!kycFile}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Personal Details */}
              {currentStep === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* IC Number */}
                    <FormField
                      control={form.control}
                      name="icNumber"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>IC Number</FormLabel>
                          <FormControl>
                            <Input placeholder="123456-78-9012" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Full Name */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name as per IC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Address */}
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Post Code & City */}
                    <FormField
                      control={form.control}
                      name="postCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State & Country */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Citizenship & Gender */}
                    <FormField
                      control={form.control}
                      name="citizenship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Citizenship</FormLabel>
                          <FormControl>
                            <Input placeholder="Malaysian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a 
                href="/signin" 
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </a>
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

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        title={successModal.title}
        message={successModal.message}
        details={successModal.details}
      />
    </div>
  );
} 