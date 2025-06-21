import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Download() {
  const handleDownload = () => {
    // Add your Chrome extension download link here
    window.open('#', '_blank');
  };

  return (
    <>
      <Head>
        <title>Download News Bias Analyzer</title>
        <meta name="description" content="Download the News Bias Analyzer extension for Chrome" />
      </Head>
      
      <div className="min-h-screen bg-white mt-[100px]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="flex gap-12 items-center max-w-6xl w-full">
              
              {/* Left Side - Installation Content (60%) */}
              <motion.div 
                className="w-[60%] space-y-12"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Install News Bias Analyzer extension for your browser
                  </h1>
                </motion.div>

                {/* Chrome Section */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Chrome Logo and Info */}
                  <div className="flex items-center gap-6 p-8 border border-gray-200 rounded-2xl">
                    <div className="flex-shrink-0">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png"
                        alt="Google Chrome"
                        className="w-16 h-16"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Google Chrome</h2>
                      <p className="text-gray-600">Get instant bias analysis on any news article</p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Download for Chrome
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Side - Screenshot Area (40%) */}
              <motion.div 
                className="w-[40%]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="rounded-2xl p-6">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden min-h-[400px] ml-[-100px]">
                    <img 
                      src="/1.png" 
                      alt="News Bias Analyzer Extension Screenshot"
                      className="w-full h-full rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
