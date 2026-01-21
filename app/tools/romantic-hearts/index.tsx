'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和粒子系统模块
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    PARTICLE_SETTINGS,
} from './config';

import {
    Point,
    ParticlePool,
    FloatingText,
    MeteorRain,
    pointOnHeart,
    createHeartImage,
} from './ParticleSystem';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { romanticHeartsConfigMetadata } from './config';

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
    const heartCanvasRef = useRef<HTMLCanvasElement>(null);
    const effectCanvasRef = useRef<HTMLCanvasElement>(null);

    const [pulseScale, setPulseScale] = useState(1);

    // 使用可复用的音效 Hook
    const {
        audioRef: bgAudioRef,
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

    // 获取浮动文字列表
    const getFloatingTexts = useCallback(() => {
        let list: string[] = [];
        if (Array.isArray(config.floatingTexts)) {
            list = config.floatingTexts;
        } else if (typeof config.floatingTexts === 'string') {
            list = (config.floatingTexts as string).split('\n').filter(s => s.trim() !== '');
        }
        return list.length > 0 ? list : PRESETS.floatingTextTemplates;
    }, [config.floatingTexts]);

    // 心跳脉动动画
    useEffect(() => {
        if (config.effectMode !== 'pulse') return;

        let frame = 0;
        const animate = () => {
            frame++;
            // 模拟心跳效果: 0.8 -> 0.7 -> 1 -> 0.7 -> 0.8
            const t = (frame % 90) / 90;
            let scale = 0.8;
            if (t < 0.25) {
                scale = 0.8 - 0.1 * (t / 0.25);
            } else if (t < 0.5) {
                scale = 0.7 + 0.3 * ((t - 0.25) / 0.25);
            } else if (t < 0.75) {
                scale = 1 - 0.3 * ((t - 0.5) / 0.25);
            } else {
                scale = 0.7 + 0.1 * ((t - 0.75) / 0.25);
            }
            setPulseScale(scale);
            requestAnimationFrame(animate);
        };
        const id = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(id);
    }, [config.effectMode]);

    // 心形爱心canvas主渲染
    useEffect(() => {
        const canvas = heartCanvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        let time = 0;
        const particles = new ParticlePool(config.particleCount);
        const particleRate = config.particleCount / PARTICLE_SETTINGS.duration;

        const heartImage = createHeartImage(config.heartColor);

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

        const loop = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            const newTime = Date.now() / 1000;
            const deltaTime = newTime - (time || newTime);
            time = newTime;

            ctx.clearRect(0, 0, width, height);

            // 生成新粒子
            const amount = particleRate * deltaTime;
            for (let i = 0; i < amount; i++) {
                const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                const dir = pos.clone();
                dir.length(PARTICLE_SETTINGS.velocity);
                particles.add(
                    width / 2 + pos.x,
                    height / 2 - pos.y,
                    (dir as Point).x,
                    -(dir as Point).y
                );
            }

            particles.update(deltaTime);
            particles.draw(ctx, heartImage);

            rafId = requestAnimationFrame(loop);
        };

        heartImage.onload = () => {
            loop();
        };
        if (heartImage.complete) {
            loop();
        }

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.heartColor, config.particleCount]);

    // 效果canvas渲染（流星/黑客/漂浮）
    useEffect(() => {
        const canvas = effectCanvasRef.current;
        if (!canvas || !containerRef.current) return;
        if (config.effectMode === 'pulse') return; // 脉动模式不需要额外效果

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        const texts = getFloatingTexts();

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

        if (config.effectMode === 'meteor') {
            // 流星雨效果
            const meteors: MeteorRain[] = [];
            const meteorCount = 20;

            for (let i = 0; i < meteorCount; i++) {
                meteors.push(new MeteorRain(width(), height()));
            }

            const loop = () => {
                for (let n = 0; n < meteorCount; n++) {
                    const rain = meteors[n];
                    rain.move(ctx);
                    if (rain.y > height()) {
                        ctx.clearRect(rain.x, rain.y - rain.height, rain.width, rain.height);
                        meteors[n] = new MeteorRain(width(), height());
                    }
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();

        } else if (config.effectMode === 'matrix') {
            // 黑客风格下落文字效果
            const textChars = 'I LOVE U'.split('');
            const fontSize = 16;
            const columns = Math.floor(width() / fontSize);
            const drops: number[] = new Array(columns).fill(1);

            const loop = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, width(), height());
                ctx.fillStyle = '#f584b7';
                ctx.font = `${fontSize}px arial`;

                for (let i = 0; i < drops.length; i++) {
                    const text = textChars[Math.floor(Math.random() * textChars.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > height() || Math.random() > 0.95) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();

        } else if (config.effectMode === 'floating') {
            // 漂浮文字效果
            const floatingTexts: FloatingText[] = [];
            for (let i = 0; i < 100; i++) {
                floatingTexts.push(new FloatingText(width(), height(), texts));
            }

            const loop = () => {
                ctx.clearRect(0, 0, width(), height());
                for (let i = 0; i < floatingTexts.length; i++) {
                    floatingTexts[i].update(width(), height());
                    floatingTexts[i].draw(ctx);
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();
        }

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.effectMode, getFloatingTexts]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 效果Canvas层（流星/黑客/漂浮）*/}
            {config.effectMode !== 'pulse' && (
                <canvas
                    ref={effectCanvasRef}
                    className="absolute inset-0 z-5 pointer-events-none"
                />
            )}

            {/* 3. 心形爱心Canvas层 */}
            <canvas
                ref={heartCanvasRef}
                className="absolute inset-0 z-10 pointer-events-none transition-transform duration-100"
                style={{
                    transform: config.effectMode === 'pulse' ? `scale(${pulseScale})` : 'scale(1)',
                }}
            />

            {/* 4. 文字UI层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
                {/* 中心文字 */}
                <div
                    className="text-center animate-fade-in"
                    style={{
                        transform: config.effectMode === 'pulse' ? `scale(${pulseScale})` : 'scale(1)',
                        transition: 'transform 0.1s ease-out',
                    }}
                >
                    <div className="text-white/90 text-3xl md:text-5xl lg:text-6xl font-bold tracking-widest drop-shadow-[0_0_20px_rgba(255,105,180,0.8)] mb-6 animate-pulse">
                        {config.centerText}
                    </div>
                    {config.recipientName && (
                        <div className="text-pink-300/80 text-xl md:text-2xl font-light tracking-[0.5em] mt-8 drop-shadow-lg">
                            {config.recipientName}
                        </div>
                    )}
                </div>
            </div>

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
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs">
                    {PRESETS.effectModes.find(m => m.value === config.effectMode)?.label || '心跳脉动'}
                </div>
            </div>
        </div>
    );
}

export default function RomanticHeartsPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
