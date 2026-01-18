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
 * 孔明灯与烟花 - 浪漫祈愿之夜
 * 灵感来源：孔明灯漂浮 + 炫彩烟花 + 星空背景
 * ==============================================================================
 */

// 类型定义
export interface WishItem {
    sender: string;
    wish: string;
}

export interface AppConfig {
    titleText: string;
    recipientName: string;
    wishes: WishItem[];
    fireworkDensity: number;
    lanternCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 预设配置
export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('lantern-fireworks'),
    music: [
        { label: '新年祝福音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '传统民乐', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '宁静钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

// 默认祝愿列表
const DEFAULT_WISHES: WishItem[] = [
    { sender: '小明', wish: '愿新的一年，心想事成，万事如意！' },
    { sender: '小红', wish: '希望家人平安健康，幸福美满~' },
    { sender: '阿杰', wish: '事业顺利，财源滚滚！' },
    { sender: '小美', wish: '愿所有的美好都如约而至 ✨' },
    { sender: '大伟', wish: '新年快乐！希望能找到真爱 ❤️' },
    { sender: '小琳', wish: '学业进步，考试顺利！加油！' },
    { sender: '老王', wish: '身体健康，一切顺心如意！' },
    { sender: '小李', wish: '2025发大财！暴富暴瘦！' },
];

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '愿望孔明灯',
    recipientName: '亲爱的你',
    wishes: DEFAULT_WISHES,
    fireworkDensity: 6,
    lanternCount: 12,
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#0a0a1a',
    }, 0),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 烟花颜色
const FIREWORK_COLORS = [
    '#BDC9E5', '#F5D488', '#F5B488', '#DCBBA3', '#BE88DC',
    '#FFE2A0', '#C9FFA0', '#A0ECFF', '#A0C0FF', '#FFA0A0',
    '#FF7EB3', '#FF758C', '#FF7A8A', '#E8518D', '#F44369'
];

// 音效
const AUDIO_SOURCES = {
    burst: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
    ],
};

// 工具函数
const random = (a: number | any[], b?: number): any => {
    if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
    if (b === undefined) return Math.random() * a;
    return Math.random() * (b - a) + a;
};

/**
 * 音效管理器
 */
class SoundManager {
    private pools: HTMLAudioElement[] = [];
    private cursor = 0;
    private enabled = true;

    constructor() {
        if (typeof window === 'undefined') return;
        for (let i = 0; i < 6; i++) {
            const url = AUDIO_SOURCES.burst[i % AUDIO_SOURCES.burst.length];
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.25;
            this.pools.push(audio);
        }
    }

    play() {
        if (!this.enabled) return;
        const audio = this.pools[this.cursor];
        if (!audio) return;
        audio.volume = random(0.15, 0.35);
        audio.currentTime = 0;
        audio.play().catch(() => { });
        this.cursor = (this.cursor + 1) % this.pools.length;
    }

    setEnabled(enable: boolean) {
        this.enabled = enable;
    }
}

/**
 * 颜色工具 (简化版 tinycolor)
 */
const tinycolor = (color: string) => {
    return {
        setAlpha: (alpha: number) => {
            if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            return color;
        }
    };
};

/**
 * 烟花粒子
 */
class FireworkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    shadowColor: string;
    gravity = 0.08;
    power = 0.93;
    shrink = 0.97;
    jitter = 1;

    constructor(x: number, y: number, color: string, speed: number = 15, size: number = 15) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.shadowColor = tinycolor(color).setAlpha(0.1);
        this.size = random(-size / 2, size / 2) + size;

        const angle = random(0, Math.PI * 2);
        const vel = Math.cos(random(0, Math.PI / 2)) * speed;
        this.vx = Math.cos(angle) * vel;
        this.vy = Math.sin(angle) * vel;
    }

    update() {
        this.vx *= this.power;
        this.vy *= this.power;
        this.vy += this.gravity;

        const jitter = random(-1, 1) * this.jitter;
        this.x += this.vx + jitter;
        this.y += this.vy + jitter;
        this.size *= this.shrink;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.size < 1) return;
        ctx.save();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size / 2);
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.6, this.color);
        gradient.addColorStop(1, this.shadowColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.size < 1;
    }
}

/**
 * 单个烟花
 */
class Firework {
    particles: FireworkParticle[] = [];
    isDead = false;

    constructor(x: number, y: number, color: string, particleCount: number = 80) {
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new FireworkParticle(x, y, color));
        }
    }

    update() {
        this.particles = this.particles.filter(p => !p.isDead());
        this.particles.forEach(p => p.update());
        if (this.particles.length === 0) this.isDead = true;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

/**
 * 烟花引擎
 */
class FireworksEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private offScreenCanvas: HTMLCanvasElement;
    private offScreenCtx: CanvasRenderingContext2D;
    private fireworks: Firework[] = [];
    private soundManager: SoundManager;
    private animationId: number | null = null;
    private density = 6;
    private interval = 500;
    private timer: NodeJS.Timeout | null = null;

    constructor(canvas: HTMLCanvasElement, soundManager: SoundManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.offScreenCanvas = document.createElement('canvas');
        this.offScreenCtx = this.offScreenCanvas.getContext('2d')!;
        this.soundManager = soundManager;
        this.resize();
    }

    setDensity(value: number) {
        this.density = value;
        this.interval = 3000 / value;
    }

    resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.offScreenCanvas.width = rect.width;
            this.offScreenCanvas.height = rect.height;
        }
    }

    createFirework(x?: number, y?: number) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const finalX = x !== undefined ? x : random(w * 0.1, w * 0.9);
        const finalY = y !== undefined ? y : random(h * 0.1, h * 0.5);
        const color = random(FIREWORK_COLORS) as string;
        const particleCount = Math.floor(random(60, 100));

        this.fireworks.push(new Firework(finalX, finalY, color, particleCount));
        this.soundManager.play();
    }

    private loop() {
        const interval = this.interval * random(0.5, 1.5);
        this.timer = setTimeout(() => {
            this.fireworks = this.fireworks.filter(f => !f.isDead);
            if (this.fireworks.length < this.density) {
                this.createFirework();
            }
            this.loop();
        }, interval);
    }

    private render() {
        const { width, height } = this.canvas;

        // 使用 destination-out 实现透明拖尾效果，让背景显示
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, width, height);

        // 恢复正常绘制模式
        this.ctx.globalCompositeOperation = 'source-over';

        this.offScreenCtx.clearRect(0, 0, width, height);

        this.fireworks.forEach(f => {
            f.update();
            f.draw(this.offScreenCtx);
        });

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.drawImage(this.offScreenCanvas, 0, 0);
        this.ctx.restore();

        this.animationId = requestAnimationFrame(() => this.render());
    }

    start() {
        this.loop();
        this.render();
    }

    stop() {
        if (this.timer) clearTimeout(this.timer);
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

/**
 * 孔明灯 - 更真实的物理效果
 */
interface Lantern {
    x: number;
    y: number;
    scale: number;
    baseSpeed: number;        // 基础上升速度
    phase: number;            // 摆动相位
    swayAmplitude: number;    // 摆动幅度
    swaySpeed: number;        // 摆动速度
    rotationPhase: number;    // 旋转相位
    wish: WishItem;
    glowPhase: number;
    birthTime: number;        // 出生时间，用于计算加速
}

/**
 * 星星
 */
interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkleSpeed: number;
    phase: number;
}

/**
 * 主显示组件
 */
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fireworkCanvasRef = useRef<HTMLCanvasElement>(null);
    const lanternCanvasRef = useRef<HTMLCanvasElement>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    const fireworksEngineRef = useRef<FireworksEngine | null>(null);

    const [lanterns, setLanterns] = useState<Lantern[]>([]);
    const [stars, setStars] = useState<Star[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [activeWish, setActiveWish] = useState<WishItem | null>(null);
    const [showWish, setShowWish] = useState(false);

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

    // 初始化星空
    useEffect(() => {
        const newStars: Star[] = [];
        for (let i = 0; i < 200; i++) {
            newStars.push({
                x: random(0, 100),
                y: random(0, 100),
                size: random(1, 4),
                opacity: random(0.2, 0.8),
                twinkleSpeed: random(0.02, 0.08),
                phase: random(0, Math.PI * 2),
            });
        }
        setStars(newStars);
    }, []);

    // 初始化烟花引擎
    useEffect(() => {
        soundManagerRef.current = new SoundManager();
        soundManagerRef.current.setEnabled(!isMuted);

        if (fireworkCanvasRef.current) {
            fireworksEngineRef.current = new FireworksEngine(
                fireworkCanvasRef.current,
                soundManagerRef.current
            );
            fireworksEngineRef.current.setDensity(config.fireworkDensity);
            fireworksEngineRef.current.start();
        }

        const handleResize = () => {
            fireworksEngineRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            fireworksEngineRef.current?.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        soundManagerRef.current?.setEnabled(!isMuted);
    }, [isMuted]);

    useEffect(() => {
        fireworksEngineRef.current?.setDensity(config.fireworkDensity);
    }, [config.fireworkDensity]);

    // 初始化孔明灯
    const initLanterns = useCallback(() => {
        const wishes = config.wishes.length > 0 ? config.wishes : DEFAULT_WISHES;
        const count = Math.min(config.lanternCount, wishes.length);

        for (let i = 0; i < count; i++) {
            const delay = i * random(300, 600);
            setTimeout(() => {
                const lantern: Lantern = {
                    x: random(15, 85),
                    y: 105 + random(0, 10),
                    scale: random(0.8, 1.1),
                    baseSpeed: random(0.12, 0.22),
                    phase: random(0, Math.PI * 2),
                    swayAmplitude: random(0.3, 0.8),
                    swaySpeed: random(0.015, 0.025),
                    rotationPhase: random(0, Math.PI * 2),
                    wish: wishes[i % wishes.length],
                    glowPhase: random(0, Math.PI * 2),
                    birthTime: Date.now(),
                };
                setLanterns(prev => [...prev, lantern]);
            }, delay);
        }
    }, [config.wishes, config.lanternCount]);

    // 更新孔明灯位置 - 更真实的物理效果
    useEffect(() => {
        if (lanterns.length === 0) return;

        const interval = setInterval(() => {
            const now = Date.now();

            setLanterns(prev => prev.map(lantern => {
                let { x, y, scale, baseSpeed, phase, swayAmplitude, swaySpeed, rotationPhase, glowPhase, birthTime } = lantern;

                // 计算飞行时间（秒）
                const flightTime = (now - birthTime) / 1000;

                // 上升速度：初始较慢，然后加速，最后稳定
                const speedMultiplier = Math.min(1, flightTime / 3); // 前3秒加速
                const currentSpeed = baseSpeed * (0.5 + speedMultiplier * 0.5);

                // 上升
                y -= currentSpeed;

                // 正弦波摆动（模拟风的影响）
                phase += swaySpeed;
                const sway = Math.sin(phase) * swayAmplitude;
                x += sway * 0.1;

                // 轻微的水平飘移（模拟微风）
                x += Math.sin(phase * 0.3) * 0.02;

                // 旋转/摇晃相位
                rotationPhase += 0.02;

                // 发光相位
                glowPhase += 0.03;

                // 透视缩放：随着上升逐渐缩小
                if (y < 80) {
                    const distanceFactor = (80 - y) / 80;
                    scale = lantern.scale * (1 - distanceFactor * 0.4);
                    scale = Math.max(0.3, scale);
                }

                // 重置飞出屏幕的孔明灯
                if (y < -15 || x < 5 || x > 95) {
                    return {
                        ...lantern,
                        x: random(15, 85),
                        y: 105 + random(0, 10),
                        scale: random(0.8, 1.1),
                        baseSpeed: random(0.12, 0.22),
                        phase: random(0, Math.PI * 2),
                        birthTime: Date.now(),
                    };
                }

                return { ...lantern, x, y, scale, phase, rotationPhase, glowPhase };
            }));
        }, 16);

        return () => clearInterval(interval);
    }, [lanterns.length]);

    // 星星闪烁动画
    useEffect(() => {
        const interval = setInterval(() => {
            setStars(prev => prev.map(star => ({
                ...star,
                phase: star.phase + star.twinkleSpeed,
            })));
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
        initLanterns();
    }, [initLanterns]);

    // 点击孔明灯显示愿望
    const handleLanternClick = useCallback((wish: WishItem) => {
        setActiveWish(wish);
        setShowWish(true);
        setTimeout(() => setShowWish(false), 3000);
    }, []);

    // 点击画布创建烟花
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        fireworksEngineRef.current?.createFirework(x, y);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                {/* 深色覆盖层使星星更明显 */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e]/80 via-[#0a0a1a]/60 to-[#0a0a1a]/90" />
            </div>

            {/* 2. 星空层 */}
            <div className="absolute inset-0 z-5 pointer-events-none">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            opacity: 0.2 + Math.sin(star.phase) * 0.4 * star.opacity,
                            boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(255,255,255,0.3)`,
                            transform: `scale(${0.5 + Math.sin(star.phase) * 0.5})`,
                        }}
                    />
                ))}
            </div>

            {/* 3. 烟花 Canvas */}
            <canvas
                ref={fireworkCanvasRef}
                className="absolute inset-0 z-10 w-full h-full cursor-crosshair"
                onClick={handleCanvasClick}
            />

            {/* 4. 孔明灯层 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {lanterns.map((lantern, i) => {
                    // 计算自然的摇摆角度
                    const swayAngle = Math.sin(lantern.rotationPhase) * 3;

                    return (
                        <div
                            key={i}
                            className="absolute cursor-pointer pointer-events-auto"
                            style={{
                                left: `${lantern.x}%`,
                                top: `${lantern.y}%`,
                                transform: `translate(-50%, -50%) scale(${lantern.scale}) rotate(${swayAngle}deg)`,
                                transition: 'transform 0.1s ease-out',
                            }}
                            onClick={() => handleLanternClick(lantern.wish)}
                        >
                            {/* 孔明灯SVG */}
                            <svg width="60" height="70" viewBox="0 0 62 70" className="drop-shadow-lg">
                                <defs>
                                    <radialGradient id={`lanternGrad${i}`} cx="50%" cy="90%" r="90%">
                                        <stop offset="0%" stopColor="#fcffdd">
                                            <animate
                                                attributeName="stop-color"
                                                values="#fcffdd;#ffffd0;#fcffdd"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            />
                                        </stop>
                                        <stop offset="12%" stopColor="#fffeb8" />
                                        <stop offset="24%" stopColor="#fcf954">
                                            <animate
                                                attributeName="stop-color"
                                                values="#fd9e2e;#fcf954;#fd9e2e"
                                                dur="0.3s"
                                                repeatCount="indefinite"
                                            />
                                        </stop>
                                        <stop offset="58%" stopColor="#ff510f">
                                            <animate
                                                attributeName="stop-color"
                                                values="#BF3A0B;#ff510f;#BF3A0B"
                                                dur="2.6s"
                                                repeatCount="indefinite"
                                            />
                                        </stop>
                                        <stop offset="90%" stopColor="#501004">
                                            <animate
                                                attributeName="stop-color"
                                                values="#BF3A0B;#501004;#BF3A0B"
                                                dur="2.6s"
                                                repeatCount="indefinite"
                                            />
                                        </stop>
                                        <stop offset="100%" stopColor="#290e09" />
                                    </radialGradient>
                                </defs>
                                {/* 灯体 */}
                                <path
                                    fill={`url(#lanternGrad${i})`}
                                    d="M47.7,61.6c0,2.6-6.3,5.6-14.7,5.6s-14.7-2.9-14.7-5.6c0-2.6,6.3-5.6,14.7-5.6S47.7,58.9,47.7,61.6z
                   M26.4,0C19.2,0-1.5,15.1,0.1,21.4C1.6,27.7,15.4,62,15.4,62s0.1,0.1,0.2,0.3c-0.1-0.3-0.1-0.5-0.1-0.8
                   c0-4.7,7.5-8.3,17.4-8.3c9.9,0,17.4,3.6,17.4,8.3c0,0.1,0,0.2,0,0.2c2-3.6,10.9-33.1,11.9-42.7C63.3,9.3,34.2,0,26.4,0z"
                                />
                                {/* 发光效果 */}
                                <ellipse
                                    cx="31"
                                    cy="35"
                                    rx="25"
                                    ry="30"
                                    fill="none"
                                    stroke={`rgba(255,200,100,${0.2 + Math.sin(lantern.glowPhase) * 0.2})`}
                                    strokeWidth="2"
                                    style={{ filter: 'blur(4px)' }}
                                />
                            </svg>
                        </div>
                    );
                })}
            </div>

            {/* 5. 愿望显示 */}
            {activeWish && (
                <div
                    className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-500 ${showWish ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div className="text-center max-w-lg px-8 py-6 backdrop-blur-sm bg-black/30 rounded-2xl border border-white/10">
                        <p
                            className="text-2xl md:text-3xl font-serif mb-4"
                            style={{
                                background: 'linear-gradient(to right, #f3ec78, #e77b9a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {activeWish.wish}
                        </p>
                        <p className="text-white/70 text-lg">—— {activeWish.sender}</p>
                    </div>
                </div>
            )}

            {/* 6. 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
                    <div className="relative text-center px-4">
                        <div className="mb-6">
                            <span className="text-5xl md:text-7xl">🏮</span>
                        </div>
                        {config.recipientName && (
                            <div
                                className="text-3xl md:text-5xl mb-4 font-serif tracking-widest"
                                style={{
                                    background: 'linear-gradient(to right, #f3ec78, #e77b9a)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 30px rgba(243,236,120,0.5)',
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
                            className="relative px-8 py-4 text-white rounded-full text-lg font-medium overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee0979 50%, #ff6a00 100%)',
                                boxShadow: '0 0 30px rgba(255,100,100,0.4), 0 0 60px rgba(255,100,100,0.2)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span>✨</span>
                                点击放飞孔明灯
                                <span>✨</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                        <p className="mt-6 text-white/50 text-sm">点击屏幕可放烟花 🎆</p>
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
        </div>
    );
}

// 配置面板元数据
export const lanternFireworksConfigMetadata = {
    panelTitle: '孔明灯与烟花配置',
    panelSubtitle: 'Lanterns & Fireworks',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁',
            placeholder: '例如：亲爱的小曾'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '标题',
            placeholder: '愿望孔明灯'
        },
        lanternCount: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '孔明灯数量',
            min: 4,
            max: 20,
            step: 1
        },
        fireworkDensity: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '烟花密度',
            min: 2,
            max: 12,
            step: 1
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '推荐使用深色背景'
        },
        enableSound: {
            category: 'background' as const,
            type: 'switch' as const,
            label: '启用音效'
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
    },
    tabs: [
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName', 'titleText'] },
        { id: 2, label: '视觉效果', icon: null, fields: ['lanternCount', 'fireworkDensity'] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue', 'bgMusicUrl', 'enableSound'] },
    ],
};

export default function LanternFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
