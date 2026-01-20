'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { Heart, Stars, Handshake, Sparkles } from 'lucide-react';

/**
 * ==============================================================================
 * 情侣协议书 - 浪漫甜蜜的爱情约定
 * 特点:
 *   - 完美适配移动端/PC端
 *   - 自定义协议透明度
 *   - 浪漫的视觉效果（飘落爱心、光晕效果）
 *   - 可自定义条款内容
 * ==============================================================================
 */

export interface AppConfig {
    titleText: string;
    partyAName: string;
    partyBName: string;
    clauses: string[];
    signatureDate: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    themeColor: string;
    paperOpacity: number; // 新增：协议透明度
    showFloatingHearts: boolean; // 新增：飘落爱心开关
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔情歌', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '甜蜜原声', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_l_06f14066c0.mp3' },
        { label: '梦幻夜曲', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    defaultClauses: [
        '要有共同的人生目标，未来是你',
        '可以有异性朋友，但要保持分寸',
        '彼此信任坦诚，不可以欺骗',
        '不生隔夜气，当天事情当天解决',
        '生气时，绝不可以放狠话，会伤感情',
        '不要冷战，有问题及时沟通',
        '答应对方的事情要说到做到',
    ]
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '情侣协议书',
    partyAName: '小张',
    partyBName: '小美',
    clauses: PRESETS.defaultClauses,
    signatureDate: new Date().toISOString().split('T')[0],
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#1a1a2e',
        },
        0.1
    ),
    bgValue: '#1a1a2e',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    themeColor: '#ff6b9d',
    paperOpacity: 0.92,
    showFloatingHearts: true,
};

export const couplesAgreementConfigMetadata = {
    panelTitle: '情侣协议专属定制',
    panelSubtitle: 'Create Your Love Agreement',
    configSchema: {
        partyAName: { category: 'content' as const, type: 'input' as const, label: '💕 甲方姓名', placeholder: '例如：小张' },
        partyBName: { category: 'content' as const, type: 'input' as const, label: '💕 乙方姓名', placeholder: '例如：小美' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '协议标题', placeholder: '情侣协议书' },
        signatureDate: { category: 'content' as const, type: 'datetime' as const, label: '签署日期', timeType: 'date' as const },
        clauses: { category: 'content' as const, type: 'list' as const, label: '💌 协议条款', placeholder: '输入条款内容', description: '每一行代表一条约定' },

        themeColor: { category: 'visual' as const, type: 'color' as const, label: '💗 主题颜色', description: '协议书的主色调' },
        paperOpacity: { category: 'visual' as const, type: 'slider' as const, label: '📄 协议透明度', min: 0.3, max: 1, step: 0.05, description: '调整协议纸张的透明度' },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '💕 飘落爱心' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '签署人', icon: null, fields: ['partyAName' as const, 'partyBName' as const, 'signatureDate' as const] },
        { id: 2, label: '约定条款', icon: null, fields: ['clauses' as const, 'titleText' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['themeColor' as const, 'paperOpacity' as const, 'showFloatingHearts' as const] },
        { id: 4, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

/**
 * ==============================================================================
 * 飘落爱心组件
 * ==============================================================================
 */
interface FloatingHeart {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

function FloatingHearts({ themeColor }: { themeColor: string }) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);

    useEffect(() => {
        const newHearts: FloatingHeart[] = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: 12 + Math.random() * 16,
            duration: 8 + Math.random() * 8,
            delay: Math.random() * 5,
            opacity: 0.3 + Math.random() * 0.4,
        }));
        setHearts(newHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-float-down"
                    style={{
                        left: `${heart.x}%`,
                        top: '-30px',
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        opacity: heart.opacity,
                    }}
                >
                    <Heart
                        size={heart.size}
                        fill={themeColor}
                        stroke="none"
                        style={{
                            filter: `drop-shadow(0 0 ${heart.size / 3}px ${themeColor}80)`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

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
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: config.enableSound,
        volume: 0.4,
    });

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    const clausesList = useMemo(() => {
        if (Array.isArray(config.clauses)) return config.clauses;
        if (typeof config.clauses === 'string') return (config.clauses as string).split('\n').filter(s => s.trim() !== '');
        return PRESETS.defaultClauses;
    }, [config.clauses]);

    // 计算协议透明度相关样式
    const paperOpacity = config.paperOpacity ?? 0.92;

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                {/* 浪漫光晕效果 */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at 30% 20%, ${config.themeColor}20 0%, transparent 50%),
                                     radial-gradient(ellipse at 70% 80%, ${config.themeColor}15 0%, transparent 50%)`,
                    }}
                />
                {/* 星点装饰 */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                        backgroundImage: `radial-gradient(${config.themeColor} 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* 飘落爱心 */}
            {config.showFloatingHearts && <FloatingHearts themeColor={config.themeColor} />}

            {/* 2. Main Content - Paper Effect */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-3 sm:p-4 md:p-8 overflow-y-auto">
                <div
                    className="relative w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl backdrop-blur-md shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 lg:p-12 transform transition-all duration-700 my-4"
                    style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,${paperOpacity}) 0%, rgba(255,250,250,${paperOpacity * 0.95}) 100%)`,
                        boxShadow: `0 25px 80px -15px ${config.themeColor}40, 0 0 0 1px ${config.themeColor}10, inset 0 1px 0 rgba(255,255,255,0.5)`,
                        border: `1px solid ${config.themeColor}20`
                    }}
                >
                    {/* Decorative Corner Elements */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-t-2 sm:border-t-3 md:border-t-4 border-l-2 sm:border-l-3 md:border-l-4 rounded-tl-xl opacity-50" style={{ borderColor: config.themeColor }}></div>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-t-2 sm:border-t-3 md:border-t-4 border-r-2 sm:border-r-3 md:border-r-4 rounded-tr-xl opacity-50" style={{ borderColor: config.themeColor }}></div>
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-b-2 sm:border-b-3 md:border-b-4 border-l-2 sm:border-l-3 md:border-l-4 rounded-bl-xl opacity-50" style={{ borderColor: config.themeColor }}></div>
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-b-2 sm:border-b-3 md:border-b-4 border-r-2 sm:border-r-3 md:border-r-4 rounded-br-xl opacity-50" style={{ borderColor: config.themeColor }}></div>

                    {/* Floating Hearts Animation */}
                    <div className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 animate-bounce text-pink-500" style={{ animationDelay: '0.7s' }}>
                        <Heart size={28} fill={config.themeColor} stroke="none" className="drop-shadow-lg sm:w-8 sm:h-8" />
                    </div>
                    <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 animate-bounce text-pink-400" style={{ animationDelay: '0.3s' }}>
                        <Heart size={22} fill={`${config.themeColor}90`} stroke="none" className="drop-shadow-lg sm:w-6 sm:h-6" />
                    </div>
                    <div className="absolute top-1/2 -right-3 sm:-right-4 animate-pulse opacity-60">
                        <Sparkles size={18} color={config.themeColor} className="sm:w-5 sm:h-5" />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6 sm:mb-8 md:mb-10 pt-2 sm:pt-4">
                        <h1
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-wide sm:tracking-widest mb-2 sm:mb-3"
                            style={{
                                color: '#2d2d2d',
                                textShadow: `0 2px 10px ${config.themeColor}30`,
                            }}
                        >
                            {config.titleText}
                        </h1>
                        <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base" style={{ color: config.themeColor }}>
                            <Stars size={14} className="sm:w-4 sm:h-4 animate-pulse" />
                            <span className="tracking-[0.15em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase font-medium opacity-80">Official Love Contract</span>
                            <Stars size={14} className="sm:w-4 sm:h-4 animate-pulse" />
                        </div>
                    </div>

                    {/* Clauses List */}
                    <div className="space-y-4 sm:space-y-5 md:space-y-6 pl-1 sm:pl-2 md:pl-4 lg:pl-6">
                        {clausesList.map((clause, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 sm:gap-3 md:gap-4 group transition-all duration-300 hover:translate-x-1"
                            >
                                <span
                                    className="flex-shrink-0 font-serif text-xl sm:text-2xl md:text-3xl italic font-bold opacity-40 mt-[-2px] sm:mt-[-4px] select-none group-hover:opacity-70 transition-all duration-300"
                                    style={{ color: config.themeColor }}
                                >
                                    {index + 1}.
                                </span>
                                <p
                                    className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                                    style={{ fontFamily: "'Noto Serif SC', 'Ma Shan Zheng', 'Zcool XiaoWei', serif" }}
                                >
                                    {clause}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Signatures Section */}
                    <div className="mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-10 border-t-2 border-dashed" style={{ borderColor: `${config.themeColor}30` }}>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-12 lg:gap-16">

                            {/* Party A */}
                            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 group cursor-pointer">
                                <div
                                    className="text-[10px] sm:text-xs md:text-sm tracking-wider sm:tracking-widest uppercase opacity-60 mb-0.5 sm:mb-1"
                                    style={{ color: config.themeColor }}
                                >
                                    ❤️ 爱我的人
                                </div>
                                <div className="relative">
                                    <div
                                        className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 border-b-2 pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-center font-serif transition-all duration-300 group-hover:border-b-3"
                                        style={{ borderColor: config.themeColor }}
                                    >
                                        {config.partyAName || "__________"}
                                    </div>
                                    <div
                                        className="absolute -right-4 sm:-right-5 md:-right-6 -top-4 sm:-top-5 md:-top-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform rotate-12 scale-90 group-hover:scale-100"
                                    >
                                        <span
                                            className="text-[10px] sm:text-xs text-white px-1.5 sm:px-2 py-0.5 rounded shadow-lg"
                                            style={{ background: `linear-gradient(135deg, ${config.themeColor}, ${config.themeColor}dd)` }}
                                        >
                                            ✓ Signed
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500">甲方 (Party A)</div>
                            </div>

                            {/* Party B */}
                            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 group cursor-pointer">
                                <div
                                    className="text-[10px] sm:text-xs md:text-sm tracking-wider sm:tracking-widest uppercase opacity-60 mb-0.5 sm:mb-1"
                                    style={{ color: config.themeColor }}
                                >
                                    💕 我爱的人
                                </div>
                                <div className="relative">
                                    <div
                                        className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 border-b-2 pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-center font-serif transition-all duration-300 group-hover:border-b-3"
                                        style={{ borderColor: config.themeColor }}
                                    >
                                        {config.partyBName || "__________"}
                                    </div>
                                    <div
                                        className="absolute -right-4 sm:-right-5 md:-right-6 -top-4 sm:-top-5 md:-top-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform rotate-12 scale-90 group-hover:scale-100"
                                    >
                                        <span
                                            className="text-[10px] sm:text-xs text-white px-1.5 sm:px-2 py-0.5 rounded shadow-lg"
                                            style={{ background: `linear-gradient(135deg, ${config.themeColor}, ${config.themeColor}dd)` }}
                                        >
                                            ✓ Signed
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500">乙方 (Party B)</div>
                            </div>

                        </div>

                        {/* Date */}
                        <div className="flex justify-center mt-8 sm:mt-10 md:mt-12 text-gray-500 font-serif italic text-sm sm:text-base">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${config.themeColor}10` }}>
                                <span className="opacity-70">签署日期:</span>
                                <span className="font-medium text-gray-700">
                                    {config.signatureDate}
                                </span>
                            </div>
                        </div>

                        {/* Love Declaration */}
                        <div className="text-center mt-6 sm:mt-8">
                            <p
                                className="text-xs sm:text-sm md:text-base italic opacity-60"
                                style={{ color: config.themeColor }}
                            >
                                "从此以后，只想和你一起，慢慢变老"
                            </p>
                        </div>
                    </div>

                    {/* Footer Watermark */}
                    <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center opacity-15 pointer-events-none">
                        <Handshake className="inline-block" size={36} color={config.themeColor} />
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
                size="sm"
            />

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes float-down {
                    0% {
                        transform: translateY(-100%) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                .animate-float-down {
                    animation: float-down linear infinite;
                }

                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default function CouplesAgreementPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
