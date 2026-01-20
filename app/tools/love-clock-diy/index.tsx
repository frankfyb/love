'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { Heart } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
    centerText: string;
    subText: string;
    images: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    clockColor: string;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: 'Sweet Acoustic', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_l_06f14066c0.mp3' },
    ],
    defaultImages: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2??q=80&w=300&auto=format&fit=crop', // 12 (using random diverse portraits)
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', // 1
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop', // 2
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop', // 3
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop', // 4
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop', // 5
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop', // 6
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop', // 7
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', // 8
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop', // 9
        'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=300&auto=format&fit=crop', // 10
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop', // 11
    ]
};

export const DEFAULT_CONFIG: AppConfig = {
    centerText: 'I love you so',
    subText: 'Every second with you',
    images: PRESETS.defaultImages,
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#78716c', // Warm grey/brownish
        },
        0.3 // texture overlay
    ),
    bgValue: '#78716c',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    clockColor: '#ffffff',
};

export const loveClockDiyConfigMetadata = {
    panelTitle: '专属恋爱时钟',
    panelSubtitle: 'DIY Photo Clock',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: 'I love you so' },
        subText: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: 'Every second with you' },
        images: {
            category: 'content' as const,
            type: 'list' as const,
            label: '时钟照片(12张)',
            placeholder: '输入图片URL',
            description: '请按顺序提供12张照片URL（12点到11点）'
        },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },

        clockColor: { category: 'visual' as const, type: 'color' as const, label: '时钟颜色', description: '数字和指针的颜色' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '文字设置', icon: null, fields: ['centerText' as const, 'subText' as const] },
        { id: 2, label: '照片上传', icon: null, fields: ['images' as const] },
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

    // Ensure we have exactly 12 images (repeat or fill if missing)
    const clockImages = useMemo(() => {
        const imgs = [...(config.images || [])];
        while (imgs.length < 12) {
            imgs.push(imgs[imgs.length % (config.images?.length || 1)] || PRESETS.defaultImages[0]);
        }
        return imgs.slice(0, 12);
    }, [config.images]);

    // Clock calculation
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondAngle = seconds * 6;
    const minuteAngle = (minutes + seconds / 60) * 6;
    const hourAngle = ((hours % 12) + minutes / 60) * 30;

    const clockNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans bg-stone-800">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                {/* Texture Overlay to match the grainy feel of the reference */}
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
                        {clockNumbers.map((num, i) => {
                            // Calculate position using trigonometry
                            // -90 degrees offset because 0 rad is 3 o'clock, but we want index 0 (12 o'clock) to be at -90deg
                            const angleDeg = i * 30 - 90;
                            const angleRad = (angleDeg * Math.PI) / 180;

                            // Radius for image centers (percentage of container half-width)
                            const radius = 42; // percent
                            const x = 50 + radius * Math.cos(angleRad);
                            const y = 50 + radius * Math.sin(angleRad);

                            // Number text position (slightly inward)
                            const textRadius = 32;
                            const tx = 50 + textRadius * Math.cos(angleRad);
                            const ty = 50 + textRadius * Math.sin(angleRad);

                            // Slight rotation for number text to follow curve? No, usually upright or radial. Reference has handwritten style upright.
                            const numberRotation = 0; // random(-5, 5) for handshake effect?

                            return (
                                <React.Fragment key={num}>
                                    {/* Image Bubble */}
                                    <div
                                        className="absolute w-[18%] aspect-square rounded-full overflow-hidden border-2 border-white/50 shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                    >
                                        <img
                                            src={clockImages[i]}
                                            alt={`Hour ${num}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Number Text (Handwritten style) */}
                                    <div
                                        className="absolute text-2xl md:text-3xl font-bold font-serif opacity-90 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
                                        style={{
                                            left: `${tx}%`,
                                            top: `${ty}%`,
                                            color: config.clockColor,
                                            fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' // Handwritten feel
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
                        <div className="flex justify-center flex-wrap gap-4 text-2xl md:text-3xl font-serif opacity-80" style={{ color: config.clockColor }}>
                            {/* Mimic the 7, 6, 5 numbers at bottom flowing creatively if desired, but user probably wants custom text. 
                                 The reference has numbers 7,6,5 displaced by text. 
                                 I'll keep the text layout simple but centered.
                             */}
                        </div>
                    </div>

                    {/* Clock Center Dot */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-xl border-2 border-white/50"></div>

                    {/* Hands */}
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

                    {/* Floating Heart Animation in Center */}
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
