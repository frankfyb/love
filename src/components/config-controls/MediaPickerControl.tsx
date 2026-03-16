'use client';

import React, { useState } from 'react';
import { Plus, X, Check, Music, Volume2, VolumeX } from 'lucide-react';
import { BaseControl } from './primitives';

// 媒体选择器控件（用于音乐选择+播放控制）
export const MediaPickerControl = ({ value, onChange, defaultItems = [], mediaType = 'music', extraData }: any) => {
    const [customItems, setCustomItems] = useState<any[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const { isMusicPlaying = false, onMusicPlayingChange } = extraData || {};

    const handleAddCustom = () => {
        if (!urlInput.trim()) return;
        const newItem = {
            id: `custom_${Date.now()}`,
            type: 'music',
            value: urlInput,
            label: `Custom Music ${customItems.length + 1}`,
            isCustom: true,
        };
        setCustomItems([...customItems, newItem]);
        onChange(newItem.value);
        setUrlInput('');
    };

    const handleDeleteCustom = (id: string) => {
        setCustomItems(customItems.filter(item => item.id !== id));
    };

    const allItems = [...customItems, ...defaultItems];

    return (
        <div className="space-y-4">
            {/* 自定义输入 */}
            <div className="flex gap-2">
                <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                        placeholder="输入音乐 URL (MP3/WAV/OGG)..."
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

            {/* 播放控制 */}
            {onMusicPlayingChange && (
                <div className="flex items-center justify-between bg-white/30 dark:bg-black/20 p-3 rounded-xl border border-white/40 dark:border-white/5">
                    <span className="text-sm text-gray-700 dark:text-gray-100 font-medium flex items-center gap-2">
                        {isMusicPlaying ? (
                            <Volume2 className="w-4 h-4 text-green-500" />
                        ) : (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                        )}
                        {isMusicPlaying ? '播放中' : '已停止'}
                    </span>
                    <button
                        onClick={() => onMusicPlayingChange(!isMusicPlaying)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center ${isMusicPlaying
                                ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <div
                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-all duration-300 ${isMusicPlaying ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                        />
                    </button>
                </div>
            )}

            {/* 音乐网格 */}
            {allItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                    {allItems.map((item, index) => {
                        const isSelected = value === item.value;
                        return (
                            <div
                                key={item.id || `music_${index}`}
                                onClick={() => onChange(item.value)}
                                className={`
                  group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-video
                  ${isSelected
                                        ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] scale-[1.02]'
                                        : 'border-white/20 hover:border-pink-300/50 hover:shadow-md'
                                    }
                `}
                            >
                                {/* 音乐背景预览 */}
                                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-col gap-1.5 p-2">
                                    <Music className="text-white w-6 h-6" />
                                    <span className="text-[10px] text-white/90 truncate w-full text-center font-medium px-1">{item.label || '未命名'}</span>
                                </div>

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
                            </div>
                        );
                    })}
                </div>
            )}

            {allItems.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                    <p>暂无音乐资源，请添加</p>
                </div>
            )}
        </div>
    );
};
