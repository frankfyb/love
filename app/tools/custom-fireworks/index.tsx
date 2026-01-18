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
 * 定制烟花组件 - 送给最爱的人
 * 参考: 烟花html (专属定制烟花)
 * 特点: 
 *   - 送给谁 + 专属定制标语
 *   - 多种烟花类型随机发射
 *   - 天空照明效果
 *   - 祝福语轮播
 *   - 点击屏幕发射烟花
 *   - 终极模式批量发射
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    customTitle: string;
    greetings: string[];
    shellType: 'random' | 'crysanthemum' | 'ring' | 'palm' | 'willow' | 'strobe';
    autoLaunch: boolean;
    finaleMode: boolean;
    skyLighting: boolean;
    particleQuality: 'low' | 'normal' | 'high';
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('custom-fireworks'),
    music: [
        { label: '浪漫新年', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '温暖钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultGreetings: [
        '新年快乐',
        '万事如意',
        '心想事成',
        '永远爱你',
        '幸福美满',
    ],
    colors: {
        Red: '#ff0043',
        Green: '#14fc56',
        Blue: '#1e7fff',
        Purple: '#e60aff',
        Gold: '#ffbf36',
        White: '#ffffff',
        Pink: '#ff69b4',
        Cyan: '#00ffff',
    },
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '最爱的宝贝',
    customTitle: '专属定制 - 献给最爱的你',
    greetings: PRESETS.defaultGreetings,
    shellType: 'random',
    autoLaunch: true,
    finaleMode: false,
    skyLighting: true,
    particleQuality: 'normal',
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const customFireworksCardConfigMetadata = {
    panelTitle: '定制烟花配置',
    panelSubtitle: '送给最爱的人',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '送给谁', placeholder: '最爱的宝贝' },
        customTitle: { category: 'content' as const, type: 'input' as const, label: '专属标语', placeholder: '专属定制 - 献给最爱的你' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语', placeholder: '输入祝福语', description: '每行一句，轮播展示' },

        shellType: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '烟花类型',
            options: [
                { label: '随机', value: 'random' },
                { label: '菊花', value: 'crysanthemum' },
                { label: '环形', value: 'ring' },
                { label: '棕榈', value: 'palm' },
                { label: '柳树', value: 'willow' },
                { label: '闪烁', value: 'strobe' },
            ]
        },
        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        finaleMode: { category: 'visual' as const, type: 'switch' as const, label: '终极模式', description: '快速连续发射' },
        skyLighting: { category: 'visual' as const, type: 'switch' as const, label: '天空照明' },
        particleQuality: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '粒子质量',
            options: [
                { label: '低', value: 'low' },
                { label: '正常', value: 'normal' },
                { label: '高', value: 'high' },
            ]
        },

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
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'customTitle' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetings' as const] },
        { id: 3, label: '烟花设置', icon: null, fields: ['shellType' as const, 'autoLaunch' as const, 'finaleMode' as const, 'skyLighting' as const, 'particleQuality' as const] },
        { id: 4, label: '背景音效', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 工具函数
// ============================================================================
const randomColor = () => {
    const colors = Object.values(PRESETS.colors);
    return colors[Math.floor(Math.random() * colors.length)];
};

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// ============================================================================
// 类型定义
// ============================================================================
interface Star {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    secondColor?: string;
    life: number;
    maxLife: number;
    size: number;
    sparkFreq: number;
    sparkLife: number;
    strobe: boolean;
    strobeFreq: number;
    glitter: boolean;
    glitterSize: number;
    trail: { x: number; y: number }[];
    trailLength: number;
}

interface Shell {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    type: string;
    starCount: number;
    spreadSize: number;
    starLife: number;
    burst: boolean;
}

interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

// ============================================================================
// 音效源
// ============================================================================
const AUDIO_SOURCES = {
    lift: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift2.mp3',
    ],
    burst: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
    ],
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
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const shellsRef = useRef<Shell[]>([]);
    const starsRef = useRef<Star[]>([]);
    const sparksRef = useRef<Spark[]>([]);
    const lastFrameTimeRef = useRef(0);
    const autoLaunchTimerRef = useRef(0);
    const skyColorRef = useRef({ r: 0, g: 0, b: 0 });

    const [currentGreeting, setCurrentGreeting] = useState('');
    const [greetingIndex, setGreetingIndex] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);

    // 音效池
    const liftAudioRef = useRef<HTMLAudioElement[]>([]);
    const burstAudioRef = useRef<HTMLAudioElement[]>([]);
    const audioCursorRef = useRef({ lift: 0, burst: 0 });

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

    // 初始化音效
    useEffect(() => {
        if (typeof window === 'undefined') return;
        liftAudioRef.current = AUDIO_SOURCES.lift.map(src => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = 0.3;
            return audio;
        });
        burstAudioRef.current = AUDIO_SOURCES.burst.map(src => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = 0.4;
            return audio;
        });
    }, []);

    // 播放音效
    const playSound = useCallback((type: 'lift' | 'burst') => {
        if (!config.enableSound || isMuted) return;
        const pool = type === 'lift' ? liftAudioRef.current : burstAudioRef.current;
        const cursor = audioCursorRef.current[type];
        const audio = pool[cursor];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
            audioCursorRef.current[type] = (cursor + 1) % pool.length;
        }
    }, [config.enableSound, isMuted]);

    // 祝福语轮播
    useEffect(() => {
        if (showWelcome) return;
        const greetings = config.greetings.length > 0 ? config.greetings : PRESETS.defaultGreetings;
        setCurrentGreeting(greetings[0]);

        const interval = setInterval(() => {
            setGreetingIndex(prev => {
                const next = (prev + 1) % greetings.length;
                setCurrentGreeting(greetings[next]);
                return next;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [config.greetings, showWelcome]);

    // 获取粒子数量倍数
    const getQualityMultiplier = useCallback(() => {
        switch (config.particleQuality) {
            case 'low': return 0.5;
            case 'high': return 1.5;
            default: return 1;
        }
    }, [config.particleQuality]);

    // 创建烟花
    const createShell = useCallback((x: number, y: number) => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;

        const types = config.shellType === 'random'
            ? ['crysanthemum', 'ring', 'palm', 'willow', 'strobe']
            : [config.shellType];
        const type = types[Math.floor(Math.random() * types.length)];
        const color = randomColor();
        const qualityMult = getQualityMultiplier();

        let starCount = 80;
        let spreadSize = 150;
        let starLife = 1000;

        switch (type) {
            case 'crysanthemum':
                starCount = Math.floor(100 * qualityMult);
                spreadSize = 180;
                starLife = 1200;
                break;
            case 'ring':
                starCount = Math.floor(60 * qualityMult);
                spreadSize = 200;
                starLife = 1000;
                break;
            case 'palm':
                starCount = Math.floor(40 * qualityMult);
                spreadSize = 250;
                starLife = 2000;
                break;
            case 'willow':
                starCount = Math.floor(80 * qualityMult);
                spreadSize = 180;
                starLife = 3000;
                break;
            case 'strobe':
                starCount = Math.floor(70 * qualityMult);
                spreadSize = 160;
                starLife = 1500;
                break;
        }

        const shell: Shell = {
            x: x * canvas.width,
            y: canvas.height,
            targetY: y * canvas.height,
            vx: randomRange(-2, 2),
            vy: -randomRange(15, 22),
            size: 3,
            color,
            type,
            starCount,
            spreadSize,
            starLife,
            burst: false,
        };

        shellsRef.current.push(shell);
        playSound('lift');
    }, [config.shellType, getQualityMultiplier, playSound]);

    // 烟花爆炸
    const explodeShell = useCallback((shell: Shell) => {
        const { x, y, color, type, starCount, spreadSize, starLife } = shell;
        playSound('burst');

        for (let i = 0; i < starCount; i++) {
            let angle: number, speed: number;

            if (type === 'ring') {
                angle = (i / starCount) * Math.PI * 2;
                speed = spreadSize / 15;
            } else {
                angle = Math.random() * Math.PI * 2;
                speed = Math.random() * spreadSize / 12;
            }

            const star: Star = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: type === 'palm' ? PRESETS.colors.Gold : color,
                secondColor: Math.random() < 0.3 ? randomColor() : undefined,
                life: starLife + randomRange(-200, 200),
                maxLife: starLife,
                size: type === 'palm' ? 2.5 : randomRange(1.5, 3),
                sparkFreq: type === 'palm' ? 0.8 : 0.1,
                sparkLife: 400,
                strobe: type === 'strobe',
                strobeFreq: 60,
                glitter: type === 'willow' || type === 'palm',
                glitterSize: 0.8,
                trail: [],
                trailLength: type === 'willow' ? 15 : type === 'palm' ? 10 : 5,
            };

            starsRef.current.push(star);
        }
    }, [playSound]);

    // 点击发射
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (showWelcome) return;
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvas.width;
        const y = (e.clientY - rect.top) / canvas.height;
        createShell(x, y);
    }, [createShell, showWelcome]);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    // 主渲染循环
    useEffect(() => {
        if (showWelcome) return;

        const mainCanvas = mainCanvasRef.current;
        const trailsCanvas = trailsCanvasRef.current;
        if (!mainCanvas || !trailsCanvas || !containerRef.current) return;

        const mainCtx = mainCanvas.getContext('2d');
        const trailsCtx = trailsCanvas.getContext('2d');
        if (!mainCtx || !trailsCtx) return;

        let rafId: number;
        const gravity = 0.15;

        const resize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            mainCanvas.width = trailsCanvas.width = clientWidth;
            mainCanvas.height = trailsCanvas.height = clientHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const loop = (timestamp: number) => {
            const delta = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;
            const simSpeed = Math.min(delta / 16.67, 2);

            // 清除主画布
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

            // 轨迹画布淡出
            trailsCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            trailsCtx.fillRect(0, 0, trailsCanvas.width, trailsCanvas.height);

            // 天空照明
            if (config.skyLighting && starsRef.current.length > 0) {
                const skyAlpha = Math.min(0.25, starsRef.current.length * 0.0015);
                skyColorRef.current.r = Math.min(30, skyColorRef.current.r + 1);
                skyColorRef.current.g = Math.min(20, skyColorRef.current.g + 0.5);
                skyColorRef.current.b = Math.min(40, skyColorRef.current.b + 1);

                trailsCtx.fillStyle = `rgba(${skyColorRef.current.r}, ${skyColorRef.current.g}, ${skyColorRef.current.b}, ${skyAlpha})`;
                trailsCtx.fillRect(0, 0, trailsCanvas.width, trailsCanvas.height);
            } else {
                skyColorRef.current = { r: 0, g: 0, b: 0 };
            }

            // 自动发射
            if (config.autoLaunch) {
                autoLaunchTimerRef.current += delta;
                const interval = config.finaleMode ? 150 : 1500 + Math.random() * 1000;
                if (autoLaunchTimerRef.current > interval) {
                    const x = 0.2 + Math.random() * 0.6;
                    const y = 0.2 + Math.random() * 0.3;
                    createShell(x, y);
                    autoLaunchTimerRef.current = 0;
                }
            }

            // 更新 shells
            for (let i = shellsRef.current.length - 1; i >= 0; i--) {
                const shell = shellsRef.current[i];
                shell.x += shell.vx * simSpeed;
                shell.y += shell.vy * simSpeed;
                shell.vy += gravity * 0.5 * simSpeed;

                // 绘制上升轨迹
                trailsCtx.fillStyle = shell.color;
                trailsCtx.globalAlpha = 0.8;
                trailsCtx.beginPath();
                trailsCtx.arc(shell.x, shell.y, shell.size, 0, Math.PI * 2);
                trailsCtx.fill();

                // 光晕
                const gradient = mainCtx.createRadialGradient(shell.x, shell.y, 0, shell.x, shell.y, shell.size * 3);
                gradient.addColorStop(0, shell.color);
                gradient.addColorStop(1, 'transparent');
                mainCtx.fillStyle = gradient;
                mainCtx.globalAlpha = 0.5;
                mainCtx.beginPath();
                mainCtx.arc(shell.x, shell.y, shell.size * 3, 0, Math.PI * 2);
                mainCtx.fill();

                // 爆炸条件
                if (shell.y <= shell.targetY || shell.vy >= 0) {
                    explodeShell(shell);
                    shellsRef.current.splice(i, 1);
                }
            }

            mainCtx.globalAlpha = 1;
            trailsCtx.globalAlpha = 1;

            // 更新 stars
            for (let i = starsRef.current.length - 1; i >= 0; i--) {
                const star = starsRef.current[i];
                star.life -= delta;

                if (star.life <= 0) {
                    starsRef.current.splice(i, 1);
                    continue;
                }

                // 更新尾迹
                star.trail.push({ x: star.x, y: star.y });
                if (star.trail.length > star.trailLength) star.trail.shift();

                // 物理更新
                star.x += star.vx * simSpeed;
                star.y += star.vy * simSpeed;
                star.vy += gravity * simSpeed;
                star.vx *= 0.985;
                star.vy *= 0.985;

                const lifeRatio = star.life / star.maxLife;
                const alpha = lifeRatio > 0.5 ? 1 : lifeRatio * 2;
                const currentColor = star.secondColor && lifeRatio < 0.5 ? star.secondColor : star.color;

                // 闪烁效果
                if (star.strobe && Math.floor(timestamp / star.strobeFreq) % 2 === 0) {
                    continue;
                }

                // 绘制尾迹
                if (star.trail.length > 1) {
                    trailsCtx.strokeStyle = currentColor;
                    trailsCtx.lineWidth = star.size * 0.5;
                    trailsCtx.lineCap = 'round';
                    trailsCtx.beginPath();
                    trailsCtx.moveTo(star.trail[0].x, star.trail[0].y);
                    for (let j = 1; j < star.trail.length; j++) {
                        trailsCtx.globalAlpha = (j / star.trail.length) * alpha * 0.5;
                        trailsCtx.lineTo(star.trail[j].x, star.trail[j].y);
                    }
                    trailsCtx.stroke();
                }

                // 绘制星星
                mainCtx.globalAlpha = alpha;
                const starGradient = mainCtx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
                starGradient.addColorStop(0, '#ffffff');
                starGradient.addColorStop(0.3, currentColor);
                starGradient.addColorStop(1, 'transparent');
                mainCtx.fillStyle = starGradient;
                mainCtx.beginPath();
                mainCtx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                mainCtx.fill();

                // Glitter 效果
                if (star.glitter && Math.random() < star.sparkFreq) {
                    const spark: Spark = {
                        x: star.x,
                        y: star.y,
                        vx: randomRange(-1, 1),
                        vy: randomRange(-1, 1),
                        life: star.sparkLife,
                        maxLife: star.sparkLife,
                        color: PRESETS.colors.Gold,
                        size: star.glitterSize,
                    };
                    sparksRef.current.push(spark);
                }
            }

            // 更新 sparks
            for (let i = sparksRef.current.length - 1; i >= 0; i--) {
                const spark = sparksRef.current[i];
                spark.life -= delta;

                if (spark.life <= 0) {
                    sparksRef.current.splice(i, 1);
                    continue;
                }

                spark.x += spark.vx * simSpeed;
                spark.y += spark.vy * simSpeed;
                spark.vy += gravity * 0.3 * simSpeed;

                const alpha = spark.life / spark.maxLife;
                mainCtx.globalAlpha = alpha;
                mainCtx.fillStyle = spark.color;
                mainCtx.beginPath();
                mainCtx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
                mainCtx.fill();
            }

            mainCtx.globalAlpha = 1;
            trailsCtx.globalAlpha = 1;

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [showWelcome, config, createShell, explodeShell]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 轨迹画布 */}
            {!showWelcome && (
                <canvas
                    ref={trailsCanvasRef}
                    className="absolute inset-0 z-10 block"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* 主画布 */}
            {!showWelcome && (
                <canvas
                    ref={mainCanvasRef}
                    onClick={handleClick}
                    className="absolute inset-0 z-20 block cursor-crosshair"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* 祝福语显示 */}
            {!showWelcome && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4">
                    <div
                        className="text-xl md:text-2xl mb-4 font-serif tracking-widest"
                        style={{
                            color: 'rgba(255, 215, 0, 0.9)',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                        }}
                    >
                        {config.recipientName}
                    </div>
                    <h1
                        key={greetingIndex}
                        className="text-4xl md:text-6xl font-bold font-serif tracking-widest"
                        style={{
                            background: 'linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(255, 100, 100, 0.5))',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    >
                        {currentGreeting}
                    </h1>
                </div>
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-radial from-transparent to-black/80">
                    <div className="text-center px-4">
                        <div className="mb-8">
                            <span className="text-8xl md:text-9xl animate-bounce" style={{ filter: 'drop-shadow(0 0 40px rgba(255, 100, 100, 0.8))' }}>
                                💝
                            </span>
                        </div>

                        <div
                            className="text-2xl md:text-4xl mb-4 font-serif tracking-widest"
                            style={{
                                background: 'linear-gradient(to right, #ff6b6b, #feca57)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {config.recipientName}
                        </div>

                        <h1 className="text-white/70 text-lg md:text-xl mb-10 tracking-[0.2em]">
                            {config.customTitle}
                        </h1>

                        <button
                            onClick={startAnimation}
                            className="relative px-12 py-5 rounded-full text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)',
                                boxShadow: '0 0 40px rgba(255, 107, 107, 0.5)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3 text-white">
                                <span className="text-2xl">❤️</span>
                                点击开启专属烟花
                                <span className="text-2xl">❤️</span>
                            </span>
                            <div
                                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* 提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <div className="text-white/40 text-sm">
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

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .bg-gradient-radial {
                    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%);
                }
            `}</style>
        </div>
    );
}

export default function CustomFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
