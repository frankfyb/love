'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import type { AppConfig } from './config';
import { DEFAULT_CONFIG, PRESETS, AUDIO_SOURCES, fireworkShow3dCardConfigMetadata, fireworkShow3dConfigMetadata } from './config';
import { Firework3DShowSystem } from './Firework3DShowSystem';

/**
 * ==============================================================================
 * 3D烟花秀组件 - 沉浸式3D烟花体验
 * 特点:
 *   - 3D透视渲染
 *   - 粒子尾迹效果
 *   - 多彩火花系统
 *   - 自动视角旋转
 *   - 地面网格参照
 *   - 中央文字显示
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fireworkSystemRef = useRef<Firework3DShowSystem | null>(null);

    // 音效引用
    const audioPoolRef = useRef<HTMLAudioElement[]>([]);
    const audioCursorRef = useRef(0);

    const [currentText, setCurrentText] = useState(config.displayText);
    const [showWelcome, setShowWelcome] = useState(true);

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

    // 初始化音效池
    useEffect(() => {
        if (typeof window === 'undefined') return;

        audioPoolRef.current = [];
        for (let i = 0; i < 8; i++) {
            const audio = new Audio(AUDIO_SOURCES.burst[i % AUDIO_SOURCES.burst.length]);
            audio.preload = 'auto';
            audio.volume = 0.4;
            audioPoolRef.current.push(audio);
        }
    }, []);

    // 播放爆炸音效
    const playBurstSound = useCallback(() => {
        if (!config.enableSound || isMuted) return;

        const audio = audioPoolRef.current[audioCursorRef.current];
        if (audio) {
            audio.volume = 0.3;
            audio.currentTime = 0;
            audio.play().catch(() => { });
            audioCursorRef.current = (audioCursorRef.current + 1) % audioPoolRef.current.length;
        }
    }, [config.enableSound, isMuted]);

    // 文字轮播
    useEffect(() => {
        if (showWelcome) return;

        const greetings = config.greetings.length > 0 ? config.greetings : ['新年快乐', '万事如意'];
        let index = 0;
        setCurrentText(greetings[0] || config.displayText);

        const interval = setInterval(() => {
            index = (index + 1) % greetings.length;
            setCurrentText(greetings[index]);
        }, 5000);

        return () => clearInterval(interval);
    }, [config.greetings, config.displayText, showWelcome]);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    // 初始化和配置更新
    useEffect(() => {
        if (showWelcome) return;

        if (!fireworkSystemRef.current) {
            fireworkSystemRef.current = new Firework3DShowSystem({
                fireworkDensity: config.fireworkDensity,
                particleCount: config.particleCount,
                trailLength: config.trailLength,
                autoRotate: config.autoRotate,
                rotateSpeed: config.rotateSpeed,
            });
        } else {
            fireworkSystemRef.current.updateConfig({
                fireworkDensity: config.fireworkDensity,
                particleCount: config.particleCount,
                trailLength: config.trailLength,
                autoRotate: config.autoRotate,
                rotateSpeed: config.rotateSpeed,
            });
        }
    }, [showWelcome, config.fireworkDensity, config.particleCount, config.trailLength, config.autoRotate, config.rotateSpeed]);

    // 主渲染循环
    useEffect(() => {
        if (showWelcome) return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current || !fireworkSystemRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            fireworkSystemRef.current?.resize(canvas.width, canvas.height);
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制中央文字
            const fontSize = Math.min(160, canvas.width / 6);
            ctx.font = `bold ${fontSize}px "Microsoft YaHei", "Heiti SC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 文字发光效果
            ctx.shadowColor = '#ff8844';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = '#ffaa66';
            ctx.lineWidth = 2;
            ctx.strokeText(currentText, cx, cy);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
            ctx.fillText(currentText, cx, cy);

            // 绘制3D烟花
            fireworkSystemRef.current?.draw(ctx, config.showGround);
        };

        const frame = () => {
            fireworkSystemRef.current?.update();
            draw();
            rafId = requestAnimationFrame(frame);
        };

        frame();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [showWelcome, config.showGround, currentText]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 烟花Canvas */}
            {!showWelcome && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-10 block"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/80" />
                    <div className="relative text-center px-4">
                        <div className="mb-8">
                            <span
                                className="text-8xl md:text-9xl"
                                style={{
                                    filter: 'drop-shadow(0 0 40px rgba(255, 136, 68, 0.8))',
                                    animation: 'pulse-3d 2s ease-in-out infinite',
                                }}
                            >
                                🎆
                            </span>
                        </div>

                        <h1
                            className="text-4xl md:text-6xl font-bold mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #ff8844, #ffaa66, #ffcc88)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 40px rgba(255, 136, 68, 0.5)',
                            }}
                        >
                            3D烟花秀
                        </h1>

                        <p className="text-white/70 text-lg md:text-xl mb-10 tracking-widest">
                            沉浸式3D视觉体验
                        </p>

                        <button
                            onClick={startAnimation}
                            className="relative px-12 py-5 rounded-full text-xl font-semibold overflow-hidden group transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #ff6600, #ff8844, #ffaa66)',
                                boxShadow: '0 0 40px rgba(255, 136, 68, 0.5), 0 0 80px rgba(255, 136, 68, 0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3 text-white">
                                <span className="text-2xl">🎇</span>
                                开始3D烟花秀
                                <span className="text-2xl">🎇</span>
                            </span>
                            <div
                                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* 底部提示 */}
            {!showWelcome && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                    <div className="text-white/40 text-sm">
                        ✨ 沉浸在3D烟花的绚烂世界 ✨
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

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes pulse-3d {
                    0%, 100% {
                        transform: scale(1) rotateY(0deg);
                    }
                    50% {
                        transform: scale(1.1) rotateY(10deg);
                    }
                }
                
                .bg-gradient-radial {
                    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%);
                }
            `}</style>
        </div>
    );
}

export default function FireworkShow3dPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}

export { DEFAULT_CONFIG, fireworkShow3dCardConfigMetadata, fireworkShow3dConfigMetadata };
