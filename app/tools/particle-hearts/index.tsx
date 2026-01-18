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
    centerText: string;
    heartStyle: 'particle-dual' | 'diamond-trace' | 'pulse-glow';
    heartColor: string;
    particleDensity: number;
    glowIntensity: number;
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
    heartColor: '#ea80b0',
    particleDensity: 500,
    glowIntensity: 100,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const particleHeartsConfigMetadata = {
    panelTitle: '粒子爱心配置',
    panelSubtitle: 'Particle Hearts Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的宝贝' },
        centerText: { category: 'content' as const, type: 'input' as const, label: '爱心文字', placeholder: '我真的好爱你' },

        heartStyle: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '爱心样式',
            options: PRESETS.heartStyles
        },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '爱心颜色' },
        particleDensity: { category: 'visual' as const, type: 'slider' as const, label: '粒子密度', min: 200, max: 1000, step: 50 },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '光晕强度', min: 50, max: 200, step: 10 },

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
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['heartStyle' as const, 'heartColor' as const, 'particleDensity' as const, 'glowIntensity' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

/**
 * ==============================================================================
 * 2. 粒子生成类 (Particle Classes)
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
        this.color = `hsla(${hue}, ${40 * Math.random() + 60}%, ${60 * Math.random() + 20}%, 0.3)`;
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
            ctx.fillRect(this.trace[k].x, this.trace[k].y, 1, 1);
        }
    }
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

    // 粒子双心效果
    useEffect(() => {
        if (config.heartStyle !== 'particle-dual') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = 600;
            canvas.height = 600;
            canvas.style.width = '600px';
            canvas.style.height = '600px';
        };
        resize();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(1, -1);
        ctx.fillStyle = config.heartColor;

        let ws = 18;
        let hs = 16;
        let wsSpeed = 0.15;
        let hsSpeed = 0.15;
        const speed = 0.2;

        // 创建多层粒子
        const wqs: DualHeartParticle[] = [];
        const nqs: DualHeartParticle[] = [];
        const hxz: DualHeartParticle[] = [];
        const hxz2: DualHeartParticle[] = [];

        // 外圈
        for (let j = 0; j < 500; j += speed) {
            const trans = 9 + Math.random() * 2.5;
            const size = Math.random() * 2;
            wqs.push(new DualHeartParticle(trans, size, j, ws));
        }

        // 内圈
        for (let j = 0; j < 300; j += speed) {
            const trans = 7 + Math.random() * 5;
            const size = Math.random() * 2.5;
            nqs.push(new DualHeartParticle(trans, size, j, ws));
        }

        // 核心轴
        for (let j = 0; j < 600; j += speed) {
            const trans = 11 + Math.random() * 2;
            const size = Math.random() * 3.5;
            hxz.push(new DualHeartParticle(trans, size, j, ws));
        }

        // 核心轴2
        for (let j = 0; j < 500; j += speed) {
            const trans = Math.random() * 2.7;
            const size = Math.random() * 2.5;
            hxz2.push(new DualHeartParticle(trans, size, j, ws));
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
            ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            ws += wsSpeed;
            if (ws < 16) wsSpeed *= -1;
            else if (ws > 18) wsSpeed *= -1;

            hs += hsSpeed;
            if (hs < 14) hsSpeed *= -1;
            else if (hs > 16) hsSpeed *= -1;

            drawParticles(hxz, ws, hs);
            drawParticles(hxz2, ws, hs);
            drawParticles(nqs, ws, hs);
            drawParticles(wqs, ws, hs);

            // 顶层散射粒子
            const dc: DualHeartParticle[] = [];
            for (let j = 0; j < 300; j += speed) {
                const trans = 1 + Math.random() * 20;
                const size = Math.random() * 2;
                dc.push(new DualHeartParticle(trans, size, j, ws));
            }
            dc.forEach(v => {
                ctx.beginPath();
                ctx.arc(v.x, v.y, v.rs, 0, Math.PI * 2);
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
    }, [config.heartStyle, config.heartColor]);

    // 钻石轨迹效果
    useEffect(() => {
        if (config.heartStyle !== 'diamond-trace') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerRef.current.clientWidth * 0.5;
            canvas.height = containerRef.current.clientHeight * 0.5;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const width = canvas.width;
        const height = canvas.height;

        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillRect(0, 0, width, height);

        // 心形位置函数
        const heartPosition = (rad: number): [number, number] => {
            return [
                Math.pow(Math.sin(rad), 3),
                -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
            ];
        };

        const scaleAndTranslate = (pos: [number, number], sx: number, sy: number, dx: number, dy: number): [number, number] => {
            return [dx + pos[0] * sx, dy + pos[1] * sy];
        };

        // 生成心形点
        const pointsOrigin: [number, number][] = [];
        const dr = 0.1;
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
        }
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
        }
        for (let i = 0; i < Math.PI * 2; i += dr) {
            pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
        }
        const heartPointsCount = pointsOrigin.length;

        // 目标点
        let targetPoints: [number, number][] = [];
        const pulse = (kx: number, ky: number) => {
            for (let i = 0; i < pointsOrigin.length; i++) {
                targetPoints[i] = [
                    kx * pointsOrigin[i][0] + width / 2,
                    ky * pointsOrigin[i][1] + height / 2
                ];
            }
        };

        // 创建粒子
        const particles: DiamondTraceParticle[] = [];
        const baseHue = config.heartColor === '#ea80b0' ? 330 :
            config.heartColor.includes('blue') ? 240 :
                parseInt(config.heartColor.slice(1), 16) % 360;

        for (let i = 0; i < heartPointsCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
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
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update(targetPoints, heartPointsCount, traceK);
                p.draw(ctx);
            });

            // 绘制目标点
            ctx.fillStyle = 'rgba(255,255,255,1)';
            for (let i = 0; i < Math.min(targetPoints.length, 60); i++) {
                if (targetPoints[i]) {
                    ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 2, 2);
                }
            }

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

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerRef.current.clientWidth * dpr;
            canvas.height = containerRef.current.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const width = () => canvas.width / (window.devicePixelRatio || 1);
        const height = () => canvas.height / (window.devicePixelRatio || 1);

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

            // 光晕效果
            ctx.shadowBlur = config.glowIntensity;
            ctx.shadowColor = config.heartColor;
            ctx.fillStyle = config.heartColor;
            ctx.fill();

            ctx.restore();
        };

        const loop = () => {
            ctx.clearRect(0, 0, width(), height());

            // 背景渐变
            const gradient = ctx.createRadialGradient(
                width() / 2, height() / 2, 0,
                width() / 2, height() / 2, Math.max(width(), height()) / 2
            );
            gradient.addColorStop(0, 'rgba(255, 0, 100, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width(), height());

            time += 0.02;

            // 多层脉动效果
            const baseScale = 8;
            const pulseScale = Math.sin(time) * 1.5;

            // 外层光晕
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale + 2, 0.1);
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale + 1, 0.3);

            // 主心形
            drawHeart(width() / 2, height() / 2, baseScale + pulseScale, 0.8);

            // 内层发光
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
            </div>

            {/* 2. 光晕效果层 */}
            {config.heartStyle === 'particle-dual' && (
                <div
                    className="absolute z-5 rounded-full mix-blend-screen"
                    style={{
                        top: '10%',
                        left: '5%',
                        width: '500px',
                        height: '500px',
                        background: `rgba(255, 0, 100, 0.2)`,
                        filter: `blur(${config.glowIntensity}px)`,
                    }}
                />
            )}

            {/* 3. 爱心Canvas层 */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    className={`${config.heartStyle === 'particle-dual' ? '' : 'w-full h-full'}`}
                    style={{
                        filter: config.heartStyle === 'particle-dual' ? 'blur(0.5px)' : 'none',
                    }}
                />
            </div>

            {/* 4. 文字UI层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-end pb-20 px-4">
                {/* 中心文字 */}
                <div
                    className="text-center"
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        right: '15%',
                    }}
                >
                    <h1
                        className="text-white font-light italic text-2xl md:text-4xl tracking-wider"
                        style={{
                            textShadow: `1px 1px 8px ${config.heartColor}88`,
                        }}
                    >
                        {config.centerText}
                    </h1>
                    {config.recipientName && (
                        <div className="text-pink-300/80 text-lg md:text-xl font-light tracking-[0.3em] mt-4">
                            {config.recipientName}
                        </div>
                    )}
                </div>
            </div>

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

            {/* 6. 效果模式指示 */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs">
                    {PRESETS.heartStyles.find(m => m.value === config.heartStyle)?.label || '粒子双心'}
                </div>
            </div>
        </div>
    );
}

export default function ParticleHeartsPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
