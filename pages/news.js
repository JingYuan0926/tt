import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NewsHeader from '../components/NewsHeader';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import newsData from '../data/news.json';

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);

  // Extract unique categories from the news data
  const categories = ['All', ...new Set(newsData.map(article => article.category))];

  useEffect(() => {
    setArticles(newsData);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{backgroundImage: 'url("/newspaper.jpg")'}}
    >
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-white bg-opacity-80"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <NewsHeader />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </motion.div>

        {/* News Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredArticles.map((article, index) => (
            <motion.article 
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              whileHover={{ y: -3 }}
            >
              {/* Image */}
              {article.imageurl && article.imageurl.length > 0 && (
                <img 
                  src={article.imageurl[0]} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
                  }}
                />
              )}
              
              <div className="p-4">
                {/* Category Badge */}
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium mb-2">
                  {article.category}
                </span>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                  {article.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {article.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsPage;
