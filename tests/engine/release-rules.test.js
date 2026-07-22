/**
 * Tests for Release Rules
 */

import { releaseRules } from '../../src/engine/rules/release-rules.js';
import { STAGES } from '../../src/engine/stage-calculator.js';
import { SEVERITY } from '../../src/engine/rules/rule-types.js';
import {
  bedroomArtist,
  bedroomArtistWithCapture,
  localArtist,
  localArtistNoCapture,
  regionalArtist,
  albumReleaseLowListeners,
  singleReleaseNoCapture,
  singleReleaseTooSoon,
  singleReleaseProperSpacing
} from '../fixtures/sample-profiles.js';

describe('Release Rules', () => {
  describe('Album Minimum Audience Rule', () => {
    test('should block album release below 2,500 listeners', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      
      expect(rule.trigger(bedroomArtist, albumReleaseLowListeners)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(bedroomArtist, albumReleaseLowListeners);
      expect(reason).toContain('2,500');
      expect(reason).toContain('250');
      expect(reason).toContain('Arithmetic');
    });

    test('should block EP release below 2,500 listeners', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      
      const epRelease = {
        ...albumReleaseLowListeners,
        releaseDetails: {
          format: 'EP',
          trackCount: 5,
          releaseDate: '2026-10-01'
        }
      };
      
      expect(rule.trigger(bedroomArtist, epRelease)).toBe(true);
      
      const reason = rule.blockReason(bedroomArtist, epRelease);
      expect(reason).toContain('EP');
      expect(reason).toContain('2,500');
    });

    test('should not trigger for single releases', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      
      expect(rule.trigger(bedroomArtist, singleReleaseNoCapture)).toBe(false);
    });

    test('should not trigger for album at 2,500+ listeners', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      
      const artistWith2500 = {
        ...localArtist,
        metrics: { ...localArtist.metrics, monthlyListeners: 2500 }
      };
      
      expect(rule.trigger(artistWith2500, albumReleaseLowListeners)).toBe(false);
    });

    test('should calculate streams per track in block reason', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      
      const reason = rule.blockReason(bedroomArtist, albumReleaseLowListeners);
      expect(reason).toMatch(/~\d+ streams/);
      expect(reason).toContain('Arithmetic');
    });

    test('should apply to all stages', () => {
      const rule = releaseRules.find(r => r.id === 'release-album-minimum-audience');
      expect(rule.stage).toBe('all');
    });
  });

  describe('Release Requires Capture Rule', () => {
    test('should block release without email or WhatsApp list', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      
      expect(rule.trigger(bedroomArtist, singleReleaseNoCapture)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(bedroomArtist, singleReleaseNoCapture);
      expect(reason).toContain('zero owned audience capture');
      expect(reason).toContain('Arithmetic');
    });

    test('should not trigger if artist has email list', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      
      expect(rule.trigger(bedroomArtistWithCapture, singleReleaseNoCapture)).toBe(false);
    });

    test('should not trigger if artist has WhatsApp list', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      
      const artistWithWhatsApp = {
        ...bedroomArtist,
        audienceCapture: {
          hasEmailList: false,
          emailListSize: 0,
          hasWhatsApp: true,
          whatsappListSize: 50
        }
      };
      
      expect(rule.trigger(artistWithWhatsApp, singleReleaseNoCapture)).toBe(false);
    });

    test('should calculate potential capture value in block reason', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      
      const reason = rule.blockReason(localArtistNoCapture, singleReleaseNoCapture);
      expect(reason).toMatch(/\$\d+/); // Contains dollar amounts
      expect(reason).toContain('Arithmetic');
      expect(reason).toContain('5%'); // Conservative engagement rate
    });

    test('should only trigger for release type moves', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      
      const nonReleaseMove = {
        type: 'promo',
        budget: 200
      };
      
      expect(rule.trigger(bedroomArtist, nonReleaseMove)).toBe(false);
    });

    test('should apply to all stages', () => {
      const rule = releaseRules.find(r => r.id === 'release-requires-capture');
      expect(rule.stage).toBe('all');
    });
  });

  describe('Release Spacing Minimum Rule', () => {
    test('should block releases under 6 weeks apart at bedroom stage', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      expect(rule.trigger(bedroomArtist, singleReleaseTooSoon)).toBe(true);
      expect(rule.severity).toBe(SEVERITY.BLOCK);
      
      const reason = rule.blockReason(bedroomArtist, singleReleaseTooSoon);
      expect(reason).toContain('6 weeks');
      expect(reason).toContain('Arithmetic');
    });

    test('should block releases under 6 weeks apart at local stage', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      expect(rule.trigger(localArtist, singleReleaseTooSoon)).toBe(true);
    });

    test('should not trigger at regional stage', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      expect(rule.trigger(regionalArtist, singleReleaseTooSoon)).toBe(false);
    });

    test('should not trigger for releases 6+ weeks apart', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      expect(rule.trigger(bedroomArtist, singleReleaseProperSpacing)).toBe(false);
    });

    test('should not trigger if no lastReleaseDate provided', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      const releaseWithoutHistory = {
        ...singleReleaseNoCapture,
        releaseDetails: {
          format: 'single',
          trackCount: 1,
          releaseDate: '2026-09-01'
        }
      };
      
      expect(rule.trigger(bedroomArtist, releaseWithoutHistory)).toBe(false);
    });

    test('should calculate days and weeks in block reason', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      const reason = rule.blockReason(bedroomArtist, singleReleaseTooSoon);
      expect(reason).toMatch(/\d+\.\d+ weeks/);
      expect(reason).toMatch(/\d+ days/);
      expect(reason).toContain('Arithmetic');
      expect(reason).toContain('28 days'); // Playlist discovery window
    });

    test('should not trigger for non-release moves', () => {
      const rule = releaseRules.find(r => r.id === 'release-spacing-minimum');
      
      const promoMove = {
        type: 'promo',
        budget: 200
      };
      
      expect(rule.trigger(bedroomArtist, promoMove)).toBe(false);
    });
  });

  describe('Block Reasons', () => {
    test('all block reasons should include arithmetic calculations', () => {
      const testCases = [
        { rule: 'release-album-minimum-audience', profile: bedroomArtist, move: albumReleaseLowListeners },
        { rule: 'release-requires-capture', profile: bedroomArtist, move: singleReleaseNoCapture },
        { rule: 'release-spacing-minimum', profile: bedroomArtist, move: singleReleaseTooSoon }
      ];

      testCases.forEach(({ rule: ruleId, profile, move }) => {
        const rule = releaseRules.find(r => r.id === ruleId);
        if (rule.trigger(profile, move)) {
          const reason = rule.blockReason(profile, move);
          
          expect(reason).toContain('Arithmetic');
          expect(reason.length).toBeGreaterThan(100);
        }
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

      releaseRules.forEach(rule => {
        const reason = rule.blockReason(bedroomArtist, albumReleaseLowListeners);
        
        fabricatedPhrases.forEach(phrase => {
          expect(reason).not.toMatch(phrase);
        });
      });
    });

    test('block reasons should include heuristic labels', () => {
      releaseRules.forEach(rule => {
        const testMove = albumReleaseLowListeners;
        
        if (rule.trigger(bedroomArtist, testMove)) {
          const reason = rule.blockReason(bedroomArtist, testMove);
          expect(reason).toMatch(/Heuristic/i);
        }
      });
    });
  });

  describe('Redirect Actions', () => {
    test('all rules should have redirect actions', () => {
      releaseRules.forEach(rule => {
        expect(rule.redirectAction).toBeDefined();
        expect(rule.redirectAction.type).toBe('creative_generation');
        expect(rule.redirectAction.outputFormat).toBeDefined();
        expect(rule.redirectAction.constraints).toBeDefined();
      });
    });

    test('redirect action prompts should be functions', () => {
      releaseRules.forEach(rule => {
        expect(typeof rule.redirectAction.prompt).toBe('function');
      });
    });

    test('function prompts should generate valid strings', () => {
      releaseRules.forEach(rule => {
        const prompt = rule.redirectAction.prompt(bedroomArtist, albumReleaseLowListeners);
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Rule Count and Coverage', () => {
    test('should have 3 release rules total', () => {
      expect(releaseRules.length).toBe(3);
    });

    test('all rules should apply to all stages or specific stages', () => {
      releaseRules.forEach(rule => {
        expect(['all', STAGES.BEDROOM, STAGES.LOCAL, STAGES.REGIONAL, STAGES.BREAKING]).toContain(rule.stage);
      });
    });

    test('all rules should have unique IDs', () => {
      const ids = releaseRules.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(releaseRules.length);
    });

    test('all rules should be blocking severity', () => {
      releaseRules.forEach(rule => {
        expect(rule.severity).toBe(SEVERITY.BLOCK);
      });
    });
  });
});
