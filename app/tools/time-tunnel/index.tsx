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
    YearParticle,
    drawTunnel,
    drawVortex,
    drawParticles,
    initParticles,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { timeTunnelConfigMetadata } from './config';

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
        particles = initParticles(years, config.tunnelDepth);

        // 主渲染循环
        const loop = () => {
            ctx.clearRect(0, 0, width(), height());

            const renderContext = {
                ctx,
                width: width(),
                height: height(),
                centerX: centerX(),
                centerY: centerY(),
                config,
            };

            drawTunnel(renderContext);
            drawParticles(ctx, particles, centerX(), centerY(), config, years);
            drawVortex(renderContext);

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.tunnelSpeed, config.tunnelDepth, config.textColor, config.glowColor, years, config]);

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