import React from 'react';
import Loader from './Loader.jsx';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  pagination,
  onPageChange,
}) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--color-neutral-200)',
              backgroundColor: 'var(--color-neutral-50)',
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-600)',
                  ...col.headerStyle,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader message="Loading data..." />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--color-neutral-400)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                style={{
                  borderBottom: '1px solid var(--color-neutral-200)',
                  transition: 'background-color 0.15s',
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '0.875rem 1rem',
                      color: 'var(--color-neutral-800)',
                      ...col.cellStyle,
                    }}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderTop: '1px solid var(--color-neutral-200)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

