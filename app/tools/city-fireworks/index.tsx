'use client';

/**
 * city-fireworks - 重构版本
 * 使用共享烟花引擎，保留城市剪影和月亮等独特视觉效果
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 使用共享引擎
import { FireworksEngine } from '@/engines/fireworks';

// 导入配置
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    cityFireworksCardConfigMetadata,
} from './config';

// 重新导出配置
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS, cityFireworksCardConfigMetadata };

// ============================================================================
// 星空背景组件
// ============================================================================

interface Star {
    x: number;
    y: number;
    r: number;
}

function StarField({ count, containerRef }: { count: number; containerRef: React.RefObject<HTMLDivElement | null> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);

    useEffect(() => {
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
                const r = Math.random() * 1.5;
                starsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 2 - canvas.height,
                    r,
                });
            }
        };

        resize();
        window.addEventListener('resize', resize);

        let rafId: number;
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制星星
            starsRef.current.forEach(star => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.r})`;
                ctx.fill();
                ctx.restore();
            });

            rafId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [count, containerRef]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<FireworksEngine | null>(null);

    const [currentLabel, setCurrentLabel] = useState('');
    const [labelVisible, setLabelVisible] = useState(false);

    // 音频控制
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

    // 背景配置
    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
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

    // 初始化烟花引擎
    useEffect(() => {
        if (!canvasRef.current) return;

        engineRef.current = new FireworksEngine({
            canvas: canvasRef.current,
            shellSize: 2,
            shellType: 'Random',
            autoLaunch: config.autoLaunch,
            autoLaunchInterval: { min: config.launchInterval, max: config.launchInterval + 1000 },
            enableSound: config.enableSound && !isMuted,
            soundVolume: 0.5,
            showSkyLighting: false,
        });

        engineRef.current.start();

        return () => {
            engineRef.current?.dispose();
        };
    }, [config.autoLaunch, config.launchInterval, config.enableSound, isMuted]);

    // 配置同步
    useEffect(() => {
        engineRef.current?.setAutoLaunch(config.autoLaunch);
    }, [config.autoLaunch]);

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setAutoLaunchInterval(config.launchInterval, config.launchInterval + 1000);
        }
    }, [config.launchInterval]);

    useEffect(() => {
        engineRef.current?.setSoundEnabled(config.enableSound && !isMuted);
    }, [config.enableSound, isMuted]);

    // 点击发射烟花
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!engineRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        engineRef.current.launchAt(x, y);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none" style={{ backgroundColor: 'rgba(0, 5, 24, 1)' }}>
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 星空层 */}
            <div className="absolute inset-0 z-5">
                <StarField count={config.starCount} containerRef={containerRef} />
            </div>

            {/* 月亮层 */}
            {config.showMoon && (
                <div className="absolute inset-0 z-8 pointer-events-none">
                    <svg className="w-full h-full">
                        <defs>
                            <radialGradient id="moonGradient">
                                <stop offset="0%" stopColor="rgba(255, 255, 240, 1)" />
                                <stop offset="50%" stopColor="rgba(255, 245, 200, 0.9)" />
                                <stop offset="100%" stopColor="rgba(255, 235, 150, 0.7)" />
                            </radialGradient>
                        </defs>
                        {/* 月亮光晕 */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <circle
                                key={`halo-${i}`}
                                cx="calc(100% - 200px)"
                                cy="100"
                                r={40 + i * 3}
                                fill="rgba(240, 219, 120, 0.015)"
                            />
                        ))}
                        {/* 月亮本体 */}
                        <circle
                            cx="calc(100% - 200px)"
                            cy="100"
                            r="40"
                            fill="url(#moonGradient)"
                        />
                    </svg>
                </div>
            )}

            {/* 烟花Canvas */}
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                className="absolute inset-0 z-10 block cursor-crosshair"
                style={{ width: '100%', height: '100%', mixBlendMode: 'lighten' }}
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
