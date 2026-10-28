import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateInvoiceTotals } from '../src/utils/calculateInvoiceTotals.js';

test('Invoice Calculation Engine: matches template sample data (₹200.00)', () => {
  // Matches user's template: 1 web hosting @ 200.00, discount 0, tax 0%
  const result = calculateInvoiceTotals({
    items: [{ description: 'web hosting', quantity: 1, unitPrice: 200 }],
    discount: 0,
    taxRate: 0,
  });

  assert.equal(result.items[0].amount, 200.0);
  assert.equal(result.subtotal, 200.0);
  assert.equal(result.discount, 0);
  assert.equal(result.taxRate, 0);
  assert.equal(result.taxAmount, 0);
  assert.equal(result.totalAmount, 200.0);
});

test('Invoice Calculation Engine: multi-item with discount and tax rounding', () => {
  const result = calculateInvoiceTotals({
    items: [
      { description: 'UI/UX Design', quantity: 10, unitPrice: 15.55 }, // 155.50
      { description: 'Server Setup', quantity: 2, unitPrice: 49.99 },  // 99.98
    ],
    discount: 25.0, // Subtotal: 255.48 -> Taxable: 230.48
    taxRate: 18.0,  // 18% GST of 230.48 = 41.4864 -> 41.49
  });

  assert.equal(result.items[0].amount, 155.5);
  assert.equal(result.items[1].amount, 99.98);
  assert.equal(result.subtotal, 255.48);
  assert.equal(result.discount, 25.0);
  assert.equal(result.taxAmount, 41.49);
  assert.equal(result.totalAmount, 271.97); // 230.48 + 41.49
});

test('Invoice Calculation Engine: discount cannot exceed subtotal and negative values are clamped', () => {
  const result = calculateInvoiceTotals({
    items: [{ description: 'Consulting', quantity: 1, unitPrice: 100 }],
    discount: 500, // Exceeds subtotal
    taxRate: -5,   // Negative tax
  });

  assert.equal(result.subtotal, 100);
  assert.equal(result.discount, 100); // Clamped to subtotal
  assert.equal(result.taxRate, 0);     // Clamped to 0
  assert.equal(result.taxAmount, 0);
  assert.equal(result.totalAmount, 0);
});

