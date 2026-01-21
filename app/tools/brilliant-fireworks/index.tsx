'use client';

/**
 * 璀璨烟花 - 重构版本
 * 使用共享烟花引擎，大幅减少代码量
 * 
 * 特点:
 *   - 多种烟花类型（菊花/棕榈/环形/柳叶等）
 *   - 响应式设计（移动端/PC端完美适配）
 *   - 浪漫的飘落爱心与璀璨星光
 *   - 点击屏幕互动燃放
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 使用共享引擎
import { FireworksEngine } from '@/engines/fireworks';

// 导入配置（ShellType 也从这里导入）
import {
    AppConfig,
    ShellType,
    DEFAULT_CONFIG,
    PRESETS,
    configMetadata,
    brilliantFireworksConfigMetadata,
} from './config';

// 重新导出配置
export type { AppConfig, ShellType };
export { DEFAULT_CONFIG, PRESETS, configMetadata, brilliantFireworksConfigMetadata };

// ============================================================================
// 主显示组件
// ============================================================================

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<FireworksEngine | null>(null);

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

    // 初始化烟花引擎
    useEffect(() => {
        if (!mainCanvasRef.current || !trailsCanvasRef.current) return;

        // 使用共享烟花引擎
        engineRef.current = new FireworksEngine({
            canvas: mainCanvasRef.current,
            trailsCanvas: trailsCanvasRef.current,
            shellSize: config.shellSize,
            shellType: config.shellType as ShellType,
            autoLaunch: config.autoLaunch,
            enableSound: !isMuted,
            soundVolume: 0.6,
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
    }, []);

    // 音效状态同步
    useEffect(() => {
        engineRef.current?.setSoundEnabled(!isMuted);
    }, [isMuted]);

    // 配置同步
    useEffect(() => {
        engineRef.current?.setShellSize(config.shellSize);
    }, [config.shellSize]);

    useEffect(() => {
        engineRef.current?.setShellType(config.shellType as ShellType);
    }, [config.shellType]);

    useEffect(() => {
        engineRef.current?.setAutoLaunch(config.autoLaunch);
    }, [config.autoLaunch]);

    // 事件处理
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (showWelcome) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        engineRef.current?.launchAt(x, y);
    }, [showWelcome]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 烟花 Canvas 层 */}
            <div className="absolute inset-0 z-10">
                <canvas
                    ref={trailsCanvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ mixBlendMode: 'lighten' }}
                />
                <canvas
                    ref={mainCanvasRef}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    style={{ mixBlendMode: 'lighten' }}
                    onClick={handleCanvasClick}
                />
            </div>

            {/* 3. 欢迎界面 */}
            {showWelcome && (
                <WelcomeScreen
                    recipientName={config.recipientName}
                    titleText={config.titleText}
                    onStart={startAnimation}
                />
            )}

            {/* 4. 音效控制面板 */}
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
        @keyframes spin {
          from { transform: rotate(0deg) scale(1.5); }
          to { transform: rotate(360deg) scale(1.5); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
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
    titleText: string;
    onStart: () => void;
}

function WelcomeScreen({ recipientName, titleText, onStart }: WelcomeScreenProps) {
    return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center safe-area-inset">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
            <div className="relative text-center px-4 sm:px-8 max-w-lg sm:max-w-2xl">
                {/* 动态光环 */}
                <div className="relative mb-6 sm:mb-8">
                    <div
                        className="absolute inset-0 blur-3xl opacity-40"
                        style={{
                            background: 'conic-gradient(from 0deg, #ff0043, #ffae00, #ff69b4, #a855f7, #ff0043)',
                            animation: 'spin 10s linear infinite',
                            borderRadius: '50%',
                            transform: 'scale(1.5)',
                        }}
                    />
                    <span
                        className="relative text-6xl sm:text-7xl md:text-8xl block"
                        style={{
                            filter: 'drop-shadow(0 0 30px #ff0043) drop-shadow(0 0 60px #ffae00)',
                            animation: 'bounce-slow 3s ease-in-out infinite',
                        }}
                    >
                        🎆
                    </span>
                    <span
                        className="absolute -right-2 sm:-right-4 top-0 text-xl sm:text-2xl"
                        style={{ animation: 'float 2s ease-in-out infinite' }}
                    >
                        💕
                    </span>
                </div>

                {recipientName && (
                    <div
                        className="text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 font-serif tracking-wider sm:tracking-widest"
                        style={{
                            background: 'linear-gradient(to right, #ff69b4, #ffae00, #ff0043)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'gradient-flow 3s ease infinite',
                            textShadow: '0 0 30px rgba(255,174,0,0.5)',
                        }}
                    >
                        💕 {recipientName} 💕
                    </div>
                )}

                <h1 className="text-white/70 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em] font-light">
                    {titleText}
                </h1>

                <button
                    onClick={onStart}
                    className="relative px-8 sm:px-10 py-4 sm:py-5 text-white rounded-full text-base sm:text-lg font-medium overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #ff0043 0%, #ffae00 50%, #ff69b4 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradient-flow 3s ease infinite',
                        boxShadow: '0 0 30px rgba(255,0,67,0.4), 0 0 60px rgba(255,174,0,0.2), 0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl">✨</span>
                        点燃浪漫烟花夜
                        <span className="text-lg sm:text-xl">✨</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                <p className="mt-6 sm:mt-8 text-white/50 text-xs sm:text-sm">点击屏幕可手动燃放 🎇</p>
            </div>
        </div>
    );
}

// ============================================================================
// 默认页面导出
// ============================================================================

export default function BrilliantFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
