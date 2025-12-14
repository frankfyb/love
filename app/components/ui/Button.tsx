import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export default function Button({ loading, variant = 'primary', className = '', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const styles = variant === 'primary'
    ? 'bg-pink-500 hover:bg-pink-600 text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  return (
    <button {...rest} className={`${base} ${styles} ${className}`}>
      {loading ? '处理中...' : children}
    </button>
  );
}

