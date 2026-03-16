'use client';

import React from 'react';

export const StickerGridControl = ({ value, onChange, options }: any) => (
    <div className="grid grid-cols-4 gap-2.5">
        {options.map((opt: any) => {
            const isActive = value === opt.value;
            return (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
            aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-300
            ${isActive
                            ? 'bg-pink-50/80 border-pink-400 ring-2 ring-pink-200 dark:bg-pink-900/30'
                            : 'bg-white/40 border-white/60 hover:border-pink-300 hover:bg-white/60 dark:bg-white/5 dark:border-white/10'}
          `}
                >
                    <div className={`transition-transform duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-gray-400 grayscale'}`}>{opt.icon}</div>
                    <span className={`text-[9px] font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}`}>{opt.label}</span>
                </button>
            );
        })}
    </div>
);
