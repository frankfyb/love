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
 * 粒子爱心特效 - 浪漫表白工具
 * 特点:
 *   - 三种精美爱心样式：粒子双心、钻石轨迹、脉动光晕
 *   - 完美适配移动端/PC端
 *   - 浪漫的视觉效果和动画
 *   - 可自定义颜色、密度、光晕强度
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    centerText: string;
    heartStyle: 'particle-dual' | 'diamond-trace' | 'pulse-glow';
    heartColor: string;
    particleDensity: number;
    glowIntensity: number;
    showFloatingHearts: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('particle-hearts'),
    music: [
        { label: '浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔情歌', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '甜蜜旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    heartStyles: [
        { label: '💕 粒子双心', value: 'particle-dual' },
        { label: '💎 钻石轨迹', value: 'diamond-trace' },
        { label: '💗 脉动光晕', value: 'pulse-glow' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '致我最爱的你',
    centerText: '我真的好爱你',
    heartStyle: 'particle-dual',
    heartColor: '#ff6b9d',
    particleDensity: 500,
    glowIntensity: 100,
    showFloatingHearts: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a1a' },
        0
    ),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const particleHeartsConfigMetadata = {
    panelTitle: '💕 粒子爱心配置',
    panelSubtitle: 'Romantic Particle Hearts',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '💌 送给谁', placeholder: '例如：亲爱的宝贝' },
        centerText: { category: 'content' as const, type: 'input' as const, label: '💗 爱心文字', placeholder: '我真的好爱你' },

        heartStyle: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '✨ 爱心样式',
            options: PRESETS.heartStyles
        },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '🎨 爱心颜色' },
        particleDensity: { category: 'visual' as const, type: 'slider' as const, label: '💫 粒子密度', min: 200, max: 1000, step: 50 },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '🌟 光晕强度', min: 50, max: 200, step: 10 },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '💕 飘落爱心' },

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
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 效果', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 2, label: '爱心样式', icon: null, fields: ['heartStyle' as const, 'heartColor' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['particleDensity' as const, 'glowIntensity' as const, 'showFloatingHearts' as const] },
        { id: 4, label: '背景氛围', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
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

function FloatingHearts({ color }: { color: string }) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 10 : 18;
        const newHearts: FloatingHeart[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: 10 + Math.random() * 14,
            duration: 8 + Math.random() * 10,
            delay: Math.random() * 6,
            opacity: 0.2 + Math.random() * 0.4,
        }));
        setHearts(newHearts);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-float-heart"
                    style={{
                        left: `${heart.x}%`,
                        top: '-30px',
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        opacity: heart.opacity,
                        fontSize: `${heart.size}px`,
                        color: color,
                        textShadow: `0 0 ${heart.size}px ${color}80`,
                    }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
}

/**
 * ==============================================================================
 * 粒子生成类 (Particle Classes)
 * ==============================================================================
 */

// 粒子双心的粒子类
class DualHeartParticle {
    trans: number;
    rs: number;
    index: number;
    ws: number;
    x: number;
    y: number;

    constructor(trans: number, rs: number, index: number, ws: number) {
        this.trans = trans;
        this.rs = rs;
        this.index = index;
        this.ws = ws;
        this.x = this.trans * this.ws * Math.pow(Math.sin(this.index), 3);
        this.y = this.trans * (16 * Math.cos(this.index) - 5 * Math.cos(2 * this.index) - 2 * Math.cos(3 * this.index) - Math.cos(4 * this.index));
    }

    getPosition(ws: number, hs: number): { x: number; y: number } {
        return {
            x: this.trans * ws * Math.pow(Math.sin(this.index), 3),
            y: this.trans * (hs * Math.cos(this.index) - 5 * Math.cos(2 * this.index) - 2 * Math.cos(3 * this.index) - Math.cos(4 * this.index))
        };
    }
}

// 钻石轨迹粒子类
class DiamondTraceParticle {
    vx: number;
    vy: number;
    R: number;
    speed: number;
    q: number;
    D: number;
    force: number;
    color: string;
    trace: { x: number; y: number }[];
    hue: number;

    constructor(x: number, y: number, heartPointsCount: number, hue: number) {
        this.vx = 0;
        this.vy = 0;
        this.R = 2;
        this.speed = Math.random() + 5;
        this.q = Math.floor(Math.random() * heartPointsCount);
        this.D = 2 * (Math.floor(Math.random() * 2)) - 1;
        this.force = 0.2 * Math.random() + 0.7;
        this.hue = hue;
        this.color = `hsla(${hue}, ${40 * Math.random() + 60}%, ${60 * Math.random() + 20}%, 0.4)`;
        this.trace = [];
        for (let k = 0; k < 50; k++) {
            this.trace.push({ x, y });
        }
    }

    update(targetPoints: number[][], heartPointsCount: number, traceK: number) {
        const q = targetPoints[this.q];
        if (!q) return;

        const dx = this.trace[0].x - q[0];
        const dy = this.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 10) {
            if (Math.random() > 0.95) {
                this.q = Math.floor(Math.random() * heartPointsCount);
            } else {
                if (Math.random() > 0.99) {
                    this.D *= -1;
                }
                this.q += this.D;
                this.q %= heartPointsCount;
                if (this.q < 0) {
                    this.q += heartPointsCount;
                }
            }
        }

        this.vx += -dx / length * this.speed;
        this.vy += -dy / length * this.speed;
        this.trace[0].x += this.vx;
        this.trace[0].y += this.vy;
        this.vx *= this.force;
        this.vy *= this.force;

        for (let k = 0; k < this.trace.length - 1; k++) {
            const T = this.trace[k];
            const N = this.trace[k + 1];
            N.x -= traceK * (N.x - T.x);
            N.y -= traceK * (N.y - T.y);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        for (let k = 0; k < this.trace.length; k++) {
            ctx.fillRect(this.trace[k].x, this.trace[k].y, 1.5, 1.5);
        }
    }
}

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    // 粒子双心效果 - 优化移动端
    useEffect(() => {
        if (config.heartStyle !== 'particle-dual') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let intervalId: ReturnType<typeof setInterval>;
        const isMobileDevice = window.innerWidth < 768;

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const size = isMobileDevice ? Math.min(window.innerWidth * 0.9, 350) : 500;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        const size = isMobileDevice ? Math.min(window.innerWidth * 0.9, 350) : 500;
        ctx.translate(size / 2, size / 2);
        ctx.scale(1, -1);
        ctx.fillStyle = config.heartColor;

        let ws = isMobileDevice ? 14 : 18;
        let hs = isMobileDevice ? 12 : 16;
        let wsSpeed = 0.15;
        let hsSpeed = 0.15;
        const speed = 0.2;

        const densityFactor = isMobileDevice ? 0.6 : 1;
        const baseDensity = config.particleDensity * densityFactor;

        const wqs: DualHeartParticle[] = [];
        const nqs: DualHeartParticle[] = [];
        const hxz: DualHeartParticle[] = [];
        const hxz2: DualHeartParticle[] = [];

        for (let j = 0; j < baseDensity; j += speed) {
            const trans = 9 + Math.random() * 2.5;
            const particleSize = Math.random() * (isMobileDevice ? 1.5 : 2);
            wqs.push(new DualHeartParticle(trans, particleSize, j, ws));
        }

        for (let j = 0; j < baseDensity * 0.6; j += speed) {
            const trans = 7 + Math.random() * 5;
            const particleSize = Math.random() * (isMobileDevice ? 2 : 2.5);
            nqs.push(new DualHeartParticle(trans, particleSize, j, ws));
        }

        for (let j = 0; j < baseDensity * 1.2; j += speed) {
            const trans = 11 + Math.random() * 2;
            const particleSize = Math.random() * (isMobileDevice ? 2.5 : 3.5);
            hxz.push(new DualHeartParticle(trans, particleSize, j, ws));
        }

        for (let j = 0; j < baseDensity; j += speed) {
            const trans = Math.random() * 2.7;
            const particleSize = Math.random() * (isMobileDevice ? 2 : 2.5);
            hxz2.push(new DualHeartParticle(trans, particleSize, j, ws));
        }

        const drawParticles = (particles: DualHeartParticle[], currentWs: number, currentHs: number) => {
            particles.forEach(v => {
                const pos = v.getPosition(currentWs, currentHs);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, v.rs, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });
        };

        const loop = () => {
            const currentSize = isMobileDevice ? Math.min(window.innerWidth * 0.9, 350) : 500;
            ctx.clearRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);

            ws += wsSpeed;
            if (ws < (isMobileDevice ? 12 : 16)) wsSpeed *= -1;
            else if (ws > (isMobileDevice ? 14 : 18)) wsSpeed *= -1;

            hs += hsSpeed;
            if (hs < (isMobileDevice ? 10 : 14)) hsSpeed *= -1;
            else if (hs > (isMobileDevice ? 12 : 16)) hsSpeed *= -1;

            ctx.shadowBlur = config.glowIntensity * 0.3;
            ctx.shadowColor = config.heartColor;

            drawParticles(hxz, ws, hs);
            drawParticles(hxz2, ws, hs);
            drawParticles(nqs, ws, hs);
            drawParticles(wqs, ws, hs);

            const dc: DualHeartParticle[] = [];
            for (let j = 0; j < baseDensity * 0.6; j += speed) {
                const trans = 1 + Math.random() * 20;
                const particleSize = Math.random() * (isMobileDevice ? 1.5 : 2);
                dc.push(new DualHeartParticle(trans, particleSize, j, ws));
            }
            dc.forEach(v => {
                ctx.beginPath();
                ctx.arc(v.x, v.y, v.rs, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            animationId = requestAnimationFrame(loop);
        };

        intervalId = setInterval(loop, isMobileDevice ? 120 : 100);

        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [config.heartStyle, config.heartColor, config.particleDensity, config.glowIntensity]);

    // 钻石轨迹效果
    useEffect(() => {
        if (config.heartStyle !== 'diamond-trace') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const isMobileDevice = window.innerWidth < 768;

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = containerRef.current.clientWidth * dpr;
            canvas.height = containerRef.current.clientHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const width = () => canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const height = () => canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, width(), height());

        const heartPosition = (rad: number): [number, number] => {
            return [
                Math.pow(Math.sin(rad), 3),
                -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
            ];
        };

        const scaleAndTranslate = (pos: [number, number], sx: number, sy: number, dx: number, dy: number): [number, number] => {
            return [dx + pos[0] * sx, dy + pos[1] * sy];
        };

        const scaleFactor = isMobileDevice ? 0.6 : 1;

        const pointsOrigin: [number, number][] = [];
        const dr = 0.1;
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210 * scaleFactor, 13 * scaleFactor, 0, 0));
        }
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150 * scaleFactor, 9 * scaleFactor, 0, 0));
        }
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90 * scaleFactor, 5 * scaleFactor, 0, 0));
        }
        const heartPointsCount = pointsOrigin.length;

        let targetPoints: [number, number][] = [];
        const pulse = (kx: number, ky: number) => {
            const w = width();
            const h = height();
            for (let i = 0; i < pointsOrigin.length; i++) {
                targetPoints[i] = [
                    kx * pointsOrigin[i][0] + w / 2,
                    ky * pointsOrigin[i][1] + h / 2
                ];
            }
        };

        const particles: DiamondTraceParticle[] = [];
        const particleCount = isMobileDevice ? Math.floor(heartPointsCount * 0.6) : heartPointsCount;

        const hexToHue = (hex: string): number => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0;
            if (max !== min) {
                const d = max - min;
                if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                else if (max === g) h = ((b - r) / d + 2) / 6;
                else h = ((r - g) / d + 4) / 6;
            }
            return Math.round(h * 360);
        };

        const baseHue = hexToHue(config.heartColor);

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * width();
            const y = Math.random() * height();
            const hue = baseHue + Math.random() * 60 - 30;
            particles.push(new DiamondTraceParticle(x, y, heartPointsCount, hue));
        }

        const traceK = 0.4;
        const timeDelta = 0.01;
        let time = 0;

        const loop = () => {
            const n = -Math.cos(time);
            pulse((1 + n) * 0.5, (1 + n) * 0.5);
            time += ((Math.sin(time) < 0 ? 9 : (n > 0.8) ? 0.2 : 1)) * timeDelta;

            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, width(), height());

            particles.forEach(p => {
                p.update(targetPoints, heartPointsCount, traceK);
                p.draw(ctx);
            });

            ctx.shadowBlur = 10;
            ctx.shadowColor = config.heartColor;
            ctx.fillStyle = config.heartColor;
            const pointCount = isMobileDevice ? 40 : 60;
            for (let i = 0; i < Math.min(targetPoints.length, pointCount); i++) {
                if (targetPoints[i]) {
                    ctx.fillRect(targetPoints[i][0], targetPoints[i][1], isMobileDevice ? 1.5 : 2, isMobileDevice ? 1.5 : 2);
                }
            }
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.heartStyle, config.heartColor]);

    // 脉动光晕效果
    useEffect(() => {
        if (config.heartStyle !== 'pulse-glow') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const isMobileDevice = window.innerWidth < 768;

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = containerRef.current.clientWidth * dpr;
            canvas.height = containerRef.current.clientHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const width = () => canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const height = () => canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

        let time = 0;

        const drawHeart = (centerX: number, centerY: number, scale: number, alpha: number) => {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            for (let t = 0; t < Math.PI * 2; t += 0.01) {
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();

            ctx.shadowBlur = config.glowIntensity;
            ctx.shadowColor = config.heartColor;
            ctx.fillStyle = config.heartColor;
            ctx.fill();

            ctx.restore();
        };

        const loop = () => {
            ctx.clearRect(0, 0, width(), height());

            const gradient = ctx.createRadialGradient(
                width() / 2, height() / 2, 0,
                width() / 2, height() / 2, Math.max(width(), height()) / 2
            );
            gradient.addColorStop(0, `${config.heartColor}20`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width(), height());

            time += 0.02;

            const baseScale = isMobileDevice ? 5 : 8;
            const pulseScale = Math.sin(time) * (isMobileDevice ? 1 : 1.5);

            drawHeart(width() / 2, height() / 2, baseScale + pulseScale + 2, 0.1);
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale + 1, 0.3);
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale, 0.8);
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale - 1, 1);

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.heartStyle, config.heartColor, config.glowIntensity]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center, ${config.heartColor}15 0%, transparent 60%)`,
                    }}
                />
            </div>

            {/* 2. 飘落爱心 */}
            {config.showFloatingHearts && <FloatingHearts color={config.heartColor} />}

            {/* 3. 光晕效果层 */}
            {config.heartStyle === 'particle-dual' && (
                <div
                    className="absolute z-5 rounded-full mix-blend-screen"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: isMobile ? '300px' : '450px',
                        height: isMobile ? '300px' : '450px',
                        background: `${config.heartColor}30`,
                        filter: `blur(${config.glowIntensity}px)`,
                    }}
                />
            )}

            {/* 4. 爱心Canvas层 */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    className={`${config.heartStyle === 'particle-dual' ? '' : 'w-full h-full'}`}
                    style={{
                        filter: config.heartStyle === 'particle-dual' ? 'blur(0.3px)' : 'none',
                    }}
                />
            </div>

            {/* 5. 文字UI层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-end pb-16 sm:pb-20 px-4">
                <div
                    className="text-center px-6 py-4 rounded-2xl"
                    style={{
                        background: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <h1
                        className="text-white font-light italic text-xl sm:text-2xl md:text-4xl tracking-wider"
                        style={{
                            textShadow: `0 0 20px ${config.heartColor}, 0 0 40px ${config.heartColor}60`,
                        }}
                    >
                        {config.centerText}
                    </h1>
                    {config.recipientName && (
                        <div
                            className="text-sm sm:text-lg md:text-xl font-light tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-3"
                            style={{
                                color: config.heartColor,
                                textShadow: `0 0 10px ${config.heartColor}80`,
                            }}
                        >
                            {config.recipientName}
                        </div>
                    )}
                </div>
            </div>

            {/* 6. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 7. 效果模式指示 */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 text-white/70 text-[10px] sm:text-xs">
                    {PRESETS.heartStyles.find(m => m.value === config.heartStyle)?.label || '粒子双心'}
                </div>
            </div>

            {/* 动画样式 */}
            <style jsx global>{`
                @keyframes float-heart {
                    0% {
                        transform: translateY(-100%) rotate(0deg) scale(0.8);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg) scale(1.2);
                        opacity: 0;
                    }
                }

                .animate-float-heart {
                    animation: float-heart linear infinite;
                }
            `}</style>
        </div>
    );
}

export default function ParticleHeartsPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
