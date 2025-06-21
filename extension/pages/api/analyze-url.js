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
  const prompt = `Given this news article, generate 5 relevant and credible sources/links that would provide additional context, background information, or related coverage. 

Article Title: "${title}"
Article Content: "${content.substring(0, 1000)}..." 

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
    model: "gpt-4o-mini",
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

  const content_response = completion.choices[0].message.content;
  
  try {
    return JSON.parse(content_response);
  } catch (parseError) {
    // If JSON parsing fails, return a fallback response
    return [
      {
        title: "Unable to generate sources automatically",
        url: "#"
      }
    ];
  }
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