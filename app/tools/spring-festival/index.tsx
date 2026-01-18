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
 * 新春快乐 - 浪漫3D烟花粒子文字动画
 * 灵感来源：Shape Shifter + 3D Fireworks
 * ==============================================================================
 */

export interface AppConfig {
    titleText: string;
    recipientName: string;
    countdownSequence: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('spring-festival'),
    music: [
        { label: '新年喜庆音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '传统民乐', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '宁静钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '致最爱的你',
    recipientName: '亲爱的小曾',
    countdownSequence: ['3', '2', '1', '新', '春', '快', '乐', '❤'],
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#000000',
    }, 0),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 烟花爆炸音效
const AUDIO_SOURCES = {
    pow: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
    ],
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const PI = Math.PI;
const TWO_PI = PI * 2;

// 浪漫配色方案
const ROMANTIC_COLORS = [
    { r: 255, g: 100, b: 150 },   // 粉红
    { r: 255, g: 215, b: 0 },     // 金色
    { r: 255, g: 50, b: 50 },     // 红色
    { r: 255, g: 140, b: 0 },     // 橙色
    { r: 255, g: 182, b: 193 },   // 浅粉
    { r: 255, g: 255, b: 255 },   // 白色
    { r: 255, g: 105, b: 180 },   // 热粉
    { r: 255, g: 69, b: 0 },      // 橙红
];

/**
 * 音效管理器
 */
class SoundManager {
    private pools: HTMLAudioElement[] = [];
    private cursor = 0;
    private enabled = true;

    constructor() {
        if (typeof window === 'undefined') return;
        for (let i = 0; i < 8; i++) {
            const url = AUDIO_SOURCES.pow[i % AUDIO_SOURCES.pow.length];
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.3;
            this.pools.push(audio);
        }
    }

    play() {
        if (!this.enabled) return;
        const audio = this.pools[this.cursor];
        if (!audio) return;
        audio.volume = random(0.2, 0.4);
        audio.currentTime = 0;
        audio.play().catch(() => { });
        this.cursor = (this.cursor + 1) % this.pools.length;
    }

    setEnabled(enable: boolean) {
        this.enabled = enable;
    }
}

/**
 * 粒子类 - 烟花爆炸后的粒子
 */
class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: { r: number; g: number; b: number };
    decay: number;
    gravity: number;
    size: number;
    trail: { x: number; y: number; alpha: number }[];
    sparkle: number;

    constructor(x: number, y: number, color: { r: number; g: number; b: number }) {
        this.x = x;
        this.y = y;
        const angle = random(0, TWO_PI);
        const speed = random(2, 12);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = {
            r: color.r + random(-20, 20),
            g: color.g + random(-20, 20),
            b: color.b + random(-20, 20),
        };
        this.alpha = 1;
        this.decay = random(0.008, 0.018);
        this.gravity = 0.08;
        this.size = random(2, 4);
        this.trail = [];
        this.sparkle = Math.random();
    }

    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 8) this.trail.shift();

        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.sparkle = Math.random();
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;

        // 绘制轨迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const trailAlpha = (i / this.trail.length) * this.alpha * 0.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * (i / this.trail.length), 0, TWO_PI);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailAlpha})`;
            ctx.fill();
        }

        // 绘制粒子主体
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, TWO_PI);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fill();

        // 添加闪烁效果
        if (this.sparkle > 0.9) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, TWO_PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
            ctx.fill();
        }
    }
}

/**
 * 烟花弹 - 上升阶段
 */
class Firework {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    color: { r: number; g: number; b: number };
    trail: { x: number; y: number; alpha: number }[];
    exploded: boolean;

    constructor(startX: number, startY: number, targetY: number) {
        this.x = startX;
        this.y = startY;
        this.targetY = targetY;
        this.vx = random(-2, 2);
        this.vy = random(-15, -12);
        this.color = ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))];
        this.trail = [];
        this.exploded = false;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 15) this.trail.shift();

        this.x += this.vx;
        this.vy += 0.15; // 重力
        this.y += this.vy;

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // 绘制烟花弹轨迹
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const progress = i / this.trail.length;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2 * progress, 0, TWO_PI);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${progress * 0.8})`;
            ctx.fill();
        }

        // 绘制烟花弹头
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fill();

        // 光晕效果
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, TWO_PI);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

/**
 * Shape Shifter 粒子文字引擎 - 优化版
 */
interface TextParticle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    originX: number;
    originY: number;
    size: number;
    alpha: number;
    color: { r: number; g: number; b: number };
    speed: number;
    inPosition: boolean;
    wobble: number;
    wobbleSpeed: number;
}

class ShapeShifter {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: TextParticle[] = [];
    private shapeCanvas: HTMLCanvasElement;
    private shapeCtx: CanvasRenderingContext2D;
    private gap = 6;
    private animationId: number | null = null;
    private currentLetter = '';
    private isTransitioning = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.shapeCanvas = document.createElement('canvas');
        this.shapeCtx = this.shapeCanvas.getContext('2d')!;
        this.adjustCanvas();
        this.initParticles();
    }

    private adjustCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);

        this.shapeCanvas.width = Math.floor(window.innerWidth / this.gap) * this.gap;
        this.shapeCanvas.height = Math.floor(window.innerHeight / this.gap) * this.gap;
        this.shapeCtx.fillStyle = 'white';
        this.shapeCtx.textBaseline = 'middle';
        this.shapeCtx.textAlign = 'center';
    }

    private initParticles() {
        // 初始化大量漂浮粒子
        const count = 300;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: random(0, window.innerWidth),
                y: random(0, window.innerHeight),
                targetX: random(0, window.innerWidth),
                targetY: random(0, window.innerHeight),
                originX: random(0, window.innerWidth),
                originY: random(0, window.innerHeight),
                size: random(1, 3),
                alpha: random(0.1, 0.5),
                color: ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))],
                speed: random(0.02, 0.08),
                inPosition: false,
                wobble: random(0, TWO_PI),
                wobbleSpeed: random(0.02, 0.05),
            });
        }
    }

    private getLetterPoints(letter: string): { x: number; y: number }[] {
        const fontSize = Math.min(window.innerWidth * 0.4, 400);
        this.shapeCtx.font = `bold ${fontSize}px "Noto Serif SC", "Microsoft YaHei", serif`;

        this.shapeCtx.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
        this.shapeCtx.fillText(letter, this.shapeCanvas.width / 2, this.shapeCanvas.height / 2);

        const imageData = this.shapeCtx.getImageData(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
        const pixels = imageData.data;
        const points: { x: number; y: number }[] = [];

        for (let y = 0; y < this.shapeCanvas.height; y += this.gap) {
            for (let x = 0; x < this.shapeCanvas.width; x += this.gap) {
                const index = (y * this.shapeCanvas.width + x) * 4;
                if (pixels[index + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }

        return points;
    }

    switchShape(letter: string) {
        if (this.isTransitioning && this.currentLetter === letter) return;

        this.currentLetter = letter;
        this.isTransitioning = true;

        const points = this.getLetterPoints(letter);

        // 确保有足够的粒子
        while (this.particles.length < points.length) {
            this.particles.push({
                x: random(0, window.innerWidth),
                y: random(0, window.innerHeight),
                targetX: window.innerWidth / 2,
                targetY: window.innerHeight / 2,
                originX: random(0, window.innerWidth),
                originY: random(0, window.innerHeight),
                size: random(2, 4),
                alpha: random(0.3, 0.8),
                color: ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))],
                speed: random(0.03, 0.1),
                inPosition: false,
                wobble: random(0, TWO_PI),
                wobbleSpeed: random(0.02, 0.05),
            });
        }

        // 随机分配目标点
        const shuffledPoints = [...points].sort(() => Math.random() - 0.5);

        this.particles.forEach((particle, i) => {
            if (i < shuffledPoints.length) {
                particle.targetX = shuffledPoints[i].x;
                particle.targetY = shuffledPoints[i].y;
                particle.inPosition = false;
                particle.speed = random(0.04, 0.12);
                particle.color = ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))];
                particle.size = random(3, 5);
                particle.alpha = random(0.6, 1);
            } else {
                // 多余的粒子飘散
                particle.targetX = random(-100, window.innerWidth + 100);
                particle.targetY = random(-100, window.innerHeight + 100);
                particle.inPosition = false;
                particle.speed = random(0.02, 0.05);
                particle.alpha = random(0.1, 0.3);
                particle.size = random(1, 2);
            }
        });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 2000);
    }

    render() {
        const ctx = this.ctx;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        this.particles.forEach(particle => {
            // 移动向目标
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                particle.x += dx * particle.speed;
                particle.y += dy * particle.speed;
            } else {
                particle.inPosition = true;
            }

            // 添加轻微摆动
            particle.wobble += particle.wobbleSpeed;
            const wobbleX = Math.sin(particle.wobble) * 2;
            const wobbleY = Math.cos(particle.wobble * 0.7) * 2;

            // 绘制粒子
            ctx.beginPath();
            ctx.arc(
                particle.x + (particle.inPosition ? wobbleX : 0),
                particle.y + (particle.inPosition ? wobbleY : 0),
                particle.size,
                0, TWO_PI
            );
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
            ctx.fill();

            // 发光效果
            if (particle.alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(
                    particle.x + (particle.inPosition ? wobbleX : 0),
                    particle.y + (particle.inPosition ? wobbleY : 0),
                    particle.size * 2,
                    0, TWO_PI
                );
                ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha * 0.2})`;
                ctx.fill();
            }
        });
    }

    start() {
        const loop = () => {
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resize() {
        this.adjustCanvas();
    }
}

/**
 * 烟花引擎
 */
class FireworkEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private fireworks: Firework[] = [];
    private particles: Particle[] = [];
    private soundManager: SoundManager;
    private animationId: number | null = null;
    private spawnTimer = 0;
    private intensity = 1;

    constructor(canvas: HTMLCanvasElement, soundManager: SoundManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.soundManager = soundManager;
        this.resize();
    }

    setIntensity(value: number) {
        this.intensity = value;
    }

    private spawnFirework() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        const startX = random(w * 0.1, w * 0.9);
        const targetY = random(h * 0.1, h * 0.4);

        this.fireworks.push(new Firework(startX, h, targetY));
    }

    private explode(firework: Firework) {
        const particleCount = Math.floor(random(80, 150));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(firework.x, firework.y, firework.color));
        }

        this.soundManager.play();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
    }

    start() {
        const loop = () => {
            const w = this.canvas.width / (window.devicePixelRatio || 1);
            const h = this.canvas.height / (window.devicePixelRatio || 1);

            // 使用 destination-out 实现透明拖尾效果，让背景显示
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, w, h);

            // 恢复正常绘制模式
            this.ctx.globalCompositeOperation = 'lighter';

            // 发射烟花
            this.spawnTimer++;
            if (this.spawnTimer > 60 / this.intensity) {
                if (Math.random() < 0.7 * this.intensity) {
                    this.spawnFirework();
                    if (Math.random() > 0.6) {
                        setTimeout(() => this.spawnFirework(), 100);
                    }
                }
                this.spawnTimer = 0;
            }

            // 更新和绘制烟花弹
            for (let i = this.fireworks.length - 1; i >= 0; i--) {
                const fw = this.fireworks[i];
                fw.update();
                fw.draw(this.ctx);
                if (fw.exploded) {
                    this.explode(fw);
                    this.fireworks.splice(i, 1);
                }
            }

            // 更新和绘制粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.update();
                p.draw(this.ctx);
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // 限制粒子数量
            if (this.particles.length > 1500) {
                this.particles.splice(0, this.particles.length - 1500);
            }

            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

/**
 * 主组件
 */
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const fireworkCanvasRef = useRef<HTMLCanvasElement>(null);
    const textCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    const fireworkEngineRef = useRef<FireworkEngine | null>(null);
    const shapeShifterRef = useRef<ShapeShifter | null>(null);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showWelcome, setShowWelcome] = useState(true);
    const [animationStarted, setAnimationStarted] = useState(false);

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

    // 初始化引擎
    useEffect(() => {
        soundManagerRef.current = new SoundManager();
        soundManagerRef.current.setEnabled(!isMuted);

        if (fireworkCanvasRef.current) {
            fireworkEngineRef.current = new FireworkEngine(
                fireworkCanvasRef.current,
                soundManagerRef.current
            );
            fireworkEngineRef.current.start();
        }

        if (textCanvasRef.current) {
            shapeShifterRef.current = new ShapeShifter(textCanvasRef.current);
            shapeShifterRef.current.start();
        }

        const handleResize = () => {
            fireworkEngineRef.current?.resize();
            shapeShifterRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            fireworkEngineRef.current?.stop();
            shapeShifterRef.current?.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        soundManagerRef.current?.setEnabled(!isMuted);
    }, [isMuted]);

    // 开始动画序列
    const startSequence = useCallback(() => {
        setShowWelcome(false);
        setAnimationStarted(true);
        setCurrentIndex(0);
        // 提高烟花强度
        fireworkEngineRef.current?.setIntensity(2);
    }, []);

    // 文字切换动画
    useEffect(() => {
        if (currentIndex < 0) return;

        const sequence = config.countdownSequence;
        if (currentIndex >= sequence.length) return;

        shapeShifterRef.current?.switchShape(sequence[currentIndex]);

        const timer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 2500);

        return () => clearTimeout(timer);
    }, [currentIndex, config.countdownSequence]);

    // 动画结束后循环
    useEffect(() => {
        if (currentIndex >= config.countdownSequence.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(0);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, config.countdownSequence.length]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 烟花 Canvas */}
            <canvas
                ref={fireworkCanvasRef}
                className="absolute inset-0 z-10 w-full h-full"
                style={{ background: 'transparent' }}
            />

            {/* 3. 文字粒子 Canvas */}
            <canvas
                ref={textCanvasRef}
                className="absolute inset-0 z-20 w-full h-full pointer-events-none"
                style={{ background: 'transparent' }}
            />

            {/* 4. 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
                    <div className="relative text-center px-4 transition-all duration-1000">
                        <div className="mb-8">
                            <span className="text-6xl md:text-8xl animate-pulse">🎆</span>
                        </div>
                        {config.recipientName && (
                            <div className="text-white/90 text-2xl md:text-4xl mb-4 font-serif tracking-widest 
                            animate-pulse drop-shadow-[0_2px_20px_rgba(255,215,0,0.6)]">
                                {config.recipientName}
                            </div>
                        )}
                        <h1 className="text-white/70 text-lg md:text-2xl mb-12 tracking-[0.4em] font-light">
                            {config.titleText}
                        </h1>
                        <button
                            onClick={startSequence}
                            className="relative px-10 py-5 text-white rounded-full text-xl font-bold 
                         overflow-hidden group transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee0979 50%, #ff6a00 100%)',
                                boxShadow: '0 0 40px rgba(255,100,100,0.5), 0 0 80px rgba(255,100,100,0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="text-2xl">✨</span>
                                点击开启新年祝福
                                <span className="text-2xl">✨</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </div>
                </div>
            )}

            {/* 5. 音效控制面板 */}
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
export const springFestivalConfigMetadata = {
    panelTitle: '新春快乐 配置',
    panelSubtitle: 'Spring Festival Celebration',
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
            label: '祝福标题',
            placeholder: '致最爱的你'
        },
        countdownSequence: {
            category: 'content' as const,
            type: 'list' as const,
            label: '动画文字序列',
            placeholder: '每行一个字符',
            description: '粒子动画将依次展示这些文字'
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '推荐使用深色背景以展示烟花效果'
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
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName', 'titleText'] },
        { id: 2, label: '动画文字', icon: null, fields: ['countdownSequence'] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue', 'bgMusicUrl', 'enableSound'] },
    ],
};

export default function SpringFestivalPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
