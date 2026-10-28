/**
 * Currency formatting utility
 * Aligned with tortillon template (INR default with ₹ symbol)
 */

export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (err) {
    // Fallback if currency symbol not available
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${numericAmount.toFixed(2)}`;
  }
};
