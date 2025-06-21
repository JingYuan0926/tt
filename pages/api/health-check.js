import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Gemini API key not configured',
        configured: false
      });
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Test with a simple prompt
    const result = await model.generateContent('Say "Hello" if you can read this message.');
    const response = await result.response;
    const text = response.text();

    // Check if we got a valid response
    if (text && text.toLowerCase().includes('hello')) {
      return res.status(200).json({ 
        status: 'success',
        message: 'Gemini API is working correctly',
        configured: true,
        testResponse: text.trim()
      });
    } else {
      return res.status(500).json({ 
        status: 'error',
        message: 'Gemini API responded but with unexpected content',
        configured: true,
        testResponse: text
      });
    }

  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({ 
      status: 'error',
      message: 'Gemini API health check failed',
      configured: true,
      error: error.message
    });
  }
} 