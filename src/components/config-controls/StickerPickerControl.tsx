'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BaseControl } from './primitives';

// 贴纸选择器控件
export const StickerPickerControl = ({ value, onChange, options, extraData }: any) => {
    const [customUrl, setCustomUrl] = React.useState('');
    const { decorations = [], onClearDecorations } = extraData || {};

    const handleAddSticker = (sticker: any) => {
        if (onChange) {
            onChange(sticker);
        }
    };

    return (
        <div className="space-y-4">
            {/* 贴纸网格 */}
            <div className="grid grid-cols-4 gap-2">
                {options?.map((opt: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => handleAddSticker(opt)}
                        className="aspect-square flex items-center justify-center text-2xl bg-white/40 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all border border-white/20 hover:scale-105 active:scale-95 shadow-sm"
                    >
                        {opt.icon || opt.value}
                    </button>
                ))}
            </div>

            {/* 自定义输入 */}
            <div className="flex gap-2">
                <BaseControl className="flex-1 px-3 py-2 hover:bg-white/60">
                    <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="自定义图片 URL..."
                        className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                    />
                </BaseControl>
                <button
                    onClick={() => {
                        if (customUrl.trim()) {
                            handleAddSticker({ type: 'image', value: customUrl, label: 'Custom' });
                            setCustomUrl('');
                        }
                    }}
                    disabled={!customUrl.trim()}
                    className="px-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* 当前装饰统计 */}
            {decorations && decorations.length > 0 && (
                <div className="pt-2 border-t border-white/10 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            当前装饰 ({decorations.length})
                        </span>
                    </div>
                    <button
                        onClick={onClearDecorations}
                        className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors font-medium"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        清除所有装饰
                    </button>
                </div>
            )}

            {/* 提示文本 */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                💡 提示：点击装饰品可选中，选中后拖动主体可移动，拖动上方手柄可旋转。
            </p>
        </div>
    );
};
