'use client';

import React from 'react';
import { Video } from 'lucide-react';
import { Label } from './primitives';

// 背景预设选择器（特殊控件）
export const BackgroundPresetControl = ({ presets, onChange }: any) => {
    if (!presets || presets.length === 0) return null;

    return (
        <div className="mb-6 border-t border-white/10 dark:border-white/5 pt-4">
            <Label>快速预设</Label>
            <div className="grid grid-cols-3 gap-2">
                {presets.map((preset: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => onChange(preset)}
                        className="h-16 rounded-lg border border-white/20 dark:border-white/10 overflow-hidden relative group transition-all hover:ring-2 hover:ring-pink-300/50"
                    >
                        {/* 背景预览 */}
                        {preset.type === 'color' && (
                            <div className="w-full h-full" style={{ background: preset.value }} />
                        )}
                        {preset.type === 'image' && (
                            <img src={preset.value} className="w-full h-full object-cover" alt={preset.label} />
                        )}
                        {preset.type === 'video' && (
                            <video src={preset.value} className="w-full h-full object-cover" muted />
                        )}

                        {/* 悬浮标签 */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity px-1 text-center">
                            {preset.label}
                        </div>

                        {/* 视频标识 */}
                        {preset.type === 'video' && (
                            <div className="absolute top-1 right-1">
                                <Video className="w-3 h-3 text-white drop-shadow-md" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

// 主题预设选择器（特殊控件）
export const ThemePresetControl = ({ presets, onChange }: any) => {
    if (!presets || presets.length === 0) return null;

    return (
        <div className="mb-6 border-t border-white/10 dark:border-white/5 pt-4">
            <Label>快速预设</Label>
            <div className="grid grid-cols-2 gap-2">
                {presets.map((preset: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => onChange(preset)}
                        className="h-20 rounded-lg border border-white/20 dark:border-white/10 overflow-hidden relative group transition-all hover:ring-2 hover:ring-pink-300/50"
                    >
                        {/* 主题预览 */}
                        <div className="w-full h-full" style={{ background: preset.preview }} />

                        {/* 悬浮标签 */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity px-2 text-center">
                            {preset.label}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
