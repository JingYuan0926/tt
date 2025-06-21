import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NewsHeader from '../components/NewsHeader';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import NewspaperLayout from '../components/NewspaperLayout';
import Footer from '../components/Footer';
import newsData from '../data/news.json';

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);

  const categories = ['All', ...new Set(newsData.map(article => article.category))];

  useEffect(() => {
    // Shuffle articles for random placement
    const shuffledArticles = [...newsData].sort(() => Math.random() - 0.5);
    setArticles(shuffledArticles);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white mt-[-30]">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <NewsHeader />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="mb-8"
        >
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          <NewspaperLayout articles={filteredArticles} />
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NewsPage;
