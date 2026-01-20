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
 * 新年好运投射 - 浪漫贴纸雨效果
 * 特点:
 *   - 贴纸从顶部撒向人物的自然落下效果
 *   - 完美适配移动端/PC端
 *   - 富有浪漫感的视觉效果
 *   - 可自定义贴纸速度和密度
 * ==============================================================================
 */

export interface AppConfig {
    greetingText: string;
    subText: string;
    userPhoto: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    streamSpeed: number;
    stickerDensity: number; // 新增：贴纸密度
    stickerStyle: 'festive' | 'romantic' | 'mixed'; // 新增：贴纸风格
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: '新年喜庆', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温馨旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    // 喜庆风格贴纸
    festiveStickers: [
        '🧧', '💰', '🧨', '🏮', '✨', '福', '🐟', '🐍', '🍊', '🎉',
        '🎇', '🎆', '💫', '⭐', '🌟',
        '新年快乐', '恭喜发财', '大吉大利', '万事如意', '2026'
    ],
    // 浪漫风格贴纸
    romanticStickers: [
        '💕', '💖', '💗', '💓', '💞', '💘', '❤️', '🌹', '🌸', '✨',
        '💫', '⭐', '🌟', '🦋', '🌺', '💐',
        '爱你', 'LOVE', '永远', '幸福', '甜蜜'
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    greetingText: '新年快乐',
    subText: 'Happy New Year 2026',
    userPhoto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop',
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#1a0a2e',
        },
        0.1
    ),
    bgValue: '#1a0a2e',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    streamSpeed: 4,
    stickerDensity: 50,
    stickerStyle: 'mixed',
};

export const festiveProjectionDiyConfigMetadata = {
    panelTitle: '新年好运投射',
    panelSubtitle: 'Lucky Sticker Rain Effect',
    configSchema: {
        greetingText: { category: 'content' as const, type: 'input' as const, label: '🎉 大标题', placeholder: '新年快乐' },
        subText: { category: 'content' as const, type: 'input' as const, label: '✨ 副标题', placeholder: 'Happy New Year 2026' },
        userPhoto: {
            category: 'content' as const,
            type: 'media-picker' as const,
            label: '📷 人物照片',
            mediaType: 'image' as const,
            description: '上传或输入照片URL'
        },

        stickerStyle: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '🎨 贴纸风格',
            options: [
                { label: '🧧 喜庆新年', value: 'festive' },
                { label: '💕 浪漫爱心', value: 'romantic' },
                { label: '✨ 混合风格', value: 'mixed' },
            ]
        },
        streamSpeed: { category: 'visual' as const, type: 'slider' as const, label: '🚀 飘落速度', min: 1, max: 10, step: 1, description: '贴纸下落的速度' },
        stickerDensity: { category: 'visual' as const, type: 'slider' as const, label: '🌟 贴纸密度', min: 20, max: 100, step: 10, description: '屏幕上贴纸的数量' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '背景颜色或图片'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '📝 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '照片上传', icon: null, fields: ['userPhoto' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetingText' as const, 'subText' as const] },
        { id: 3, label: '贴纸效果', icon: null, fields: ['stickerStyle' as const, 'streamSpeed' as const, 'stickerDensity' as const] },
        { id: 4, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

/**
 * ==============================================================================
 * 贴纸粒子系统 - 从左上角卡通人物喷射向右下角人物的效果
 * ==============================================================================
 */

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    content: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    isText: boolean;
    color: string;
    life: number;
    maxLife: number;
    layer: number;
    scale: number;
    targetScale: number;
}

function getStickers(style: 'festive' | 'romantic' | 'mixed'): string[] {
    switch (style) {
        case 'festive':
            return PRESETS.festiveStickers;
        case 'romantic':
            return PRESETS.romanticStickers;
        case 'mixed':
        default:
            return [...PRESETS.festiveStickers, ...PRESETS.romanticStickers];
    }
}

// 喷射源点位置（左上角卡通人物处）
function getSourcePoint(width: number, height: number, isMobile: boolean) {
    return {
        x: isMobile ? width * 0.15 : width * 0.10,
        y: isMobile ? height * 0.12 : height * 0.10,
    };
}

// 人物照片目标区域（右下角）
function getTargetArea(width: number, height: number, isMobile: boolean) {
    return {
        x: isMobile ? width * 0.75 : width * 0.78,
        y: isMobile ? height * 0.70 : height * 0.65,
    };
}

function createParticle(
    width: number,
    height: number,
    stickers: string[],
    isMobile: boolean
): Particle {
    const content = stickers[Math.floor(Math.random() * stickers.length)];
    const isText = content.length > 2;

    const source = getSourcePoint(width, height, isMobile);
    const target = getTargetArea(width, height, isMobile);

    // 从源点开始，带有轻微随机偏移
    const startX = source.x + (Math.random() - 0.5) * 40;
    const startY = source.y + (Math.random() - 0.5) * 40;

    // 计算从源点到目标的基础角度
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const baseAngle = Math.atan2(dy, dx); // 精确计算指向人物的角度

    // 扇形扩散：以基础角度为中心，左右各扩散30度
    const spreadAngle = Math.PI / 3; // 60度总扩散范围
    const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;

    // 速度随机，产生远近层次感
    const speed = 2.5 + Math.random() * 4;

    // 层级决定大小和透明度（近大快，远小慢）
    const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
    const layerScale = [1.5, 1.1, 0.7][layer];
    const layerOpacity = [1, 0.9, 0.7][layer];
    const layerSpeed = [1.2, 1, 0.8][layer];

    const colors = ['#FFD700', '#FF6B6B', '#FFFFFF', '#FFA500', '#FF69B4', '#FF4444', '#FFAA00', '#FFE4B5'];

    // 移动端调整大小
    const baseSizeEmoji = isMobile ? 30 : 44;
    const baseSizeText = isMobile ? 18 : 26;

    // 生命周期根据距离调整（飞得远的活得久）
    const maxLife = 100 + Math.random() * 100;

    return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed * layerSpeed,
        vy: Math.sin(angle) * speed * layerSpeed,
        content,
        size: (isText ? baseSizeText + Math.random() * 14 : baseSizeEmoji + Math.random() * 24) * layerScale,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1, // 明显旋转
        opacity: 0, // 初始透明，逐渐出现
        isText,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife,
        layer,
        scale: 0.3, // 初始缩放
        targetScale: layerScale,
    };
}

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
        const spawnRate = Math.max(1, Math.floor(12 - speed)); // 速度越快，生成越频繁

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

            // 半透明清除，产生轻微拖尾效果
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.clearRect(0, 0, width, height);

            // 生成新粒子
            spawnTimerRef.current++;
            if (spawnTimerRef.current >= spawnRate && particlesRef.current.length < maxParticles) {
                spawnTimerRef.current = 0;
                // 每次生成1-3个粒子，产生"喷射"感
                const spawnCount = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < spawnCount; i++) {
                    particlesRef.current.push(createParticle(width, height, stickers, isMobile));
                }
            }

            // 按层级排序绘制（远的先画）
            const sortedParticles = [...particlesRef.current].sort((a, b) => b.layer - a.layer);

            sortedParticles.forEach((p) => {
                const originalIdx = particlesRef.current.indexOf(p);

                // 更新生命周期
                p.life++;

                // 计算生命周期进度
                const lifeProgress = p.life / p.maxLife;

                // 缩放动画：开始时放大，结束时缩小
                if (lifeProgress < 0.1) {
                    p.scale = 0.3 + (p.targetScale - 0.3) * (lifeProgress / 0.1);
                } else if (lifeProgress > 0.7) {
                    p.scale = p.targetScale * (1 - (lifeProgress - 0.7) / 0.3);
                } else {
                    p.scale = p.targetScale;
                }

                // 透明度动画：淡入淡出
                if (lifeProgress < 0.1) {
                    p.opacity = lifeProgress / 0.1;
                } else if (lifeProgress > 0.75) {
                    p.opacity = (1 - lifeProgress) / 0.25;
                } else {
                    p.opacity = 1;
                }

                // 应用层级透明度
                const layerOpacity = [1, 0.9, 0.7][p.layer];
                p.opacity *= layerOpacity;

                // 更新位置
                p.x += p.vx * speedFactor;
                p.y += p.vy * speedFactor;

                // 轻微重力效果
                p.vy += 0.02;

                // 空气阻力
                p.vx *= 0.995;
                p.vy *= 0.995;

                // 旋转
                p.rotation += p.rotationSpeed;

                // 超出生命周期或屏幕外时移除
                if (p.life > p.maxLife || p.x > width + 100 || p.y > height + 100 || p.x < -100 || p.y < -100) {
                    particlesRef.current.splice(originalIdx, 1);
                    return;
                }

                // 绘制粒子
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.scale(p.scale, p.scale);

                if (p.isText) {
                    // 绘制文字贴纸
                    ctx.font = `bold ${p.size}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // 多层发光效果
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = p.size * 0.6;
                    ctx.fillStyle = p.color;
                    ctx.fillText(p.content, 0, 0);

                    // 描边增强可读性
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = 'rgba(139, 0, 0, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.strokeText(p.content, 0, 0);

                    // 再画一次增强亮度
                    ctx.fillText(p.content, 0, 0);
                } else {
                    // 绘制emoji贴纸
                    ctx.font = `${p.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // 金色发光效果
                    ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
                    ctx.shadowBlur = p.size * 0.5;
                    ctx.fillText(p.content, 0, 0);

                    // 再画一次更亮
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

    // 当风格改变时清空粒子
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
 * 主显示组件
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
                {/* 渐变叠加层 */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 70% 100%, rgba(255,100,100,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 20%, rgba(100,100,255,0.1) 0%, transparent 50%)',
                    }}
                />
            </div>

            {/* 2. 光束效果层 */}
            <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                {/* 主光束 - 从左上角照向右下角 */}
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,250,220,0.12) 20%, rgba(255,245,200,0.05) 40%, transparent 60%)',
                        filter: 'blur(30px)',
                    }}
                />
                {/* 辅助光晕 */}
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
                        {/* 火花效果 */}
                        <span className="absolute bottom-2 right-[-35px] sm:right-[-45px] text-lg sm:text-xl md:text-2xl animate-ping">✨</span>
                        <span className="absolute bottom-6 right-[-30px] sm:right-[-38px] text-sm sm:text-lg animate-bounce" style={{ animationDelay: '0.2s' }}>🔥</span>
                    </div>
                    {/* 年份标签 */}
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
                {/* 装饰圆环 */}
                <div
                    className="absolute bottom-[-5%] right-[-5%] w-[35vh] sm:w-[40vh] md:w-[45vh] h-[35vh] sm:h-[40vh] md:h-[45vh] rounded-full border border-yellow-200/20 opacity-50"
                    style={{
                        borderStyle: 'dashed',
                        animation: 'spin 60s linear infinite reverse'
                    }}
                />
                <div
                    className="absolute bottom-[-8%] right-[-8%] w-[28vh] sm:w-[32vh] md:w-[36vh] h-[28vh] sm:h-[32vh] md:h-[36vh] rounded-full border border-pink-200/15 opacity-40"
                    style={{
                        borderStyle: 'dotted',
                        animation: 'spin 45s linear infinite'
                    }}
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
                        {/* 人物周围的星光装饰 */}
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
