import OpenAI from 'openai';
import newsData from '../../data/news.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { newsId } = req.body;

  if (!newsId) {
    return res.status(400).json({ error: 'News ID is required' });
  }

  // Find the news article by ID
  const article = newsData.find(item => item.id === newsId);

  if (!article) {
    return res.status(404).json({ error: 'News article not found' });
  }

  try {
    const prompt = `
You are an expert media analyst. Analyze the following news article for bias and provide comprehensive guidance on how to interpret it.

Title: ${article.title}
Description: ${article.description}
Category: ${article.category}

Please provide your analysis in the following format:

BIAS SCORE: [X/10] - Biased towards [side/perspective] because [brief context about why this bias exists]

MULTIPLE PERSPECTIVES:
[Provide a rational explanation of how readers should view this case from different perspectives - consider political, cultural, economic, and social viewpoints]

INTERPRETATION GUIDE:
[Explain how to interpret this news in terms of rationality and completeness - what to look for, what questions to ask, how to verify information, and what additional context might be needed]

Keep your response structured, objective, and educational. Focus on teaching critical thinking rather than pushing any particular viewpoint.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert media literacy educator and bias analyst. Your goal is to help people think critically about news and understand different perspectives objectively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const analysis = completion.choices[0].message.content;

    return res.status(200).json({
      success: true,
      analysis: analysis,
      article: {
        id: article.id,
        title: article.title,
        category: article.category
      }
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze news article',
      message: error.message 
    });
  }
} 