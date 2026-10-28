import React from 'react';

export default function Loader({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
      }}
    >
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      {message && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

