#!/usr/bin/env node
/**
 * CLI Assessment Tool
 * Demonstrates rule engine evaluation with formatted output
 */

import { evaluateMove, getAssessmentSummary } from '../engine/evaluator.js';
import { calculateStage } from '../engine/stage-calculator.js';
import { generateCreativeOutput } from '../generation/granite-client.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

/**
 * Format text with color
 */
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Print section header
 */
function printHeader(text) {
  console.log('\n' + colorize('═'.repeat(80), colors.cyan));
  console.log(colorize(`  ${text}`, colors.bright + colors.cyan));
  console.log(colorize('═'.repeat(80), colors.cyan));
}

/**
 * Print subsection header
 */
function printSubheader(text) {
  console.log('\n' + colorize(`▸ ${text}`, colors.bright + colors.blue));
  console.log(colorize('─'.repeat(80), colors.dim));
}

/**
 * Print decision badge
 */
function printDecision(decision) {
  let badge, color;
  
  switch (decision) {
    case 'blocked':
      badge = ' BLOCKED ';
      color = colors.bgRed + colors.bright + colors.white;
      break;
    case 'advisory':
      badge = ' ADVISORY ';
      color = colors.bgYellow + colors.bright + colors.white;
      break;
    case 'approved':
      badge = ' CLEAR ';
      color = colors.bgGreen + colors.bright + colors.white;
      break;
    default:
      badge = ` ${decision.toUpperCase()} `;
      color = colors.bgBlue + colors.bright + colors.white;
  }
  
  console.log('\n' + colorize(badge, color));
}

/**
 * Print creator profile summary
 */
function printProfile(profile) {
  printSubheader('Creator Profile');
  console.log(colorize('Name:', colors.bright), profile.name);
  console.log(colorize('Stage:', colors.bright), colorize(profile.stage.toUpperCase(), colors.magenta));
  console.log(colorize('Monthly Listeners:', colors.bright), profile.metrics.monthlyListeners.toLocaleString());
  console.log(colorize('Budget Available:', colors.bright), `$${profile.budget.totalAvailable.toLocaleString()}`);
  
  const hasCapture = profile.audienceCapture.hasEmailList || profile.audienceCapture.hasWhatsApp;
  const captureStatus = hasCapture ? 
    colorize('✓ Yes', colors.green) : 
    colorize('✗ No', colors.red);
  console.log(colorize('Audience Capture:', colors.bright), captureStatus);
  
  if (profile.audienceCapture.hasEmailList) {
    console.log(colorize('  Email List:', colors.dim), `${profile.audienceCapture.emailListSize} subscribers`);
  }
  if (profile.audienceCapture.hasWhatsApp) {
    console.log(colorize('  WhatsApp List:', colors.dim), `${profile.audienceCapture.whatsappListSize} subscribers`);
  }
}

/**
 * Print planned move summary
 */
function printMove(move) {
  printSubheader('Planned Move');
  console.log(colorize('Type:', colors.bright), move.type.toUpperCase());
  console.log(colorize('Description:', colors.bright), move.description);
  console.log(colorize('Total Budget:', colors.bright), colorize(`$${move.budget.toLocaleString()}`, colors.yellow));
  
  if (move.lineItems && move.lineItems.length > 0) {
    console.log(colorize('\nLine Items:', colors.bright));
    move.lineItems.forEach(item => {
      const amount = colorize(`$${item.amount.toLocaleString()}`, colors.yellow);
      console.log(`  • ${item.name}: ${amount}`);
      if (item.duration) {
        console.log(colorize(`    Duration: ${item.duration}`, colors.dim));
      }
    });
  }
  
  if (move.releaseDetails) {
    console.log(colorize('\nRelease Details:', colors.bright));
    console.log(`  Format: ${move.releaseDetails.format}`);
    console.log(`  Tracks: ${move.releaseDetails.trackCount}`);
    console.log(`  Release Date: ${move.releaseDetails.releaseDate}`);
    if (move.releaseDetails.lastReleaseDate) {
      console.log(`  Last Release: ${move.releaseDetails.lastReleaseDate}`);
    }
  }
  
  if (move.promoDetails) {
    console.log(colorize('\nPromo Details:', colors.bright));
    console.log(`  Channels: ${move.promoDetails.channels.join(', ')}`);
    console.log(`  Duration: ${move.promoDetails.duration}`);
  }
}

/**
 * Print assessment summary
 */
function printAssessmentSummary(assessment) {
  const summary = getAssessmentSummary(assessment);
  
  printSubheader('Assessment Summary');
  console.log(colorize('Stage:', colors.bright), colorize(summary.stage.toUpperCase(), colors.magenta));
  console.log(colorize('Decision:', colors.bright), summary.decision.toUpperCase());
  console.log(colorize('Rules Triggered:', colors.bright), summary.totalRulesTriggered);
  console.log(colorize('  Blocking:', colors.bright), colorize(summary.blockingRules.toString(), colors.red));
  console.log(colorize('  Advisory:', colors.bright), colorize(summary.advisoryRules.toString(), colors.yellow));
  
  if (summary.totalRulesTriggered > 0) {
    console.log(colorize('\nBy Category:', colors.bright));
    if (summary.categories.budget > 0) {
      console.log(`  Budget: ${summary.categories.budget}`);
    }
    if (summary.categories.release > 0) {
      console.log(`  Release: ${summary.categories.release}`);
    }
    if (summary.categories.promo > 0) {
      console.log(`  Promo: ${summary.categories.promo}`);
    }
  }
}

/**
 * Print triggered rule details
 */
function printTriggeredRule(rule, index, total) {
  const severityColor = rule.severity === 'block' ? colors.red : colors.yellow;
  const severityBadge = rule.severity === 'block' ? '🚫 BLOCK' : '⚠️  ADVISORY';
  
  console.log('\n' + colorize('─'.repeat(80), colors.dim));
  console.log(colorize(`Rule ${index + 1} of ${total}`, colors.dim));
  console.log(colorize(severityBadge, severityColor + colors.bright));
  console.log(colorize(`Category: ${rule.category.toUpperCase()}`, colors.bright));
  console.log(colorize(`Rule ID: ${rule.ruleId}`, colors.dim));
  
  // Block reason
  console.log('\n' + colorize('REASON:', colors.bright + colors.white));
  console.log(colorize('─'.repeat(80), colors.dim));
  
  // Split reason into paragraphs and format
  const paragraphs = rule.reason.split('\n\n');
  paragraphs.forEach((para, i) => {
    if (para.trim()) {
      // Highlight "Arithmetic:" and "Heuristic:" sections
      if (para.includes('Arithmetic:')) {
        console.log(colorize(para, colors.cyan));
      } else if (para.includes('Heuristic') || para.includes('Advisory')) {
        console.log(colorize(para, colors.blue));
      } else {
        console.log(para);
      }
      if (i < paragraphs.length - 1) {
        console.log('');
      }
    }
  });
  
  // Redirect action
  console.log('\n' + colorize('REDIRECT ACTION:', colors.bright + colors.green));
  console.log(colorize('─'.repeat(80), colors.dim));
  console.log(colorize('Type:', colors.bright), rule.redirectAction.type);
  console.log(colorize('Output Format:', colors.bright), rule.redirectAction.outputFormat);
  
  console.log(colorize('\nPrompt:', colors.bright));
  console.log(colorize(rule.redirectAction.prompt, colors.dim));
  
  console.log(colorize('\nConstraints:', colors.bright));
  const constraints = rule.redirectAction.constraints;
  Object.entries(constraints).forEach(([key, value]) => {
    console.log(`  ${key}: ${colorize(JSON.stringify(value), colors.yellow)}`);
  });
}

/**
 * Print generated creative output
 */
async function printCreativeOutput(rule, profile, move) {
  console.log('\n' + colorize('═'.repeat(80), colors.green));
  console.log(colorize('  HERE\'S WHAT TO DO INSTEAD', colors.bright + colors.green));
  console.log(colorize('═'.repeat(80), colors.green));
  
  // Generate creative output
  const result = await generateCreativeOutput(rule.redirectAction, profile, move);
  
  if (result.success) {
    // Show source indicator
    const sourceIndicator = result.source === 'granite' 
      ? colorize('  [Generated by Granite AI]', colors.dim + colors.green)
      : colorize('  [Mock Generator - Set REPLICATE_API_TOKEN for AI generation]', colors.dim + colors.yellow);
    console.log(sourceIndicator);
    console.log('');
    
    // Print the output
    console.log(result.output);
    
    // Show metadata
    console.log('\n' + colorize('─'.repeat(80), colors.dim));
    console.log(colorize(`Generated at: ${result.timestamp}`, colors.dim));
    if (result.predictionId) {
      console.log(colorize(`Prediction ID: ${result.predictionId}`, colors.dim));
    }
  } else {
    console.log(colorize('❌ Failed to generate creative output:', colors.red));
    console.log(colorize(result.error, colors.red));
  }
  
  console.log(colorize('═'.repeat(80), colors.green));
}

/**
 * Run assessment and print results
 */
export async function runAssessment(profile, move, options = {}) {
  const { verbose = true } = options;
  
  // Ensure profile has stage calculated
  if (!profile.stage) {
    profile.stage = calculateStage(profile.metrics.monthlyListeners);
  }
  
  // Print header
  printHeader('SIDELINE ASSESSMENT');
  
  // Print inputs
  if (verbose) {
    printProfile(profile);
    printMove(move);
  }
  
  // Run evaluation
  printSubheader('Evaluating...');
  const assessment = evaluateMove(profile, move);
  
  // Print decision
  printDecision(assessment.overallDecision);
  
  // Print summary
  printAssessmentSummary(assessment);
  
  // Print triggered rules
  if (assessment.triggeredRules.length > 0) {
    printHeader('TRIGGERED RULES');
    
    for (let index = 0; index < assessment.triggeredRules.length; index++) {
      const rule = assessment.triggeredRules[index];
      printTriggeredRule(rule, index, assessment.triggeredRules.length);
      
      // Generate and print creative output for blocking rules
      if (rule.severity === 'block') {
        await printCreativeOutput(rule, profile, move);
      }
    }
  } else {
    console.log('\n' + colorize('✓ No rules triggered. Move is approved!', colors.green + colors.bright));
  }
  
  // Print footer
  console.log('\n' + colorize('═'.repeat(80), colors.cyan));
  console.log(colorize(`  Assessment completed at ${new Date().toISOString()}`, colors.dim));
  console.log(colorize('═'.repeat(80), colors.cyan) + '\n');
  
  return assessment;
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(colorize('Usage: node assess.js <scenario>', colors.yellow));
    console.log('\nAvailable scenarios:');
    console.log('  bedroom-video       - Bedroom artist with expensive video');
    console.log('  bedroom-line-item   - Bedroom artist with over-budget line item');
    console.log('  local-video         - Local artist with expensive video');
    console.log('  regional-pr         - Regional artist with short PR retainer');
    console.log('  breaking-high       - Breaking artist with high budget');
    console.log('  album-low-listeners - Album release with low listeners');
    console.log('  release-no-capture  - Release without audience capture');
    console.log('  release-too-soon    - Release spaced too soon');
    console.log('  bedroom-paid-ads    - Bedroom artist with paid ads');
    console.log('  local-ads-no-capture - Local artist ads without capture');
    console.log('  bedroom-playlist    - Bedroom artist with playlist service');
    console.log('  local-publicist     - Local artist hiring publicist');
    process.exit(1);
  }
  
  const scenario = args[0];
  
  // Dynamic import of fixtures
  import('../../tests/fixtures/sample-profiles.js').then(async (fixtures) => {
    let profile, move;
    
    switch (scenario) {
      case 'bedroom-video':
        profile = fixtures.bedroomArtist;
        move = fixtures.bedroomExpensiveVideo;
        break;
      case 'bedroom-line-item':
        profile = fixtures.bedroomArtist;
        move = fixtures.bedroomOverBudgetLineItem;
        break;
      case 'local-video':
        profile = fixtures.localArtist;
        move = fixtures.localExpensiveVideo;
        break;
      case 'regional-pr':
        profile = fixtures.regionalArtist;
        move = fixtures.regionalShortPR;
        break;
      case 'breaking-high':
        profile = fixtures.breakingArtist;
        move = fixtures.breakingHighBudget;
        break;
      case 'album-low-listeners':
        profile = fixtures.bedroomArtist;
        move = fixtures.albumReleaseLowListeners;
        break;
      case 'release-no-capture':
        profile = fixtures.bedroomArtist;
        move = fixtures.singleReleaseNoCapture;
        break;
      case 'release-too-soon':
        profile = fixtures.bedroomArtist;
        move = fixtures.singleReleaseTooSoon;
        break;
      case 'bedroom-paid-ads':
        profile = fixtures.bedroomArtist;
        move = fixtures.bedroomPaidAds;
        break;
      case 'local-ads-no-capture':
        profile = fixtures.localArtistNoCapture;
        move = fixtures.localPaidAdsNoCapture;
        break;
      case 'bedroom-playlist':
        profile = fixtures.bedroomArtist;
        move = fixtures.bedroomPlaylistService;
        break;
      case 'local-publicist':
        profile = fixtures.localArtist;
        move = fixtures.localPublicist;
        break;
      default:
        console.log(colorize(`Unknown scenario: ${scenario}`, colors.red));
        process.exit(1);
    }
    
    await runAssessment(profile, move);
  }).catch(error => {
    console.error(colorize('Error loading fixtures:', colors.red), error.message);
    process.exit(1);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
