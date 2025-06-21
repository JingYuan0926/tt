import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button, Chip, Divider, Avatar, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@heroui/react";
import { ArrowLeftIcon, ShareIcon, BookmarkIcon, HeartIcon, ChatBubbleLeftIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import newsData from '../data/news.json';
import BiasAnalysis from '../components/BiasAnalysis';

export default function Details() {
  const router = useRouter();
  const { id } = router.query;
  
  // Find the article by ID
  const article = newsData.find(item => item.id === id);
  
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

  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');

  // Use comments from the article data
  const [comments, setComments] = React.useState(article?.comments?.map(comment => ({
    id: comment.id,
    author: comment.user,
    avatar: `https://images.unsplash.com/photo-150${Math.floor(Math.random() * 9) + 1}003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80`,
    time: new Date(comment.timestamp).toLocaleDateString(),
    content: comment.content,
    likes: comment.vote?.upvotes || 0
  })) || []);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&w=150&q=80",
        time: "Just now",
        content: newComment,
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Tea Time - Article Details</title>
        <meta name="description" content="Read the latest article on Tea Time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-white relative">
        {/* Comments Sidebar */}
        <motion.div 
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            isCommentsSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          initial={false}
          animate={{
            x: isCommentsSidebarOpen ? 0 : '100%'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <motion.div 
              className="p-6 border-b border-gray-200 flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h2>
              </div>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => setIsCommentsSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Add Comment Section */}
            <motion.div 
              className="p-6 border-b border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Textarea
                placeholder="Share your thoughts on this article..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                minRows={3}
                className="mb-3"
              />
              <Button 
                color="primary" 
                size="sm" 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </motion.div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {comments.map((comment, index) => (
                <motion.div 
                  key={comment.id} 
                  className="flex gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                >
                  <Avatar
                    src={comment.avatar}
                    alt={comment.author}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
                        <HeartIcon className="w-4 h-4" />
                        {comment.likes}
                      </button>
                      <button className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overlay */}
        {isCommentsSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCommentsSidebarOpen(false)}
          />
        )}

        {/* Bias Analysis Component */}
        <BiasAnalysis article={article} />

        {/* Comments Button - Fixed Position */}
        <motion.div 
          className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <Button
            color="primary"
            variant="shadow"
            size="lg"
            onClick={() => setIsCommentsSidebarOpen(true)}
            className="rounded-full px-4 py-2 flex items-center gap-2"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Comments</span>
            <Chip size="sm" color="primary" variant="solid" className="text-white bg-white bg-opacity-20">
              {comments.length}
            </Chip>
          </Button>
        </motion.div>

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
          <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light">
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

          {/* External Links */}
          {article.link && article.link.length > 0 && (
            <motion.div 
              className="my-8 p-4 bg-blue-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <h3 className="font-semibold text-blue-900 mb-3">Related Links:</h3>
              <ul className="space-y-2">
                {article.link.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <Divider className="my-8" />
        </motion.article>
      </main>
    </div>
  );
}
