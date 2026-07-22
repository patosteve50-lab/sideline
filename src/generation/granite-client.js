/**
 * Granite Client
 * Integrates with IBM Granite 3.3 8B Instruct via Replicate API
 * Falls back to mock generator when API is unavailable
 */

import { generateCreativeOutput as generateMock } from './mock-generator.js';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const MODEL_VERSION = 'ibm-granite/granite-3.3-8b-instruct';
const MAX_POLL_ATTEMPTS = 60; // 60 attempts * 2 seconds = 2 minutes max
const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds
const GENERATION_TIMEOUT_MS = 120000; // 120 seconds timeout

/**
 * System message establishing the voice
 */
const SYSTEM_MESSAGE = `You are an experienced music industry advisor who has just blocked a spending decision. Your role is to redirect the artist toward a better creative path.

Voice and tone:
- Direct and practical, no hype or fluff
- Speak from experience, not theory
- Focus on what works at their current stage
- Acknowledge constraints as creative advantages
- Provide specific, actionable guidance
- Use concrete numbers and examples
- Be encouraging but realistic

Your response should:
1. Acknowledge why the original plan was blocked
2. Present a better alternative that respects their constraints
3. Explain why this alternative works better at their stage
4. Include specific tactics and expected outcomes
5. Build confidence in the recommended approach

Remember: You're not just saying "no"—you're showing them the smarter path forward.`;

/**
 * Compose prompt with constraints injected
 */
function composePrompt(redirectAction, profile, move) {
  const basePrompt = typeof redirectAction.prompt === 'function'
    ? redirectAction.prompt(profile, move)
    : redirectAction.prompt;
  
  const constraints = redirectAction.constraints || {};
  
  // Build constraints section
  const constraintsList = Object.entries(constraints)
    .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
    .join('\n');
  
  // Compose full prompt
  return `${basePrompt}

CONSTRAINTS TO RESPECT:
${constraintsList}

ARTIST CONTEXT:
- Stage: ${profile.stage}
- Monthly Listeners: ${profile.metrics.monthlyListeners.toLocaleString()}
- Budget Available: $${profile.budget.totalAvailable.toLocaleString()}
- Has Email List: ${profile.audienceCapture.hasEmailList ? 'Yes' : 'No'}
${profile.audienceCapture.hasEmailList ? `- Email Subscribers: ${profile.audienceCapture.emailListSize}` : ''}

OUTPUT FORMAT: ${redirectAction.outputFormat}

Provide detailed, actionable guidance that respects these constraints and fits their current stage.`;
}

/**
 * Create prediction via Replicate API
 */
async function createPrediction(prompt, apiToken) {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=10' // Wait up to 10 seconds for immediate response
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt: prompt,
        system_prompt: SYSTEM_MESSAGE,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error (${response.status}): ${error}`);
  }
  
  return await response.json();
}

/**
 * Poll prediction status until complete with timeout
 */
async function pollPrediction(predictionUrl, apiToken, timeoutMs = GENERATION_TIMEOUT_MS) {
  let attempts = 0;
  const startTime = Date.now();
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Prediction timed out after ${timeoutMs / 1000} seconds`);
    }
    
    const response = await fetch(predictionUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to poll prediction: ${response.status}`);
    }
    
    const prediction = await response.json();
    
    // Check status
    if (prediction.status === 'succeeded') {
      return prediction;
    }
    
    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    }
    
    if (prediction.status === 'canceled') {
      throw new Error('Prediction was canceled');
    }
    
    // Still processing, wait and retry
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    attempts++;
  }
  
  throw new Error('Prediction timed out after maximum polling attempts');
}

/**
 * Extract output from prediction result
 */
function extractOutput(prediction) {
  // Replicate returns output as array of strings or single string
  if (Array.isArray(prediction.output)) {
    return prediction.output.join('');
  }
  
  if (typeof prediction.output === 'string') {
    return prediction.output;
  }
  
  throw new Error('Unexpected output format from Replicate');
}

/**
 * Generate creative output using Granite via Replicate
 * Falls back to mock generator on any error
 */
export async function generateCreativeOutput(redirectAction, profile, move, options = {}) {
  const { forceMock = false } = options;
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  // If forceMock flag is set, use mock immediately
  if (forceMock) {
    console.log('ℹ️  Mock mode forced (--mock flag), using mock generator');
    return await generateMock(redirectAction, profile, move);
  }
  
  // If no API token, use mock immediately
  if (!apiToken) {
    console.log('ℹ️  No REPLICATE_API_TOKEN found, using mock generator');
    return await generateMock(redirectAction, profile, move);
  }
  
  try {
    // Compose prompt with constraints
    const prompt = composePrompt(redirectAction, profile, move);
    
    console.log('🤖 Generating creative output via Granite (Replicate API)...');
    
    // Create prediction
    const prediction = await createPrediction(prompt, apiToken);
    
    // If prediction completed immediately (status: succeeded)
    if (prediction.status === 'succeeded') {
      const output = extractOutput(prediction);
      return {
        success: true,
        output,
        source: 'granite',
        timestamp: new Date().toISOString(),
        predictionId: prediction.id
      };
    }
    
    // Otherwise, poll until complete (with 120s timeout)
    console.log(`⏳ Prediction created (ID: ${prediction.id}), polling for completion...`);
    const completedPrediction = await pollPrediction(prediction.urls.get, apiToken, GENERATION_TIMEOUT_MS);
    
    const output = extractOutput(completedPrediction);
    
    return {
      success: true,
      output,
      source: 'granite',
      timestamp: new Date().toISOString(),
      predictionId: completedPrediction.id
    };
    
  } catch (error) {
    // Log error and fall back to mock
    console.error('❌ Granite API error:', error.message);
    console.log('🔄 Falling back to mock generator...');
    
    return await generateMock(redirectAction, profile, move);
  }
}

/**
 * Test connection to Replicate API
 */
export async function testConnection() {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    return {
      success: false,
      error: 'REPLICATE_API_TOKEN not set',
      willUseMock: true
    };
  }
  
  try {
    // Simple test: try to create a minimal prediction
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          prompt: 'Test',
          max_tokens: 10
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    return {
      success: true,
      message: 'Replicate API connection successful',
      willUseMock: false
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      willUseMock: true
    };
  }
}
