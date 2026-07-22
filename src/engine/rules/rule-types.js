/**
 * Rule Type Definitions
 * Defines the structure and interface for all rules in the system
 */

/**
 * Rule severity levels
 */
export const SEVERITY = {
  BLOCK: 'block',      // Hard block - prevents action
  ADVISORY: 'advisory'  // Warning only - allows action
};

/**
 * Rule categories
 */
export const CATEGORY = {
  BUDGET: 'budget',
  RELEASE: 'release',
  PROMO: 'promo'
};

/**
 * Creative output formats for redirects
 */
export const OUTPUT_FORMAT = {
  TREATMENT: 'treatment',
  SHOT_LIST: 'shot_list',
  CAPTION_STRATEGY: 'caption_strategy',
  BUDGET_BREAKDOWN: 'budget_breakdown',
  RELEASE_TIMELINE: 'release_timeline',
  TREATMENT_WITH_SHOT_LIST: 'treatment_with_shot_list'
};

/**
 * Base rule structure
 * @typedef {Object} Rule
 * @property {string} id - Unique identifier for the rule
 * @property {string|'all'} stage - Target stage or 'all' for all stages
 * @property {string} category - Rule category (budget, release, promo)
 * @property {number} priority - Evaluation order (lower = higher priority)
 * @property {Function} trigger - Function that returns true if rule applies
 * @property {Function} blockReason - Function that returns explanation with numbers
 * @property {Object} redirectAction - Specification for creative generation
 * @property {string} severity - 'block' or 'advisory'
 */

/**
 * Creator profile structure
 * @typedef {Object} CreatorProfile
 * @property {string} id - Unique identifier
 * @property {string} name - Creator name
 * @property {string} stage - Current stage (calculated)
 * @property {Object} metrics - Performance metrics
 * @property {number} metrics.monthlyListeners - Monthly listeners count
 * @property {Object} metrics.followers - Follower counts by platform
 * @property {number} metrics.followers.instagram
 * @property {number} metrics.followers.tiktok
 * @property {number} metrics.followers.spotify
 * @property {number} metrics.engagementRate - Engagement rate percentage
 * @property {Object} audienceCapture - Audience capture status
 * @property {boolean} audienceCapture.hasEmailList
 * @property {number} audienceCapture.emailListSize
 * @property {boolean} audienceCapture.hasWhatsApp
 * @property {number} audienceCapture.whatsappListSize
 * @property {Object} budget - Budget information
 * @property {number} budget.totalAvailable - Total available budget
 * @property {string} budget.currency - Currency code (USD)
 */

/**
 * Planned move structure
 * @typedef {Object} PlannedMove
 * @property {string} type - Move type: 'release', 'promo', 'spend'
 * @property {string} description - Description of the planned move
 * @property {number} budget - Total budget for this move
 * @property {Array<Object>} lineItems - Budget line items
 * @property {Object} [releaseDetails] - Release-specific details
 * @property {Object} [promoDetails] - Promo-specific details
 */

/**
 * Rule evaluation result
 * @typedef {Object} RuleResult
 * @property {string} ruleId - ID of the triggered rule
 * @property {boolean} triggered - Whether the rule was triggered
 * @property {string} severity - 'block' or 'advisory'
 * @property {string} reason - Explanation with explicit numbers
 * @property {Object} redirectAction - Creative generation specification
 */

/**
 * Validate rule structure
 * @param {Rule} rule - Rule to validate
 * @throws {Error} If rule is invalid
 */
export function validateRule(rule) {
  if (!rule.id || typeof rule.id !== 'string') {
    throw new Error('Rule must have a valid id');
  }
  
  if (!rule.stage || (rule.stage !== 'all' && typeof rule.stage !== 'string')) {
    throw new Error('Rule must have a valid stage');
  }
  
  if (!Object.values(CATEGORY).includes(rule.category)) {
    throw new Error(`Rule category must be one of: ${Object.values(CATEGORY).join(', ')}`);
  }
  
  if (typeof rule.priority !== 'number') {
    throw new Error('Rule priority must be a number');
  }
  
  if (typeof rule.trigger !== 'function') {
    throw new Error('Rule trigger must be a function');
  }
  
  if (typeof rule.blockReason !== 'function') {
    throw new Error('Rule blockReason must be a function');
  }
  
  if (!rule.redirectAction || typeof rule.redirectAction !== 'object') {
    throw new Error('Rule must have a redirectAction object');
  }
  
  if (!Object.values(SEVERITY).includes(rule.severity)) {
    throw new Error(`Rule severity must be one of: ${Object.values(SEVERITY).join(', ')}`);
  }
  
  return true;
}
