import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (session_id) {
      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/news');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session_id, router]);

  return (
    <>
      <Head>
        <title>Payment Successful - Tea Time Pro</title>
        <meta name="description" content="Your Tea Time Pro subscription is now active" />
      </Head>
      
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto px-4"
        >
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
          >
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Welcome to Tea Time Pro. Your subscription is now active.
            </p>

            <p className="text-sm text-gray-500">
              Redirecting in {countdown} seconds...
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
} 