/**
 * Stage Calculator
 * Determines creator stage based on monthly listeners
 */

export const STAGES = {
  BEDROOM: 'bedroom',
  LOCAL: 'local',
  REGIONAL: 'regional',
  BREAKING: 'breaking'
};

export const STAGE_THRESHOLDS = {
  [STAGES.BEDROOM]: { min: 0, max: 500 },
  [STAGES.LOCAL]: { min: 500, max: 5000 },
  [STAGES.REGIONAL]: { min: 5000, max: 25000 },
  [STAGES.BREAKING]: { min: 25000, max: Infinity }
};

/**
 * Calculate creator stage based on monthly listeners
 * @param {number} monthlyListeners - Number of monthly listeners
 * @returns {string} Stage identifier (bedroom, local, regional, breaking)
 */
export function calculateStage(monthlyListeners) {
  if (monthlyListeners < 0) {
    throw new Error('Monthly listeners cannot be negative');
  }

  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.LOCAL].min) {
    return STAGES.BEDROOM;
  }
  
  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.REGIONAL].min) {
    return STAGES.LOCAL;
  }
  
  if (monthlyListeners < STAGE_THRESHOLDS[STAGES.BREAKING].min) {
    return STAGES.REGIONAL;
  }
  
  return STAGES.BREAKING;
}

/**
 * Get stage display name
 * @param {string} stage - Stage identifier
 * @returns {string} Display name
 */
export function getStageDisplayName(stage) {
  const names = {
    [STAGES.BEDROOM]: 'Bedroom',
    [STAGES.LOCAL]: 'Local',
    [STAGES.REGIONAL]: 'Regional',
    [STAGES.BREAKING]: 'Breaking'
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
