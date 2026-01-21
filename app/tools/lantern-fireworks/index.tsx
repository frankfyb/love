'use client';

/**
 * lantern-fireworks - 重构版本
 * 使用共享烟花引擎，保留独特的孔明灯漂浮效果
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { random } from '@/lib/utils';

// 使用共享烟花引擎
import { FireworksEngine } from '@/engines/fireworks';

// 导入配置
import {
    WishItem,
    AppConfig,
    DEFAULT_CONFIG,
    DEFAULT_WISHES,
    PRESETS,
    lanternFireworksConfigMetadata,
} from './config';

// 重新导出配置
export type { WishItem, AppConfig };
export { DEFAULT_CONFIG, DEFAULT_WISHES, PRESETS, lanternFireworksConfigMetadata };

// ============================================================================
// 孔明灯接口
// ============================================================================

interface Lantern {
    x: number;
    y: number;
    scale: number;
    baseSpeed: number;
    phase: number;
    swayAmplitude: number;
    swaySpeed: number;
    rotationPhase: number;
    wish: WishItem;
    glowPhase: number;
    birthTime: number;
}

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkleSpeed: number;
    phase: number;
}

// ============================================================================
// 主显示组件
// ============================================================================

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const fireworkCanvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FireworksEngine | null>(null);

    const [lanterns, setLanterns] = useState<Lantern[]>([]);
    const [stars, setStars] = useState<Star[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [activeWish, setActiveWish] = useState<WishItem | null>(null);
    const [showWish, setShowWish] = useState(false);

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
        if (!fireworkCanvasRef.current || showWelcome) return;

        const interval = 3000 / config.fireworkDensity;

        engineRef.current = new FireworksEngine({
            canvas: fireworkCanvasRef.current,
            shellSize: 2,
            shellType: 'Random',
            autoLaunch: true,
            autoLaunchInterval: { min: interval * 0.5, max: interval * 1.5 },
            enableSound: config.enableSound && !isMuted,
            soundVolume: 0.4,
            showSkyLighting: false,
        });

        engineRef.current.start();

        const handleResize = () => {
            engineRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            engineRef.current?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [showWelcome, config.fireworkDensity, config.enableSound, isMuted]);

    // 配置同步
    useEffect(() => {
        if (engineRef.current) {
            const interval = 3000 / config.fireworkDensity;
            engineRef.current.setAutoLaunchInterval(interval * 0.5, interval * 1.5);
        }
    }, [config.fireworkDensity]);

    useEffect(() => {
        engineRef.current?.setSoundEnabled(config.enableSound && !isMuted);
    }, [config.enableSound, isMuted]);

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

    // 更新孔明灯位置
    useEffect(() => {
        if (lanterns.length === 0) return;

        const interval = setInterval(() => {
            const now = Date.now();

            setLanterns(prev => prev.map(lantern => {
                let { x, y, scale, baseSpeed, phase, swayAmplitude, swaySpeed, rotationPhase, glowPhase, birthTime } = lantern;

                const flightTime = (now - birthTime) / 1000;
                const speedMultiplier = Math.min(1, flightTime / 3);
                const currentSpeed = baseSpeed * (0.5 + speedMultiplier * 0.5);

                y -= currentSpeed;
                phase += swaySpeed;
                const sway = Math.sin(phase) * swayAmplitude;
                x += sway * 0.1;
                x += Math.sin(phase * 0.3) * 0.02;
                rotationPhase += 0.02;
                glowPhase += 0.03;

                if (y < 80) {
                    const distanceFactor = (80 - y) / 80;
                    scale = lantern.scale * (1 - distanceFactor * 0.4);
                    scale = Math.max(0.3, scale);
                }

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

    // 星星闪烁
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
        if (!engineRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        engineRef.current.launchAt(x, y);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
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
            {!showWelcome && (
                <canvas
                    ref={fireworkCanvasRef}
                    className="absolute inset-0 z-10 w-full h-full cursor-crosshair"
                    style={{ mixBlendMode: 'lighten' }}
                    onClick={handleCanvasClick}
                />
            )}

            {/* 4. 孔明灯层 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {lanterns.map((lantern, i) => {
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
                                <path
                                    fill={`url(#lanternGrad${i})`}
                                    d="M47.7,61.6c0,2.6-6.3,5.6-14.7,5.6s-14.7-2.9-14.7-5.6c0-2.6,6.3-5.6,14.7-5.6S47.7,58.9,47.7,61.6z
                   M26.4,0C19.2,0-1.5,15.1,0.1,21.4C1.6,27.7,15.4,62,15.4,62s0.1,0.1,0.2,0.3c-0.1-0.3-0.1-0.5-0.1-0.8
                   c0-4.7,7.5-8.3,17.4-8.3c9.9,0,17.4,3.6,17.4,8.3c0,0.1,0,0.2,0,0.2c2-3.6,10.9-33.1,11.9-42.7C63.3,9.3,34.2,0,26.4,0z"
                                />
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

export default function LanternFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
