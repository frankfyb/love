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
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
    recipientName: string;
    centerText: string;
    floatingTexts: string[];
    heartColor: string;
    effectMode: 'pulse' | 'meteor' | 'matrix' | 'floating';
    particleCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 浪漫心形曲线颜色
const ROMANTIC_COLORS = [
    '#ff6b9d', '#ff8fab', '#ffb3c6', '#ffc2d1',
    '#ea80b0', '#ff69b4', '#ff1493', '#db7093',
    '#e91e63', '#f48fb1', '#f8bbd9', '#fce4ec'
];

// 浮动文字颜色板
const FLOATING_COLORS = [
    '#eea2a4', '#8fb7d3', '#b7d4c6', '#c3bedd',
    '#f1d5e4', '#cae1d3', '#f3c89d', '#d0b0c3',
    '#819d53', '#c99294', '#cec884', '#ff8e70',
    '#e0a111', '#fffdf6', '#cbd7ac', '#e8c6c0',
    '#dc9898', '#ecc8ba', '#5d3f51', '#61649f'
];

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('romantic-hearts'),
    music: [
        { label: '浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔情歌', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '甜蜜旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    effectModes: [
        { label: '❤️ 心跳脉动', value: 'pulse' },
        { label: '🌠 流星浪漫', value: 'meteor' },
        { label: '💫 黑客风格', value: 'matrix' },
        { label: '🎈 漂浮文字', value: 'floating' },
    ],
    floatingTextTemplates: [
        '💗 I Love You 💗',
        '❤️',
        '你是我的唯一',
        '永远爱你',
        '宝贝',
        '心心相印',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '致我最爱的你',
    centerText: '❤ 永远爱你 ❤',
    floatingTexts: PRESETS.floatingTextTemplates,
    heartColor: '#ea80b0',
    effectMode: 'pulse',
    particleCount: 500,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a1a' },
        0.1
    ),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const romanticHeartsConfigMetadata = {
    panelTitle: '浪漫爱心配置',
    panelSubtitle: 'Romantic Hearts Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的小曾' },
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '❤ 永远爱你 ❤' },
        floatingTexts: { category: 'content' as const, type: 'list' as const, label: '飘动文字', placeholder: '输入要飘动的文字', description: '每行一句，随机出现' },

        effectMode: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '效果模式',
            options: PRESETS.effectModes
        },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '爱心颜色' },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '粒子数量', min: 100, max: 1000, step: 50 },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你最喜爱的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 2, label: '飘动文字', icon: null, fields: ['floatingTexts' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['effectMode' as const, 'heartColor' as const, 'particleCount' as const] },
        { id: 4, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

/**
 * ==============================================================================
 * 2. 粒子系统类 (Particle System Classes)
 * ==============================================================================
 */

// 点类
class Point {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    length(len?: number): number | Point {
        if (typeof len === 'undefined') {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= len;
        this.y *= len;
        return this;
    }

    normalize(): Point {
        const len = this.length() as number;
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
}

// 心形粒子设置
const PARTICLE_SETTINGS = {
    length: 500,
    duration: 2,
    velocity: 100,
    effect: -0.75,
    size: 30,
};

// 心形粒子类
class HeartParticle {
    position: Point;
    velocity: Point;
    acceleration: Point;
    age: number;

    constructor() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }

    initialize(x: number, y: number, dx: number, dy: number) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * PARTICLE_SETTINGS.effect;
        this.acceleration.y = dy * PARTICLE_SETTINGS.effect;
        this.age = 0;
    }

    update(deltaTime: number) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    }

    draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        const ease = (t: number) => (--t) * t * t + 1;
        const size = image.width * ease(this.age / PARTICLE_SETTINGS.duration);
        context.globalAlpha = 1 - this.age / PARTICLE_SETTINGS.duration;
        context.drawImage(
            image,
            this.position.x - size / 2,
            this.position.y - size / 2,
            size,
            size
        );
    }
}

// 粒子池类
class ParticlePool {
    private particles: HeartParticle[];
    private firstActive: number = 0;
    private firstFree: number = 0;
    private duration: number;

    constructor(length: number) {
        this.particles = new Array(length);
        for (let i = 0; i < length; i++) {
            this.particles[i] = new HeartParticle();
        }
        this.duration = PARTICLE_SETTINGS.duration;
    }

    add(x: number, y: number, dx: number, dy: number) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree++;
        if (this.firstFree === this.particles.length) this.firstFree = 0;
        if (this.firstActive === this.firstFree) this.firstActive++;
        if (this.firstActive === this.particles.length) this.firstActive = 0;
    }

    update(deltaTime: number) {
        if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        }
        if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].update(deltaTime);
            }
            for (let i = 0; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        }
        while (
            this.particles[this.firstActive]?.age >= this.duration &&
            this.firstActive !== this.firstFree
        ) {
            this.firstActive++;
            if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
    }

    draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        }
        if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].draw(context, image);
            }
            for (let i = 0; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        }
    }
}

// 浮动文字类
class FloatingText {
    x: number;
    y: number;
    opacity: number;
    velX: number;
    velY: number;
    targetScale: number;
    scale: number;
    width: number;
    height: number;
    color: string;
    text: string;

    constructor(ww: number, wh: number, texts: string[]) {
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.velX = (Math.random() - 0.5) * 4;
        this.velY = (Math.random() - 0.5) * 4;
        this.targetScale = Math.random() * 0.15 + 0.02;
        this.scale = this.targetScale * Math.random();
        this.width = 473.8;
        this.height = 408.6;
        this.color = FLOATING_COLORS[Math.floor(Math.random() * FLOATING_COLORS.length)];
        this.text = texts[Math.floor(Math.random() * texts.length)];
    }

    update(ww: number, wh: number) {
        this.x += this.velX;
        this.y += this.velY;
        this.scale += (this.targetScale - this.scale) * 0.01;

        if (this.x - this.width > ww || this.x + this.width < 0) {
            this.scale = 0;
            this.x = Math.random() * ww;
        }
        if (this.y - this.height > wh || this.y + this.height < 0) {
            this.scale = 0;
            this.y = Math.random() * wh;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.opacity;
        ctx.font = `${180 * this.scale}px "微软雅黑", sans-serif`;
        ctx.fillStyle = this.color;
        ctx.fillText(
            this.text,
            this.x - this.width * 0.5,
            this.y - this.height * 0.5,
            this.width
        );
    }
}

// 流星类
class MeteorRain {
    x: number;
    y: number;
    length: number;
    angle: number;
    width: number;
    height: number;
    speed: number;
    offsetX: number;
    offsetY: number;
    alpha: number;
    color1: string;
    color2: string;
    windowWidth: number;
    windowHeight: number;

    constructor(windowWidth: number, windowHeight: number) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.angle = 30;
        this.width = 0;
        this.height = 0;
        this.speed = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.alpha = 1;
        this.color1 = '#ea80b0';
        this.color2 = '';
        this.init();
    }

    init() {
        this.getPos();
        this.alpha = 1;
        this.getRandomColor();
        const x = Math.random() * 80 + 150;
        this.length = Math.ceil(x);
        this.angle = 30;
        const speedFactor = Math.random() + 0.5;
        this.speed = Math.ceil(speedFactor);
        const cos = Math.cos(this.angle * Math.PI / 180);
        const sin = Math.sin(this.angle * Math.PI / 180);
        this.width = this.length * cos;
        this.height = this.length * sin;
        this.offsetX = this.speed * cos;
        this.offsetY = this.speed * sin;
    }

    getRandomColor() {
        const a = Math.ceil(255 - 240 * Math.random());
        this.color1 = `rgba(${a},${a},${a},1)`;
        this.color2 = 'black';
    }

    countPos() {
        this.x = this.x - this.offsetX;
        this.y = this.y + this.offsetY;
    }

    getPos() {
        this.x = Math.random() * this.windowWidth;
        this.y = Math.random() * this.windowHeight;
    }

    draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.lineWidth = 1;
        context.globalAlpha = this.alpha;
        const line = context.createLinearGradient(
            this.x, this.y,
            this.x + this.width,
            this.y - this.height
        );
        line.addColorStop(0, '#ea80b0');
        line.addColorStop(0.3, this.color1);
        line.addColorStop(0.6, this.color2);
        context.strokeStyle = line;
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.width, this.y - this.height);
        context.closePath();
        context.stroke();
        context.restore();
    }

    move(context: CanvasRenderingContext2D) {
        const x = this.x + this.width - this.offsetX;
        const y = this.y - this.height;
        context.clearRect(x - 3, y - 3, this.offsetX + 5, this.offsetY + 5);
        this.countPos();
        this.alpha -= 0.002;
        this.draw(context);
    }
}

// 背景爱心飘动类
class FloatingHeart {
    x: number;
    y: number;
    size: number;
    shadowBlur: number;
    speedX: number;
    speedY: number;
    speedSize: number;
    opacity: number;
    vertices: { x: number; y: number }[];
    precision: number = 100;

    constructor(ww: number, wh: number) {
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.size = Math.random() * 2 + 1;
        this.shadowBlur = Math.random() * 10;
        this.speedX = (Math.random() + 0.2 - 0.6) * 8;
        this.speedY = (Math.random() + 0.2 - 0.6) * 8;
        this.speedSize = Math.random() * 0.05 + 0.01;
        this.opacity = 1;
        this.vertices = [];

        for (let i = 0; i < this.precision; i++) {
            const step = (i / this.precision - 0.5) * (Math.PI * 2);
            this.vertices.push({
                x: 15 * Math.pow(Math.sin(step), 3),
                y: -(13 * Math.cos(step) - 5 * Math.cos(2 * step) - 2 * Math.cos(3 * step) - Math.cos(4 * step))
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, ww: number, wh: number) {
        this.size -= this.speedSize;
        this.x += this.speedX;
        this.y += this.speedY;

        ctx.save();
        ctx.translate(-1000, this.y);
        ctx.scale(this.size, this.size);
        ctx.beginPath();
        for (let i = 0; i < this.precision; i++) {
            const v = this.vertices[i];
            ctx.lineTo(v.x, v.y);
        }
        ctx.globalAlpha = this.size;
        ctx.shadowBlur = Math.round((3 - this.size) * 10);
        ctx.shadowColor = 'hsla(0, 100%, 60%, 0.5)';
        ctx.shadowOffsetX = this.x + 1000;
        ctx.globalCompositeOperation = 'screen';
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

/**
 * ==============================================================================
 * 3. 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const heartCanvasRef = useRef<HTMLCanvasElement>(null);
    const effectCanvasRef = useRef<HTMLCanvasElement>(null);

    const [pulseScale, setPulseScale] = useState(1);

    // 使用可复用的音效 Hook
    const {
        audioRef: bgAudioRef,
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

    // 获取浮动文字列表
    const getFloatingTexts = useCallback(() => {
        let list: string[] = [];
        if (Array.isArray(config.floatingTexts)) {
            list = config.floatingTexts;
        } else if (typeof config.floatingTexts === 'string') {
            list = (config.floatingTexts as string).split('\n').filter(s => s.trim() !== '');
        }
        return list.length > 0 ? list : PRESETS.floatingTextTemplates;
    }, [config.floatingTexts]);

    // 心跳脉动动画
    useEffect(() => {
        if (config.effectMode !== 'pulse') return;

        let frame = 0;
        const animate = () => {
            frame++;
            // 模拟心跳效果: 0.8 -> 0.7 -> 1 -> 0.7 -> 0.8
            const t = (frame % 90) / 90;
            let scale = 0.8;
            if (t < 0.25) {
                scale = 0.8 - 0.1 * (t / 0.25);
            } else if (t < 0.5) {
                scale = 0.7 + 0.3 * ((t - 0.25) / 0.25);
            } else if (t < 0.75) {
                scale = 1 - 0.3 * ((t - 0.5) / 0.25);
            } else {
                scale = 0.7 + 0.1 * ((t - 0.75) / 0.25);
            }
            setPulseScale(scale);
            requestAnimationFrame(animate);
        };
        const id = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(id);
    }, [config.effectMode]);

    // 心形爱心canvas主渲染
    useEffect(() => {
        const canvas = heartCanvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        let time = 0;
        const particles = new ParticlePool(config.particleCount);
        const particleRate = config.particleCount / PARTICLE_SETTINGS.duration;

        // 心形曲线上的点
        const pointOnHeart = (t: number): Point => {
            return new Point(
                160 * Math.pow(Math.sin(t), 3),
                130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
            );
        };

        // 创建心形粒子图像
        const createHeartImage = (): HTMLImageElement => {
            const offscreen = document.createElement('canvas');
            const offCtx = offscreen.getContext('2d')!;
            offscreen.width = PARTICLE_SETTINGS.size;
            offscreen.height = PARTICLE_SETTINGS.size;

            const to = (t: number): Point => {
                const point = pointOnHeart(t);
                point.x = PARTICLE_SETTINGS.size / 2 + (point.x * PARTICLE_SETTINGS.size) / 350;
                point.y = PARTICLE_SETTINGS.size / 2 - (point.y * PARTICLE_SETTINGS.size) / 350;
                return point;
            };

            offCtx.beginPath();
            let t = -Math.PI;
            let point = to(t);
            offCtx.moveTo(point.x, point.y);
            while (t < Math.PI) {
                t += 0.01;
                point = to(t);
                offCtx.lineTo(point.x, point.y);
            }
            offCtx.closePath();
            offCtx.fillStyle = config.heartColor || '#ea80b0';
            offCtx.fill();

            const img = new Image();
            img.src = offscreen.toDataURL();
            return img;
        };

        const heartImage = createHeartImage();

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerRef.current.clientWidth * dpr;
            canvas.height = containerRef.current.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const loop = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            const newTime = Date.now() / 1000;
            const deltaTime = newTime - (time || newTime);
            time = newTime;

            ctx.clearRect(0, 0, width, height);

            // 生成新粒子
            const amount = particleRate * deltaTime;
            for (let i = 0; i < amount; i++) {
                const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
                const dir = pos.clone();
                dir.length(PARTICLE_SETTINGS.velocity);
                particles.add(
                    width / 2 + pos.x,
                    height / 2 - pos.y,
                    (dir as Point).x,
                    -(dir as Point).y
                );
            }

            particles.update(deltaTime);
            particles.draw(ctx, heartImage);

            rafId = requestAnimationFrame(loop);
        };

        heartImage.onload = () => {
            loop();
        };
        if (heartImage.complete) {
            loop();
        }

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.heartColor, config.particleCount]);

    // 效果canvas渲染（流星/黑客/漂浮）
    useEffect(() => {
        const canvas = effectCanvasRef.current;
        if (!canvas || !containerRef.current) return;
        if (config.effectMode === 'pulse') return; // 脉动模式不需要额外效果

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId: number;
        const texts = getFloatingTexts();

        const resize = () => {
            if (!containerRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerRef.current.clientWidth * dpr;
            canvas.height = containerRef.current.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        };
        resize();
        window.addEventListener('resize', resize);

        const width = () => canvas.width / (window.devicePixelRatio || 1);
        const height = () => canvas.height / (window.devicePixelRatio || 1);

        if (config.effectMode === 'meteor') {
            // 流星雨效果
            const meteors: MeteorRain[] = [];
            const meteorCount = 20;

            for (let i = 0; i < meteorCount; i++) {
                meteors.push(new MeteorRain(width(), height()));
            }

            const loop = () => {
                for (let n = 0; n < meteorCount; n++) {
                    const rain = meteors[n];
                    rain.move(ctx);
                    if (rain.y > height()) {
                        ctx.clearRect(rain.x, rain.y - rain.height, rain.width, rain.height);
                        meteors[n] = new MeteorRain(width(), height());
                    }
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();

        } else if (config.effectMode === 'matrix') {
            // 黑客风格下落文字效果
            const textChars = 'I LOVE U'.split('');
            const fontSize = 16;
            const columns = Math.floor(width() / fontSize);
            const drops: number[] = new Array(columns).fill(1);

            const loop = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, width(), height());
                ctx.fillStyle = '#f584b7';
                ctx.font = `${fontSize}px arial`;

                for (let i = 0; i < drops.length; i++) {
                    const text = textChars[Math.floor(Math.random() * textChars.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > height() || Math.random() > 0.95) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();

        } else if (config.effectMode === 'floating') {
            // 漂浮文字效果
            const floatingTexts: FloatingText[] = [];
            for (let i = 0; i < 100; i++) {
                floatingTexts.push(new FloatingText(width(), height(), texts));
            }

            const loop = () => {
                ctx.clearRect(0, 0, width(), height());
                for (let i = 0; i < floatingTexts.length; i++) {
                    floatingTexts[i].update(width(), height());
                    floatingTexts[i].draw(ctx);
                }
                rafId = requestAnimationFrame(loop);
            };
            loop();
        }

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.effectMode, getFloatingTexts]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. 效果Canvas层（流星/黑客/漂浮）*/}
            {config.effectMode !== 'pulse' && (
                <canvas
                    ref={effectCanvasRef}
                    className="absolute inset-0 z-5 pointer-events-none"
                />
            )}

            {/* 3. 心形爱心Canvas层 */}
            <canvas
                ref={heartCanvasRef}
                className="absolute inset-0 z-10 pointer-events-none transition-transform duration-100"
                style={{
                    transform: config.effectMode === 'pulse' ? `scale(${pulseScale})` : 'scale(1)',
                }}
            />

            {/* 4. 文字UI层 */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
                {/* 中心文字 */}
                <div
                    className="text-center animate-fade-in"
                    style={{
                        transform: config.effectMode === 'pulse' ? `scale(${pulseScale})` : 'scale(1)',
                        transition: 'transform 0.1s ease-out',
                    }}
                >
                    <div className="text-white/90 text-3xl md:text-5xl lg:text-6xl font-bold tracking-widest drop-shadow-[0_0_20px_rgba(255,105,180,0.8)] mb-6 animate-pulse">
                        {config.centerText}
                    </div>
                    {config.recipientName && (
                        <div className="text-pink-300/80 text-xl md:text-2xl font-light tracking-[0.5em] mt-8 drop-shadow-lg">
                            {config.recipientName}
                        </div>
                    )}
                </div>
            </div>

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

            {/* 6. 效果模式指示 */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs">
                    {PRESETS.effectModes.find(m => m.value === config.effectMode)?.label || '心跳脉动'}
                </div>
            </div>
        </div>
    );
}

export default function RomanticHeartsPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
