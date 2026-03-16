'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

export const CustomSelectControl = ({ value, onChange, options }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options?.find((opt: any) => opt.value === value) || options?.[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full px-3 py-2.5 
          bg-white/40 dark:bg-black/20 backdrop-blur-md
          border border-white/50 dark:border-white/10
          rounded-xl text-sm flex items-center justify-between 
          hover:bg-white/60 dark:hover:bg-white/10 transition-all 
          focus:outline-none focus:ring-2 focus:ring-pink-300/50
          shadow-sm text-gray-700 dark:text-gray-200
        `}
            >
                <div className="flex items-center gap-2.5">
                    {selectedOption?.icon && <span className="opacity-80 text-pink-500">{selectedOption.icon}</span>}
                    <span className="font-medium">{selectedOption?.label || value}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn origin-top p-1">
                    {options?.map((opt: any) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`
                w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 rounded-lg transition-all
                ${value === opt.value
                                    ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'}
              `}
                        >
                            {opt.icon && <span className={`opacity-80 scale-90 ${value === opt.value ? 'text-pink-500' : 'text-gray-400'}`}>{opt.icon}</span>}
                            {opt.label}
                            {value === opt.value && <X className="w-3.5 h-3.5 ml-auto text-pink-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
