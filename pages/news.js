import React from 'react';
import { motion } from 'framer-motion';
import NewsHeader from '../components/NewsHeader';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    setArticles(newsData.articles);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
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
          <SearchBar />
          <CategoryFilter categories={categories} />
        </motion.div>
      </div>
    </div>
  );
};

export default NewsPage;
