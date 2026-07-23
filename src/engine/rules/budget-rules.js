/**
 * Budget Rules
 * Rules governing budget allocation and spending limits by stage
 */

import { STAGES } from '../stage-calculator.js';
import { SEVERITY, CATEGORY, OUTPUT_FORMAT } from './rule-types.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';

/**
 * Bedroom Stage: Hard cap $150 per release
 */
export const bedroomTotalBudgetCap = {
  id: 'budget-bedroom-total-cap',
  stage: STAGES.BEDROOM,
  category: CATEGORY.BUDGET,
  priority: 1,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.BEDROOM && move.budget > 150;
  },
  
  blockReason: (profile, move) => {
    const overage = move.budget - 150;
    const listeners = profile.metrics.monthlyListeners;
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode (no listener count provided) or zero/low listener case
    if (stageOnlyMode) {
      const releaseCount = Math.floor(move.budget / 150);
      return `At Bedroom stage, the hard budget cap is $150 per release. ` +
             `Your planned spend of ${formatCurrency(move.budget)} exceeds this by ${formatCurrency(overage)}.\n\n` +
             `At this stage, the constraint isn't reach—it's existence. You're building an audience from zero. ` +
             `The same ${formatCurrency(move.budget)} could fund ${releaseCount} separate releases at $150 each, ` +
             `giving you ${releaseCount} chances to find what resonates, ${releaseCount} catalog entries for discovery, ` +
             `and ${releaseCount} opportunities to learn what works.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need volume and iteration, not single expensive bets. ` +
             `Multiple low-cost releases build catalog depth and provide data on what connects.`;
    }
    
    const costPerListener = (move.budget / listeners).toFixed(2);
    const capCostPerListener = (150 / listeners).toFixed(2);
    const percentageIncrease = Math.min(9999, ((overage / 0.01) / listeners * 100).toFixed(0));
    
    return `At Bedroom stage (${listeners} monthly listeners), ` +
           `the hard budget cap is $150 per release. Your planned spend of ${formatCurrency(move.budget)} ` +
           `exceeds this by ${formatCurrency(overage)}.\n\n` +
           `Arithmetic: You're spending $${costPerListener} per existing monthly listener. ` +
           `At the $150 cap, that's $${capCostPerListener} per listener. ` +
           `To break even on the extra ${formatCurrency(overage)}, you'd need to convert ` +
           `${Math.ceil(overage / 0.01)} new listeners at a typical per-stream value (~$0.01)—` +
           `a ${percentageIncrease}% audience increase.\n\n` +
           `Heuristic (industry pattern): Bedroom artists rarely see returns that justify ` +
           `spend above $150. Focus resources on consistent content over expensive one-offs.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => 
      'Generate a budget breakdown for a Bedroom stage release under $150 that maximizes impact. ' +
      'Focus on DIY execution, smartphone equipment, and organic distribution. ' +
      'Include specific line items with costs and expected outcomes.',
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      maxBudget: 150,
      equipment: 'smartphone or basic home recording',
      distribution: 'organic only',
      crew: 'solo or 1-2 friends'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Bedroom Stage: Block any single line item over $75
 */
export const bedroomLineItemCap = {
  id: 'budget-bedroom-line-item',
  stage: STAGES.BEDROOM,
  category: CATEGORY.BUDGET,
  priority: 2,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.BEDROOM && 
           move.lineItems && 
           move.lineItems.some(item => item.amount > 75);
  },
  
  blockReason: (profile, move) => {
    const overBudgetItems = move.lineItems.filter(i => i.amount > 75);
    const item = overBudgetItems[0];
    const overage = item.amount - 75;
    const listeners = profile.metrics.monthlyListeners;
    const moveType = move.moveType || 'other';
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      const alternativeCount = Math.floor(item.amount / 50);
      return `At Bedroom stage, single line items over $75 concentrate risk. ` +
             `Your "${item.name}" at $${item.amount} exceeds this by ${formatCurrency(overage)}.\n\n` +
             `At this stage, you're building from zero. The same $${item.amount} could fund ` +
             `${alternativeCount} smaller experiments at $50 each. With no existing audience to amplify, ` +
             `you need multiple attempts to discover what works—not one expensive bet.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need iteration volume. ` +
             `Multiple low-cost tests generate learning faster than single high-cost attempts.`;
    }
    
    // Move-type-aware reasoning
    let moveTypeContext = '';
    if (moveType === 'gear_purchase') {
      moveTypeContext = `For gear purchases at this stage, ask: does this remove a real constraint? ` +
                       `If you can already record and release, additional gear rarely changes outcomes. `;
    } else if (moveType === 'music_video' || moveType === 'content_production') {
      const videoCount = Math.floor(item.amount / 50);
      moveTypeContext = `For video content, $${item.amount} on one video is single-asset risk. ` +
                       `The same budget could produce ${videoCount} videos at $50 each—${videoCount}x the ` +
                       `algorithmic opportunities and content for discovery. `;
    }
    
    const itemAsPercentOfCap = ((item.amount / 150) * 100).toFixed(0);
    const alternativeCount = Math.floor(item.amount / 50);
    
    return `At Bedroom stage (${listeners} monthly listeners), ` +
           `single line items over $75 concentrate risk. Your "${item.name}" at $${item.amount} ` +
           `exceeds this by ${formatCurrency(overage)}.\n\n` +
           moveTypeContext +
           `Arithmetic: This single item is ${itemAsPercentOfCap}% of your $150 total cap. ` +
           `The same $${item.amount} could fund ${alternativeCount} smaller investments ` +
           `at $50 each, spreading risk across multiple attempts.\n\n` +
           `Heuristic (industry pattern): At Bedroom stage, multiple lower-cost experiments ` +
           `(testing different content types, platforms, approaches) typically outperform ` +
           `single expensive bets because you're still discovering what resonates.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => {
      const item = move.lineItems.find(i => i.amount > 75);
      return `Generate a low-budget alternative for "${item?.name}" ` +
             `under $75 that works for Bedroom stage artists (0-500 monthly listeners). ` +
             `Focus on DIY execution, smartphone filming, and creative constraints as advantages.`;
    },
    outputFormat: OUTPUT_FORMAT.TREATMENT_WITH_SHOT_LIST,
    constraints: {
      maxBudget: 75,
      equipment: 'smartphone',
      crew: 'solo or 1 friend',
      locations: 'free or home-based'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Local Stage: Cap $400, block music video spend over $200
 */
export const localTotalBudgetCap = {
  id: 'budget-local-total-cap',
  stage: STAGES.RISING,
  category: CATEGORY.BUDGET,
  priority: 1,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.RISING && move.budget > 400;
  },
  
  blockReason: (profile, move) => {
    const overage = move.budget - 400;
    const listeners = profile.metrics.monthlyListeners;
    const moveType = move.moveType || 'other';
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      const releaseCount = Math.floor(move.budget / 400);
      return `At Rising stage, the budget cap is $400 per project. ` +
             `Your planned spend of ${formatCurrency(move.budget)} exceeds this by ${formatCurrency(overage)}.\n\n` +
             `With minimal existing audience, you're buying amplification for listeners who don't exist yet. ` +
             `The same ${formatCurrency(move.budget)} could fund ${releaseCount} separate projects at $400 each, ` +
             `building catalog depth and testing different approaches to find what gains traction.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need multiple attempts and catalog volume, ` +
             `not concentrated spend on single projects.`;
    }
    
    // Move-type-aware reasoning
    let moveTypeContext = '';
    if (moveType === 'paid_ads') {
      moveTypeContext = `For paid ads at this stage: without proven conversion rates and audience capture, ` +
                       `you're renting attention with nothing to retain it. Build email/SMS capture first. `;
    } else if (moveType === 'playlist_service' || moveType === 'pr_publicist') {
      moveTypeContext = `For playlist/PR services: these work when there's a story or track record to pitch. ` +
                       `At ${listeners} listeners, focus on organic playlist strategy and direct curator outreach. `;
    }
    
    const costPerListener = (move.budget / listeners).toFixed(3);
    const capCostPerListener = (400 / listeners).toFixed(3);
    const requiredNewListeners = Math.ceil(overage / 0.01);
    const percentageIncrease = Math.min(9999, ((requiredNewListeners / listeners) * 100).toFixed(1));
    
    return `At Rising stage (${listeners} monthly listeners), ` +
           `the budget cap is $400 per project. Your planned spend of ${formatCurrency(move.budget)} ` +
           `exceeds this by ${formatCurrency(overage)}.\n\n` +
           moveTypeContext +
           `Arithmetic: You're spending $${costPerListener} per existing listener. ` +
           `At the $400 cap, that's $${capCostPerListener} per listener. ` +
           `To break even on the extra ${formatCurrency(overage)} (at $0.01 per stream industry standard), ` +
           `you'd need ${requiredNewListeners} new monthly listeners—` +
           `a ${percentageIncrease}% audience increase.\n\n` +
           `Heuristic (industry pattern): Rising stage growth comes from playlist placement ` +
           `and consistent releases, not increased spend per project. The ${formatCurrency(overage)} overage ` +
           `would be better allocated to a second release or extended promotion period.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      'Generate a budget breakdown for a Rising stage project under $400 that prioritizes ' +
      'playlist placement and organic growth. Include specific allocations for: ' +
      'content creation, playlist pitching prep, and audience engagement tools.',
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      maxBudget: 400,
      focus: 'playlist strategy',
      distribution: 'organic + light paid boost',
      contentVolume: 'multiple pieces'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Local Stage: Block music video spend over $200
 */
export const localVideoBudgetCap = {
  id: 'budget-local-video-cap',
  stage: STAGES.RISING,
  category: CATEGORY.BUDGET,
  priority: 2,
  
  trigger: (profile, move) => {
    // Check if moveType indicates video work, or fall back to line item matching
    const moveType = move.moveType;
    const isVideoMoveType = moveType === 'music_video' || moveType === 'content_production';
    const shouldCheckLineItems = !moveType || moveType === 'other' || isVideoMoveType;
    
    if (!shouldCheckLineItems) {
      return false; // moveType is set but not video-related
    }
    
    return profile.stage === STAGES.RISING && 
           move.lineItems && 
           move.lineItems.some(item => 
             (item.name.toLowerCase().includes('video') || 
              item.name.toLowerCase().includes('visual') ||
              item.category === 'video') && 
             item.amount > 200
           );
  },
  
  blockReason: (profile, move) => {
    const videoItems = move.lineItems.filter(i => 
      (i.name.toLowerCase().includes('video') || 
       i.name.toLowerCase().includes('visual') ||
       i.category === 'video') && 
      i.amount > 200
    );
    const item = videoItems[0];
    const overage = item.amount - 200;
    const listeners = profile.metrics.monthlyListeners;
    const videoCount = Math.floor(item.amount / 100);
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      return `At Rising stage, music video budgets over $200 concentrate resources in a single asset. ` +
             `Your "${item.name}" at $${item.amount} exceeds the $200 threshold by ${formatCurrency(overage)}.\n\n` +
             `With minimal audience, a single expensive video has no one to watch it. ` +
             `The same $${item.amount} could produce ${videoCount} videos at $100 each—` +
             `${videoCount} separate chances for algorithmic discovery, ${videoCount} pieces of content ` +
             `to test what resonates, ${videoCount} opportunities to build catalog.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need content volume for discovery, ` +
             `not production value. Multiple simple videos outperform one expensive video.`;
    }
    
    const costPerListener = (item.amount / listeners).toFixed(3);
    
    return `At Rising stage (${listeners} monthly listeners), ` +
           `music video budgets over $200 concentrate resources in a single asset. ` +
           `Your "${item.name}" at $${item.amount} exceeds the $200 threshold by ${formatCurrency(overage)}.\n\n` +
           `Arithmetic: This video costs $${costPerListener} per existing monthly listener. ` +
           `The same $${item.amount} could produce ${videoCount} videos at $100 each, ` +
           `creating ${videoCount}x the content for playlist thumbnails and social algorithms.\n\n` +
           `Heuristic (industry pattern): Multiple lower-budget videos generate more ` +
           `algorithmic opportunities (each video is a separate chance for discovery) ` +
           `and provide more content for playlist curators to choose from.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => {
      const videoItem = move.lineItems.find(i => 
        (i.name.toLowerCase().includes('video') || i.category === 'video') && i.amount > 200
      );
      return `Generate a multi-video content strategy under $200 total that creates more ` +
             `playlist and social media opportunities than a single expensive video. ` +
             `Include: 2-3 video concepts, DIY production approach, and distribution strategy ` +
             `for Rising stage artists (500-5,000 monthly listeners).`;
    },
    outputFormat: OUTPUT_FORMAT.TREATMENT_WITH_SHOT_LIST,
    constraints: {
      maxBudget: 200,
      videoCount: '2-3',
      equipment: 'smartphone or entry DSLR',
      crew: 'small team or DIY'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Regional Stage: Cap $1,500, block PR retainers under 3 months
 */
export const regionalTotalBudgetCap = {
  id: 'budget-regional-total-cap',
  stage: STAGES.ESTABLISHED,
  category: CATEGORY.BUDGET,
  priority: 1,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.ESTABLISHED && move.budget > 1500;
  },
  
  blockReason: (profile, move) => {
    const overage = move.budget - 1500;
    const listeners = profile.metrics.monthlyListeners;
    const moveType = move.moveType || 'other';
    
    // Move-type-aware reasoning
    let moveTypeContext = '';
    if (moveType === 'paid_ads') {
      moveTypeContext = `For paid ads: without documented conversion rates from previous campaigns, ` +
                       `you're scaling spend without validated unit economics. Test at lower budgets first. `;
    } else if (moveType === 'pr_publicist') {
      moveTypeContext = `For PR: at this stage, you should have a story worth pitching (chart positions, ` +
                       `streaming milestones, tour dates). If not, the spend buys outreach without substance. `;
    } else if (moveType === 'music_video') {
      moveTypeContext = `For music videos: above $1,500, you're in professional production territory. ` +
                       `Ensure you have distribution strategy and audience capture to justify the investment. `;
    }
    
    const costPerListener = (move.budget / listeners).toFixed(3);
    const capCostPerListener = (1500 / listeners).toFixed(3);
    const requiredNewListeners = Math.ceil(overage / 0.01);
    const percentageIncrease = Math.min(9999, ((requiredNewListeners / listeners) * 100).toFixed(1));
    
    return `At Established stage (${listeners} monthly listeners), ` +
           `the budget cap is $1,500 per project. Your planned spend of ${formatCurrency(move.budget)} ` +
           `exceeds this by ${formatCurrency(overage)}.\n\n` +
           moveTypeContext +
           `Arithmetic: You're spending $${costPerListener} per existing listener. ` +
           `At the $1,500 cap, that's $${capCostPerListener} per listener. ` +
           `To break even on the extra ${formatCurrency(overage)} (at $0.01 per stream), ` +
           `you'd need ${requiredNewListeners} new monthly listeners—` +
           `a ${percentageIncrease}% audience increase.\n\n` +
           `Heuristic (industry pattern): Regional artists should validate conversion metrics ` +
           `(email signups, playlist adds, engagement rates) before scaling budget above $1,500. ` +
           `Without proven conversion data, higher spend amplifies uncertainty rather than results.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      'Generate a coordinated release campaign under $1,500 for Established stage artist ' +
      '(5,000-25,000 monthly listeners). Include: content creation, playlist strategy, ' +
      'targeted ads with clear KPIs, and email/SMS campaign. Show expected outcomes ' +
      'for each budget allocation.',
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      maxBudget: 1500,
      focus: 'coordinated campaign',
      distribution: 'multi-channel',
      tracking: 'KPI-driven'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Regional Stage: Block PR retainers under 3 months
 */
export const regionalPRRetainerMinimum = {
  id: 'budget-regional-pr-minimum',
  stage: STAGES.ESTABLISHED,
  category: CATEGORY.BUDGET,
  priority: 2,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.ESTABLISHED && 
           move.lineItems && 
           move.lineItems.some(item => {
             const isPR = item.name.toLowerCase().includes('pr') || 
                         item.name.toLowerCase().includes('publicist') ||
                         item.category === 'pr';
             const duration = item.duration || '';
             const isShortTerm = duration.includes('month') && 
                                parseInt(duration) < 3;
             return isPR && isShortTerm;
           });
  },
  
  blockReason: (profile, move) => {
    const prItems = move.lineItems.filter(i => 
      i.name.toLowerCase().includes('pr') || 
      i.name.toLowerCase().includes('publicist') ||
      i.category === 'pr'
    );
    const item = prItems[0];
    const monthlyRate = item.amount / (parseInt(item.duration) || 1);
    const threeMonthCost = monthlyRate * 3;
    const listeners = profile.metrics.monthlyListeners;
    
    // Check if there's a story to pitch
    const hasStory = listeners >= 5000; // Established stage minimum
    let storyContext = '';
    if (!hasStory) {
      storyContext = `At ${listeners} listeners, you may not have the track record (streaming milestones, ` +
                    `chart positions, tour dates) that PR firms need to pitch effectively. `;
    }
    
    return `At Established stage (${listeners} monthly listeners), ` +
           `PR retainers under 3 months are structurally ineffective. ` +
           `Your "${item.name}" with ${item.duration} duration is too short.\n\n` +
           storyContext +
           `Arithmetic: At $${monthlyRate.toFixed(0)}/month, a 3-month minimum would cost ` +
           `$${threeMonthCost.toFixed(0)}. Month 1 is relationship building and pitch development. ` +
           `Month 2 is outreach and follow-up. Month 3 is when placements typically materialize. ` +
           `Shorter retainers pay for setup without reaching the outcome phase.\n\n` +
           `Heuristic (industry pattern): PR campaigns need 8-12 weeks to build journalist ` +
           `relationships and secure placements. Shorter engagements waste budget on setup costs.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      'Generate two alternatives: (1) A 3-month PR strategy with realistic placement ' +
      'expectations and monthly milestones, OR (2) A direct outreach strategy ' +
      '(playlist curators, music bloggers, influencers) that delivers faster results ' +
      'without PR retainer costs. For Established stage artist (5,000-25,000 monthly listeners).',
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      option1: '3-month PR retainer with milestones',
      option2: 'direct outreach strategy',
      focus: 'measurable placements'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Breaking Stage: $5,000 cap (advisory only)
 */
export const breakingBudgetAdvisory = {
  id: 'budget-breaking-advisory',
  stage: STAGES.BREAKOUT,
  category: CATEGORY.BUDGET,
  priority: 1,
  
  trigger: (profile, move) => {
    return profile.stage === STAGES.BREAKOUT && move.budget > 5000;
  },
  
  blockReason: (profile, move) => {
    const overage = move.budget - 5000;
    const listeners = profile.metrics.monthlyListeners;
    const moveType = move.moveType || 'other';
    
    // Move-type-aware reasoning
    let moveTypeContext = '';
    if (moveType === 'paid_ads') {
      moveTypeContext = `For paid ads at this scale: you need documented CAC (customer acquisition cost), ` +
                       `LTV (lifetime value), and conversion funnels from previous campaigns. ` +
                       `Without these metrics, you're guessing at scale. `;
    } else if (moveType === 'music_video') {
      moveTypeContext = `For music videos above $5,000: you're in professional production territory. ` +
                       `Ensure you have distribution deals, sync opportunities, or tour support that justify ` +
                       `this level of investment. `;
    } else if (moveType === 'pr_publicist') {
      moveTypeContext = `For PR at this budget: you should have major milestones to announce (label deal, ` +
                       `festival bookings, chart positions). PR amplifies news; it doesn't create it. `;
    } else if (moveType === 'release') {
      moveTypeContext = `For release campaigns above $5,000: you need proven conversion rates, ` +
                       `audience capture infrastructure, and revenue projections. This is scaling territory. `;
    }
    
    const costPerListener = (move.budget / listeners).toFixed(3);
    const requiredNewListeners = Math.ceil(overage / 0.01);
    const percentageIncrease = Math.min(9999, ((requiredNewListeners / listeners) * 100).toFixed(1));
    const totalRequiredListeners = Math.ceil(move.budget / 0.01);
    const totalPercentageIncrease = Math.min(9999, ((totalRequiredListeners / listeners) * 100).toFixed(1));
    
    return `At Breakout stage (${listeners} monthly listeners), ` +
           `your planned spend of ${formatCurrency(move.budget)} exceeds the $5,000 advisory threshold ` +
           `by ${formatCurrency(overage)}.\n\n` +
           moveTypeContext +
           `Arithmetic: You're spending $${costPerListener} per existing listener. ` +
           `To break even on the full ${formatCurrency(move.budget)} (at $0.01 per stream), ` +
           `you'd need ${totalRequiredListeners} total new monthly listeners—` +
           `a ${totalPercentageIncrease}% increase. ` +
           `The ${formatCurrency(overage)} above $5,000 alone requires ${requiredNewListeners} new listeners ` +
           `(${percentageIncrease}% increase).\n\n` +
           `Advisory: Budgets above $5,000 require documented conversion rates from previous campaigns, ` +
           `attribution tracking, and revenue projections. Without these, you're scaling spend ` +
           `without validated unit economics.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      `Generate a risk assessment and optimization plan for a ${formatCurrency(move.budget)} campaign ` +
      `at Breakout stage (25,000+ monthly listeners). Include: ` +
      `(1) Required conversion metrics to justify spend, ` +
      `(2) Attribution tracking setup, ` +
      `(3) Revenue projection model, ` +
      `(4) Suggested budget allocation with expected ROI per channel.`,
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      focus: 'ROI optimization',
      tracking: 'full attribution',
      projections: 'revenue-based'
    }
  },
  
  severity: SEVERITY.ADVISORY
};

/**
 * Export all budget rules
 */
export const budgetRules = [
  bedroomTotalBudgetCap,
  bedroomLineItemCap,
  localTotalBudgetCap,
  localVideoBudgetCap,
  regionalTotalBudgetCap,
  regionalPRRetainerMinimum,
  breakingBudgetAdvisory
];