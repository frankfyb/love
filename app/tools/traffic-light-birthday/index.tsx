'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { PersonStanding } from 'lucide-react';

// 导入配置
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { trafficLightBirthdayConfigMetadata } from './config';

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

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black font-sans">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
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
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-gray-900 rounded-t-full z-[-1] opacity-50"></div>

                        {/* Red Light (Top) - Stopped/Old Age */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)] border-4 border-gray-700 overflow-hidden">
                                <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 blur-md group-hover:opacity-30 transition-opacity"></div>
                                <div className="w-full h-full rounded-full bg-red-600 flex flex-col items-center justify-center relative overlow-hidden opacity-90 shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                                    <PersonStanding size={48} className="text-red-950 mb-[-10px]" />
                                    <span className="text-4xl md:text-5xl font-bold text-red-950 font-mono tracking-tighter leading-none">{config.oldAge}</span>
                                </div>
                            </div>
                            <div className="absolute top-1/2 -left-32 md:-left-48 -translate-y-1/2 w-40 text-right">
                                <h3 className="text-white text-2xl md:text-4xl font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
                                    {config.topText}
                                </h3>
                                <div className="h-0.5 w-12 bg-white/50 ml-auto mt-2 rounded-full"></div>
                            </div>
                        </div>

                        {/* Green Light (Bottom) - Go/New Age */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)] border-4 border-gray-700 overflow-hidden">
                                <div className="w-full h-full rounded-full bg-green-500 flex flex-col items-center justify-center relative overlow-hidden opacity-90 shadow-[0_0_50px_rgba(34,197,94,0.8)] animate-pulse-slow">
                                    <span className="text-4xl md:text-5xl font-bold text-green-950 font-mono tracking-tighter leading-none mb-[-5px]">{config.newAge}</span>
                                    <PersonStanding size={48} className="text-green-950 transform scale-x-[-1] animate-bounce" style={{ animationDuration: '0.8s' }} />
                                </div>
                            </div>
                            <div className="absolute top-1/2 -right-32 md:-right-48 -translate-y-1/2 w-40 text-left">
                                <h3 className="text-white text-2xl md:text-4xl font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
                                    {config.bottomText}
                                </h3>
                                <div className="h-0.5 w-12 bg-white/50 mr-auto mt-2 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Pole Bottom */}
                    <div className="w-4 h-[40vh] bg-gray-700/80 backdrop-blur z-10" style={{ backgroundColor: config.trafficLightColor }}></div>
                </div>

                {/* Center Text Overlay */}
                <div className="absolute top-[40%] left-0 w-full text-center z-30 pointer-events-none mix-blend-plus-lighter">
                    <h1 className="text-4xl md:text-7xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] glow-text">
                        {config.centerTextEn}
                    </h1>
                    <p className="mt-4 text-xl md:text-3xl text-white font-light tracking-[0.5em] drop-shadow-md">
                        {config.centerTextCn}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-xs text-white">Music</span>
            </div>

            {/* Audio Control */}
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
