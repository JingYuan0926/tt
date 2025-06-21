// Content script for News Bias Analyzer extension
console.log('News Bias Analyzer content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractPageContent') {
        try {
            const pageContent = extractPageContent();
            sendResponse({ success: true, data: pageContent });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
});

// Extract content from the current page
function extractPageContent() {
    const title = document.title || document.querySelector('h1')?.textContent?.trim() || 'No title found';
    
    const contentSelectors = [
        'article', '[role="main"]', '.content', '.article-content', 
        '.post-content', '.entry-content', 'main', '.story-body', '.article-body'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            content = element.textContent?.trim();
            if (content && content.length > 100) break;
        }
    }
    
    if (!content || content.length < 100) {
        const paragraphs = document.querySelectorAll('p');
        content = Array.from(paragraphs)
            .map(p => p.textContent?.trim())
            .filter(text => text && text.length > 20)
            .join(' ');
    }
    
    content = content.replace(/\s+/g, ' ').trim();
    
    return {
        title: title.substring(0, 200),
        content: content.substring(0, 4000),
        url: window.location.href,
        domain: window.location.hostname
    };
}

// Detect if the current page looks like a news article
function detectNewsArticle() {
    const indicators = [
        // Check for news-related meta tags
        document.querySelector('meta[property="og:type"][content="article"]'),
        document.querySelector('meta[name="article:author"]'),
        document.querySelector('meta[name="article:published_time"]'),
        document.querySelector('meta[property="article:published_time"]'),
        
        // Check for news-related structured data
        document.querySelector('script[type="application/ld+json"]')?.textContent?.includes('"@type":"NewsArticle"'),
        
        // Check for common news article selectors
        document.querySelector('time[datetime]'),
        document.querySelector('.byline'),
        document.querySelector('.author'),
        document.querySelector('.publish-date'),
        document.querySelector('.article-date'),
        
        // Check URL patterns
        /\/(news|article|story|post)\//.test(window.location.pathname),
        
        // Check for news domains (simplified)
        /\b(news|times|post|herald|tribune|journal|gazette|reporter|press|media)\b/.test(window.location.hostname)
    ];
    
    return indicators.filter(Boolean).length >= 2;
}

// Add visual indicator when extension is active (optional)
function addExtensionIndicator() {
    if (document.getElementById('news-analyzer-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'news-analyzer-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        opacity: 0.9;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    indicator.innerHTML = '📰 Analyzer Ready';
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 3000);
}

// Initialize content script
function init() {
    // Only show indicator on what looks like news articles
    if (detectNewsArticle()) {
        addExtensionIndicator();
    }
    
    // Listen for page changes (for SPAs)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            if (detectNewsArticle()) {
                addExtensionIndicator();
            }
        }
    }).observe(document.body, { childList: true, subtree: true });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractPageContent,
        detectNewsArticle
    };
}