'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import type { AppConfig } from './config';
import { DEFAULT_CONFIG, particleHeartsConfigMetadata, particleHeartsCardConfigMetadata } from './config';
import {
    DualHeartParticle,
    DiamondTraceParticle,
    PulseGlowParticle,
    generateHeartPoints,
    generateDualHeartParticles,
    generateDiamondParticles,
    generatePulseGlowParticles
} from './ParticleSystem';

/**
 * ==============================================================================
 * 粒子爱心组件 - 浪漫粒子系统
 * 特点:
 *   - 多种爱心显示模式
 *   - 粒子双心、钻石轨迹、脉冲光晕
 *   - 完美适配移动端/PC端
 *   - 浪漫的视觉效果和动画
 * ==============================================================================
 */

// 飘落爱心组件
interface FloatingHeart {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

function FloatingHearts({ color }: { color: string }) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);

    useEffect(() => {
        const newHearts: FloatingHeart[] = [];
        for (let i = 0; i < 15; i++) {
            newHearts.push({
                id: i,
                x: Math.random() * 100,
                size: Math.random() * 20 + 10,
                duration: Math.random() * 10 + 10,
                delay: Math.random() * 5,
                opacity: Math.random() * 0.3 + 0.2,
            });
        }
        setHearts(newHearts);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-float-down"
                    style={{
                        left: `${heart.x}%`,
                        fontSize: `${heart.size}px`,
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        opacity: heart.opacity,
                        color: color,
                    }}
                >
                    ❤
                </div>
            ))}
        </div>
    );
}

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const dualParticlesRef = useRef<DualHeartParticle[]>([]);
    const diamondParticlesRef = useRef<DiamondTraceParticle[]>([]);
    const pulseParticlesRef = useRef<PulseGlowParticle[]>([]);
    const targetPointsRef = useRef<number[][]>([]);
    const traceKRef = useRef(0);

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

    // 初始化和更新粒子
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;

        const resize = () => {
            if (!containerRef.current) return;
            const ws = containerRef.current.clientWidth;
            const hs = containerRef.current.clientHeight;
            canvas.width = ws;
            canvas.height = hs;

            // 根据模式初始化粒子
            const particleCount = Math.floor(config.particleDensity * 5);

            if (config.heartStyle === 'particle-dual') {
                dualParticlesRef.current = generateDualHeartParticles(particleCount, ws);
            } else if (config.heartStyle === 'diamond-trace') {
                const heartPointsCount = 100;
                targetPointsRef.current = generateHeartPoints(heartPointsCount, ws, hs);
                diamondParticlesRef.current = generateDiamondParticles(particleCount, ws, hs, heartPointsCount);
            } else if (config.heartStyle === 'pulse-glow') {
                pulseParticlesRef.current = generatePulseGlowParticles(particleCount, ws, hs, config.heartColor);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            const ws = canvas.width;
            const hs = canvas.height;

            // 清除画布保持透明背景
            ctx.clearRect(0, 0, ws, hs);

            if (config.heartStyle === 'particle-dual') {
                // 绘制粒子双心 + 心跳动画
                ctx.fillStyle = config.heartColor;
                ctx.shadowBlur = config.glowIntensity;
                ctx.shadowColor = config.heartColor;

                // 计算心跳缩放
                const time = Date.now() * 0.002;
                const beatScale = 1 + 0.05 * Math.sin(time * 3) + 0.02 * Math.sin(time * 10);
                const centerX = ws / 2;
                const centerY = hs / 2;

                for (const p of dualParticlesRef.current) {
                    const pos = p.getPosition(ws, hs);

                    // 应用心跳缩放
                    const dx = pos.x - centerX;
                    const dy = pos.y - centerY;
                    const x = centerX + dx * beatScale;
                    const y = centerY + dy * beatScale;

                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
            } else if (config.heartStyle === 'diamond-trace') {
                // 绘制钻石轨迹
                traceKRef.current++;
                if (traceKRef.current >= 50) traceKRef.current = 0;

                for (const p of diamondParticlesRef.current) {
                    p.update(targetPointsRef.current, targetPointsRef.current.length, traceKRef.current);
                    p.draw(ctx);
                }
            } else if (config.heartStyle === 'pulse-glow') {
                // 绘制脉冲光晕
                for (const p of pulseParticlesRef.current) {
                    p.update();
                    p.draw(ctx, config.glowIntensity);
                }

                // 绘制中心爱心
                ctx.save();
                ctx.shadowBlur = config.glowIntensity * 2;
                ctx.shadowColor = config.heartColor;
                ctx.fillStyle = config.heartColor;
                ctx.font = 'bold 120px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // 中心文字也添加心跳
                const time = Date.now() * 0.002;
                const beatScale = 1 + 0.05 * Math.sin(time * 3);
                ctx.setTransform(beatScale, 0, 0, beatScale, ws / 2 * (1 - beatScale), hs / 2 * (1 - beatScale));

                ctx.fillText('❤', ws / 2, hs / 2);
                ctx.restore();
            }

            rafId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.heartStyle, config.heartColor, config.particleDensity, config.glowIntensity]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 粒子Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 block"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 飘落爱心 */}
            {config.showFloatingHearts && (
                <div className="absolute inset-0 z-15">
                    <FloatingHearts color={config.heartColor} />
                </div>
            )}

            {/* 文字层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4 gap-8">
                {/* 接收人姓名 */}
                {config.recipientName && (
                    <div
                        className="text-2xl md:text-4xl font-serif tracking-widest"
                        style={{
                            color: config.heartColor,
                            textShadow: `0 0 20px ${config.heartColor}, 0 0 40px ${config.heartColor}80`,
                        }}
                    >
                        {config.recipientName}
                    </div>
                )}

                {/* 中心文字 */}
                {config.centerText && (
                    <div
                        className="text-4xl md:text-6xl font-bold tracking-wider"
                        style={{
                            color: config.heartColor,
                            textShadow: `0 0 30px ${config.heartColor}, 0 0 60px ${config.heartColor}80`,
                            animation: 'pulse-text 2s ease-in-out infinite',
                        }}
                    >
                        {config.centerText}
                    </div>
                )}
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

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes float-down {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                .animate-float-down {
                    animation: float-down linear infinite;
                }

                @keyframes pulse-text {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </div>
    );
}

export default function ParticleHeartsPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}

export { DEFAULT_CONFIG, particleHeartsConfigMetadata, particleHeartsCardConfigMetadata };
