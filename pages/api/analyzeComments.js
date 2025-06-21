import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { comments } = req.body;

    // Validate input
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ 
        message: 'Comments array is required and must not be empty' 
      });
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.' 
      });
    }

    // Create system prompt for comment analysis
    const systemPrompt = `You are an expert comment analyzer for news articles. Your task is to analyze a collection of comments and provide:

1. **Overall Tendency (Sentiment)**: Determine the general sentiment of the discussion. Choose from:
   - Positive: Generally supportive, optimistic, or constructive
   - Negative: Generally critical, pessimistic, or hostile
   - Mixed: Balanced mix of positive and negative sentiments
   - Neutral: Mostly factual or informational without strong emotions

2. **Highlights Summary**: Provide 3-5 key points that represent the most important themes, opinions, or insights from the comments. Focus on:
   - Most frequently mentioned topics
   - Representative viewpoints from different perspectives
   - Notable insights or unique perspectives
   - Key concerns or praise mentioned

Format your response as JSON with this exact structure:
{
  "tendency": "Positive/Negative/Mixed/Neutral",
  "tendencyExplanation": "Brief explanation of why this tendency was chosen",
  "highlights": [
    "First key point or theme from the comments",
    "Second key point or theme from the comments",
    "Third key point or theme from the comments"
  ]
}

Be objective, concise, and focus on the most significant patterns in the discussion.`;

    // Prepare comments for analysis
    const commentsText = comments.map((comment, index) => 
      `Comment ${index + 1}: ${comment}`
    ).join('\n\n');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please analyze these comments:\n\n${commentsText}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedText);
      
      // Validate response structure
      if (!analysisResult.tendency || !analysisResult.highlights) {
        throw new Error('Invalid response structure from OpenAI');
      }

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw OpenAI response:', responseText);
      
      return res.status(500).json({ 
        message: 'Error parsing AI response. Please try again.',
        error: parseError.message,
        rawResponse: responseText
      });
    }

    // Return successful analysis
    res.status(200).json({
      success: true,
      analysis: analysisResult,
      message: 'Comments analyzed successfully'
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        message: 'OpenAI API quota exceeded. Please check your usage limits.' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        message: 'Invalid OpenAI API key. Please check your configuration.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error analyzing comments with OpenAI API',
      error: error.message 
    });
  }
}

// Configure API route for handling requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}; 