/**
 * Sideline Web Server
 * Express server serving static frontend and assessment API
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateMove } from '../engine/evaluator.js';
import { calculateStage } from '../engine/stage-calculator.js';
import { generateCreativeOutput } from '../generation/granite-client.js';
import { classifyMove } from '../generation/intent-classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting for /api/generate (in-memory, 20 requests per IP per hour)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 20;

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check rate limit
  const record = rateLimitStore.get(ip);
  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now });
    return next();
  }
  
  if (now - record.resetTime > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, resetTime: now });
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Maximum 20 generation requests per hour. Please try again later.'
    });
  }
  
  record.count++;
  next();
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

/**
 * POST /api/assess
 * Evaluate a planned move (engine only, no generation)
 */
app.post('/api/assess', async (req, res) => {
  try {
    const { profile, move, forceMock = false } = req.body;
    
    // Validate input
    if (!profile || !move) {
      return res.status(400).json({
        error: 'Missing required fields: profile and move'
      });
    }
    
    // Wait for warmup to complete before classification (prevents cold model timeout)
    if (!forceMock && process.env.REPLICATE_API_TOKEN) {
      await getWarmupPromise();
    }
    
    // Ensure profile has stage calculated
    // If monthlyListeners is 0 or very low, treat as stage-only mode
    const listeners = profile.metrics.monthlyListeners || 0;
    const isStageOnlyMode = listeners === 0 || !profile.metrics.monthlyListeners;
    
    if (!profile.stage) {
      // If no listeners provided, infer stage from other context or default to bedroom
      if (isStageOnlyMode) {
        profile.stage = 'bedroom'; // Will be overridden by frontend stage selection
      } else {
        profile.stage = calculateStage(listeners);
      }
    }
    
    // Mark profile as stage-only mode for rules to use
    profile.stageOnlyMode = isStageOnlyMode;
    
    // Classify the move intent FIRST
    const classification = await classifyMove(
      move.description || '',
      move.budget || 0,
      move.lineItems || [],
      { forceMock }
    );
    
    // Classification lineItems REPLACE form lineItems (classification is source of truth)
    let finalLineItems = classification.lineItems.length > 0 ? classification.lineItems : (move.lineItems || []);
    
    // CRITICAL: If no line items exist, create a default one from total budget
    // This ensures budget cap rules can still evaluate the spend
    if (finalLineItems.length === 0 && move.budget > 0) {
      finalLineItems = [{
        name: move.description || 'Planned spending',
        amount: move.budget,
        category: 'general'
      }];
      console.log('⚠️  No line items provided, created default line item from total budget');
    }
    
    const enrichedMove = {
      ...move,
      type: move.type || 'spend',
      moveType: classification.moveType,
      lineItems: finalLineItems,
      classification: {
        summary: classification.summary,
        impliedNeeds: classification.impliedNeeds,
        source: classification.source
      }
    };
    
    // Run evaluation (engine only, instant)
    const assessment = evaluateMove(profile, enrichedMove);
    
    // Return assessment with classification
    res.json({
      success: true,
      assessment,
      classification: {
        moveType: classification.moveType,
        summary: classification.summary,
        impliedNeeds: classification.impliedNeeds,
        source: classification.source
      },
      profile: {
        stage: profile.stage,
        name: profile.name,
        monthlyListeners: profile.metrics.monthlyListeners
      }
    });
    
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate
 * Generate creative output for a single rule (rate limited)
 */
app.post('/api/generate', rateLimitMiddleware, async (req, res) => {
  try {
    const { redirectAction, profile, move, classification, forceMock = false } = req.body;
    
    // Validate input
    if (!redirectAction || !profile || !move) {
      return res.status(400).json({
        error: 'Missing required fields: redirectAction, profile, and move'
      });
    }
    
    // Generate creative output with classification context
    const generationResult = await generateCreativeOutput(
      redirectAction,
      profile,
      move,
      { forceMock, classification }
    );
    
    res.json({
      success: true,
      output: generationResult
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasReplicateToken: !!process.env.REPLICATE_API_TOKEN
  });
});

/**
 * GET /api/warmup-status
 * Check if Granite model warmup is complete
 */
app.get('/api/warmup-status', async (req, res) => {
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.json({
      isWarm: true,
      usingMock: true
    });
  }
  
  // Check if warmup promise exists and is settled
  const isWarm = warmupPromise !== null;
  
  res.json({
    isWarm,
    usingMock: false
  });
});

// Warmup promise - resolves when Granite model is warm
let warmupPromise = null;

// Warmup Granite model (background, non-blocking)
async function warmupGranite() {
  if (!process.env.REPLICATE_API_TOKEN) {
    return;
  }
  
  console.log('🔥 Warming Granite model...');
  
  try {
    // Fire a trivial prediction to warm the model
    const dummyRedirectAction = {
      prompt: 'Test',
      outputFormat: 'budget_breakdown',
      constraints: { maxBudget: 100 }
    };
    
    const dummyProfile = {
      stage: 'bedroom',
      metrics: { monthlyListeners: 100 },
      budget: { totalAvailable: 500 },
      audienceCapture: { hasEmailList: false }
    };
    
    const dummyMove = {
      type: 'spend',
      budget: 100
    };
    
    await generateCreativeOutput(dummyRedirectAction, dummyProfile, dummyMove, { forceMock: false });
    console.log('✓ Granite warm');
  } catch (error) {
    console.log('⚠️  Granite warmup failed (will use mock):', error.message);
  }
}

// Get warmup promise (creates it if needed)
function getWarmupPromise() {
  if (!warmupPromise) {
    warmupPromise = warmupGranite();
  }
  return warmupPromise;
}

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Sideline server running on port ${PORT}`);
  console.log(`📊 Open http://localhost:${PORT} to use the web interface`);
  console.log(`🤖 Replicate API: ${process.env.REPLICATE_API_TOKEN ? 'Connected' : 'Not configured (using mock)'}`);
  
  // Warmup Granite in background (don't block)
  warmupGranite();
});
