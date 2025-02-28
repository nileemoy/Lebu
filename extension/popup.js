// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        const currentUrl = tabs[0].url;
        
        // Request analysis data for the current URL
        chrome.runtime.sendMessage({ 
          action: "getAnalysis", 
          url: currentUrl 
        }, function(response) {
          updatePopup(response, currentUrl);
        });
      }
    });
    
    // Add listener for the analyze button
    document.addEventListener('click', function(e) {
      if (e.target.id === 'analyze-button') {
        const content = document.getElementById('content');
        content.innerHTML = `
          <div class="loading">
            <div class="spinner"></div>
            <p>Analyzing the current page...</p>
          </div>
        `;
        
        chrome.runtime.sendMessage({ action: "analyzeUrl" });
        
        // Poll for updates every second
        const intervalId = setInterval(function() {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
              chrome.runtime.sendMessage({ 
                action: "getAnalysis", 
                url: tabs[0].url 
              }, function(response) {
                if (response && response.status === 'complete') {
                  clearInterval(intervalId);
                  updatePopup(response, tabs[0].url);
                } else if (response && response.status === 'error') {
                  clearInterval(intervalId);
                  updatePopup(response, tabs[0].url);
                }
              });
            }
          });
        }, 1000);
      }
    });
  });
  
  // Update the popup UI based on analysis response
  function updatePopup(response, url) {
    const content = document.getElementById('content');
    
    if (!response || response.status === 'none') {
      // No analysis yet
      content.innerHTML = `
        <div class="result">
          <div class="result-details">
            <p>No analysis available for this page.</p>
            <button id="analyze-button">Analyze Now</button>
          </div>
        </div>
      `;
      return;
    }
    
    if (response.status === 'analyzing') {
      // Analysis in progress
      content.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <p>Analyzing the current page...</p>
        </div>
      `;
      return;
    }
    
    if (response.status === 'error') {
      // Error occurred
      content.innerHTML = `
        <div class="error">
          <p>Error analyzing this page:</p>
          <p>${response.error || "Unknown error"}</p>
          <button id="analyze-button">Try Again</button>
        </div>
      `;
      return;
    }
    
    // Analysis completed successfully
    let scoreClass = 'score-high';
    let verdict = 'Highly Credible';
    
    if (response.truthScore < 70) {
      scoreClass = 'score-medium';
      verdict = 'Somewhat Credible';
    }
    
    if (response.truthScore < 40) {
      scoreClass = 'score-low';
      verdict = 'Low Credibility';
    }
    
    // Check for explicitly detected misinformation
    if (response.misinformation && response.misinformation.detected) {
      scoreClass = 'score-low';
      verdict = 'Likely Misinformation';
    }
    
    let html = `
      <div class="result">
        <div class="result-header">
          <div class="score ${scoreClass}">${response.truthScore}</div>
          <div>
            <div class="verdict">${verdict}</div>
            <div class="url">${url}</div>
          </div>
        </div>
        <div class="result-details">
          <div class="factors">
    `;
    
    // Add factors
    if (response.factors && response.factors.length > 0) {
      response.factors.forEach(factor => {
        let factorClass = 'factor-bar-high';
        if (factor.score < 70) factorClass = 'factor-bar-medium';
        if (factor.score < 40) factorClass = 'factor-bar-low';
        
        html += `
          <div class="factor">
            <span class="factor-name">${factor.name}: ${factor.score}/100</span>
            <div class="factor-bar-container">
              <div class="factor-bar ${factorClass}" style="width: ${factor.score}%"></div>
            </div>
          </div>
        `;
      });
    }
    
    html += `
          </div>
    `;
    
    // Add summary if available
    if (response.summary) {
      html += `
          <div class="summary">
            <p>${response.summary}</p>
          </div>
      `;
    }
    
    // Add misinformation warning if detected
    if (response.misinformation && response.misinformation.detected) {
      html += `
          <div class="warning">
            <h3>⚠️ Misinformation Detected</h3>
            <p>${response.misinformation.reason}</p>
          </div>
      `;
    }
    
    html += `
          <button id="analyze-button">Analyze Again</button>
        </div>
      </div>
    `;
    
    content.innerHTML = html;
  }