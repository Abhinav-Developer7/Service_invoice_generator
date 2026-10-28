/**
 * Financial Calculation Engine
 * Aligned with GEMINI.md Section 3.7
 * Backend-authoritative with strict 2-decimal rounding.
 */

export const calculateInvoiceTotals = ({
  items = [],
  discount = 0,
  taxRate = 0,
}) => {
  // Recalculate line amounts from validated quantity and unit price
  const calculatedItems = items.map((item, index) => {
    const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    const unitPrice = Number(item.unitPrice) >= 0 ? Number(item.unitPrice) : 0;
    const amount = Number((quantity * unitPrice).toFixed(2));

    return {
      description: item.description?.trim() || `Item #${index + 1}`,
      quantity,
      unitPrice,
      amount,
    };
  });

  // Subtotal = sum of all line amounts
  const subtotal = Number(
    calculatedItems.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)
  );

  // Discount cannot exceed subtotal and cannot be negative
  const safeDiscount = Math.min(
    subtotal,
    Math.max(0, Number(Number(discount).toFixed(2)) || 0)
  );

  // Taxable amount = subtotal - discount
  const taxableAmount = Number(Math.max(0, subtotal - safeDiscount).toFixed(2));

  // Tax Rate (%)
  const safeTaxRate = Math.max(0, Number(Number(taxRate).toFixed(2)) || 0);

  // Tax amount = taxable amount * (taxRate / 100)
  const taxAmount = Number(((taxableAmount * safeTaxRate) / 100).toFixed(2));

  // Total amount = taxable amount + tax amount
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    items: calculatedItems,
    subtotal,
    discount: safeDiscount,
    taxRate: safeTaxRate,
    taxAmount,
    totalAmount,
  };
};

