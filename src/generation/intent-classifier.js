/**
 * Intent Classifier
 * Uses IBM Granite to understand what the artist is actually trying to do
 * Extracts move type, line items, and implied needs from natural language descriptions
 */

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const MODEL_VERSION = 'ibm-granite/granite-3.3-8b-instruct';
const MAX_POLL_ATTEMPTS = 60; // 60 attempts * 2 seconds = 2 minutes max
const POLL_INTERVAL_MS = 2000;
const CLASSIFICATION_TIMEOUT_MS = 120000; // 120 seconds timeout (matches generation client)

/**
 * System prompt for intent classification
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert at understanding music industry spending intentions. 
Analyze the artist's description and return ONLY valid JSON with no markdown, no code fences, no preamble.

Your response must be ONLY this JSON structure:
{
  "moveType": "one of: gear_purchase, music_video, paid_ads, pr_publicist, playlist_service, release, content_production, other",
  "lineItems": [{"name": "string", "amount": number, "category": "string"}],
  "summary": "one-sentence restatement of what the artist is trying to do",
  "impliedNeeds": ["short strings describing what the artist is actually trying to achieve"]
}

Rules:
- moveType must be exactly one of the listed options
- Use "other" ONLY as a last resort when none of the specific types fit
- If description implies line items not explicitly stated, infer them from total budget
- lineItems should break down the budget into specific spending categories
- summary should be clear and specific to their situation
- impliedNeeds should capture underlying goals (e.g., "build credibility", "reach new audience", "improve production quality")
- Return ONLY the JSON object, nothing else

Examples:
"I want to buy a studio" → {"moveType": "gear_purchase", ...}
"Need to shoot a music video" → {"moveType": "music_video", ...}
"Want to run Instagram ads" → {"moveType": "paid_ads", ...}
"Hiring a publicist for press coverage" → {"moveType": "pr_publicist", ...}
"Paying for playlist placement" → {"moveType": "playlist_service", ...}
"Releasing my new single" → {"moveType": "release", ...}
"Creating content for TikTok" → {"moveType": "content_production", ...}`;

/**
 * Valid move types
 */
const VALID_MOVE_TYPES = [
  'gear_purchase',
  'music_video',
  'paid_ads',
  'pr_publicist',
  'playlist_service',
  'release',
  'content_production',
  'other'
];

/**
 * Create classification prediction
 */
async function createClassificationPrediction(description, budget, apiToken) {
  const prompt = `Artist's description: "${description}"
Total budget: $${budget}

Analyze this and return the JSON classification.`;

  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=10'
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt: prompt,
        system_prompt: CLASSIFICATION_SYSTEM_PROMPT,
        max_tokens: 500,
        temperature: 0.1, // Very low temperature for deterministic classification
        top_p: 0.9
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
 * Poll prediction until complete
 */
async function pollClassificationPrediction(predictionUrl, apiToken, timeoutMs = CLASSIFICATION_TIMEOUT_MS) {
  let attempts = 0;
  const startTime = Date.now();

  while (attempts < MAX_POLL_ATTEMPTS) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Classification timed out after ${timeoutMs / 1000} seconds`);
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

    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
    }

    if (prediction.status === 'canceled') {
      throw new Error('Prediction was canceled');
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    attempts++;
  }

  throw new Error('Classification timed out after maximum polling attempts');
}

/**
 * Extract and parse JSON from prediction output
 * Handles markdown fences, malformed JSON, and other edge cases
 */
function parseClassificationOutput(output) {
  console.log('🔍 Raw Granite output for classification:', JSON.stringify(output).substring(0, 500));
  
  let text = output;

  // Extract from array if needed
  if (Array.isArray(output)) {
    text = output.join('');
  }

  // Trim whitespace
  text = text.trim();

  // Strip markdown code fences more aggressively
  text = text.replace(/^```json\s*/gi, '').replace(/^```\s*/gi, '');
  text = text.replace(/```\s*$/g, '');
  text = text.trim();

  // Try to find JSON object in the text using regex
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(text);
    console.log('✓ Successfully parsed classification JSON');
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError.message);
    console.error('Failed to parse text:', text.substring(0, 200));
    throw parseError;
  }

  // Validate structure
  if (!parsed.moveType || !parsed.summary) {
    throw new Error('Invalid classification structure: missing required fields');
  }

  // Validate moveType
  if (!VALID_MOVE_TYPES.includes(parsed.moveType)) {
    console.warn(`Invalid moveType "${parsed.moveType}", defaulting to "other"`);
    parsed.moveType = 'other';
  }

  // Ensure arrays exist
  parsed.lineItems = Array.isArray(parsed.lineItems) ? parsed.lineItems : [];
  parsed.impliedNeeds = Array.isArray(parsed.impliedNeeds) ? parsed.impliedNeeds : [];

  return parsed;
}

/**
 * Create neutral fallback classification
 * Used when API fails or returns invalid data
 */
function createFallbackClassification(description, budget, existingLineItems = []) {
  // If user provided line items, use those
  if (existingLineItems && existingLineItems.length > 0) {
    return {
      moveType: 'other',
      lineItems: existingLineItems,
      summary: description || 'Planned spending',
      impliedNeeds: ['Execute planned spending'],
      source: 'fallback',
      reason: 'Using user-provided line items'
    };
  }

  // Otherwise create a single line item from total budget
  return {
    moveType: 'other',
    lineItems: [
      {
        name: 'Planned spending',
        amount: budget,
        category: 'general'
      }
    ],
    summary: description || 'Planned spending',
    impliedNeeds: ['Execute planned spending'],
    source: 'fallback',
    reason: 'Classification unavailable'
  };
}

/**
 * Classify a move based on description and budget
 * Returns structured classification or falls back to neutral classification
 */
export async function classifyMove(description, budget, existingLineItems = [], options = {}) {
  const { forceMock = false } = options;
  const apiToken = process.env.REPLICATE_API_TOKEN;

  // If no description, return fallback immediately
  if (!description || description.trim().length === 0) {
    console.log('ℹ️  No description provided, using fallback classification');
    return createFallbackClassification('No description provided', budget, existingLineItems);
  }

  // If forceMock or no API token, return fallback
  if (forceMock || !apiToken) {
    console.log('ℹ️  Mock mode or no API token, using fallback classification');
    return createFallbackClassification(description, budget, existingLineItems);
  }

  try {
    console.log('🔍 Classifying move intent via Granite...');

    // Create prediction
    const prediction = await createClassificationPrediction(description, budget, apiToken);

    // If completed immediately
    if (prediction.status === 'succeeded') {
      const classification = parseClassificationOutput(prediction.output);
      classification.source = 'granite';
      classification.predictionId = prediction.id;
      console.log('✓ Classification complete:', classification.moveType);
      return classification;
    }

    // Poll until complete
    console.log(`⏳ Classification prediction created (ID: ${prediction.id}), polling...`);
    const completedPrediction = await pollClassificationPrediction(prediction.urls.get, apiToken);

    const classification = parseClassificationOutput(completedPrediction.output);
    classification.source = 'granite';
    classification.predictionId = completedPrediction.id;
    console.log('✓ Classification complete:', classification.moveType);
    return classification;

  } catch (error) {
    // Log error and fall back
    console.error('❌ Classification error:', error.message);
    console.error('Error stack:', error.stack);
    console.log('🔄 Falling back to mock classification due to error');
    return createFallbackClassification(description, budget, existingLineItems);
  }
}

/**
 * Mock classification for testing
 * Provides reasonable defaults based on keywords in description
 */
export function mockClassifyMove(description, budget, existingLineItems = []) {
  const lowerDesc = (description || '').toLowerCase();

  // Detect move type from keywords
  let moveType = 'other';
  if (lowerDesc.includes('studio') || lowerDesc.includes('gear') || lowerDesc.includes('equipment')) {
    moveType = 'gear_purchase';
  } else if (lowerDesc.includes('video') || lowerDesc.includes('music video')) {
    moveType = 'music_video';
  } else if (lowerDesc.includes('ad') || lowerDesc.includes('facebook') || lowerDesc.includes('instagram')) {
    moveType = 'paid_ads';
  } else if (lowerDesc.includes('pr') || lowerDesc.includes('publicist') || lowerDesc.includes('press')) {
    moveType = 'pr_publicist';
  } else if (lowerDesc.includes('playlist') || lowerDesc.includes('curator')) {
    moveType = 'playlist_service';
  } else if (lowerDesc.includes('release') || lowerDesc.includes('distribution') || lowerDesc.includes('launch')) {
    moveType = 'release';
  } else if (lowerDesc.includes('content') || lowerDesc.includes('social') || lowerDesc.includes('tiktok')) {
    moveType = 'content_production';
  }

  // Use existing line items or create default
  const lineItems = existingLineItems && existingLineItems.length > 0
    ? existingLineItems
    : [{ name: 'Planned spending', amount: budget, category: 'general' }];

  return {
    moveType,
    lineItems,
    summary: description || 'Planned spending',
    impliedNeeds: ['Execute planned spending'],
    source: 'mock'
  };
}
