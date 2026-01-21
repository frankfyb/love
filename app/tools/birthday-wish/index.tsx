'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和模块
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
    BALLOON_GRADIENTS,
    Balloon,
    generateBalloons,
} from './config';

import { Firework, FireworkParticle, HeartCanvas } from './ParticleSystem';
import { FloatingHeartsLayer, SparklesLayer } from './EffectLayers';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { birthdayWishConfigMetadata } from './config';

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

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [countdown, setCountdown] = useState(config.enableCountdown ? config.countdownSeconds : 0);
    const [showMessage, setShowMessage] = useState(!config.enableCountdown);
    const [spotlightPosition, setSpotlightPosition] = useState(0);
    const [textCharColors, setTextCharColors] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 音效控制
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

    // 生成气球数据
    const balloons = useMemo((): Balloon[] => generateBalloons(isMobile), [isMobile]);

    // 倒计时效果
    useEffect(() => {
        if (!config.enableCountdown) {
            setShowMessage(true);
            return;
        }

        setCountdown(config.countdownSeconds);
        setShowMessage(false);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowMessage(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [config.enableCountdown, config.countdownSeconds]);

    // 聚光灯动画
    useEffect(() => {
        if (config.effectMode !== 'spotlight') return;

        const animate = () => {
            setSpotlightPosition(prev => {
                const newPos = prev + 0.5;
                return newPos > 100 ? 0 : newPos;
            });
        };

        const interval = setInterval(animate, 50);
        return () => clearInterval(interval);
    }, [config.effectMode]);

    // 霓虹文字闪烁效果
    useEffect(() => {
        if (config.effectMode !== 'fireworks-text') return;

        const text = `${config.recipientName} ${config.birthdayMessage}`;

        const flash = () => {
            const colors = text.split('').map(() => {
                const hue = Math.random() * 360;
                const isWhite = Math.random() > 0.7;
                return isWhite ? 'rgba(255,255,255,0.3)' : `hsl(${hue}, 50%, 50%)`;
            });
            setTextCharColors(colors);
        };

        const interval = setInterval(flash, 1000);
        flash();
        return () => clearInterval(interval);
    }, [config.effectMode, config.recipientName, config.birthdayMessage]);

    // 烟花效果Canvas
    useEffect(() => {
        if (config.effectMode !== 'fireworks-text') return;

        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const fireworks: Firework[] = [];
        const particles: FireworkParticle[] = [];

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 初始化烟花
        const initFireworks = () => {
            const count = isMobile ? 2 : Math.max(3, Math.floor(canvas.width / 200));
            for (let i = 0; i < count; i++) {
                fireworks.push(new Firework(canvas.width, canvas.height, isMobile));
            }
        };
        initFireworks();

        const loop = () => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            for (let i = fireworks.length - 1; i >= 0; i--) {
                const newParticles = fireworks[i].update();
                particles.push(...newParticles);
                fireworks[i].draw(ctx);

                if (!fireworks[i].isAlive()) {
                    fireworks.splice(i, 1);
                    fireworks.push(new Firework(canvas.width, canvas.height, isMobile));
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw(ctx);

                if (!particles[i].isAlive()) {
                    particles.splice(i, 1);
                }
            }

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [config.effectMode, isMobile]);

    // 渲染霓虹闪烁文字
    const renderNeonText = () => {
        const text = `${config.recipientName} ${config.birthdayMessage}`;
        return (
            <div className="flex flex-wrap justify-center gap-1 px-4">
                {text.split('').map((char, index) => {
                    const color = textCharColors[index] || 'white';
                    return (
                        <span
                            key={index}
                            className="transition-all duration-300"
                            style={{
                                color: color,
                                textShadow: `0 0 5px ${color}, 0 0 10px ${color}, 0 0 20px ${color}`,
                                fontSize: isMobile ? `${2.5 + Math.random() * 1.5}rem` : `${4 + Math.random() * 3}rem`,
                            }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    );
                })}
            </div>
        );
    };

    // 渲染不同效果模式
    const renderEffect = () => {
        switch (config.effectMode) {
            case 'fireworks-text':
                return (
                    <>
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 z-10 w-full h-full"
                        />
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            {showMessage && renderNeonText()}
                        </div>
                    </>
                );

            case 'balloon-party':
                return (
                    <>
                        <style jsx>{`
                            @keyframes floatUp {
                                from { top: 100%; }
                                to { top: -55%; }
                            }
                            .balloon {
                                position: absolute;
                                border: 2px solid rgba(0,0,0,0.2);
                                border-radius: 50% 50% 50% 50% / 45% 45% 55% 55%;
                                opacity: 0.9;
                                animation: floatUp 6s ease-in-out infinite;
                                z-index: 1;
                                box-shadow: inset -10px -10px 30px rgba(255,255,255,0.3), 
                                            inset 10px 10px 30px rgba(0,0,0,0.1);
                            }
                            .balloon::before {
                                content: '';
                                position: absolute;
                                top: 100%;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 3px;
                                height: 50%;
                                background: linear-gradient(to bottom, currentColor 0%, transparent 100%);
                                opacity: 0.5;
                            }
                        `}</style>
                        <div className="absolute inset-0 z-10 overflow-hidden">
                            {balloons.map(balloon => (
                                <div
                                    key={balloon.id}
                                    className="balloon"
                                    style={{
                                        width: `${balloon.width}px`,
                                        height: `${balloon.width * 1.2}px`,
                                        left: balloon.left,
                                        animationDelay: `${balloon.delay * 0.12}s`,
                                        background: `linear-gradient(135deg, ${balloon.gradientStart}, ${balloon.gradientEnd})`,
                                        color: balloon.gradientEnd,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
                            {showMessage && (
                                <div className="text-center">
                                    <h1
                                        className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider mb-2 sm:mb-4"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: `2px 2px 4px rgba(0,0,0,0.3), 0 0 20px ${config.textColor}50`,
                                        }}
                                    >
                                        {config.recipientName}
                                    </h1>
                                    <h2
                                        className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold"
                                        style={{
                                            color: config.textColor,
                                            fontFamily: '"Courgette", cursive',
                                            textShadow: `2px 2px 4px rgba(0,0,0,0.3), 0 0 20px ${config.textColor}50`,
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
                                    <div className="mt-4 sm:mt-6 text-4xl sm:text-5xl md:text-6xl animate-bounce">
                                        🎂
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'spotlight':
                return (
                    <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
                        {showMessage && (
                            <h1
                                className="relative text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-center"
                                style={{ color: '#333' }}
                            >
                                {`${config.recipientName} ${config.birthdayMessage}`}
                                <span
                                    className="absolute inset-0"
                                    style={{
                                        color: 'transparent',
                                        backgroundImage: 'linear-gradient(to right, #ff69b4, #ff1493, #8b5cf6, #fbbf24, #ff6b9d, #ec4899, #a855f7, #f472b6)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        clipPath: `circle(${isMobile ? '60px' : '100px'} at ${spotlightPosition}% 50%)`,
                                    }}
                                >
                                    {`${config.recipientName} ${config.birthdayMessage}`}
                                </span>
                            </h1>
                        )}
                    </div>
                );

            case 'heart-blessing':
                return (
                    <>
                        <HeartCanvas color={config.textColor} isMobile={isMobile} />
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none px-4">
                            {showMessage && (
                                <div
                                    className="text-center p-4 sm:p-6 rounded-2xl max-w-[90vw]"
                                    style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-light text-pink-200 tracking-wider mb-2 sm:mb-4">
                                        💕 {config.recipientName} 💕
                                    </h1>
                                    <h2
                                        className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wider"
                                        style={{
                                            color: config.textColor,
                                            textShadow: `0 0 20px ${config.textColor}88, 0 0 40px ${config.textColor}44`,
                                        }}
                                    >
                                        {config.birthdayMessage}
                                    </h2>
                                    <div className="mt-4 text-3xl sm:text-4xl">
                                        🎂✨🎉
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full overflow-hidden select-none touch-none"
            style={{
                background: config.effectMode === 'balloon-party' ? '#fffaf0' : '#000000',
            }}
        >
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 浪漫叠加层 */}
            <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    background: config.effectMode !== 'balloon-party'
                        ? `radial-gradient(ellipse 80% 50% at 50% 0%, ${config.textColor}10 0%, transparent 50%)`
                        : 'none',
                }}
            />

            {/* 3. 飘落爱心层 */}
            <FloatingHeartsLayer enabled={config.showFloatingHearts} color={config.textColor} />

            {/* 4. 星光层 */}
            <SparklesLayer enabled={config.showSparkles} />

            {/* 5. 效果层 */}
            {renderEffect()}

            {/* 6. 倒计时层 */}
            {config.enableCountdown && countdown > 0 && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 safe-area-inset">
                    <div className="text-center">
                        <div className="text-white/60 text-lg sm:text-xl mb-4 sm:mb-6 tracking-widest">
                            ✨ 惊喜即将揭晓 ✨
                        </div>
                        <div
                            className="text-7xl sm:text-8xl md:text-9xl font-bold"
                            style={{
                                color: config.textColor,
                                textShadow: `0 0 30px ${config.textColor}, 0 0 60px ${config.textColor}, 0 0 90px ${config.textColor}50`,
                                animation: 'pulse 1s ease-in-out infinite',
                            }}
                        >
                            {countdown}
                        </div>
                        <div className="mt-6 sm:mt-8 text-4xl sm:text-5xl animate-bounce">
                            🎁
                        </div>
                    </div>
                </div>
            )}

            {/* 7. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 8. 效果模式指示 */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/60 text-xs sm:text-sm">
                    {PRESETS.effectModes.find(m => m.value === config.effectMode)?.label || '🎈 气球派对'}
                </div>
            </div>

            {/* 自定义动画样式 */}
            <style jsx global>{`
                @keyframes sparkle-twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .safe-area-inset {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }

                .touch-none {
                    touch-action: none;
                    -webkit-overflow-scrolling: auto;
                }
            `}</style>
        </div>
    );
}

export default function BirthdayWishPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
