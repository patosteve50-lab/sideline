/**
 * Formatting Utilities
 * Consistent formatting for currency, numbers, and percentages
 */

/**
 * Format currency with thousands separators
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return currency === 'USD' ? `$${formatted}` : `${formatted} ${currency}`;
}

/**
 * Format number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 * @param {number} value - Decimal value (e.g., 0.05 for 5%)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format decimal to fixed places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatDecimal(value, decimals = 2) {
  return value.toFixed(decimals);
}
