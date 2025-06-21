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

**FIRST**: Filter out gibberish comments that don't provide meaningful value:
- Remove comments that are random character sequences (e.g., "asdfgh", "qwerty123")
- Remove comments with only repeated characters (e.g., "aaaaa", "hahahaha")
- Remove very short comments with no meaningful content (e.g., "lol", "k", "!!!")
- Remove comments that are just emoji spam or symbols
- Remove comments that appear to be keyboard mashing or accidental input
- Keep comments that express genuine opinions, thoughts, or reactions, even if brief

**THEN**: Analyze only the meaningful comments to provide:

1. **Overall Tendency (Sentiment Score)**: Determine the general sentiment of the meaningful discussion as a percentage from 0-100:
   - 0-20: Very Negative (highly critical, hostile, or pessimistic)
   - 21-40: Negative (generally critical or disapproving)
   - 41-60: Neutral/Mixed (balanced or factual without strong emotions)
   - 61-80: Positive (generally supportive or approving)
   - 81-100: Very Positive (highly supportive, optimistic, or constructive)

2. **Highlights Summary**: Provide 3-5 key points that represent the most important themes, opinions, or insights from the meaningful comments.

Format your response as JSON with this exact structure:
{
  "totalComments": 10,
  "meaningfulComments": 7,
  "filteredComments": 3,
  "hasNoValue": false,
  "tendencyScore": 45,
  "tendencyLabel": "Mixed/Neutral",
  "tendencyExplanation": "Brief explanation of why this score was chosen",
  "highlights": [
    "First key point or theme from the meaningful comments",
    "Second key point or theme from the meaningful comments",
    "Third key point or theme from the meaningful comments"
  ]
}

**SPECIAL CASE**: If ALL comments are gibberish or meaningless, return:
{
  "totalComments": 5,
  "meaningfulComments": 0,
  "filteredComments": 5,
  "hasNoValue": true,
  "message": "All comments appear to be gibberish or don't provide meaningful value for analysis."
}

Be strict about filtering gibberish but preserve genuine human expression, even if brief or poorly written.`;

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
      if (typeof analysisResult.totalComments !== 'number' || 
          typeof analysisResult.meaningfulComments !== 'number' ||
          typeof analysisResult.filteredComments !== 'number') {
        throw new Error('Invalid response structure from OpenAI - missing comment counts');
      }

      // For meaningful analysis (hasNoValue is false)
      if (!analysisResult.hasNoValue) {
        if (typeof analysisResult.tendencyScore !== 'number' || !analysisResult.highlights) {
          throw new Error('Invalid response structure from OpenAI - missing analysis data');
        }

        // Ensure tendencyScore is within valid range
        if (analysisResult.tendencyScore < 0 || analysisResult.tendencyScore > 100) {
          analysisResult.tendencyScore = Math.max(0, Math.min(100, analysisResult.tendencyScore));
        }
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