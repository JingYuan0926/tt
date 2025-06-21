import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Subscribe() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        const isStoredLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isStoredLoggedIn && storedUser) {
          setIsLoggedIn(true);
          setCurrentUser(JSON.parse(storedUser));
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    };

    checkAuthStatus();
  }, []);

  const plans = [
    {
      name: 'Free',
      description: 'Explore how AI can help with everyday news analysis',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Access to basic bias analysis',
        'Real-time analysis from the web',
        'Limited daily analyses (10 per day)',
        'Basic source recommendations',
        'Community support',
        'Standard analysis depth'
      ],
      buttonText: 'Get Free',
      buttonStyle: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      popular: false
    },
    {
      name: 'Pro',
      description: 'Get the best of Tea Time with the highest level of access',
      price: { monthly: 10, yearly: 100 },
      features: [
        'Everything in Free',
        'Unlimited daily analyses',
        'Advanced AI models for deeper insights',
        'Access to Tea Time web extension',
        'Real-time monitoring and alerts',
        'Custom bias detection parameters',
        'API access for integration',
        'Bulk analysis tools',
        'Advanced analytics dashboard',
        'Priority support with dedicated account manager',
        'Custom training on your data sources',
        'Includes web extension access'
      ],
      buttonText: 'Get Pro',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      popular: true
    }
  ];

  const handleSubscribe = async (planName) => {
    // Check if user is logged in for both Free and Pro plans
    if (!isLoggedIn || !currentUser) {
      // Show modal instead of alert
      setShowLoginModal(true);
      return;
    }

    if (planName === 'Free') {
      console.log('Subscribing to Free plan');
      // Handle free plan signup (maybe redirect to registration)
      return;
    }

    if (planName === 'Pro') {
      setLoading(true);
      
      try {
        // Redirect directly to Stripe payment link
        // The success URL is already configured in Stripe Dashboard to redirect to /profile
        window.location.href = 'https://buy.stripe.com/test_fZu3cx1KI1HJ3lD4TSdby01';
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Subscribe to Tea Time - News Bias Analyzer</title>
        <meta name="description" content="Choose the perfect plan for your news analysis needs" />
      </Head>
      
      <div className="min-h-screen bg-white pt-2">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          
          {/* Header - matching News page style with bottom-to-top animation */}
          <div className="text-center border-b-4 border-gray-900 pb-6 mb-8 animate-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">PRICING</h1>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
              <span>SUBSCRIPTION</span>
              <span>•</span>
              <span>PRICING TIERS</span>
              <span>•</span>
              <span>AI-POWERED ANALYSIS</span>
              {isLoggedIn && currentUser && (
                <>
                  <span>•</span>
                  <span>LOGGED IN AS {currentUser.username?.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
              Get Tea Time Pro that helps you understand media perspectives and make informed decisions
            </h2>
            <div className="w-24 h-1 bg-gray-300 mx-auto mb-8"></div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Save 17%
                </span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className={`relative bg-white border-2 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                      RM{plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      / {billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subscribe Button */}
                <motion.button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={loading && plan.name === 'Pro'}
                  className={`w-full font-semibold py-3 px-6 rounded-xl text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl ${plan.buttonStyle} ${
                    loading && plan.name === 'Pro' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={loading && plan.name === 'Pro' ? {} : { scale: 1.02 }}
                  whileTap={loading && plan.name === 'Pro' ? {} : { scale: 0.98 }}
                >
                  {loading && plan.name === 'Pro' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      {plan.buttonText}
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-4">
              Have an existing plan? 
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1 underline">
                See billing help
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLoginModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600">
                Please login or create an account to subscribe to Tea Time plans.
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/profile');
                }}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In/Sign Up
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
