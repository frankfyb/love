'use client';

import React from 'react';
import { BaseControl } from './primitives';

export const TextareaControl = ({ value, onChange, placeholder }: any) => (
    <BaseControl className="px-3 py-2.5">
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-transparent focus:outline-none text-sm resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
        />
    </BaseControl>
);
