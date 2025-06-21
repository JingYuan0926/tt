import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const prompt = `Given this news article, generate 5 relevant and credible sources/links that would provide additional context, background information, or related coverage. 

Article Title: "${title}"
Article Description: "${description}"
Category: "${category}"

Please provide realistic and credible news sources, research papers, government websites, or official organization links that would be relevant to this topic. Format your response as a JSON array of objects with "title" and "url" fields.

Example format:
[
  {
    "title": "WHO Official Statement on Global Health Crisis",
    "url": "https://www.who.int/news/item/2024-health-crisis-statement"
  },
  {
    "title": "Reuters Analysis: Economic Impact of Recent Events",
    "url": "https://www.reuters.com/business/economy/analysis-economic-impact-2024"
  }
]

Make sure the URLs are realistic and follow proper domain structures for credible news sources, academic institutions, government sites, or official organizations. The sources should be directly relevant to the article topic.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful research assistant that finds credible and relevant sources for news articles. Always provide realistic URLs from known credible sources."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const sources = JSON.parse(content);
      
      // Validate the response format
      if (Array.isArray(sources) && sources.every(source => source.title && source.url)) {
        return res.status(200).json({
          success: true,
          sources: sources
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      // If JSON parsing fails, return error
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: content
      });
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate sources'
    });
  }
} 