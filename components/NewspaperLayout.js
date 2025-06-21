import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NewspaperLayout = ({ articles }) => {
  const [columns, setColumns] = useState(3);

  // Responsive column count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to get text sizes based on article size
  const getTextSizes = (size) => {
    switch (size) {
      case 'xl': return {
        title: 'text-2xl md:text-3xl font-bold leading-tight',
        description: 'text-base leading-relaxed',
        image: 'h-64 md:h-80'
      };
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

  // Function to randomly determine layout orientation
  const getRandomOrientation = (size, index) => {
    const orientations = ['image-top', 'image-left', 'image-right', 'text-only'];
    
    // XL articles always have image on top for better layout
    if (size === 'xl') return 'image-top';
    
    // Small articles might not have images sometimes
    if (size === 's' && Math.random() > 0.7) return 'text-only';
    
    // Use index to create some predictable randomness
    const orientationIndex = (index + Math.floor(Math.random() * 3)) % orientations.length;
    return orientations[orientationIndex];
  };

  // Distribute articles into columns for masonry layout
  const distributeArticles = () => {
    const columnArrays = Array.from({ length: columns }, () => []);
    
    articles.forEach((article, index) => {
      // Find the column with the least content (shortest height)
      const shortestColumnIndex = columnArrays.reduce((minIndex, column, currentIndex) => {
        return columnArrays[minIndex].length > column.length ? currentIndex : minIndex;
      }, 0);
      
      columnArrays[shortestColumnIndex].push({ ...article, originalIndex: index });
    });
    
    return columnArrays;
  };

  const ArticleComponent = ({ article, index }) => {
    const textSizes = getTextSizes(article.size);
    const orientation = getRandomOrientation(article.size, article.originalIndex || index);
    const hasImage = article.imageurl && article.imageurl.length > 0;

    // Get margin based on size for better spacing
    const getMarginBottom = (size) => {
      switch (size) {
        case 'xl': return 'mb-8';
        case 'l': return 'mb-6';
        case 'm': return 'mb-5';
        case 's': return 'mb-4';
        default: return 'mb-4';
      }
    };

    const renderContent = () => {
      switch (orientation) {
        case 'image-left':
          return hasImage ? (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1/3">
                <img 
                  src={article.imageurl[0]} 
                  alt={article.title}
                  className={`w-full ${textSizes.image} object-cover`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=No+Image';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
                  {article.title}
                </h3>
                <p className={`${textSizes.description} text-gray-700`}>
                  {article.description}
                </p>
              </div>
            </div>
          ) : renderTextOnly();

        case 'image-right':
          return hasImage ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
                  {article.title}
                </h3>
                <p className={`${textSizes.description} text-gray-700`}>
                  {article.description}
                </p>
              </div>
              <div className="flex-shrink-0 w-1/3">
                <img 
                  src={article.imageurl[0]} 
                  alt={article.title}
                  className={`w-full ${textSizes.image} object-cover`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=No+Image';
                  }}
                />
              </div>
            </div>
          ) : renderTextOnly();

        case 'text-only':
          return renderTextOnly();

        default: // image-top
          return (
            <div>
              {hasImage && (
                <img 
                  src={article.imageurl[0]} 
                  alt={article.title}
                  className={`w-full ${textSizes.image} object-cover mb-3`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=No+Image';
                  }}
                />
              )}
              <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
                {article.title}
              </h3>
              <p className={`${textSizes.description} text-gray-700`}>
                {article.description}
              </p>
            </div>
          );
      }
    };

    const renderTextOnly = () => (
      <div>
        <h3 className={`${textSizes.title} text-gray-900 mb-2`}>
          {article.title}
        </h3>
        <p className={`${textSizes.description} text-gray-700`}>
          {article.description}
        </p>
      </div>
    );

    return (
      <motion.article 
        className={`${getMarginBottom(article.size)} p-4 border-b border-gray-400 break-inside-avoid`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (article.originalIndex || index) * 0.1 }}
        whileHover={{ 
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}
      >
        {/* Category tag */}
        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 pb-2 border-b border-gray-300">
          {article.category}
        </div>
        
        {renderContent()}
        
        {/* Date */}
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
          {new Date(article.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </motion.article>
    );
  };

  const columnArrays = distributeArticles();

  return (
    <div className="bg-transparent">
      <div className={`grid gap-6 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {columnArrays.map((columnArticles, columnIndex) => (
          <div key={columnIndex} className="space-y-0 border-r border-gray-400 pr-4 last:border-r-0">
            {columnArticles.map((article, articleIndex) => (
              <ArticleComponent 
                key={article.id} 
                article={article} 
                index={articleIndex} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewspaperLayout; 