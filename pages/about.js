import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function About() {
  // Team members data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Editor-in-Chief",
      bio: "Former BBC journalist with 15 years of experience in investigative reporting and editorial leadership.",
      image: "/team/sarah.jpg"
    },
    {
      name: "Marcus Chen",
      role: "Lead Developer",
      bio: "Full-stack developer specializing in AI and machine learning applications for media analysis.",
      image: "/team/marcus.jpg"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Bias Analysis Expert",
      bio: "PhD in Media Studies with expertise in bias detection and algorithmic fairness in journalism.",
      image: "/team/emily.jpg"
    },
    {
      name: "James Thompson",
      role: "Data Scientist",
      bio: "Specialist in natural language processing and sentiment analysis for news content.",
      image: "/team/james.jpg"
    }
  ];

  // Company values data
  const values = [
    {
      title: "Transparency",
      description: "We believe in open, honest reporting and making our bias detection methodology transparent to all users.",
      icon: "🔍"
    },
    {
      title: "Accuracy",
      description: "Our commitment to factual reporting and precise bias analysis ensures reliable information for our readers.",
      icon: "🎯"
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology to provide real-time bias detection and comprehensive news analysis.",
      icon: "💡"
    },
    {
      title: "Independence",
      description: "Our editorial independence ensures unbiased reporting, free from external pressures or influences.",
      icon: "⚖️"
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - Tea Time News</title>
        <meta name="description" content="Learn about Tea Time News - our mission, team, and commitment to unbiased journalism" />
      </Head>
      
      <div className="min-h-screen bg-white pt-2">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          
          {/* About Header - matching NewsHeader style */}
          <div className="text-center border-b-4 border-gray-900 pb-6 mb-8 mt-12 animate-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">ABOUT US</h1>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
              <span>OUR MISSION</span>
              <span>•</span>
              <span>OUR TEAM</span>
              <span>•</span>
              <span>OUR VALUES</span>
            </div>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <div className="w-24 h-1 bg-gray-300 mx-auto mb-8"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="bg-gray-50 rounded-2xl p-8 sm:p-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                  At Tea Time News, we believe that informed citizens are the cornerstone of a healthy democracy. 
                  Our mission is to provide transparent, unbiased news analysis powered by cutting-edge technology 
                  that helps readers identify potential bias in news reporting.
                </p>
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                  We combine traditional journalistic integrity with innovative AI-powered bias detection tools, 
                  ensuring our readers receive not just the news, but the context and analysis needed to form 
                  their own informed opinions.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                Our Values
              </h2>
              <div className="w-24 h-1 bg-gray-300 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <div className="w-24 h-1 bg-gray-300 mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="text-center bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                >
                  {/* Placeholder avatar */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl text-gray-500">👤</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-center bg-gray-50 rounded-2xl p-8 sm:p-12"
          >
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-4">
              Questions About Our Work?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              We're always happy to discuss our methodology, answer questions about our bias detection technology, 
              or hear feedback from our community.
            </p>
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get In Touch
            </motion.button>
          </motion.div>

        </div>
      </div>
    </>
  );
} 