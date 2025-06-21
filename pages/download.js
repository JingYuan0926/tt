import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Download() {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownload = () => {
    // For manual installation - direct download of extension files
    const a = document.createElement('a');
    a.href = '/extension.zip'; // We'll need to create this ZIP file
    a.download = 'news-bias-analyzer-extension.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show installation instructions after download
    setShowInstructions(true);
  };

  const closeInstructions = () => {
    setShowInstructions(false);
  };

  return (
    <>
      <Head>
        <title>Download News Bias Analyzer</title>
        <meta name="description" content="Download the News Bias Analyzer extension for Chrome" />
      </Head>
      
      <div className="min-h-screen bg-white mt-[60px] sm:mt-[80px] lg:mt-[100px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex justify-center">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center max-w-6xl w-full">
              
              {/* Left Side - Installation Content */}
              <motion.div 
                className="w-full lg:w-[60%] space-y-8 sm:space-y-10 lg:space-y-12 order-2 lg:order-1"
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
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight text-center lg:text-left">
                    Install News Bias Analyzer extension for your browser
                  </h1>
                </motion.div>

                {/* Chrome Section */}
                <motion.div 
                  className="space-y-6 sm:space-y-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {/* Chrome Logo and Info */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 border border-gray-200 rounded-2xl">
                    <div className="flex-shrink-0">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png"
                        alt="Google Chrome"
                        className="w-12 h-12 sm:w-16 sm:h-16"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Google Chrome</h2>
                      <p className="text-gray-600 text-sm sm:text-base">Get instant bias analysis on any news article</p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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

              {/* Right Side - Screenshot Area */}
              <motion.div 
                className="w-full lg:w-[40%] order-1 lg:order-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="rounded-2xl p-4 sm:p-6">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] lg:ml-[-100px]">
                    <img 
                      src="/1.png" 
                      alt="News Bias Analyzer Extension Screenshot"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Installation Instructions Modal */}
        {showInstructions && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeInstructions}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Installation Instructions</h2>
                <button
                  onClick={closeInstructions}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium text-sm sm:text-base">
                    📁 Extension downloaded! Follow these steps to install:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Extract the ZIP file</h3>
                      <p className="text-gray-600 text-sm">Unzip the downloaded file to a folder on your computer</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Open Chrome Extensions</h3>
                      <p className="text-gray-600 text-sm">Go to <code className="bg-gray-100 px-2 py-1 rounded text-xs">chrome://extensions/</code> in your Chrome browser</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Enable Developer Mode</h3>
                      <p className="text-gray-600 text-sm">Toggle on "Developer mode" in the top right corner</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Load Unpacked Extension</h3>
                      <p className="text-gray-600 text-sm">Click "Load unpacked" and select the extracted folder</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">You're all set!</h3>
                      <p className="text-gray-600 text-sm">The extension icon should appear in your Chrome toolbar</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={closeInstructions}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Got it!
                  </button>
                  <button
                    onClick={() => window.open('chrome://extensions/', '_blank')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Open Extensions Page
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </>
  );
}
