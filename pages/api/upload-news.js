import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const newsItem = req.body;

    // Validate required fields
    if (!newsItem.title || !newsItem.description || !newsItem.size) {
      return res.status(400).json({ message: 'Missing required fields: title, description, or size' });
    }

    // Validate size
    if (!['s', 'm', 'l', 'xl'].includes(newsItem.size)) {
      return res.status(400).json({ message: 'Invalid size. Must be s, m, l, or xl' });
    }

    // Read existing news data
    const filePath = path.join(process.cwd(), 'data', 'news.json');
    let newsData = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      newsData = JSON.parse(fileContent);
    }

    // If it's a challenge, validate that the challenge_id exists
    if (newsItem.challenge && newsItem.challenge_id) {
      const originalNewsExists = newsData.some(item => item.id === newsItem.challenge_id);
      if (!originalNewsExists) {
        return res.status(400).json({ message: 'Challenge ID does not exist in the news database' });
      }
    }

    // Add the new news item
    newsData.push(newsItem);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));

    res.status(200).json({ message: 'News uploaded successfully', id: newsItem.id });
  } catch (error) {
    console.error('Error uploading news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 