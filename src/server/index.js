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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

/**
 * POST /api/assess
 * Evaluate a planned move (engine only, no generation)
 */
app.post('/api/assess', async (req, res) => {
  try {
    const { profile, move } = req.body;
    
    // Validate input
    if (!profile || !move) {
      return res.status(400).json({
        error: 'Missing required fields: profile and move'
      });
    }
    
    // Ensure profile has stage calculated
    if (!profile.stage) {
      profile.stage = calculateStage(profile.metrics.monthlyListeners);
    }
    
    // Run evaluation (engine only, instant)
    const assessment = evaluateMove(profile, move);
    
    // Return assessment without generated outputs
    res.json({
      success: true,
      assessment,
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
 * Generate creative output for a single rule
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { redirectAction, profile, move, forceMock = false } = req.body;
    
    // Validate input
    if (!redirectAction || !profile || !move) {
      return res.status(400).json({
        error: 'Missing required fields: redirectAction, profile, and move'
      });
    }
    
    // Generate creative output
    const generationResult = await generateCreativeOutput(
      redirectAction,
      profile,
      move,
      { forceMock }
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

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Sideline server running on port ${PORT}`);
  console.log(`📊 Open http://localhost:${PORT} to use the web interface`);
  console.log(`🤖 Replicate API: ${process.env.REPLICATE_API_TOKEN ? 'Connected' : 'Not configured (using mock)'}`);
  
  // Warmup Granite in background (don't block)
  warmupGranite();
});
