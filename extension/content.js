// content.js
let badgeElement = null;
let detailsPanelElement = null;
let analysisCompleted = false;

// Initialize the extension UI
function initializeUI() {
  // Check if the badge already exists
  if (document.getElementById('truth-detector-badge')) {
    return;
  }
  
  // Create a badge that will show the credibility score
  badgeElement = document.createElement('div');
  badgeElement.id = 'truth-detector-badge';
  badgeElement.className = 'truth-detector-badge truth-detector-analyzing';
  badgeElement.innerHTML = `
    <div class="truth-detector-icon">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" fill="none" />
        <path d="M12 6v8M12 16v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <div class="truth-detector-score">...</div>
  `;
  
  // Add click handler to toggle details
  badgeElement.addEventListener('click', toggleDetails);
  
  // Add badge to the document
  document.body.appendChild(badgeElement);
  
  // Create details panel (hidden by default)
  detailsPanelElement = document.createElement('div');
  detailsPanelElement.id = 'truth-detector-details';
  detailsPanelElement.className = 'truth-detector-details truth-detector-hidden';
  detailsPanelElement.innerHTML = `
    <div class="truth-detector-details-header">
      <h2>Truth Detector Analysis</h2>
      <button class="truth-detector-close-btn">&times;</button>
    </div>
    <div class="truth-detector-details-content">
      <div class="truth-detector-loading">Analyzing this page...</div>
    </div>
  `;
  
  // Add close button handler
  detailsPanelElement.querySelector('.truth-detector-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    detailsPanelElement.classList.add('truth-detector-hidden');
  });
  
  // Add details panel to the document
  document.body.appendChild(detailsPanelElement);
  
  // Check if we already have analysis for this URL
  chrome.runtime.sendMessage({ 
    action: "getAnalysis", 
    url: window.location.href 
  }, handleAnalysisResponse);
  
  // Set up a periodic check for analysis results (in case message handlers fail)
  checkAnalysisStatus();
}

// Periodically check if analysis is complete
function checkAnalysisStatus() {
  if (analysisCompleted) return;
  
  chrome.runtime.sendMessage({ 
    action: "getAnalysis", 
    url: window.location.href 
  }, (response) => {
    if (response && response.status === 'complete') {
      updateUIWithResults(response);
      analysisCompleted = true;
    } else if (response && response.status === 'error') {
      showErrorState(response.error);
      analysisCompleted = true;
    } else {
      // Continue checking every 2 seconds until we get a result
      setTimeout(checkAnalysisStatus, 2000);
    }
  });
}

// Handle different types of messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === "startAnalysis") {
    showAnalyzingState();
  } else if (message.action === "analysisComplete") {
    updateUIWithResults(message.results);
    analysisCompleted = true;
  } else if (message.action === "analysisError") {
    showErrorState(message.error);
    analysisCompleted = true;
  }
  
  // Always send a response to keep the message channel open
  sendResponse({received: true});
  return true;
});

// Show that analysis is in progress
function showAnalyzingState() {
  if (!badgeElement) initializeUI();
  
  badgeElement.className = 'truth-detector-badge truth-detector-analyzing';
  badgeElement.querySelector('.truth-detector-score').textContent = '...';
  
  const detailsContent = document.querySelector('.truth-detector-details-content');
  if (detailsContent) {
    detailsContent.innerHTML = `<div class="truth-detector-loading">Analyzing this page...</div>`;
  }
}

// Handle the analysis response
function handleAnalysisResponse(data) {
  console.log("Received analysis response:", data);
  
  if (!data || data.status === 'none') {
    // No analysis yet, request one
    chrome.runtime.sendMessage({ action: "analyzeUrl" });
  } else if (data.status === 'analyzing') {
    showAnalyzingState();
  } else if (data.status === 'error') {
    showErrorState(data.error);
    analysisCompleted = true;
  } else if (data.status === 'complete') {
    updateUIWithResults(data);
    analysisCompleted = true;
  }
}

// Update the UI with analysis results
function updateUIWithResults(results) {
  if (!badgeElement) initializeUI();
  
  console.log("Updating UI with results:", results);
  
  // Update badge appearance based on truth score
  let scoreClass = 'truth-detector-high';
  if (results.truthScore < 70) {
    scoreClass = 'truth-detector-medium';
  }
  if (results.truthScore < 40) {
    scoreClass = 'truth-detector-low';
  }
  
  // Check for explicitly detected misinformation
  if (results.misinformation && results.misinformation.detected) {
    scoreClass = 'truth-detector-very-low';
  }
  
  // Update badge
  badgeElement.className = `truth-detector-badge ${scoreClass}`;
  badgeElement.querySelector('.truth-detector-score').textContent = results.truthScore;
  
  // Update details panel
  const detailsContent = document.querySelector('.truth-detector-details-content');
  if (!detailsContent) return;
  
  // Format the details HTML
  let detailsHTML = `
    <div class="truth-detector-result-header ${scoreClass}">
      <div class="truth-detector-big-score">${results.truthScore}</div>
      <div class="truth-detector-verdict">
        ${getVerdict(results)}
      </div>
    </div>
    
    <div class="truth-detector-factors">
      <h3>Analysis Factors</h3>
      <ul>
  `;
  
  // Add factors
  if (results.factors && results.factors.length > 0) {
    results.factors.forEach(factor => {
      let factorClass = 'factor-high';
      if (factor.score < 70) factorClass = 'factor-medium';
      if (factor.score < 40) factorClass = 'factor-low';
      
      detailsHTML += `
        <li>
          <span class="factor-name">${factor.name}</span>
          <div class="factor-bar-container">
            <div class="factor-bar ${factorClass}" style="width: ${factor.score}%"></div>
            <span class="factor-score">${factor.score}</span>
          </div>
        </li>
      `;
    });
  } else {
    detailsHTML += `<li>No detailed factors available</li>`;
  }
  
  detailsHTML += `
      </ul>
    </div>
  `;
  
  // Add summary
  if (results.summary) {
    detailsHTML += `
      <div class="truth-detector-summary">
        <h3>Summary</h3>
        <p>${results.summary}</p>
      </div>
    `;
  }
  
  // Add misinformation warning if detected
  if (results.misinformation && results.misinformation.detected) {
    detailsHTML += `
      <div class="truth-detector-warning">
        <h3>⚠️ Misinformation Detected</h3>
        <p>This content contains potential misinformation.</p>
        <p><strong>Reason:</strong> ${results.misinformation.reason}</p>
      </div>
    `;
  }
  
  // Add re-analyze button
  detailsHTML += `
    <button id="truth-detector-reanalyze" class="truth-detector-button">
      Analyze Again
    </button>
  `;
  
  detailsContent.innerHTML = detailsHTML;
  
  // Add event listener for re-analyze button
  const reanalyzeButton = document.getElementById('truth-detector-reanalyze');
  if (reanalyzeButton) {
    reanalyzeButton.addEventListener('click', () => {
      analysisCompleted = false;
      showAnalyzingState();
      chrome.runtime.sendMessage({ action: "analyzeUrl" });
    });
  }
}

// Generate a verdict based on the results
function getVerdict(results) {
  // If misinformation is explicitly detected
  if (results.misinformation && results.misinformation.detected) {
    return "Likely Misinformation";
  }
  
  // Based on truth score
  if (results.truthScore >= 80) {
    return "Highly Credible";
  } else if (results.truthScore >= 60) {
    return "Mostly Credible";
  } else if (results.truthScore >= 40) {
    return "Somewhat Questionable";
  } else {
    return "Low Credibility";
  }
}

// Show error state
function showErrorState(errorMessage) {
  if (!badgeElement) initializeUI();
  
  badgeElement.className = 'truth-detector-badge truth-detector-error';
  badgeElement.querySelector('.truth-detector-score').textContent = '!';
  
  const detailsContent = document.querySelector('.truth-detector-details-content');
  if (!detailsContent) return;
  
  detailsContent.innerHTML = `
    <div class="truth-detector-error-message">
      <h3>Analysis Error</h3>
      <p>${errorMessage || "Failed to analyze this page."}</p>
      <button id="truth-detector-retry" class="truth-detector-button">Try Again</button>
    </div>
  `;
  
  // Add retry button handler
  const retryButton = document.getElementById('truth-detector-retry');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      analysisCompleted = false;
      showAnalyzingState();
      chrome.runtime.sendMessage({ action: "analyzeUrl" });
    });
  }
}

// Toggle the details panel
function toggleDetails(e) {
  e.stopPropagation();
  const detailsPanel = document.getElementById('truth-detector-details');
  if (detailsPanel) {
    detailsPanel.classList.toggle('truth-detector-hidden');
  }
}

// Initialize when the content script loads
document.addEventListener('DOMContentLoaded', initializeUI);

// If the document is already loaded, initialize now
if (document.readyState !== 'loading') {
  initializeUI();
}

// Add additional event listener for possible Shadow DOM issues
window.addEventListener('load', () => {
  setTimeout(initializeUI, 500); // Slight delay to ensure DOM is fully ready
});