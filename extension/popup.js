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
const biasMeter = document.getElementById('biasMeter');
const biasAnalysis = document.getElementById('biasAnalysis');
const structuredContent = document.getElementById('structuredContent');
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

// Extract bias score from analysis text
function extractBiasScore(analysisText) {
    if (!analysisText) return null;
    const match = analysisText.match(/BIAS SCORE:\s*(\d+)\/10/i);
    return match ? parseInt(match[1]) : null;
}

// Extract bias direction from analysis text
function extractBiasDirection(analysisText) {
    if (!analysisText) return null;
    const lowerText = analysisText.toLowerCase();
    
    if (lowerText.includes('biased towards') && lowerText.includes('government')) {
        return 'Government Perspective';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('opposition')) {
        return 'Opposition Perspective';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('left')) {
        return 'Left-leaning';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('right')) {
        return 'Right-leaning';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('conservative')) {
        return 'Conservative';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('liberal')) {
        return 'Liberal';
    }
    return 'Detected Bias';
}

// Remove bias score line from analysis text for display
function getDisplayAnalysis(analysisText) {
    if (!analysisText) return '';
    // Remove the bias score line (e.g., "**BIAS SCORE: 6/10** - ")
    return analysisText.replace(/\*\*BIAS SCORE:\s*\d+\/10\*\*\s*-\s*/i, '').trim();
}

// Separate bias analysis from structured content
function separateContent(analysisText) {
    if (!analysisText) return { biasText: '', structuredContent: '' };
    
    const cleanText = getDisplayAnalysis(analysisText);
    
    // Find where structured content starts (looking for **MULTIPLE PERSPECTIVES:** or similar)
    const structuredMatch = cleanText.match(/(\*\*MULTIPLE PERSPECTIVES:\*\*.*)/s);
    
    if (structuredMatch) {
        const biasText = cleanText.substring(0, structuredMatch.index).trim();
        const structuredContent = structuredMatch[1];
        return { biasText, structuredContent };
    }
    
    return { biasText: cleanText, structuredContent: '' };
}

// Create bias meter HTML
function createBiasMeter(score) {
    if (score === null) return '';

    const getScoreClass = (score) => {
        if (score <= 3) return 'score-low';
        if (score <= 6) return 'score-moderate';
        return 'score-high';
    };

    const getMeterClass = (position, score) => {
        if (position <= score) {
            if (score <= 3) return 'active-low';
            if (score <= 6) return 'active-moderate';
            return 'active-high';
        }
        return '';
    };

    let meterSegments = '';
    for (let i = 1; i <= 10; i++) {
        meterSegments += `<div class="meter-segment ${getMeterClass(i, score)}"></div>`;
    }

    let scaleNumbers = '';
    for (let i = 0; i <= 10; i++) {
        scaleNumbers += `<span>${i}</span>`;
    }

    return `
        <div class="bias-score-header">
            <span class="bias-score-title">Bias Score</span>
            <span class="bias-score-value ${getScoreClass(score)}">${score}/10</span>
        </div>
        
        <div class="meter-container">
            <div class="meter-labels">
                <span style="color: #059669;">Not Biased</span>
                <span style="color: #dc2626;">Biased</span>
            </div>
            
            <div class="meter-bar">
                ${meterSegments}
            </div>
            
            <div class="meter-scale">
                ${scaleNumbers}
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #10b981;"></div>
                <span style="color: #64748b;">Low Bias (0-3)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f59e0b;"></div>
                <span style="color: #64748b;">Moderate Bias (4-6)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ef4444;"></div>
                <span style="color: #64748b;">High Bias (7-10)</span>
            </div>
        </div>
    `;
}

// Process markdown-like content for structured display
function processStructuredContent(content) {
    if (!content) return '';
    
    // Convert markdown-like formatting to HTML
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.*)$/, '<p>$1</p>');
}

// Display analysis results
function displayResults(data) {
    // Update article info
    articleTitle.textContent = data.title || 'No title available';
    articlePreview.textContent = data.content || 'No content preview available';
    
    // Process bias analysis
    const analysisText = data.biasAnalysis || 'No bias analysis available';
    const biasScore = extractBiasScore(analysisText);
    const { biasText, structuredContent: structuredText } = separateContent(analysisText);
    
    // Update bias meter
    if (biasScore !== null) {
        biasMeter.innerHTML = createBiasMeter(biasScore);
        biasMeter.style.display = 'block';
    } else {
        biasMeter.style.display = 'none';
    }
    
    // Update bias analysis text
    biasAnalysis.textContent = biasText || analysisText;
    
    // Update structured content
    if (structuredText) {
        structuredContent.innerHTML = `
            <h4>Detailed Analysis</h4>
            <div>${processStructuredContent(structuredText)}</div>
        `;
        structuredContent.classList.remove('hidden');
    } else {
        structuredContent.classList.add('hidden');
    }
    
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
        li.innerHTML = '<span style="color: #64748b; font-style: italic;">No sources available</span>';
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
        if (result[key] && Date.now() - result[key].timestamp < 300000) { // 5 minutes cache
            return result[key].data;
        }
    } catch (error) {
        console.warn('Could not load cached result:', error);
    }
    return null;
} 