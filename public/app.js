/**
 * Sideline Web UI JavaScript
 * Handles form interaction and assessment display
 */

// Add line item
function addLineItem() {
  const container = document.getElementById('lineItems');
  const lineItem = document.createElement('div');
  lineItem.className = 'line-item';
  lineItem.innerHTML = `
    <input type="text" class="line-item-name" placeholder="Item name" />
    <input type="number" class="line-item-amount" placeholder="Amount" />
    <button type="button" class="btn-remove" onclick="removeLineItem(this)">×</button>
  `;
  container.appendChild(lineItem);
}

// Remove line item
function removeLineItem(button) {
  button.parentElement.remove();
}

// Collect form data
function collectFormData() {
  const artistName = document.getElementById('artistName').value;
  const monthlyListeners = parseInt(document.getElementById('monthlyListeners').value) || 0;
  const budgetAvailable = parseInt(document.getElementById('budgetAvailable').value) || 0;
  const hasEmailList = document.getElementById('hasEmailList').checked;
  const hasWhatsApp = document.getElementById('hasWhatsApp').checked;
  const moveDescription = document.getElementById('moveDescription').value;
  const totalBudget = parseInt(document.getElementById('totalBudget').value) || 0;
  const forceMock = document.getElementById('forceMock').checked;
  
  // Collect line items
  const lineItemElements = document.querySelectorAll('.line-item');
  const lineItems = Array.from(lineItemElements).map(el => {
    const name = el.querySelector('.line-item-name').value;
    const amount = parseInt(el.querySelector('.line-item-amount').value) || 0;
    return { name, amount };
  }).filter(item => item.name && item.amount > 0);
  
  const profile = {
    name: artistName,
    metrics: {
      monthlyListeners,
      followers: {
        instagram: 0,
        tiktok: 0,
        spotify: monthlyListeners
      },
      engagementRate: 0
    },
    audienceCapture: {
      hasEmailList,
      emailListSize: hasEmailList ? 100 : 0,
      hasWhatsApp,
      whatsappListSize: hasWhatsApp ? 50 : 0
    },
    budget: {
      totalAvailable: budgetAvailable,
      currency: 'USD'
    }
  };
  
  const move = {
    type: 'spend',
    description: moveDescription,
    budget: totalBudget,
    lineItems
  };
  
  return { profile, move, forceMock };
}

// Format reason text with arithmetic highlighting
function formatReason(reason) {
  const paragraphs = reason.split('\n\n');
  let html = '';
  
  for (const para of paragraphs) {
    if (para.trim()) {
      if (para.includes('Arithmetic:') || para.includes('arithmetic')) {
        html += `<div class="arithmetic-block">${escapeHtml(para)}</div>`;
      } else {
        html += `<p>${escapeHtml(para)}</p>`;
      }
    }
  }
  
  return html;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Display assessment results (without generated outputs)
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  const { assessment, profile } = data;
  
  let html = '';
  
  // Stage badge
  html += `<div class="stage-badge">${profile.stage} Stage</div>`;
  
  // Verdict
  const verdictClass = assessment.overallDecision === 'blocked' ? 'blocked' : 
                       assessment.overallDecision === 'advisory' ? 'advisory' : 'approved';
  const verdictText = assessment.overallDecision === 'blocked' ? 'Blocked' :
                      assessment.overallDecision === 'advisory' ? 'Advisory' : 'Clear';
  
  html += `<div class="verdict ${verdictClass}">${verdictText}</div>`;
  
  // Summary
  html += '<div class="summary">';
  html += `<div class="summary-item">
    <span class="summary-label">Rules Triggered</span>
    <span class="summary-value">${assessment.triggeredRules.length}</span>
  </div>`;
  
  const blockingRules = assessment.triggeredRules.filter(r => r.severity === 'block').length;
  const advisoryRules = assessment.triggeredRules.filter(r => r.severity === 'advisory').length;
  
  if (blockingRules > 0) {
    html += `<div class="summary-item">
      <span class="summary-label">Blocking</span>
      <span class="summary-value">${blockingRules}</span>
    </div>`;
  }
  
  if (advisoryRules > 0) {
    html += `<div class="summary-item">
      <span class="summary-label">Advisory</span>
      <span class="summary-value">${advisoryRules}</span>
    </div>`;
  }
  
  html += '</div>';
  
  // Triggered rules
  if (assessment.triggeredRules.length > 0) {
    for (let i = 0; i < assessment.triggeredRules.length; i++) {
      const rule = assessment.triggeredRules[i];
      
      html += `<div class="rule" id="rule-${i}">`;
      
      // Rule header
      html += '<div class="rule-header">';
      html += `<span class="rule-badge ${rule.severity}">${rule.severity === 'block' ? '🚫 Block' : '⚠️ Advisory'}</span>`;
      html += `<span class="rule-category">${rule.category}</span>`;
      html += '</div>';
      
      // Rule reason
      html += '<div class="rule-reason">';
      html += formatReason(rule.reason);
      html += '</div>';
      
      // Placeholder for generated output (will be filled by generateOutput)
      if (rule.severity === 'block' && rule.redirectAction) {
        html += `<div class="redirect-section" id="redirect-${i}">`;
        html += '<div class="redirect-header">Here\'s What to Do Instead</div>';
        html += '<div class="generating-state"><div class="spinner"></div><p>Generating creative alternative...</p></div>';
        html += '</div>';
      }
      
      html += '</div>';
    }
  } else {
    html += '<p style="color: var(--success); font-size: 1.25rem; margin-top: 2rem;">✓ No rules triggered. Move is approved!</p>';
  }
  
  resultsDiv.innerHTML = html;
  
  return assessment;
}

// Generate creative output for a single rule
async function generateOutput(ruleIndex, rule, profile, move, forceMock) {
  const redirectDiv = document.getElementById(`redirect-${ruleIndex}`);
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        redirectAction: rule.redirectAction,
        profile,
        move,
        forceMock
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.output) {
      const output = data.output;
      let html = '';
      
      // Source badge
      if (output.source === 'granite') {
        html += '<div class="source-badge granite">Generated by IBM Granite 3.3-8B via Replicate</div>';
        if (output.predictionId) {
          html += `<div style="color: var(--text-dim); font-size: 0.75rem; margin-bottom: 1rem;">Prediction ID: ${output.predictionId}</div>`;
        }
      } else {
        html += '<div class="source-badge mock">MOCK OUTPUT — no API token / API unavailable</div>';
      }
      
      // Output content
      html += `<div class="generated-output">${escapeHtml(output.output)}</div>`;
      
      // Replace generating state with actual output
      redirectDiv.innerHTML = '<div class="redirect-header">Here\'s What to Do Instead</div>' + html;
    } else {
      throw new Error(data.error || 'Generation failed');
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    redirectDiv.innerHTML = `
      <div class="redirect-header">Here's What to Do Instead</div>
      <div class="error-message">Failed to generate creative output: ${escapeHtml(error.message)}</div>
    `;
  }
}

// Run assessment
async function runAssessment() {
  const resultsDiv = document.getElementById('results');
  const button = document.querySelector('.btn-primary');
  
  // Disable button
  button.disabled = true;
  button.textContent = 'Assessing...';
  
  // Show loading state
  resultsDiv.innerHTML = `
    <div class="results-loading">
      <div class="spinner"></div>
      <p>Evaluating your move...</p>
    </div>
  `;
  
  try {
    const formData = collectFormData();
    
    // Step 1: Run assessment (instant, no generation)
    const response = await fetch('/api/assess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile: formData.profile,
        move: formData.move
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Assessment failed');
    }
    
    // Step 2: Display results immediately (verdict + reasons)
    const assessment = displayResults(data);
    
    // Step 3: Generate creative outputs for each blocking rule (one at a time)
    const blockingRules = assessment.triggeredRules.filter(r => r.severity === 'block' && r.redirectAction);
    
    for (let i = 0; i < assessment.triggeredRules.length; i++) {
      const rule = assessment.triggeredRules[i];
      if (rule.severity === 'block' && rule.redirectAction) {
        await generateOutput(i, rule, formData.profile, formData.move, formData.forceMock);
      }
    }
    
  } catch (error) {
    console.error('Assessment error:', error);
    resultsDiv.innerHTML = `
      <div class="error-message">
        <strong>Error:</strong> ${escapeHtml(error.message)}
      </div>
    `;
  } finally {
    // Re-enable button
    button.disabled = false;
    button.textContent = 'Assess Move';
  }
}

// Calculate stage from monthly listeners
function calculateStage(monthlyListeners) {
  if (monthlyListeners < 500) return 'BEDROOM';
  if (monthlyListeners < 5000) return 'RISING';
  if (monthlyListeners < 25000) return 'ESTABLISHED';
  return 'BREAKOUT';
}

// Update stage indicator
function updateStageIndicator() {
  const monthlyListeners = parseInt(document.getElementById('monthlyListeners').value) || 0;
  const indicator = document.getElementById('stageIndicator');
  
  if (monthlyListeners > 0) {
    const stage = calculateStage(monthlyListeners);
    indicator.textContent = `${stage} Stage`;
    indicator.classList.add('visible');
  } else {
    indicator.classList.remove('visible');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Sideline web UI loaded');
  updateStageIndicator();
});
