import OpenAI from 'openai';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract text content from URL
async function extractContentFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Try to get title
    const title = document.querySelector('title')?.textContent?.trim() || 
                 document.querySelector('h1')?.textContent?.trim() || 
                 'No title found';
    
    // Try to get article content from common selectors
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.story-body',
      '.article-body'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.textContent?.trim();
        if (content && content.length > 100) break;
      }
    }
    
    // Fallback: get all paragraph text
    if (!content || content.length < 100) {
      const paragraphs = document.querySelectorAll('p');
      content = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 20)
        .join(' ');
    }
    
    // Clean up the content
    content = content.replace(/\s+/g, ' ').trim();
    
    // Limit content length for API efficiency
    if (content.length > 4000) {
      content = content.substring(0, 4000) + '...';
    }
    
    return {
      title: title.substring(0, 200), // Limit title length
      content: content,
      url: url
    };
    
  } catch (error) {
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
}

// Function to analyze bias
async function analyzeBias(title, content) {
  const prompt = `
You are an expert media analyst. Analyze the following news article for bias and provide comprehensive guidance on how to interpret it.

Title: ${title}
Content: ${content}

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

  return completion.choices[0].message.content;
}

// Function to generate sources
async function generateSources(title, content) {
  const prompt = `Given this news article, generate 5 relevant and credible sources that would provide additional context, background information, or related coverage. 

Article Title: "${title}"
Article Content: "${content.substring(0, 1000)}..." 

Provide realistic and credible news sources, research papers, government websites, or official organization links that would be relevant to this topic. 

Respond with ONLY a valid JSON array in this exact format (no additional text or formatting):
[
  {
    "title": "Source Title Here",
    "url": "https://example.com/link"
  },
  {
    "title": "Another Source Title",
    "url": "https://example2.com/link"
  }
]

Make sure the URLs are realistic and follow proper domain structures for credible sources like BBC, Reuters, CNN, Associated Press, government sites (.gov), academic institutions (.edu), or international organizations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Respond only with valid JSON arrays. No explanations or additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3, // Lower temperature for more consistent formatting
    });

    const content_response = completion.choices[0].message.content.trim();
    
    // Try to extract JSON from the response if it has extra text
    let jsonMatch = content_response.match(/\[[\s\S]*\]/);
    let jsonString = jsonMatch ? jsonMatch[0] : content_response;
    
    // Clean up common formatting issues
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedSources = JSON.parse(jsonString);
    
    // Validate the structure
    if (Array.isArray(parsedSources) && parsedSources.length > 0) {
      // Filter out invalid entries and limit to 5
      const validSources = parsedSources
        .filter(source => source.title && source.url && source.url !== '#')
        .slice(0, 5);
      
      if (validSources.length > 0) {
        return validSources;
      }
    }
    
    // If parsing succeeded but structure is invalid, fall back to manual sources
    throw new Error('Invalid source structure');
    
  } catch (parseError) {
    console.warn('Source generation failed, using fallback sources:', parseError.message);
    
    // Return topic-relevant fallback sources based on content analysis
    const fallbackSources = generateFallbackSources(title, content);
    return fallbackSources;
  }
}

// Generate fallback sources based on content analysis
function generateFallbackSources(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Default credible news sources
  const sources = [];
  
  // Add BBC for international news
  if (contentLower.includes('international') || contentLower.includes('world') || contentLower.includes('global')) {
    sources.push({
      title: "BBC World News - Global Coverage",
      url: "https://www.bbc.com/news/world"
    });
  }
  
  // Add Reuters for business/economic news
  if (contentLower.includes('business') || contentLower.includes('economic') || contentLower.includes('market')) {
    sources.push({
      title: "Reuters Business News",
      url: "https://www.reuters.com/business/"
    });
  }
  
  // Add AP News for general coverage
  sources.push({
    title: "Associated Press News",
    url: "https://apnews.com/"
  });
  
  // Add CNN for US/international coverage
  sources.push({
    title: "CNN International News",
    url: "https://edition.cnn.com/"
  });
  
  // Add Al Jazeera for Middle East coverage
  if (contentLower.includes('middle east') || contentLower.includes('israel') || contentLower.includes('iran') || contentLower.includes('gaza')) {
    sources.push({
      title: "Al Jazeera Middle East Coverage",
      url: "https://www.aljazeera.com/news/"
    });
  } else {
    // Add NPR for in-depth analysis
    sources.push({
      title: "NPR News Analysis",
      url: "https://www.npr.org/news/"
    });
  }
  
  // Add Guardian for additional perspective
  if (sources.length < 5) {
    sources.push({
      title: "The Guardian World News",
      url: "https://www.theguardian.com/world"
    });
  }
  
  return sources.slice(0, 5);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file.' 
      });
    }

    // Extract content from URL
    const extractedContent = await extractContentFromUrl(url);

    if (!extractedContent.content || extractedContent.content.length < 50) {
      return res.status(400).json({ 
        error: 'Could not extract sufficient content from the provided URL. Please ensure the URL contains readable article content.' 
      });
    }

    // Run bias analysis and source generation in parallel
    const [biasAnalysis, generatedSources] = await Promise.all([
      analyzeBias(extractedContent.title, extractedContent.content),
      generateSources(extractedContent.title, extractedContent.content)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        url: url,
        title: extractedContent.title,
        content: extractedContent.content.substring(0, 500) + '...', // Return first 500 chars for preview
        biasAnalysis: biasAnalysis,
        generatedSources: generatedSources
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your usage limits.' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your configuration.' 
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to analyze URL',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 