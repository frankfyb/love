'use client';

import React from 'react';
import { CustomSelectControl } from './SelectControl';
import { InputControl } from './InputControl';

// Select + Input 组合控件（用于预设选择 + 自定义输入）
export const SelectInputControl = ({ value, onChange, options, placeholder }: any) => {
    const [mode, setMode] = React.useState<'preset' | 'custom'>('preset');

    return (
        <div className="space-y-2">
            {/* 模式切换 */}
            <div className="flex bg-white/30 dark:bg-black/20 p-1 rounded-lg border border-white/40 dark:border-white/5 gap-1">
                <button
                    onClick={() => setMode('preset')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'preset'
                            ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    预设选择
                </button>
                <button
                    onClick={() => setMode('custom')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'custom'
                            ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    自定义
                </button>
            </div>

            {/* 控件内容 */}
            {mode === 'preset' ? (
                <CustomSelectControl value={value} onChange={onChange} options={options} />
            ) : (
                <InputControl value={value} onChange={onChange} placeholder={placeholder || '输入自定义 URL...'} />
            )}
        </div>
    );
};
