// Extension popup functionality
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your deployed URL in production

// DOM elements
const analyzeCurrentPageBtn = document.getElementById('analyzeCurrentPage');
const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const articleTitle = document.getElementById('articleTitle');
const articlePreview = document.getElementById('articlePreview');
const biasAnalysis = document.getElementById('biasAnalysis');
const sourcesList = document.getElementById('sourcesList');

// Event listeners
analyzeCurrentPageBtn.addEventListener('click', analyzeCurrentPage);
analyzeBtn.addEventListener('click', analyzeCustomUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeCustomUrl();
    }
});

// Initialize extension
document.addEventListener('DOMContentLoaded', () => {
    // Get current tab URL and populate input field
    getCurrentTabUrl();
});

// Get current tab URL
async function getCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && !tab.url.startsWith('chrome://')) {
            urlInput.value = tab.url;
        }
    } catch (error) {
        console.warn('Could not get current tab URL:', error);
    }
}

// Analyze current page
async function analyzeCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
            showError('Cannot analyze this page. Please navigate to a news article.');
            return;
        }
        
        await analyzeUrl(tab.url);
    } catch (error) {
        showError('Failed to get current page URL: ' + error.message);
    }
}

// Analyze custom URL
async function analyzeCustomUrl() {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Please enter a URL to analyze');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    await analyzeUrl(url);
}

// Main analysis function
async function analyzeUrl(url) {
    showLoading();
    hideError();
    hideResults();
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        if (data.success && data.data) {
            displayResults(data.data);
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Handle specific error types
        if (error.message.includes('fetch')) {
            showError('Cannot connect to analysis service. Please ensure the server is running on localhost:3000');
        } else if (error.message.includes('OpenAI')) {
            showError('AI analysis service unavailable: ' + error.message);
        } else {
            showError('Analysis failed: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// Display analysis results
function displayResults(data) {
    // Update article info
    articleTitle.textContent = data.title || 'No title available';
    articlePreview.textContent = data.content || 'No content preview available';
    
    // Update bias analysis
    biasAnalysis.textContent = data.biasAnalysis || 'No bias analysis available';
    
    // Update sources list
    sourcesList.innerHTML = '';
    if (data.generatedSources && Array.isArray(data.generatedSources)) {
        data.generatedSources.forEach(source => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = source.url;
            a.textContent = source.title;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            sourcesList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No sources available';
        sourcesList.appendChild(li);
    }
    
    showResults();
}

// UI state management functions
function showLoading() {
    loadingDiv.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeCurrentPageBtn.disabled = true;
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
    analyzeBtn.disabled = false;
    analyzeCurrentPageBtn.disabled = false;
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showResults() {
    resultsDiv.classList.remove('hidden');
}

function hideResults() {
    resultsDiv.classList.add('hidden');
}

// Utility functions
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Handle extension errors
window.addEventListener('error', (event) => {
    console.error('Extension error:', event.error);
    showError('An unexpected error occurred. Please try again.');
});

// Storage functions for caching results
async function saveResult(url, data) {
    try {
        const key = `analysis_${btoa(url)}`;
        await chrome.storage.local.set({ [key]: { data, timestamp: Date.now() } });
    } catch (error) {
        console.warn('Could not save result to storage:', error);
    }
}

async function loadCachedResult(url) {
    try {
        const key = `analysis_${btoa(url)}`;
        const result = await chrome.storage.local.get(key);
        
        if (result[key]) {
            const { data, timestamp } = result[key];
            // Cache expires after 1 hour
            if (Date.now() - timestamp < 3600000) {
                return data;
            }
        }
    } catch (error) {
        console.warn('Could not load cached result:', error);
    }
    return null;
} 