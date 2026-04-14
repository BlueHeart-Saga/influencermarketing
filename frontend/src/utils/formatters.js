/**
 * Formats a number into a shorter version with K, M, B suffixes.
 * Rounds to 2 decimal places by default.
 * 
 * @param {number|string} number - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export const formatCompactNumber = (number, decimals = 2) => {
    if (number === null || number === undefined || isNaN(number)) return '0';
    const num = typeof number === 'string' ? parseFloat(number.replace(/[^0-9.-]+/g, '')) || 0 : number;

    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: decimals,
    }).format(num);
};

/**
 * Formats a number as currency with compact notation for large values.
 * Ensures the value fits in boxes and stays readable.
 * 
 * @param {number|string} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'INR')
 * @param {Object} symbols - Mapping of currency codes to symbols
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD', symbols = {}) => {
    if (amount === null || amount === undefined) return '';

    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0 : amount;
    const symbol = symbols[currencyCode] || '';

    // Use compact notation for large numbers (>= 1,000,000) or as requested by USER
    // The USER mentioned overflow with many digits, so we'll use compact for anything over 9999
    const useCompact = Math.abs(num) >= 10000;

    const formatted = new Intl.NumberFormat('en-US', {
        notation: useCompact ? 'compact' : 'standard',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);

    return `${symbol}${formatted}`;
};
