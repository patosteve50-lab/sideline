/**
 * Rule Registry
 * Central registry for all rules in the system
 */

import { budgetRules } from './rules/budget-rules.js';
import { releaseRules } from './rules/release-rules.js';
import { promoRules } from './rules/promo-rules.js';
import { validateRule } from './rules/rule-types.js';

/**
 * All registered rules
 */
const allRules = [
  ...budgetRules,
  ...releaseRules,
  ...promoRules
];

/**
 * Validate all rules on import
 */
allRules.forEach(rule => {
  try {
    validateRule(rule);
  } catch (error) {
    console.error(`Rule validation failed for ${rule.id}:`, error.message);
    throw error;
  }
});

/**
 * Get all rules
 * @returns {Array} All registered rules
 */
export function getAllRules() {
  return allRules;
}

/**
 * Get rules by stage
 * @param {string} stage - Stage identifier
 * @returns {Array} Rules applicable to the stage
 */
export function getRulesByStage(stage) {
  return allRules.filter(rule => rule.stage === stage || rule.stage === 'all');
}

/**
 * Get rules by category
 * @param {string} category - Category identifier (budget, release, promo)
 * @returns {Array} Rules in the category
 */
export function getRulesByCategory(category) {
  return allRules.filter(rule => rule.category === category);
}

/**
 * Get rule by ID
 * @param {string} ruleId - Rule identifier
 * @returns {Object|null} Rule object or null if not found
 */
export function getRuleById(ruleId) {
  return allRules.find(rule => rule.id === ruleId) || null;
}

/**
 * Get rule count
 * @returns {number} Total number of registered rules
 */
export function getRuleCount() {
  return allRules.length;
}

/**
 * Get rules sorted by priority
 * @param {string} [stage] - Optional stage filter
 * @returns {Array} Rules sorted by priority (lower number = higher priority)
 */
export function getRulesByPriority(stage = null) {
  let rules = stage ? getRulesByStage(stage) : allRules;
  return rules.sort((a, b) => a.priority - b.priority);
}
