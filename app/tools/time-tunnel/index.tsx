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
 */

export interface AppConfig {
    centerText: string;
    yearRange: { start: number; end: number };
    tunnelSpeed: number;
    textColor: string;
    glowColor: string;
    tunnelDepth: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('time-tunnel'),
    music: [
        { label: '🌌 时空穿梭', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🚀 科幻氛围', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '✨ 星际漫游', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    centerText: '穿越时空 遇见你',
    yearRange: { start: 2000, end: 2040 },
    tunnelSpeed: 1,
    textColor: '#ffffff',
    glowColor: '#00ffff',
    tunnelDepth: 100,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const timeTunnelConfigMetadata = {
    panelTitle: '时空隧道配置',
    panelSubtitle: 'Time Tunnel Settings',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '穿越时空 遇见你' },

        tunnelSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 0.5, max: 3, step: 0.1 },
        tunnelDepth: { category: 'visual' as const, type: 'slider' as const, label: '隧道深度', min: 50, max: 200, step: 10 },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '数字颜色' },
        glowColor: { category: 'visual' as const, type: 'color' as const, label: '光晕颜色' },

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
        { id: 1, label: '专属定制', icon: null, fields: ['centerText' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['tunnelSpeed' as const, 'tunnelDepth' as const, 'textColor' as const, 'glowColor' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

/**
 * ==============================================================================
 * 2. 年份粒子类 (Year Particle Class)
 * ==============================================================================
 */

interface YearParticle {
    year: number;
    angle: number;
    radius: number;
    z: number;
    speed: number;
    rotationSpeed: number;
    opacity: number;
    size: number;
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

    // 生成年份列表
    const years = useMemo(() => {
        const result: number[] = [];
        for (let y = config.yearRange.start; y <= config.yearRange.end; y += 5) {
            result.push(y);
        }
        return result;
    }, [config.yearRange]);

    // 时空隧道Canvas渲染
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: YearParticle[] = [];

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
        const centerX = () => width() / 2;
        const centerY = () => height() / 2;

        // 初始化粒子
        const initParticles = () => {
            particles = [];
            const particleCount = 200;

            for (let i = 0; i < particleCount; i++) {
                const year = years[Math.floor(Math.random() * years.length)];
                particles.push({
                    year,
                    angle: Math.random() * Math.PI * 2,
                    radius: Math.random() * 300 + 50,
                    z: Math.random() * config.tunnelDepth,
                    speed: 0.5 + Math.random() * 1.5,
                    rotationSpeed: 0.002 + Math.random() * 0.005,
                    opacity: 0.3 + Math.random() * 0.7,
                    size: 12 + Math.random() * 16,
                });
            }
        };
        initParticles();

        // 绘制隧道效果
        const drawTunnel = () => {
            const cx = centerX();
            const cy = centerY();

            // 绘制径向渐变背景（黑洞效果）
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width(), height()) / 2);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.3, 'rgba(10, 10, 30, 0.9)');
            gradient.addColorStop(0.7, 'rgba(20, 20, 50, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width(), height());
        };

        // 绘制年份粒子
        const drawParticles = () => {
            const cx = centerX();
            const cy = centerY();
            const maxZ = config.tunnelDepth;

            // 按z轴排序，远的先绘制
            particles.sort((a, b) => b.z - a.z);

            particles.forEach(p => {
                // 更新粒子z位置（向观察者移动）
                p.z -= p.speed * config.tunnelSpeed;
                if (p.z < 0) {
                    p.z = maxZ;
                    p.angle = Math.random() * Math.PI * 2;
                    p.radius = Math.random() * 300 + 50;
                    p.year = years[Math.floor(Math.random() * years.length)];
                }

                // 更新旋转角度（螺旋效果）
                p.angle += p.rotationSpeed * config.tunnelSpeed;

                // 计算3D投影
                const perspective = 300 / (p.z + 100);
                const x = cx + Math.cos(p.angle) * p.radius * perspective;
                const y = cy + Math.sin(p.angle) * p.radius * perspective;

                // 根据深度计算大小和透明度
                const depthFactor = 1 - p.z / maxZ;
                const size = p.size * perspective * 0.8;
                const opacity = p.opacity * depthFactor * 0.9;

                if (opacity > 0.05 && size > 2) {
                    ctx.save();

                    // 绘制光晕效果
                    ctx.shadowBlur = 15 * depthFactor;
                    ctx.shadowColor = config.glowColor;

                    // 绘制年份文字
                    ctx.font = `bold ${Math.max(8, size)}px Arial, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = config.textColor;
                    ctx.fillText(p.year.toString(), x, y);

                    ctx.restore();
                }
            });
        };

        // 绘制中心涡旋效果
        const drawVortex = () => {
            const cx = centerX();
            const cy = centerY();
            const time = Date.now() / 1000;

            // 绘制旋转的光圈
            for (let i = 0; i < 3; i++) {
                const radius = 30 + i * 15;
                const alpha = 0.3 - i * 0.08;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(time * (0.5 + i * 0.2) * config.tunnelSpeed);

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();
            }

            // 中心发光点
            const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            glowGradient.addColorStop(0.2, config.glowColor + '88');
            glowGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = glowGradient;
            ctx.fillRect(cx - 50, cy - 50, 100, 100);
        };

        // 主渲染循环
        const loop = () => {
            ctx.clearRect(0, 0, width(), height());

            drawTunnel();
            drawParticles();
            drawVortex();

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.tunnelSpeed, config.tunnelDepth, config.textColor, config.glowColor, years]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black"
        >
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 时空隧道Canvas层 */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 w-full h-full"
            />

            {/* 3. 中心文字层 */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div
                    className="text-center px-6 py-4 rounded-lg"
                    style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 0 30px ${config.glowColor}44`,
                    }}
                >
                    <h1
                        className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider"
                        style={{
                            color: config.textColor,
                            textShadow: `0 0 20px ${config.glowColor}, 0 0 40px ${config.glowColor}88`,
                        }}
                    >
                        {config.centerText}
                    </h1>
                </div>
            </div>

            {/* 4. 装饰性扫描线效果 */}
            <div
                className="absolute inset-0 z-15 pointer-events-none opacity-10"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />

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
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white/70 text-xs flex items-center gap-2">
                    <span className="animate-pulse">🌌</span>
                    <span>时空穿梭</span>
                </div>
            </div>

            {/* 7. 年份范围指示 */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                <div
                    className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-xs"
                    style={{ color: config.glowColor }}
                >
                    {config.yearRange.start} → {config.yearRange.end}
                </div>
            </div>
        </div>
    );
}

export default function TimeTunnelPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
