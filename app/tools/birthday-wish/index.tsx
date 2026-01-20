'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 生日祝福组件 - 浪漫生日惊喜体验
 * 特点:
 *   - 四种浪漫效果模式（烟花文字/气球派对/聚光舞台/爱心祝福）
 *   - 响应式设计（移动端/PC端完美适配）
 *   - 浪漫飘落爱心与星光效果
 *   - 自定义倒计时惊喜揭晓
 *   - 多彩渐变气球动画
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    birthdayMessage: string;
    effectMode: 'fireworks-text' | 'balloon-party' | 'spotlight' | 'heart-blessing';
    textColor: string;
    balloonColors: string[];
    enableCountdown: boolean;
    countdownSeconds: number;
    showFloatingHearts: boolean;
    showSparkles: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 渐变色气球颜色配置 - 更浪漫的色彩
const BALLOON_GRADIENTS = [
    ['#ff69b4', '#ff1493'], // 粉红
    ['#ff6b9d', '#e91e63'], // 玫瑰
    ['#f472b6', '#ec4899'], // 浪漫粉
    ['#a78bfa', '#7c3aed'], // 紫罗兰
    ['#60a5fa', '#3b82f6'], // 天空蓝
    ['#fbbf24', '#f59e0b'], // 金色
    ['#34d399', '#10b981'], // 薄荷绿
    ['#f472b6', '#8b5cf6'], // 粉紫
    ['#fb7185', '#f43f5e'], // 珊瑚红
    ['#c084fc', '#a855f7'], // 梦幻紫
];

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('birthday-wish'),
    music: [
        { label: '🎂 温馨生日歌', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🎉 欢乐派对', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '💕 浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '✨ 梦幻祝福', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    effectModes: [
        { label: '🎆 烟花文字', value: 'fireworks-text' },
        { label: '🎈 气球派对', value: 'balloon-party' },
        { label: '🔦 聚光舞台', value: 'spotlight' },
        { label: '💗 爱心祝福', value: 'heart-blessing' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '亲爱的你',
    birthdayMessage: '生日快乐',
    effectMode: 'balloon-party',
    textColor: '#ff69b4',
    balloonColors: BALLOON_GRADIENTS.flat(),
    enableCountdown: true,
    countdownSeconds: 5,
    showFloatingHearts: true,
    showSparkles: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const birthdayWishConfigMetadata = {
    panelTitle: '生日祝福配置',
    panelSubtitle: 'Birthday Wish Romantic Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '寿星姓名 💕', placeholder: '例如：亲爱的宝贝' },
        birthdayMessage: { category: 'content' as const, type: 'input' as const, label: '祝福语 🎂', placeholder: '生日快乐' },

        effectMode: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '效果模式',
            options: PRESETS.effectModes
        },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        enableCountdown: { category: 'visual' as const, type: 'switch' as const, label: '惊喜倒计时' },
        countdownSeconds: { category: 'visual' as const, type: 'slider' as const, label: '倒计时秒数', min: 3, max: 10, step: 1 },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心 💕' },
        showSparkles: { category: 'visual' as const, type: 'switch' as const, label: '璀璨星光 ✨' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你最喜爱的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '💌 定制', icon: null },
        { id: 'visual' as const, label: '✨ 效果', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '寿星定制', icon: null, fields: ['recipientName' as const, 'birthdayMessage' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['effectMode' as const, 'textColor' as const, 'enableCountdown' as const, 'countdownSeconds' as const, 'showFloatingHearts' as const, 'showSparkles' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
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
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    speed: number;
    swaySpeed: number;
    color: string;
}

function FloatingHeartsLayer({ enabled, color }: { enabled: boolean; color: string }) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const heartId = useRef(0);

    const heartColors = useMemo(() => [
        color,
        '#ff69b4',
        '#ff1493',
        '#ffb6c1',
        '#ffc0cb',
        '#ff6b9d',
    ], [color]);

    useEffect(() => {
        if (!enabled) {
            setHearts([]);
            return;
        }

        const createHeart = (): FloatingHeart => ({
            id: heartId.current++,
            x: Math.random() * 100,
            y: -10,
            size: Math.random() * 14 + 10,
            opacity: Math.random() * 0.5 + 0.3,
            rotation: Math.random() * 360,
            speed: Math.random() * 0.6 + 0.2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            color: heartColors[Math.floor(Math.random() * heartColors.length)],
        });

        const initialHearts = Array.from({ length: 6 }, createHeart).map((h) => ({
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
                        x: heart.x + Math.sin(time * heart.swaySpeed) * 0.25,
                        rotation: heart.rotation + 0.4,
                    }))
                    .filter(heart => heart.y < 110);

                if (Math.random() < 0.025 && newHearts.length < 12) {
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
    }, [heartColors, enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="absolute"
                    style={{
                        left: `${heart.x}%`,
                        top: `${heart.y}%`,
                        fontSize: `${heart.size}px`,
                        opacity: heart.opacity,
                        transform: `rotate(${heart.rotation}deg)`,
                        color: heart.color,
                        textShadow: `0 0 10px ${heart.color}`,
                    }}
                >
                    ❤
                </div>
            ))}
        </div>
    );
}

/**
 * ==============================================================================
 * 星光闪烁组件
 * ==============================================================================
 */
function SparklesLayer({ enabled }: { enabled: boolean }) {
    const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

    useEffect(() => {
        if (!enabled) {
            setSparkles([]);
            return;
        }

        const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 50;
        const newSparkles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 3,
        }));
        setSparkles(newSparkles);
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-5">
            {sparkles.map(sparkle => (
                <div
                    key={sparkle.id}
                    className="absolute"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        fontSize: `${sparkle.size + 8}px`,
                        animation: `sparkle-twinkle 2s ease-in-out ${sparkle.delay}s infinite`,
                        opacity: 0.7,
                    }}
                >
                    ✨
                </div>
            ))}
        </div>
    );
}

/**
 * ==============================================================================
 * 粒子与动画类
 * ==============================================================================
 */

class FireworkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    age: number;
    maxAge: number;
    size: number;

    constructor(x: number, y: number, color: string, isMobile: boolean) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (0.5 - Math.random()) * (isMobile ? 80 : 100);
        this.vy = (0.5 - Math.random()) * (isMobile ? 80 : 100);
        this.age = Math.random() * 100 | 0;
        this.maxAge = this.age;
        this.size = isMobile ? 1.5 : 2;
    }

    update() {
        this.x += this.vx / 20;
        this.y += this.vy / 20;
        this.vy += 1;
        this.age--;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.age / this.maxAge);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive(): boolean {
        return this.age > 0;
    }
}

class Firework {
    x: number;
    y: number;
    targetY: number;
    vel: number;
    color: string;
    exploded: boolean;
    isMobile: boolean;

    constructor(canvasWidth: number, canvasHeight: number, isMobile: boolean) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetY = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.3;
        this.vel = -(Math.random() * Math.sqrt(canvasHeight) / 3 + Math.sqrt(4 * canvasHeight) / 2) / 5;
        this.color = `hsl(${Math.random() * 360 | 0}, 100%, 60%)`;
        this.exploded = false;
        this.isMobile = isMobile;
    }

    update(): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        this.y += this.vel;
        this.vel += 0.04;

        if (this.vel >= 0 && !this.exploded) {
            this.exploded = true;
            const particleCount = this.isMobile ? 120 : 200;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new FireworkParticle(this.x, this.y, this.color, this.isMobile));
            }
        }

        return particles;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.exploded) {
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    isAlive(): boolean {
        return !this.exploded;
    }
}

interface Balloon {
    id: number;
    width: number;
    delay: number;
    left: string;
    gradientStart: string;
    gradientEnd: string;
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

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [countdown, setCountdown] = useState(config.enableCountdown ? config.countdownSeconds : 0);
    const [showMessage, setShowMessage] = useState(!config.enableCountdown);
    const [spotlightPosition, setSpotlightPosition] = useState(0);
    const [textCharColors, setTextCharColors] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 音效控制
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

    // 获取有效的背景配置
    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 生成气球数据 - 响应式数量
    const balloons = useMemo((): Balloon[] => {
        const result: Balloon[] = [];
        const count = isMobile ? 30 : 50;
        for (let i = 0; i < count; i++) {
            const gradient = BALLOON_GRADIENTS[i % BALLOON_GRADIENTS.length];
            result.push({
                id: i,
                width: isMobile ? 60 + Math.random() * 50 : 100 + Math.random() * 90,
                delay: Math.random() * 100,
                left: `${Math.random() * 100}%`,
                gradientStart: gradient[0],
                gradientEnd: gradient[1],
            });
        }
        return result;
    }, [isMobile]);

    // 倒计时效果
    useEffect(() => {
        if (!config.enableCountdown) {
            setShowMessage(true);
            return;
        }

        setCountdown(config.countdownSeconds);
        setShowMessage(false);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowMessage(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [config.enableCountdown, config.countdownSeconds]);

    // 聚光灯动画
    useEffect(() => {
        if (config.effectMode !== 'spotlight') return;

        const animate = () => {
            setSpotlightPosition(prev => {
                const newPos = prev + 0.5;
                return newPos > 100 ? 0 : newPos;
            });
        };

        const interval = setInterval(animate, 50);
        return () => clearInterval(interval);
    }, [config.effectMode]);

    // 霓虹文字闪烁效果
    useEffect(() => {
        if (config.effectMode !== 'fireworks-text') return;

        const text = `${config.recipientName} ${config.birthdayMessage}`;

        const flash = () => {
            const colors = text.split('').map(() => {
                const hue = Math.random() * 360;
                const isWhite = Math.random() > 0.7;
                return isWhite ? 'rgba(255,255,255,0.3)' : `hsl(${hue}, 50%, 50%)`;
            });
            setTextCharColors(colors);
        };

        const interval = setInterval(flash, 1000);
        flash();
        return () => clearInterval(interval);
    }, [config.effectMode, config.recipientName, config.birthdayMessage]);

    // 烟花效果Canvas
    useEffect(() => {
        if (config.effectMode !== 'fireworks-text') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const fireworks: Firework[] = [];
        const particles: FireworkParticle[] = [];

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 初始化烟花 - 响应式数量
        const initFireworks = () => {
            const count = isMobile ? 2 : Math.max(3, Math.floor(canvas.width / 200));
            for (let i = 0; i < count; i++) {
                fireworks.push(new Firework(canvas.width, canvas.height, isMobile));
            }
        };
        initFireworks();

        const loop = () => {
            // 使用透明淡出效果，让背景可见
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            for (let i = fireworks.length - 1; i >= 0; i--) {
                const newParticles = fireworks[i].update();
                particles.push(...newParticles);
                fireworks[i].draw(ctx);

                if (!fireworks[i].isAlive()) {
                    fireworks.splice(i, 1);
                    fireworks.push(new Firework(canvas.width, canvas.height, isMobile));
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw(ctx);

                if (!particles[i].isAlive()) {
                    particles.splice(i, 1);
                }
            }

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.effectMode, isMobile]);

    // 渲染霓虹闪烁文字
    const renderNeonText = () => {
        const text = `${config.recipientName} ${config.birthdayMessage}`;
        return (
            <div className="flex flex-wrap justify-center gap-1 px-4">
                {text.split('').map((char, index) => {
                    const color = textCharColors[index] || 'white';
                    return (
                        <span
                            key={index}
                            className="transition-all duration-300"
                            style={{
                                color: color,
                                textShadow: `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}`,
                                fontSize: isMobile ? `${2.5 + Math.random() * 1.5}rem` : `${4 + Math.random() * 3}rem`,
                            }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    );
                })}
            </div>
        );
    };

    // 渲染不同效果模式
    const renderEffect = () => {
        switch (config.effectMode) {
            case 'fireworks-text':
                return (
                    <>
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 z-10 w-full h-full"
                        />
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            {showMessage && renderNeonText()}
                        </div>
                    </>
                );

            case 'balloon-party':
                return (
                    <>
                        <style jsx>{`
                            @keyframes floatUp {
                                from { top: 100%; }
                                to { top: -55%; }
                            }
                            .balloon {
                                position: absolute;
                                border: 2px solid rgba(0,0,0,0.2);
                                border-radius: 50% 50% 50% 50% / 45% 45% 55% 55%;
                                opacity: 0.9;
                                animation: floatUp 6s ease-in-out infinite;
                                z-index: 1;
                                box-shadow: inset -10px -10px 30px rgba(255,255,255,0.3), 
                                            inset 10px 10px 30px rgba(0,0,0,0.1);
                            }
                            .balloon::before {
                                content: '';
                                position: absolute;
                                top: 100%;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 3px;
                                height: 50%;
                                background: linear-gradient(to bottom, currentColor 0%, transparent 100%);
                                opacity: 0.5;
                            }
                        `}</style>
                        <div className="absolute inset-0 z-10 overflow-hidden">
                            {balloons.map(balloon => (
                                <div
                                    key={balloon.id}
                                    className="balloon"
                                    style={{
                                        width: `${balloon.width}px`,
                                        height: `${balloon.width * 1.2}px`,
                                        left: balloon.left,
                                        animationDelay: `${balloon.delay * 0.12}s`,
                                        background: `linear-gradient(135deg, ${balloon.gradientStart}, ${balloon.gradientEnd})`,
                                        color: balloon.gradientEnd,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
                            {showMessage && (
                                <div className="text-center">
                                    <h1
                                        className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider mb-2 sm:mb-4"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: `2px 2px 4px rgba(0,0,0,0.3), 0 0 20px ${config.textColor}50`,
                                        }}
                                    >
                                        {config.recipientName}
                                    </h1>
                                    <h2
                                        className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: `2px 2px 4px rgba(0,0,0,0.3), 0 0 20px ${config.textColor}50`,
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
                                    <div className="mt-4 sm:mt-6 text-4xl sm:text-5xl md:text-6xl animate-bounce">
                                        🎂
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'spotlight':
                return (
                    <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
                        {showMessage && (
                            <h1
                                className="relative text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-center"
                                style={{ color: '#333' }}
                            >
                                {`${config.recipientName} ${config.birthdayMessage}`}
                                <span
                                    className="absolute inset-0"
                                    style={{
                                        color: 'transparent',
                                        backgroundImage: 'linear-gradient(to right, #ff69b4, #ff1493, #8b5cf6, #fbbf24, #ff6b9d, #ec4899, #a855f7, #f472b6)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        clipPath: `circle(${isMobile ? '60px' : '100px'} at ${spotlightPosition}% 50%)`,
                                    }}
                                >
                                    {`${config.recipientName} ${config.birthdayMessage}`}
                                </span>
                            </h1>
                        )}
                    </div>
                );

            case 'heart-blessing':
                return (
                    <>
                        <HeartCanvas color={config.textColor} isMobile={isMobile} />
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
                            {showMessage && (
                                <div
                                    className="text-center p-4 sm:p-6 rounded-2xl max-w-[90vw]"
                                    style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <h1
                                        className="text-2xl sm:text-3xl md:text-5xl font-light text-pink-200 tracking-wider mb-2 sm:mb-4"
                                    >
                                        💕 {config.recipientName} 💕
                                    </h1>
                                    <h2
                                        className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wider"
                                        style={{
                                            color: config.textColor,
                                            textShadow: `0 0 20px ${config.textColor}88, 0 0 40px ${config.textColor}44`,
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
                                    <div className="mt-4 text-3xl sm:text-4xl">
                                        🎂✨🎉
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden select-none touch-none"
            style={{
                background: config.effectMode === 'balloon-party' ? '#fffaf0' : '#000000',
            }}
        >
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 浪漫叠加层 */}
            <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    background: config.effectMode !== 'balloon-party'
                        ? `radial-gradient(ellipse 80% 50% at 50% 0%, ${config.textColor}10 0%, transparent 50%)`
                        : 'none',
                }}
            />

            {/* 3. 飘落爱心层 */}
            <FloatingHeartsLayer enabled={config.showFloatingHearts} color={config.textColor} />

            {/* 4. 星光层 */}
            <SparklesLayer enabled={config.showSparkles} />

            {/* 5. 效果层 */}
            {renderEffect()}

            {/* 6. 倒计时层 */}
            {config.enableCountdown && countdown > 0 && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 safe-area-inset">
                    <div className="text-center">
                        <div className="text-white/60 text-lg sm:text-xl mb-4 sm:mb-6 tracking-widest">
                            ✨ 惊喜即将揭晓 ✨
                        </div>
                        <div
                            className="text-7xl sm:text-8xl md:text-9xl font-bold"
                            style={{
                                color: config.textColor,
                                textShadow: `0 0 30px ${config.textColor}, 0 0 60px ${config.textColor}, 0 0 90px ${config.textColor}50`,
                                animation: 'pulse 1s ease-in-out infinite',
                            }}
                        >
                            {countdown}
                        </div>
                        <div className="mt-6 sm:mt-8 text-4xl sm:text-5xl animate-bounce">
                            🎁
                        </div>
                    </div>
                </div>
            )}

            {/* 7. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 8. 效果模式指示 */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/60 text-xs sm:text-sm">
                    {PRESETS.effectModes.find(m => m.value === config.effectMode)?.label || '🎈 气球派对'}
                </div>
            </div>

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes sparkle-twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .safe-area-inset {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }

                .touch-none {
                    touch-action: none;
                    -webkit-overflow-scrolling: auto;
                }
            `}</style>
        </div>
    );
}

/**
 * ==============================================================================
 * 爱心Canvas组件
 * ==============================================================================
 */

function HeartCanvas({ color, isMobile }: { color: string; isMobile: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            const size = isMobile ? 400 : 600;
            canvas.width = size;
            canvas.height = size;
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = isMobile ? '50vh' : '60vh';
        };
        resize();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(1, -1);
        ctx.fillStyle = color;

        let ws = 18;
        let hs = 16;
        let wsSpeed = 0.15;
        let hsSpeed = 0.15;
        const speed = 0.2;

        // 创建粒子数据 - 响应式数量
        const particles: Array<{ trans: number; rs: number; index: number }> = [];
        const layerConfigs = isMobile
            ? [[9, 2.5, 1.5, 300], [7, 5, 2, 200], [11, 2, 2.5, 400], [0, 2.7, 2, 300]]
            : [[9, 2.5, 2, 500], [7, 5, 2.5, 300], [11, 2, 3.5, 600], [0, 2.7, 2.5, 500]];

        for (let layer = 0; layer < 4; layer++) {
            const [transBase, transRange, rsMax, count] = layerConfigs[layer];

            for (let j = 0; j < count; j += speed) {
                particles.push({
                    trans: transBase + Math.random() * transRange,
                    rs: Math.random() * rsMax,
                    index: j,
                });
            }
        }

        const loop = () => {
            ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            ws += wsSpeed;
            if (ws < 16) wsSpeed *= -1;
            else if (ws > 18) wsSpeed *= -1;

            hs += hsSpeed;
            if (hs < 14) hsSpeed *= -1;
            else if (hs > 16) hsSpeed *= -1;

            particles.forEach(p => {
                const x = p.trans * ws * Math.pow(Math.sin(p.index), 3);
                const y = p.trans * (hs * Math.cos(p.index) - 5 * Math.cos(2 * p.index) - 2 * Math.cos(3 * p.index) - Math.cos(4 * p.index));
                ctx.beginPath();
                ctx.arc(x, y, p.rs, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            animationId = requestAnimationFrame(loop);
        };

        const intervalId = setInterval(loop, 100);

        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animationId);
        };
    }, [color, isMobile]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-10 flex items-center justify-center">
            <canvas ref={canvasRef} />
        </div>
    );
}

export default function BirthdayWishPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
