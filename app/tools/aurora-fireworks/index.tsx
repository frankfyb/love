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
 * 极光烟花组件 - 浪漫沉浸式烟花体验
 * 特点: 
 *   - 纯净全屏沉浸式烟花体验
 *   - 流畅的物理动画效果
 *   - 浪漫的飘落爱心与星光
 *   - 渐变文字动画
 *   - 响应式设计（移动端/PC端完美适配）
 *   - 支持自定义颜色主题
 *   - 触摸/点击屏幕互动发射
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    titleText: string;
    greetings: string[];
    colorTheme: 'rainbow' | 'warm' | 'cool' | 'gold' | 'romantic' | 'aurora';
    particleSize: number;
    launchSpeed: number;
    trailLength: number;
    gravity: number;
    showFloatingHearts: boolean;
    showStarField: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('aurora-fireworks'),
    music: [
        { label: '浪漫星空', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '梦幻夜曲', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '甜蜜时光', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '静谧钢琴', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    colorThemes: {
        rainbow: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ffffff', '#ff7eb3', '#00ffff'],
        warm: ['#ff6b6b', '#ffa94d', '#ffd43b', '#ff8787', '#fa5252', '#ffffff', '#ffe066'],
        cool: ['#74c0fc', '#4dabf7', '#228be6', '#15aabf', '#0ca678', '#ffffff', '#a5d8ff'],
        gold: ['#ffd700', '#ffb347', '#ff8c00', '#ffa500', '#ff7f50', '#ffffff', '#ffe4b5'],
        romantic: ['#ff69b4', '#ff1493', '#db7093', '#ffb6c1', '#ffc0cb', '#ffffff', '#e6e6fa', '#ff6b9d'],
        aurora: ['#00d9ff', '#00ffcc', '#7c3aed', '#f472b6', '#22d3ee', '#a78bfa', '#fbbf24', '#ffffff'],
    },
    greetingTemplates: [
        '✨ 愿你被世界温柔以待 ✨',
        '💕 你是我心中最美的风景 💕',
        '🌟 与你相遇是最美的意外 🌟',
        '❤️ 余生请多指教 ❤️',
        '💫 愿所有美好如期而至 💫',
        '🌙 你是我的月亮与六便士 🌙',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '亲爱的你',
    titleText: '极光烟花夜',
    greetings: PRESETS.greetingTemplates,
    colorTheme: 'romantic',
    particleSize: 3,
    launchSpeed: 15,
    trailLength: 10,
    gravity: 9,
    showFloatingHearts: true,
    showStarField: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0015' },
        0
    ),
    bgValue: '#0a0015',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const auroraFireworksCardConfigMetadata = {
    panelTitle: '极光烟花配置',
    panelSubtitle: 'Aurora Fireworks Romantic Experience',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '送给谁 💕', placeholder: '亲爱的你' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '标题', placeholder: '极光烟花夜' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '浪漫祝福语', placeholder: '输入祝福语', description: '每行一句，缓缓展示你的心意' },

        colorTheme: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '颜色主题',
            options: [
                { label: '🌈 彩虹', value: 'rainbow' },
                { label: '🔥 暖色', value: 'warm' },
                { label: '❄️ 冷色', value: 'cool' },
                { label: '✨ 金色', value: 'gold' },
                { label: '💕 浪漫粉', value: 'romantic' },
                { label: '🌌 极光', value: 'aurora' },
            ]
        },
        particleSize: { category: 'visual' as const, type: 'slider' as const, label: '粒子大小', min: 1, max: 6, step: 1 },
        launchSpeed: { category: 'visual' as const, type: 'slider' as const, label: '发射速度', min: 8, max: 25, step: 1 },
        trailLength: { category: 'visual' as const, type: 'slider' as const, label: '尾迹长度', min: 5, max: 20, step: 1 },
        gravity: { category: 'visual' as const, type: 'slider' as const, label: '重力强度', min: 5, max: 15, step: 1 },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心 💕' },
        showStarField: { category: 'visual' as const, type: 'switch' as const, label: '璀璨星空 ✨' },

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
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '祝福内容', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'greetings' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['colorTheme' as const, 'particleSize' as const, 'launchSpeed' as const, 'trailLength' as const, 'gravity' as const, 'showFloatingHearts' as const, 'showStarField' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 飘落爱心组件
// ============================================================================
interface FloatingHeart {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    speed: number;
    swaySpeed: number;
    swayAmount: number;
    color: string;
}

function FloatingHeartsLayer({ colors, enabled }: { colors: string[]; enabled: boolean }) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const heartId = useRef(0);

    useEffect(() => {
        if (!enabled) {
            setHearts([]);
            return;
        }

        const createHeart = (): FloatingHeart => ({
            id: heartId.current++,
            x: Math.random() * 100,
            y: -10,
            size: Math.random() * 16 + 10,
            opacity: Math.random() * 0.5 + 0.3,
            rotation: Math.random() * 360,
            speed: Math.random() * 0.8 + 0.3,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayAmount: Math.random() * 30 + 15,
            color: colors[Math.floor(Math.random() * colors.length)],
        });

        // 初始化一些爱心
        const initialHearts = Array.from({ length: 8 }, createHeart).map((h, i) => ({
            ...h,
            y: Math.random() * 100,
        }));
        setHearts(initialHearts);

        let time = 0;
        const animate = () => {
            time += 1;

            setHearts(prev => {
                let newHearts = prev
                    .map(heart => ({
                        ...heart,
                        y: heart.y + heart.speed,
                        x: heart.x + Math.sin(time * heart.swaySpeed) * 0.3,
                        rotation: heart.rotation + 0.5,
                    }))
                    .filter(heart => heart.y < 110);

                // 随机添加新爱心
                if (Math.random() < 0.03 && newHearts.length < 15) {
                    newHearts = [...newHearts, createHeart()];
                }

                return newHearts;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [colors, enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="absolute transition-none"
                    style={{
                        left: `${heart.x}%`,
                        top: `${heart.y}%`,
                        fontSize: `${heart.size}px`,
                        opacity: heart.opacity,
                        transform: `rotate(${heart.rotation}deg)`,
                        color: heart.color,
                        textShadow: `0 0 10px ${heart.color}`,
                        willChange: 'transform, top, left',
                    }}
                >
                    ❤
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// 星空背景层
// ============================================================================
function StarFieldLayer({ enabled }: { enabled: boolean }) {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; twinkleSpeed: number }>>([]);

    useEffect(() => {
        if (!enabled) {
            setStars([]);
            return;
        }

        const starCount = window.innerWidth < 768 ? 50 : 100;
        const newStars = Array.from({ length: starCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 3 + 2,
        }));
        setStars(newStars);
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-1">
            {stars.map(star => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite`,
                        boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
                    }}
                />
            ))}
        </div>
    );
}

// ============================================================================
// 创建 tsParticles 配置
// ============================================================================
const createFireworksConfig = (config: AppConfig, isMobile: boolean) => {
    const colors = PRESETS.colorThemes[config.colorTheme];
    const particleMultiplier = isMobile ? 0.6 : 1;

    return {
        fullScreen: { enable: false },
        detectRetina: true,
        background: { color: 'transparent' },
        fpsLimit: isMobile ? 60 : 120,
        emitters: {
            direction: 'top',
            life: {
                count: 0,
                duration: 0.1,
                delay: 0.1,
            },
            rate: {
                delay: isMobile ? 1.2 : 0.8,
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
                bounds: { top: isMobile ? 25 : 20 },
                mode: 'split',
                split: {
                    count: 1,
                    factor: { value: 0.333333 },
                    rate: { value: Math.floor(100 * particleMultiplier) },
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
                            duration: { value: { min: 1, max: isMobile ? 2 : 2.5 } },
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
                value: { min: 1, max: isMobile ? 40 : 60 },
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
                speed: { min: isMobile ? 10 : 12, max: isMobile ? 18 : 22 },
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
    const [isMobile, setIsMobile] = useState(false);
    const [greetingOpacity, setGreetingOpacity] = useState(0);

    // 背景音乐控制
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

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                    options: createFireworksConfig(config, isMobile),
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
    }, [isLoaded, showWelcome, config, isMuted, isMobile]);

    // 祝福语轮播 + 淡入淡出
    useEffect(() => {
        if (!showGreeting) return;
        const greetingList = getGreetingList();

        // 初始淡入
        setGreetingOpacity(1);

        const interval = setInterval(() => {
            // 淡出
            setGreetingOpacity(0);

            setTimeout(() => {
                setCurrentGreetingIndex((prev) => (prev + 1) % greetingList.length);
                // 淡入
                setGreetingOpacity(1);
            }, 500);
        }, 4000);

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
    const tertiaryColor = themeColors[2] || themeColors[0];

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none touch-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 浪漫渐变叠加层 */}
            <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 50% 0%, ${primaryColor}15 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 80% 80%, ${accentColor}10 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 20% 70%, ${tertiaryColor}10 0%, transparent 50%)
                    `,
                }}
            />

            {/* 星空层 */}
            <StarFieldLayer enabled={config.showStarField} />

            {/* 飘落爱心层 */}
            <FloatingHeartsLayer colors={themeColors} enabled={config.showFloatingHearts} />

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
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4 sm:px-8">
                    <div
                        className="text-center max-w-[90vw] sm:max-w-2xl lg:max-w-4xl transition-opacity duration-500"
                        style={{ opacity: greetingOpacity }}
                    >
                        {config.recipientName && (
                            <div
                                className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 font-serif tracking-widest"
                                style={{
                                    color: 'white',
                                    textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${accentColor}, 0 2px 10px rgba(0,0,0,0.5)`,
                                    animation: 'float 4s ease-in-out infinite',
                                }}
                            >
                                💕 {config.recipientName} 💕
                            </div>
                        )}
                        <h1
                            key={currentGreetingIndex}
                            className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-wide sm:tracking-widest leading-tight"
                            style={{
                                background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]}, ${themeColors[3] || themeColors[0]})`,
                                backgroundSize: '300% 300%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: `drop-shadow(0 0 20px ${primaryColor}) drop-shadow(0 0 40px ${accentColor})`,
                                animation: 'gradient-flow 5s ease infinite, pulse-aurora 3s ease-in-out infinite',
                            }}
                        >
                            {greetingList[currentGreetingIndex]}
                        </h1>
                    </div>
                </div>
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center safe-area-inset">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.85) 100%)`,
                        }}
                    />
                    <div className="relative text-center px-6 sm:px-8 max-w-lg sm:max-w-2xl">
                        {/* 动态光环 */}
                        <div className="relative mb-6 sm:mb-8">
                            <div
                                className="absolute inset-0 blur-3xl opacity-40"
                                style={{
                                    background: `conic-gradient(from 0deg, ${themeColors.join(', ')})`,
                                    animation: 'spin 10s linear infinite',
                                    borderRadius: '50%',
                                    transform: 'scale(2)',
                                }}
                            />
                            {/* 第二层光晕 */}
                            <div
                                className="absolute inset-0 blur-2xl opacity-30"
                                style={{
                                    background: `radial-gradient(circle, ${primaryColor}50 0%, transparent 70%)`,
                                    animation: 'pulse 3s ease-in-out infinite',
                                }}
                            />
                            <div className="relative">
                                <span
                                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl block"
                                    style={{
                                        filter: `drop-shadow(0 0 30px ${primaryColor}) drop-shadow(0 0 60px ${accentColor})`,
                                        animation: 'bounce-slow 3s ease-in-out infinite',
                                    }}
                                >
                                    🎆
                                </span>
                                {/* 装饰爱心 */}
                                <span
                                    className="absolute -right-2 sm:-right-4 top-0 text-xl sm:text-2xl md:text-3xl"
                                    style={{ animation: 'float 2s ease-in-out infinite' }}
                                >
                                    💕
                                </span>
                                <span
                                    className="absolute -left-2 sm:-left-4 bottom-0 text-lg sm:text-xl md:text-2xl"
                                    style={{ animation: 'float 2.5s ease-in-out infinite 0.5s' }}
                                >
                                    ✨
                                </span>
                            </div>
                        </div>

                        {config.recipientName && (
                            <div
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 font-serif tracking-wider sm:tracking-widest"
                                style={{
                                    background: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                                    backgroundSize: '200% auto',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'gradient-flow 3s ease infinite',
                                    textShadow: `0 0 30px ${primaryColor}`,
                                }}
                            >
                                💕 {config.recipientName} 💕
                            </div>
                        )}

                        <h1 className="text-white/70 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em] font-light">
                            {config.titleText}
                        </h1>

                        <button
                            onClick={startAnimation}
                            className="relative px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{
                                background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                                backgroundSize: '200% 200%',
                                animation: 'gradient-flow 3s ease infinite',
                                boxShadow: `0 0 30px ${primaryColor}60, 0 0 60px ${accentColor}40, 0 4px 20px rgba(0,0,0,0.3)`,
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2 sm:gap-3 text-white font-medium">
                                <span className="text-lg sm:text-xl md:text-2xl">✨</span>
                                <span>点亮浪漫烟花夜</span>
                                <span className="text-lg sm:text-xl md:text-2xl">✨</span>
                            </span>
                            {/* 光泽效果 */}
                            <div
                                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                            />
                        </button>

                        <p className="mt-6 sm:mt-8 text-white/50 text-xs sm:text-sm flex items-center justify-center gap-2">
                            {isLoaded ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    烟花特效已就绪
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                    正在加载浪漫特效...
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* 底部提示 - 响应式 */}
            {!showWelcome && (
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                    <div
                        className="text-white/40 text-xs sm:text-sm px-4 py-2 rounded-full backdrop-blur-sm"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
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
                        opacity: 0.95;
                        transform: scale(1.01);
                    }
                }
                
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                @keyframes gradient-flow {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.5;
                    }
                }

                /* 安全区域适配 (iPhone X+) */
                .safe-area-inset {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }

                /* 禁止移动端橡皮筋效果 */
                .touch-none {
                    touch-action: none;
                    -webkit-overflow-scrolling: auto;
                }

                /* 移动端点击反馈 */
                @media (max-width: 768px) {
                    button:active {
                        transform: scale(0.95) !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function AuroraFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
