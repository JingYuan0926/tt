import React from 'react';
import { Button, Chip, Avatar, Textarea } from "@heroui/react";
import { ChatBubbleLeftIcon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CommentsSection({ article }) {
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
    <>
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
    </>
  );
} 