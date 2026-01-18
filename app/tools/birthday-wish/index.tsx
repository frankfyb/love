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
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
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
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 渐变色气球颜色配置
const BALLOON_GRADIENTS = [
    ['#E85D04', '#FFBA08'],
    ['#ff3da4', '#FB5607'],
    ['#f15156', '#3A86FF'],
    ['#FFBE0B', '#f15156'],
    ['#FF006E', '#00a1de'],
    ['#DC2F02', '#ff3da4'],
    ['#8338EC', '#00a1de'],
    ['#d177ff', '#FF006E'],
    ['#3A86FF', '#FFBE0B'],
    ['#FB5607', '#FF006E'],
];

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('birthday-wish'),
    music: [
        { label: '🎂 生日快乐歌', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🎉 欢快派对', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '💕 温馨祝福', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    effectModes: [
        { label: '🎆 烟花文字', value: 'fireworks-text' },
        { label: '🎈 气球派对', value: 'balloon-party' },
        { label: '🔦 聚光舞台', value: 'spotlight' },
        { label: '💗 爱心祝福', value: 'heart-blessing' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '亲爱的',
    birthdayMessage: '生日快乐',
    effectMode: 'balloon-party',
    textColor: '#ff69b4',
    balloonColors: BALLOON_GRADIENTS.flat(),
    enableCountdown: true,
    countdownSeconds: 5,
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
    panelSubtitle: 'Birthday Wish Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '寿星姓名', placeholder: '例如：亲爱的宝贝' },
        birthdayMessage: { category: 'content' as const, type: 'input' as const, label: '祝福语', placeholder: '生日快乐' },

        effectMode: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '效果模式',
            options: PRESETS.effectModes
        },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        enableCountdown: { category: 'visual' as const, type: 'switch' as const, label: '启用倒计时' },
        countdownSeconds: { category: 'visual' as const, type: 'slider' as const, label: '倒计时秒数', min: 3, max: 10, step: 1 },

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
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '寿星定制', icon: null, fields: ['recipientName' as const, 'birthdayMessage' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['effectMode' as const, 'textColor' as const, 'enableCountdown' as const, 'countdownSeconds' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

/**
 * ==============================================================================
 * 2. 粒子与动画类 (Particle & Animation Classes)
 * ==============================================================================
 */

// 烟花粒子类
class FireworkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    age: number;
    maxAge: number;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (0.5 - Math.random()) * 100;
        this.vy = (0.5 - Math.random()) * 100;
        this.age = Math.random() * 100 | 0;
        this.maxAge = this.age;
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
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive(): boolean {
        return this.age > 0;
    }
}

// 烟花发射器类
class Firework {
    x: number;
    y: number;
    targetY: number;
    vel: number;
    color: string;
    exploded: boolean;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetY = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.3;
        this.vel = -(Math.random() * Math.sqrt(canvasHeight) / 3 + Math.sqrt(4 * canvasHeight) / 2) / 5;
        this.color = `hsl(${Math.random() * 360 | 0}, 100%, 60%)`;
        this.exploded = false;
    }

    update(): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        this.y += this.vel;
        this.vel += 0.04;

        if (this.vel >= 0 && !this.exploded) {
            this.exploded = true;
            for (let i = 0; i < 200; i++) {
                particles.push(new FireworkParticle(this.x, this.y, this.color));
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

// 气球类
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
 * 3. 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [countdown, setCountdown] = useState(config.enableCountdown ? config.countdownSeconds : 0);
    const [showMessage, setShowMessage] = useState(!config.enableCountdown);
    const [spotlightPosition, setSpotlightPosition] = useState(0);
    const [textCharColors, setTextCharColors] = useState<string[]>([]);

    // 使用可复用的音效 Hook
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

    // 生成气球数据
    const balloons = useMemo((): Balloon[] => {
        const result: Balloon[] = [];
        for (let i = 0; i < 50; i++) {
            const gradient = BALLOON_GRADIENTS[i % BALLOON_GRADIENTS.length];
            result.push({
                id: i,
                width: 100 + Math.random() * 90,
                delay: Math.random() * 100,
                left: `${Math.random() * 100}%`,
                gradientStart: gradient[0],
                gradientEnd: gradient[1],
            });
        }
        return result;
    }, []);

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

        // 初始化烟花
        const initFireworks = () => {
            const count = Math.max(3, Math.floor(canvas.width / 200));
            for (let i = 0; i < count; i++) {
                fireworks.push(new Firework(canvas.width, canvas.height));
            }
        };
        initFireworks();

        const loop = () => {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 更新和绘制烟花
            for (let i = fireworks.length - 1; i >= 0; i--) {
                const newParticles = fireworks[i].update();
                particles.push(...newParticles);
                fireworks[i].draw(ctx);

                if (!fireworks[i].isAlive()) {
                    fireworks.splice(i, 1);
                    // 补充新烟花
                    fireworks.push(new Firework(canvas.width, canvas.height));
                }
            }

            // 更新和绘制粒子
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
    }, [config.effectMode]);

    // 渲染霓虹闪烁文字
    const renderNeonText = () => {
        const text = `${config.recipientName} ${config.birthdayMessage}`;
        return (
            <div className="flex flex-wrap justify-center gap-1">
                {text.split('').map((char, index) => {
                    const color = textCharColors[index] || 'white';
                    const hue = Math.random() * 360;
                    return (
                        <span
                            key={index}
                            className="transition-all duration-300"
                            style={{
                                color: color,
                                textShadow: `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}`,
                                fontSize: `${4 + Math.random() * 3}rem`,
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
                border: 2px solid rgba(0,0,0,0.3);
                border-radius: 50% 50% 50% 50% / 45% 45% 55% 55%;
                opacity: 0.85;
                animation: floatUp 5s ease-in-out infinite;
                z-index: 1;
              }
              .balloon::before {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 40%;
                background: inherit;
                border-radius: 20px;
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
                                        animationDelay: `${balloon.delay * 0.15}s`,
                                        background: `linear-gradient(45deg, ${balloon.gradientStart}, ${balloon.gradientEnd})`,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            {showMessage && (
                                <div className="text-center">
                                    <h1
                                        className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {config.recipientName}
                                    </h1>
                                    <h2
                                        className="text-3xl md:text-5xl lg:text-7xl font-bold mt-4"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'spotlight':
                return (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        {showMessage && (
                            <h1
                                className="relative text-4xl md:text-6xl lg:text-8xl font-bold"
                                style={{ color: '#333' }}
                            >
                                {`${config.recipientName} ${config.birthdayMessage}`}
                                <span
                                    className="absolute inset-0"
                                    style={{
                                        color: 'transparent',
                                        backgroundImage: 'linear-gradient(to right, #c23616, #192a56, #00d2d3, yellow, #6d214f, #2e86de, #4cd137, #e84118)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        clipPath: `circle(100px at ${spotlightPosition}% 50%)`,
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
                        <HeartCanvas color={config.textColor} />
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            {showMessage && (
                                <div
                                    className="text-center p-6 rounded-lg"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <h1
                                        className="text-3xl md:text-5xl font-light text-pink-200 tracking-wider mb-4"
                                    >
                                        {config.recipientName}
                                    </h1>
                                    <h2
                                        className="text-4xl md:text-6xl font-bold tracking-wider"
                                        style={{
                                            color: config.textColor,
                                            textShadow: `0 0 20px ${config.textColor}88`,
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
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
            className="fixed inset-0 w-full h-full overflow-hidden select-none"
            style={{
                background: config.effectMode === 'balloon-party' ? '#ffffff' : '#000000',
            }}
        >
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 效果层 */}
            {renderEffect()}

            {/* 3. 倒计时层 */}
            {config.enableCountdown && countdown > 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div
                        className="text-9xl font-bold animate-pulse"
                        style={{
                            color: config.textColor,
                            textShadow: `0 0 30px ${config.textColor}, 0 0 60px ${config.textColor}`,
                        }}
                    >
                        {countdown}
                    </div>
                </div>
            )}

            {/* 4. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 5. 效果模式指示 */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs">
                    {PRESETS.effectModes.find(m => m.value === config.effectMode)?.label || '气球派对'}
                </div>
            </div>
        </div>
    );
}

/**
 * ==============================================================================
 * 4. 爱心Canvas组件
 * ==============================================================================
 */

function HeartCanvas({ color }: { color: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = 600;
            canvas.height = 600;
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '60vh';
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

        // 创建粒子数据
        const particles: Array<{ trans: number; rs: number; index: number }> = [];
        for (let layer = 0; layer < 4; layer++) {
            const transBase = [9, 7, 11, 0][layer];
            const transRange = [2.5, 5, 2, 2.7][layer];
            const rsMax = [2, 2.5, 3.5, 2.5][layer];
            const count = [500, 300, 600, 500][layer];

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
    }, [color]);

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
