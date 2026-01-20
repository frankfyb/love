'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
 * 星球滚动相册 - 3D旋转照片星球效果
 */

export interface AppConfig {
    title: string;
    subtitle: string;
    loveText: string;
    photos: string[];
    rotationSpeed: number;
    sphereSize: number;
    showHearts: boolean;
    heartColor: string;
    glowIntensity: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 使用picsum.photos的真实占位图片
const DEFAULT_PHOTOS = [
    'https://picsum.photos/seed/couple1/200/200',
    'https://picsum.photos/seed/couple2/200/200',
    'https://picsum.photos/seed/couple3/200/200',
    'https://picsum.photos/seed/couple4/200/200',
    'https://picsum.photos/seed/couple5/200/200',
    'https://picsum.photos/seed/couple6/200/200',
    'https://picsum.photos/seed/couple7/200/200',
    'https://picsum.photos/seed/couple8/200/200',
    'https://picsum.photos/seed/couple9/200/200',
    'https://picsum.photos/seed/couple10/200/200',
    'https://picsum.photos/seed/couple11/200/200',
    'https://picsum.photos/seed/couple12/200/200',
    'https://picsum.photos/seed/couple13/200/200',
    'https://picsum.photos/seed/couple14/200/200',
    'https://picsum.photos/seed/couple15/200/200',
    'https://picsum.photos/seed/couple16/200/200',
    'https://picsum.photos/seed/couple17/200/200',
    'https://picsum.photos/seed/couple18/200/200',
    'https://picsum.photos/seed/couple19/200/200',
    'https://picsum.photos/seed/couple20/200/200',
];

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('photo-planet'),
    music: [
        { label: '💕 浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🌙 星空夜曲', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '💗 甜蜜时光', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    heartColors: [
        { label: '💗 浪漫粉', value: '#ff69b4' },
        { label: '❤️ 热情红', value: '#ff1744' },
        { label: '💜 梦幻紫', value: '#e040fb' },
        { label: '🧡 温暖橙', value: '#ff9100' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    title: '裹着心的光',
    subtitle: '有你很暖',
    loveText: 'Love You',
    photos: DEFAULT_PHOTOS,
    rotationSpeed: 0.5,
    sphereSize: 320,
    showHearts: true,
    heartColor: '#ff69b4',
    glowIntensity: 0.8,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a0a' },
        0
    ),
    bgValue: '#0a0a0a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const photoPlanetConfigMetadata = {
    panelTitle: '星球相册配置',
    panelSubtitle: 'Photo Planet Settings',
    configSchema: {
        title: { category: 'content' as const, type: 'input' as const, label: '主标题', placeholder: '裹着心的光' },
        subtitle: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: '有你很暖' },
        loveText: { category: 'content' as const, type: 'input' as const, label: '浪漫文字', placeholder: 'Love You' },

        rotationSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 0.1, max: 2, step: 0.1 },
        sphereSize: { category: 'visual' as const, type: 'slider' as const, label: '星球大小', min: 200, max: 500, step: 20 },
        showHearts: { category: 'visual' as const, type: 'switch' as const, label: '显示漂浮爱心' },
        heartColor: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '爱心颜色',
            options: PRESETS.heartColors
        },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '发光强度', min: 0.2, max: 1.5, step: 0.1 },

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
        { id: 'content' as const, label: '文字', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '文字定制', icon: null, fields: ['title' as const, 'subtitle' as const, 'loveText' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['rotationSpeed' as const, 'sphereSize' as const, 'showHearts' as const, 'heartColor' as const, 'glowIntensity' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

/**
 * ==============================================================================
 * 2. 3D球体照片瓦片配置
 * ==============================================================================
 */

interface PhotoTileData {
    id: number;
    photo: string;
    rotateY: number;
    rotateX: number;
    translateZ: number;
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

    // 生成球面上照片瓦片的3D位置 - 使用斐波那契球面分布
    const photoTiles = useMemo((): PhotoTileData[] => {
        const tiles: PhotoTileData[] = [];
        const photos = config.photos.length > 0 ? config.photos : DEFAULT_PHOTOS;

        const totalPhotos = 20;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < totalPhotos; i++) {
            const y = 1 - (i / (totalPhotos - 1)) * 2;
            const theta = goldenAngle * i;

            const rotateY = (theta * 180) / Math.PI;
            const rotateX = (Math.asin(y) * 180) / Math.PI;

            tiles.push({
                id: i,
                photo: photos[i % photos.length],
                rotateY: rotateY,
                rotateX: rotateX,
                translateZ: config.sphereSize / 2,
            });
        }

        return tiles;
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
        const hearts: Array<{
            x: number;
            y: number;
            size: number;
            alpha: number;
            vy: number;
            vx: number;
            rotation: number;
            rotationSpeed: number;
        }> = [];

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let heartTimer = 0;

        const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rot: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.moveTo(0, size * 0.3);
            ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, size * 0.1, 0, size);
            ctx.bezierCurveTo(size, size * 0.1, size * 0.5, -size * 0.3, 0, size * 0.3);
            ctx.closePath();

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.restore();
        };

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

                    {/* 照片瓦片 - 真实图片 */}
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
