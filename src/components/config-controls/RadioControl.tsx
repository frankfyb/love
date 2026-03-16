'use client';

import React from 'react';

export const RadioGroupControl = ({ value, onChange, options }: any) => (
    <div className="flex bg-white/30 dark:bg-black/20 p-1.5 rounded-xl border border-white/40 dark:border-white/5 gap-1">
        {options?.map((opt: any) => {
            const isActive = String(value) === String(opt.value);
            return (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
            flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-300
            ${isActive
                            ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'}
          `}
                >
                    {opt.label}
                </button>
            )
        })}
    </div>
);
