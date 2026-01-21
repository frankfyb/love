'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和粒子类
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    GlowParticle,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { reasonsToLoveConfigMetadata } from './config';

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<GlowParticle[]>([]);

    const {
        audioRef,
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = container.clientWidth * window.devicePixelRatio;
            canvas.height = container.clientHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        window.addEventListener('resize', resize);
        resize();

        const loop = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;

            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Spawn particles
            if (Math.random() > 0.5) {
                const t = Math.random() * Math.PI * 2;
                const scale = 2;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                particlesRef.current.push(new GlowParticle(centerX + hx * scale + Math.random() * 10 - 5, centerY + hy * scale + Math.random() * 10 - 5));
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
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

                const posX = centerX + x * heartScale;
                const posY = centerY + y * heartScale;

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

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [config]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
            {/* 1. Background Layer */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. Canvas Layer */}
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />

            {/* 3. Audio Control */}
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

export default function ReasonsToLovePage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
