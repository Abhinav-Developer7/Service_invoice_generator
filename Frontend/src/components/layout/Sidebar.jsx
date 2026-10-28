import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  FilePlus,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Create Invoice', path: '/invoices/new', icon: FilePlus },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--color-neutral-900)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--color-neutral-800)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', color: 'white', margin: 0 }}>InvoiceGen</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            Service Invoicing
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1.25rem 0.75rem', flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'white' : 'var(--color-neutral-400)',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--color-neutral-800)',
          fontSize: '0.75rem',
          color: 'var(--color-neutral-500)',
        }}
      >
        v1.0.0 — Spec-Driven
      </div>
    </aside>
  );
}

