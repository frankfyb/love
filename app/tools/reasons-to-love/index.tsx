'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { Heart } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
    centerText: string;
    reasons: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    textColor: string;
    glowColor: string;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Emotional', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultReasons: [
        "1.温柔", "2.善良", "3.大方", "4.美丽", "5.可爱", "6.迷人", "7.知心", "8.杰出", "9.多才", "10.多艺",
        "11.贴心", "12.大度", "13.光彩", "14.朝气", "15.甜美", "16.漂亮", "17.安静", "18.幽默", "19.听话", "20.节俭",
        "21.学霸", "22.礼貌", "23.助人", "24.温和", "25.大气", "26.苗条", "27.粘人", "28.从容", "29.动人", "30.浪漫",
        "31.单纯", "32.质朴", "33.爱我", "34.孝顺", "35.胆大", "36.豪爽", "37.优雅", "38.好贵", "39.有钱", "40.光亮",
        "41.积极", "42.向上", "43.乐观", "44.开朗", "45.健康", "46.活力", "47.朴素", "48.性感", "49.爱笑", "50.唯一",
        "51.懂我", "52.是你"
    ]
};

export const DEFAULT_CONFIG: AppConfig = {
    centerText: '520爱你的52个理由',
    reasons: PRESETS.defaultReasons,
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#000000', // Pitch black as per image
        },
        0.0 // No noise, pure black void
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    textColor: '#ffffff',
    glowColor: '#ffba75', // Warm orange/gold glow
};

export const reasonsToLoveConfigMetadata = {
    panelTitle: '爱你的理由心形特效',
    panelSubtitle: '52 Reasons to Love You',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '520爱你的52个理由' },
        reasons: {
            category: 'content' as const,
            type: 'list' as const,
            label: '理由列表',
            placeholder: '输入理由，如：1.温柔',
            description: '将会排列成心形'
        },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择背景氛围'
        },

        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        glowColor: { category: 'visual' as const, type: 'color' as const, label: '光晕颜色' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '中心文字', icon: null, fields: ['centerText' as const, 'textColor' as const] },
        { id: 2, label: '理由编辑', icon: null, fields: ['reasons' as const] },
        { id: 3, label: '氛围设置', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

/**
 * ==============================================================================
 * 2. Visual Effects Logic (Canvas)
 * ==============================================================================
 */

class GlowParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    hue: number;
    alpha: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = Math.random() * 100 + 50;
        this.size = Math.random() * 2 + 0.5;
        this.hue = 30 + Math.random() * 30; // Orange/Yellowish
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = Math.max(0, this.life / 150);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
        ctx.fill();
    }
}

/**
 * ==============================================================================
 * 3. Display Component
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

    // Audio control
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

    // Animation Loop
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
            // Re-setup coordinate system or stored vars if needed
        };

        window.addEventListener('resize', resize);
        resize();

        const loop = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;

            // Clear but keep trail? No, clean clear for text sharpness
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Central Glow Particles
            const centerX = width / 2;
            const centerY = height / 2;

            // Spawn particles
            if (Math.random() > 0.5) {
                // Spawn in a small heart shape area in the center
                const t = Math.random() * Math.PI * 2;
                // Heart equation: 16sin^3(t), 13cos(t)-5cos(2t)-2cos(3t)-cos(4t)
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

            // 2. Draw Text Heart
            // Calculate positions for reasons
            const total = config.reasons.length;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = config.textColor; // 'white'

            // Heart scale based on screen size
            const heartScale = Math.min(width, height) / 40;

            config.reasons.forEach((reason, i) => {
                // Distribute evenly along the perimeter of the heart
                // Approximate perimeter distribution by mapping index to angle 't'
                // We need to shift t so top cleft is start? 
                // Heart param: t from 0 to 2PI. 
                // 0 is top right cleft peak-ish? Let's check.
                // t=0 => x=0, y=13-5-2-1 = 5 (top cleft dip) -> actually t=0 is (0,5), but negative y is up in canvas usually, here we inverted y equation. 
                // Let's use standard: t starts from 0 (top-ish) and goes to 2PI.

                // Adjust index to start from bottom tip if needed, but standard loop 0..2PI works fine.
                // To distribute evenly, we might need closer steps at disjointed parts, but linear t step is usually 'okay' for visual effect.

                // We want 1 to be at some prominent place? The image has 1 near top/center or inside? 
                // Image shows: 25 at bottom tip. 1 at center inside? No, 1 is top inner ring?
                // Let's look closer at image. It's a spiral or concentric?
                // It looks like a single outer heart shape. "25. 大气" is at the bottom tip.
                // "6. 迷人" is top right. "45. 开朗" is top left.
                // So it starts from top center and goes both ways? Or clockwise?
                // Let's assume standard clockwise distribution.

                const t = (i / total) * Math.PI * 2 + Math.PI; // Shift phase to align nicely

                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

                const posX = centerX + x * heartScale;
                const posY = centerY + y * heartScale;

                // Draw Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = config.glowColor;
                ctx.font = `bold ${Math.max(10, heartScale * 0.8)}px sans-serif`;

                ctx.fillText(reason, posX, posY);
                ctx.shadowBlur = 0; // Reset
            });

            // 3. Draw Center Text
            ctx.font = `bold ${Math.max(16, heartScale * 1.5)}px serif`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff5e5e';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(config.centerText, centerX, centerY);

            // Add a subtitle for date or "520" if wanted
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
