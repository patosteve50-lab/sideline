/**
 * Tests for Stage Calculator
 */

import { calculateStage, getStageDisplayName, getStageThresholds, STAGES } from '../../src/engine/stage-calculator.js';

describe('Stage Calculator', () => {
  describe('calculateStage', () => {
    test('should return BEDROOM for 0-499 listeners', () => {
      expect(calculateStage(0)).toBe(STAGES.BEDROOM);
      expect(calculateStage(250)).toBe(STAGES.BEDROOM);
      expect(calculateStage(499)).toBe(STAGES.BEDROOM);
    });

    test('should return LOCAL for 500-4999 listeners', () => {
      expect(calculateStage(500)).toBe(STAGES.RISING);
      expect(calculateStage(2500)).toBe(STAGES.RISING);
      expect(calculateStage(4999)).toBe(STAGES.RISING);
    });

    test('should return REGIONAL for 5000-24999 listeners', () => {
      expect(calculateStage(5000)).toBe(STAGES.ESTABLISHED);
      expect(calculateStage(15000)).toBe(STAGES.ESTABLISHED);
      expect(calculateStage(24999)).toBe(STAGES.ESTABLISHED);
    });

    test('should return BREAKING for 25000+ listeners', () => {
      expect(calculateStage(25000)).toBe(STAGES.BREAKOUT);
      expect(calculateStage(50000)).toBe(STAGES.BREAKOUT);
      expect(calculateStage(1000000)).toBe(STAGES.BREAKOUT);
    });

    test('should throw error for negative listeners', () => {
      expect(() => calculateStage(-1)).toThrow('Monthly listeners cannot be negative');
    });

    test('should handle boundary values correctly', () => {
      expect(calculateStage(499)).toBe(STAGES.BEDROOM);
      expect(calculateStage(500)).toBe(STAGES.RISING);
      expect(calculateStage(4999)).toBe(STAGES.RISING);
      expect(calculateStage(5000)).toBe(STAGES.ESTABLISHED);
      expect(calculateStage(24999)).toBe(STAGES.ESTABLISHED);
      expect(calculateStage(25000)).toBe(STAGES.BREAKOUT);
    });
  });

  describe('getStageDisplayName', () => {
    test('should return correct display names', () => {
      expect(getStageDisplayName(STAGES.BEDROOM)).toBe('Bedroom');
      expect(getStageDisplayName(STAGES.RISING)).toBe('Rising');
      expect(getStageDisplayName(STAGES.ESTABLISHED)).toBe('Established');
      expect(getStageDisplayName(STAGES.BREAKOUT)).toBe('Breakout');
    });

    test('should return Unknown for invalid stage', () => {
      expect(getStageDisplayName('invalid')).toBe('Unknown');
    });
  });

  describe('getStageThresholds', () => {
    test('should return correct thresholds for each stage', () => {
      expect(getStageThresholds(STAGES.BEDROOM)).toEqual({ min: 0, max: 500 });
      expect(getStageThresholds(STAGES.RISING)).toEqual({ min: 500, max: 5000 });
      expect(getStageThresholds(STAGES.ESTABLISHED)).toEqual({ min: 5000, max: 25000 });
      expect(getStageThresholds(STAGES.BREAKOUT)).toEqual({ min: 25000, max: Infinity });
    });
  });
});
