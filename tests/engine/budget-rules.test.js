/**
 * Tests for Budget Rules
 */

import { budgetRules } from '../../src/engine/rules/budget-rules.js';
import { STAGES } from '../../src/engine/stage-calculator.js';
import { SEVERITY } from '../../src/engine/rules/rule-types.js';
import {
  bedroomArtist,
  localArtist,
  regionalArtist,
  breakingArtist,
  bedroomExpensiveVideo,
  bedroomOverBudgetLineItem,
  bedroomValidBudget,
  localExpensiveVideo,
  localValidVideo,
  regionalOverBudget,
  regionalShortPR,
  regionalValidPR,
  breakingHighBudget
} from '../fixtures/sample-profiles.js';

describe('Budget Rules', () => {
  describe('Bedroom Stage Rules', () => {
    test('bedroomTotalBudgetCap should block budget over $150', () => {
      const rule = budgetRules.find(r => r.id === 'budget-bedroom-total-cap');
      
      expect(rule.trigger(bedroomArtist, bedroomExpensiveVideo)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(bedroomArtist, bedroomExpensiveVideo);
      expect(reason).toContain('$150');
      expect(reason).toContain('$300');
      expect(reason).toContain('Arithmetic');
    });

    test('bedroomTotalBudgetCap should not trigger for valid budget', () => {
      const rule = budgetRules.find(r => r.id === 'budget-bedroom-total-cap');
      
      expect(rule.trigger(bedroomArtist, bedroomValidBudget)).toBe(false);
    });

    test('bedroomLineItemCap should block line items over $75', () => {
      const rule = budgetRules.find(r => r.id === 'budget-bedroom-line-item');
      
      expect(rule.trigger(bedroomArtist, bedroomOverBudgetLineItem)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(bedroomArtist, bedroomOverBudgetLineItem);
      expect(reason).toContain('$75');
      expect(reason).toContain('$100');
      expect(reason).toContain('Professional Videographer');
    });

    test('bedroomLineItemCap should not trigger for valid line items', () => {
      const rule = budgetRules.find(r => r.id === 'budget-bedroom-line-item');
      
      expect(rule.trigger(bedroomArtist, bedroomValidBudget)).toBe(false);
    });

    test('bedroom rules should have redirect actions with prompts', () => {
      const totalCapRule = budgetRules.find(r => r.id === 'budget-bedroom-total-cap');
      const lineItemRule = budgetRules.find(r => r.id === 'budget-bedroom-line-item');
      
      expect(totalCapRule.redirectAction).toBeDefined();
      expect(totalCapRule.redirectAction.prompt).toBeDefined();
      expect(totalCapRule.redirectAction.outputFormat).toBeDefined();
      
      expect(lineItemRule.redirectAction).toBeDefined();
      expect(lineItemRule.redirectAction.prompt).toBeDefined();
      expect(lineItemRule.redirectAction.outputFormat).toBeDefined();
    });
  });

  describe('Local Stage Rules', () => {
    test('localTotalBudgetCap should block budget over $400', () => {
      const rule = budgetRules.find(r => r.id === 'budget-local-total-cap');
      
      const overBudgetMove = { ...localValidVideo, budget: 500 };
      expect(rule.trigger(localArtist, overBudgetMove)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(localArtist, overBudgetMove);
      expect(reason).toContain('$400');
      expect(reason).toContain('$500');
      expect(reason).toContain('Arithmetic');
    });

    test('localTotalBudgetCap should not trigger for valid budget', () => {
      const rule = budgetRules.find(r => r.id === 'budget-local-total-cap');
      
      expect(rule.trigger(localArtist, localValidVideo)).toBe(false);
    });

    test('localVideoBudgetCap should block video spend over $200', () => {
      const rule = budgetRules.find(r => r.id === 'budget-local-video-cap');
      
      expect(rule.trigger(localArtist, localExpensiveVideo)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(localArtist, localExpensiveVideo);
      expect(reason).toContain('$200');
      expect(reason).toContain('$250');
      expect(reason).toContain('Music Video Production');
    });

    test('localVideoBudgetCap should not trigger for valid video budget', () => {
      const rule = budgetRules.find(r => r.id === 'budget-local-video-cap');
      
      expect(rule.trigger(localArtist, localValidVideo)).toBe(false);
    });

    test('localVideoBudgetCap should detect video items by name', () => {
      const rule = budgetRules.find(r => r.id === 'budget-local-video-cap');
      
      const videoMove = {
        budget: 300,
        lineItems: [
          { name: 'Visual Content', amount: 220, category: 'content' }
        ]
      };
      
      expect(rule.trigger(localArtist, videoMove)).toBe(true);
    });
  });

  describe('Regional Stage Rules', () => {
    test('regionalTotalBudgetCap should block budget over $1,500', () => {
      const rule = budgetRules.find(r => r.id === 'budget-regional-total-cap');
      
      expect(rule.trigger(regionalArtist, regionalOverBudget)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(regionalArtist, regionalOverBudget);
      expect(reason).toContain('$1,500');
      expect(reason).toContain('$2,000');
      expect(reason).toContain('Arithmetic');
    });

    test('regionalTotalBudgetCap should not trigger for valid budget', () => {
      const rule = budgetRules.find(r => r.id === 'budget-regional-total-cap');
      
      expect(rule.trigger(regionalArtist, regionalValidPR)).toBe(false);
    });

    test('regionalPRRetainerMinimum should block PR under 3 months', () => {
      const rule = budgetRules.find(r => r.id === 'budget-regional-pr-minimum');
      
      expect(rule.trigger(regionalArtist, regionalShortPR)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(regionalArtist, regionalShortPR);
      expect(reason).toContain('3 months');
      expect(reason).toContain('2 months');
      expect(reason).toContain('Arithmetic');
    });

    test('regionalPRRetainerMinimum should not trigger for 3+ month PR', () => {
      const rule = budgetRules.find(r => r.id === 'budget-regional-pr-minimum');
      
      expect(rule.trigger(regionalArtist, regionalValidPR)).toBe(false);
    });

    test('regionalPRRetainerMinimum should detect PR items by name', () => {
      const rule = budgetRules.find(r => r.id === 'budget-regional-pr-minimum');
      
      const prMove = {
        budget: 1000,
        lineItems: [
          { name: 'Publicist Services', amount: 800, category: 'marketing', duration: '1 month' }
        ]
      };
      
      expect(rule.trigger(regionalArtist, prMove)).toBe(true);
    });
  });

  describe('Breaking Stage Rules', () => {
    test('breakingBudgetAdvisory should trigger for budget over $5,000', () => {
      const rule = budgetRules.find(r => r.id === 'budget-breaking-advisory');
      
      expect(rule.trigger(breakingArtist, breakingHighBudget)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.ADVISORY);
      
      const reason = rule.blockReason(breakingArtist, breakingHighBudget);
      expect(reason).toContain('$5,000');
      expect(reason).toContain('$8,000');
      expect(reason).toContain('Advisory');
      expect(reason).toContain('Arithmetic');
    });

    test('breakingBudgetAdvisory should not trigger for budget under $5,000', () => {
      const rule = budgetRules.find(r => r.id === 'budget-breaking-advisory');
      
      const validMove = { ...breakingHighBudget, budget: 4500 };
      expect(rule.trigger(breakingArtist, validMove)).toBe(false);
    });

    test('breakingBudgetAdvisory should be advisory, not blocking', () => {
      const rule = budgetRules.find(r => r.id === 'budget-breaking-advisory');
      
      expect(rule.severity).toBe(SEVERITY.ADVISORY);
    });
  });

  describe('Stage Specificity', () => {
    test('bedroom rules should only apply to bedroom stage', () => {
      const bedroomRules = budgetRules.filter(r => r.stage === STAGES.BEDROOM);
      
      bedroomRules.forEach(rule => {
        expect(rule.trigger(localArtist, bedroomExpensiveVideo)).toBe(false);
        expect(rule.trigger(regionalArtist, bedroomExpensiveVideo)).toBe(false);
        expect(rule.trigger(breakingArtist, bedroomExpensiveVideo)).toBe(false);
      });
    });

    test('local rules should only apply to local stage', () => {
      const localRules = budgetRules.filter(r => r.stage === STAGES.LOCAL);
      
      localRules.forEach(rule => {
        expect(rule.trigger(bedroomArtist, localExpensiveVideo)).toBe(false);
        expect(rule.trigger(regionalArtist, localExpensiveVideo)).toBe(false);
        expect(rule.trigger(breakingArtist, localExpensiveVideo)).toBe(false);
      });
    });

    test('regional rules should only apply to regional stage', () => {
      const regionalRules = budgetRules.filter(r => r.stage === STAGES.REGIONAL);
      
      regionalRules.forEach(rule => {
        expect(rule.trigger(bedroomArtist, regionalOverBudget)).toBe(false);
        expect(rule.trigger(localArtist, regionalOverBudget)).toBe(false);
        expect(rule.trigger(breakingArtist, regionalOverBudget)).toBe(false);
      });
    });
  });

  describe('Block Reasons', () => {
    test('all block reasons should include arithmetic calculations', () => {
      const testCases = [
        { rule: 'budget-bedroom-total-cap', profile: bedroomArtist, move: bedroomExpensiveVideo },
        { rule: 'budget-bedroom-line-item', profile: bedroomArtist, move: bedroomOverBudgetLineItem },
        { rule: 'budget-local-total-cap', profile: localArtist, move: { ...localValidVideo, budget: 500 } },
        { rule: 'budget-local-video-cap', profile: localArtist, move: localExpensiveVideo },
        { rule: 'budget-regional-total-cap', profile: regionalArtist, move: regionalOverBudget },
        { rule: 'budget-regional-pr-minimum', profile: regionalArtist, move: regionalShortPR },
        { rule: 'budget-breaking-advisory', profile: breakingArtist, move: breakingHighBudget }
      ];

      testCases.forEach(({ rule: ruleId, profile, move }) => {
        const rule = budgetRules.find(r => r.id === ruleId);
        const reason = rule.blockReason(profile, move);
        
        expect(reason).toContain('Arithmetic');
        expect(reason).toMatch(/\$\d+/); // Contains dollar amounts
        expect(reason.length).toBeGreaterThan(100); // Substantial explanation
      });
    });

    test('block reasons should not contain fabricated statistics', () => {
      const fabricatedPhrases = [
        /\d+% of artists/i,
        /\d+% success rate/i,
        /\d+% failure rate/i,
        /data shows \d+%/i,
        /studies show/i,
        /research indicates/i
      ];

      budgetRules.forEach(rule => {
        const reason = rule.blockReason(bedroomArtist, bedroomExpensiveVideo);
        
        fabricatedPhrases.forEach(phrase => {
          expect(reason).not.toMatch(phrase);
        });
      });
    });

    test('block reasons should include heuristic labels', () => {
      budgetRules.forEach(rule => {
        const testProfile = rule.stage === STAGES.BEDROOM ? bedroomArtist :
                          rule.stage === STAGES.LOCAL ? localArtist :
                          rule.stage === STAGES.REGIONAL ? regionalArtist :
                          breakingArtist;
        
        const testMove = bedroomExpensiveVideo;
        
        if (rule.trigger(testProfile, testMove)) {
          const reason = rule.blockReason(testProfile, testMove);
          expect(reason).toMatch(/Heuristic|Advisory/i);
        }
      });
    });
  });

  describe('Redirect Actions', () => {
    test('all rules should have redirect actions', () => {
      budgetRules.forEach(rule => {
        expect(rule.redirectAction).toBeDefined();
        expect(rule.redirectAction.type).toBe('creative_generation');
        expect(rule.redirectAction.outputFormat).toBeDefined();
        expect(rule.redirectAction.constraints).toBeDefined();
      });
    });

    test('redirect action prompts should be functions or strings', () => {
      budgetRules.forEach(rule => {
        const promptType = typeof rule.redirectAction.prompt;
        expect(['function', 'string']).toContain(promptType);
      });
    });

    test('function prompts should generate valid strings', () => {
      budgetRules.forEach(rule => {
        if (typeof rule.redirectAction.prompt === 'function') {
          const prompt = rule.redirectAction.prompt(bedroomArtist, bedroomExpensiveVideo);
          expect(typeof prompt).toBe('string');
          expect(prompt.length).toBeGreaterThan(50);
        }
      });
    });
  });

  describe('Rule Count and Coverage', () => {
    test('should have 7 budget rules total', () => {
      expect(budgetRules.length).toBe(7);
    });

    test('should have 2 bedroom rules', () => {
      const bedroomRules = budgetRules.filter(r => r.stage === STAGES.BEDROOM);
      expect(bedroomRules.length).toBe(2);
    });

    test('should have 2 local rules', () => {
      const localRules = budgetRules.filter(r => r.stage === STAGES.LOCAL);
      expect(localRules.length).toBe(2);
    });

    test('should have 2 regional rules', () => {
      const regionalRules = budgetRules.filter(r => r.stage === STAGES.REGIONAL);
      expect(regionalRules.length).toBe(2);
    });

    test('should have 1 breaking rule', () => {
      const breakingRules = budgetRules.filter(r => r.stage === STAGES.BREAKING);
      expect(breakingRules.length).toBe(1);
    });

    test('all rules should have unique IDs', () => {
      const ids = budgetRules.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(budgetRules.length);
    });
  });
});
