/**
 * Rule Evaluator
 * Evaluates rules against creator profile and planned move
 */

import { calculateStage } from './stage-calculator.js';
import { getRulesByPriority } from './rule-registry.js';
import { SEVERITY } from './rules/rule-types.js';

/**
 * Evaluate all applicable rules for a planned move
 * @param {Object} creatorProfile - Creator profile with metrics and stage
 * @param {Object} plannedMove - Planned move to evaluate
 * @returns {Object} Assessment result with triggered rules
 */
export function evaluateMove(creatorProfile, plannedMove) {
  // Calculate current stage if not already set
  if (!creatorProfile.stage) {
    creatorProfile.stage = calculateStage(creatorProfile.metrics.monthlyListeners);
  }

  // Get applicable rules sorted by priority
  const applicableRules = getRulesByPriority(creatorProfile.stage);

  // Evaluate each rule
  const triggeredRules = [];
  
  for (const rule of applicableRules) {
    try {
      // Check if rule triggers
      const isTriggered = rule.trigger(creatorProfile, plannedMove);
      
      if (isTriggered) {
        // Generate block reason
        const reason = rule.blockReason(creatorProfile, plannedMove);
        
        // Generate redirect action prompt if it's a function
        let redirectAction = rule.redirectAction;
        if (typeof redirectAction.prompt === 'function') {
          redirectAction = {
            ...redirectAction,
            prompt: redirectAction.prompt(creatorProfile, plannedMove)
          };
        }
        
        triggeredRules.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          triggered: true,
          reason: reason,
          redirectAction: redirectAction
        });
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      // Continue evaluating other rules
    }
  }

  // Determine overall decision
  const hasBlockingRules = triggeredRules.some(r => r.severity === SEVERITY.BLOCK);
  const overallDecision = hasBlockingRules ? 'blocked' : 
                         triggeredRules.length > 0 ? 'advisory' : 
                         'approved';

  return {
    stage: creatorProfile.stage,
    overallDecision: overallDecision,
    triggeredRules: triggeredRules,
    blockedRules: triggeredRules.filter(r => r.severity === SEVERITY.BLOCK),
    advisoryRules: triggeredRules.filter(r => r.severity === SEVERITY.ADVISORY),
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evaluate a single rule
 * @param {Object} rule - Rule to evaluate
 * @param {Object} creatorProfile - Creator profile
 * @param {Object} plannedMove - Planned move
 * @returns {Object|null} Rule result or null if not triggered
 */
export function evaluateRule(rule, creatorProfile, plannedMove) {
  // Calculate stage if needed
  if (!creatorProfile.stage) {
    creatorProfile.stage = calculateStage(creatorProfile.metrics.monthlyListeners);
  }

  try {
    const isTriggered = rule.trigger(creatorProfile, plannedMove);
    
    if (!isTriggered) {
      return null;
    }

    const reason = rule.blockReason(creatorProfile, plannedMove);
    
    let redirectAction = rule.redirectAction;
    if (typeof redirectAction.prompt === 'function') {
      redirectAction = {
        ...redirectAction,
        prompt: redirectAction.prompt(creatorProfile, plannedMove)
      };
    }

    return {
      ruleId: rule.id,
      category: rule.category,
      severity: rule.severity,
      triggered: true,
      reason: reason,
      redirectAction: redirectAction
    };
  } catch (error) {
    console.error(`Error evaluating rule ${rule.id}:`, error);
    return null;
  }
}

/**
 * Get summary statistics from assessment
 * @param {Object} assessment - Assessment result from evaluateMove
 * @returns {Object} Summary statistics
 */
export function getAssessmentSummary(assessment) {
  return {
    stage: assessment.stage,
    decision: assessment.overallDecision,
    totalRulesTriggered: assessment.triggeredRules.length,
    blockingRules: assessment.blockedRules.length,
    advisoryRules: assessment.advisoryRules.length,
    categories: {
      budget: assessment.triggeredRules.filter(r => r.category === 'budget').length,
      release: assessment.triggeredRules.filter(r => r.category === 'release').length,
      promo: assessment.triggeredRules.filter(r => r.category === 'promo').length
    }
  };
}
