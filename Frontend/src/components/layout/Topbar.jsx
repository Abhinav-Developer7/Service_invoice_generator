import React from 'react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid var(--color-neutral-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>{title || 'Dashboard'}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                {user?.email}
              </span>
              <span className="badge badge-issued" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {user?.role || 'admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem' }}
          title="Sign out of application"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </header>
  );
}

