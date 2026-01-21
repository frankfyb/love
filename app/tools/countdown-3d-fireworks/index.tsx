'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import type { AppConfig } from './config';
import { DEFAULT_CONFIG, countdown3dFireworksCardConfigMetadata, countdown3dFireworksConfigMetadata } from './config';
import { Dot, Point, generateTextShape } from './ParticleSystem';
import { Fireworks3DSystem } from './Fireworks3DSystem';

/**
 * ==============================================================================
 * 3D烟花倒计时组件 - 浪漫3D烟花秀
 * 特点:
 *   - 震撼的3D烟花粒子效果
 *   - 响应式设计（移动端/PC端完美适配）
 *   - 浪漫的文字粒子变形动画
 *   - 自定义倒计时与庆祝文字
 *   - 飘落爱心与星光效果
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const fireworksCanvasRef = useRef<HTMLCanvasElement>(null);
    const shapeCanvasRef = useRef<HTMLCanvasElement>(null);
    const textCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [show3DAnimation, setShow3DAnimation] = useState(false);

    const dotsRef = useRef<Dot[]>([]);
    const fireworks3DRef = useRef<Fireworks3DSystem | null>(null);
    const sequenceRef = useRef<string[]>([]);
    const currentActionRef = useRef<number>(0);
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 切换形状
    const switchShape = useCallback((text: string, fast: boolean = false) => {
        const canvas = textCanvasRef.current;
        if (!canvas) return;

        const n = generateTextShape(text, canvas);
        const area = { w: window.innerWidth, h: window.innerHeight };
        const cx = area.w / 2 - n.w / 2;
        const cy = area.h / 2 - n.h / 2;

        // 确保有足够的粒子
        if (n.dots.length > dotsRef.current.length) {
            const size = n.dots.length - dotsRef.current.length;
            for (let d = 0; d < size; d++) {
                dotsRef.current.push(new Dot(area.w / 2, area.h / 2));
            }
        }

        let d = 0;
        const tempDots = [...n.dots];

        while (tempDots.length > 0) {
            const i = Math.floor(Math.random() * tempDots.length);
            const dot = dotsRef.current[d];

            // 大幅加快粒子移动速度
            dot.e = fast ? 0.35 : 0.25;

            if (dot.s) {
                dot.move(new Point({
                    z: Math.random() * 15 + 8,
                    a: Math.random() * 0.5 + 0.5,
                    h: 5 // 减少中间状态等待
                }));
            } else {
                dot.move(new Point({
                    z: Math.random() * 8 + 6,
                    h: fast ? 5 : 10
                }));
            }

            dot.s = true;
            dot.move(new Point({
                x: tempDots[i].x + cx,
                y: tempDots[i].y + cy,
                a: 1,
                z: 6, // 稍大的粒子
                h: 0
            }));

            tempDots.splice(i, 1);
            d++;
        }

        // 快速隐藏多余的粒子
        for (let i = d; i < dotsRef.current.length; i++) {
            const dot = dotsRef.current[i];
            if (dot.s) {
                // 让多余粒子快速飞散并消失
                dot.e = 0.3; // 加快移动
                dot.move(new Point({
                    z: 1,
                    a: 0,
                    h: 3
                }));

                dot.s = false;
                dot.move(new Point({
                    x: Math.random() * area.w,
                    y: Math.random() * area.h,
                    a: 0,
                    z: 0.5,
                    h: 0
                }));
            }
        }
    }, []);

    // 倒计时逻辑
    useEffect(() => {
        const calc = () => {
            const diff = new Date(config.targetDate).getTime() - new Date().getTime();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff % 86400000) / 3600000),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000),
                });
                setIsTimeUp(false);
                setShow3DAnimation(false);
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (!isTimeUp) {
                    setIsTimeUp(true);
                    setShow3DAnimation(true);
                }
            }
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, [config.targetDate, isTimeUp]);

    // 3D动画序列控制
    useEffect(() => {
        if (!show3DAnimation) return;

        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

        const countdownNum = parseInt(config.countdownText) || 3;
        const celebrationList = Array.isArray(config.celebrationText)
            ? config.celebrationText
            : config.celebrationText.toString().split('\n').filter((s: string) => s.trim() !== '');

        const sequence: string[] = [];
        for (let i = countdownNum; i > 0; i--) {
            sequence.push(i.toString());
        }
        sequence.push(...celebrationList);

        sequenceRef.current = sequence;
        currentActionRef.current = 0;

        const playNextAnimation = () => {
            if (currentActionRef.current < sequenceRef.current.length) {
                const text = sequenceRef.current[currentActionRef.current];
                const isCountdownPhase = currentActionRef.current < countdownNum;

                switchShape(text || '', isCountdownPhase);
                currentActionRef.current++;

                // 增加显示时间：倒计时1.5秒，庆祝文字3.5秒
                const delay = isCountdownPhase ? 1500 : 3500;
                animationTimerRef.current = setTimeout(playNextAnimation, delay);
            } else {
                // 循环播放庆祝文字，间隔2秒
                currentActionRef.current = countdownNum;
                animationTimerRef.current = setTimeout(playNextAnimation, 2000);
            }
        };

        animationTimerRef.current = setTimeout(playNextAnimation, 500);

        return () => {
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        };
    }, [show3DAnimation, config.countdownText, config.celebrationText, switchShape]);

    // 烟花和粒子渲染循环
    useEffect(() => {
        const fireworksCanvas = fireworksCanvasRef.current;
        const shapeCanvas = shapeCanvasRef.current;
        if (!fireworksCanvas || !shapeCanvas || !containerRef.current) return;

        const fireworksCtx = fireworksCanvas.getContext('2d');
        const shapeCtx = shapeCanvas.getContext('2d');
        if (!fireworksCtx || !shapeCtx) return;

        // 初始化3D烟花系统
        if (!fireworks3DRef.current) {
            fireworks3DRef.current = new Fireworks3DSystem();
        }

        let rafId: number;

        const resize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            fireworksCanvas.width = w;
            fireworksCanvas.height = h;
            shapeCanvas.width = w;
            shapeCanvas.height = h;
            fireworks3DRef.current?.resize(w, h);
        };

        resize();
        window.addEventListener('resize', resize);

        const loop = () => {
            // 清空画布
            fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
            shapeCtx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);

            // 绘制3D烟花 (始终显示)
            fireworks3DRef.current?.update();
            fireworks3DRef.current?.draw(fireworksCtx);

            // 绘制文字粒子 (3D动画阶段)
            if (show3DAnimation) {
                for (const dot of dotsRef.current) {
                    dot.render(shapeCtx);
                }
            }

            rafId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [show3DAnimation]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 3D烟花Canvas */}
            <canvas
                ref={fireworksCanvasRef}
                className="absolute inset-0 z-10 block"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 文字粒子Canvas */}
            <canvas
                ref={shapeCanvasRef}
                className="absolute inset-0 z-20 block"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 隐藏的形状生成Canvas */}
            <canvas ref={textCanvasRef} style={{ display: 'none' }} />

            {/* 倒计时UI - 时间未到时显示 */}
            {!isTimeUp && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4 safe-area-inset">
                    {/* 添加半透明背景遮罩提高文字可读性 */}
                    <div
                        className="text-center animate-fade-in relative px-8 py-10 sm:px-12 sm:py-14 rounded-3xl"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                    >
                        {config.recipientName && (
                            <div
                                className="text-lg sm:text-xl md:text-3xl mb-4 sm:mb-6 font-serif tracking-wider sm:tracking-widest relative"
                                style={{
                                    background: 'linear-gradient(to right, #ff69b4, #ffae00, #ff0043)',
                                    backgroundSize: '200% auto',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'gradient-flow 3s ease infinite',
                                    filter: 'drop-shadow(0 0 20px rgba(255,174,0,0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                                }}
                            >
                                {config.recipientName}
                            </div>
                        )}
                        <h1
                            className="text-white text-sm sm:text-lg md:text-2xl mb-6 sm:mb-8 tracking-[0.2em] sm:tracking-[0.4em] font-light"
                            style={{
                                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.8)',
                            }}
                        >
                            {config.titleText}
                        </h1>
                        <div className="flex items-start justify-center gap-2 sm:gap-3 md:gap-8">
                            <TimeUnit num={timeLeft.days} label="DAYS" />
                            <Separator />
                            <TimeUnit num={timeLeft.hours} label="HOURS" />
                            <Separator />
                            <TimeUnit num={timeLeft.minutes} label="MINS" />
                            <Separator />
                            <TimeUnit num={timeLeft.seconds} label="SECS" isSeconds />
                        </div>
                    </div>
                </div>
            )}

            {/* 测试按钮 - 立即触发3D动画 */}
            {!isTimeUp && (
                <div className="absolute bottom-20 left-4 z-40 pointer-events-auto">
                    <button
                        onClick={() => {
                            setIsTimeUp(true);
                            setShow3DAnimation(true);
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
                    >
                        🎆 预览3D效果
                    </button>
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
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }

                .safe-area-inset {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }

                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const Separator = () => (
    <div
        className="text-xl md:text-5xl text-white/40 font-light mt-1 md:mt-2"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
    >
        :
    </div>
);

function TimeUnit({ num, label, isSeconds = false }: { num: number; label: string; isSeconds?: boolean }) {
    return (
        <div className="flex flex-col items-center w-14 md:w-24">
            <span
                className="font-['Inter'] font-semibold tabular-nums leading-none tracking-tight"
                style={{
                    fontSize: isSeconds ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
                    color: isSeconds ? '#FFD700' : '#ffffff',
                    textShadow: isSeconds
                        ? '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4), 0 2px 8px rgba(0,0,0,0.9)'
                        : '0 0 20px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.9)',
                }}
            >
                {num.toString().padStart(2, '0')}
            </span>
            <span
                className="text-[9px] md:text-xs text-white/60 mt-2 tracking-widest"
                style={{
                    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}
            >
                {label}
            </span>
        </div>
    );
}

export default function Countdown3DFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}

export { DEFAULT_CONFIG, countdown3dFireworksCardConfigMetadata, countdown3dFireworksConfigMetadata };
