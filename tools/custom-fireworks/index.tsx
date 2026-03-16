'use client';

/**
 * 定制烟花 - 浪漫终极版 (Ultimate Edition)
 * 融合了 romantic-fireworks + brilliant-fireworks + city-fireworks + spring-festival 的所有最佳实践
 * 
 * 特点:
 *   - 送给谁 + 专属定制标语
 *   - 9种烟花类型 + 大小可调
 *   - 丝滑螺旋上升效果（参考 romantic-fireworks）
 *   - 浪漫飘落爱心 + 璀璨星光 (from brilliant-fireworks)
 *   - 星空背景 + 浪漫月亮 (from city-fireworks)
 *   - 粒子动画文字效果 (from spring-festival)
 *   - 天空照明效果
 *   - 点击屏幕发射烟花
 *   - 终极模式批量发射
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/ui/AudioControlPanel';
import { BackgroundRenderer } from '@/components/ui/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { random } from '@/lib/utils/random';

// 导入配置
import {
    AppConfig,
    ShellType,
    DEFAULT_CONFIG,
    PRESETS,
    configMetadata,
    customFireworksCardConfigMetadata,
} from './config';

// 重新导出配置
export type { AppConfig, ShellType };
export { DEFAULT_CONFIG, PRESETS, configMetadata, customFireworksCardConfigMetadata };

// ============================================================================
// 常量和颜色定义
// ============================================================================

const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI * 0.5;
const GRAVITY = 0.9;
const INVISIBLE = '_INVISIBLE_';

const COLOR: Record<string, string> = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffbf36',
    White: '#ffffff',
    Pink: '#ff69b4',
    Cyan: '#00ffff',
};

const COLOR_CODES = Object.values(COLOR);
const COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE];

// 颜色元组用于天空照明
const COLOR_TUPLES: Record<string, { r: number; g: number; b: number }> = {};
COLOR_CODES.forEach(hex => {
    COLOR_TUPLES[hex] = {
        r: parseInt(hex.substr(1, 2), 16),
        g: parseInt(hex.substr(3, 2), 16),
        b: parseInt(hex.substr(5, 2), 16),
    };
});

// ============================================================================
// 粒子类型定义
// ============================================================================

interface StarInstance {
    visible: boolean;
    heavy: boolean;
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    speedX: number;
    speedY: number;
    life: number;
    fullLife: number;
    spinAngle: number;
    spinSpeed: number;
    spinRadius: number;
    sparkFreq: number;
    sparkSpeed: number;
    sparkTimer: number;
    sparkColor: string;
    sparkLife: number;
    sparkLifeVariation: number;
    strobe: boolean;
    strobeFreq: number;
    secondColor: string | null;
    transitionTime: number;
    colorChanged: boolean;
    onDeath: ((star: StarInstance) => void) | null;
    updateFrame: number;
}

interface SparkInstance {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    speedX: number;
    speedY: number;
    life: number;
}

interface BurstFlashInstance {
    x: number;
    y: number;
    radius: number;
}

interface ShellOptions {
    shellSize: number;
    spreadSize: number;
    starLife: number;
    starLifeVariation?: number;
    starDensity?: number;
    starCount?: number;
    color: string | string[];
    secondColor?: string | null;
    glitter?: string;
    glitterColor?: string;
    pistil?: boolean;
    pistilColor?: string;
    streamers?: boolean;
    ring?: boolean;
    crackle?: boolean;
    strobe?: boolean;
    strobeColor?: string | null;
}

// ============================================================================
// 颜色工具函数
// ============================================================================

function randomColor(options?: { notColor?: string; limitWhite?: boolean }) {
    let color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
    if (options?.limitWhite && color === COLOR.White && Math.random() < 0.6) {
        color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
    }
    if (options?.notColor) {
        while (color === options.notColor) {
            color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
        }
    }
    return color;
}

function whiteOrGold() {
    return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}

function makePistilColor(shellColor: string) {
    return (shellColor === COLOR.White || shellColor === COLOR.Gold)
        ? randomColor({ notColor: shellColor })
        : whiteOrGold();
}

// ============================================================================
// 烟花类型生成
// ============================================================================

function getShellOptions(type: ShellType, size: number): ShellOptions {
    switch (type) {
        case 'Crysanthemum': {
            const glitter = Math.random() < 0.25;
            const singleColor = Math.random() < 0.72;
            const color = singleColor ? randomColor({ limitWhite: true }) : [randomColor(), randomColor()];
            const pistil = singleColor && Math.random() < 0.42;
            const pistilColor = pistil ? makePistilColor(color as string) : undefined;
            return {
                shellSize: size,
                spreadSize: 300 + size * 100,
                starLife: 900 + size * 200,
                starDensity: glitter ? 1.1 : 1.25,
                color,
                glitter: glitter ? 'light' : '',
                glitterColor: whiteOrGold(),
                pistil,
                pistilColor,
            };
        }
        case 'Ring': {
            const color = randomColor();
            return {
                shellSize: size,
                ring: true,
                color,
                spreadSize: 300 + size * 100,
                starLife: 900 + size * 200,
                starCount: 2.2 * PI_2 * (size + 1),
                pistil: Math.random() < 0.75,
                pistilColor: makePistilColor(color),
            };
        }
        case 'Palm': {
            const thick = Math.random() < 0.5;
            return {
                shellSize: size,
                color: randomColor(),
                spreadSize: 250 + size * 75,
                starDensity: thick ? 0.15 : 0.4,
                starLife: 1800 + size * 200,
                glitter: thick ? 'thick' : 'heavy',
            };
        }
        case 'Willow':
            return {
                shellSize: size,
                spreadSize: 300 + size * 100,
                starDensity: 0.6,
                starLife: 3000 + size * 300,
                glitter: 'willow',
                glitterColor: COLOR.Gold,
                color: INVISIBLE,
            };
        case 'Crackle': {
            const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
            return {
                shellSize: size,
                spreadSize: 380 + size * 75,
                starDensity: 1,
                starLife: 600 + size * 100,
                starLifeVariation: 0.32,
                glitter: 'light',
                glitterColor: COLOR.Gold,
                color,
                crackle: true,
                pistil: Math.random() < 0.65,
                pistilColor: makePistilColor(color),
            };
        }
        case 'Strobe': {
            const color = randomColor({ limitWhite: true });
            return {
                shellSize: size,
                spreadSize: 280 + size * 92,
                starLife: 1100 + size * 200,
                starLifeVariation: 0.40,
                starDensity: 1.1,
                color,
                glitter: 'light',
                glitterColor: COLOR.White,
                strobe: true,
                strobeColor: Math.random() < 0.5 ? COLOR.White : null,
            };
        }
        case 'Crossette':
            return {
                shellSize: size,
                spreadSize: 300 + size * 100,
                starLife: 750 + size * 160,
                starDensity: 0.65,
                color: randomColor({ limitWhite: true }),
                glitter: 'light',
                glitterColor: whiteOrGold(),
            };
        case 'Horsetail':
            return {
                shellSize: size,
                spreadSize: 250 + size * 38,
                starDensity: 0.9,
                starLife: 2500 + size * 300,
                glitter: 'medium',
                glitterColor: COLOR.Gold,
                color: randomColor(),
            };
        case 'Random':
        default: {
            const types: ShellType[] = ['Crysanthemum', 'Ring', 'Palm', 'Crackle', 'Strobe', 'Willow'];
            return getShellOptions(types[Math.floor(Math.random() * types.length)], size);
        }
    }
}

// ============================================================================
// 粒子集合工厂
// ============================================================================

function createParticleCollection(): Record<string, StarInstance[]> {
    const collection: Record<string, StarInstance[]> = {};
    COLOR_CODES_W_INVIS.forEach(color => { collection[color] = []; });
    return collection;
}

function createSparkCollection(): Record<string, SparkInstance[]> {
    const collection: Record<string, SparkInstance[]> = {};
    COLOR_CODES_W_INVIS.forEach(color => { collection[color] = []; });
    return collection;
}

// ============================================================================
// 文字粒子类型 (from spring-festival)
// ============================================================================

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

// 粒子动画文字用的浪漫颜色
const ROMANTIC_COLORS = [
    { r: 255, g: 100, b: 150 },
    { r: 255, g: 215, b: 0 },
    { r: 255, g: 50, b: 50 },
    { r: 255, g: 140, b: 0 },
    { r: 255, g: 182, b: 193 },
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 105, b: 180 },
    { r: 255, g: 69, b: 0 },
];

// ============================================================================
// ShapeShifter 粒子文字引擎 (from spring-festival)
// ============================================================================

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
                wobble: random(0, PI_2),
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
                wobble: random(0, PI_2),
                wobbleSpeed: random(0.02, 0.05),
            });
        }

        const shuffledPoints = [...points].sort(() => Math.random() - 0.5);

        this.particles.forEach((particle, i) => {
            if (i < shuffledPoints.length) {
                particle.targetX = shuffledPoints[i].x;
                particle.targetY = shuffledPoints[i].y;
                particle.inPosition = false;
                particle.speed = random(0.08, 0.18); // 增加速度，更快形成文字
                particle.color = ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))];
                particle.size = random(3, 5);
                particle.alpha = random(0.6, 1);
            } else {
                particle.targetX = random(-100, window.innerWidth + 100);
                particle.targetY = random(-100, window.innerHeight + 100);
                particle.inPosition = false;
                particle.speed = random(0.03, 0.08); // 多余粒子也稍快移开
                particle.alpha = random(0.1, 0.3);
                particle.size = random(1, 2);
            }
        });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 1500); // 减少过渡时间
    }

    render() {
        const ctx = this.ctx;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        this.particles.forEach(particle => {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                particle.x += dx * particle.speed;
                particle.y += dy * particle.speed;
            } else {
                particle.inPosition = true;
            }

            particle.wobble += particle.wobbleSpeed;
            const wobbleX = Math.sin(particle.wobble) * 2;
            const wobbleY = Math.cos(particle.wobble * 0.7) * 2;

            ctx.beginPath();
            ctx.arc(
                particle.x + (particle.inPosition ? wobbleX : 0),
                particle.y + (particle.inPosition ? wobbleY : 0),
                particle.size,
                0, PI_2
            );
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
            ctx.fill();

            if (particle.alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(
                    particle.x + (particle.inPosition ? wobbleX : 0),
                    particle.y + (particle.inPosition ? wobbleY : 0),
                    particle.size * 2,
                    0, PI_2
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

// ============================================================================
// 浪漫装饰组件：飘落爱心
// ============================================================================

interface FloatingHeartsProps {
    enabled: boolean;
}

function FloatingHearts({ enabled }: FloatingHeartsProps) {
    const [hearts, setHearts] = useState<Array<{
        id: number;
        x: number;
        delay: number;
        duration: number;
        size: number;
        opacity: number;
    }>>([]);

    useEffect(() => {
        if (!enabled) {
            setHearts([]);
            return;
        }

        const newHearts = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 8,
            duration: 8 + Math.random() * 6,
            size: 12 + Math.random() * 16,
            opacity: 0.3 + Math.random() * 0.5,
        }));
        setHearts(newHearts);
    }, [enabled]);

    if (!enabled || hearts.length === 0) return null;

    return (
        <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-fall-heart"
                    style={{
                        left: `${heart.x}%`,
                        fontSize: `${heart.size}px`,
                        opacity: heart.opacity,
                        animationDelay: `${heart.delay}s`,
                        animationDuration: `${heart.duration}s`,
                        filter: 'drop-shadow(0 0 6px rgba(255, 105, 180, 0.8))',
                    }}
                >
                    💕
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// 浪漫装饰组件：璀璨星光
// ============================================================================

interface SparklesProps {
    enabled: boolean;
}

function Sparkles({ enabled }: SparklesProps) {
    const [sparkles, setSparkles] = useState<Array<{
        id: number;
        x: number;
        y: number;
        size: number;
        delay: number;
        duration: number;
    }>>([]);

    useEffect(() => {
        if (!enabled) {
            setSparkles([]);
            return;
        }

        const newSparkles = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            delay: Math.random() * 4,
            duration: 1.5 + Math.random() * 2,
        }));
        setSparkles(newSparkles);
    }, [enabled]);

    if (!enabled || sparkles.length === 0) return null;

    return (
        <div className="absolute inset-0 z-5 pointer-events-none">
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="absolute rounded-full animate-sparkle"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                        background: 'radial-gradient(circle, #ffffff 0%, rgba(255, 215, 0, 0.8) 50%, transparent 100%)',
                        boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.6)',
                        animationDelay: `${sparkle.delay}s`,
                        animationDuration: `${sparkle.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ============================================================================
// 浪漫场景组件：星空背景 (from city-fireworks)
// ============================================================================

interface StarFieldProps {
    enabled: boolean;
    count: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

interface BackgroundStar {
    x: number;
    y: number;
    r: number;
    twinkleSpeed: number;
    twinklePhase: number;
}

function StarField({ enabled, count, containerRef }: StarFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<BackgroundStar[]>([]);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            if (!container) return;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // 初始化星星
            starsRef.current = [];
            for (let i = 0; i < count; i++) {
                const r = Math.random() * 1.5 + 0.5;
                starsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.7, // 只在上方70%区域
                    r,
                    twinkleSpeed: 0.02 + Math.random() * 0.03,
                    twinklePhase: Math.random() * Math.PI * 2,
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        let time = 0;
        const loop = () => {
            time += 0.016; // ~60fps
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制星星带闪烁效果
            starsRef.current.forEach(star => {
                const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase);
                const alpha = twinkle * star.r * 0.6;

                ctx.save();
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();

                // 添加光晕效果
                if (star.r > 1) {
                    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
                    gradient.addColorStop(0, `rgba(255, 255, 240, ${alpha * 0.5})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 240, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(star.x - star.r * 3, star.y - star.r * 3, star.r * 6, star.r * 6);
                }
                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [enabled, count, containerRef]);

    if (!enabled) return null;

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-3 pointer-events-none" />;
}

// ============================================================================
// 浪漫场景组件：月亮 (from city-fireworks)
// ============================================================================

interface MoonProps {
    enabled: boolean;
    onClick?: () => void;
}

function Moon({ enabled, onClick }: MoonProps) {
    if (!enabled) return null;

    return (
        <div className="absolute inset-0 z-4 pointer-events-none">
            <svg className="w-full h-full">
                <defs>
                    <radialGradient id="moonGradient">
                        <stop offset="0%" stopColor="rgba(255, 255, 240, 1)" />
                        <stop offset="50%" stopColor="rgba(255, 245, 200, 0.95)" />
                        <stop offset="100%" stopColor="rgba(255, 235, 150, 0.85)" />
                    </radialGradient>
                    <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* 月亮光晕 */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <circle
                        key={`halo-${i}`}
                        cx="calc(100% - 120px)"
                        cy="100"
                        r={50 + i * 8}
                        fill={`rgba(255, 245, 200, ${0.015 - i * 0.001})`}
                    />
                ))}
                {/* 月亮本体 - 可点击区域 */}
                <circle
                    cx="calc(100% - 120px)"
                    cy="100"
                    r="45"
                    fill="url(#moonGradient)"
                    filter="url(#moonGlow)"
                    className="pointer-events-auto cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(255,245,200,0.8)]"
                    onClick={onClick}
                />
                {/* 月亮表面细节 */}
                <circle cx="calc(100% - 135px)" cy="90" r="8" fill="rgba(200, 190, 150, 0.15)" className="pointer-events-none" />
                <circle cx="calc(100% - 105px)" cy="105" r="12" fill="rgba(200, 190, 150, 0.1)" className="pointer-events-none" />
                <circle cx="calc(100% - 120px)" cy="118" r="6" fill="rgba(200, 190, 150, 0.12)" className="pointer-events-none" />
            </svg>
            {/* 点击提示 */}
            {onClick && (
                <div className="absolute top-[145px] right-[75px] text-[10px] text-yellow-200/60 pointer-events-none animate-pulse">
                    点击月亮 ✨
                </div>
            )}
        </div>
    );
}

// ============================================================================
// 主显示组件
// ============================================================================

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 粒子集合 refs
    const starsRef = useRef<Record<string, StarInstance[]>>(createParticleCollection());
    const sparksRef = useRef<Record<string, SparkInstance[]>>(createSparkCollection());
    const burstFlashesRef = useRef<BurstFlashInstance[]>([]);
    const starPoolRef = useRef<StarInstance[]>([]);
    const sparkPoolRef = useRef<SparkInstance[]>([]);

    // 动画状态
    const autoLaunchTimeRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const currentFrameRef = useRef<number>(0);
    const finaleCountRef = useRef<number>(0);

    // 天空照明状态
    const currentSkyColorRef = useRef({ r: 0, g: 0, b: 0 });
    const targetSkyColorRef = useRef({ r: 0, g: 0, b: 0 });

    // 粒子动画文字相关状态 (from spring-festival)
    const textCanvasRef = useRef<HTMLCanvasElement>(null);
    const shapeShifterRef = useRef<ShapeShifter | null>(null);
    const [currentTextIndex, setCurrentTextIndex] = useState(-1);
    const [showWelcome, setShowWelcome] = useState(true);
    const [animationStarted, setAnimationStarted] = useState(false);

    // 音频控制
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

    // 背景配置
    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 初始化 ShapeShifter 引擎 (from spring-festival)
    useEffect(() => {
        // 延迟初始化确保 canvas 已挂载
        const initTimer = setTimeout(() => {
            if (textCanvasRef.current && !shapeShifterRef.current) {
                shapeShifterRef.current = new ShapeShifter(textCanvasRef.current);
                shapeShifterRef.current.start();
            }
        }, 100);

        const handleResize = () => {
            shapeShifterRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(initTimer);
            shapeShifterRef.current?.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 粒子动画文字切换动画 - 只在点击月亮后播放
    useEffect(() => {
        if (currentTextIndex < 0) return; // 负数表示未开始播放

        const sequence = config.countdownSequence;
        if (!sequence || sequence.length === 0) return;
        if (currentTextIndex >= sequence.length) {
            // 播放完成，停止并重置为未开始状态
            setCurrentTextIndex(-1);
            return;
        }

        // 确保 ShapeShifter 已初始化
        if (!shapeShifterRef.current && textCanvasRef.current) {
            shapeShifterRef.current = new ShapeShifter(textCanvasRef.current);
            shapeShifterRef.current.start();
        }

        shapeShifterRef.current?.switchShape(sequence[currentTextIndex]);

        const timer = setTimeout(() => {
            setCurrentTextIndex(prev => prev + 1);
        }, 4500); // 4.5秒让粒子有足够时间形成文字

        return () => clearTimeout(timer);
    }, [currentTextIndex, config.countdownSequence]);




    // Star 工厂函数（丝滑效果核心）
    const addStar = useCallback((
        x: number, y: number, color: string, angle: number, speed: number, life: number,
        speedOffX = 0, speedOffY = 0
    ): StarInstance => {
        const instance: StarInstance = starPoolRef.current.pop() || {
            visible: true,
            heavy: false,
            x: 0, y: 0, prevX: 0, prevY: 0,
            color: '',
            speedX: 0, speedY: 0,
            life: 0, fullLife: 0,
            spinAngle: 0, spinSpeed: 0.8, spinRadius: 0,
            sparkFreq: 0, sparkSpeed: 1, sparkTimer: 0,
            sparkColor: '', sparkLife: 750, sparkLifeVariation: 0.25,
            strobe: false, strobeFreq: 0,
            secondColor: null, transitionTime: 0, colorChanged: false,
            onDeath: null, updateFrame: 0
        };

        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + speedOffX;
        instance.speedY = Math.cos(angle) * speed + speedOffY;
        instance.life = life;
        instance.fullLife = life;
        instance.spinAngle = Math.random() * PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;
        instance.strobeFreq = 0;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        instance.onDeath = null;
        instance.updateFrame = 0;

        starsRef.current[color].push(instance);
        return instance;
    }, []);

    // Spark 工厂函数
    const addSpark = useCallback((
        x: number, y: number, color: string, angle: number, speed: number, life: number
    ) => {
        const instance: SparkInstance = sparkPoolRef.current.pop() || {
            x: 0, y: 0, prevX: 0, prevY: 0, color: '', speedX: 0, speedY: 0, life: 0
        };

        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;

        sparksRef.current[color].push(instance);
        return instance;
    }, []);

    // 添加爆炸闪光
    const addBurstFlash = useCallback((x: number, y: number, radius: number) => {
        burstFlashesRef.current.push({ x, y, radius });
    }, []);

    // 返回实例到池
    const returnStar = useCallback((instance: StarInstance) => {
        instance.onDeath?.(instance);
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        starPoolRef.current.push(instance);
    }, []);

    const returnSpark = useCallback((instance: SparkInstance) => {
        sparkPoolRef.current.push(instance);
    }, []);

    // 创建粒子弧线
    const createParticleArc = useCallback((
        start: number, arcLength: number, count: number, randomness: number,
        particleFactory: (angle: number) => void
    ) => {
        const angleDelta = arcLength / count;
        const end = start + arcLength - (angleDelta * 0.5);

        if (end > start) {
            for (let angle = start; angle < end; angle += angleDelta) {
                particleFactory(angle + Math.random() * angleDelta * randomness);
            }
        }
    }, []);

    // 创建球形爆发
    const createBurst = useCallback((
        count: number,
        x: number, y: number,
        particleFactory: (angle: number, speedMult: number) => void,
        startAngle = 0,
        arcLength = PI_2
    ) => {
        const R = 0.5 * Math.sqrt(count / Math.PI);
        const C = 2 * R * Math.PI;
        const C_HALF = C / 2;

        for (let i = 0; i <= C_HALF; i++) {
            const ringAngle = i / C_HALF * PI_HALF;
            const ringSize = Math.cos(ringAngle);
            const partsPerFullRing = C * ringSize;
            const partsPerArc = partsPerFullRing * (arcLength / PI_2);

            const angleInc = PI_2 / partsPerFullRing;
            const angleOffset = Math.random() * angleInc + startAngle;
            const maxRandomAngleOffset = angleInc * 0.33;

            for (let j = 0; j < partsPerArc; j++) {
                const randomAngleOffset = Math.random() * maxRandomAngleOffset;
                const angle = angleInc * j + angleOffset + randomAngleOffset;
                particleFactory(angle, ringSize);
            }
        }
    }, []);

    // 爆裂效果
    const crackleEffect = useCallback((star: StarInstance) => {
        const count = 16;
        createParticleArc(0, PI_2, count, 1.8, (angle) => {
            addSpark(
                star.x, star.y,
                COLOR.Gold,
                angle,
                Math.pow(Math.random(), 0.45) * 2.4,
                300 + Math.random() * 200
            );
        });
    }, [createParticleArc, addSpark]);

    // 烟花爆炸
    const burstShell = useCallback((x: number, y: number, options: ShellOptions) => {
        const speed = options.spreadSize / 96;

        let sparkFreq = 0, sparkSpeed = 0, sparkLife = 0, sparkLifeVariation = 0.25;

        if (options.glitter === 'light') {
            sparkFreq = 400; sparkSpeed = 0.3; sparkLife = 300; sparkLifeVariation = 2;
        } else if (options.glitter === 'medium') {
            sparkFreq = 200; sparkSpeed = 0.44; sparkLife = 700; sparkLifeVariation = 2;
        } else if (options.glitter === 'heavy') {
            sparkFreq = 80; sparkSpeed = 0.8; sparkLife = 1400; sparkLifeVariation = 2;
        } else if (options.glitter === 'thick') {
            sparkFreq = 16; sparkSpeed = 1.5; sparkLife = 1400; sparkLifeVariation = 3;
        } else if (options.glitter === 'willow') {
            sparkFreq = 120; sparkSpeed = 0.34; sparkLife = 1400; sparkLifeVariation = 3.8;
        }

        const starFactory = (angle: number, speedMult: number) => {
            const standardInitialSpeed = options.spreadSize / 1800;
            const color = typeof options.color === 'string'
                ? (options.color === 'random' ? COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)] : options.color)
                : (Math.random() < 0.5 ? options.color[0] : options.color[1]);

            const star = addStar(
                x, y,
                color,
                angle,
                speedMult * speed,
                options.starLife + Math.random() * options.starLife * (options.starLifeVariation || 0.125),
                0,
                -standardInitialSpeed
            );

            if (options.secondColor) {
                star.transitionTime = options.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = options.secondColor;
            }

            if (options.strobe) {
                star.transitionTime = options.starLife * (Math.random() * 0.08 + 0.46);
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
                if (options.strobeColor) {
                    star.secondColor = options.strobeColor;
                }
            }

            if (options.crackle) {
                star.onDeath = crackleEffect;
            }

            if (options.glitter) {
                star.sparkFreq = sparkFreq;
                star.sparkSpeed = sparkSpeed;
                star.sparkLife = sparkLife;
                star.sparkLifeVariation = sparkLifeVariation;
                star.sparkColor = options.glitterColor || color;
                star.sparkTimer = Math.random() * star.sparkFreq;
            }
        };

        // 计算星星数量
        let starCount = options.starCount;
        if (!starCount) {
            const density = options.starDensity || 1;
            const scaledSize = options.spreadSize / 54;
            starCount = Math.max(6, scaledSize * scaledSize * density);
        }

        // 创建爆发
        if (options.ring) {
            const ringStartAngle = Math.random() * Math.PI;
            const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

            createParticleArc(0, PI_2, starCount, 0, angle => {
                const color = typeof options.color === 'string' ? options.color : options.color[0];
                const initSpeedX = Math.sin(angle) * speed * ringSquash;
                const initSpeedY = Math.cos(angle) * speed;
                const newSpeed = Math.sqrt(initSpeedX * initSpeedX + initSpeedY * initSpeedY);
                const newAngle = Math.atan2(initSpeedX, initSpeedY) + ringStartAngle;

                const star = addStar(
                    x, y, color, newAngle, newSpeed,
                    options.starLife + Math.random() * options.starLife * (options.starLifeVariation || 0.125)
                );

                if (options.glitter) {
                    star.sparkFreq = sparkFreq;
                    star.sparkSpeed = sparkSpeed;
                    star.sparkLife = sparkLife;
                    star.sparkLifeVariation = sparkLifeVariation;
                    star.sparkColor = options.glitterColor || color;
                    star.sparkTimer = Math.random() * star.sparkFreq;
                }
            });
        } else {
            createBurst(starCount, x, y, starFactory);
        }

        // 添加爆炸闪光
        addBurstFlash(x, y, options.spreadSize / 4);
    }, [addStar, addBurstFlash, crackleEffect, createBurst, createParticleArc]);

    // 发射烟花（丝滑上升效果核心）
    const launchShell = useCallback((targetX?: number, targetY?: number) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;

        const w = canvas.width;
        const h = canvas.height;

        const launchX = targetX ?? random(w * 0.2, w * 0.8);
        const launchY = h;
        const burstY = targetY ?? random(h * 0.1, h * 0.4);

        const options = getShellOptions(config.shellType, config.shellSize);

        // 创建彗星 - 丝滑上升效果
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        const comet = addStar(
            launchX, launchY,
            typeof options.color === 'string' && options.color !== INVISIBLE
                ? options.color
                : COLOR.White,
            Math.PI,
            launchVelocity * 1.0,
            launchVelocity * 400
        );

        comet.heavy = true;
        // 螺旋旋转效果 - 使上升更丝滑
        comet.spinRadius = random(0.32, 0.85);
        comet.sparkFreq = 32;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;

        if (options.glitter === 'willow') {
            comet.sparkFreq = 20;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }

        if (options.color === INVISIBLE) {
            comet.sparkColor = COLOR.Gold;
        }

        // 随机让彗星提前"燃尽"
        if (Math.random() > 0.4) {
            comet.secondColor = INVISIBLE;
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
        }

        comet.onDeath = () => {
            burstShell(comet.x, comet.y, options);
        };
    }, [config.shellType, config.shellSize, addStar, burstShell]);

    // 点击发射
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (showWelcome) return;
        const canvas = mainCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        launchShell(x, y);
    }, [showWelcome, launchShell]);

    // 主渲染循环（丝滑效果核心）
    useEffect(() => {
        if (showWelcome) return;

        const canvas = mainCanvasRef.current;
        const trailsCanvas = trailsCanvasRef.current;
        if (!canvas || !trailsCanvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        const trailsCtx = trailsCanvas.getContext('2d');
        if (!ctx || !trailsCtx) return;

        let rafId: number;
        const skyLightingLevel = config.skyLighting ? 1 : 0;

        const resize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            canvas.width = w;
            canvas.height = h;
            trailsCanvas.width = w;
            trailsCanvas.height = h;
        };

        resize();
        window.addEventListener('resize', resize);

        // 天空照明计算
        const colorSky = (speed: number) => {
            const maxSkySaturation = skyLightingLevel * 15;
            const maxStarCount = 500;
            let totalStarCount = 0;

            targetSkyColorRef.current.r = 0;
            targetSkyColorRef.current.g = 0;
            targetSkyColorRef.current.b = 0;

            COLOR_CODES.forEach(color => {
                const tuple = COLOR_TUPLES[color];
                const count = starsRef.current[color].length;
                totalStarCount += count;
                targetSkyColorRef.current.r += tuple.r * count;
                targetSkyColorRef.current.g += tuple.g * count;
                targetSkyColorRef.current.b += tuple.b * count;
            });

            const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
            const maxColorComponent = Math.max(1,
                targetSkyColorRef.current.r,
                targetSkyColorRef.current.g,
                targetSkyColorRef.current.b
            );

            targetSkyColorRef.current.r = targetSkyColorRef.current.r / maxColorComponent * maxSkySaturation * intensity;
            targetSkyColorRef.current.g = targetSkyColorRef.current.g / maxColorComponent * maxSkySaturation * intensity;
            targetSkyColorRef.current.b = targetSkyColorRef.current.b / maxColorComponent * maxSkySaturation * intensity;

            const colorChange = 10;
            currentSkyColorRef.current.r += (targetSkyColorRef.current.r - currentSkyColorRef.current.r) / colorChange * speed;
            currentSkyColorRef.current.g += (targetSkyColorRef.current.g - currentSkyColorRef.current.g) / colorChange * speed;
            currentSkyColorRef.current.b += (targetSkyColorRef.current.b - currentSkyColorRef.current.b) / colorChange * speed;

            return `rgb(${currentSkyColorRef.current.r | 0}, ${currentSkyColorRef.current.g | 0}, ${currentSkyColorRef.current.b | 0})`;
        };

        const loop = (timestamp: number) => {
            const frameTime = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;
            const timeStep = Math.min(frameTime, 32);
            const speed = timeStep / 16;

            currentFrameRef.current++;

            const width = canvas.width;
            const height = canvas.height;

            // 自动发射
            if (config.autoLaunch) {
                autoLaunchTimeRef.current -= timeStep;
                if (autoLaunchTimeRef.current <= 0) {
                    launchShell();
                    if (config.finaleMode) {
                        finaleCountRef.current++;
                        if (finaleCountRef.current < 32) {
                            autoLaunchTimeRef.current = 170;
                        } else {
                            finaleCountRef.current = 0;
                            autoLaunchTimeRef.current = random(4000, 6000);
                        }
                    } else {
                        autoLaunchTimeRef.current = random(800, 2000);
                    }
                }
            }

            // 物理参数
            const starDrag = 1 - (1 - 0.98) * speed;
            const starDragHeavy = 1 - (1 - 0.992) * speed;
            const sparkDrag = 1 - (1 - 0.9) * speed;
            const gAcc = timeStep / 1000 * GRAVITY;

            // 更新粒子
            COLOR_CODES_W_INVIS.forEach(color => {
                // 更新星星
                const stars = starsRef.current[color];
                for (let i = stars.length - 1; i >= 0; i--) {
                    const star = stars[i];

                    if (star.updateFrame === currentFrameRef.current) continue;
                    star.updateFrame = currentFrameRef.current;

                    star.life -= timeStep;

                    if (star.life <= 0) {
                        stars.splice(i, 1);
                        returnStar(star);
                    } else {
                        const burnRate = Math.pow(star.life / star.fullLife, 0.5);
                        const burnRateInverse = 1 - burnRate;

                        star.prevX = star.x;
                        star.prevY = star.y;
                        star.x += star.speedX * speed;
                        star.y += star.speedY * speed;

                        if (!star.heavy) {
                            star.speedX *= starDrag;
                            star.speedY *= starDrag;
                        } else {
                            star.speedX *= starDragHeavy;
                            star.speedY *= starDragHeavy;
                        }
                        star.speedY += gAcc;

                        // 螺旋旋转效果（丝滑上升轨迹）
                        if (star.spinRadius) {
                            star.spinAngle += star.spinSpeed * speed;
                            star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                            star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                        }

                        // 生成火花
                        if (star.sparkFreq) {
                            star.sparkTimer -= timeStep;
                            while (star.sparkTimer < 0) {
                                star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                                addSpark(
                                    star.x, star.y,
                                    star.sparkColor,
                                    Math.random() * PI_2,
                                    Math.random() * star.sparkSpeed * burnRate,
                                    star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife
                                );
                            }
                        }

                        // 颜色过渡
                        if (star.life < star.transitionTime) {
                            if (star.secondColor && !star.colorChanged) {
                                star.colorChanged = true;
                                star.color = star.secondColor;
                                stars.splice(i, 1);
                                starsRef.current[star.secondColor].push(star);
                                if (star.secondColor === INVISIBLE) {
                                    star.sparkFreq = 0;
                                }
                            }

                            if (star.strobe) {
                                star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
                            }
                        }
                    }
                }

                // 更新火花
                const sparks = sparksRef.current[color];
                for (let i = sparks.length - 1; i >= 0; i--) {
                    const spark = sparks[i];
                    spark.life -= timeStep;

                    if (spark.life <= 0) {
                        sparks.splice(i, 1);
                        returnSpark(spark);
                    } else {
                        spark.prevX = spark.x;
                        spark.prevY = spark.y;
                        spark.x += spark.speedX * speed;
                        spark.y += spark.speedY * speed;
                        spark.speedX *= sparkDrag;
                        spark.speedY *= sparkDrag;
                        spark.speedY += gAcc;
                    }
                }
            });

            // 渲染
            // 天空照明
            if (skyLightingLevel > 0) {
                const skyColor = colorSky(speed);
                trailsCanvas.style.backgroundColor = skyColor;
            }

            // 拖尾画布 - 丝滑淡出效果
            trailsCtx.globalCompositeOperation = 'source-over';
            trailsCtx.fillStyle = `rgba(0, 0, 0, 0.175)`;
            trailsCtx.fillRect(0, 0, width, height);

            // 主画布清除
            ctx.clearRect(0, 0, width, height);

            // 绘制爆炸闪光
            while (burstFlashesRef.current.length) {
                const bf = burstFlashesRef.current.pop()!;
                const gradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
                gradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
                gradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
                gradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
                trailsCtx.fillStyle = gradient;
                trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
            }

            trailsCtx.globalCompositeOperation = 'lighten';

            // 绘制星星
            const starDrawWidth = 3;
            trailsCtx.lineWidth = starDrawWidth;
            trailsCtx.lineCap = 'round';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();

            COLOR_CODES.forEach(color => {
                const stars = starsRef.current[color];
                trailsCtx.strokeStyle = color;
                trailsCtx.beginPath();
                stars.forEach(star => {
                    if (star.visible) {
                        trailsCtx.moveTo(star.x, star.y);
                        trailsCtx.lineTo(star.prevX, star.prevY);
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
                    }
                });
                trailsCtx.stroke();
            });
            ctx.stroke();

            // 绘制火花
            const sparkDrawWidth = 0.75;
            trailsCtx.lineWidth = sparkDrawWidth;
            trailsCtx.lineCap = 'butt';

            COLOR_CODES.forEach(color => {
                const sparks = sparksRef.current[color];
                trailsCtx.strokeStyle = color;
                trailsCtx.beginPath();
                sparks.forEach(spark => {
                    trailsCtx.moveTo(spark.x, spark.y);
                    trailsCtx.lineTo(spark.prevX, spark.prevY);
                });
                trailsCtx.stroke();
            });

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [showWelcome, config.autoLaunch, config.finaleMode, config.skyLighting, launchShell, addSpark, returnStar, returnSpark]);

    const startAnimation = useCallback(() => {
        setShowWelcome(false);
        // 不自动播放文字序列，等待点击月亮触发
    }, []);

    // 点击月亮触发文字动画序列
    const handleMoonClick = useCallback(() => {
        if (!showWelcome) {
            // 重新开始动画序列
            setCurrentTextIndex(0);
            setAnimationStarted(true);

            // 如果 ShapeShifter 还未初始化，延迟初始化
            if (!shapeShifterRef.current && textCanvasRef.current) {
                shapeShifterRef.current = new ShapeShifter(textCanvasRef.current);
                shapeShifterRef.current.start();
            }
        }
    }, [showWelcome]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 浪漫场景层 (from city-fireworks) */}
            <StarField
                enabled={config.showStarField}
                count={config.starCount}
                containerRef={containerRef}
            />
            <Moon enabled={config.showMoon} onClick={!showWelcome ? handleMoonClick : undefined} />

            {/* 浪漫装饰层 */}
            {!showWelcome && (
                <>
                    <FloatingHearts enabled={config.showFloatingHearts} />
                    <Sparkles enabled={config.showSparkles} />
                </>
            )}

            {/* 烟花画布 */}
            {!showWelcome && (
                <>
                    <canvas
                        ref={trailsCanvasRef}
                        className="absolute inset-0 z-10 w-full h-full"
                        style={{ mixBlendMode: 'lighten' }}
                    />
                    <canvas
                        ref={mainCanvasRef}
                        onClick={handleClick}
                        className="absolute inset-0 z-20 w-full h-full cursor-crosshair"
                        style={{ mixBlendMode: 'lighten' }}
                    />
                </>
            )}

            {/* 粒子动画文字 Canvas (from spring-festival) */}
            <canvas
                ref={textCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ background: 'transparent', zIndex: 25 }}
            />

            {/* 上方标题显示 */}
            {!showWelcome && animationStarted && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <div
                        className="text-xl md:text-2xl font-serif tracking-widest"
                        style={{
                            color: 'rgba(255, 215, 0, 0.9)',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                        }}
                    >
                        💕 {config.recipientName} 💕
                    </div>
                </div>
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <WelcomeScreen
                    recipientName={config.recipientName}
                    customTitle={config.customTitle}
                    onStart={startAnimation}
                />
            )}

            {/* 提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <div className="text-white/40 text-sm animate-pulse">
                        ❤️ 点击屏幕放烟花 ❤️
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }

                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fall-heart {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }

                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                @keyframes spin {
                    from { transform: rotate(0deg) scale(1.5); }
                    to { transform: rotate(360deg) scale(1.5); }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out;
                }

                .animate-fall-heart {
                    animation: fall-heart linear infinite;
                }

                .animate-sparkle {
                    animation: sparkle ease-in-out infinite;
                }

                .safe-area-inset {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }
            `}</style>
        </div>
    );
}

// ============================================================================
// 欢迎屏幕组件
// ============================================================================

interface WelcomeScreenProps {
    recipientName: string;
    customTitle: string;
    onStart: () => void;
}

function WelcomeScreen({ recipientName, customTitle, onStart }: WelcomeScreenProps) {
    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center safe-area-inset">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

            <div className="relative text-center px-4 sm:px-8 max-w-lg sm:max-w-2xl">
                <div className="relative mb-6 sm:mb-8">
                    <div
                        className="absolute inset-0 blur-3xl opacity-40"
                        style={{
                            background: 'conic-gradient(from 0deg, #ff0043, #ffae00, #ff69b4, #a855f7, #ff0043)',
                            animation: 'spin 10s linear infinite',
                            borderRadius: '50%',
                            transform: 'scale(1.5)',
                        }}
                    />
                    <span
                        className="relative text-7xl sm:text-8xl md:text-9xl block"
                        style={{
                            filter: 'drop-shadow(0 0 40px rgba(255, 100, 100, 0.8)) drop-shadow(0 0 60px #ffae00)',
                            animation: 'bounce-slow 3s ease-in-out infinite',
                        }}
                    >
                        💝
                    </span>
                    <span
                        className="absolute -right-2 sm:-right-4 top-0 text-xl sm:text-2xl"
                        style={{ animation: 'float 2s ease-in-out infinite' }}
                    >
                        ✨
                    </span>
                    <span
                        className="absolute -left-2 sm:-left-4 top-4 text-lg sm:text-xl"
                        style={{ animation: 'float 2.5s ease-in-out infinite 0.5s' }}
                    >
                        💕
                    </span>
                </div>

                <div
                    className="text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 font-serif tracking-wider sm:tracking-widest"
                    style={{
                        background: 'linear-gradient(to right, #ff69b4, #ffae00, #ff0043)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradient-flow 3s ease infinite',
                        textShadow: '0 0 30px rgba(255,174,0,0.5)',
                    }}
                >
                    💕 {recipientName} 💕
                </div>

                <h1 className="text-white/70 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em] font-light">
                    {customTitle}
                </h1>

                <button
                    onClick={onStart}
                    className="relative px-10 sm:px-14 py-4 sm:py-6 text-white rounded-full text-lg sm:text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #ff0043 0%, #ffae00 50%, #ff69b4 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-flow 3s ease infinite',
                        boxShadow: '0 0 40px rgba(255, 0, 67, 0.5), 0 0 80px rgba(255, 174, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    <span className="relative z-10 flex items-center gap-3">
                        <span className="text-xl sm:text-2xl">❤️</span>
                        点击开启专属烟花
                        <span className="text-xl sm:text-2xl">❤️</span>
                    </span>
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    />
                </button>

                <p className="mt-6 sm:mt-8 text-white/50 text-xs sm:text-sm">
                    点击屏幕可手动燃放浪漫烟花 🎆
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// 默认页面导出
// ============================================================================

export default function CustomFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
