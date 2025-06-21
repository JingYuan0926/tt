import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {categories.map((category, index) => (
        <motion.button
          key={category}
          className={`px-6 py-2 text-sm font-medium border transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedCategory(category)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter; 