'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { Heart, Stars, Sparkles, Crown, Share2, MessageCircle, HeartHandshake } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    card1Text: string;
    card1SubText: string;
    card2Text: string;
    card2SubText: string;
    card3Text: string;
    card3SubText: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    themeColor: string;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'), // Reusing compatible presets
    music: [
        { label: 'Cheerful Pop', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '陈小姐',
    card1Text: '公主请开心',
    card1SubText: 'Please be happy Princess',
    card2Text: '公主请顺利',
    card2SubText: 'Princess please have a good day',
    card3Text: '公主请发财',
    card3SubText: 'Princess please get rich',
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#fce7f3', // Light pink background
        },
        0.1
    ),
    bgValue: '#fce7f3',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    themeColor: '#ec4899', // Pink-500
};

export const princessWelcomeConfigMetadata = {
    panelTitle: '公主请开心专属定制',
    panelSubtitle: 'Princess Greetings Generator',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '称呼', placeholder: '例如：陈小姐' },
        card1Text: { category: 'content' as const, type: 'input' as const, label: '卡片1标题', placeholder: '公主请开心' },
        card1SubText: { category: 'content' as const, type: 'input' as const, label: '卡片1副标题', placeholder: 'English text...' },
        card2Text: { category: 'content' as const, type: 'input' as const, label: '卡片2标题', placeholder: '公主请顺利' },
        card2SubText: { category: 'content' as const, type: 'input' as const, label: '卡片2副标题', placeholder: 'English text...' },
        card3Text: { category: 'content' as const, type: 'input' as const, label: '卡片3标题', placeholder: '公主请发财' },
        card3SubText: { category: 'content' as const, type: 'input' as const, label: '卡片3副标题', placeholder: 'English text...' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },

        themeColor: { category: 'visual' as const, type: 'color' as const, label: '主题颜色', description: '页面的主色调' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '称呼设置', icon: null, fields: ['recipientName' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['card1Text' as const, 'card1SubText' as const, 'card2Text' as const, 'card2SubText' as const, 'card3Text' as const, 'card3SubText' as const] },
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
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

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
        volume: 0.4,
    });

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatDate = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekDay = weekDays[date.getDay()];
        return `${month}月${day}日 ${weekDay}`;
    };

    // Placeholder images for the princess theme
    const princessImages = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2??q=80&w=300&auto=format&fit=crop", // Girl 1
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop", // Girl 2
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"  // Girl 3
    ];

    // butterfly decoration src (using emoji or svg for simplicity in code without external assets, 
    // but prompts imply visual fidelity. I'll use SVGs from lucide or custom drawn butterflies if possible, or simple emojis for now, styled nicely)
    // Actually, I can use an image or create a nice SVG butterfly component.
    const Butterfly = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
        <div className={`absolute pointer-events-none animate-bounce ${className}`} style={{ animationDuration: '3s', animationDelay: `${delay}s` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-blue-400 drop-shadow-md">
                <path d="M12 12c0-3-2-5-5-5S2 9 2 12s5 5 5 5c0 0 2-2 5-5z" fill="currentColor" opacity="0.8" />
                <path d="M12 12c0-3 2-5 5-5s5 2 5 5-5 5-5 5c0 0-2-2-5-5z" fill="currentColor" opacity="0.8" />
                <path d="M12 12c0 2-1 3-2 4s-3 1-3 1 2-2 3-5" stroke="currentColor" strokeWidth="1" />
                <path d="M12 12c0 2 1 3 2 4s3 1 3 1-2-2-3-5" stroke="currentColor" strokeWidth="1" />
            </svg>
        </div>
    );


    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans bg-[#f3f4f6]">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                {/* Default white/gray background as seen in image */}
                <div className="absolute inset-0 bg-[#f8f8f8]"></div>
                {/* Optional overlaid configured background if user wants to override */}
                {config.bgConfig && config.bgConfig.type !== 'color' && <BackgroundRenderer config={effectiveBgConfig} />}
            </div>

            {/* 2. Main Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-12 pb-20 px-4 overflow-y-auto scrollbar-hide">

                {/* Status Bar / Time */}
                <div className="flex flex-col items-center justify-center mb-8 z-20">
                    <h1 className="text-6xl md:text-8xl font-light text-gray-800 tracking-tighter" style={{ fontFamily: 'sans-serif' }}>
                        {currentTime ? formatTime(currentTime) : "13:14"}
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 font-medium">
                        {currentTime ? formatDate(currentTime) : "1月9日 星期二"}
                    </p>
                </div>

                {/* Cards Container */}
                <div className="w-full max-w-md space-y-4 pb-24 relative">

                    {/* Decorative Elements */}
                    <Butterfly className="top-20 -right-8 rotate-12" delay={0.5} />
                    <Butterfly className="bottom-40 -left-6 -rotate-12 text-pink-400" delay={1.2} />

                    {/* Card 1: Pink - Happy */}
                    <div className="relative bg-[#fae8e8] rounded-[2rem] p-6 h-48 flex items-center justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col z-10 space-y-2 max-w-[60%]">
                            {/* Name Bubble */}
                            <div className="bg-white border-2 border-orange-200 rounded-full px-4 py-1 self-start shadow-sm mb-2 relative">
                                <span className="text-sm font-bold text-gray-800">{config.recipientName}</span>
                                {/* Speech bubble tail */}
                                <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-orange-200 transform rotate-45"></div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{config.card1Text}</h2>
                            <p className="text-xs text-gray-500 font-medium">{config.card1SubText}</p>
                        </div>
                        {/* Image cutout */}
                        <div className="absolute right-0 bottom-0 top-4 w-40 h-full">
                            <img src={princessImages[0]} alt="Princess" className="w-full h-full object-cover rounded-tl-[3rem] opacity-90 mix-blend-multiply" />
                        </div>
                        <div className="absolute top-4 left-4 text-red-500 animate-pulse">
                            <Heart size={24} fill="currentColor" />
                        </div>
                    </div>

                    {/* Card 2: Yellow - Good Day */}
                    <div className="relative bg-[#fefce8] rounded-[2rem] p-6 h-48 flex flex-row-reverse items-center justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col z-10 space-y-2 max-w-[60%] items-end text-right">
                            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{config.card2Text}</h2>
                            <p className="text-xs text-gray-500 font-medium">{config.card2SubText}</p>
                        </div>
                        {/* Image cutout */}
                        <div className="absolute left-0 bottom-0 top-0 w-40 h-full">
                            <img src={princessImages[1]} alt="Princess" className="w-full h-full object-cover rounded-tr-[3rem] opacity-90 mix-blend-multiply" />
                        </div>
                        <div className="absolute top-2 right-10">
                            <Butterfly className="scale-75 text-blue-500" />
                        </div>
                    </div>

                    {/* Card 3: Pink - Get Rich */}
                    <div className="relative bg-[#fce7f3] rounded-[2rem] p-6 h-48 flex items-center justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col z-10 space-y-2 max-w-[60%]">
                            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{config.card3Text}</h2>
                            <p className="text-xs font-medium text-pink-600">{config.card3SubText}</p>
                        </div>
                        {/* Image cutout */}
                        <div className="absolute right-0 bottom-0 top-0 w-44 h-full">
                            <img src={princessImages[2]} alt="Princess" className="w-full h-full object-cover rounded-tl-[4rem] rounded-bl-[1rem] opacity-90 mix-blend-normal" />
                        </div>
                        <div className="absolute bottom-4 left-32">
                            <Butterfly className="scale-50 text-purple-500" delay={2} />
                        </div>
                        {/* Crown Icon */}
                        <div className="absolute top-4 right-4 text-yellow-500 rotate-12">
                            <Crown size={28} fill="currentColor" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Interaction Mockup */}
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-gray-200/50 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <Heart size={24} className="text-red-500" fill="#ef4444" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">12.0w</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-gray-200/50 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <MessageCircle size={24} className="text-white" fill="white" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">193</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-gray-200/50 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <Share2 size={24} className="text-white" fill="white" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Share</span>
                </div>
            </div>

            <div className="absolute bottom-6 left-6 z-30">
                <div className="bg-[#ff2e4d] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#ff1f40] transition-colors cursor-pointer">
                    <Sparkles size={18} />
                    <span>剪同款</span>
                </div>
            </div>

            {/* 4. Audio Control Panel */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="top-right"
            />
        </div>
    );
}

export default function PrincessWelcomePage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
