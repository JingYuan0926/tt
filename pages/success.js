import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      // You can verify the session on the backend if needed
      setSessionData({ id: session_id });
      setLoading(false);
    }
  }, [session_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful - Tea Time Pro</title>
        <meta name="description" content="Your Tea Time Pro subscription is now active" />
      </Head>
      
      <div className="min-h-screen bg-white pt-2">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center border-b-4 border-gray-900 pb-6 mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">SUCCESS</h1>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
              <span>PAYMENT COMPLETE</span>
              <span>•</span>
              <span>TEA TIME PRO</span>
              <span>•</span>
              <span>SUBSCRIPTION ACTIVE</span>
            </div>
          </motion.div>

          {/* Success Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Success Icon */}
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Tea Time Pro!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your subscription is now active. You now have unlimited access to advanced bias analysis, 
              the Tea Time web extension, and all Pro features.
            </p>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span className="text-blue-800">Download the Tea Time browser extension</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span className="text-blue-800">Start analyzing news articles with unlimited access</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-blue-800">Explore advanced features and analytics dashboard</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/download')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Download Extension
              </motion.button>
              <motion.button
                onClick={() => router.push('/news')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Analyzing
              </motion.button>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                Need help getting started? Our support team is here for you.
              </p>
              <p className="text-sm text-gray-500">
                Session ID: {session_id}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 