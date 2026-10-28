import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { dashboardApi } from '../../api/dashboardApi.js';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  FolderKanban,
  PlusCircle,
  Eye,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      setError(err.message || 'Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const metrics = summary?.metrics || {
    totalInvoiced: 0,
    outstandingBalance: 0,
    totalPaid: 0,
    totalProjects: 0,
    activeProjectsCount: 0,
    totalInvoices: 0,
    currency: 'INR',
  };

  const statusBreakdown = summary?.statusBreakdown || {
    draft: 0,
    issued: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  };

  const recentInvoices = summary?.recentInvoices || [];

  return (
    <div>
      {/* Top Welcome Bar */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>
            Company overview and real-time invoicing performance (tortillon).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/invoice-preview')}
            style={{ gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Eye size={15} />
            Template Preview
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate('/invoices/new')}
            style={{ gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <PlusCircle size={15} />
            Create Invoice
          </Button>
        </div>
      </div>

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
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader message="Calculating database metrics..." />
        </div>
      ) : (
        <>
          {/* 4 Financial Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* Total Invoiced */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
                  TOTAL INVOICED
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {formatCurrency(metrics.totalInvoiced, metrics.currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Across {metrics.totalInvoices} issued/paid invoice(s)
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                  OUTSTANDING BALANCE
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--color-warning-light)',
                    color: 'var(--color-warning)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {formatCurrency(metrics.outstandingBalance, metrics.currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Unpaid issued & overdue balance
              </div>
            </div>

            {/* Total Collected */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-success)' }}>
                  TOTAL COLLECTED
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {formatCurrency(metrics.totalPaid, metrics.currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                Settled / paid invoices
              </div>
            </div>

            {/* Total Projects */}
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
                  ACTIVE PROJECTS
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--color-neutral-100)',
                    color: 'var(--color-neutral-700)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <FolderKanban size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {metrics.activeProjectsCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                {metrics.totalProjects} total non-archived projects
              </div>
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Invoice Status Summary
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Issued:</span>
                <span>{statusBreakdown.issued}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-light)',
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Paid:</span>
                <span>{statusBreakdown.paid}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-warning-light)',
                  color: 'var(--color-warning)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Overdue:</span>
                <span>{statusBreakdown.overdue}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-neutral-100)',
                  color: 'var(--color-neutral-700)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Drafts:</span>
                <span>{statusBreakdown.draft}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Cancelled:</span>
                <span>{statusBreakdown.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Recent Invoices Activity Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-neutral-200)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Invoices</h3>
              <Link
                to="/invoices"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                <span>View all invoices</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-neutral-400)' }}>
                No invoices created yet.{' '}
                <Link to="/invoices/new" style={{ color: 'var(--color-primary)' }}>
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Invoice #
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Client
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Issue Date
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Amount
                      </th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Status
                      </th>
                      <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => (
                      <tr key={inv._id} style={{ borderBottom: '1px solid var(--color-neutral-200)' }}>
                        <td style={{ padding: '0.85rem 1.5rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {inv.invoiceNumber}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{inv.clientSnapshot?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{inv.clientSnapshot?.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-neutral-600)' }}>
                          {formatDate(inv.issueDate)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                          {formatCurrency(inv.totalAmount, inv.currency)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className={`badge ${
                              inv.status === 'paid'
                                ? 'badge-paid'
                                : inv.status === 'issued'
                                ? 'badge-issued'
                                : inv.status === 'overdue'
                                ? 'badge-overdue'
                                : inv.status === 'cancelled'
                                ? 'badge-cancelled'
                                : 'badge-draft'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/invoice-preview?id=${inv._id}`)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                          >
                            <Eye size={12} />
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
