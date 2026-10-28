import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InvoicePreview from '../../components/invoices/InvoicePreview.jsx';
import { invoiceApi } from '../../api/invoiceApi.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import { Printer, ArrowLeft } from 'lucide-react';

export default function InvoicePreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceId = searchParams.get('id');

  const [loading, setLoading] = useState(Boolean(invoiceId));
  const [invoice, setInvoice] = useState(null);

  // Template sample data (exact match to user's uploaded template)
  const templateSampleInvoice = {
    invoiceNumber: 'INV-2026-0007',
    companySnapshot: {
      name: 'tortillon',
      email: 'info@tortillon.in',
      phone: '8086939423',
      address: 'Raimund building 3rd floor,thrissur,kerala',
    },
    clientSnapshot: {
      name: 'ABC Technologies',
      email: 'john@example.com',
      phone: '9876543210',
      address: '',
    },
    issueDate: '2026-10-27',
    dueDate: '2026-10-29',
    projectName: '',
    items: [
      {
        description: 'web hosting',
        quantity: 1,
        unitPrice: 200.0,
        amount: 200.0,
      },
    ],
    subtotal: 200.0,
    discount: 0.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    totalAmount: 200.0,
    currency: 'INR',
    notes: '',
  };

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(templateSampleInvoice);
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await invoiceApi.getInvoice(invoiceId);
        if (response.success && response.data?.invoice) {
          setInvoice(response.data.invoice);
        } else {
          setInvoice(templateSampleInvoice);
        }
      } catch (err) {
        setInvoice(templateSampleInvoice);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader message="Loading invoice preview..." fullScreen />;
  }

  return (
    <div style={{ padding: '2rem 1rem', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Top Action Bar (hidden when printing) */}
      <div
        className="no-print"
        style={{
          maxWidth: '820px',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button variant="secondary" onClick={() => navigate("/invoices")} style={{ gap: '0.4rem' }}>
          <ArrowLeft size={16} />
          Back
        </Button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Official tortillon Template
          </span>
          <Button variant="primary" onClick={handlePrint} style={{ gap: '0.5rem' }}>
            <Printer size={16} />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Invoice Sheet */}
      <InvoicePreview invoice={invoice} />
    </div>
  );
}

