'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 极光烟花组件 - 基于 tsParticles 的沉浸式烟花体验
 * 参考: fireworks_3-main (tsParticles preset)
 * 特点: 
 *   - 纯净全屏沉浸式烟花体验
 *   - 流畅的物理动画效果
 *   - 渐变文字动画
 *   - 支持自定义颜色主题
 *   - 点击屏幕互动发射
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    titleText: string;
    greetings: string[];
    colorTheme: 'rainbow' | 'warm' | 'cool' | 'gold' | 'romantic';
    particleSize: number;
    launchSpeed: number;
    trailLength: number;
    gravity: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('aurora-fireworks'),
    music: [
        { label: '新年祝福', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    colorThemes: {
        rainbow: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ffffff', '#ff7eb3', '#00ffff'],
        warm: ['#ff6b6b', '#ffa94d', '#ffd43b', '#ff8787', '#fa5252', '#ffffff', '#ffe066'],
        cool: ['#74c0fc', '#4dabf7', '#228be6', '#15aabf', '#0ca678', '#ffffff', '#a5d8ff'],
        gold: ['#ffd700', '#ffb347', '#ff8c00', '#ffa500', '#ff7f50', '#ffffff', '#ffe4b5'],
        romantic: ['#ff69b4', '#ff1493', '#db7093', '#ffb6c1', '#ffc0cb', '#ffffff', '#e6e6fa'],
    },
    greetingTemplates: [
        '✨ 新年快乐 ✨',
        '🎆 万事如意 🎆',
        '💫 心想事成 💫',
        '🌟 前程似锦 🌟',
        '❤️ 幸福美满 ❤️',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '亲爱的你',
    titleText: '极光烟花夜',
    greetings: PRESETS.greetingTemplates,
    colorTheme: 'rainbow',
    particleSize: 3,
    launchSpeed: 15,
    trailLength: 10,
    gravity: 9,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000011' },
        0
    ),
    bgValue: '#000011',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const auroraFireworksCardConfigMetadata = {
    panelTitle: '极光烟花配置',
    panelSubtitle: 'Aurora Fireworks Experience',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '送给谁', placeholder: '亲爱的你' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '标题', placeholder: '极光烟花夜' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语', placeholder: '输入祝福语', description: '每行一句，轮流展示' },

        colorTheme: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '颜色主题',
            options: [
                { label: '彩虹', value: 'rainbow' },
                { label: '暖色', value: 'warm' },
                { label: '冷色', value: 'cool' },
                { label: '金色', value: 'gold' },
                { label: '浪漫', value: 'romantic' },
            ]
        },
        particleSize: { category: 'visual' as const, type: 'slider' as const, label: '粒子大小', min: 1, max: 6, step: 1 },
        launchSpeed: { category: 'visual' as const, type: 'slider' as const, label: '发射速度', min: 8, max: 25, step: 1 },
        trailLength: { category: 'visual' as const, type: 'slider' as const, label: '尾迹长度', min: 5, max: 20, step: 1 },
        gravity: { category: 'visual' as const, type: 'slider' as const, label: '重力强度', min: 5, max: 15, step: 1 },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '祝福内容', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'greetings' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['colorTheme' as const, 'particleSize' as const, 'launchSpeed' as const, 'trailLength' as const, 'gravity' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 创建 tsParticles 配置
// ============================================================================
const createFireworksConfig = (config: AppConfig) => {
    const colors = PRESETS.colorThemes[config.colorTheme];

    return {
        fullScreen: { enable: false },
        detectRetina: true,
        background: { color: 'transparent' },
        fpsLimit: 120,
        emitters: {
            direction: 'top',
            life: {
                count: 0,
                duration: 0.1,
                delay: 0.1,
            },
            rate: {
                delay: 0.8,
                quantity: 1,
            },
            size: {
                width: 100,
                height: 0,
            },
            position: {
                y: 100,
                x: 50,
            },
        },
        particles: {
            number: { value: 0 },
            destroy: {
                bounds: { top: 20 },
                mode: 'split',
                split: {
                    count: 1,
                    factor: { value: 0.333333 },
                    rate: { value: 100 },
                    particles: {
                        stroke: { width: 0 },
                        color: { value: colors },
                        number: { value: 0 },
                        collisions: { enable: false },
                        destroy: { bounds: { top: 0 } },
                        opacity: {
                            value: { min: 0.1, max: 1 },
                            animation: {
                                enable: true,
                                speed: 0.7,
                                sync: false,
                                startValue: 'max',
                                destroy: 'min',
                            },
                        },
                        shape: { type: 'circle' },
                        size: {
                            value: { min: config.particleSize - 1, max: config.particleSize + 1 },
                            animation: { enable: false },
                        },
                        life: {
                            count: 1,
                            duration: { value: { min: 1, max: 2.5 } },
                        },
                        move: {
                            enable: true,
                            gravity: {
                                enable: true,
                                acceleration: config.gravity,
                                inverse: false,
                            },
                            decay: 0.1,
                            speed: { min: 10, max: 30 },
                            direction: 'outside',
                            random: true,
                            straight: false,
                            outModes: {
                                default: 'destroy',
                                top: 'none',
                            },
                        },
                    },
                },
            },
            life: { count: 1 },
            shape: { type: 'line' },
            size: {
                value: { min: 1, max: 60 },
                animation: {
                    enable: true,
                    sync: true,
                    speed: 100,
                    startValue: 'max',
                    destroy: 'min',
                },
            },
            stroke: {
                color: { value: '#ffffff' },
                width: 1.5,
            },
            rotate: { path: true },
            move: {
                enable: true,
                gravity: {
                    acceleration: config.launchSpeed,
                    enable: true,
                    inverse: true,
                    maxSpeed: 100,
                },
                speed: { min: 12, max: 22 },
                outModes: {
                    default: 'destroy',
                    top: 'none',
                },
                trail: {
                    fillColor: 'transparent',
                    enable: true,
                    length: config.trailLength,
                },
            },
        },
        sounds: {
            enable: config.enableSound,
            events: [
                {
                    event: 'particleRemoved',
                    filter: (args: any) => args.data.particle.options.move.gravity.inverse,
                    audio: [
                        'https://particles.js.org/audio/explosion0.mp3',
                        'https://particles.js.org/audio/explosion1.mp3',
                        'https://particles.js.org/audio/explosion2.mp3',
                    ],
                },
            ],
            volume: 30,
        },
    };
};

// ============================================================================
// 主组件
// ============================================================================
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesContainerRef = useRef<HTMLDivElement>(null);
    const tsParticlesRef = useRef<any>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
    const [showGreeting, setShowGreeting] = useState(false);

    const {
        isPlaying,
        isMuted,
        handlePlayPause: toggleMusic,
        handleToggleMute: toggleMute,
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

    // 获取祝福语列表
    const getGreetingList = useCallback(() => {
        let list: string[] = [];
        if (Array.isArray(config.greetings)) {
            list = config.greetings;
        } else if (typeof config.greetings === 'string') {
            list = (config.greetings as string).split('\n').filter(s => s.trim() !== '');
        }
        return list.length > 0 ? list : PRESETS.greetingTemplates;
    }, [config.greetings]);

    // 加载 tsParticles
    useEffect(() => {
        const loadTsParticles = async () => {
            try {
                if (typeof window !== 'undefined' && !(window as any).tsParticles) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/tsparticles-preset-fireworks@2.12.0/tsparticles.preset.fireworks.bundle.min.js';
                    script.async = true;
                    script.onload = () => setIsLoaded(true);
                    document.head.appendChild(script);
                } else {
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load tsParticles:', error);
            }
        };
        loadTsParticles();
    }, []);

    // 初始化粒子效果
    useEffect(() => {
        if (!isLoaded || showWelcome || !particlesContainerRef.current) return;

        const initParticles = async () => {
            try {
                const tsParticles = (window as any).tsParticles;
                if (!tsParticles) return;

                if (tsParticlesRef.current) {
                    tsParticlesRef.current.destroy();
                }

                await tsParticles.load({
                    id: 'aurora-particles',
                    options: createFireworksConfig(config),
                });

                tsParticlesRef.current = tsParticles.domItem(0);
            } catch (error) {
                console.error('Failed to initialize particles:', error);
            }
        };

        initParticles();

        return () => {
            if (tsParticlesRef.current) {
                tsParticlesRef.current.destroy();
                tsParticlesRef.current = null;
            }
        };
    }, [isLoaded, showWelcome, config, isMuted]);

    // 祝福语轮播
    useEffect(() => {
        if (!showGreeting) return;
        const greetingList = getGreetingList();
        const interval = setInterval(() => {
            setCurrentGreetingIndex((prev) => (prev + 1) % greetingList.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [showGreeting, getGreetingList]);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
        setTimeout(() => setShowGreeting(true), 1500);
    }, []);

    const greetingList = getGreetingList();
    const themeColors = PRESETS.colorThemes[config.colorTheme];
    const primaryColor = themeColors[0];
    const accentColor = themeColors[1];

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 粒子容器 */}
            {!showWelcome && (
                <div
                    id="aurora-particles"
                    ref={particlesContainerRef}
                    className="absolute inset-0 z-10"
                    style={{ background: 'transparent' }}
                />
            )}

            {/* 祝福语显示 */}
            {showGreeting && (
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
                    <div className="text-center">
                        {config.recipientName && (
                            <div
                                className="text-xl md:text-3xl mb-6 font-serif tracking-widest animate-pulse"
                                style={{
                                    color: 'white',
                                    textShadow: `0 0 30px ${primaryColor}, 0 0 60px ${accentColor}`,
                                }}
                            >
                                {config.recipientName}
                            </div>
                        )}
                        <h1
                            key={currentGreetingIndex}
                            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest"
                            style={{
                                background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: `drop-shadow(0 0 30px ${primaryColor})`,
                                animation: 'pulse-aurora 3s ease-in-out infinite',
                            }}
                        >
                            {greetingList[currentGreetingIndex]}
                        </h1>
                    </div>
                </div>
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)`,
                        }}
                    />
                    <div className="relative text-center px-4">
                        {/* 动态光环 */}
                        <div className="relative mb-8">
                            <div
                                className="absolute inset-0 blur-3xl opacity-50"
                                style={{
                                    background: `conic-gradient(from 0deg, ${themeColors.join(', ')})`,
                                    animation: 'spin 8s linear infinite',
                                }}
                            />
                            <span
                                className="relative text-8xl md:text-9xl"
                                style={{
                                    filter: `drop-shadow(0 0 40px ${primaryColor})`,
                                    animation: 'bounce-slow 3s ease-in-out infinite',
                                }}
                            >
                                🎆
                            </span>
                        </div>

                        {config.recipientName && (
                            <div
                                className="text-3xl md:text-5xl mb-4 font-serif tracking-widest"
                                style={{
                                    background: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: `0 0 30px ${primaryColor}`,
                                }}
                            >
                                {config.recipientName}
                            </div>
                        )}

                        <h1 className="text-white/70 text-lg md:text-xl mb-10 tracking-[0.3em] font-light">
                            {config.titleText}
                        </h1>

                        <button
                            onClick={startAnimation}
                            className="relative px-12 py-5 rounded-full text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                                boxShadow: `0 0 40px ${primaryColor}80, 0 0 80px ${accentColor}50`,
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3 text-white">
                                <span className="text-2xl">✨</span>
                                点亮极光烟花夜
                                <span className="text-2xl">✨</span>
                            </span>
                            <div
                                className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                            />
                        </button>

                        <p className="mt-8 text-white/50 text-sm">
                            {isLoaded ? '✅ 烟花特效已就绪' : '⏳ 正在加载特效...'}
                        </p>
                    </div>
                </div>
            )}

            {/* 底部提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                    <div className="text-white/40 text-sm">
                        ✨ 沉浸在极光烟花的浪漫中 ✨
                    </div>
                </div>
            )}

            {/* 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes pulse-aurora {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.9;
                        transform: scale(1.02);
                    }
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function AuroraFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
