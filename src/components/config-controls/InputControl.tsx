'use client';

import React from 'react';
import { BaseControl } from './primitives';

export const InputControl = ({ value, onChange, placeholder }: any) => (
    <BaseControl className="px-3 py-2.5">
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
        />
    </BaseControl>
);
