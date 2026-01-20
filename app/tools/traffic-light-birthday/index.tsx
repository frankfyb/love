'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { PersonStanding, Milestone } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
    oldAge: number;
    newAge: number;
    topText: string;
    bottomText: string;
    centerTextEn: string;
    centerTextCn: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    trafficLightColor: string;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Happy Birthday', value: 'https://cdn.pixabay.com/audio/2023/10/25/audio_51d547f671.mp3' }, // Just a placeholder url, re-using cheerful
        { label: 'Upbeat Celebration', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    oldAge: 37,
    newAge: 38,
    topText: '再见 37 岁',
    bottomText: '你好 38 岁',
    centerTextEn: 'HAPPY BIRTHDAY',
    centerTextCn: '每一岁 都珍贵',
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'image' as const,
            value: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1920&auto=format&fit=crop', // Sunset/Orange sky
        },
        0.2
    ),
    bgValue: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1920&auto=format&fit=crop',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    trafficLightColor: '#1f2937', // Dark gray pole
};

export const trafficLightBirthdayConfigMetadata = {
    panelTitle: '红绿灯生日倒数',
    panelSubtitle: 'Traffic Light Birthday Wish',
    configSchema: {
        oldAge: { category: 'content' as const, type: 'input' as const, label: '过去年龄', placeholder: '37' },
        newAge: { category: 'content' as const, type: 'input' as const, label: '新年龄', placeholder: '38' },
        topText: { category: 'content' as const, type: 'input' as const, label: '顶部文案', placeholder: '再见 37 岁' },
        bottomText: { category: 'content' as const, type: 'input' as const, label: '底部文案', placeholder: '你好 38 岁' },
        centerTextEn: { category: 'content' as const, type: 'input' as const, label: '中间英文', placeholder: 'HAPPY BIRTHDAY' },
        centerTextCn: { category: 'content' as const, type: 'input' as const, label: '中间中文', placeholder: '每一岁 都珍贵' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择唯美夕阳或天空背景'
        },

        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '年龄设置', icon: null, fields: ['oldAge' as const, 'newAge' as const] },
        { id: 2, label: '祝福文案', icon: null, fields: ['topText' as const, 'bottomText' as const, 'centerTextEn' as const, 'centerTextCn' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

/**
 * ==============================================================================
 * 2. 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Audio control
    const {
        audioRef,
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: config.enableSound,
        volume: 0.5,
    });

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // Split text for styling "再见" "37" "岁"
    const parseText = (text: string, age: number) => {
        // Simple splitting heuristic, user can customize strictly later if needed
        // Assuming user puts "再见 37 岁"
        // We want to highlight the number if it exists in the string
        return text;
    };

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black font-sans">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                {/* Gradient Overlay for sunset vibe reinforcement */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-900/30 pointer-events-none"></div>
            </div>

            {/* 2. Main Content Layer */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">

                {/* Traffic Light Container */}
                <div className="relative flex flex-col items-center animate-fade-in-up">

                    {/* Pole Top */}
                    <div className="w-4 h-12 bg-gray-700/80 backdrop-blur" style={{ backgroundColor: config.trafficLightColor }}></div>

                    {/* The Light Box */}
                    <div className="w-32 md:w-40 bg-gray-800 rounded-3xl p-4 flex flex-col gap-6 shadow-2xl border border-gray-600 relative z-20">
                        {/* Visors */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-gray-900 rounded-t-full z-[-1] opacity-50"></div>

                        {/* Red Light (Top) - Stopped/Old Age */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)] border-4 border-gray-700 overflow-hidden">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
                                {/* Lit part */}
                                <div className="w-full h-full rounded-full bg-red-600 flex flex-col items-center justify-center relative overlow-hidden opacity-90 shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                                    {/* Human figure (Walking stopped) */}
                                    <PersonStanding size={48} className="text-red-950 mb-[-10px]" />
                                    <span className="text-4xl md:text-5xl font-bold text-red-950 font-mono tracking-tighter leading-none">{config.oldAge}</span>
                                </div>
                            </div>

                            {/* Text: Goodbye */}
                            <div className="absolute top-1/2 -left-32 md:-left-48 -translate-y-1/2 w-40 text-right">
                                <h3 className="text-white text-2xl md:text-4xl font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
                                    {config.topText}
                                </h3>
                                {/* Decorative lines */}
                                <div className="h-0.5 w-12 bg-white/50 ml-auto mt-2 rounded-full"></div>
                            </div>
                        </div>

                        {/* Green Light (Bottom) - Go/New Age */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)] border-4 border-gray-700 overflow-hidden">
                                {/* Lit part */}
                                <div className="w-full h-full rounded-full bg-green-500 flex flex-col items-center justify-center relative overlow-hidden opacity-90 shadow-[0_0_50px_rgba(34,197,94,0.8)] animate-pulse-slow">
                                    <span className="text-4xl md:text-5xl font-bold text-green-950 font-mono tracking-tighter leading-none mb-[-5px]">{config.newAge}</span>
                                    {/* Human figure (Walking) - Animated GIF effect simulated with CSS or simple icon */}
                                    <PersonStanding size={48} className="text-green-950 transform scale-x-[-1] animate-bounce" style={{ animationDuration: '0.8s' }} />
                                </div>
                            </div>

                            {/* Text: Hello */}
                            <div className="absolute top-1/2 -right-32 md:-right-48 -translate-y-1/2 w-40 text-left">
                                <h3 className="text-white text-2xl md:text-4xl font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
                                    {config.bottomText}
                                </h3>
                                {/* Decorative lines */}
                                <div className="h-0.5 w-12 bg-white/50 mr-auto mt-2 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Pole Bottom */}
                    <div className="w-4 h-[40vh] bg-gray-700/80 backdrop-blur z-10" style={{ backgroundColor: config.trafficLightColor }}></div>
                </div>

                {/* Center Text Overlay (Happy Birthday) */}
                <div className="absolute top-[40%] left-0 w-full text-center z-30 pointer-events-none mix-blend-plus-lighter">
                    <h1 className="text-4xl md:text-7xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] glow-text">
                        {config.centerTextEn}
                    </h1>
                    <p className="mt-4 text-xl md:text-3xl text-white font-light tracking-[0.5em] drop-shadow-md">
                        {config.centerTextCn}
                    </p>
                </div>

            </div>

            {/* Footer Interaction Mockup (Optional match from image) */}
            <div className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-xs text-white">Music</span>
            </div>

            {/* 3. Audio Control */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="bottom-right"
            />
        </div>
    );
}

export default function TrafficLightBirthdayPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
