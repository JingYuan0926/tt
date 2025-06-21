import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ 
        message: 'Missing required fields: imageData and mimeType' 
      });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.' 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ 
        message: 'Unsupported file type. Please upload JPEG, PNG, or PDF files only.' 
      });
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the prompt for IC document parsing
    const prompt = `
      Analyze this Malaysian IC (Identity Card) document and extract the following information in JSON format:
      
      {
        "icNumber": "IC number (format: 123456-78-9012)",
        "fullName": "Full name as shown on the IC",
        "address": "Address from the IC",
        "postCode": "Postal code",
        "city": "City name",
        "state": "State name",
        "country": "Country (usually Malaysia)",
        "citizenship": "Citizenship (usually Malaysian)",
        "gender": "Gender (Male/Female)"
      }
      
      Rules:
      1. Extract exact text as shown on the document
      2. For missing information, use empty string ""
      3. For gender, determine from the IC number's last digit (odd=Male, even=Female)
      4. Return only valid JSON format
      5. If this is not a Malaysian IC document, return an error message
    `;

    // Prepare the image data for Gemini
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
        mimeType: mimeType
      }
    };

    // Generate content with the image and prompt
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let parsedData;
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanedText);
      
      // Validate that we have the expected structure
      if (!parsedData.icNumber && !parsedData.fullName) {
        throw new Error('Invalid IC document or unable to extract data');
      }
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', text);
      
      return res.status(400).json({ 
        message: 'Unable to parse IC document. Please ensure the image is clear and contains a valid Malaysian IC.',
        error: parseError.message,
        rawResponse: text
      });
    }

    // Return the parsed data
    res.status(200).json({
      success: true,
      data: parsedData,
      message: 'IC document parsed successfully'
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle specific Gemini API errors
    if (error.message.includes('API_KEY')) {
      return res.status(500).json({ 
        message: 'API configuration error. Please check your Gemini API key.' 
      });
    }
    
    if (error.message.includes('SAFETY')) {
      return res.status(400).json({ 
        message: 'Document content was flagged by safety filters. Please try with a different image.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error processing document with Gemini API',
      error: error.message 
    });
  }
}

// Configure the API route to handle larger payloads (for images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
} 