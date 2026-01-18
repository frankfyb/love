'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 文字烟花组件 - 浪漫文字烟花系统
 * 参考: 2024 新年快乐 音乐好听321
 * 特点: 
 *   - 文字粒子效果 (文字爆炸成粒子形状)
 *   - 闪烁星空背景
 *   - 双层烟花系统 (普通烟花 + 文字烟花)
 *   - 浪漫配色与动画效果
 * ==============================================================================
 */

export interface AppConfig {
    titleText: string;
    subText: string;
    greetingText: string;
    autoLaunch: boolean;
    launchInterval: number;
    textInterval: number;
    starCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('text-fireworks'),
    music: [
        { label: '浪漫新年', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '温暖钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '2026 新年快乐！',
    subText: '龙年大吉',
    greetingText: '愿新的一年\n所有美好如期而至\n所有等待都有回应',
    autoLaunch: true,
    launchInterval: 200,
    textInterval: 5000,
    starCount: 250,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const textFireworksCardConfigMetadata = {
    panelTitle: '文字烟花配置',
    panelSubtitle: '绽放专属你的浪漫祝福',
    configSchema: {
        titleText: { category: 'content' as const, type: 'input' as const, label: '主标题', placeholder: '2026 新年快乐！' },
        subText: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: '龙年大吉' },
        greetingText: { category: 'content' as const, type: 'textarea' as const, label: '祝福语', placeholder: '输入你的祝福...', rows: 4 },

        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        launchInterval: { category: 'visual' as const, type: 'slider' as const, label: '发射间隔(ms)', min: 100, max: 500, step: 50 },
        textInterval: { category: 'visual' as const, type: 'slider' as const, label: '文字间隔(ms)', min: 3000, max: 10000, step: 1000 },
        starCount: { category: 'visual' as const, type: 'slider' as const, label: '星星数量', min: 100, max: 500, step: 50 },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '祝福内容', icon: null, fields: ['titleText' as const, 'subText' as const, 'greetingText' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoLaunch' as const, 'launchInterval' as const, 'textInterval' as const, 'starCount' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 常量和工具函数
// ============================================================================
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const GRAVITY = 0.1;

// ============================================================================
// 文字转点阵函数
// ============================================================================
function textToPoints(text: string, textSize: number, font: string): { x: number; y: number }[] {
    if (typeof window === 'undefined') return [];

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = textSize * 1.5;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.textBaseline = 'middle';
    ctx.font = `bold ${textSize}px ${font}`;
    ctx.fillStyle = 'white';
    ctx.fillText(text, 0, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const points: { x: number; y: number }[] = [];
    const threshold = 50;
    const step = 2; // 采样步长，减少点数提高性能

    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const index = (x + y * canvas.width) * 4;
            if (data[index + 3] > threshold) {
                // 边缘检测，只保留边缘点
                const neighbors = [
                    [x + step, y],
                    [x - step, y],
                    [x, y + step],
                    [x, y - step]
                ];

                let isEdge = false;
                for (const [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                        const ni = (nx + ny * canvas.width) * 4;
                        if (data[ni + 3] < threshold) {
                            isEdge = true;
                            break;
                        }
                    } else {
                        isEdge = true;
                        break;
                    }
                }

                if (isEdge) {
                    points.push({ x: x / step, y: y / step });
                }
            }
        }
    }

    return points;
}

// ============================================================================
// 粒子类定义
// ============================================================================
interface Star {
    x: number;
    y: number;
    size: number;
    alpha: number;
    twinkleSpeed: number;
}

interface TitleParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    ay: number;
    radius: number;
    maxHealth: number;
    health: number;
    color: string;
}

interface Firework {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    isTitle: boolean;
    exploded: boolean;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: [number, number, number];
    radius: number;
}

// ============================================================================
// 主组件
// ============================================================================
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 粒子引用
    const starsRef = useRef<Star[]>([]);
    const fireworksRef = useRef<Firework[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const titleParticlesRef = useRef<TitleParticle[]>([]);
    const textPointsRef = useRef<{ x: number; y: number }[]>([]);
    const starImageRef = useRef<HTMLImageElement | null>(null);

    // 定时器引用
    const normalTimerRef = useRef<number>(0);
    const titleTimerRef = useRef<number>(0);

    const [displayText, setDisplayText] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);

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

    // 生成文字点阵
    useEffect(() => {
        const points = textToPoints(config.titleText, 20, 'Arial, sans-serif');
        textPointsRef.current = points;
    }, [config.titleText]);

    // 生成星空背景
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 创建星星
        starsRef.current = [];
        for (let i = 0; i < config.starCount; i++) {
            starsRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.005,
            });
        }

        // 创建星空背景图像
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.fillStyle = 'black';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            starsRef.current.forEach(star => {
                tempCtx.beginPath();
                tempCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                tempCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                tempCtx.fill();
            });

            const img = new Image();
            img.src = tempCanvas.toDataURL();
            starImageRef.current = img;
        }
    }, [config.starCount]);

    // 打字机效果
    useEffect(() => {
        const fullText = config.greetingText;
        let index = 0;

        const timer = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(timer);
                setShowGreeting(true);
            }
        }, 100);

        return () => clearInterval(timer);
    }, [config.greetingText]);

    // 发射普通烟花
    const launchFirework = useCallback((isTitle = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = canvas.width;
        const h = canvas.height;

        const firework: Firework = {
            x: isTitle ? w / 2 : random(w * 0.1, w * 0.9),
            y: h,
            vx: isTitle ? 0 : random(-0.5, 0.5),
            vy: isTitle ? -9.5 : -(random(5, 7) + 5),
            radius: isTitle ? 10 : 5,
            color: isTitle ? '#FFD700' : `hsl(${random(0, 360)}, 100%, 75%)`,
            isTitle,
            exploded: false,
        };

        fireworksRef.current.push(firework);
    }, []);

    // 创建文字粒子爆炸
    const createTitleExplosion = useCallback((x: number, y: number) => {
        const points = textPointsRef.current;
        const scale = 0.5;
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

        points.forEach(p => {
            const particle: TitleParticle = {
                x,
                y,
                vx: (p.x - 60) * scale + random(-0.1, 0.1),
                vy: (p.y - 15) * scale + random(-0.1, 0.1),
                ay: 0.15,
                radius: 3,
                maxHealth: 180,
                health: 180,
                color: colors[Math.floor(Math.random() * colors.length)],
            };
            titleParticlesRef.current.push(particle);
        });
    }, []);

    // 创建普通烟花爆炸
    const createExplosion = useCallback((x: number, y: number, hue: number) => {
        const color: [number, number, number] = [
            Math.floor(random(100, 256)),
            Math.floor(random(100, 256)),
            Math.floor(random(100, 256)),
        ];

        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const power = random(0.5, 1) * 4;
            const particle: Particle = {
                x,
                y,
                vx: Math.cos(angle) * power,
                vy: Math.sin(angle) * power,
                life: 100,
                maxLife: 100,
                color,
                radius: random(2, 4),
            };
            particlesRef.current.push(particle);
        }
    }, []);

    // 点击发射
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 点击位置发射烟花
        const firework: Firework = {
            x: random(canvas.width * 0.3, canvas.width * 0.7),
            y: canvas.height,
            vx: (x - canvas.width / 2) * 0.01,
            vy: -Math.sqrt((canvas.height - y) * 0.15 + 49),
            radius: 6,
            color: `hsl(${random(0, 360)}, 100%, 70%)`,
            isTitle: false,
            exploded: false,
        };
        fireworksRef.current.push(firework);
    }, []);

    // 主渲染循环
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        let lastNormalLaunch = 0;
        let lastTitleLaunch = 0;

        const resize = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const loop = (timestamp: number) => {
            const width = canvas.width;
            const height = canvas.height;

            // 清除背景
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // 绘制星空背景
            if (starImageRef.current && starImageRef.current.complete) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(starImageRef.current, 0, 0, width, height);
                ctx.globalAlpha = 1;
            }

            // 绘制闪烁星星
            starsRef.current.forEach(star => {
                star.alpha += star.twinkleSpeed;
                if (star.alpha > 1 || star.alpha < 0.2) {
                    star.twinkleSpeed = -star.twinkleSpeed;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.8})`;
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'lighter';

            // 自动发射烟花
            if (config.autoLaunch) {
                if (timestamp - lastNormalLaunch > config.launchInterval) {
                    launchFirework(false);
                    lastNormalLaunch = timestamp;
                }
                if (timestamp - lastTitleLaunch > config.textInterval) {
                    launchFirework(true);
                    lastTitleLaunch = timestamp;
                }
            }

            // 更新和绘制烟花
            for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
                const fw = fireworksRef.current[i];

                fw.x += fw.vx;
                fw.y += fw.vy;
                fw.vy += GRAVITY;

                // 绘制烟花尾迹
                ctx.beginPath();
                ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
                ctx.fillStyle = fw.color;
                ctx.fill();

                // 检查是否爆炸
                if (fw.vy >= 0) {
                    if (fw.isTitle) {
                        createTitleExplosion(fw.x, fw.y);
                    } else {
                        createExplosion(fw.x, fw.y, 0);
                    }
                    fireworksRef.current.splice(i, 1);
                }
            }

            // 更新和绘制文字粒子
            for (let i = titleParticlesRef.current.length - 1; i >= 0; i--) {
                const p = titleParticlesRef.current[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.vy += p.ay;
                p.ay *= 0.95;

                p.radius = (p.health / p.maxHealth) * 4;
                p.health--;

                if (p.health <= 0) {
                    titleParticlesRef.current.splice(i, 1);
                } else {
                    const alpha = p.health / p.maxHealth;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

                    // 渐变效果
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                    gradient.addColorStop(0.4, `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
                    gradient.addColorStop(1, `rgba(255, 200, 100, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            }

            // 更新和绘制普通粒子
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += GRAVITY;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.life--;

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                } else {
                    const alpha = p.life / p.maxLife;
                    const size = 3 * alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
                    ctx.fill();
                }
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.autoLaunch, config.launchInterval, config.textInterval, launchFirework, createTitleExplosion, createExplosion]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 烟花Canvas */}
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                className="absolute inset-0 z-10 block cursor-crosshair"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 文字层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-end pb-24 px-8">
                <div className="text-center max-w-2xl">
                    {/* 副标题 */}
                    <div className="text-white/70 text-lg md:text-xl mb-4 tracking-widest font-light">
                        {config.subText}
                    </div>

                    {/* 打字机效果文字 */}
                    <div className="text-white/90 text-base md:text-lg whitespace-pre-line leading-relaxed font-serif tracking-wide drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-lg p-6">
                        {displayText}
                        <span className="animate-pulse text-yellow-400">|</span>
                    </div>
                </div>
            </div>

            {/* 点击提示 */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div className="text-white/60 text-sm animate-bounce">
                    ✨ 点击屏幕放烟花 ✨
                </div>
            </div>

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
        </div>
    );
}

export default function TextFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
