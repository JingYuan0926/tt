import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Button } from "./button";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Modal component for displaying messages
export function Modal({ isOpen, onClose, title, message, type = "info", children }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 150); // Match the animation duration
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get icon and colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-500',
          titleColor: 'text-green-900 dark:text-green-100',
          messageColor: 'text-green-700 dark:text-green-300'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900 dark:text-red-100',
          messageColor: 'text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900 dark:text-yellow-100',
          messageColor: 'text-yellow-700 dark:text-yellow-300'
        };
      case 'info':
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900 dark:text-blue-100',
          messageColor: 'text-blue-700 dark:text-blue-300'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={`${inter.variable} fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 font-[family-name:var(--font-inter)] ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative w-full max-w-md transform transition-all duration-150 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className={`${styles.iconColor}`}>
                {styles.icon}
              </div>
              <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                {title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Message */}
            {message && (
              <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-4 mb-4`}>
                <p className={`text-sm leading-relaxed ${styles.messageColor}`}>
                  {message}
                </p>
              </div>
            )}

            {/* Custom children content */}
            {children && (
              <div className="mb-4">
                {children}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button onClick={handleClose} className="min-w-[80px]">
                OK
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specific modal types for common use cases
export function ErrorModal({ isOpen, onClose, title = "Error", message, details }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      {message && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
            {message}
          </p>
          {details && (
            <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
              {Array.isArray(details) ? (
                details.map((detail, index) => (
                  <div key={index}>• {detail}</div>
                ))
              ) : (
                <div>• {details}</div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export function SuccessModal({ isOpen, onClose, title = "Success", message, details }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
            {message}
          </p>
          {details && (
            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
              {Array.isArray(details) ? (
                details.map((detail, index) => (
                  <div key={index}>• {detail}</div>
                ))
              ) : (
                <div>• {details}</div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
} 