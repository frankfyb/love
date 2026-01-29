'use client';

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置
import {
    UnifiedHeartsConfig,
    DEFAULT_CONFIG,
    PRESETS,
    GlowParticle,
    heartCurve,
    ROMANTIC_COLORS,
    FLOATING_COLORS,
    PARTICLE_SETTINGS,
} from './config';

// 重新导出配置供外部使用
export type { UnifiedHeartsConfig };
export { DEFAULT_CONFIG, PRESETS };
export { unifiedHeartsConfigMetadata } from './config';

// ============================================================================
// 飘落爱心组件（通用）
// ============================================================================

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
        const newHearts = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: Math.random() * 20 + 10,
            duration: Math.random() * 10 + 8,
            delay: Math.random() * 8,
            opacity: Math.random() * 0.4 + 0.3,
        }));
        setHearts(newHearts);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute animate-float-down"
                    style={{
                        left: `${heart.x}%`,
                        fontSize: `${heart.size}px`,
                        color: color,
                        opacity: heart.opacity,
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`,
                        textShadow: `0 0 10px ${color}`,
                    }}
                >
                    ❤
                </div>
            ))}
            <style jsx>{`
                @keyframes float-down {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                .animate-float-down { animation: float-down linear infinite; }
            `}</style>
        </div>
    );
}

// ============================================================================
// 模式1：粒子爱心渲染器
// ============================================================================

function ParticleHeartsRenderer({ config }: { config: UnifiedHeartsConfig }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };

        resize();
        window.addEventListener('resize', resize);

        const particles: Array<{
            x: number; y: number; targetX: number; targetY: number;
            vx: number; vy: number; size: number; alpha: number;
        }> = [];

        // 生成心形粒子
        const heartScale = Math.min(window.innerWidth, window.innerHeight) / 40;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < config.particleDensity * 10; i++) {
            const t = (i / (config.particleDensity * 10)) * Math.PI * 2;
            const { x, y } = heartCurve(t, heartScale);
            particles.push({
                x: centerX + (Math.random() - 0.5) * 100,
                y: centerY + (Math.random() - 0.5) * 100,
                targetX: centerX + x,
                targetY: centerY + y,
                vx: 0,
                vy: 0,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.5,
            });
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            particles.forEach((p) => {
                // 向目标移动
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                p.vx += dx * 0.02;
                p.vy += dy * 0.02;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.x += p.vx;
                p.y += p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = config.heartColor;
                ctx.shadowBlur = config.glowIntensity;
                ctx.shadowColor = config.heartColor;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            // 绘制中心文字
            ctx.font = `bold ${Math.max(24, heartScale * 1.5)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = config.heartColor;
            ctx.fillText(config.centerText, centerX, centerY);
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config]);

    return (
        <>
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            {config.showFloatingHearts && <FloatingHearts color={config.heartColor} />}
        </>
    );
}

// ============================================================================
// 模式2：浪漫爱心渲染器
// ============================================================================

function RomanticHeartsRenderer({ config }: { config: UnifiedHeartsConfig }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; color: string; alpha: number; life: number;
        }> = [];

        // 初始化粒子
        for (let i = 0; i < config.particleCount; i++) {
            const t = Math.random() * Math.PI * 2;
            const scale = Math.min(canvas.width, canvas.height) / 50;
            const { x, y } = heartCurve(t, scale);
            particles.push({
                x: canvas.width / 2 + x,
                y: canvas.height / 2 + y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: ROMANTIC_COLORS[Math.floor(Math.random() * ROMANTIC_COLORS.length)],
                alpha: Math.random() * 0.8 + 0.2,
                life: Math.random() * 100 + 50,
            });
        }

        // 漂浮文字
        const floatingTexts: Array<{
            text: string; x: number; y: number; vy: number;
            alpha: number; color: string; size: number;
        }> = [];

        const addFloatingText = () => {
            if (config.romanticEffect === 'floating' && config.floatingTexts.length > 0) {
                const text = config.floatingTexts[Math.floor(Math.random() * config.floatingTexts.length)];
                floatingTexts.push({
                    text,
                    x: Math.random() * canvas.width,
                    y: canvas.height + 50,
                    vy: -(Math.random() * 2 + 1),
                    alpha: 1,
                    color: FLOATING_COLORS[Math.floor(Math.random() * FLOATING_COLORS.length)],
                    size: Math.random() * 16 + 14,
                });
            }
        };

        const textInterval = setInterval(addFloatingText, 1000);

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 绘制粒子
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // 边界反弹
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            // 绘制漂浮文字
            floatingTexts.forEach((ft, i) => {
                ft.y += ft.vy;
                ft.alpha -= 0.003;

                if (ft.alpha <= 0) {
                    floatingTexts.splice(i, 1);
                    return;
                }

                ctx.font = `bold ${ft.size}px serif`;
                ctx.fillStyle = ft.color;
                ctx.globalAlpha = ft.alpha;
                ctx.textAlign = 'center';
                ctx.fillText(ft.text, ft.x, ft.y);
            });

            ctx.globalAlpha = 1;

            // 绘制中心文字
            ctx.font = `bold 32px serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = config.heartColor;
            ctx.textAlign = 'center';
            ctx.fillText(config.centerText, canvas.width / 2, canvas.height / 2);
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
            clearInterval(textInterval);
        };
    }, [config]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
}

// ============================================================================
// 模式3：心形文字渲染器
// ============================================================================

function TextHeartRenderer({ config }: { config: UnifiedHeartsConfig }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<GlowParticle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        resize();
        window.addEventListener('resize', resize);

        const loop = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Spawn glow particles
            if (Math.random() > 0.5) {
                const t = Math.random() * Math.PI * 2;
                const scale = 2;
                const { x, y } = heartCurve(t, scale);
                particlesRef.current.push(new GlowParticle(centerX + x + Math.random() * 10 - 5, centerY + y + Math.random() * 10 - 5));
            }

            // Update & Draw Particles
            particlesRef.current.forEach((p, i) => {
                p.update();
                p.draw(ctx);
                if (p.life <= 0) particlesRef.current.splice(i, 1);
            });

            // Draw Text Heart
            const total = config.reasons.length;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = config.textColor;

            const heartScale = Math.min(width, height) / 40;

            config.reasons.forEach((reason, i) => {
                const t = (i / total) * Math.PI * 2 + Math.PI;
                const { x, y } = heartCurve(t, heartScale);

                const posX = centerX + x;
                const posY = centerY + y;

                ctx.shadowBlur = 10;
                ctx.shadowColor = config.glowColor;
                ctx.font = `bold ${Math.max(10, heartScale * 0.8)}px sans-serif`;
                ctx.fillText(reason, posX, posY);
                ctx.shadowBlur = 0;
            });

            // Draw Center Text
            ctx.font = `bold ${Math.max(16, heartScale * 1.5)}px serif`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff5e5e';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(config.centerText, centerX, centerY);

            ctx.font = `italic ${Math.max(12, heartScale * 0.8)}px serif`;
            ctx.fillText("I Love You", centerX, centerY + heartScale * 2);
            ctx.shadowBlur = 0;

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
}

// ============================================================================
// 模式4：3D爱心渲染器（懒加载）
// ============================================================================

const Heart3DRenderer = lazy(() => import('./Heart3DMode'));

// ============================================================================
// 主组件 (DisplayUI)
// ============================================================================

interface DisplayUIProps {
    config: UnifiedHeartsConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof UnifiedHeartsConfig, value: any) => void;
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

    // 根据模式渲染不同的效果
    const renderMode = () => {
        switch (config.mode) {
            case 'particle':
                return <ParticleHeartsRenderer config={config} />;
            case 'romantic':
                return <RomanticHeartsRenderer config={config} />;
            case 'text-heart':
                return <TextHeartRenderer config={config} />;
            case '3d':
                return (
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-pink-500">加载3D效果中...</div>}>
                        <Heart3DRenderer config={config} />
                    </Suspense>
                );
            default:
                return <ParticleHeartsRenderer config={config} />;
        }
    };

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 模式渲染层 */}
            {renderMode()}

            {/* 3. 标题层（某些模式显示） */}
            {(config.mode === 'particle' || config.mode === 'romantic') && (
                <div className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none">
                    <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg"
                        style={{ textShadow: `0 0 20px ${config.heartColor}` }}>
                        {config.recipientName}
                    </h1>
                </div>
            )}

            {/* 4. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="bottom-right"
            />
        </div>
    );
}

export default function UnifiedHeartsPage() {
    const [config, setConfig] = useState<UnifiedHeartsConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
