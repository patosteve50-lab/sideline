/**
 * Promo Rules
 * Rules governing promotional strategies and spending by stage
 */

import { STAGES } from '../stage-calculator.js';
import { SEVERITY, CATEGORY, OUTPUT_FORMAT } from './rule-types.js';

/**
 * Block any paid ad spend below Local stage
 */
export const paidAdsMinimumStage = {
  id: 'promo-paid-ads-minimum-stage',
  stage: STAGES.BEDROOM,
  category: CATEGORY.PROMO,
  priority: 1,
  
  trigger: (profile, move) => {
    const isPaidAds = move.promoDetails && 
                      (move.promoDetails.channels?.some(ch => 
                        ch.toLowerCase().includes('ads') || 
                        ch.toLowerCase().includes('facebook') ||
                        ch.toLowerCase().includes('instagram') ||
                        ch.toLowerCase().includes('tiktok') ||
                        ch.toLowerCase().includes('youtube')
                      ) || move.type === 'promo');
    
    const hasPaidAdsBudget = move.lineItems?.some(item =>
      item.name.toLowerCase().includes('ads') ||
      item.name.toLowerCase().includes('facebook') ||
      item.name.toLowerCase().includes('instagram') ||
      item.category === 'paid_ads'
    );
    
    return profile.stage === STAGES.BEDROOM && (isPaidAds || hasPaidAdsBudget);
  },
  
  blockReason: (profile, move) => {
    const adBudget = move.lineItems?.find(i => 
      i.name.toLowerCase().includes('ads') || i.category === 'paid_ads'
    )?.amount || move.budget;
    
    const costPerListener = (adBudget / profile.metrics.monthlyListeners).toFixed(2);
    const minAudienceForAlgorithm = 500; // Platform minimum for lookalike audiences
    const deficit = minAudienceForAlgorithm - profile.metrics.monthlyListeners;
    const adPlatformMinimum = 200; // Typical minimum for algorithm optimization
    
    return `At Bedroom stage (${profile.metrics.monthlyListeners} monthly listeners), ` +
           `paid advertising is premature. Your planned ad spend of $${adBudget} ` +
           `will likely yield negative ROI.\n\n` +
           `Arithmetic: You're spending $${costPerListener} per existing listener on ads. ` +
           `Ad platforms require ~${minAudienceForAlgorithm} listeners minimum to build lookalike audiences—` +
           `you're ${deficit} listeners short. Without this baseline, algorithms can't identify ` +
           `similar users effectively. Additionally, platforms need $${adPlatformMinimum}+ spend ` +
           `to optimize delivery, which exceeds your total budget cap.\n\n` +
           `Heuristic (industry pattern): Paid ads work when you're scaling proven organic traction. ` +
           `At Bedroom stage, you're still testing if people like your music. ` +
           `Organic content proves product-market fit before you pay to amplify it.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      `Generate an organic growth strategy for a Bedroom stage artist ` +
      `(${profile.metrics.monthlyListeners} monthly listeners) with $${move.budget} budget. ` +
      `Instead of paid ads, focus on: ` +
      `(1) Content creation strategy (TikTok, Instagram Reels, YouTube Shorts), ` +
      `(2) Collaboration opportunities with similar-sized artists, ` +
      `(3) Playlist submission strategy (independent curators, Spotify editorial), ` +
      `(4) Community engagement tactics (comments, DMs, Discord/Reddit), ` +
      `(5) How to measure organic traction before considering paid promotion. ` +
      `Show specific weekly actions and expected outcomes.`,
    outputFormat: OUTPUT_FORMAT.CAPTION_STRATEGY,
    constraints: {
      budget: move.budget,
      focus: 'organic only',
      platforms: 'TikTok, Instagram, YouTube',
      timeline: '4-8 weeks',
      stage: STAGES.BEDROOM
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Block paid ads at any stage if no capture mechanic exists
 */
export const paidAdsRequireCapture = {
  id: 'promo-paid-ads-require-capture',
  stage: 'all',
  category: CATEGORY.PROMO,
  priority: 2,
  
  trigger: (profile, move) => {
    const hasPaidAds = move.lineItems?.some(item =>
      item.name.toLowerCase().includes('ads') ||
      item.name.toLowerCase().includes('facebook') ||
      item.name.toLowerCase().includes('instagram') ||
      item.category === 'paid_ads'
    );
    
    const hasNoCapture = !profile.audienceCapture.hasEmailList && 
                         !profile.audienceCapture.hasWhatsApp;
    
    return hasPaidAds && hasNoCapture;
  },
  
  blockReason: (profile, move) => {
    const adBudget = move.lineItems?.find(i => 
      i.name.toLowerCase().includes('ads') || i.category === 'paid_ads'
    )?.amount || 0;
    
    // Calculate opportunity cost
    const estimatedClicks = Math.floor(adBudget / 0.50); // $0.50 CPC conservative estimate
    const estimatedCaptureRate = 0.10; // 10% of clicks convert to email signups (conservative)
    const potentialSignups = Math.floor(estimatedClicks * estimatedCaptureRate);
    const lifetimeValuePerEmail = 0.50; // Conservative LTV
    const lostValue = potentialSignups * lifetimeValuePerEmail;
    
    return `Running paid ads without an audience capture mechanism wastes momentum. ` +
           `Your planned $${adBudget} in ads at ${profile.metrics.monthlyListeners} monthly listeners ` +
           `will drive traffic, but with no email/WhatsApp list, you can't build owned audience.\n\n` +
           `Arithmetic: At $0.50 CPC (conservative), $${adBudget} generates ~${estimatedClicks} clicks. ` +
           `With a 10% capture rate (conservative), that's ${potentialSignups} potential email signups. ` +
           `At $${lifetimeValuePerEmail} lifetime value per email, you're leaving $${lostValue.toFixed(0)} ` +
           `in owned audience value on the table. Without capture, you're renting attention—` +
           `every dollar spent can't be leveraged for future releases.\n\n` +
           `Heuristic (industry pattern): Ads without capture create one-time traffic. ` +
           `Ads with capture build an owned audience you can activate repeatedly at zero marginal cost.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      `Generate a capture-first paid ads strategy for ${profile.stage} stage artist ` +
      `(${profile.metrics.monthlyListeners} monthly listeners) with $${move.budget} total budget. ` +
      `Include: ` +
      `(1) Landing page setup (Linktree + Mailchimp or similar free tools), ` +
      `(2) Lead magnet creation (exclusive track, behind-the-scenes, early access), ` +
      `(3) Ad creative that drives to landing page (not just streaming links), ` +
      `(4) Budget split: 20% to capture setup, 80% to ads once capture is live, ` +
      `(5) Success metrics: email signups, not just streams. ` +
      `Show 2-week timeline: Week 1 = setup capture, Week 2 = run ads.`,
    outputFormat: OUTPUT_FORMAT.BUDGET_BREAKDOWN,
    constraints: {
      captureFirst: true,
      timeline: '2 weeks',
      tools: 'free or low-cost',
      metrics: 'email signups + streams'
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Block playlist pitching services below Regional stage
 */
export const playlistServicesMinimumStage = {
  id: 'promo-playlist-services-minimum-stage',
  stage: 'all',
  category: CATEGORY.PROMO,
  priority: 3,
  
  trigger: (profile, move) => {
    const isPlaylistService = move.lineItems?.some(item =>
      item.name.toLowerCase().includes('playlist') ||
      item.name.toLowerCase().includes('playlistpush') ||
      item.name.toLowerCase().includes('submithub') ||
      item.name.toLowerCase().includes('pitching service') ||
      item.category === 'playlist_service'
    );
    
    const isBelowRegional = profile.stage === STAGES.BEDROOM || 
                           profile.stage === STAGES.LOCAL;
    
    return isPlaylistService && isBelowRegional;
  },
  
  blockReason: (profile, move) => {
    const serviceItem = move.lineItems?.find(i =>
      i.name.toLowerCase().includes('playlist') ||
      i.name.toLowerCase().includes('playlistpush') ||
      i.name.toLowerCase().includes('submithub') ||
      i.category === 'playlist_service'
    );
    const serviceCost = serviceItem?.amount || 0;
    const serviceName = serviceItem?.name || 'playlist pitching service';
    
    // Calculate opportunity cost
    const contentPiecesAffordable = Math.floor(serviceCost / 50); // $50 per content piece
    const directOutreachTime = serviceCost / 25; // $25/hour equivalent time value
    const curatorOutreachCount = Math.floor(directOutreachTime * 10); // 10 outreaches per hour
    
    return `At ${profile.stage} stage (${profile.metrics.monthlyListeners} monthly listeners), ` +
           `paid playlist pitching services like "${serviceName}" ($${serviceCost}) have ` +
           `poor cost-effectiveness for emerging artists.\n\n` +
           `Arithmetic: The $${serviceCost} could instead fund ${contentPiecesAffordable} content pieces ` +
           `at $50 each, which attract organic curator attention. Or, valuing your time at $25/hour, ` +
           `that's ${directOutreachTime.toFixed(1)} hours for ~${curatorOutreachCount} direct curator outreaches. ` +
           `Services prioritize artists with proven traction (5,000+ listeners) because curators ` +
           `receive 100+ daily submissions—yours competes in a saturated pool.\n\n` +
           `Heuristic (industry pattern): Below Regional stage, direct outreach to independent curators ` +
           `(free, personalized) has better success rates than paid services because you can target ` +
           `curators who specifically support emerging artists in your genre.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => {
      const serviceItem = move.lineItems?.find(i =>
        i.name.toLowerCase().includes('playlist') || i.category === 'playlist_service'
      );
      const serviceCost = serviceItem?.amount || move.budget;
      
      return `Generate a direct playlist outreach strategy for ${profile.stage} stage artist ` +
             `(${profile.metrics.monthlyListeners} monthly listeners) that replaces paid services. ` +
             `Include: ` +
             `(1) How to find independent curators in your genre (Spotify, Instagram, TikTok), ` +
             `(2) Outreach message templates (personalized, not spammy), ` +
             `(3) What curators look for at this stage (engagement rate, not just listener count), ` +
             `(4) How to build relationships before pitching, ` +
             `(5) Realistic expectations based on effort, not guarantees, ` +
             `(6) Timeline: 2-3 weeks of consistent outreach. ` +
             `Show how $${serviceCost} can fund content creation that makes pitching more effective.`;
    },
    outputFormat: OUTPUT_FORMAT.CAPTION_STRATEGY,
    constraints: {
      cost: '$0 for outreach',
      budget: 'reallocate to content',
      approach: 'direct + personalized',
      timeline: '2-3 weeks',
      stage: profile.stage
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Block PR/publicist hire below Regional stage
 */
export const publicistMinimumStage = {
  id: 'promo-publicist-minimum-stage',
  stage: 'all',
  category: CATEGORY.PROMO,
  priority: 4,
  
  trigger: (profile, move) => {
    const isPR = move.lineItems?.some(item =>
      item.name.toLowerCase().includes('pr') ||
      item.name.toLowerCase().includes('publicist') ||
      item.name.toLowerCase().includes('public relations') ||
      item.category === 'pr'
    );
    
    const isBelowRegional = profile.stage === STAGES.BEDROOM || 
                           profile.stage === STAGES.LOCAL;
    
    return isPR && isBelowRegional;
  },
  
  blockReason: (profile, move) => {
    const prItem = move.lineItems?.find(i =>
      i.name.toLowerCase().includes('pr') ||
      i.name.toLowerCase().includes('publicist') ||
      i.category === 'pr'
    );
    const prCost = prItem?.amount || 0;
    const prName = prItem?.name || 'PR/publicist';
    
    // Calculate opportunity cost
    const contentPiecesAffordable = Math.floor(prCost / 75); // $75 per quality content piece
    const minListenersForPress = 5000;
    const deficit = minListenersForPress - profile.metrics.monthlyListeners;
    const percentageOfTarget = ((profile.metrics.monthlyListeners / minListenersForPress) * 100).toFixed(0);
    
    return `At ${profile.stage} stage (${profile.metrics.monthlyListeners} monthly listeners), ` +
           `hiring ${prName} ($${prCost}) is premature and structurally ineffective.\n\n` +
           `Arithmetic: Music journalists and blogs typically require 5,000+ monthly listeners ` +
           `for coverage consideration—you're at ${percentageOfTarget}% of that threshold ` +
           `(${deficit} listeners short). The $${prCost} could instead fund ${contentPiecesAffordable} ` +
           `content pieces at $75 each, directly building the audience that makes you press-worthy. ` +
           `PR firms prioritize artists with existing metrics because journalists need a story—` +
           `without notable numbers or press clips, there's nothing to pitch.\n\n` +
           `Heuristic (industry pattern): PR works when you have a story to tell (milestone reached, ` +
           `unique angle, proven traction). Below Regional stage, focus on building that story first: ` +
           `reach 5,000 listeners, get playlist adds, create compelling content. Then PR has material to work with.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => {
      const prItem = move.lineItems?.find(i =>
        i.name.toLowerCase().includes('pr') || i.category === 'pr'
      );
      const prCost = prItem?.amount || move.budget;
      
      return `Generate a "build your story" strategy for ${profile.stage} stage artist ` +
             `(${profile.metrics.monthlyListeners} monthly listeners) that creates PR-worthy momentum ` +
             `without hiring a publicist. Include: ` +
             `(1) Content strategy that generates organic press interest (viral moments, unique angles), ` +
             `(2) How to document your journey (behind-the-scenes, milestones, challenges), ` +
             `(3) Direct outreach to music bloggers and micro-influencers (not major press), ` +
             `(4) Community building tactics that create word-of-mouth, ` +
             `(5) Milestones to hit before PR makes sense (5,000 listeners, playlist adds, local shows), ` +
             `(6) How to allocate $${prCost} to accelerate these milestones. ` +
             `Show 3-month roadmap to PR-readiness.`;
    },
    outputFormat: OUTPUT_FORMAT.RELEASE_TIMELINE,
    constraints: {
      budget: move.budget,
      focus: 'story building',
      timeline: '3 months',
      target: 'PR-ready metrics',
      stage: profile.stage
    }
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Export all promo rules
 */
export const promoRules = [
  paidAdsMinimumStage,
  paidAdsRequireCapture,
  playlistServicesMinimumStage,
  publicistMinimumStage
];
