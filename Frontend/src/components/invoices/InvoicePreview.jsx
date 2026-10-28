import React from 'react';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';

export default function InvoicePreview({ invoice }) {
  // Fallbacks if data is still loading or empty
  const company = invoice?.companySnapshot || {
    name: 'tortillon',
    email: 'info@tortillon.in',
    phone: '9999999999',
    address: 'Raimund building 3rd floor,thrissur,kerala',
    logoText: 'tortillon',
  };

  const client = invoice?.clientSnapshot || {
    name: 'ABC Technologies',
    email: 'john@example.com',
    phone: '9876543210',
    address: '',
  };

  const items = invoice?.items?.length
    ? invoice.items
    : [{ description: 'web hosting', quantity: 1, unitPrice: 200, amount: 200 }];

  const currency = invoice?.currency || 'INR';
  const subtotal = invoice?.subtotal ?? 200.0;
  const discount = invoice?.discount ?? 0.0;
  const taxRate = invoice?.taxRate ?? 0.0;
  const taxAmount = invoice?.taxAmount ?? 0.0;
  const totalAmount = invoice?.totalAmount ?? 200.0;
  const invoiceNumber = invoice?.invoiceNumber || 'INV-2026-0007';
  const issueDate = invoice?.issueDate ? formatDate(invoice.issueDate) : 'Tue Oct 27 2026';
  const dueDate = invoice?.dueDate ? formatDate(invoice.dueDate) : 'Thu Oct 29 2026';
  const projectName = invoice?.projectName || invoice?.project?.name || '';
  const notes = invoice?.notes || '';

  return (
    <div className="invoice-sheet-container">
      <style>{`
        .invoice-sheet-container {
          background-color: white;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
          padding: 3.5rem 4rem;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3.5rem;
        }

        .company-logo-badge {
          display: inline-block;
          background-color: #000000;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.55rem 0.9rem;
          border-radius: 4px;
          letter-spacing: -0.2px;
          margin-right: 0.85rem;
        }

        .company-brand-row {
          display: flex;
          align-items: flex-start;
        }

        .company-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
          line-height: 1.2;
        }

        .company-meta {
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.5;
        }

        .invoice-title-block {
          text-align: right;
        }

        .invoice-label {
          font-size: 0.95rem;
          font-weight: 600;
         
          color: #0f172a;
          margin: 0 0 0.4rem 0;
          text-transform: uppercase;
        }

        .invoice-number {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .invoice-meta-grid {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3.5rem;
          font-size: 0.875rem;
          flex:1;
        }

        .meta-col-left {
          // flex: 1;
        }

        .meta-col-right {
          width: 320px;
        }

        .meta-section-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .meta-client-name {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .meta-client-text {
          color: #334155;
          line-height: 1.45;
        }

        .meta-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }

        .meta-info-label {
          color: #475569;
          font-weight: 500;
        }

        .meta-info-value {
          color: #0f172a;
          font-weight: 600;
          text-align: right;
        }

        /* Items Table */
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2.5rem;
          font-size: 0.875rem;
        }

        .invoice-table th {
          text-align: left;
          padding: 0.85rem 0.5rem;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.725rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #475569;
          text-transform: uppercase;
        }

        .invoice-table td {
          padding: 1.1rem 0.5rem;
          border-bottom: 1px solid #f1f5f9;
          color: #0f172a;
          vertical-align: top;
        }

        .invoice-table .col-num {
          width: 5%;
          color: #64748b;
        }

        .invoice-table .col-desc {
          width: 55%;
          font-weight: 500;
        }

        .invoice-table .col-rate {
          width: 20%;
          text-align: right;
          color: #334155;
        }

        .invoice-table .col-amount {
          width: 20%;
          text-align: right;
          font-weight: 600;
          color: #0f172a;
        }

        /* Totals Block */
        .invoice-bottom-grid {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4rem;
        }

        .invoice-notes-block {
          flex: 1;
          padding-right: 3rem;
        }

        .invoice-notes-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .invoice-notes-text {
          font-size: 0.825rem;
          color: #475569;
          line-height: 1.5;
        }

        .invoice-totals-block {
          width: 280px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 0.35rem 0;
          font-size: 0.875rem;
          color: #334155;
        }

        .totals-row-label {
          color: #475569;
        }

        .totals-row-val {
          font-weight: 500;
          color: #0f172a;
        }

        .totals-divider {
          border-bottom: 2px solid #000000;
          margin: 0.75rem 0;
        }

        .totals-final-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #000000;
        }

        .invoice-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.85rem;
        }

        @media print {
          body {
            background-color: white !important;
          }
          .invoice-sheet-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="invoice-header">
        <div className="company-brand-row">
          {/* <div className="company-logo-badge">tortillon</div> */}
          <div>
            <h1 className="company-title">{company.name}</h1>
            <div className="company-meta">
              <div>{company.email}</div>
              {company.phone && <div>{company.phone}</div>}
              {company.address && <div>{company.address}</div>}
            </div>
          </div>
        </div>

        <div className="invoice-title-block">
          <div className="invoice-label">Invoice number:</div>
          <div className="invoice-number">{invoiceNumber}</div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="invoice-meta-grid">
        <div className="meta-col-left">
          <div className="meta-section-label">BILL TO</div>
          <div className="meta-client-name">{client.name}</div>
          <div className="meta-client-text">
            {client.email && <div>{client.email}</div>}
            {client.phone && <div>{client.phone}</div>}
            {client.address && <div>{client.address}</div>}
          </div>
        </div>

        <div className="meta-col-right">
          <div className="meta-info-row">
            <span className="meta-info-label">Issue Date</span>
            <span className="meta-info-value">{issueDate}</span>
          </div>
          <div className="meta-info-row">
            <span className="meta-info-label">Due Date</span>
            <span className="meta-info-value">{dueDate}</span>
          </div>
          {projectName && (
            <div className="meta-info-row">
              <span className="meta-info-label">Project</span>
              <span className="meta-info-value">{projectName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th className="col-desc">DESCRIPTION</th>
            <th className="col-rate">RATE</th>
            <th className="col-amount">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="col-num">{idx + 1}</td>
              <td className="col-desc">
                {item.description}
                {item.quantity > 1 && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                    (Qty: {item.quantity})
                  </span>
                )}
              </td>
              <td className="col-rate">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="col-amount">{formatCurrency(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Summary Grid */}
      <div className="invoice-bottom-grid">
        <div className="invoice-notes-block">
          {notes && (
            <>
              <div className="invoice-notes-label">Notes</div>
              <div className="invoice-notes-text">{notes}</div>
            </>
          )}
        </div>

        <div className="invoice-totals-block">
          <div className="totals-row">
            <span className="totals-row-label">Subtotal</span>
            <span className="totals-row-val">{formatCurrency(subtotal, currency)}</span>
          </div>

          <div className="totals-row">
            <span className="totals-row-label">Discount</span>
            <span className="totals-row-val">- {formatCurrency(discount, currency)}</span>
          </div>

          <div className="totals-row">
            <span className="totals-row-label">Tax ({taxRate}%)</span>
            <span className="totals-row-val">{formatCurrency(taxAmount, currency)}</span>
          </div>

          <div className="totals-divider" />

          <div className="totals-final-row">
            <span>Total</span>
            <span>{formatCurrency(totalAmount, currency)}</span>
          </div>
        </div>
      </div>

      {/* Centered Footer */}
      <div className="invoice-footer">
        Thank you for your business.
      </div>
    </div>
  );
}

