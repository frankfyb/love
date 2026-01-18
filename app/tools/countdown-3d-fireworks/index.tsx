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
 * 3D烟花倒计时组件 - 集成3D烟花效果与文字变形动画
 * 参考自: 321倒计时2024烟花代码fireworks_3d
 * ==============================================================================
 */

export interface AppConfig {
    targetDate: string;
    titleText: string;
    recipientName: string;
    countdownText: string;
    celebrationText: string[] | string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('countdown-3d-fireworks'),
    music: [
        { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: 'Jingle Bells (Upbeat)', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
    titleText: '距离 2026 跨年还有',
    recipientName: '致 2026 最爱的你',
    countdownText: '3',
    celebrationText: ['2026', '新', '年', '快', '乐'],
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const countdown3dFireworksCardConfigMetadata = {
    panelTitle: '3D烟花倒计时配置',
    panelSubtitle: '震撼3D效果 浪漫新年祝福',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的你' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '倒计时标题', placeholder: '距离 2026 跨年还有' },
        targetDate: { category: 'content' as const, type: 'datetime' as const, label: '目标日期', timeType: 'datetime' as const, description: '选择倒计时的目标日期' },
        countdownText: { category: 'content' as const, type: 'input' as const, label: '倒计时秒数', placeholder: '3', description: '从几秒开始倒数（例如3、5、10）' },
        celebrationText: { category: 'content' as const, type: 'list' as const, label: '庆祝文字', placeholder: '输入庆祝文字', description: '每行一个字或词' },

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
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '基础设置', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'targetDate' as const] },
        { id: 2, label: '倒计时设置', icon: null, fields: ['countdownText' as const, 'celebrationText' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 粒子颜色类
// ============================================================================
class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    render(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

// ============================================================================
// 粒子点类
// ============================================================================
class Point {
    x: number;
    y: number;
    z: number;
    a: number;
    h: number;

    constructor(args: { x?: number; y?: number; z?: number; a?: number; h?: number }) {
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.z = args.z || 5;
        this.a = args.a || 1;
        this.h = args.h || 0;
    }
}

// ============================================================================
// 粒子类 (Shape Shifter核心)
// ============================================================================
class Dot {
    p: Point;
    e: number;
    s: boolean;
    c: Color;
    t: Point;
    q: Point[];

    constructor(x: number, y: number) {
        this.p = new Point({ x, y, z: 5, a: 1, h: 0 });
        this.e = 0.07;
        this.s = true;
        this.c = new Color(255, 255, 255, this.p.a);
        this.t = new Point({ x: this.p.x, y: this.p.y, z: this.p.z, a: this.p.a, h: this.p.h });
        this.q = [];
    }

    distanceTo(n: Point, details: boolean = false): number | [number, number, number] {
        const dx = this.p.x - n.x;
        const dy = this.p.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return details ? [dx, dy, d] : d;
    }

    moveTowards(n: Point): boolean {
        const details = this.distanceTo(n, true) as [number, number, number];
        const dx = details[0];
        const dy = details[1];
        const d = details[2];
        const e = this.e * d;

        if (this.p.h === -1) {
            this.p.x = n.x;
            this.p.y = n.y;
            return true;
        }

        if (d > 1) {
            this.p.x -= (dx / d) * e;
            this.p.y -= (dy / d) * e;
        } else {
            if (this.p.h > 0) {
                this.p.h--;
            } else {
                return true;
            }
        }
        return false;
    }

    update() {
        if (this.moveTowards(this.t)) {
            const p = this.q.shift();
            if (p) {
                this.t.x = p.x || this.p.x;
                this.t.y = p.y || this.p.y;
                this.t.z = p.z || this.p.z;
                this.t.a = p.a || this.p.a;
                this.p.h = p.h || 0;
            } else {
                if (this.s) {
                    this.p.x -= Math.sin(Math.random() * 3.142);
                    this.p.y -= Math.sin(Math.random() * 3.142);
                } else {
                    this.move(new Point({
                        x: this.p.x + (Math.random() * 50) - 25,
                        y: this.p.y + (Math.random() * 50) - 25,
                    }));
                }
            }
        }

        // 透明度和大小渐变
        const dA = this.p.a - this.t.a;
        this.p.a = Math.max(0.1, this.p.a - dA * 0.05);
        const dZ = this.p.z - this.t.z;
        this.p.z = Math.max(1, this.p.z - dZ * 0.05);
    }

    move(p: Point) {
        this.q.push(p);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.c.a = this.p.a;
        ctx.fillStyle = this.c.render();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, this.p.z, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
    }

    render(ctx: CanvasRenderingContext2D) {
        this.update();
        this.draw(ctx);
    }
}

// ============================================================================
// 3D烟花系统类
// ============================================================================
interface Seed {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    born: number;
}

interface Spark {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    radius: number;
    alpha: number;
    color: string;
    trail: { x: number; y: number; z: number }[];
}

class Fireworks3DSystem {
    private seeds: Seed[] = [];
    private sparks: Spark[] = [];
    private frames: number = 0;
    private seedTimer: number = 0;
    private seedInterval: number = 5;
    private seedLife: number = 100;
    private gravity: number = 0.02;
    private playerX: number = 0;
    private playerY: number = 0;
    private playerZ: number = -25;
    private yaw: number = 0;
    private pitch: number = 0;
    private scale: number = 600;
    private cx: number = 0;
    private cy: number = 0;

    private sparkColors = ['#f84', '#84f', '#8ff', '#fff', '#4f8', '#f44', '#ff8', '#f8f'];

    resize(width: number, height: number) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    private rasterizePoint(x: number, y: number, z: number): { x: number; y: number; d: number } {
        const pi = Math.PI;
        x -= this.playerX;
        y -= this.playerY;
        z -= this.playerZ;

        let p = Math.atan2(x, z);
        let d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - this.yaw) * d;
        z = Math.cos(p - this.yaw) * d;

        p = Math.atan2(y, z);
        d = Math.sqrt(y * y + z * z);
        y = Math.sin(p - this.pitch) * d;
        z = Math.cos(p - this.pitch) * d;

        const rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z;
        const uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        if (!uc) return { x: 0, y: 0, d: -1 };

        const ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        const ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;

        if (!z) z = 0.000000001;

        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
                y: this.cy + y / z * this.scale,
                d: Math.sqrt(x * x + y * y + z * z)
            };
        } else {
            return {
                x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
                y: this.cy + y / z * this.scale,
                d: -1
            };
        }
    }

    private spawnSeed() {
        const seed: Seed = {
            x: -50 + Math.random() * 100,
            y: 25,
            z: -50 + Math.random() * 100,
            vx: 0.1 - Math.random() * 0.2,
            vy: -1.5,
            vz: 0.1 - Math.random() * 0.2,
            born: this.frames
        };
        this.seeds.push(seed);
    }

    private splode(x: number, y: number, z: number) {
        const pi = Math.PI;
        const t = 5 + Math.floor(Math.random() * 150);
        const sparkV = 1 + Math.random() * 2.5;
        const color = this.sparkColors[Math.floor(Math.random() * this.sparkColors.length)];

        for (let m = 1; m < t; ++m) {
            const p1 = pi * 2 * Math.random();
            const p2 = pi * Math.random();
            const v = sparkV * (1 + Math.random() / 6);

            const spark: Spark = {
                x, y, z,
                vx: Math.sin(p1) * Math.sin(p2) * v,
                vy: Math.cos(p2) * v,
                vz: Math.cos(p1) * Math.sin(p2) * v,
                radius: 25 + Math.random() * 50,
                alpha: 1,
                color,
                trail: []
            };
            this.sparks.push(spark);
        }
    }

    update() {
        this.frames++;

        // 生成种子
        if (this.seedTimer < this.frames) {
            this.seedTimer = this.frames + this.seedInterval * Math.random() * 10;
            this.spawnSeed();
        }

        // 更新种子
        for (let i = this.seeds.length - 1; i >= 0; i--) {
            const seed = this.seeds[i];
            seed.vy += this.gravity;
            seed.x += seed.vx;
            seed.y += seed.vy;
            seed.z += seed.vz;

            if (this.frames - seed.born > this.seedLife) {
                this.splode(seed.x, seed.y, seed.z);
                this.seeds.splice(i, 1);
            }
        }

        // 更新火花
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            if (spark.alpha > 0 && spark.radius > 5) {
                spark.alpha -= 0.01;
                spark.radius /= 1.02;
                spark.vy += this.gravity;

                // 拖尾
                spark.trail.push({ x: spark.x, y: spark.y, z: spark.z });
                if (spark.trail.length > 5) spark.trail.shift();

                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.z += spark.vz;
                spark.vx /= 1.075;
                spark.vy /= 1.075;
                spark.vz /= 1.075;
            } else {
                this.sparks.splice(i, 1);
            }
        }

        // 相机旋转
        const pi = Math.PI;
        const p = Math.atan2(this.playerX, this.playerZ);
        let d = Math.sqrt(this.playerX * this.playerX + this.playerZ * this.playerZ);
        d += Math.sin(this.frames / 80) / 1.25;
        const t = Math.sin(this.frames / 200) / 40;
        this.playerX = Math.sin(p + t) * d;
        this.playerZ = Math.cos(p + t) * d;
        this.yaw = pi + p + t;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // 绘制地面星点
        ctx.fillStyle = '#ff8';
        for (let i = -100; i < 100; i += 3) {
            for (let j = -100; j < 100; j += 4) {
                const x = i, z = j, y = 25;
                const point = this.rasterizePoint(x, y, z);
                if (point.d !== -1) {
                    const size = 250 / (1 + point.d);
                    const d = Math.sqrt(x * x + z * z);
                    const a = 0.75 - Math.pow(d / 100, 6) * 0.75;
                    if (a > 0) {
                        ctx.globalAlpha = a;
                        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                    }
                }
            }
        }

        ctx.globalAlpha = 1;

        // 绘制种子
        for (const seed of this.seeds) {
            const point = this.rasterizePoint(seed.x, seed.y, seed.z);
            if (point.d !== -1) {
                const size = 200 / (1 + point.d);
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }

        // 绘制火花
        for (const spark of this.sparks) {
            const point = this.rasterizePoint(spark.x, spark.y, spark.z);
            if (point.d !== -1) {
                const size = spark.radius * 200 / (1 + point.d);

                // 拖尾
                if (spark.trail.length > 0) {
                    ctx.strokeStyle = spark.color;
                    let prevPoint = point;
                    for (let j = spark.trail.length - 1; j >= 0; j--) {
                        const trailPoint = this.rasterizePoint(spark.trail[j].x, spark.trail[j].y, spark.trail[j].z);
                        if (trailPoint.d !== -1) {
                            ctx.globalAlpha = (j / spark.trail.length) * spark.alpha / 2;
                            ctx.beginPath();
                            ctx.moveTo(prevPoint.x, prevPoint.y);
                            ctx.lineWidth = 1 + spark.radius * 10 / (spark.trail.length - j) / (1 + trailPoint.d);
                            ctx.lineTo(trailPoint.x, trailPoint.y);
                            ctx.stroke();
                            prevPoint = trailPoint;
                        }
                    }
                }

                // 火花本体
                ctx.globalAlpha = spark.alpha;
                ctx.fillStyle = spark.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }
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

    // 生成文字形状点阵
    const generateTextShape = useCallback((text: string, canvas: HTMLCanvasElement): { dots: Point[]; w: number; h: number } => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return { dots: [], w: 0, h: 0 };

        const gap = 13;
        const fontSize = 500;
        const fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

        canvas.width = Math.floor(window.innerWidth / gap) * gap;
        canvas.height = Math.floor(window.innerHeight / gap) * gap;

        ctx.fillStyle = 'red';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const isNumber = !isNaN(parseFloat(text)) && isFinite(parseFloat(text));
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const s = Math.min(
            fontSize,
            (canvas.width / ctx.measureText(text).width) * 0.8 * fontSize,
            (canvas.height / fontSize) * (isNumber ? 1 : 0.45) * fontSize
        );

        ctx.font = `bold ${s}px ${fontFamily}`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const dots: Point[] = [];
        let x = 0, y = 0;
        let fx = canvas.width, fy = canvas.height, w = 0, h = 0;

        for (let p = 0; p < pixels.length; p += 4 * gap) {
            if (pixels[p + 3] > 0) {
                dots.push(new Point({ x, y }));
                w = x > w ? x : w;
                h = y > h ? y : h;
                fx = x < fx ? x : fx;
                fy = y < fy ? y : fy;
            }

            x += gap;
            if (x >= canvas.width) {
                x = 0;
                y += gap;
                p += gap * 4 * canvas.width;
            }
        }

        return { dots, w: w + fx, h: h + fy };
    }, []);

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

            dot.e = fast ? 0.25 : (dot.s ? 0.14 : 0.11);

            if (dot.s) {
                dot.move(new Point({
                    z: Math.random() * 20 + 10,
                    a: Math.random(),
                    h: 18
                }));
            } else {
                dot.move(new Point({
                    z: Math.random() * 5 + 5,
                    h: fast ? 18 : 30
                }));
            }

            dot.s = true;
            dot.move(new Point({
                x: tempDots[i].x + cx,
                y: tempDots[i].y + cy,
                a: 1,
                z: 5,
                h: 0
            }));

            tempDots.splice(i, 1);
            d++;
        }

        // 隐藏多余的粒子
        for (let i = d; i < dotsRef.current.length; i++) {
            const dot = dotsRef.current[i];
            if (dot.s) {
                dot.move(new Point({
                    z: Math.random() * 20 + 10,
                    a: Math.random(),
                    h: 20
                }));

                dot.s = false;
                dot.e = 0.04;
                dot.move(new Point({
                    x: Math.random() * area.w,
                    y: Math.random() * area.h,
                    a: 0.3,
                    z: Math.random() * 4,
                    h: 0
                }));
            }
        }
    }, [generateTextShape]);

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

                const delay = isCountdownPhase ? 1000 : 2000;
                animationTimerRef.current = setTimeout(playNextAnimation, delay);
            } else {
                // 循环播放庆祝文字
                currentActionRef.current = countdownNum;
                animationTimerRef.current = setTimeout(playNextAnimation, 500);
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
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4">
                    <div className="text-center animate-fade-in">
                        {config.recipientName && (
                            <div className="text-white/90 text-xl md:text-3xl mb-6 font-serif tracking-widest animate-pulse drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                {config.recipientName}
                            </div>
                        )}
                        <h1 className="text-white/80 text-lg md:text-2xl mb-8 tracking-[0.4em] font-light uppercase drop-shadow-lg">
                            {config.titleText}
                        </h1>
                        <div className="flex items-start justify-center gap-3 md:gap-8">
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
        </div>
    );
}

const Separator = () => <div className="text-xl md:text-5xl text-white/20 font-light mt-1 md:mt-2">:</div>;

function TimeUnit({ num, label, isSeconds = false }: { num: number; label: string; isSeconds?: boolean }) {
    return (
        <div className="flex flex-col items-center w-14 md:w-24">
            <span
                className="font-['Inter'] font-semibold tabular-nums leading-none tracking-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
                style={{
                    fontSize: isSeconds ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
                    color: isSeconds ? '#FFD700' : '#ffffff'
                }}
            >
                {num.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] md:text-xs text-white/40 mt-2 tracking-widest">{label}</span>
        </div>
    );
}

export default function Countdown3DFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
