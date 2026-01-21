'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { Heart } from 'lucide-react';

// 导入配置和工具函数
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    CLOCK_NUMBERS,
    normalizeClockImages,
    getClockPosition,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { loveClockDiyConfigMetadata } from './config';

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
    const [time, setTime] = useState(new Date());

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
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    const clockImages = useMemo(() => normalizeClockImages(config.images), [config.images]);

    // Clock calculation
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondAngle = seconds * 6;
    const minuteAngle = (minutes + seconds / 60) * 6;
    const hourAngle = ((hours % 12) + minutes / 60) * 30;

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans bg-stone-800">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}>
                </div>
            </div>

            {/* 2. Clock Container */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md aspect-square md:max-w-xl">

                    {/* Clock Numbers/Images Circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 backdrop-blur-[2px]">
                        {CLOCK_NUMBERS.map((num, i) => {
                            const imgPos = getClockPosition(i, 42);
                            const textPos = getClockPosition(i, 32);

                            return (
                                <React.Fragment key={num}>
                                    {/* Image Bubble */}
                                    <div
                                        className="absolute w-[18%] aspect-square rounded-full overflow-hidden border-2 border-white/50 shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                                        style={{ left: `${imgPos.x}%`, top: `${imgPos.y}%` }}
                                    >
                                        <img
                                            src={clockImages[i]}
                                            alt={`Hour ${num}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Number Text */}
                                    <div
                                        className="absolute text-2xl md:text-3xl font-bold font-serif opacity-90 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
                                        style={{
                                            left: `${textPos.x}%`,
                                            top: `${textPos.y}%`,
                                            color: config.clockColor,
                                            fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif'
                                        }}
                                    >
                                        {num}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Center Text */}
                    <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full px-12">
                        <h2 className="text-3xl md:text-4xl font-serif italic mb-1 drop-shadow-lg" style={{ color: config.clockColor }}>
                            {config.centerText}
                        </h2>
                    </div>

                    {/* Clock Center Dot */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-xl border-2 border-white/50"></div>

                    {/* Hour Hand */}
                    <div
                        className="absolute top-1/2 left-1/2 w-2 bg-black rounded-full origin-bottom z-20 shadow-lg"
                        style={{
                            height: '25%',
                            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                            backgroundColor: '#1a1a1a'
                        }}
                    ></div>

                    {/* Minute Hand */}
                    <div
                        className="absolute top-1/2 left-1/2 w-1.5 bg-black rounded-full origin-bottom z-20 shadow-lg"
                        style={{
                            height: '35%',
                            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                            backgroundColor: '#1a1a1a'
                        }}
                    ></div>

                    {/* Second Hand */}
                    <div
                        className="absolute top-1/2 left-1/2 w-0.5 bg-red-500 rounded-full origin-bottom z-20 shadow-sm"
                        style={{
                            height: '40%',
                            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`
                        }}
                    ></div>

                    {/* Floating Heart */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-20 animate-pulse">
                        <Heart size={200} fill={config.clockColor} stroke="none" />
                    </div>

                </div>
            </div>

            {/* 3. Audio Control Panel */}
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

export default function LoveClockDiyPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
