import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const variantClass =
    variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'danger'
      ? 'btn-danger'
      : 'btn-primary';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
      {children}
    </button>
  );
}

