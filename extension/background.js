// background.js
const API_ENDPOINT = 'http://localhost:8080/api/analyze/url';
const DEBUG = true;

// Helper function for logging when in debug mode
function debugLog(...args) {
  if (DEBUG) {
    console.log('[Truth Detector]', ...args);
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run analysis when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url && 
      !tab.url.startsWith('chrome://') && 
      !tab.url.startsWith('edge://') && 
      !tab.url.startsWith('about:')) {
    
    debugLog('Tab updated, starting analysis:', tab.url);
    
    // Mark the analysis as in progress
    chrome.storage.local.set({ [tab.url]: { status: 'analyzing' } });
    
    // Send a message to the content script to update UI
    chrome.tabs.sendMessage(tabId, { 
      action: "startAnalysis",
      timestamp: Date.now() // Add timestamp to make message unique
    }, (response) => {
      // Check for any error in sending the message
      if (chrome.runtime.lastError) {
        debugLog('Error sending message to content script:', chrome.runtime.lastError);
        // Content script might not be loaded yet, try again after a short delay
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { 
            action: "startAnalysis",
            timestamp: Date.now()
          });
        }, 1000);
      } else {
        debugLog('Message sent successfully:', response);
      }
    });
    
    // Analyze the URL
    analyzeUrl(tab.url, tabId);
  }
});

// Listen for messages from the popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog('Received message:', request);
  
  if (request.action === "analyzeUrl") {
    // Get the active tab and analyze it
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        debugLog('Analyzing URL from request:', tabs[0].url);
        analyzeUrl(tabs[0].url, tabs[0].id);
        sendResponse({ status: "analyzing" });
      }
    });
    return true; // Required for async sendResponse
  }
  
  if (request.action === "getAnalysis") {
    // Fetch the analysis from storage
    chrome.storage.local.get([request.url], function(data) {
      debugLog('Retrieved analysis from storage:', data[request.url]);
      sendResponse(data[request.url] || { status: "none" });
    });
    return true; // Required for async sendResponse
  }
});

// Function to analyze a URL
async function analyzeUrl(url, tabId) {
  try {
    debugLog('Starting URL analysis:', url);
    
    // Check if we already have a cached result
    const cachedData = await chrome.storage.local.get([url]);
    
    // If we have a recent result (less than 1 hour old), use it
    if (cachedData[url] && 
        cachedData[url].status === 'complete' && 
        cachedData[url].timestamp > Date.now() - 3600000) {
      
      debugLog('Using cached analysis results');
      
      // Send the cached results to the content script
      sendResultsToTab(tabId, cachedData[url]);
      
      return;
    }
    
    debugLog('Making API request to:', API_ENDPOINT);
    
    // Make API request to the backend
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    debugLog('Received API response:', data);
    
    // Add status and timestamp
    const results = {
      ...data,
      status: 'complete',
      timestamp: Date.now()
    };
    
    // Store results in local storage
    chrome.storage.local.set({ [url]: results });
    
    // Send results to the content script
    sendResultsToTab(tabId, results);
    
  } catch (error) {
    debugLog('Error analyzing URL:', error);
    
    // Store the error
    const errorData = { 
      status: 'error', 
      error: error.message,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({ [url]: errorData });
    
    // Send error to the content script
    sendResultsToTab(tabId, errorData, true);
  }
}

// Helper function to send results to tab with retry logic
function sendResultsToTab(tabId, results, isError = false) {
  const action = isError ? "analysisError" : "analysisComplete";
  const message = isError ? 
    { action, error: results.error, timestamp: Date.now() } : 
    { action, results, timestamp: Date.now() };
  
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      debugLog('Error sending results to content script:', chrome.runtime.lastError);
      
      // Try again after a short delay
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message);
      }, 1000);
    } else {
      debugLog('Results sent successfully to tab:', tabId);
    }
  });
}

// Initialize when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed or updated');
});