import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../api/invoiceApi.js';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function InvoiceHistoryPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(
    async (page = 1, currentSearch = search, currentStatus = statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const response = await invoiceApi.getInvoices({
          page,
          limit: pagination.limit,
          search: currentSearch,
          status: currentStatus,
        });

        if (response.success && response.data) {
          setInvoices(response.data.data || []);
          setPagination(
            response.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 }
          );
        }
      } catch (err) {
        setError(err.message || 'Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, statusFilter]
  );

  useEffect(() => {
    fetchInvoices(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvoices(1, search, statusFilter);
  };

  const handlePageChange = (newPage) => {
    fetchInvoices(newPage, search, statusFilter);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await invoiceApi.updateStatus(id, newStatus);
      fetchInvoices(pagination.page);
    } catch (err) {
      alert(err.message || 'Status transition rejected.');
    }
  };

  const handleDelete = async (id, invoiceNumber, status) => {
    if (status !== 'draft') {
      alert(`Cannot delete an invoice with status "${status}". Only drafts can be deleted.`);
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete draft invoice ${invoiceNumber}?`
    );
    if (!confirmDelete) return;

    try {
      await invoiceApi.deleteInvoice(id);
      fetchInvoices(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete invoice.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'badge-paid';
      case 'issued':
        return 'badge-issued';
      case 'overdue':
        return 'badge-overdue';
      case 'cancelled':
        return 'badge-cancelled';
      case 'draft':
      default:
        return 'badge-draft';
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      key: 'invoiceNumber',
      render: (row) => (
        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: 'Client',
      key: 'client',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.clientSnapshot?.name || 'Unknown Client'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            {row.clientSnapshot?.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Project',
      key: 'project',
      render: (row) => <span>{row.projectName || row.project?.name || '-'}</span>,
    },
    {
      header: 'Issue Date',
      key: 'issueDate',
      render: (row) => (
        <span style={{ fontSize: '0.825rem' }}>{formatDate(row.issueDate)}</span>
      ),
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (row) => (
        <span style={{ fontSize: '0.825rem' }}>{formatDate(row.dueDate)}</span>
      ),
    },
    {
      header: 'Total Amount',
      key: 'totalAmount',
      cellStyle: { textAlign: 'right' },
      headerStyle: { textAlign: 'right' },
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {formatCurrency(row.totalAmount, row.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          disabled={row.status === 'paid' || row.status === 'cancelled'}
          className={`badge ${getStatusBadge(row.status)}`}
          style={{
            border: 'none',
            outline: 'none',
            cursor: row.status === 'paid' || row.status === 'cancelled' ? 'default' : 'pointer',
            padding: '0.2rem 0.5rem',
            fontFamily: 'inherit',
          }}
        >
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      cellStyle: { textAlign: 'right' },
      headerStyle: { textAlign: 'right' },
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(`/invoice-preview?id=${row._id}`)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
            title="Preview and Print Invoice"
          >
            <Eye size={13} />
            Preview
          </button>
          {row.status === 'draft' && (
            <button
              onClick={() => handleDelete(row._id, row.invoiceNumber, row.status)}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                color: 'var(--color-danger)',
              }}
              title="Delete Draft"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Invoice History</h2>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
            Browse, search, print, and track all company invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/invoice-preview')}
            style={{ gap: '0.4rem' }}
          >
            <Eye size={16} />
            Template Preview
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate('/invoices/new')}
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-neutral-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search by invoice number (e.g. INV-2026-0007), client, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <Button type="submit" variant="secondary" style={{ padding: '0.5rem 1rem' }}>
            Search
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label
            style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', fontWeight: 500 }}
          >
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control"
            style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices found. Click 'New Invoice' to create an invoice."
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

