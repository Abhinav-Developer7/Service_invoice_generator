import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { invoiceApi } from '../../api/invoiceApi.js';
import InvoicePreview from '../../components/invoices/InvoicePreview.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { toInputDateFormat } from '../../utils/date.js';
import { Plus, Trash2, Eye, FileText, CheckCircle } from 'lucide-react';

export default function InvoiceFormPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Form State
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
  });

  const [issueDate, setIssueDate] = useState(toInputDateFormat(new Date()));
  const [dueDate, setDueDate] = useState(
    toInputDateFormat(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );

  const [items, setItems] = useState([
    { description: 'web hosting', quantity: 1, unitPrice: 200 },
  ]);

  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [notes, setNotes] = useState('');

  const [previewTab, setPreviewTab] = useState(false); // Toggle mobile/tablet preview
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing projects for auto-fill
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectApi.getProjects({ limit: 100, status: 'active' });
        if (response.success && response.data?.data) {
          setProjects(response.data.data);
        }
      } catch (err) {
        console.warn('Could not load projects for auto-fill');
      }
    };
    loadProjects();
  }, []);

  // When project selected, auto-populate client details
  const handleProjectSelect = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);

    const found = projects.find((p) => p._id === projId);
    if (found) {
      setClient({
        name: found.clientName || '',
        email: found.clientEmail || '',
        phone: found.clientPhone || '',
        address: found.clientAddress || '',
        taxId: found.clientTaxId || '',
      });
    }
  };

  // Line Items Handlers
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Instant Client Calculations (matches backend calculateInvoiceTotals)
  const calculatedItems = items.map((item) => {
    const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    const price = Number(item.unitPrice) >= 0 ? Number(item.unitPrice) : 0;
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      amount: Number((qty * price).toFixed(2)),
    };
  });

  const subtotal = Number(
    calculatedItems.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)
  );
  const safeDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxableAmount = Number(Math.max(0, subtotal - safeDiscount).toFixed(2));
  const safeTaxRate = Math.max(0, Number(taxRate) || 0);
  const taxAmount = Number(((taxableAmount * safeTaxRate) / 100).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  // Live Invoice Snapshot for the Preview
  const selectedProjectObj = projects.find((p) => p._id === selectedProjectId);
  const livePreviewInvoice = {
    invoiceNumber: 'INV-PREVIEW',
    companySnapshot: {
      name: 'tortillon',
      email: 'info@tortillon.in',
      phone: '8086939423',
      address: 'Raimund building 3rd floor,thrissur,kerala',
    },
    clientSnapshot: client.name
      ? client
      : {
          name: 'ABC Technologies',
          email: 'john@example.com',
          phone: '9876543210',
          address: '',
        },
    projectName: selectedProjectObj?.name || '',
    issueDate,
    dueDate,
    items: calculatedItems,
    subtotal,
    discount: safeDiscount,
    taxRate: safeTaxRate,
    taxAmount,
    totalAmount,
    currency,
    notes,
  };

  const handleSubmit = async (status = 'issued') => {
    setError('');

    if (!client.name.trim() || !client.email.trim()) {
      setError('Please provide client name and client email.');
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError('Please provide a description for all line items.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        projectId: selectedProjectId || null,
        projectName: selectedProjectObj?.name || '',
        client,
        items,
        discount: safeDiscount,
        taxRate: safeTaxRate,
        currency,
        status,
        issueDate,
        dueDate,
        notes,
      };

      const response = await invoiceApi.createInvoice(payload);
      if (response.success && response.data?.invoice) {
        // Redirect directly to the invoice preview
        navigate(`/invoice-preview?id=${response.data.invoice._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Invoice</h2>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
            Generate and preview official company invoices using the tortillon template.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => setPreviewTab(!previewTab)}
            style={{ gap: '0.4rem' }}
          >
            <Eye size={16} />
            {previewTab ? 'Edit Form' : 'Live Preview'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            onClick={() => handleSubmit('issued')}
            loading={submitting}
            style={{ gap: '0.4rem' }}
          >
            <CheckCircle size={16} />
            Create & Issue
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Main Grid: Form on Left, Live Template Preview on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewTab ? '1fr' : '1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Invoice Input Form */}
        <div
          className="card"
          style={{ display: previewTab ? 'none' : 'block', padding: '1.75rem' }}
        >
          {/* Project Link */}
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Attach Project (Optional)</label>
            <select
              value={selectedProjectId}
              onChange={handleProjectSelect}
              className="input-control"
            >
              <option value="">-- No linked project (Standalone) --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectCode} — {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Client Details */}
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Bill To (Client Information)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Client Name"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              placeholder="e.g. ABC Technologies"
              required
            />
            <Input
              label="Client Email"
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Phone Number"
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              placeholder="e.g. 9876543210"
            />
            <Input
              label="Client Address"
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              placeholder="e.g. City, State"
            />
          </div>

          {/* Dates & Currency */}
          <h3 style={{ fontSize: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
            Invoice Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <div className="input-group">
              <label className="input-label">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-control"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1.5fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <input
                  type="text"
                  placeholder="Item description (e.g. web hosting)"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="input-control"
                  style={{ backgroundColor: 'white' }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  className="input-control"
                  style={{ backgroundColor: 'white' }}
                />
                <input
                  type="number"
                  placeholder="Rate (₹)"
                  value={item.unitPrice}
                  min="0"
                  step="0.01"
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  className="input-control"
                  style={{ backgroundColor: 'white' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: items.length > 1 ? 'var(--color-danger)' : 'var(--color-neutral-300)',
                    cursor: items.length > 1 ? 'pointer' : 'not-allowed',
                    padding: '0.5rem',
                  }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Discount, Tax & Notes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <Input
              label="Discount Amount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="e.g. 0 or 18"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Notes & Payment Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Thank you for your business. Payment is due within 7 days."
              rows={2}
              className="input-control"
            />
          </div>
        </div>

        {/* Live Template Preview on Right */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <strong style={{ fontSize: '0.9rem' }}>Live Template Preview</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              Updates as you type
            </span>
          </div>

          <div
            style={{
              maxHeight: '85vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-neutral-200)',
              backgroundColor: '#f8fafc',
              padding: '1rem',
            }}
          >
            <InvoicePreview invoice={livePreviewInvoice} />
          </div>
        </div>
      </div>
    </div>
  );
}

