'use client';

/**
 * 定制烟花 - 重构版本
 * 使用共享烟花引擎，大幅减少代码量
 * 
 * 特点:
 *   - 送给谁 + 专属定制标语
 *   - 多种烟花类型随机发射
 *   - 天空照明效果
 *   - 祝福语轮播
 *   - 点击屏幕发射烟花
 *   - 终极模式批量发射
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 使用共享引擎
import { FireworksEngine } from '@/engines/fireworks';

// 导入配置
import {
    AppConfig,
    ShellType,
    DEFAULT_CONFIG,
    PRESETS,
    configMetadata,
    customFireworksCardConfigMetadata,
} from './config';

// 重新导出配置
export type { AppConfig, ShellType };
export { DEFAULT_CONFIG, PRESETS, configMetadata, customFireworksCardConfigMetadata };

// 烟花类型映射到引擎类型
const SHELL_TYPE_MAP: Record<string, string> = {
    'random': 'Random',
    'crysanthemum': 'Crysanthemum',
    'ring': 'Ring',
    'palm': 'Palm',
    'willow': 'Willow',
    'strobe': 'Strobe',
};

// ============================================================================
// 主显示组件
// ============================================================================

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<FireworksEngine | null>(null);

    const [currentGreeting, setCurrentGreeting] = useState('');
    const [greetingIndex, setGreetingIndex] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);

    // 音频控制
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

    // 背景配置
    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 祝福语轮播
    useEffect(() => {
        if (showWelcome) return;

        const greetings = config.greetings.length > 0 ? config.greetings : PRESETS.defaultGreetings;
        setCurrentGreeting(greetings[0]);

        const interval = setInterval(() => {
            setGreetingIndex(prev => {
                const next = (prev + 1) % greetings.length;
                setCurrentGreeting(greetings[next]);
                return next;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [config.greetings, showWelcome]);

    // 初始化烟花引擎
    useEffect(() => {
        if (showWelcome || !mainCanvasRef.current || !trailsCanvasRef.current) return;

        // 计算发射间隔
        const launchInterval = config.finaleMode
            ? { min: 100, max: 300 }
            : { min: 1200, max: 2500 };

        // 使用共享烟花引擎
        engineRef.current = new FireworksEngine({
            canvas: mainCanvasRef.current,
            trailsCanvas: trailsCanvasRef.current,
            shellSize: 2,
            shellType: SHELL_TYPE_MAP[config.shellType] as any || 'Random',
            autoLaunch: config.autoLaunch,
            autoLaunchInterval: launchInterval,
            enableSound: config.enableSound && !isMuted,
            soundVolume: 0.6,
            showSkyLighting: config.skyLighting,
        });

        engineRef.current.start();

        const handleResize = () => {
            engineRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            engineRef.current?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [showWelcome]);

    // 配置同步
    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.setShellType(SHELL_TYPE_MAP[config.shellType] as any || 'Random');
    }, [config.shellType]);

    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.setAutoLaunch(config.autoLaunch);
    }, [config.autoLaunch]);

    useEffect(() => {
        if (!engineRef.current) return;
        const interval = config.finaleMode
            ? { min: 100, max: 300 }
            : { min: 1200, max: 2500 };
        engineRef.current.setAutoLaunchInterval(interval.min, interval.max);
    }, [config.finaleMode]);

    useEffect(() => {
        engineRef.current?.setSoundEnabled(config.enableSound && !isMuted);
    }, [config.enableSound, isMuted]);

    // 事件处理
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (showWelcome || !engineRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        engineRef.current.launchAt(x, y);
    }, [showWelcome]);

    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 烟花画布 */}
            {!showWelcome && (
                <>
                    <canvas
                        ref={trailsCanvasRef}
                        className="absolute inset-0 z-10 w-full h-full"
                        style={{ mixBlendMode: 'lighten' }}
                    />
                    <canvas
                        ref={mainCanvasRef}
                        onClick={handleClick}
                        className="absolute inset-0 z-20 w-full h-full cursor-crosshair"
                        style={{ mixBlendMode: 'lighten' }}
                    />
                </>
            )}

            {/* 祝福语显示 */}
            {!showWelcome && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4">
                    <div
                        className="text-xl md:text-2xl mb-4 font-serif tracking-widest"
                        style={{
                            color: 'rgba(255, 215, 0, 0.9)',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                        }}
                    >
                        {config.recipientName}
                    </div>
                    <h1
                        key={greetingIndex}
                        className="text-4xl md:text-6xl font-bold font-serif tracking-widest"
                        style={{
                            background: 'linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 20px rgba(255, 100, 100, 0.5))',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    >
                        {currentGreeting}
                    </h1>
                </div>
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <WelcomeScreen
                    recipientName={config.recipientName}
                    customTitle={config.customTitle}
                    onStart={startAnimation}
                />
            )}

            {/* 提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                    <div className="text-white/40 text-sm">
                        ❤️ 点击屏幕放烟花 ❤️
                    </div>
                </div>
            )}

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

            <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}

// ============================================================================
// 欢迎屏幕组件
// ============================================================================

interface WelcomeScreenProps {
    recipientName: string;
    customTitle: string;
    onStart: () => void;
}

function WelcomeScreen({ recipientName, customTitle, onStart }: WelcomeScreenProps) {
    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-radial from-transparent to-black/80">
            <div className="text-center px-4 max-w-lg">
                <div className="mb-8">
                    <span
                        className="text-8xl md:text-9xl animate-bounce block"
                        style={{ filter: 'drop-shadow(0 0 40px rgba(255, 100, 100, 0.8))' }}
                    >
                        💝
                    </span>
                </div>

                <div
                    className="text-2xl md:text-4xl mb-4 font-serif tracking-widest"
                    style={{
                        background: 'linear-gradient(to right, #ff6b6b, #feca57)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {recipientName}
                </div>

                <h1 className="text-white/70 text-lg md:text-xl mb-10 tracking-[0.2em]">
                    {customTitle}
                </h1>

                <button
                    onClick={onStart}
                    className="relative px-12 py-5 rounded-full text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3)',
                        boxShadow: '0 0 40px rgba(255, 107, 107, 0.5)',
                    }}
                >
                    <span className="relative z-10 flex items-center gap-3 text-white">
                        <span className="text-2xl">❤️</span>
                        点击开启专属烟花
                        <span className="text-2xl">❤️</span>
                    </span>
                    <div
                        className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                    />
                </button>
            </div>

            <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%);
        }
      `}</style>
        </div>
    );
}

// ============================================================================
// 默认页面导出
// ============================================================================

export default function CustomFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
