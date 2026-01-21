'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和引擎模块
import {
    RomanticHeart3DConfig,
    DEFAULT_CONFIG,
    romanticHeart3DConfigMetadata,
} from './config';
import { Heart3DEngine } from './Heart3DEngine';

// 重新导出配置供外部使用
export type { RomanticHeart3DConfig };
export { DEFAULT_CONFIG, romanticHeart3DConfigMetadata };

/**
 * ==============================================================================
 * 主组件
 * ==============================================================================
 */

export default function RomanticHeart3DPage({ config = DEFAULT_CONFIG }: { config?: RomanticHeart3DConfig }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Heart3DEngine | null>(null);
    const [loading, setLoading] = useState(true);
    const [typedText, setTypedText] = useState<string[]>([]);

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // Audio Control
    const {
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: true,
        volume: 0.6,
        autoPlay: config.enableSound !== false,
    });

    // Typewriter effect
    useEffect(() => {
        const plainLines = config.texts || DEFAULT_CONFIG.texts;
        const textToType = Array.isArray(plainLines) ? plainLines.join('\n\n') : String(plainLines);

        let timer: NodeJS.Timeout;

        const startTyping = () => {
            let i = 0;
            timer = setInterval(() => {
                if (i < textToType.length) {
                    setTypedText(prev => {
                        return textToType.substring(0, i + 1).split('\n');
                    });
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 150);
        };

        const delay = setTimeout(startTyping, 1000);

        return () => {
            clearTimeout(delay);
            clearInterval(timer);
        };
    }, [config.texts]);

    // Three.js Engine
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        engineRef.current = new Heart3DEngine({
            canvas: canvasRef.current,
            heartObjUrl: config.heartObjUrl || DEFAULT_CONFIG.heartObjUrl,
            bgColor: config.bgValue?.startsWith('#') ? config.bgValue : '#131124',
            onLoad: () => setLoading(false),
            onError: () => setLoading(false),
        });

        return () => {
            engineRef.current?.dispose();
            engineRef.current = null;
        };
    }, [config.heartObjUrl, config.bgValue]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full bg-black overflow-hidden">
            {/* 0. Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 1. Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block w-full h-full outline-none z-[1]"
            />

            {/* 2. Loading Layer */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-pink-500 animate-pulse text-xl font-serif">Loading Heart Model...</div>
                </div>
            )}

            {/* 3. Text Layer */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[300px] text-center pointer-events-none z-10">
                {typedText.map((line, idx) => (
                    <div key={idx} className="mb-4">
                        <span
                            className="text-[#f1dadb] font-bold font-serif text-lg md:text-xl tracking-wide drop-shadow-md"
                            style={{ fontFamily: '"Russo One", arial, sans-serif' }}
                        >
                            {line}
                            {idx === typedText.length - 1 && (
                                <span className="animate-pulse text-red-500 ml-1 opacity-100">❤</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* 4. Audio Controls */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={true}
                position="bottom-right"
                size="sm"
            />

            {/* 5. Snow Effect */}
            <SnowEffect />
        </div>
    );
}

// ============================================================================
// SnowEffect 组件 - 雪花飘落效果
// ============================================================================

function SnowEffect() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const snowflakes = useMemo(() => {
        if (typeof window === 'undefined') return [];
        return [...Array(30)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            width: Math.random() * 3 + 2,
            height: Math.random() * 3 + 2,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
        }));
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute bg-white rounded-full opacity-60"
                    style={{
                        left: `${flake.left}%`,
                        top: `-10px`,
                        width: `${flake.width}px`,
                        height: `${flake.height}px`,
                        animationName: 'snow-fall',
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        filter: 'blur(1px)'
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes snow-fall {
                    0% { transform: translateY(-10px) translateX(0px); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// 导出 DisplayUI 别名（用于配置面板）
export { RomanticHeart3DPage as DisplayUI };
