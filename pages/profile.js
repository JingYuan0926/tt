import React from 'react';
import { motion } from 'framer-motion';
import userData from '../data/users.json';

const ProfilePage = () => {
  // Get the first user from the data
  const user = userData[0];

  return (
    <div className="min-h-screen bg-white mt-[100px]">
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Edit Profile Icon */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 right-4 md:right-8 p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full shadow-lg transition-colors duration-200 z-10"
          onClick={() => console.log('Edit profile clicked')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </motion.button>

        {/* Profile Header - matching NewsHeader style */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center border-b-4 border-gray-900 pb-6 mb-8 animate-in slide-in-from-top duration-700"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">PROFILE</h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
            <span>ACCOUNT</span>
            <span>•</span>
            <span>{user.accountNumber}</span>
            <span>•</span>
            <span>MEMBER SINCE {user.registrationDate}</span>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Picture and Basic Info */}
          <div className="bg-white mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
            <div className="relative px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                  <span className="text-4xl font-bold text-gray-700">
                    {user.fullName.split(' ').map(name => name[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.fullName}</h2>
                  <p className="text-gray-600 text-lg">@{user.username}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            {/* Personal Information */}
            <div className="bg-white p-8 border-b border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Personal Information</h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <p className="text-lg text-gray-900">{user.fullName}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">IC Number</label>
                  <p className="text-lg text-gray-900">{user.icNumber}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <p className="text-lg text-gray-900">{user.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Citizenship</label>
                  <p className="text-lg text-gray-900">{user.citizenship}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white p-8 border-b border-gray-400">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Contact Information</h3>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <p className="text-lg text-gray-900">@{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Registration Date</label>
                  <p className="text-lg text-gray-900">{user.registrationDate}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Address Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white p-8 mb-8 border-b border-gray-400"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Address Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-lg text-gray-900 whitespace-pre-line">{user.address}</p>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                  <p className="text-lg text-gray-900">{user.city}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                  <p className="text-lg text-gray-900">{user.state}</p>
                </div>
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Post Code</label>
                  <p className="text-lg text-gray-900">{user.postCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                  <p className="text-lg text-gray-900">{user.country}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white p-8 border-b border-gray-400"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-300">Account Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                <p className="text-lg text-gray-900 font-mono">{user.accountNumber}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <p className="text-lg text-gray-900 font-mono">{user.userId}</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-1">KYC Document</label>
                <p className="text-lg text-gray-900">{user.kycFileName}</p>
                <p className="text-sm text-gray-600">
                  {user.kycFileType} • {(user.kycFileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-lg text-gray-900">{new Date(user.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
