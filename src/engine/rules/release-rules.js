/**
 * Release Rules
 * Rules governing release strategy and timing by stage
 */

import { STAGES } from '../stage-calculator.js';
import { SEVERITY, CATEGORY, OUTPUT_FORMAT } from './rule-types.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';

/**
 * Block album/EP release below 2,500 monthly listeners
 */
export const albumMinimumAudience = {
  id: 'release-album-minimum-audience',
  stage: 'all',
  category: CATEGORY.RELEASE,
  priority: 1,
  
  trigger: (profile, move) => {
    const isAlbumOrEP = move.releaseDetails && 
                        (move.releaseDetails.format === 'album' || 
                         move.releaseDetails.format === 'EP');
    return isAlbumOrEP && profile.metrics.monthlyListeners < 2500;
  },
  
  blockReason: (profile, move) => {
    const format = move.releaseDetails.format;
    const trackCount = move.releaseDetails.trackCount || 'multiple';
    const listeners = profile.metrics.monthlyListeners;
    const deficit = 2500 - listeners;
    const percentageOfTarget = ((listeners / 2500) * 100).toFixed(0);
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      return `Releasing an ${format} (${trackCount} tracks) is premature. ` +
             `You need 2,500+ listeners for ${format} releases.\n\n` +
             `At this stage, the constraint is building an audience from zero. An ${format} with ${trackCount} tracks ` +
             `means ${trackCount} songs competing for attention from an audience that doesn't exist yet. ` +
             `Each single release is a separate discovery opportunity—${trackCount} singles over time gives you ` +
             `${trackCount} chances to find what resonates and ${trackCount} catalog entries for algorithmic discovery.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need singles to test and iterate. ` +
             `${format}s work when you have an audience waiting for more content, not when you're building from zero.`;
    }
    
    const streamsPerTrack = Math.floor(listeners / trackCount);
    
    return `Releasing an ${format} (${trackCount} tracks) at ${formatNumber(listeners)} ` +
           `monthly listeners is premature. You need 2,500+ listeners for ${format} releases—` +
           `you're currently at ${percentageOfTarget}% of that threshold (${formatNumber(deficit)} listeners short).\n\n` +
           `Arithmetic: With ${trackCount} tracks and ${formatNumber(listeners)} monthly listeners, ` +
           `each track would average ~${formatNumber(streamsPerTrack)} streams in the first month. ` +
           `At 2,500 listeners, each track would average ~${formatNumber(Math.floor(2500 / trackCount))} streams—` +
           `enough to signal playlist algorithms that multiple tracks are gaining traction.\n\n` +
           `Heuristic (industry pattern): ${format}s released below 2,500 listeners see steep drop-off ` +
           `after the first week because there's insufficient audience to sustain momentum across ` +
           `multiple tracks. Singles allow incremental audience building, with each release attracting ` +
           `new listeners who then discover your catalog.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      `Generate a single release cadence strategy for an artist with ` +
      `${move.releaseDetails.trackCount} tracks ready to release but only ` +
      `${profile.metrics.monthlyListeners} monthly listeners. ` +
      `Include: (1) Optimal spacing between singles (6-8 weeks), ` +
      `(2) How to build anticipation for each release, ` +
      `(3) Playlist strategy for each single, ` +
      `(4) How to cross-promote previous releases, ` +
      `(5) Timeline to reach 2,500 listeners for eventual ${move.releaseDetails.format} release.`,
    outputFormat: OUTPUT_FORMAT.RELEASE_TIMELINE,
    constraints: (profile, move) => ({
      format: 'singles',
      spacing: '6-8 weeks',
      goal: 'reach 2,500 listeners',
      trackCount: move.releaseDetails?.trackCount
    })
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Block release with zero audience capture (email/WhatsApp list)
 */
export const releaseRequiresCapture = {
  id: 'release-requires-capture',
  stage: 'all',
  category: CATEGORY.RELEASE,
  priority: 2,
  
  trigger: (profile, move) => {
    const isRelease = move.type === 'release';
    const hasNoCapture = !profile.audienceCapture.hasEmailList && 
                         !profile.audienceCapture.hasWhatsApp;
    return isRelease && hasNoCapture;
  },
  
  blockReason: (profile, move) => {
    const format = move.releaseDetails?.format || 'release';
    const listeners = profile.metrics.monthlyListeners;
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      return `Releasing ${format === 'single' ? 'a single' : 'an ' + format} with zero owned ` +
             `audience capture (no email or WhatsApp list) wastes momentum.\n\n` +
             `Without capture, every listener you gain through this release disappears back into the algorithm. ` +
             `You can't notify them about your next release, can't coordinate a launch day push, ` +
             `can't build a relationship. Each release starts from zero instead of building on the last.\n\n` +
             `Heuristic (industry pattern): Even 20-30 email signups (achievable in 2-3 weeks pre-release) ` +
             `give you a coordinated launch day push that algorithms reward with better initial placement.`;
    }
    
    const estimatedInterestedFans = Math.floor(listeners * 0.05); // Conservative 5% highly engaged
    const potentialCaptureValue = estimatedInterestedFans * 0.50; // $0.50 lifetime value per email (conservative)
    
    return `Releasing ${format === 'single' ? 'a single' : 'an ' + format} with zero owned ` +
           `audience capture (no email or WhatsApp list) wastes momentum. ` +
           `At ${formatNumber(listeners)} monthly listeners, you're relying entirely ` +
           `on platform algorithms.\n\n` +
           `Arithmetic: Conservatively, ~${formatNumber(estimatedInterestedFans)} of your listeners ` +
           `(5% highly engaged) would join an email list if offered. ` +
           `At ${formatCurrency(0.50)} lifetime value per email (industry conservative), that's ${formatCurrency(potentialCaptureValue)} ` +
           `in owned audience value you're leaving on the table with each release. ` +
           `Without capture, you can't directly notify fans, coordinate launch day pushes, ` +
           `or re-engage listeners for future releases.\n\n` +
           `Heuristic (industry pattern): Artists with even small email lists (100-200 people) ` +
           `see significantly better first-week performance because they can coordinate ` +
           `a launch day push independent of algorithm timing.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) =>
      `Generate a pre-release audience capture strategy for an artist with ` +
      `${profile.metrics.monthlyListeners} monthly listeners and zero email/WhatsApp list. ` +
      `Include: (1) Landing page setup (free tools like Linktree + Mailchimp), ` +
      `(2) Lead magnet ideas (exclusive content, early access, behind-the-scenes), ` +
      `(3) Social media conversion tactics to drive signups, ` +
      `(4) Timeline: 2-4 weeks to build initial list before release, ` +
      `(5) Target: 50-100 signups minimum before release date. ` +
      `Make it actionable for ${profile.stage} stage artist.`,
    outputFormat: OUTPUT_FORMAT.RELEASE_TIMELINE,
    constraints: (profile, move) => ({
      timeline: '2-4 weeks pre-release',
      tools: 'free or low-cost',
      target: '50-100 signups minimum',
      stage: profile.stage
    })
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Block releases spaced under 6 weeks apart below Established stage
 */
export const releaseSpacingMinimum = {
  id: 'release-spacing-minimum',
  stage: 'all',
  category: CATEGORY.RELEASE,
  priority: 3,
  
  trigger: (profile, move) => {
    // Only applies below Established stage
    if (profile.stage === STAGES.ESTABLISHED || profile.stage === STAGES.BREAKOUT) {
      return false;
    }
    
    // Check if this is a release
    if (move.type !== 'release') {
      return false;
    }
    
    // Check if there's a recent release in decision history
    // For now, we'll check if releaseDetails includes a lastReleaseDate
    if (move.releaseDetails?.lastReleaseDate) {
      const lastRelease = new Date(move.releaseDetails.lastReleaseDate);
      const plannedRelease = new Date(move.releaseDetails.releaseDate);
      const daysBetween = (plannedRelease - lastRelease) / (1000 * 60 * 60 * 24);
      const weeksBetween = daysBetween / 7;
      
      return weeksBetween < 6;
    }
    
    return false;
  },
  
  blockReason: (profile, move) => {
    const lastRelease = new Date(move.releaseDetails.lastReleaseDate);
    const plannedRelease = new Date(move.releaseDetails.releaseDate);
    const daysBetween = Math.floor((plannedRelease - lastRelease) / (1000 * 60 * 60 * 24));
    const weeksBetween = (daysBetween / 7).toFixed(1);
    const weeksShort = (6 - parseFloat(weeksBetween)).toFixed(1);
    const daysShort = Math.ceil(weeksShort * 7);
    const listeners = profile.metrics.monthlyListeners;
    const stageOnlyMode = profile.stageOnlyMode || listeners < 50;
    
    // Handle stage-only mode or zero/low listener case
    if (stageOnlyMode) {
      return `At ${profile.stage} stage, releasing tracks ${weeksBetween} weeks apart is too frequent. ` +
             `You need minimum 6 weeks between releases—you're ${weeksShort} weeks (${daysShort} days) short.\n\n` +
             `With minimal audience, rapid releases don't build on each other—they compete for the same ` +
             `non-existent attention. Each release needs 6-8 weeks to find its audience through algorithmic ` +
             `discovery, playlist consideration, and organic sharing. Releasing faster means each track ` +
             `gets abandoned before it has a chance to gain traction.\n\n` +
             `Heuristic (industry pattern): Pre-audience artists need time between releases to let each track ` +
             `complete its discovery cycle. Faster cadence creates a catalog of under-performing tracks.`;
    }
    
    // Calculate opportunity cost
    const playlistDiscoveryWindow = 28; // 4 weeks for playlist curators to discover
    const algorithmMomentumWindow = 21; // 3 weeks for algorithm to build momentum
    const daysLostPerTrack = Math.max(0, playlistDiscoveryWindow - daysBetween);
    
    return `At ${profile.stage} stage (${formatNumber(listeners)} monthly listeners), ` +
           `releasing tracks ${weeksBetween} weeks apart is too frequent. ` +
           `You need minimum 6 weeks between releases—you're ${weeksShort} weeks (${daysShort} days) short.\n\n` +
           `Arithmetic: Playlist curators typically need 4 weeks (28 days) to discover and add tracks. ` +
           `Your ${daysBetween}-day spacing gives each track only ${daysBetween} days of curator attention ` +
           `before the next release diverts focus—cutting ${daysLostPerTrack} days from the discovery window. ` +
           `Algorithm momentum builds over 3 weeks; rapid releases reset this cycle before it peaks.\n\n` +
           `Heuristic (industry pattern): Below Established stage, 6-8 week spacing allows each release ` +
           `to complete its growth cycle (playlist discovery, algorithm momentum, audience engagement) ` +
           `before the next release. Faster cadence cannibalizes each track's potential.`;
  },
  
  redirectAction: {
    type: 'creative_generation',
    prompt: (profile, move) => {
      const lastRelease = new Date(move.releaseDetails.lastReleaseDate);
      const plannedRelease = new Date(move.releaseDetails.releaseDate);
      const daysBetween = Math.floor((plannedRelease - lastRelease) / (1000 * 60 * 60 * 24));
      
      return `Generate a revised release timeline that spaces releases 6-8 weeks apart ` +
             `for a ${profile.stage} stage artist (${profile.metrics.monthlyListeners} monthly listeners). ` +
             `Current spacing is ${daysBetween} days. Include: ` +
             `(1) Optimal release dates with 6-8 week spacing, ` +
             `(2) What to do during the gaps (content strategy, playlist pitching, engagement), ` +
             `(3) How to maintain momentum between releases, ` +
             `(4) Milestone targets for each release cycle. ` +
             `Show how proper spacing leads to compounding growth.`;
    },
    outputFormat: OUTPUT_FORMAT.RELEASE_TIMELINE,
    constraints: (profile, move) => ({
      spacing: '6-8 weeks',
      stage: profile.stage,
      focus: 'sustained momentum',
      activities: 'content + pitching + engagement'
    })
  },
  
  severity: SEVERITY.BLOCK
};

/**
 * Export all release rules
 */
export const releaseRules = [
  albumMinimumAudience,
  releaseRequiresCapture,
  releaseSpacingMinimum
];
