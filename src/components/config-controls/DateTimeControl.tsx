'use client';

import React from 'react';
import { BaseControl } from './primitives';

export const DateTimeControl = ({ value, onChange, timeType = 'datetime' }: any) => {
    // 将 ISO 字符串转换为输入框格式
    const formatToInput = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        if (timeType === 'date') {
            return `${year}-${month}-${day}`;
        } else if (timeType === 'time') {
            return `${hours}:${minutes}`;
        } else {
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    };

    // 将输入框格式转换为 ISO 字符串
    const formatToISO = (inputValue: string) => {
        if (!inputValue) return '';

        try {
            if (timeType === 'date') {
                return new Date(inputValue + 'T00:00:00').toISOString();
            } else if (timeType === 'time') {
                const today = new Date();
                const [hours, minutes] = inputValue.split(':');
                today.setHours(parseInt(hours), parseInt(minutes), 0);
                return today.toISOString();
            } else {
                return new Date(inputValue + ':00').toISOString();
            }
        } catch (e) {
            return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isoValue = formatToISO(e.target.value);
        onChange(isoValue);
    };

    return (
        <BaseControl className="px-4 py-3 hover:bg-white/60">
            <div className="flex items-center gap-3">
                <input
                    type={timeType === 'date' ? 'date' : timeType === 'time' ? 'time' : 'datetime-local'}
                    value={formatToInput(value)}
                    onChange={handleChange}
                    className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 font-medium"
                />
                <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                    {timeType === 'date' ? '📅' : timeType === 'time' ? '🕐' : '📆'}
                </span>
            </div>
        </BaseControl>
    );
};
