import React from 'react';

const NewsHeader = () => {
  return (
    <div className="text-center border-b-4 border-gray-900 pb-6 mb-8 mt-12 animate-in slide-in-from-top duration-700">
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">THE DAILY HERALD</h1>
      <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
        <span>EST. 2024</span>
        <span>•</span>
        <span>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span>•</span>
        <span>DIGITAL EDITION</span>
      </div>
    </div>
  );
};

export default NewsHeader; 