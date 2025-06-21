import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button, Chip, Divider, Avatar, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@heroui/react";
import { ArrowLeftIcon, ShareIcon, BookmarkIcon, HeartIcon, ChatBubbleLeftIcon, XMarkIcon, ShieldCheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
  import Link from 'next/link';
import newsData from '../data/news.json';
import BiasAnalysis from '../components/BiasAnalysis';
import CommentsSection from '../components/CommentsSection';

export default function Details() {
  const router = useRouter();
  const { id } = router.query;
  
  // Find the article by ID
  const article = newsData.find(item => item.id === id);
  
  // Function to save comment to the JSON file
  const handleAddComment = async (articleId, comment) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          comment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save comment');
      }

      console.log('Comment saved successfully');
    } catch (error) {
      console.error('Error saving comment:', error);
      throw error;
    }
  };
  
  // If article not found, show loading or error
  if (!article && id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link href="/news">
            <Button color="primary">Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Show loading state while router is loading
  if (!id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Tea Time - Article Details</title>
        <meta name="description" content="Read the latest article on Tea Time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-white relative">
        {/* Bias Analysis Component */}
        <BiasAnalysis article={article} />

        {/* Comments Section Component */}
        <CommentsSection article={article} onAddComment={handleAddComment} />

        {/* Article Header */}
        <motion.article 
          className="max-w-4xl mx-auto px-6 pb-12 pt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/news">
              <Button 
                variant="light" 
                size="sm" 
                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to News
              </Button>
            </Link>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-6">
            {article.title}
          </h1>

          {/* Subtitle/Description */}
          <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light text-justify">
            {article.description}
          </p>

          {/* Horizontal line and verification badges */}
          <div className="mb-8">
            <Divider className="mb-4" />
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <Chip 
                  color={article.verification_status ? "success" : "warning"} 
                  variant="flat" 
                  size="sm"
                  className={article.verification_status ? "text-green-700 bg-green-50" : "text-yellow-700 bg-yellow-50"}
                >
                  {article.verification_status ? "Verified" : "Pending Verification"}
                </Chip>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {article.imageurl && article.imageurl.length > 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <img 
                src={article.imageurl[0]}
                alt={article.title}
                className="w-full h-[400px] md:h-[500px] object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x500/f3f4f6/6b7280?text=Image+Not+Available';
                }}
              />
              <p className="text-sm text-gray-500 mt-2 italic">
                {article.title} - Category: {article.category}
              </p>
            </motion.div>
          )}

          {/* Additional Images */}
          {article.imageurl && article.imageurl.length > 1 && (
            <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.imageurl.slice(1).map((img, index) => (
                <motion.img 
                  key={index}
                  src={img}
                  alt={`${article.title} - Image ${index + 2}`}
                  className="w-full h-[250px] object-cover rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + (index * 0.1) }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x250/f3f4f6/6b7280?text=Image+Not+Available';
                  }}
                />
              ))}
            </div>
          )}

          {/* External Links - Updated Section */}
          {((article.link && article.link.length > 0) || aiSources.length > 0) && (
            <motion.div 
              className="my-8 p-6 bg-blue-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-900">Related Sources:</h3>
                {!isGeneratingSources && aiSources.length === 0 && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<LinkIcon className="w-4 h-4" />}
                    onClick={handleGenerateSources}
                  >
                    Generate AI Sources
                  </Button>
                )}
              </div>

              {/* Original article links */}
              {article.link && article.link.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Original Sources:</h4>
                  <ul className="space-y-2">
                    {article.link.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Generated Sources */}
              {isGeneratingSources && (
                <div className="flex items-center gap-2 text-blue-700">
                  <Spinner size="sm" color="primary" />
                  <span className="text-sm">Generating related sources...</span>
                </div>
              )}

              {aiSources.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4" />
                    AI-Generated Related Sources:
                  </h4>
                  <ul className="space-y-3">
                    {aiSources.map((source, index) => (
                      <li key={index} className="border-l-2 border-blue-200 pl-3">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline font-medium text-sm block"
                        >
                          {source.title}
                        </a>
                        <span className="text-xs text-gray-600 break-all">{source.url}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-xs text-gray-500 italic">
                    * AI-generated sources are suggestions and should be verified for accuracy
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <Divider className="my-8" />
        </motion.article>
      </main>
    </div>
  );
}
