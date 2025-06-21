import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Upload() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageurl: [''],
    link: [''],
    size: 's'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Technology',
    'Politics',
    'Business',
    'Sports',
    'Entertainment',
    'Health',
    'Science',
    'World News',
    'Local News',
    'Weather',
    'Automotive',
    'Food & Dining',
    'Social Media',
    'Education',
    'Environment',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const generateId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `news_${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Filter out empty strings from arrays
      const cleanImageUrls = formData.imageurl.filter(url => url.trim() !== '');
      const cleanLinks = formData.link.filter(link => link.trim() !== '');

      // Create news object
      const newsItem = {
        id: generateId(),
        title: formData.title,
        date: new Date().toISOString(),
        description: formData.description,
        category: formData.category,
        imageurl: cleanImageUrls,
        link: cleanLinks,
        comments: [],
        verification_status: false, // Default to false for new submissions
        size: formData.size,
        ai_score: Math.random() * 0.3 + 0.5, // Random score between 0.5-0.8 for new submissions
        challenge: false,
        challenge_id: null
      };

      // Send to API endpoint
      const response = await fetch('/api/upload-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsItem),
      });

      if (response.ok) {
        setMessage('News uploaded successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          imageurl: [''],
          link: [''],
          size: 's'
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the first valid image URL for preview
  const getPreviewImage = () => {
    const validImages = formData.imageurl.filter(url => url.trim() !== '');
    return validImages.length > 0 ? validImages[0] : null;
  };

  // Preview component based on size
  const NewsPreview = () => {
    const previewImage = getPreviewImage();
    const title = formData.title || 'Your news title will appear here...';
    const description = formData.description || 'Your news description will appear here...';
    const category = formData.category || 'Category';

    // Function to get text sizes based on article size (matching NewspaperLayout)
    const getTextSizes = (size) => {
      switch (size) {
        case 'l': return {
          title: 'text-xl md:text-2xl font-bold leading-tight',
          description: 'text-sm leading-relaxed',
          image: 'h-48 md:h-64'
        };
        case 'm': return {
          title: 'text-lg md:text-xl font-semibold leading-tight',
          description: 'text-sm leading-relaxed',
          image: 'h-40 md:h-48'
        };
        case 's': return {
          title: 'text-base md:text-lg font-semibold leading-tight',
          description: 'text-xs md:text-sm leading-relaxed',
          image: 'h-32 md:h-40'
        };
        default: return {
          title: 'text-lg font-semibold leading-tight',
          description: 'text-sm leading-relaxed',
          image: 'h-40'
        };
      }
    };

    const textSizes = getTextSizes(formData.size);

    // Small size - text only with newspaper styling
    if (formData.size === 's') {
      return (
        <div className="bg-white p-4 border-b border-gray-400 break-inside-avoid max-w-sm">
          {/* Category tag */}
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
            {category}
          </div>
          
          <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
            {title}
          </h3>
          <p className={`${textSizes.description} text-gray-700`}>
            {description}
          </p>
          
          {/* Date */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      );
    }

    // Medium size - image in top-left with newspaper styling
    if (formData.size === 'm') {
      return (
        <div className="bg-white p-4 border-b border-gray-400 break-inside-avoid max-w-sm">
          {/* Category tag */}
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
            {category}
          </div>
          
          <div className="flex gap-3">
            {previewImage && (
              <div className="flex-shrink-0 w-1/3">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className={`w-full ${textSizes.image} object-cover`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=No+Image';
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
                {title}
              </h3>
              <p className={`${textSizes.description} text-gray-700`}>
                {description}
              </p>
            </div>
          </div>
          
          {/* Date */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      );
    }

    // Large size - image on top with newspaper styling
    if (formData.size === 'l') {
      return (
        <div className="bg-white p-4 border-b border-gray-400 break-inside-avoid max-w-md">
          {/* Category tag */}
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
            {category}
          </div>
          
          <div>
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Preview" 
                className={`w-full ${textSizes.image} object-cover mb-3`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=No+Image';
                }}
              />
            )}
            <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
              {title}
            </h3>
            <p className={`${textSizes.description} text-gray-700`}>
              {description}
            </p>
          </div>
          
          {/* Date */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Half - Form */}
        <div className="w-1/2 overflow-y-auto p-8">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload News</h1>
            
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter news title"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Size *
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="s">Small (s) - Title & Description only</option>
                  <option value="m">Medium (m) - Small image with text</option>
                  <option value="l">Large (l) - Bigger image with more text</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter news description"
                />
              </div>

              {/* Image URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs (Optional)
                </label>
                {formData.imageurl.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleArrayInputChange(index, 'imageurl', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageurl.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'imageurl')}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('imageurl')}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Add Image URL
                </button>
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links (Optional)
                </label>
                {formData.link.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleArrayInputChange(index, 'link', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/article"
                    />
                    {formData.link.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'link')}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('link')}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Add Link
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload News'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Half - Live Preview */}
        <div className="w-1/2 bg-gray-100 overflow-y-auto p-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
              <NewsPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
