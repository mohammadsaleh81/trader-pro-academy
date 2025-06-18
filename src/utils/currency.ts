/**
 * Currency formatting utilities for Iranian Toman
 */

/**
 * Format number using Persian locale
 */
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

/**
 * Format currency with Toman unit
 */
export const formatCurrency = (amount: number): string => {
  return `${formatNumber(amount)} تومان`;
};

/**
 * Format price with optional discount
 */
export const formatPrice = (
  amount: number | string, 
  isFree: boolean = false,
  discountedPrice?: number,
  discountPercentage?: number
): string => {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Force check for zero value explicitly
  if (isFree || numAmount === 0 || numAmount === null || numAmount === undefined || isNaN(numAmount)) {
    return "دوره رایگان";
  }

  // If there's a discount, show both original and discounted prices
  if (discountPercentage && discountPercentage > 0 && discountedPrice) {
    return `${formatCurrency(discountedPrice)} (${discountPercentage}% تخفیف)`;
  }
  
  return formatCurrency(numAmount);
};

/**
 * Format large numbers with proper Persian formatting
 */
export const formatLargeNumber = (amount: number): string => {
  if (amount >= 1000000) {
    return `${formatNumber(Math.floor(amount / 1000000))} میلیون`;
  } else if (amount >= 1000) {
    return `${formatNumber(Math.floor(amount / 1000))} هزار`;
  }
  return formatNumber(amount);
}; 