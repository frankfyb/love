import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function Input({
  label,
  error,
  required = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-pink-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={`w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all ${
          error ? 'border-red-300 focus:ring-red-300' : ''
        } ${className}`}
        required={required}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}