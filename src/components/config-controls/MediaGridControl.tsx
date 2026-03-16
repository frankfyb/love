'use client';

import React, { useState } from 'react';
import { Plus, X, Check, Video, Music } from 'lucide-react';
import { BaseControl } from './primitives';

// 媒体网格控件（支持背景媒体的颜色、图片、视频选择）
export const MediaGridControl = ({ value, onChange, defaultItems = [], mediaType = 'background', extraData }: any) => {
    const [activeType, setActiveType] = useState<'color' | 'image' | 'video' | 'music'>(
        mediaType === 'background' ? 'color' : 'music'
    );
    const [urlInput, setUrlInput] = useState('');
    const [customItems, setCustomItems] = useState<any[]>([]);

    // 合并预设和自定义资源
    const getCombinedItems = () => {
        const presets = defaultItems.filter((item: any) => item.type === activeType);
        const customs = customItems.filter((item: any) => item.type === activeType);
        return [...customs, ...presets];
    };

    const handleAddCustom = () => {
        if (!urlInput.trim()) return;
        const newItem = {
            id: `custom_${Date.now()}`,
            type: activeType,
            value: urlInput,
            label: `Custom ${customItems.length + 1}`,
            isCustom: true,
        };
        setCustomItems([...customItems, newItem]);
        onChange(newItem.value);
        setUrlInput('');
    };

    const handleDeleteCustom = (id: string) => {
        setCustomItems(customItems.filter(item => item.id !== id));
    };

    const allItems = getCombinedItems();

    return (
        <div className="space-y-4">
            {/* 类型切换（仅背景模式显示） */}
            {mediaType === 'background' && (
                <div className="flex gap-1.5 bg-white/30 dark:bg-black/20 p-1 rounded-xl border border-white/40 dark:border-white/5">
                    {(['color', 'image', 'video'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeType === type
                                    ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
                                }`}
                        >
                            {type === 'color' ? '纯色' : type === 'image' ? '图片' : '视频'}
                        </button>
                    ))}
                </div>
            )}

            {/* 自定义输入区域 */}
            {(mediaType === 'background' && activeType !== 'color') || mediaType === 'music' ? (
                <div className="flex gap-2">
                    <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                            placeholder={mediaType === 'background' ? `输入 ${activeType} URL...` : '输入音乐 URL...'}
                            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                        />
                    </BaseControl>
                    <button
                        onClick={handleAddCustom}
                        disabled={!urlInput.trim()}
                        className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-lg shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : null}

            {/* 媒体网格 */}
            {allItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {allItems.map((item, index) => {
                        const isSelected = value === item.value;
                        const displayValue = item.value || item.url;

                        return (
                            <div
                                key={item.id || `item_${activeType}_${index}`}
                                onClick={() => onChange(displayValue)}
                                className={`
                  group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-video
                  ${isSelected
                                        ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] scale-[1.02]'
                                        : 'border-white/20 hover:border-pink-300/50 hover:shadow-md'
                                    }
                `}
                            >
                                {/* 内容预览 */}
                                {activeType === 'color' && item.value && (
                                    <div className="w-full h-full" style={{ backgroundColor: item.value }} />
                                )}
                                {activeType === 'image' && displayValue && (
                                    <img src={displayValue} alt={item.label} className="w-full h-full object-cover" />
                                )}
                                {activeType === 'video' && displayValue && (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                                        <Video className="text-white/50 w-6 h-6" />
                                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded text-white/80">VIDEO</span>
                                    </div>
                                )}
                                {activeType === 'music' && displayValue && (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-col gap-1 p-2">
                                        <Music className="text-white w-6 h-6" />
                                        <span className="text-[10px] text-white/90 truncate w-full text-center font-medium">{item.label || 'Music'}</span>
                                    </div>
                                )}

                                {/* 选中指示器 */}
                                {isSelected && (
                                    <div className="absolute inset-0 border-2 border-pink-500 rounded-lg flex items-center justify-center bg-pink-500/10">
                                        <div className="bg-pink-500 rounded-full p-0.5 shadow-sm">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    </div>
                                )}

                                {/* 自定义标记和删除按钮 */}
                                {item.isCustom && (
                                    <>
                                        <div className="absolute bottom-0 right-0 bg-blue-500/80 text-[8px] text-white px-1.5 py-0.5 rounded-tl-lg">
                                            自定义
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCustom(item.id);
                                            }}
                                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </>
                                )}

                                {/* 标签悬浮 */}
                                {!isSelected && item.label && (activeType !== 'music' || true) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[9px] text-white px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {allItems.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                    <p>暂无{mediaType === 'background' ? '背景' : '音乐'}资源，请添加</p>
                </div>
            )}
        </div>
    );
};
