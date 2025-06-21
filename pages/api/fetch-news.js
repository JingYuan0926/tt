import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { max = 10, country = 'my', lang = 'en' } = req.body;
    
    // Your GNews API key
    const API_KEY = process.env.GNEWS_API_KEY;
    
    // Fetch news from GNews API
    const gnewsUrl = `https://gnews.io/api/v4/top-headlines?lang=${lang}&country=${country}&max=${max}&apikey=${API_KEY}`;
    
    const response = await fetch(gnewsUrl);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return res.status(200).json({ message: 'No articles found', added: 0 });
    }

    // Read existing news data
    const filePath = path.join(process.cwd(), 'data', 'news.json');
    let newsData = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      newsData = JSON.parse(fileContent);
    }

    // Get existing article URLs to avoid duplicates
    const existingUrls = new Set(newsData.flatMap(item => item.link || []));

    // Transform GNews articles to our format
    const newArticles = [];
    const sizes = ['s', 'm', 'l'];
    
    for (const article of data.articles) {
      // Skip if article URL already exists
      if (existingUrls.has(article.url)) {
        continue;
      }

      // Generate unique ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const id = `gnews_${random}_${timestamp}`;

      // Randomly assign size
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

      // Create news item in our format
      const newsItem = {
        id: id,
        title: article.title,
        date: article.publishedAt || new Date().toISOString(),
        description: article.description || article.content?.substring(0, 300) + '...' || 'No description available',
        category: 'General', // As requested, set all to General for now
        imageurl: article.image ? [article.image] : [],
        link: [article.url],
        comments: [],
        verification_status: false, // Default to false for fetched news
        size: randomSize,
        ai_score: Math.random() * 0.3 + 0.5, // Random score between 0.5-0.8
        challenge: false,
        challenge_id: null
      };

      newArticles.push(newsItem);
      existingUrls.add(article.url); // Add to set to avoid duplicates within this batch
    }

    if (newArticles.length === 0) {
      return res.status(200).json({ message: 'No new articles to add (all were duplicates)', added: 0 });
    }

    // Add new articles to existing data
    newsData.push(...newArticles);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));

    res.status(200).json({ 
      message: `Successfully fetched and added ${newArticles.length} news articles`,
      added: newArticles.length,
      total: newsData.length,
      articles: newArticles.map(article => ({
        id: article.id,
        title: article.title,
        size: article.size
      }))
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
} 