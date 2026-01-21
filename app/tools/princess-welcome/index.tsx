'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { Heart, Sparkles, Crown, Share2, MessageCircle } from 'lucide-react';

// 导入配置和工具函数
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    formatTime,
    formatDate,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { princessWelcomeConfigMetadata } from './config';

/**
 * ==============================================================================
 * 蝴蝶装饰组件
 * ==============================================================================
 */

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

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
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

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans bg-[#f3f4f6]">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#f8f8f8]"></div>
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
                    <Butterfly className="top-20 -right-8 rotate-12" delay={0.5} />
                    <Butterfly className="bottom-40 -left-6 -rotate-12 text-pink-400" delay={1.2} />

                    {/* Card 1: Pink - Happy */}
                    <div className="relative bg-[#fae8e8] rounded-[2rem] p-6 h-48 flex items-center justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col z-10 space-y-2 max-w-[60%]">
                            <div className="bg-white border-2 border-orange-200 rounded-full px-4 py-1 self-start shadow-sm mb-2 relative">
                                <span className="text-sm font-bold text-gray-800">{config.recipientName}</span>
                                <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-orange-200 transform rotate-45"></div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 leading-tight">{config.card1Text}</h2>
                            <p className="text-xs text-gray-500 font-medium">{config.card1SubText}</p>
                        </div>
                        <div className="absolute right-0 bottom-0 top-4 w-40 h-full">
                            <img src={PRESETS.princessImages[0]} alt="Princess" className="w-full h-full object-cover rounded-tl-[3rem] opacity-90 mix-blend-multiply" />
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
                        <div className="absolute left-0 bottom-0 top-0 w-40 h-full">
                            <img src={PRESETS.princessImages[1]} alt="Princess" className="w-full h-full object-cover rounded-tr-[3rem] opacity-90 mix-blend-multiply" />
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
                        <div className="absolute right-0 bottom-0 top-0 w-44 h-full">
                            <img src={PRESETS.princessImages[2]} alt="Princess" className="w-full h-full object-cover rounded-tl-[4rem] rounded-bl-[1rem] opacity-90 mix-blend-normal" />
                        </div>
                        <div className="absolute bottom-4 left-32">
                            <Butterfly className="scale-50 text-purple-500" delay={2} />
                        </div>
                        <div className="absolute top-4 right-4 text-yellow-500 rotate-12">
                            <Crown size={28} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Social */}
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

            {/* Audio Control */}
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
