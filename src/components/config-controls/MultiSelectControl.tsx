'use client';

import React from 'react';
import { X } from 'lucide-react';

export const MultiSelectControl = ({ value, onChange, options }: any) => {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (val: string) => selected.includes(val) ? onChange(selected.filter((v: string) => v !== val)) : onChange([...selected, val]);

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt: any) => {
                const isActive = selected.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        onClick={() => toggle(opt.value)}
                        className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
              ${isActive
                                ? 'bg-pink-50 border-pink-300 text-pink-600 shadow-[0_0_8px_rgba(236,72,153,0.2)] dark:bg-pink-900/30 dark:border-pink-500/50 dark:text-pink-300'
                                : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/70 hover:border-pink-200 dark:bg-white/5 dark:border-white/10'}
            `}
                    >
                        {isActive && <X className="w-3 h-3" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};
