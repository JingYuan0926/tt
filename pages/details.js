import React from 'react';
import Head from 'next/head';
import { Button, Chip, Divider, Avatar, Textarea } from "@heroui/react";
import { ArrowLeftIcon, ShareIcon, BookmarkIcon, HeartIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function Details() {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');

  // Sample comments data
  const [comments, setComments] = React.useState([
    {
      id: 1,
      author: "John Mitchell",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80",
      time: "2 hours ago",
      content: "This is a fascinating perspective on the evolution of tea culture. I've been practicing traditional tea ceremony for years, and I can see both sides of this debate.",
      likes: 12
    },
    {
      id: 2,
      author: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&q=80",
      time: "4 hours ago",
      content: "Technology has definitely changed how I approach tea brewing. My smart kettle ensures perfect temperature every time, but I still appreciate the mindful aspects of traditional methods.",
      likes: 8
    },
    {
      id: 3,
      author: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80",
      time: "6 hours ago",
      content: "As someone who works in the tea industry, I think the key is finding balance. Technology can enhance the experience without replacing the soul of tea culture.",
      likes: 15
    },
    {
      id: 4,
      author: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&q=80",
      time: "8 hours ago",
      content: "Great article! I'm curious about the long-term effects of this technological shift on tea education and cultural preservation.",
      likes: 6
    }
  ]);

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
        <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isCommentsSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
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
            </div>

            {/* Add Comment Section */}
            <div className="p-6 border-b border-gray-200">
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
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
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
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isCommentsSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCommentsSidebarOpen(false)}
          />
        )}

        {/* Comments Button - Fixed Position */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30">
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
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6 pb-12 pt-24">
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-6">
            The Future of Tea Culture: How Modern Brewing Techniques Are Revolutionizing Ancient Traditions
          </h1>

          {/* Subtitle/Description */}
          <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light">
            From precision temperature control to AI-powered steeping algorithms, technology is transforming how we experience tea. But are we losing the soul of this ancient practice in our quest for the perfect cup?
          </p>

          {/* Horizontal line and verification badges */}
          <div className="mb-8">
            <Divider className="mb-4" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <Chip 
                  color="success" 
                  variant="flat" 
                  size="sm"
                  className="text-green-700 bg-green-50"
                >
                  Verified
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-blue-500" />
                <Chip 
                  color="primary" 
                  variant="flat" 
                  size="sm"
                  className="text-blue-700 bg-blue-50"
                >
                  High AI Score
                </Chip>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2141&q=80"
              alt="Modern tea brewing setup with traditional elements"
              className="w-full h-[400px] md:h-[500px] object-cover rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-500 mt-2 italic">
              A modern tea ceremony combines traditional techniques with precision brewing technology. Credit: Tea Masters International
            </p>
          </div>

          {/* Article Meta Information */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80"
                alt="Author"
                className="mr-3"
                size="md"
              />
              <div>
                <p className="font-semibold text-black">Sarah Chen</p>
                <p className="text-sm text-gray-600">Tea Culture Correspondent</p>
                <p className="text-sm text-gray-500">Published March 15, 2024 • 8 min read</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="text-gray-600 hover:text-red-500"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </Button>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="text-gray-600 hover:text-blue-500"
              >
                <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
              </Button>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-gray-600 hover:text-green-500"
              >
                <ShareIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              In a small tea house tucked away in the mountains of Fujian Province, Master Liu Wei performs a ritual that has remained unchanged for centuries. His weathered hands move with practiced precision as he rinses the clay teapot with hot water, measures out leaves of aged oolong, and begins the first of many careful infusions.
            </p>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              But step into any modern specialty tea shop in New York, London, or Tokyo, and you'll encounter a very different scene. Digital thermometers ensure water reaches exactly 185°F. Precision scales measure tea to the gram. Some establishments even employ AI algorithms to determine optimal steeping times based on humidity, altitude, and dozens of other variables.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-6 text-black">The Technology Revolution</h2>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              This technological transformation of tea culture represents more than just gadgetry—it's a fundamental shift in how we approach one of humanity's oldest beverages. Companies like TeaBot and Precision Leaf have raised millions in venture capital to develop smart brewing systems that promise to eliminate human error from the tea-making process.
            </p>

            <blockquote className="border-l-4 border-blue-500 pl-6 my-8 italic text-xl text-gray-700">
              "We're not trying to replace the tea master," explains Dr. Jennifer Park, founder of Precision Leaf. "We're trying to democratize their knowledge. Why should a perfect cup of tea require decades of training?"
            </blockquote>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              The numbers seem to support this technological enthusiasm. Sales of premium tea equipment have grown 340% over the past five years, while traditional tea ceremony classes have seen enrollment drop by nearly half in major metropolitan areas.
            </p>

            {/* Embedded Image */}
            <div className="my-10">
              <img 
                src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80"
                alt="Traditional tea ceremony"
                className="w-full h-[300px] object-cover rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-500 mt-2 italic">
                Traditional tea ceremonies emphasize mindfulness and ritual over precision. Credit: Ancient Arts Foundation
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-6 text-black">The Pushback from Traditionalists</h2>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              Not everyone is embracing this digital revolution. Master Liu Wei, who has been practicing tea ceremony for over 40 years, believes something essential is being lost in translation.
            </p>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              "Tea is not just about the perfect temperature or the exact steeping time," he explains through a translator. "It's about the relationship between the person, the tea, and the moment. When you remove the human element, you remove the soul."
            </p>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              This sentiment is echoed by tea masters across Asia, who argue that the imperfections and variations in traditional brewing methods are not flaws to be corrected, but features that make each cup unique and meaningful.
            </p>

            <h2 className="text-2xl font-bold mt-10 mb-6 text-black">Finding Middle Ground</h2>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              Perhaps the future of tea culture lies not in choosing between tradition and technology, but in finding ways to blend both approaches. Some tea houses are experimenting with hybrid models that use technology to enhance rather than replace traditional methods.
            </p>

            <p className="text-lg leading-relaxed mb-6 text-gray-800">
              At the Tea Innovation Lab in San Francisco, researchers are developing tools that can measure the subtle chemical changes that occur during brewing, providing real-time feedback to help practitioners refine their traditional techniques rather than replace them entirely.
            </p>

            <p className="text-lg leading-relaxed mb-8 text-gray-800">
              As we stand at this crossroads between ancient wisdom and modern innovation, one thing remains clear: our relationship with tea continues to evolve. Whether that evolution preserves the meditative, ritualistic aspects that have made tea culture so enduring, or transforms it into something entirely new, remains to be seen.
            </p>

            <Divider className="my-8" />

            {/* Author Bio */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <div className="flex items-start gap-4">
                <Avatar 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80"
                  alt="Sarah Chen"
                  size="lg"
                />
                <div>
                  <h3 className="font-bold text-lg mb-2">Sarah Chen</h3>
                  <p className="text-gray-700 mb-2">
                    Sarah Chen is Tea Time's culture correspondent, covering the intersection of tradition and innovation in beverage culture. She has written extensively about tea ceremonies across Asia and holds a certification from the International Tea Masters Association.
                  </p>
                  <p className="text-sm text-gray-600">
                    Follow her work at @sarahchentea
                  </p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&w=300&q=80"
                    alt="Related article"
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h4 className="font-semibold mb-2">The Rise of Bubble Tea: A Cultural Phenomenon</h4>
                  <p className="text-sm text-gray-600">How a Taiwanese invention became a global sensation...</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src="https://images.unsplash.com/photo-1597318281675-7a350d8b1c4d?ixlib=rb-4.0.3&w=300&q=80"
                    alt="Related article"
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h4 className="font-semibold mb-2">Sustainable Tea Farming in the Climate Crisis</h4>
                  <p className="text-sm text-gray-600">How tea farmers are adapting to changing weather patterns...</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
