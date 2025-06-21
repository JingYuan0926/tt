import { useState, useEffect, useRef } from "react";
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



export default function SignUp() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [kycFile, setKycFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingIC, setIsProcessingIC] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Camera-related states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Modal states
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });
  const [successModal, setSuccessModal] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [checkDetailsModal, setCheckDetailsModal] = useState(false);
  const [isCheckDetailsModalVisible, setIsCheckDetailsModalVisible] = useState(false);

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
    setIsSuccessModalVisible(true);
  };

  const closeErrorModal = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
    setTimeout(() => {
      setSuccessModal(false);
      // Redirect to signin page after successful signup
      router.push('/signin');
    }, 150); // Match the animation duration
  };

  const closeCheckDetailsModal = () => {
    setIsCheckDetailsModalVisible(false);
    setTimeout(() => {
      setCheckDetailsModal(false);
    }, 150); // Match the animation duration
  };

  // Camera functions
  const openCamera = async () => {
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      // Set video stream after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      handleCameraError(error);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleCameraError = (error) => {
    let title = 'Camera Access Error';
    let message = 'Unable to access your camera.';
    let details = [];

    if (error.name === 'NotAllowedError') {
      message = 'Camera permission was denied.';
      details = [
        'Please allow camera access in your browser settings',
        'Try refreshing the page and allowing camera access',
        'Alternatively, use the file upload option below'
      ];
    } else if (error.name === 'NotFoundError') {
      message = 'No camera was found on your device.';
      details = [
        'Make sure your device has a camera',
        'Try connecting an external camera',
        'Use the file upload option instead'
      ];
    } else {
      details = [
        'Check if another application is using the camera',
        'Try refreshing the page',
        'Use the file upload option as an alternative'
      ];
    }

    showErrorModal(title, message, details);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and then to file
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a file object from the blob
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const capturedFile = new File([blob], `ic-capture-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        // Set the captured file as the KYC file
        setKycFile(capturedFile);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
        
        // Close camera after successful capture
        closeCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const closeCamera = () => {
    // Stop all video tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setKycFile(null);
    openCamera();
  };

  // Cleanup camera when component unmounts or step changes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, [cameraStream]);

  // Close camera when leaving step 2
  useEffect(() => {
    if (currentStep !== 2 && isCameraOpen) {
      closeCamera();
    }
  }, [currentStep]);

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

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100); // Small delay to ensure smooth entrance

    return () => clearTimeout(timer);
  }, []);

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
      setCapturedImage(null); // Clear any captured image
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

    setIsProcessingIC(true);

    try {

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

        // Document parsed successfully - show check details modal after transition
        setTimeout(() => {
          setCheckDetailsModal(true);
          setIsCheckDetailsModalVisible(true);
        }, 200); // Slight delay after step transition
      } else {
        throw new Error('No data extracted from the document');
      }

    } catch (error) {
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
    } finally {
      setIsProcessingIC(false);
    }
  };

  // Handle step navigation with smooth transitions
  const nextStep = async () => {
    if (currentStep === 1) {
      const stepFields = ['username', 'email', 'password', 'confirmPassword'];
      const isValid = await form.trigger(stepFields);
      if (isValid) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(2);
          setIsTransitioning(false);
        }, 150);
      } else {
        console.log('Validation errors:', form.formState.errors);
      }
    } else if (currentStep === 2) {
      if (kycFile) {
        // Parse document and auto-fill step 3
        await parseICDocument();
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(3);
          setIsTransitioning(false);
        }, 150);
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
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 150);
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
      
      // Show success modal
      showSuccessModal();
      
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
    <div className={`${inter.variable} min-h-screen flex items-start justify-center bg-gray-30 p-4 pt-8 font-[family-name:var(--font-inter)]`}>
      <Card 
        className={`w-full max-w-md mx-auto transform transition-all duration-700 ease-out ${
          isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              
              {/* Form Content with Smooth Transitions */}
              <div className={`transition-all duration-150 space-y-4 ${
                isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
              }`}>
                
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
                  {/* KYC Document Upload Options */}
                  <div className="space-y-4">
                    {!isCameraOpen && !capturedImage && (
                      <>
                        {/* Upload Options */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={openCamera}
                            disabled={isCameraLoading || isSubmitting}
                            className="h-20 flex flex-col items-center justify-center space-y-2"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">
                              {isCameraLoading ? "Starting Camera..." : "Use Camera"}
                            </span>
                          </Button>

                          <div className="h-20 flex flex-col justify-center">
                            <Label htmlFor="kyc-upload" className="cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm text-gray-600">Upload File</span>
                              </div>
                            </Label>
                            <Input
                              id="kyc-upload"
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleFileUpload}
                              disabled={isSubmitting}
                              className="hidden"
                            />
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground text-center">
                          Capture your Malaysian IC with camera or upload from device (JPEG, PNG, PDF - Max 5MB)
                        </p>
                      </>
                    )}

                    {/* Camera Interface */}
                    {isCameraOpen && (
                      <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover"
                          />
                          
                          {/* Camera overlay guidelines */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border-2 border-white/70 rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                              <span className="text-white/90 text-sm bg-black/50 px-3 py-1 rounded">
                                Align your IC within this frame
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={closeCamera}
                            className="flex-1"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1"
                            disabled={isSubmitting}
                          >
                            📷 Capture Photo
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                      <div className="space-y-4">
                        <div>
                          <Label>Captured IC Image</Label>
                          <div className="mt-2 relative">
                            <img
                              src={capturedImage}
                              alt="Captured IC"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={retakePhoto}
                              className="flex-1"
                              disabled={isSubmitting}
                            >
                              📷 Retake Photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Upload Success */}
                    {kycFile && !capturedImage && (
                      <div className="text-center">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✓ File selected: {kycFile.name}
                        </p>
                      </div>
                    )}

                    {/* AI Processing Info - Only show when file is uploaded */}
                    {kycFile && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-blue-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                              Please wait 5 seconds for AI processing.
                            </h4>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Navigation Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                      disabled={isSubmitting || isCameraOpen}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button"
                      onClick={nextStep}
                      className="flex-1" 
                      disabled={!kycFile || isProcessingIC || isCameraOpen}
                    >
                      {isProcessingIC ? "Processing IC..." : "Next"}
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
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                            >
                              <option value="" className="bg-white text-gray-900">Select gender</option>
                              <option value="Male" className="bg-white text-gray-900">Male</option>
                              <option value="Female" className="bg-white text-gray-900">Female</option>
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
              
              </div>
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/signin" 
                className="font-medium text-primary hover:underline"
              >
                Sign in
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
            isSuccessModalVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSuccessModal();
            }
          }}
        >
          <Card 
            className={`w-full max-w-md mx-auto transform transition-all duration-150 ${
              isSuccessModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Account Created Successfully</CardTitle>
              <CardDescription className="text-center">
                You will be redirected to the sign in page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={closeSuccessModal}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Check Details Modal */}
      {checkDetailsModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
            isCheckDetailsModalVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCheckDetailsModal();
            }
          }}
        >
          <Card 
            className={`w-full max-w-md mx-auto transform transition-all duration-150 ${
              isCheckDetailsModalVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Verify Information</CardTitle>
              <CardDescription className="text-center">
                Please check your details before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={closeCheckDetailsModal}
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