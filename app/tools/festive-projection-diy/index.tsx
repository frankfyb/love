'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和工具函数
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    Particle,
    getStickers,
    createParticle,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { festiveProjectionDiyConfigMetadata } from './config';

/**
 * ==============================================================================
 * StickerCanvas 组件 - 贴纸雨动画
 * ==============================================================================
 */

function StickerCanvas({
    speed,
    density,
    style
}: {
    speed: number;
    density: number;
    style: 'festive' | 'romantic' | 'mixed';
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const spawnTimerRef = useRef<number>(0);

    const stickers = useMemo(() => getStickers(style), [style]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const isMobile = window.innerWidth < 768;
        const maxParticles = Math.floor(density * (isMobile ? 0.7 : 1.2));
        const spawnRate = Math.max(1, Math.floor(12 - speed));

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        const speedFactor = speed / 5;

        const animate = () => {
            if (!ctx || !canvas) return;

            const width = window.innerWidth;
            const height = window.innerHeight;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.clearRect(0, 0, width, height);

            spawnTimerRef.current++;
            if (spawnTimerRef.current >= spawnRate && particlesRef.current.length < maxParticles) {
                spawnTimerRef.current = 0;
                const spawnCount = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < spawnCount; i++) {
                    particlesRef.current.push(createParticle(width, height, stickers, isMobile));
                }
            }

            const sortedParticles = [...particlesRef.current].sort((a, b) => b.layer - a.layer);

            sortedParticles.forEach((p) => {
                const originalIdx = particlesRef.current.indexOf(p);

                p.life++;
                const lifeProgress = p.life / p.maxLife;

                // 缩放动画
                if (lifeProgress < 0.1) {
                    p.scale = 0.3 + (p.targetScale - 0.3) * (lifeProgress / 0.1);
                } else if (lifeProgress > 0.7) {
                    p.scale = p.targetScale * (1 - (lifeProgress - 0.7) / 0.3);
                } else {
                    p.scale = p.targetScale;
                }

                // 透明度动画
                if (lifeProgress < 0.1) {
                    p.opacity = lifeProgress / 0.1;
                } else if (lifeProgress > 0.75) {
                    p.opacity = (1 - lifeProgress) / 0.25;
                } else {
                    p.opacity = 1;
                }

                const layerOpacity = [1, 0.9, 0.7][p.layer];
                p.opacity *= layerOpacity;

                p.x += p.vx * speedFactor;
                p.y += p.vy * speedFactor;
                p.vy += 0.02;
                p.vx *= 0.995;
                p.vy *= 0.995;
                p.rotation += p.rotationSpeed;

                if (p.life > p.maxLife || p.x > width + 100 || p.y > height + 100 || p.x < -100 || p.y < -100) {
                    particlesRef.current.splice(originalIdx, 1);
                    return;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.scale(p.scale, p.scale);

                if (p.isText) {
                    ctx.font = `bold ${p.size}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = p.size * 0.6;
                    ctx.fillStyle = p.color;
                    ctx.fillText(p.content, 0, 0);
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = 'rgba(139, 0, 0, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.strokeText(p.content, 0, 0);
                    ctx.fillText(p.content, 0, 0);
                } else {
                    ctx.font = `${p.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
                    ctx.shadowBlur = p.size * 0.5;
                    ctx.fillText(p.content, 0, 0);
                    ctx.shadowBlur = p.size * 0.3;
                    ctx.fillText(p.content, 0, 0);
                }

                ctx.restore();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [speed, density, stickers]);

    useEffect(() => {
        particlesRef.current = [];
    }, [style]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
    );
}

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
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

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none font-sans">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 70% 100%, rgba(255,100,100,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, rgba(100,100,255,0.1) 0%, transparent 50%)',
                    }}
                />
            </div>

            {/* 2. 光束效果层 */}
            <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,250,220,0.12) 20%, rgba(255,245,200,0.05) 40%, transparent 60%)',
                        filter: 'blur(30px)',
                    }}
                />
                <div
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,200,100,0.3) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            {/* 3. 左上角装饰元素 */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-30">
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none filter drop-shadow-2xl">
                        <span className="block transform scale-x-[-1] animate-bounce" style={{ animationDuration: '3s' }}>👧</span>
                        <span className="absolute bottom-0 right-[-20px] sm:right-[-30px] text-3xl sm:text-4xl md:text-5xl animate-pulse transform rotate-45">🧨</span>
                        <span className="absolute bottom-2 right-[-35px] sm:right-[-45px] text-lg sm:text-xl md:text-2xl animate-ping">✨</span>
                        <span className="absolute bottom-6 right-[-30px] sm:right-[-38px] text-sm sm:text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</span>
                    </div>
                    <div
                        className="absolute -bottom-4 sm:-bottom-5 -right-1 sm:-right-2 text-base sm:text-lg md:text-xl font-bold text-yellow-300 bg-red-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border-2 border-yellow-400 shadow-lg whitespace-nowrap"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                    >
                        2026
                    </div>
                </div>
            </div>

            {/* 4. 贴纸雨Canvas */}
            <StickerCanvas
                speed={config.streamSpeed}
                density={config.stickerDensity}
                style={config.stickerStyle}
            />

            {/* 5. 人物照片 - 右下角 */}
            <div className="absolute bottom-0 right-0 w-[65%] sm:w-[60%] md:w-[55%] lg:w-[50%] h-[55%] sm:h-[60%] md:h-[65%] lg:h-[70%] z-15 flex items-end justify-end pointer-events-none">
                <div
                    className="absolute bottom-[-5%] right-[-5%] w-[35vh] sm:w-[40vh] md:w-[45vh] h-[35vh] sm:h-[40vh] md:h-[45vh] rounded-full border border-yellow-200/20 opacity-50"
                    style={{ borderStyle: 'dashed', animation: 'spin 60s linear infinite reverse' }}
                />
                <div
                    className="absolute bottom-[-8%] right-[-8%] w-[28vh] sm:w-[32vh] md:w-[36vh] h-[28vh] sm:h-[32vh] md:h-[36vh] rounded-full border border-pink-200/15 opacity-40"
                    style={{ borderStyle: 'dotted', animation: 'spin 45s linear infinite' }}
                />

                {config.userPhoto && (
                    <div className="relative w-full h-full flex items-end justify-end">
                        <img
                            src={config.userPhoto}
                            alt="User"
                            className="relative z-10 max-h-[98%] max-w-full object-contain"
                            style={{
                                filter: 'drop-shadow(0 0 40px rgba(255, 200, 150, 0.5)) drop-shadow(0 0 20px rgba(255, 150, 100, 0.3))',
                                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                            }}
                        />
                        <div className="absolute bottom-16 sm:bottom-20 right-12 sm:right-16 md:right-20 text-2xl sm:text-3xl md:text-4xl animate-bounce" style={{ animationDuration: '2s' }}>✨</div>
                        <div className="absolute bottom-28 sm:bottom-36 md:bottom-40 right-20 sm:right-28 md:right-36 text-xl sm:text-2xl md:text-3xl animate-pulse">✨</div>
                        <div className="absolute top-1/3 right-1/4 text-lg sm:text-xl md:text-2xl animate-ping opacity-70">💫</div>
                        <div className="absolute top-1/2 right-1/3 text-base sm:text-lg animate-pulse opacity-60">⭐</div>
                    </div>
                )}
            </div>

            {/* 6. 祝福文字 - 左下角 */}
            <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 left-3 sm:left-6 md:left-8 z-30 text-white max-w-[50%] sm:max-w-[45%] md:max-w-[40%]">
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-1 sm:mb-2 md:mb-3"
                    style={{
                        fontFamily: '"Noto Serif SC", "Ma Shan Zheng", "STKaiti", serif',
                        textShadow: '0 4px 25px rgba(0,0,0,0.7), 0 0 50px rgba(255,200,100,0.5), 0 0 80px rgba(255,150,50,0.3)',
                        lineHeight: 1.2,
                    }}
                >
                    {config.greetingText}
                </h1>
                <p
                    className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-light tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.18em] text-yellow-100/90 flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap"
                    style={{ textShadow: '0 2px 15px rgba(0,0,0,0.6)' }}
                >
                    <span className="w-4 sm:w-6 md:w-10 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent to-yellow-200/60"></span>
                    <span className="whitespace-nowrap">{config.subText}</span>
                    <span className="w-4 sm:w-6 md:w-10 h-[1px] sm:h-[2px] bg-gradient-to-l from-transparent to-yellow-200/60"></span>
                </p>
            </div>

            {/* 7. 音频控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 全局动画样式 */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default function FestiveProjectionDiyPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
