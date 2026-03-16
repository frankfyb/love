'use client';

import React from 'react';

export const SliderControl = ({ value, onChange, min, max, step }: any) => (
    <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2.5 rounded-xl border border-white/40 dark:border-white/5">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
        <span className="text-xs font-mono w-10 text-center bg-white/50 dark:bg-black/30 rounded px-1 py-0.5 text-gray-600 dark:text-gray-300 font-medium">{value}</span>
    </div>
);
