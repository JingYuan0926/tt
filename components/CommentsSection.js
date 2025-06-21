import React from 'react';
import { Button, Avatar, Textarea, Card, CardContent, CardHeader, CardTitle, Spinner } from "@heroui/react";
import { ChatBubbleLeftIcon, XMarkIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function CommentsSection({ article, onAddComment }) {
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');
  const [commentAnalysis, setCommentAnalysis] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);

  // Use comments from the article data - simplified structure without likes
  const [comments, setComments] = React.useState(article?.comments?.map(comment => ({
    id: comment.id,
    author: comment.user,
    avatar: null, // Use default avatar for all comments
    time: new Date(comment.timestamp).toLocaleDateString(),
    content: comment.content
  })) || []);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(), // Use timestamp as unique ID
        user: "You",
        content: newComment,
        timestamp: new Date().toISOString()
      };
      
      // Add to local state immediately for UI responsiveness
      const newCommentForDisplay = {
        id: comment.id,
        author: comment.user,
        avatar: null, // Use default avatar for new comments
        time: "Just now",
        content: comment.content
      };
      
      setComments([newCommentForDisplay, ...comments]);
      setNewComment('');
      
      // Reset analysis when new comment is added
      setHasAnalyzed(false);
      setCommentAnalysis(null);
      
      // Call the parent function to save to JSON file
      if (onAddComment) {
        try {
          await onAddComment(article.id, comment);
        } catch (error) {
          console.error('Failed to save comment:', error);
        }
      }
    }
  };

  const analyzeComments = async () => {
    if (comments.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    setCommentAnalysis(null);
    
    try {
      // Extract comment content for analysis
      const commentContents = comments.map(comment => comment.content);
      
      const response = await fetch('/api/analyzeComments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: commentContents
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze comments');
      }

      if (data.success && data.analysis) {
        setCommentAnalysis(data.analysis);
        setHasAnalyzed(true);
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setCommentAnalysis({
        error: true,
        message: error.message || 'Unable to analyze comments. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze comments when component loads (details page loads) and comments exist
  React.useEffect(() => {
    if (comments.length > 0 && !hasAnalyzed && !isAnalyzing) {
      // Start analysis immediately when component mounts
      analyzeComments();
    }
  }, [comments.length]);

  // When sidebar opens, if analysis isn't done yet, keep showing loading state
  React.useEffect(() => {
    if (isCommentsSidebarOpen && comments.length > 0 && !hasAnalyzed && !isAnalyzing) {
      // If for some reason analysis didn't start, start it now
      analyzeComments();
    }
  }, [isCommentsSidebarOpen]);

  // Get tendency color and styling based on score
  const getTendencyInfo = (score) => {
    if (score >= 81) {
      return {
        label: 'Very Positive',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-500'
      };
    } else if (score >= 61) {
      return {
        label: 'Positive',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progressColor: 'bg-green-400'
      };
    } else if (score >= 41) {
      return {
        label: 'Neutral/Mixed',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        progressColor: 'bg-yellow-400'
      };
    } else if (score >= 21) {
      return {
        label: 'Negative',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-400'
      };
    } else {
      return {
        label: 'Very Negative',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progressColor: 'bg-red-500'
      };
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
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div 
                    key={comment.id} 
                    className="flex gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                  >
                    {comment.avatar ? (
                      <Avatar
                        src={comment.avatar}
                        alt={comment.author}
                        size="sm"
                        className="flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Comment Analysis Section */}
            {comments.length > 0 && (
              <motion.div 
                className="border-t border-gray-200 p-6 bg-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ChartBarIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Comment Analysis</h3>
                  {isAnalyzing && <Spinner size="sm" color="primary" />}
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-6">
                    <Spinner size="md" color="primary" className="mb-3" />
                    <p className="text-sm text-gray-600">Analyzing {comments.length} comments...</p>
                  </div>
                ) : commentAnalysis?.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{commentAnalysis.message}</p>
                    <Button 
                      size="sm" 
                      color="primary" 
                      variant="light"
                      onClick={analyzeComments}
                      className="mt-2"
                    >
                      Retry Analysis
                    </Button>
                  </div>
                ) : commentAnalysis ? (
                  <div className="space-y-4">
                    {/* Overall Sentiment */}
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-900 mb-3">Overall Sentiment</h4>
                      {(() => {
                        const tendencyInfo = getTendencyInfo(commentAnalysis.tendencyScore);
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {commentAnalysis.tendencyScore}%
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tendencyInfo.color} ${tendencyInfo.bgColor} ${tendencyInfo.borderColor}`}>
                                {tendencyInfo.label}
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="relative w-full h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${tendencyInfo.progressColor}`}
                                style={{ width: `${commentAnalysis.tendencyScore}%` }}
                              />
                            </div>
                            
                            {commentAnalysis.tendencyExplanation && (
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {commentAnalysis.tendencyExplanation}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Key Highlights */}
                    {commentAnalysis.highlights && commentAnalysis.highlights.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-medium text-gray-900 mb-3">Key Highlights</h4>
                        <div className="space-y-2">
                          {commentAnalysis.highlights.map((highlight, index) => (
                            <div 
                              key={index} 
                              className="flex items-start gap-2 text-xs"
                            >
                              <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                              </span>
                              <p className="text-gray-700 leading-relaxed">
                                {highlight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      color="primary" 
                      variant="light"
                      onClick={analyzeComments}
                      className="w-full"
                    >
                      Re-analyze Comments
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">Analysis will start automatically</p>
                  </div>
                )}
              </motion.div>
            )}
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
          className="rounded-full px-4 py-2 flex items-center gap-2 relative"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Comments</span>
          <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
            {comments.length}
          </span>
          {isAnalyzing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          )}
          {hasAnalyzed && !isAnalyzing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
        </Button>
      </motion.div>
    </>
  );
} 