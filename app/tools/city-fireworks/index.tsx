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
 * 城市烟花组件 - 唯美城市夜景烟花
 * 参考: 2024newyear 新年快乐烟花
 * 特点: 
 *   - 城市剪影背景 + 月亮光晕
 *   - 标签文字淡入淡出切换
 *   - 闪烁星空背景
 *   - 粒子烟花爆炸效果
 *   - 点击交互发射烟花
 * ==============================================================================
 */

export interface AppConfig {
    greetings: string[];
    textDisplayTime: number;
    starCount: number;
    autoLaunch: boolean;
    launchInterval: number;
    showMoon: boolean;
    showCityline: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('city-fireworks'),
    music: [
        { label: '浪漫新年', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '温暖钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultGreetings: [
        '亲爱的你',
        '2026 新年快乐',
        '新的一年也要发光发热',
        '健健康康，平安喜乐',
        '万事如意，心想事成',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    greetings: PRESETS.defaultGreetings,
    textDisplayTime: 3500,
    starCount: 100,
    autoLaunch: true,
    launchInterval: 250,
    showMoon: true,
    showCityline: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: 'rgba(0, 5, 24, 1)' },
        0
    ),
    bgValue: 'rgba(0, 5, 24, 1)',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const cityFireworksCardConfigMetadata = {
    panelTitle: '城市烟花配置',
    panelSubtitle: '点亮城市夜空的浪漫',
    configSchema: {
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语列表', placeholder: '输入祝福语', description: '每行一句，轮流展示' },

        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        launchInterval: { category: 'visual' as const, type: 'slider' as const, label: '发射间隔(ms)', min: 150, max: 500, step: 50 },
        textDisplayTime: { category: 'visual' as const, type: 'slider' as const, label: '文字展示时间(ms)', min: 2000, max: 6000, step: 500 },
        starCount: { category: 'visual' as const, type: 'slider' as const, label: '星星数量', min: 50, max: 200, step: 10 },
        showMoon: { category: 'visual' as const, type: 'switch' as const, label: '显示月亮' },
        showCityline: { category: 'visual' as const, type: 'switch' as const, label: '显示城市轮廓' },

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
        { id: 1, label: '祝福内容', icon: null, fields: ['greetings' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoLaunch' as const, 'launchInterval' as const, 'textDisplayTime' as const, 'starCount' as const, 'showMoon' as const, 'showCityline' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 工具函数
// ============================================================================
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

// ============================================================================
// 粒子类定义
// ============================================================================
interface Star {
    x: number;
    y: number;
    r: number;
}

interface Fragment {
    x: number;
    y: number;
    tx: number;
    ty: number;
    centerX: number;
    centerY: number;
    radius: number;
    color: { r: number; g: number; b: number };
    dead: boolean;
}

interface Boom {
    x: number;
    y: number;
    r: number;
    boomArea: { x: number; y: number };
    ba: number;
    dead: boolean;
    booms: Fragment[];
}

// ============================================================================
// 主组件
// ============================================================================
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const starsRef = useRef<Star[]>([]);
    const bigboomsRef = useRef<Boom[]>([]);
    const lastTimeRef = useRef<number>(0);

    const [currentLabel, setCurrentLabel] = useState('');
    const [labelVisible, setLabelVisible] = useState(false);

    const {
        isPlaying,
        isMuted,
        handlePlayPause: toggleMusic,
        handleToggleMute: toggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: config.enableSound,
        volume: 0.6,
    });

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 文字轮播效果
    useEffect(() => {
        const greetings = config.greetings;
        if (!greetings || greetings.length === 0) return;

        let index = 0;
        const showNextLabel = () => {
            setLabelVisible(false);
            setTimeout(() => {
                setCurrentLabel(greetings[index]);
                setLabelVisible(true);
                index = (index + 1) % greetings.length;
            }, 500);
        };

        showNextLabel();
        const interval = setInterval(showNextLabel, config.textDisplayTime);

        return () => clearInterval(interval);
    }, [config.greetings, config.textDisplayTime]);

    // 创建烟花爆炸
    const createBoom = useCallback((startX: number, targetX: number, targetY: number): Boom => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return {
                x: startX,
                y: 0,
                r: 2,
                boomArea: { x: targetX, y: targetY },
                ba: getRandom(80, 200),
                dead: false,
                booms: [],
            };
        }

        return {
            x: startX,
            y: canvas.height + 2,
            r: 2,
            boomArea: { x: targetX, y: targetY },
            ba: getRandom(80, 200),
            dead: false,
            booms: [],
        };
    }, []);

    // 创建爆炸碎片
    const createFragments = useCallback((boom: Boom) => {
        const fragNum = getRandom(100, 300);
        const style = getRandom(0, 10) >= 5 ? 1 : 2;
        let baseColor = style === 1 ? {
            r: Math.floor(getRandom(128, 255)),
            g: Math.floor(getRandom(128, 255)),
            b: Math.floor(getRandom(128, 255)),
        } : null;

        const fragments: Fragment[] = [];
        for (let i = 0; i < fragNum; i++) {
            const color = style === 2 ? {
                r: Math.floor(getRandom(128, 255)),
                g: Math.floor(getRandom(128, 255)),
                b: Math.floor(getRandom(128, 255)),
            } : baseColor!;

            const angle = getRandom(-Math.PI, Math.PI);
            const dist = getRandom(0, fragNum);
            const tx = dist * Math.cos(angle) + boom.x;
            const ty = dist * Math.sin(angle) + boom.y;

            fragments.push({
                x: boom.x,
                y: boom.y,
                tx,
                ty,
                centerX: boom.x,
                centerY: boom.y,
                radius: getRandom(0, 2),
                color,
                dead: false,
            });
        }

        return fragments;
    }, []);

    // 点击发射烟花
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const startX = getRandom(canvas.width / 3, (canvas.width * 2) / 3);
        const boom = createBoom(startX, x, y);
        bigboomsRef.current.push(boom);
    }, [createBoom]);

    // 主渲染循环
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        // 初始化星星
        starsRef.current = [];
        for (let i = 0; i < config.starCount; i++) {
            const r = Math.random() * 1.5;
            starsRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 2 - canvas.height,
                r,
            });
        }

        const loop = (timestamp: number) => {
            const width = canvas.width;
            const height = canvas.height;

            // 清除画布（带拖尾效果）
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = 0.1;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            // 绘制星星
            starsRef.current.forEach(star => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.r})`;
                ctx.fill();
                ctx.restore();
            });

            // 绘制月亮
            if (config.showMoon) {
                const moonX = width - 200;
                const moonY = 100;
                const moonR = 40;

                // 月亮本体
                ctx.save();
                ctx.beginPath();
                ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
                const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR);
                moonGradient.addColorStop(0, 'rgba(255, 255, 240, 1)');
                moonGradient.addColorStop(0.5, 'rgba(255, 245, 200, 0.9)');
                moonGradient.addColorStop(1, 'rgba(255, 235, 150, 0.7)');
                ctx.fillStyle = moonGradient;
                ctx.fill();
                ctx.restore();

                // 月亮光晕
                for (let i = 0; i < 10; i++) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(moonX, moonY, moonR + i * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(240, 219, 120, 0.015)';
                    ctx.fill();
                    ctx.restore();
                }
            }

            // 自动发射烟花
            if (config.autoLaunch) {
                if (timestamp - lastTimeRef.current > config.launchInterval + (height - 767) / 2) {
                    const x = getRandom(width / 5, (width * 4) / 5);
                    const y = getRandom(50, height * 0.3);
                    const startX = getRandom(width / 3, (width * 2) / 3);
                    const boom = createBoom(startX, x, y);
                    bigboomsRef.current.push(boom);
                    lastTimeRef.current = timestamp;
                }
            }

            // 更新和绘制烟花
            for (let i = bigboomsRef.current.length - 1; i >= 0; i--) {
                const boom = bigboomsRef.current[i];

                if (!boom.dead) {
                    // 移动烟花弹
                    const dx = boom.boomArea.x - boom.x;
                    const dy = boom.boomArea.y - boom.y;
                    boom.x += dx * 0.01;
                    boom.y += dy * 0.01;

                    // 绘制烟花弹
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(boom.x, boom.y, boom.r, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFF';
                    ctx.fill();
                    ctx.restore();

                    // 绘制光晕
                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 228, 150, 0.3)';
                    ctx.beginPath();
                    ctx.arc(boom.x, boom.y, boom.r + 3 * Math.random() + 1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // 检查是否到达目标
                    if (Math.abs(dx) <= boom.ba && Math.abs(dy) <= boom.ba) {
                        boom.dead = true;
                        boom.booms = createFragments(boom);
                    }
                } else {
                    // 更新碎片
                    let allDead = true;
                    for (let j = boom.booms.length - 1; j >= 0; j--) {
                        const frag = boom.booms[j];
                        if (!frag.dead) {
                            allDead = false;

                            // 添加重力
                            frag.ty += 0.3;

                            // 移动碎片
                            const fdx = frag.tx - frag.x;
                            const fdy = frag.ty - frag.y;
                            frag.x = Math.abs(fdx) < 0.1 ? frag.tx : frag.x + fdx * 0.1;
                            frag.y = Math.abs(fdy) < 0.1 ? frag.ty : frag.y + fdy * 0.1;

                            // 检查是否消亡
                            if (fdx === 0 && Math.abs(fdy) <= 80) {
                                frag.dead = true;
                            }

                            // 绘制碎片
                            ctx.fillStyle = `rgba(${frag.color.r}, ${frag.color.g}, ${frag.color.b}, 1)`;
                            ctx.fillRect(frag.x - frag.radius, frag.y - frag.radius, frag.radius * 2, frag.radius * 2);
                        }
                    }

                    // 移除已完成的烟花
                    if (allDead || boom.booms.length === 0) {
                        bigboomsRef.current.splice(i, 1);
                    }
                }
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.autoLaunch, config.launchInterval, config.starCount, config.showMoon, createBoom, createFragments]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none" style={{ backgroundColor: 'rgba(0, 5, 24, 1)' }}>
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 烟花Canvas */}
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                className="absolute inset-0 z-10 block cursor-crosshair"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 文字标签层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div
                    className={`text-center transition-all duration-500 ease-in-out transform ${labelVisible ? 'opacity-100 scale-125' : 'opacity-0 scale-100'
                        }`}
                    style={{
                        color: '#daf6ff',
                        textShadow: '0 0 20px #0aafe6, 0 0 40px rgba(10, 175, 230, 0.5)',
                        fontWeight: 'bold',
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                    }}
                >
                    {currentLabel}
                </div>
            </div>

            {/* 城市剪影 */}
            {config.showCityline && (
                <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                    <svg viewBox="0 0 1200 200" className="w-full h-auto" style={{ maxHeight: '25vh' }}>
                        <defs>
                            <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(30, 30, 50, 0.9)" />
                                <stop offset="100%" stopColor="rgba(10, 10, 30, 1)" />
                            </linearGradient>
                        </defs>
                        {/* 城市轮廓 */}
                        <path
                            fill="url(#cityGradient)"
                            d="M0,200 L0,150 L30,150 L30,120 L50,120 L50,100 L70,100 L70,80 L90,80 L90,100 L110,100 L110,70 L130,70 L130,90 L150,90 L150,60 L170,60 L170,90 L190,90 L190,110 L210,110 L210,80 L230,80 L230,50 L250,50 L250,80 L270,80 L270,100 L290,100 L290,70 L310,70 L310,40 L330,40 L330,70 L350,70 L350,90 L370,90 L370,60 L390,60 L390,80 L410,80 L410,100 L430,100 L430,70 L450,70 L450,50 L470,50 L470,30 L490,30 L490,60 L510,60 L510,80 L530,80 L530,100 L550,100 L550,120 L570,120 L570,90 L590,90 L590,60 L610,60 L610,40 L630,40 L630,70 L650,70 L650,90 L670,90 L670,110 L690,110 L690,80 L710,80 L710,100 L730,100 L730,70 L750,70 L750,50 L770,50 L770,80 L790,80 L790,100 L810,100 L810,120 L830,120 L830,90 L850,90 L850,60 L870,60 L870,80 L890,80 L890,100 L910,100 L910,70 L930,70 L930,90 L950,90 L950,110 L970,110 L970,130 L990,130 L990,100 L1010,100 L1010,80 L1030,80 L1030,100 L1050,100 L1050,120 L1070,120 L1070,90 L1090,90 L1090,110 L1110,110 L1110,130 L1130,130 L1130,150 L1150,150 L1150,170 L1170,170 L1170,150 L1200,150 L1200,200 Z"
                        />
                        {/* 窗户灯光 */}
                        {Array.from({ length: 50 }).map((_, i) => (
                            <rect
                                key={i}
                                x={30 + (i % 25) * 45 + Math.random() * 20}
                                y={80 + Math.floor(i / 25) * 40 + Math.random() * 30}
                                width={3 + Math.random() * 4}
                                height={4 + Math.random() * 6}
                                fill={Math.random() > 0.3 ? 'rgba(255, 220, 100, 0.8)' : 'rgba(100, 200, 255, 0.6)'}
                                style={{
                                    animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </svg>
                </div>
            )}

            {/* 点击提示 */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
                <div className="text-white/50 text-sm animate-bounce">
                    ✨ 点击夜空放烟花 ✨
                </div>
            </div>

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

            {/* CSS动画 */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default function CityFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
