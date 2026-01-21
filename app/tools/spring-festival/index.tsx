'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和引擎类
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    SoundManager,
    ShapeShifter,
    FireworkEngine,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { springFestivalConfigMetadata } from './config';

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
    const fireworkCanvasRef = useRef<HTMLCanvasElement>(null);
    const textCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    const fireworkEngineRef = useRef<FireworkEngine | null>(null);
    const shapeShifterRef = useRef<ShapeShifter | null>(null);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showWelcome, setShowWelcome] = useState(true);
    const [animationStarted, setAnimationStarted] = useState(false);

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

    // 初始化引擎
    useEffect(() => {
        soundManagerRef.current = new SoundManager();
        soundManagerRef.current.setEnabled(!isMuted);

        if (fireworkCanvasRef.current) {
            fireworkEngineRef.current = new FireworkEngine(
                fireworkCanvasRef.current,
                soundManagerRef.current
            );
            fireworkEngineRef.current.start();
        }

        if (textCanvasRef.current) {
            shapeShifterRef.current = new ShapeShifter(textCanvasRef.current);
            shapeShifterRef.current.start();
        }

        const handleResize = () => {
            fireworkEngineRef.current?.resize();
            shapeShifterRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            fireworkEngineRef.current?.stop();
            shapeShifterRef.current?.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        soundManagerRef.current?.setEnabled(!isMuted);
    }, [isMuted]);

    // 开始动画序列
    const startSequence = useCallback(() => {
        setShowWelcome(false);
        setAnimationStarted(true);
        setCurrentIndex(0);
        fireworkEngineRef.current?.setIntensity(2);
    }, []);

    // 文字切换动画
    useEffect(() => {
        if (currentIndex < 0) return;

        const sequence = config.countdownSequence;
        if (currentIndex >= sequence.length) return;

        shapeShifterRef.current?.switchShape(sequence[currentIndex]);

        const timer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 2500);

        return () => clearTimeout(timer);
    }, [currentIndex, config.countdownSequence]);

    // 动画结束后循环
    useEffect(() => {
        if (currentIndex >= config.countdownSequence.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(0);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, config.countdownSequence.length]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 烟花 Canvas */}
            <canvas
                ref={fireworkCanvasRef}
                className="absolute inset-0 z-10 w-full h-full"
                style={{ background: 'transparent' }}
            />

            {/* 3. 文字粒子 Canvas */}
            <canvas
                ref={textCanvasRef}
                className="absolute inset-0 z-20 w-full h-full pointer-events-none"
                style={{ background: 'transparent' }}
            />

            {/* 4. 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
                    <div className="relative text-center px-4 transition-all duration-1000">
                        <div className="mb-8">
                            <span className="text-6xl md:text-8xl animate-pulse">🎆</span>
                        </div>
                        {config.recipientName && (
                            <div className="text-white/90 text-2xl md:text-4xl mb-4 font-serif tracking-widest 
                            animate-pulse drop-shadow-[0_2px_20px_rgba(255,215,0,0.6)]">
                                {config.recipientName}
                            </div>
                        )}
                        <h1 className="text-white/70 text-lg md:text-2xl mb-12 tracking-[0.4em] font-light">
                            {config.titleText}
                        </h1>
                        <button
                            onClick={startSequence}
                            className="relative px-10 py-5 text-white rounded-full text-xl font-bold 
                         overflow-hidden group transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee0979 50%, #ff6a00 100%)',
                                boxShadow: '0 0 40px rgba(255,100,100,0.5), 0 0 80px rgba(255,100,100,0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="text-2xl">✨</span>
                                点击开启新年祝福
                                <span className="text-2xl">✨</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </div>
                </div>
            )}

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
        </div>
    );
}

export default function SpringFestivalPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
