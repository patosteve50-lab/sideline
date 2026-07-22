/**
 * Stage Calculator
 * Determines creator stage based on monthly listeners
 */

export const STAGES = {
  BEDROOM: 'bedroom',
  RISING: 'rising',
  ESTABLISHED: 'established',
  BREAKOUT: 'breakout'
};

export const STAGE_THRESHOLDS = {
  [STAGES.BEDROOM]: { min: 0, max: 500 },
  [STAGES.RISING]: { min: 500, max: 5000 },
  [STAGES.ESTABLISHED]: { min: 5000, max: 25000 },
  [STAGES.BREAKOUT]: { min: 25000, max: Infinity }
};

/**
 * Calculate creator stage based on monthly listeners
 * @param {number} monthlyListeners - Number of monthly listeners
 * @returns {string} Stage identifier (bedroom, rising, established, breakout)
 */
export function calculateStage(monthlyListeners) {
  if (monthlyListeners < 0) {
    throw new Error('Monthly listeners cannot be negative');
  }

  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.RISING].min) {
    return STAGES.BEDROOM;
  }
  
  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.ESTABLISHED].min) {
    return STAGES.RISING;
  }
  
  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.BREAKOUT].min) {
    return STAGES.ESTABLISHED;
  }
  
  return STAGES.BREAKOUT;
}

/**
 * Get stage display name
 * @param {string} stage - Stage identifier
 * @returns {string} Display name
 */
export function getStageDisplayName(stage) {
  const names = {
    [STAGES.BEDROOM]: 'Bedroom',
    [STAGES.RISING]: 'Rising',
    [STAGES.ESTABLISHED]: 'Established',
    [STAGES.BREAKOUT]: 'Breakout'
  };
  return names[stage] || 'Unknown';
}

/**
 * Get stage threshold information
 * @param {string} stage - Stage identifier
 * @returns {object} Threshold information
 */
export function getStageThresholds(stage) {
  return STAGE_THRESHOLDS[stage];
}
