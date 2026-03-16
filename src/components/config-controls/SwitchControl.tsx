'use client';

import React from 'react';

export const SwitchControl = ({ value, onChange }: any) => (
    <button
        onClick={() => onChange(!value)}
        className={`
      relative w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 
      ${value ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]' : 'bg-gray-200 dark:bg-gray-700'}
    `}
    >
        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);
