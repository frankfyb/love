'use client';

import React, { useState } from 'react';
import { Box, X } from 'lucide-react';
import { BaseControl } from './primitives';

export const ListBuilderControl = ({ value, onChange, placeholder }: any) => {
    const [inputValue, setInputValue] = useState('');
    // 支持数组和字符串两种格式
    const items = Array.isArray(value)
        ? value
        : value ? value.split(',').filter((i: string) => i.trim() !== '') : [];

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        const newItems = [...items, inputValue.trim()];
        // 如果原值是数组，则返回数组；否则返回逗号分隔的字符串
        onChange(Array.isArray(value) ? newItems : newItems.join(','));
        setInputValue('');
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(Array.isArray(value) ? newItems : newItems.join(','));
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                        placeholder={placeholder}
                        className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100"
                    />
                </BaseControl>
                <button
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl shadow-lg hover:shadow-pink-500/40 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all font-medium flex items-center justify-center gap-1"
                >
                    <span className="text-sm">+</span>
                    <span className="text-xs font-semibold hidden xs:inline">添加</span>
                </button>
            </div>

            <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/40 dark:border-white/5 min-h-[80px]">
                <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                        <Box className="w-3 h-3" /> 已添加 ({items.length})
                    </span>
                    {!Array.isArray(value) && <span className="text-[10px] text-gray-400 bg-white/40 px-2 py-0.5 rounded-full">逗号分隔</span>}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400 italic">暂无内容，请添加</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {items.map((item: string, idx: number) => (
                            <div
                                key={`${item}-${idx}`}
                                className="group flex items-center gap-1.5 bg-white/70 dark:bg-gray-800/80 border border-white/50 dark:border-white/10 px-3 py-1 rounded-full text-xs shadow-sm hover:shadow-md hover:border-pink-200 transition-all animate-fadeIn"
                            >
                                <span className="text-gray-700 dark:text-gray-200 max-w-[150px] truncate font-medium">{item}</span>
                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
