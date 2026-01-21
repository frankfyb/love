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
    DEFAULT_PHOTOS,
    PhotoTileData,
    FloatingHeart,
    generatePhotoTiles,
    drawHeart,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { photoPlanetConfigMetadata } from './config';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const timeRef = useRef(0);

    // 音效控制
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

    // 生成球面上照片瓦片的3D位置
    const photoTiles = useMemo((): PhotoTileData[] => {
        return generatePhotoTiles(config.photos, config.sphereSize);
    }, [config.photos, config.sphereSize]);

    // 球体旋转动画
    useEffect(() => {
        let animationId: number;

        const animate = () => {
            setRotation(prev => prev + config.rotationSpeed * 0.3);
            animationId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationId);
    }, [config.rotationSpeed]);

    // 漂浮爱心Canvas动画
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current || !config.showHearts) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const hearts: FloatingHeart[] = [];

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let heartTimer = 0;

        const loop = () => {
            timeRef.current++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            heartTimer++;
            if (heartTimer >= 25 && hearts.length < 25) {
                hearts.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height + 30,
                    size: Math.random() * 20 + 12,
                    alpha: Math.random() * 0.6 + 0.3,
                    vy: -Math.random() * 2 - 1,
                    vx: (Math.random() - 0.5) * 0.8,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.03,
                });
                heartTimer = 0;
            }

            for (let i = hearts.length - 1; i >= 0; i--) {
                const heart = hearts[i];
                heart.x += heart.vx + Math.sin(timeRef.current * 0.02 + i) * 0.5;
                heart.y += heart.vy;
                heart.rotation += heart.rotationSpeed;

                if (heart.y < -50) {
                    heart.alpha -= 0.02;
                }

                drawHeart(ctx, heart.x, heart.y, heart.size, config.heartColor, heart.alpha, heart.rotation);

                if (heart.alpha <= 0 || heart.y < -100) {
                    hearts.splice(i, 1);
                }
            }

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.showHearts, config.heartColor]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden select-none"
            style={{ background: '#000000' }}
        >
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 漂浮爱心Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 w-full h-full pointer-events-none"
            />

            {/* 3. 3D照片星球 */}
            <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ perspective: '1000px' }}>
                <div
                    className="relative"
                    style={{
                        width: `${config.sphereSize}px`,
                        height: `${config.sphereSize}px`,
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${rotation}deg) rotateX(-15deg)`,
                    }}
                >
                    {/* 球体发光背景 */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: '100%',
                            height: '100%',
                            background: `radial-gradient(circle at 30% 30%, 
                                rgba(255, 105, 180, ${0.4 * config.glowIntensity}) 0%, 
                                rgba(255, 105, 180, ${0.15 * config.glowIntensity}) 40%, 
                                transparent 70%)`,
                            boxShadow: `
                                0 0 ${80 * config.glowIntensity}px rgba(255, 105, 180, ${0.5 * config.glowIntensity}),
                                inset 0 0 ${60 * config.glowIntensity}px rgba(255, 105, 180, ${0.3 * config.glowIntensity})
                            `,
                            transform: 'translateZ(0)',
                        }}
                    />

                    {/* 照片瓦片 */}
                    {photoTiles.map((tile) => (
                        <div
                            key={tile.id}
                            className="absolute overflow-hidden rounded-lg"
                            style={{
                                width: '70px',
                                height: '70px',
                                left: '50%',
                                top: '50%',
                                marginLeft: '-35px',
                                marginTop: '-35px',
                                transformStyle: 'preserve-3d',
                                transform: `
                                    rotateY(${tile.rotateY}deg) 
                                    rotateX(${tile.rotateX}deg) 
                                    translateZ(${tile.translateZ}px)
                                `,
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={tile.photo}
                                alt={`Photo ${tile.id + 1}`}
                                className="w-full h-full object-cover"
                                style={{
                                    boxShadow: `0 0 ${15 * config.glowIntensity}px rgba(255, 105, 180, ${0.5 * config.glowIntensity})`,
                                    border: '2px solid rgba(255, 255, 255, 0.4)',
                                    borderRadius: '8px',
                                }}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. 浮动大爱心（左上角） */}
            {config.showHearts && (
                <div
                    className="absolute z-30"
                    style={{
                        top: '12%',
                        left: '8%',
                        animation: 'heartFloat 3s ease-in-out infinite',
                    }}
                >
                    <svg width="70" height="70" viewBox="0 0 24 24" fill={config.heartColor} style={{
                        filter: `drop-shadow(0 0 10px ${config.heartColor})`,
                    }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>
            )}

            {/* 5. 标题文字 */}
            <div className="absolute top-8 left-0 right-0 z-30 text-center pointer-events-none">
                <h1
                    className="text-2xl md:text-4xl font-bold mb-2 tracking-widest"
                    style={{
                        color: '#fff',
                        textShadow: `0 0 20px ${config.heartColor}, 0 0 40px ${config.heartColor}`,
                    }}
                >
                    {config.title}
                </h1>
                <p
                    className="text-lg md:text-xl tracking-wider"
                    style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    {config.subtitle}
                </p>
            </div>

            {/* 6. 底部Love文字 */}
            <div className="absolute bottom-20 left-0 right-0 z-30 text-center pointer-events-none">
                <p
                    className="text-3xl md:text-5xl tracking-wider"
                    style={{
                        fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                        color: config.heartColor,
                        textShadow: `0 0 10px ${config.heartColor}, 0 0 20px ${config.heartColor}`,
                    }}
                >
                    {config.loveText}
                </p>
            </div>

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

            {/* 8. CSS动画 */}
            <style jsx>{`
                @keyframes heartFloat {
                    0%, 100% { 
                        transform: translateY(0) rotate(-5deg) scale(1); 
                    }
                    50% { 
                        transform: translateY(-15px) rotate(5deg) scale(1.1); 
                    }
                }
            `}</style>
        </div>
    );
}

export default function PhotoPlanetPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
