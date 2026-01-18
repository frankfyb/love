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
 * 3D烟花秀组件 - 沉浸式3D烟花体验
 * 参考: 新年快乐烟花声音 (3D透视烟花效果)
 * 特点: 
 *   - 3D透视渲染
 *   - 粒子尾迹效果
 *   - 多彩火花系统
 *   - 自动视角旋转
 *   - 地面网格参照
 *   - 中央文字显示
 * ==============================================================================
 */

export interface AppConfig {
    displayText: string;
    greetings: string[];
    autoRotate: boolean;
    rotateSpeed: number;
    fireworkDensity: number;
    particleCount: number;
    trailLength: number;
    showGround: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('firework-show-3d'),
    music: [
        { label: '新年祝福', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultGreetings: [
        '新年快乐',
        '万事如意',
        '心想事成',
        '前程似锦',
        '幸福美满',
    ],
    sparkColors: [
        '#ff8844', // 橙色
        '#8844ff', // 紫色
        '#88ffff', // 青色
        '#ffffff', // 白色
        '#44ff88', // 绿色
        '#ff4444', // 红色
        '#ffaa44', // 金橙
        '#aa44ff', // 紫红
        '#44aaff', // 蓝色
        '#ff88aa', // 粉色
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    displayText: '新年快乐',
    greetings: PRESETS.defaultGreetings,
    autoRotate: true,
    rotateSpeed: 50,
    fireworkDensity: 50,
    particleCount: 80,
    trailLength: 5,
    showGround: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const fireworkShow3dCardConfigMetadata = {
    panelTitle: '3D烟花秀配置',
    panelSubtitle: '沉浸式3D烟花体验',
    configSchema: {
        displayText: { category: 'content' as const, type: 'input' as const, label: '显示文字', placeholder: '新年快乐' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语列表', placeholder: '输入祝福语', description: '随机轮播显示' },

        autoRotate: { category: 'visual' as const, type: 'switch' as const, label: '自动旋转视角' },
        rotateSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 10, max: 100, step: 10 },
        fireworkDensity: { category: 'visual' as const, type: 'slider' as const, label: '烟花密度', min: 20, max: 100, step: 10 },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '粒子数量', min: 30, max: 150, step: 10 },
        trailLength: { category: 'visual' as const, type: 'slider' as const, label: '尾迹长度', min: 2, max: 10, step: 1 },
        showGround: { category: 'visual' as const, type: 'switch' as const, label: '显示地面网格' },

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
        { id: 1, label: '祝福内容', icon: null, fields: ['displayText' as const, 'greetings' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['autoRotate' as const, 'rotateSpeed' as const, 'fireworkDensity' as const, 'particleCount' as const, 'trailLength' as const, 'showGround' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 音效源
// ============================================================================
const AUDIO_SOURCES = {
    burst: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
    ],
};

// ============================================================================
// 类型定义
// ============================================================================
interface Seed {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    born: number;
}

interface TrailPoint {
    x: number;
    y: number;
    z: number;
}

interface Spark {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    color: string;
    glowColor: string;
    radius: number;
    alpha: number;
    trail: TrailPoint[];
    twinkle: number;
    twinkleSpeed: number;
}

interface RasterPoint {
    x: number;
    y: number;
    d: number;
}

// ============================================================================
// 主组件
// ============================================================================
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 状态引用
    const seedsRef = useRef<Seed[]>([]);
    const sparksRef = useRef<Spark[]>([]);
    const framesRef = useRef(0);
    const seedTimerRef = useRef(0);
    const playerRef = useRef({
        x: 0, y: 0, z: -25,
        vx: 0, vy: 0, vz: 0,
        yaw: 0, pitch: 0,
    });

    // 音效引用
    const audioPoolRef = useRef<HTMLAudioElement[]>([]);
    const audioCursorRef = useRef(0);

    const [currentText, setCurrentText] = useState(config.displayText);
    const [showWelcome, setShowWelcome] = useState(true);

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

    // 初始化音效池
    useEffect(() => {
        if (typeof window === 'undefined') return;

        audioPoolRef.current = [];
        for (let i = 0; i < 8; i++) {
            const audio = new Audio(AUDIO_SOURCES.burst[i % AUDIO_SOURCES.burst.length]);
            audio.preload = 'auto';
            audio.volume = 0.4;
            audioPoolRef.current.push(audio);
        }
    }, []);

    // 播放爆炸音效
    const playBurstSound = useCallback((distance: number) => {
        if (!config.enableSound || isMuted) return;

        const audio = audioPoolRef.current[audioCursorRef.current];
        if (audio) {
            audio.volume = Math.min(0.6, 1.5 / (1 + distance / 10));
            audio.currentTime = 0;
            audio.play().catch(() => { });
            audioCursorRef.current = (audioCursorRef.current + 1) % audioPoolRef.current.length;
        }
    }, [config.enableSound, isMuted]);

    // 文字轮播
    useEffect(() => {
        if (showWelcome) return;

        const greetings = config.greetings.length > 0 ? config.greetings : PRESETS.defaultGreetings;
        let index = 0;
        setCurrentText(greetings[0] || config.displayText);

        const interval = setInterval(() => {
            index = (index + 1) % greetings.length;
            setCurrentText(greetings[index]);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.greetings, config.displayText, showWelcome]);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    // 主渲染循环
    useEffect(() => {
        if (showWelcome) return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        const PI = Math.PI;
        const scale = 600;
        const gravity = 0.02;
        const seedLife = 100;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        // 3D透视光栅化
        const rasterizePoint = (x: number, y: number, z: number): RasterPoint => {
            const player = playerRef.current;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            x -= player.x;
            y -= player.y;
            z -= player.z;

            let p = Math.atan2(x, z);
            let d = Math.sqrt(x * x + z * z);
            x = Math.sin(p - player.yaw) * d;
            z = Math.cos(p - player.yaw) * d;

            p = Math.atan2(y, z);
            d = Math.sqrt(y * y + z * z);
            y = Math.sin(p - player.pitch) * d;
            z = Math.cos(p - player.pitch) * d;

            if (z === 0) z = 0.000000001;

            const rx = cx + (x / z) * scale;
            const ry = cy + (y / z) * scale;

            return {
                x: rx,
                y: ry,
                d: z > 0 ? Math.sqrt(x * x + y * y + z * z) : -1,
            };
        };

        // 生成烟花种子
        const spawnSeed = () => {
            const seed: Seed = {
                x: -50 + Math.random() * 100,
                y: 25,
                z: -50 + Math.random() * 100,
                vx: 0.1 - Math.random() * 0.2,
                vy: -1.5,
                vz: 0.1 - Math.random() * 0.2,
                born: framesRef.current,
            };
            seedsRef.current.push(seed);
        };

        // 烟花爆炸
        const explode = (x: number, y: number, z: number) => {
            const particleCount = Math.floor(config.particleCount * (0.5 + Math.random() * 0.5));
            const sparkV = 1 + Math.random() * 2.5;

            // 选择颜色模式
            const colorMode = Math.floor(Math.random() * 3);
            const colors: string[] = [];

            if (colorMode === 0) {
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
            } else if (colorMode === 1) {
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
            } else {
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
                colors.push(PRESETS.sparkColors[Math.floor(Math.random() * PRESETS.sparkColors.length)]);
            }

            for (let i = 0; i < particleCount; i++) {
                const p1 = PI * 2 * Math.random();
                const p2 = PI * Math.random();
                const v = sparkV * (1 + Math.random() / 6);
                const color = colors[Math.floor(Math.random() * colors.length)];

                // 生成光晕颜色（更亮的版本）
                const glowColor = color.replace('#', '');
                const r = Math.min(255, parseInt(glowColor.substr(0, 2), 16) + 50);
                const g = Math.min(255, parseInt(glowColor.substr(2, 2), 16) + 50);
                const b = Math.min(255, parseInt(glowColor.substr(4, 2), 16) + 50);
                const brighterColor = `rgb(${r}, ${g}, ${b})`;

                const spark: Spark = {
                    x, y, z,
                    vx: Math.sin(p1) * Math.sin(p2) * v,
                    vy: Math.cos(p2) * v,
                    vz: Math.cos(p1) * Math.sin(p2) * v,
                    color,
                    glowColor: brighterColor,
                    radius: 25 + Math.random() * 50,
                    alpha: 1,
                    trail: [],
                    twinkle: Math.random(),
                    twinkleSpeed: 0.05 + Math.random() * 0.1,
                };
                sparksRef.current.push(spark);
            }

            // 播放爆炸音效
            const dist = Math.sqrt(
                (x - playerRef.current.x) ** 2 +
                (y - playerRef.current.y) ** 2 +
                (z - playerRef.current.z) ** 2
            );
            playBurstSound(dist);
        };

        // 逻辑更新
        const doLogic = () => {
            const frames = framesRef.current;
            const seedInterval = 10 - config.fireworkDensity / 10;

            // 生成新烟花
            if (seedTimerRef.current < frames) {
                seedTimerRef.current = frames + seedInterval * Math.random() * 10;
                spawnSeed();
            }

            // 更新种子
            for (let i = seedsRef.current.length - 1; i >= 0; i--) {
                const seed = seedsRef.current[i];
                seed.vy += gravity;
                seed.x += seed.vx;
                seed.y += seed.vy;
                seed.z += seed.vz;

                if (frames - seed.born > seedLife) {
                    explode(seed.x, seed.y, seed.z);
                    seedsRef.current.splice(i, 1);
                }
            }

            // 更新火花
            for (let i = sparksRef.current.length - 1; i >= 0; i--) {
                const spark = sparksRef.current[i];

                if (spark.alpha > 0 && spark.radius > 5) {
                    spark.alpha -= 0.008; // 更慢的淡出速度
                    spark.radius /= 1.018; // 更慢的缩小速度
                    spark.vy += gravity;

                    // 更新闪烁效果
                    spark.twinkle += spark.twinkleSpeed;
                    if (spark.twinkle > 1) spark.twinkle = 0;

                    // 更新尾迹
                    const point = { x: spark.x, y: spark.y, z: spark.z };
                    if (spark.trail.length > 0) {
                        const last = spark.trail[spark.trail.length - 1];
                        const d = (point.x - last.x) ** 2 + (point.y - last.y) ** 2 + (point.z - last.z) ** 2;
                        if (d > 4) spark.trail.push(point); // 更密集的尾迹点
                    } else {
                        spark.trail.push(point);
                    }
                    if (spark.trail.length > config.trailLength + 3) spark.trail.shift(); // 更长的尾迹

                    // 更新位置
                    spark.x += spark.vx;
                    spark.y += spark.vy;
                    spark.z += spark.vz;
                    spark.vx /= 1.065; // 更慢的速度衰减
                    spark.vy /= 1.065;
                    spark.vz /= 1.065;
                } else {
                    sparksRef.current.splice(i, 1);
                }
            }

            // 自动旋转视角
            if (config.autoRotate) {
                const player = playerRef.current;
                const p = Math.atan2(player.x, player.z);
                let d = Math.sqrt(player.x * player.x + player.z * player.z);
                d += Math.sin(frames / (200 - config.rotateSpeed)) / 1.25;
                const t = Math.sin(frames / (400 - config.rotateSpeed * 2)) / 40;
                player.x = Math.sin(p + t) * d;
                player.z = Math.cos(p + t) * d;
                player.yaw = PI + p + t;
            }
        };

        // 绘制
        const draw = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制中央文字
            const fontSize = Math.min(160, canvas.width / 6);
            ctx.font = `bold ${fontSize}px "Microsoft YaHei", "Heiti SC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 文字发光效果
            ctx.shadowColor = '#ff8844';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = '#ffaa66';
            ctx.lineWidth = 2;
            ctx.strokeText(currentText, cx, cy);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
            ctx.fillText(currentText, cx, cy);

            // 绘制地面网格
            if (config.showGround) {
                ctx.fillStyle = '#ff8';
                for (let i = -100; i < 100; i += 4) {
                    for (let j = -100; j < 100; j += 5) {
                        const point = rasterizePoint(i, 25, j);
                        if (point.d > 0) {
                            const size = 250 / (1 + point.d);
                            const dist = Math.sqrt(i * i + j * j);
                            const a = 0.75 - Math.pow(dist / 100, 6) * 0.75;
                            if (a > 0) {
                                ctx.globalAlpha = a * 0.5;
                                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                            }
                        }
                    }
                }
            }

            ctx.globalAlpha = 1;

            // 绘制种子（上升的烟花弹）
            seedsRef.current.forEach(seed => {
                const point = rasterizePoint(seed.x, seed.y, seed.z);
                if (point.d > 0) {
                    const size = 200 / (1 + point.d);

                    // 种子光晕
                    ctx.globalAlpha = 0.6;
                    const seedGlow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 2);
                    seedGlow.addColorStop(0, '#ffaa44');
                    seedGlow.addColorStop(0.5, '#ff884466');
                    seedGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = seedGlow;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size * 2, 0, PI * 2);
                    ctx.fill();

                    // 种子本体
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#ffcc88';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size / 2, 0, PI * 2);
                    ctx.fill();

                    // 种子中心高光
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size / 4, 0, PI * 2);
                    ctx.fill();
                }
            });

            // 绘制火花
            sparksRef.current.forEach(spark => {
                const point = rasterizePoint(spark.x, spark.y, spark.z);
                if (point.d > 0) {
                    const size = spark.radius * 200 / (1 + point.d);
                    const twinkleAlpha = 0.7 + Math.sin(spark.twinkle * PI * 2) * 0.3; // 闪烁效果

                    // 绘制外发光光晕（大光晕）
                    ctx.globalAlpha = spark.alpha * 0.15 * twinkleAlpha;
                    const outerGlow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 1.5);
                    outerGlow.addColorStop(0, spark.glowColor);
                    outerGlow.addColorStop(0.3, spark.color + '66');
                    outerGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = outerGlow;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size * 1.5, 0, PI * 2);
                    ctx.fill();

                    // 绘制尾迹（增强版）
                    if (spark.trail.length > 1) {
                        let point1 = { x: point.x, y: point.y };

                        for (let j = spark.trail.length - 1; j >= 0; j--) {
                            const point2 = rasterizePoint(spark.trail[j].x, spark.trail[j].y, spark.trail[j].z);
                            if (point2.d > 0) {
                                const trailProgress = j / spark.trail.length;
                                ctx.globalAlpha = trailProgress * spark.alpha * 0.6 * twinkleAlpha;

                                // 尾迹颜色渐变
                                ctx.strokeStyle = spark.color;
                                ctx.beginPath();
                                ctx.moveTo(point1.x, point1.y);
                                ctx.lineWidth = Math.max(1, 2 + spark.radius * 8 / (spark.trail.length - j + 1) / (1 + point2.d));
                                ctx.lineCap = 'round';
                                ctx.lineTo(point2.x, point2.y);
                                ctx.stroke();

                                // 尾迹光晕
                                ctx.globalAlpha = trailProgress * spark.alpha * 0.2;
                                ctx.strokeStyle = spark.glowColor;
                                ctx.lineWidth = Math.max(2, 4 + spark.radius * 12 / (spark.trail.length - j + 1) / (1 + point2.d));
                                ctx.stroke();

                                point1 = { x: point2.x, y: point2.y };
                            }
                        }
                    }

                    // 绘制火花本体（增强版）
                    ctx.globalAlpha = spark.alpha * twinkleAlpha;

                    // 中心光晕
                    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size / 2);
                    gradient.addColorStop(0, '#ffffff'); // 白色中心
                    gradient.addColorStop(0.2, spark.glowColor); // 亮色
                    gradient.addColorStop(0.5, spark.color);
                    gradient.addColorStop(0.8, spark.color + '88');
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size / 2, 0, PI * 2);
                    ctx.fill();

                    // 添加高光点
                    ctx.globalAlpha = spark.alpha * 0.8 * twinkleAlpha;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size / 8, 0, PI * 2);
                    ctx.fill();
                }
            });

            ctx.globalAlpha = 1;
        };

        // 动画帧
        const frame = () => {
            framesRef.current++;
            if (framesRef.current > 100000) {
                framesRef.current = 0;
                seedTimerRef.current = 0;
            }
            draw();
            doLogic();
            rafId = requestAnimationFrame(frame);
        };

        frame();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [showWelcome, config, currentText, playBurstSound]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 烟花Canvas */}
            {!showWelcome && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-10 block"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/80" />
                    <div className="relative text-center px-4">
                        <div className="mb-8">
                            <span
                                className="text-8xl md:text-9xl"
                                style={{
                                    filter: 'drop-shadow(0 0 40px rgba(255, 136, 68, 0.8))',
                                    animation: 'pulse-3d 2s ease-in-out infinite',
                                }}
                            >
                                🎆
                            </span>
                        </div>

                        <h1
                            className="text-4xl md:text-6xl font-bold mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #ff8844, #ffaa66, #ffcc88)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 40px rgba(255, 136, 68, 0.5)',
                            }}
                        >
                            3D烟花秀
                        </h1>

                        <p className="text-white/70 text-lg md:text-xl mb-10 tracking-widest">
                            沉浸式3D视觉体验
                        </p>

                        <button
                            onClick={startAnimation}
                            className="relative px-12 py-5 rounded-full text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #ff6600, #ff8844, #ffaa66)',
                                boxShadow: '0 0 40px rgba(255, 136, 68, 0.5), 0 0 80px rgba(255, 136, 68, 0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3 text-white">
                                <span className="text-2xl">🎇</span>
                                开始3D烟花秀
                                <span className="text-2xl">🎇</span>
                            </span>
                            <div
                                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* 底部提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                    <div className="text-white/40 text-sm">
                        ✨ 沉浸在3D烟花的绚烂世界 ✨
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
                @keyframes pulse-3d {
                    0%, 100% {
                        transform: scale(1) rotateY(0deg);
                    }
                    50% {
                        transform: scale(1.1) rotateY(10deg);
                    }
                }
                
                .bg-gradient-radial {
                    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%);
                }
            `}</style>
        </div>
    );
}

export default function FireworkShow3dPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
