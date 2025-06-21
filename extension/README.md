# News Bias Analyzer Chrome Extension

A Chrome extension that analyzes news articles for bias and generates related sources using AI.

## Features

- 📰 **Article Analysis**: Extract and analyze content from any news webpage
- ⚖️ **Bias Detection**: AI-powered bias analysis with multiple perspectives
- 🔗 **Source Generation**: Automatically generate related credible sources
- 🚀 **One-Click Analysis**: Analyze current page or paste any URL
- 💾 **Smart Caching**: Cache results to avoid redundant API calls

## Setup Instructions

### 1. API Setup (Required)

The extension requires the API endpoint to be running. The API is located at `extension/pages/api/analyze-url.js`.

**For Next.js projects:**
1. Copy the `extension/pages/api/analyze-url.js` file to your Next.js project's `pages/api/` directory
2. Install the required dependencies in your Next.js project:
   ```bash
   npm install openai node-fetch jsdom
   ```
3. Add your OpenAI API key to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start your Next.js development server:
   ```bash
   npm run dev
   ```

**For standalone API:**
You can also run this as a standalone Node.js server. The API endpoint expects to receive POST requests at `/api/analyze-url`.

### 2. Extension Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` folder
4. The extension icon should appear in your Chrome toolbar

### 3. Configuration

If your API is running on a different port or domain, update the `API_BASE_URL` in `popup.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your API URL
```

## Usage

### Method 1: Analyze Current Page
1. Navigate to any news article webpage
2. Click the extension icon in your toolbar
3. Click "🔍 Analyze Current Page"
4. Wait for the analysis to complete

### Method 2: Analyze Custom URL
1. Click the extension icon
2. Paste a news article URL in the input field
3. Click "Analyze Article" or press Enter
4. Wait for the analysis to complete

## Extension Files

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Extension popup interface
- `popup.js` - Main extension logic and API communication
- `content.js` - Content script for page interaction
- `pages/api/analyze-url.js` - API endpoint for analysis

## API Endpoint

### POST `/api/analyze-url`

**Request Body:**
```json
{
  "url": "https://example.com/news-article"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/news-article",
    "title": "Article Title",
    "content": "Article preview...",
    "biasAnalysis": "Detailed bias analysis...",
    "generatedSources": [
      {
        "title": "Related Source Title",
        "url": "https://related-source.com"
      }
    ]
  }
}
```

## Requirements

- Chrome browser (Manifest V3 compatible)
- OpenAI API key
- Node.js server running the API endpoint
- Internet connection for API calls

## Troubleshooting

### Extension not working:
- Ensure the API server is running on the correct port
- Check that the OpenAI API key is properly configured
- Verify the `API_BASE_URL` in `popup.js` matches your server

### API errors:
- Check browser console for detailed error messages
- Verify OpenAI API key has sufficient quota
- Ensure the target URL contains readable article content

### CORS issues:
- The extension uses `chrome.tabs.query` to avoid CORS restrictions
- If you encounter CORS issues, ensure your API server allows requests from `chrome-extension://`

## Privacy & Security

- The extension only analyzes content when explicitly requested
- No personal data is stored or transmitted
- All analysis is performed server-side via OpenAI API
- URLs and analysis results can be cached locally for performance

## Development

To modify the extension:

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon for the extension
4. Test your changes

## License

MIT License - feel free to modify and distribute.

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API server is running and accessible
3. Ensure OpenAI API key is valid and has quota remaining
