'use client';

import React from 'react';

export const ColorControl = ({ value, onChange }: any) => (
    <div className="flex items-center gap-3 border border-white/50 dark:border-white/10 p-2.5 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-md">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-md cursor-pointer group">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
            />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Color</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-mono font-medium">{value}</span>
        </div>
    </div>
);
