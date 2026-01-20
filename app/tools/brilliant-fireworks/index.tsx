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
 * 璀璨烟花 - 高级浪漫3D烟花秀
 * 灵感来源：CodePen Fireworks
 * 特点:
 *   - 多种烟花类型（菊花/棕榈/环形/柳叶等）
 *   - 响应式设计（移动端/PC端完美适配）
 *   - 浪漫的飘落爱心与璀璨星光
 *   - 真实的物理模拟和闪光效果
 *   - 点击屏幕互动燃放
 * ==============================================================================
 */

export interface AppConfig {
    titleText: string;
    recipientName: string;
    greetings: string[];
    shellType: 'Random' | 'Crysanthemum' | 'Palm' | 'Ring' | 'Crossette' | 'Crackle' | 'Willow';
    shellSize: number;
    autoLaunch: boolean;
    showFloatingHearts: boolean;
    showSparkles: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('brilliant-fireworks'),
    music: [
        { label: '浪漫星空', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '新年喜庆', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '梦幻夜曲', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '甘蜜时光', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    shellTypes: [
        { label: '🎆 随机', value: 'Random' },
        { label: '🌼 菊花', value: 'Crysanthemum' },
        { label: '🌴 棕榈', value: 'Palm' },
        { label: '🔵 环形', value: 'Ring' },
        { label: '✨ 十字', value: 'Crossette' },
        { label: '💥 爆裂', value: 'Crackle' },
        { label: '🌿 柳叶', value: 'Willow' },
    ],
    greetingTemplates: [
        '✨ 愿你的每一天都如烟花般璀璨 ✨',
        '💕 你是我心中最美的风景 💕',
        '🌟 与你相遇是最美的意外 🌟',
        '❤️ 余生请多指教 ❤️',
        '💫 愿所有美好如期而至 💫',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '璀璨烟花夜',
    recipientName: '亲爱的你',
    greetings: PRESETS.greetingTemplates,
    shellType: 'Random',
    shellSize: 2,
    autoLaunch: true,
    showFloatingHearts: true,
    showSparkles: true,
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#000000',
    }, 0),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 颜色定义
const COLORS = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffae00',
    White: '#ffffff',
    Pink: '#ff7eb3',
    Cyan: '#00ffff',
};

const COLOR_CODES = Object.values(COLORS);
const INVISIBLE = '_INVISIBLE_';
const PI_2 = Math.PI * 2;
const GRAVITY = 0.9;

// 音效
const AUDIO_SOURCES = {
    burst: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
    ],
    lift: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
    ],
};

const random = (a: number | any[], b?: number): any => {
    if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
    if (b === undefined) return Math.random() * a;
    return Math.random() * (b - a) + a;
};

const randomColor = (options?: { notSame?: boolean; notColor?: string; limitWhite?: boolean }) => {
    let color = random(COLOR_CODES);
    if (options?.limitWhite && color === COLORS.White && Math.random() < 0.6) {
        color = random(COLOR_CODES);
    }
    return color;
};

// 颜色元组（用于天空着色）
const parseToRGB = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});

/**
 * 音效管理器
 */
class SoundManager {
    private burstPool: HTMLAudioElement[] = [];
    private liftPool: HTMLAudioElement[] = [];
    private burstCursor = 0;
    private liftCursor = 0;
    private enabled = true;

    constructor() {
        if (typeof window === 'undefined') return;
        for (let i = 0; i < 8; i++) {
            const burst = new Audio(AUDIO_SOURCES.burst[i % AUDIO_SOURCES.burst.length]);
            burst.preload = 'auto';
            burst.volume = 0.3;
            this.burstPool.push(burst);
        }
        for (let i = 0; i < 3; i++) {
            const lift = new Audio(AUDIO_SOURCES.lift[0]);
            lift.preload = 'auto';
            lift.volume = 0.15;
            this.liftPool.push(lift);
        }
    }

    playBurst() {
        if (!this.enabled) return;
        const audio = this.burstPool[this.burstCursor];
        if (audio) {
            audio.volume = random(0.2, 0.4);
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
        this.burstCursor = (this.burstCursor + 1) % this.burstPool.length;
    }

    playLift() {
        if (!this.enabled) return;
        const audio = this.liftPool[this.liftCursor];
        if (audio) {
            audio.volume = random(0.1, 0.2);
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
        this.liftCursor = (this.liftCursor + 1) % this.liftPool.length;
    }

    setEnabled(enable: boolean) {
        this.enabled = enable;
    }
}

/**
 * 粒子接口
 */
interface StarParticle {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    speedX: number;
    speedY: number;
    life: number;
    color: string;
    heavy?: boolean;
    sparkFreq?: number;
    sparkTimer?: number;
    sparkSpeed?: number;
    sparkLife?: number;
    sparkColor?: string;
    onDeath?: (star: StarParticle) => void;
}

interface SparkParticle {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    speedX: number;
    speedY: number;
    life: number;
    color: string;
}

interface BurstFlashItem {
    x: number;
    y: number;
    radius: number;
}

/**
 * 烟花引擎 - 高级版本
 */
class BrilliantFireworksEngine {
    private mainCanvas: HTMLCanvasElement;
    private trailsCanvas: HTMLCanvasElement;
    private mainCtx: CanvasRenderingContext2D;
    private trailsCtx: CanvasRenderingContext2D;
    private width = 0;
    private height = 0;
    private dpr = 1;

    private stars: Map<string, StarParticle[]> = new Map();
    private sparks: Map<string, SparkParticle[]> = new Map();
    private burstFlashes: BurstFlashItem[] = [];

    private animationId: number | null = null;
    private lastTime = 0;
    private autoLaunchTimer = 0;
    private soundManager: SoundManager;
    private shellSize = 2;
    private shellType = 'Random';
    private autoLaunch = true;

    // 物理常量
    private readonly starAirDrag = 0.98;
    private readonly starAirDragHeavy = 0.992;
    private readonly sparkAirDrag = 0.9;

    constructor(mainCanvas: HTMLCanvasElement, trailsCanvas: HTMLCanvasElement, soundManager: SoundManager) {
        this.mainCanvas = mainCanvas;
        this.trailsCanvas = trailsCanvas;
        this.mainCtx = mainCanvas.getContext('2d')!;
        this.trailsCtx = trailsCanvas.getContext('2d')!;
        this.soundManager = soundManager;

        // 初始化粒子集合
        [...COLOR_CODES, INVISIBLE].forEach(color => {
            this.stars.set(color, []);
            this.sparks.set(color, []);
        });

        this.resize();
    }

    setShellSize(size: number) {
        this.shellSize = size;
    }

    setShellType(type: string) {
        this.shellType = type;
    }

    setAutoLaunch(auto: boolean) {
        this.autoLaunch = auto;
    }

    resize() {
        this.dpr = window.devicePixelRatio || 1;
        const rect = this.mainCanvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.width = rect.width;
            this.height = rect.height;

            this.mainCanvas.width = this.width * this.dpr;
            this.mainCanvas.height = this.height * this.dpr;
            this.mainCanvas.style.width = `${this.width}px`;
            this.mainCanvas.style.height = `${this.height}px`;

            this.trailsCanvas.width = this.width * this.dpr;
            this.trailsCanvas.height = this.height * this.dpr;
            this.trailsCanvas.style.width = `${this.width}px`;
            this.trailsCanvas.style.height = `${this.height}px`;

            // trails画布使用透明背景，让背景层可见
            this.trailsCtx.clearRect(0, 0, this.width * this.dpr, this.height * this.dpr);
        }
    }

    // 创建粒子弧线
    private createParticleArc(
        start: number,
        arcLength: number,
        count: number,
        randomness: number,
        factory: (angle: number) => void
    ) {
        const angleDelta = arcLength / count;
        const end = start + arcLength - angleDelta * 0.5;

        if (end > start) {
            for (let angle = start; angle < end; angle += angleDelta) {
                factory(angle + Math.random() * angleDelta * randomness);
            }
        } else {
            for (let angle = start; angle > end; angle += angleDelta) {
                factory(angle + Math.random() * angleDelta * randomness);
            }
        }
    }

    // 添加星星粒子
    private addStar(
        x: number,
        y: number,
        color: string,
        angle: number,
        speed: number,
        life: number,
        speedOffX = 0,
        speedOffY = 0
    ): StarParticle {
        const star: StarParticle = {
            x, y,
            prevX: x,
            prevY: y,
            color,
            speedX: Math.sin(angle) * speed + speedOffX,
            speedY: Math.cos(angle) * speed + speedOffY,
            life,
            heavy: false,
        };

        const colorStars = this.stars.get(color) || [];
        colorStars.push(star);
        this.stars.set(color, colorStars);
        return star;
    }

    // 添加火花粒子
    private addSpark(x: number, y: number, color: string, angle: number, speed: number, life: number) {
        const spark: SparkParticle = {
            x, y,
            prevX: x,
            prevY: y,
            color,
            speedX: Math.sin(angle) * speed,
            speedY: Math.cos(angle) * speed,
            life,
        };

        const colorSparks = this.sparks.get(color) || [];
        colorSparks.push(spark);
        this.sparks.set(color, colorSparks);
    }

    // 添加爆炸闪光
    private addBurstFlash(x: number, y: number, radius: number) {
        this.burstFlashes.push({ x, y, radius });
    }

    // 生成烟花类型配置
    private getShellConfig(size: number): any {
        const type = this.shellType === 'Random' ? this.randomShellType() : this.shellType;

        switch (type) {
            case 'Crysanthemum':
                return this.crysanthemumShell(size);
            case 'Palm':
                return this.palmShell(size);
            case 'Ring':
                return this.ringShell(size);
            case 'Crossette':
                return this.crossetteShell(size);
            case 'Crackle':
                return this.crackleShell(size);
            case 'Willow':
                return this.willowShell(size);
            default:
                return this.crysanthemumShell(size);
        }
    }

    private randomShellType(): string {
        const types = ['Crysanthemum', 'Palm', 'Ring', 'Crossette', 'Crackle', 'Willow'];
        return Math.random() < 0.5 ? 'Crysanthemum' : types[Math.floor(Math.random() * types.length)];
    }

    // 菊花烟花
    private crysanthemumShell(size: number) {
        const glitter = Math.random() < 0.25;
        const color = Math.random() < 0.68 ? randomColor({ limitWhite: true }) : randomColor();
        return {
            size: 300 + size * 100,
            starLife: 900 + size * 200,
            starCount: Math.pow((300 + size * 100) / 50, 2) * (glitter ? 1.1 : 1.5),
            color,
            glitter: glitter ? 'light' : '',
            glitterColor: Math.random() < 0.5 ? COLORS.Gold : COLORS.White,
        };
    }

    // 棕榈烟花
    private palmShell(size: number) {
        return {
            size: 250 + size * 75,
            starLife: 1800 + size * 200,
            starCount: Math.pow((250 + size * 75) / 50 * 0.6, 2),
            color: randomColor(),
            glitter: 'heavy',
            glitterColor: COLORS.Gold,
        };
    }

    // 环形烟花
    private ringShell(size: number) {
        const color = randomColor();
        return {
            size: 300 + size * 100,
            starLife: 900 + size * 200,
            starCount: 2.2 * PI_2 * (size + 1),
            color,
            ring: true,
            glitter: 'light',
            glitterColor: color === COLORS.Gold ? COLORS.Gold : COLORS.White,
        };
    }

    // 十字烟花
    private crossetteShell(size: number) {
        return {
            size: 300 + size * 100,
            starLife: 900 + size * 200,
            starCount: Math.pow((300 + size * 100) / 50, 2),
            color: randomColor({ limitWhite: true }),
            crossette: true,
        };
    }

    // 爆裂烟花
    private crackleShell(size: number) {
        const color = Math.random() < 0.75 ? COLORS.Gold : randomColor();
        return {
            size: 380 + size * 75,
            starLife: 600 + size * 100,
            starCount: Math.pow((380 + size * 75) / 50, 2),
            color,
            crackle: true,
            glitter: 'light',
            glitterColor: COLORS.Gold,
        };
    }

    // 柳叶烟花
    private willowShell(size: number) {
        return {
            size: 300 + size * 100,
            starLife: 3000 + size * 300,
            starCount: Math.pow((300 + size * 100) / 50 * 0.7, 2),
            color: INVISIBLE,
            glitter: 'willow',
            glitterColor: COLORS.Gold,
        };
    }

    // 发射烟花
    launchShell(posX?: number, posY?: number) {
        const sizeVariance = Math.random() * Math.min(2.5, this.shellSize);
        const size = this.shellSize - sizeVariance;
        const config = this.getShellConfig(size);

        const x = posX !== undefined ? posX : random(this.width * 0.18, this.width * 0.82);
        const launchY = this.height;
        const burstY = random(this.height * 0.1, this.height * 0.45);
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        // 创建彗星（上升的烟花弹）
        const cometColor = typeof config.color === 'string' && config.color !== INVISIBLE ? config.color : COLORS.White;
        const comet = this.addStar(
            x, launchY, cometColor,
            Math.PI, launchVelocity,
            launchVelocity * 400
        );
        comet.heavy = true;
        comet.sparkFreq = 16;
        comet.sparkSpeed = 0.5;
        comet.sparkLife = 300;
        comet.sparkColor = cometColor;
        comet.sparkTimer = 0;

        comet.onDeath = () => {
            this.burst(x, burstY, config);
            this.soundManager.playBurst();
        };

        this.soundManager.playLift();
    }

    // 烟花爆炸
    private burst(x: number, y: number, config: any) {
        const speed = config.size / 96;
        const color = config.color;
        const starCount = Math.floor(config.starCount);

        // 闪光效果设置
        let sparkFreq = 0, sparkSpeed = 0, sparkLife = 0;
        if (config.glitter === 'light') {
            sparkFreq = 200;
            sparkSpeed = 0.25;
            sparkLife = 600;
        } else if (config.glitter === 'heavy') {
            sparkFreq = 42;
            sparkSpeed = 0.62;
            sparkLife = 2800;
        } else if (config.glitter === 'willow') {
            sparkFreq = 72;
            sparkSpeed = 0.28;
            sparkLife = 1000;
        }

        // 创建星星
        if (config.ring) {
            // 环形烟花
            const ringStartAngle = Math.random() * Math.PI;
            const ringSquash = Math.pow(Math.random(), 0.45) * 0.992 + 0.008;

            this.createParticleArc(0, PI_2, starCount, 0, (angle) => {
                const initSpeedX = Math.sin(angle) * speed * ringSquash;
                const initSpeedY = Math.cos(angle) * speed;
                const newSpeed = Math.sqrt(initSpeedX * initSpeedX + initSpeedY * initSpeedY);
                const newAngle = Math.atan2(initSpeedX, initSpeedY) + ringStartAngle;

                const star = this.addStar(
                    x, y, color,
                    newAngle, newSpeed,
                    config.starLife + Math.random() * config.starLife * 0.125
                );

                if (config.glitter) {
                    star.sparkFreq = sparkFreq;
                    star.sparkSpeed = sparkSpeed;
                    star.sparkLife = sparkLife;
                    star.sparkColor = config.glitterColor;
                    star.sparkTimer = Math.random() * sparkFreq;
                }
            });
        } else {
            // 普通爆发
            this.createParticleArc(0, PI_2, starCount, 1, (angle) => {
                const starColor = color === INVISIBLE ? INVISIBLE : (color === 'random' ? randomColor() : color);
                const star = this.addStar(
                    x, y, starColor,
                    angle,
                    Math.pow(Math.random(), 0.45) * speed,
                    config.starLife + Math.random() * config.starLife * 0.125
                );

                if (config.glitter) {
                    star.sparkFreq = sparkFreq;
                    star.sparkSpeed = sparkSpeed;
                    star.sparkLife = sparkLife;
                    star.sparkColor = config.glitterColor;
                    star.sparkTimer = Math.random() * sparkFreq;
                }

                // 特殊效果
                if (config.crossette) {
                    star.onDeath = (s) => this.crossetteEffect(s);
                }
                if (config.crackle) {
                    star.onDeath = (s) => this.crackleEffect(s);
                }
            });
        }

        // 添加爆炸闪光
        this.addBurstFlash(x, y, config.size / 8);
    }

    // 十字效果
    private crossetteEffect(star: StarParticle) {
        const startAngle = Math.random() * Math.PI / 2;
        this.createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
            this.addStar(star.x, star.y, star.color, angle, random(0.6, 1.35), 600);
        });
    }

    // 爆裂效果
    private crackleEffect(star: StarParticle) {
        this.createParticleArc(0, PI_2, 10, 1.8, (angle) => {
            this.addSpark(star.x, star.y, COLORS.Gold, angle, Math.pow(Math.random(), 0.45) * 2.4, random(300, 500));
        });
    }

    // 更新
    private update(frameTime: number, lag: number) {
        const timeStep = frameTime;
        const speed = lag;

        // 自动发射
        if (this.autoLaunch) {
            this.autoLaunchTimer -= timeStep;
            if (this.autoLaunchTimer <= 0) {
                this.launchShell();
                this.autoLaunchTimer = random(800, 2500);
            }
        }

        const gAcc = timeStep / 1000 * GRAVITY;
        const starDrag = 1 - (1 - this.starAirDrag) * speed;
        const starDragHeavy = 1 - (1 - this.starAirDragHeavy) * speed;
        const sparkDrag = 1 - (1 - this.sparkAirDrag) * speed;

        // 更新星星
        [...COLOR_CODES, INVISIBLE].forEach(color => {
            const stars = this.stars.get(color) || [];
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                star.life -= timeStep;

                if (star.life <= 0) {
                    if (star.onDeath) star.onDeath(star);
                    stars.splice(i, 1);
                } else {
                    star.prevX = star.x;
                    star.prevY = star.y;
                    star.x += star.speedX * speed;
                    star.y += star.speedY * speed;

                    if (star.heavy) {
                        star.speedX *= starDragHeavy;
                        star.speedY *= starDragHeavy;
                    } else {
                        star.speedX *= starDrag;
                        star.speedY *= starDrag;
                    }
                    star.speedY += gAcc;

                    // 火花生成
                    if (star.sparkFreq) {
                        star.sparkTimer = (star.sparkTimer || 0) - timeStep;
                        while (star.sparkTimer! < 0) {
                            star.sparkTimer! += star.sparkFreq;
                            this.addSpark(
                                star.x, star.y,
                                star.sparkColor || star.color,
                                Math.random() * PI_2,
                                Math.random() * (star.sparkSpeed || 0.5),
                                (star.sparkLife || 500) * (0.8 + Math.random() * 0.4)
                            );
                        }
                    }
                }
            }

            // 更新火花
            const sparks = this.sparks.get(color) || [];
            for (let i = sparks.length - 1; i >= 0; i--) {
                const spark = sparks[i];
                spark.life -= timeStep;

                if (spark.life <= 0) {
                    sparks.splice(i, 1);
                } else {
                    spark.prevX = spark.x;
                    spark.prevY = spark.y;
                    spark.x += spark.speedX * speed;
                    spark.y += spark.speedY * speed;
                    spark.speedX *= sparkDrag;
                    spark.speedY *= sparkDrag;
                    spark.speedY += gAcc;
                }
            }
        });
    }

    // 渲染
    private render(speed: number) {
        const { dpr, width, height } = this;

        this.trailsCtx.scale(dpr, dpr);
        this.mainCtx.scale(dpr, dpr);

        // 淡出效果 - 使用半透明清除实现尾迹效果
        this.trailsCtx.globalCompositeOperation = 'destination-out';
        this.trailsCtx.fillStyle = `rgba(0, 0, 0, ${0.08 * speed})`;
        this.trailsCtx.fillRect(0, 0, width, height);
        this.trailsCtx.globalCompositeOperation = 'lighter';

        this.mainCtx.clearRect(0, 0, width, height);

        // 绘制爆炸闪光
        while (this.burstFlashes.length) {
            const bf = this.burstFlashes.pop()!;
            const gradient = this.trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
            gradient.addColorStop(0.05, 'white');
            gradient.addColorStop(0.25, 'rgba(255, 160, 20, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 160, 20, 0)');
            this.trailsCtx.fillStyle = gradient;
            this.trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
        }

        // 绘制星星
        this.trailsCtx.lineWidth = 3;
        this.trailsCtx.lineCap = 'round';
        this.mainCtx.strokeStyle = '#fff';
        this.mainCtx.lineWidth = 1;
        this.mainCtx.beginPath();

        COLOR_CODES.forEach(color => {
            const stars = this.stars.get(color) || [];
            if (stars.length === 0) return;
            this.trailsCtx.strokeStyle = color;
            this.trailsCtx.beginPath();
            stars.forEach(star => {
                this.trailsCtx.moveTo(star.x, star.y);
                this.trailsCtx.lineTo(star.prevX, star.prevY);
                this.mainCtx.moveTo(star.x, star.y);
                this.mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
            });
            this.trailsCtx.stroke();
        });
        this.mainCtx.stroke();

        // 绘制火花
        this.trailsCtx.lineWidth = 0.75;
        this.trailsCtx.lineCap = 'butt';
        COLOR_CODES.forEach(color => {
            const sparks = this.sparks.get(color) || [];
            if (sparks.length === 0) return;
            this.trailsCtx.strokeStyle = color;
            this.trailsCtx.beginPath();
            sparks.forEach(spark => {
                this.trailsCtx.moveTo(spark.x, spark.y);
                this.trailsCtx.lineTo(spark.prevX, spark.prevY);
            });
            this.trailsCtx.stroke();
        });

        this.trailsCtx.resetTransform();
        this.mainCtx.resetTransform();
    }

    start() {
        this.lastTime = performance.now();
        this.autoLaunchTimer = 500;

        const loop = () => {
            const now = performance.now();
            const frameTime = Math.min(now - this.lastTime, 100);
            const lag = frameTime / 16.67;
            this.lastTime = now;

            this.update(frameTime, lag);
            this.render(lag);

            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}

/**
 * 主显示组件
 */
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    const engineRef = useRef<BrilliantFireworksEngine | null>(null);

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

    // 初始化引擎
    useEffect(() => {
        if (!mainCanvasRef.current || !trailsCanvasRef.current) return;

        soundManagerRef.current = new SoundManager();
        soundManagerRef.current.setEnabled(!isMuted);

        engineRef.current = new BrilliantFireworksEngine(
            mainCanvasRef.current,
            trailsCanvasRef.current,
            soundManagerRef.current
        );
        engineRef.current.setShellSize(config.shellSize);
        engineRef.current.setShellType(config.shellType);
        engineRef.current.setAutoLaunch(config.autoLaunch);
        engineRef.current.start();

        const handleResize = () => {
            engineRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            engineRef.current?.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        soundManagerRef.current?.setEnabled(!isMuted);
    }, [isMuted]);

    useEffect(() => {
        engineRef.current?.setShellSize(config.shellSize);
    }, [config.shellSize]);

    useEffect(() => {
        engineRef.current?.setShellType(config.shellType);
    }, [config.shellType]);

    useEffect(() => {
        engineRef.current?.setAutoLaunch(config.autoLaunch);
    }, [config.autoLaunch]);

    const startAnimation = useCallback(() => {
        setShowWelcome(false);
    }, []);

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (showWelcome) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        engineRef.current?.launchShell(x);
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

                        {config.recipientName && (
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
                                💕 {config.recipientName} 💕
                            </div>
                        )}
                        <h1 className="text-white/70 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em] font-light">
                            {config.titleText}
                        </h1>
                        <button
                            onClick={startAnimation}
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

// 配置面板元数据
export const brilliantFireworksConfigMetadata = {
    panelTitle: '璀璨烟花配置',
    panelSubtitle: 'Brilliant Fireworks Romantic Experience',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁 💕',
            placeholder: '例如：亲爱的宝贝'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '标题',
            placeholder: '璀璨烟花夜'
        },
        greetings: {
            category: 'content' as const,
            type: 'list' as const,
            label: '浪漫祝福语',
            placeholder: '输入祝福语',
            description: '每行一句，缓缓展示你的心意'
        },
        shellType: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '烟花类型',
            options: PRESETS.shellTypes.map(t => ({ label: t.label, value: t.value })),
        },
        shellSize: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '烟花大小',
            min: 0,
            max: 4,
            step: 1,
            marks: ['3"', '5"', '6"', '8"', '12"'],
        },
        autoLaunch: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '自动燃放'
        },
        showFloatingHearts: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '飘落爱心 💕'
        },
        showSparkles: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '璀璨星光 ✨'
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: {
            category: 'background' as const,
            type: 'switch' as const,
            label: '启用音效'
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
    },
    tabs: [
        { id: 'content' as const, label: '💌 定制', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'greetings' as const] },
        { id: 2, label: '烟花效果', icon: null, fields: ['shellType' as const, 'shellSize' as const, 'autoLaunch' as const, 'showFloatingHearts' as const, 'showSparkles' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

export default function BrilliantFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
