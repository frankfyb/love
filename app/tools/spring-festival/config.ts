/**
 * ==============================================================================
 * spring-festival 配置文件
 * 新春快乐 - 浪漫3D烟花粒子文字动画
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';
import type { CategoryType, ToolConfigMetadata } from '@/types/genericConfig';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    titleText: string;
    recipientName: string;
    countdownSequence: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('spring-festival'),
    music: [
        { label: '新年喜庆音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '传统民乐', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '宁静钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '致最爱的你',
    recipientName: '亲爱的小曾',
    countdownSequence: ['3', '2', '1', '新', '春', '快', '乐', '❤'],
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#000000',
    }, 0),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const springFestivalConfigMetadata: ToolConfigMetadata<AppConfig> = {
    panelTitle: '新春快乐 配置',
    panelSubtitle: 'Spring Festival Celebration',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁',
            placeholder: '例如：亲爱的小曾'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '祝福标题',
            placeholder: '致最爱的你'
        },
        countdownSequence: {
            category: 'content' as const,
            type: 'list' as const,
            label: '动画文字序列',
            placeholder: '每行一个字符',
            description: '依次显示的字符'
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: { category: 'background' as CategoryType, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as CategoryType, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
        bgConfig: { category: 'background' as CategoryType, type: 'readonly' as const, label: '背景配置' },
    },
    tabs: [
        { id: 'content' as CategoryType, label: '内容', icon: null },
        { id: 'background' as CategoryType, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '祝福语', icon: null, fields: ['recipientName' as const, 'titleText' as const] },
        { id: 2, label: '动画序列', icon: null, fields: ['countdownSequence' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 常量和工具函数
// ============================================================================

export const random = (min: number, max: number) => Math.random() * (max - min) + min;
export const PI = Math.PI;
export const TWO_PI = PI * 2;

export const ROMANTIC_COLORS = [
    { r: 255, g: 100, b: 150 },
    { r: 255, g: 215, b: 0 },
    { r: 255, g: 50, b: 50 },
    { r: 255, g: 140, b: 0 },
    { r: 255, g: 182, b: 193 },
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 105, b: 180 },
    { r: 255, g: 69, b: 0 },
];

export const AUDIO_SOURCES = {
    pow: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
    ],
};

// ============================================================================
// 音效管理器
// ============================================================================

export class SoundManager {
    private pools: HTMLAudioElement[] = [];
    private cursor = 0;
    private enabled = true;

    constructor() {
        if (typeof window === 'undefined') return;
        for (let i = 0; i < 8; i++) {
            const url = AUDIO_SOURCES.pow[i % AUDIO_SOURCES.pow.length];
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.3;
            this.pools.push(audio);
        }
    }

    play() {
        if (!this.enabled) return;
        const audio = this.pools[this.cursor];
        if (!audio) return;
        audio.volume = random(0.2, 0.4);
        audio.currentTime = 0;
        audio.play().catch(() => { });
        this.cursor = (this.cursor + 1) % this.pools.length;
    }

    setEnabled(enable: boolean) {
        this.enabled = enable;
    }
}

// ============================================================================
// 粒子类 - 烟花爆炸后的粒子
// ============================================================================

export class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: { r: number; g: number; b: number };
    decay: number;
    gravity: number;
    size: number;
    trail: { x: number; y: number; alpha: number }[];
    sparkle: number;

    constructor(x: number, y: number, color: { r: number; g: number; b: number }) {
        this.x = x;
        this.y = y;
        const angle = random(0, TWO_PI);
        const speed = random(2, 12);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = {
            r: color.r + random(-20, 20),
            g: color.g + random(-20, 20),
            b: color.b + random(-20, 20),
        };
        this.alpha = 1;
        this.decay = random(0.008, 0.018);
        this.gravity = 0.08;
        this.size = random(2, 4);
        this.trail = [];
        this.sparkle = Math.random();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 8) this.trail.shift();

        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.sparkle = Math.random();
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;

        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const trailAlpha = (i / this.trail.length) * this.alpha * 0.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * (i / this.trail.length), 0, TWO_PI);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${trailAlpha})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, TWO_PI);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fill();

        if (this.sparkle > 0.9) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, TWO_PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
            ctx.fill();
        }
    }
}

// ============================================================================
// 烟花弹类 - 上升阶段
// ============================================================================

export class Firework {
    x: number;
    y: number;
    targetY: number;
    vx: number;
    vy: number;
    color: { r: number; g: number; b: number };
    trail: { x: number; y: number; alpha: number }[];
    exploded: boolean;

    constructor(startX: number, startY: number, targetY: number) {
        this.x = startX;
        this.y = startY;
        this.targetY = targetY;
        this.vx = random(-2, 2);
        this.vy = random(-15, -12);
        this.color = ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))];
        this.trail = [];
        this.exploded = false;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 15) this.trail.shift();

        this.x += this.vx;
        this.vy += 0.15;
        this.y += this.vy;

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const progress = i / this.trail.length;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2 * progress, 0, TWO_PI);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${progress * 0.8})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fill();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, TWO_PI);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// ============================================================================
// 文字粒子类型
// ============================================================================

export interface TextParticle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    originX: number;
    originY: number;
    size: number;
    alpha: number;
    color: { r: number; g: number; b: number };
    speed: number;
    inPosition: boolean;
    wobble: number;
    wobbleSpeed: number;
}

// ============================================================================
// ShapeShifter 粒子文字引擎
// ============================================================================

export class ShapeShifter {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: TextParticle[] = [];
    private shapeCanvas: HTMLCanvasElement;
    private shapeCtx: CanvasRenderingContext2D;
    private gap = 6;
    private animationId: number | null = null;
    private currentLetter = '';
    private isTransitioning = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.shapeCanvas = document.createElement('canvas');
        this.shapeCtx = this.shapeCanvas.getContext('2d')!;
        this.adjustCanvas();
        this.initParticles();
    }

    private adjustCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);

        this.shapeCanvas.width = Math.floor(window.innerWidth / this.gap) * this.gap;
        this.shapeCanvas.height = Math.floor(window.innerHeight / this.gap) * this.gap;
        this.shapeCtx.fillStyle = 'white';
        this.shapeCtx.textBaseline = 'middle';
        this.shapeCtx.textAlign = 'center';
    }

    private initParticles() {
        const count = 300;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: random(0, window.innerWidth),
                y: random(0, window.innerHeight),
                targetX: random(0, window.innerWidth),
                targetY: random(0, window.innerHeight),
                originX: random(0, window.innerWidth),
                originY: random(0, window.innerHeight),
                size: random(1, 3),
                alpha: random(0.1, 0.5),
                color: ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))],
                speed: random(0.02, 0.08),
                inPosition: false,
                wobble: random(0, TWO_PI),
                wobbleSpeed: random(0.02, 0.05),
            });
        }
    }

    private getLetterPoints(letter: string): { x: number; y: number }[] {
        const fontSize = Math.min(window.innerWidth * 0.4, 400);
        this.shapeCtx.font = `bold ${fontSize}px "Noto Serif SC", "Microsoft YaHei", serif`;

        this.shapeCtx.clearRect(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
        this.shapeCtx.fillText(letter, this.shapeCanvas.width / 2, this.shapeCanvas.height / 2);

        const imageData = this.shapeCtx.getImageData(0, 0, this.shapeCanvas.width, this.shapeCanvas.height);
        const pixels = imageData.data;
        const points: { x: number; y: number }[] = [];

        for (let y = 0; y < this.shapeCanvas.height; y += this.gap) {
            for (let x = 0; x < this.shapeCanvas.width; x += this.gap) {
                const index = (y * this.shapeCanvas.width + x) * 4;
                if (pixels[index + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }

        return points;
    }

    switchShape(letter: string) {
        if (this.isTransitioning && this.currentLetter === letter) return;

        this.currentLetter = letter;
        this.isTransitioning = true;

        const points = this.getLetterPoints(letter);

        while (this.particles.length < points.length) {
            this.particles.push({
                x: random(0, window.innerWidth),
                y: random(0, window.innerHeight),
                targetX: window.innerWidth / 2,
                targetY: window.innerHeight / 2,
                originX: random(0, window.innerWidth),
                originY: random(0, window.innerHeight),
                size: random(2, 4),
                alpha: random(0.3, 0.8),
                color: ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))],
                speed: random(0.03, 0.1),
                inPosition: false,
                wobble: random(0, TWO_PI),
                wobbleSpeed: random(0.02, 0.05),
            });
        }

        const shuffledPoints = [...points].sort(() => Math.random() - 0.5);

        this.particles.forEach((particle, i) => {
            if (i < shuffledPoints.length) {
                particle.targetX = shuffledPoints[i].x;
                particle.targetY = shuffledPoints[i].y;
                particle.inPosition = false;
                particle.speed = random(0.04, 0.12);
                particle.color = ROMANTIC_COLORS[Math.floor(random(0, ROMANTIC_COLORS.length))];
                particle.size = random(3, 5);
                particle.alpha = random(0.6, 1);
            } else {
                particle.targetX = random(-100, window.innerWidth + 100);
                particle.targetY = random(-100, window.innerHeight + 100);
                particle.inPosition = false;
                particle.speed = random(0.02, 0.05);
                particle.alpha = random(0.1, 0.3);
                particle.size = random(1, 2);
            }
        });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 2000);
    }

    render() {
        const ctx = this.ctx;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        this.particles.forEach(particle => {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                particle.x += dx * particle.speed;
                particle.y += dy * particle.speed;
            } else {
                particle.inPosition = true;
            }

            particle.wobble += particle.wobbleSpeed;
            const wobbleX = Math.sin(particle.wobble) * 2;
            const wobbleY = Math.cos(particle.wobble * 0.7) * 2;

            ctx.beginPath();
            ctx.arc(
                particle.x + (particle.inPosition ? wobbleX : 0),
                particle.y + (particle.inPosition ? wobbleY : 0),
                particle.size,
                0, TWO_PI
            );
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
            ctx.fill();

            if (particle.alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(
                    particle.x + (particle.inPosition ? wobbleX : 0),
                    particle.y + (particle.inPosition ? wobbleY : 0),
                    particle.size * 2,
                    0, TWO_PI
                );
                ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha * 0.2})`;
                ctx.fill();
            }
        });
    }

    start() {
        const loop = () => {
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resize() {
        this.adjustCanvas();
    }
}

// ============================================================================
// 烟花引擎
// ============================================================================

export class FireworkEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private fireworks: Firework[] = [];
    private particles: Particle[] = [];
    private soundManager: SoundManager;
    private animationId: number | null = null;
    private spawnTimer = 0;
    private intensity = 1;

    constructor(canvas: HTMLCanvasElement, soundManager: SoundManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.soundManager = soundManager;
        this.resize();
    }

    setIntensity(value: number) {
        this.intensity = value;
    }

    private spawnFirework() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);

        const startX = random(w * 0.1, w * 0.9);
        const targetY = random(h * 0.1, h * 0.4);

        this.fireworks.push(new Firework(startX, h, targetY));
    }

    private explode(firework: Firework) {
        const particleCount = Math.floor(random(80, 150));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(firework.x, firework.y, firework.color));
        }

        this.soundManager.play();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
    }

    start() {
        const loop = () => {
            const w = this.canvas.width / (window.devicePixelRatio || 1);
            const h = this.canvas.height / (window.devicePixelRatio || 1);

            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.globalCompositeOperation = 'lighter';

            this.spawnTimer++;
            if (this.spawnTimer > 60 / this.intensity) {
                if (Math.random() < 0.7 * this.intensity) {
                    this.spawnFirework();
                    if (Math.random() > 0.6) {
                        setTimeout(() => this.spawnFirework(), 100);
                    }
                }
                this.spawnTimer = 0;
            }

            for (let i = this.fireworks.length - 1; i >= 0; i--) {
                const fw = this.fireworks[i];
                fw.update();
                fw.draw(this.ctx);
                if (fw.exploded) {
                    this.explode(fw);
                    this.fireworks.splice(i, 1);
                }
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.update();
                p.draw(this.ctx);
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            if (this.particles.length > 1500) {
                this.particles.splice(0, this.particles.length - 1500);
            }

            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
