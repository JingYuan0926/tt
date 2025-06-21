import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { articleId, comment } = req.body;

    if (!articleId || !comment) {
      return res.status(400).json({ message: 'Article ID and comment are required' });
    }

    // Read the current news.json file
    const filePath = path.join(process.cwd(), 'data', 'news.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const newsData = JSON.parse(fileContents);

    // Find the article and add the comment
    const articleIndex = newsData.findIndex(article => article.id === articleId);
    
    if (articleIndex === -1) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Add the comment to the article
    if (!newsData[articleIndex].comments) {
      newsData[articleIndex].comments = [];
    }
    
    newsData[articleIndex].comments.push(comment);

    // Write back to the file
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));

    res.status(200).json({ message: 'Comment saved successfully' });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 