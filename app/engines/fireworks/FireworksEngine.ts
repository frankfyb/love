/**
 * 通用烟花引擎
 * 整合所有烟花工具的核心逻辑
 */

import type {
    FireworksEngineConfig,
    FireworksEngineState,
    StarParticle,
    SparkParticle,
    BurstFlash,
    ShellType,
    ShellConfig,
    LaunchConfig,
} from './types';
import {
    createStar,
    createSpark,
    createParticleArc,
} from './Particle';
import { getShellConfig } from './effects';
import { SoundManager } from '../sound/SoundManager';

// 内联常量和函数（避免路径解析问题）
const PI_2 = Math.PI * 2;
const GRAVITY = 0.9;
const INVISIBLE = '_INVISIBLE_';

const FIREWORK_COLORS = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffae00',
    White: '#ffffff',
    Pink: '#ff7eb3',
    Cyan: '#00ffff',
    Orange: '#ff6600',
    Yellow: '#ffff00',
} as const;

const FIREWORK_COLOR_CODES = Object.values(FIREWORK_COLORS);

function random<T>(a: T[], b?: undefined): T;
function random(a: number, b?: undefined): number;
function random(a: number, b: number): number;
function random<T>(a: number | T[], b?: number): T | number {
    if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
    if (b === undefined) return Math.random() * a;
    return Math.random() * (b - a) + a;
}

// ============================================================================
// 烟花引擎类
// ============================================================================

export class FireworksEngine {
    // 画布
    private mainCanvas: HTMLCanvasElement;
    private trailsCanvas: HTMLCanvasElement | null = null;
    private mainCtx: CanvasRenderingContext2D;
    private trailsCtx: CanvasRenderingContext2D | null = null;

    // 尺寸
    private width = 0;
    private height = 0;
    private dpr = 1;

    // 粒子集合
    private stars: Map<string, StarParticle[]> = new Map();
    private sparks: Map<string, SparkParticle[]> = new Map();
    private burstFlashes: BurstFlash[] = [];

    // 动画控制
    private animationId: number | null = null;
    private lastTime = 0;
    private autoLaunchTimer = 0;
    private running = false;

    // 配置
    private shellSize = 2;
    private shellType: ShellType = 'Random';
    private autoLaunch = true;
    private autoLaunchInterval = { min: 800, max: 2500 };
    private showSkyLighting = false;
    private trailFadeSpeed = 0.08;

    // 音效
    private soundManager: SoundManager | null = null;
    private enableSound = true;

    // 物理常量
    private readonly starAirDrag = 0.98;
    private readonly starAirDragHeavy = 0.992;
    private readonly sparkAirDrag = 0.9;

    constructor(config: FireworksEngineConfig) {
        this.mainCanvas = config.canvas;
        this.mainCtx = this.mainCanvas.getContext('2d')!;

        if (config.trailsCanvas) {
            this.trailsCanvas = config.trailsCanvas;
            this.trailsCtx = this.trailsCanvas.getContext('2d')!;
        }

        // 应用配置
        this.shellSize = config.shellSize ?? 2;
        this.shellType = config.shellType ?? 'Random';
        this.autoLaunch = config.autoLaunch ?? true;
        if (config.autoLaunchInterval) {
            this.autoLaunchInterval = config.autoLaunchInterval;
        }
        this.showSkyLighting = config.showSkyLighting ?? false;
        this.trailFadeSpeed = config.trailFadeSpeed ?? 0.08;
        this.enableSound = config.enableSound ?? true;

        // 初始化粒子集合
        [...FIREWORK_COLOR_CODES, INVISIBLE].forEach(color => {
            this.stars.set(color, []);
            this.sparks.set(color, []);
        });

        // 初始化音效管理器
        if (this.enableSound && typeof window !== 'undefined') {
            this.soundManager = new SoundManager({
                enabled: true,
                masterVolume: config.soundVolume ?? 1,
            });
        }

        this.resize();
    }

    // ============================================================================
    // 配置方法
    // ============================================================================

    setShellSize(size: number): void {
        this.shellSize = Math.max(0.5, Math.min(5, size));
    }

    setShellType(type: ShellType): void {
        this.shellType = type;
    }

    setAutoLaunch(auto: boolean): void {
        this.autoLaunch = auto;
    }

    setAutoLaunchInterval(min: number, max: number): void {
        this.autoLaunchInterval = { min, max };
    }

    setSoundEnabled(enable: boolean): void {
        this.enableSound = enable;
        this.soundManager?.setEnabled(enable);
    }

    setSoundVolume(volume: number): void {
        this.soundManager?.setMasterVolume(volume);
    }

    // ============================================================================
    // 尺寸管理
    // ============================================================================

    resize(): void {
        this.dpr = window.devicePixelRatio || 1;
        const rect = this.mainCanvas.parentElement?.getBoundingClientRect();

        if (rect) {
            this.width = rect.width;
            this.height = rect.height;

            this.mainCanvas.width = this.width * this.dpr;
            this.mainCanvas.height = this.height * this.dpr;
            this.mainCanvas.style.width = `${this.width}px`;
            this.mainCanvas.style.height = `${this.height}px`;

            if (this.trailsCanvas && this.trailsCtx) {
                this.trailsCanvas.width = this.width * this.dpr;
                this.trailsCanvas.height = this.height * this.dpr;
                this.trailsCanvas.style.width = `${this.width}px`;
                this.trailsCanvas.style.height = `${this.height}px`;
                this.trailsCtx.clearRect(0, 0, this.width * this.dpr, this.height * this.dpr);
            }
        }
    }

    // ============================================================================
    // 发射烟花
    // ============================================================================

    launch(config?: LaunchConfig): void {
        const sizeVariance = Math.random() * Math.min(2.5, this.shellSize);
        const size = this.shellSize - sizeVariance;

        const shellConfig = {
            ...getShellConfig(this.shellType, size),
            ...config?.shellConfig,
        };

        const x = config?.x ?? random(this.width * 0.18, this.width * 0.82);
        const launchY = this.height;
        const burstY = config?.targetY ?? random(this.height * 0.1, this.height * 0.45);
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        // 创建彗星（上升的烟花弹）- 增强版螺旋上升效果
        const cometColor = typeof shellConfig.color === 'string' && shellConfig.color !== INVISIBLE
            ? shellConfig.color
            : FIREWORK_COLORS.White;

        const comet = createStar(
            x, launchY, cometColor,
            Math.PI, launchVelocity,
            launchVelocity * 400
        );

        // 基础属性
        comet.heavy = true;
        comet.visible = true;

        // 螺旋旋转轨迹 - 使上升效果更生动
        comet.spinAngle = Math.random() * PI_2;
        comet.spinSpeed = 0.8;
        comet.spinRadius = random(0.32, 0.85);

        // 动态火花发射参数
        comet.sparkFreq = 32;
        comet.sparkSpeed = 0.5;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;
        comet.sparkColor = cometColor;
        comet.sparkTimer = 0;

        // 根据烟花效果类型调整火花参数
        if (shellConfig.glitter === 'willow') {
            comet.sparkFreq = 20;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }

        // 颜色过渡效果：部分彗星"燃尽"变透明
        if (Math.random() > 0.4) {
            comet.secondColor = INVISIBLE;
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
            comet.colorChanged = false;
        }

        comet.onDeath = () => {
            this.burst(x, burstY, shellConfig);
            this.soundManager?.playBurst();
        };

        const colorStars = this.stars.get(cometColor) || [];
        colorStars.push(comet);
        this.stars.set(cometColor, colorStars);

        this.soundManager?.playLift();
    }

    /**
     * 在指定位置发射烟花
     */
    launchAt(x: number, y: number): void {
        // 计算目标爆炸高度
        const targetY = Math.min(y, this.height * 0.5);
        this.launch({ x, targetY });
    }

    // ============================================================================
    // 烟花爆炸
    // ============================================================================

    private burst(x: number, y: number, config: ShellConfig): void {
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
            this.createRingBurst(x, y, config, speed, sparkFreq, sparkSpeed, sparkLife);
        } else {
            this.createNormalBurst(x, y, config, speed, starCount, sparkFreq, sparkSpeed, sparkLife);
        }

        // 添加爆炸闪光
        this.burstFlashes.push({ x, y, radius: config.size / 8 });
    }

    private createRingBurst(
        x: number, y: number,
        config: ShellConfig,
        speed: number,
        sparkFreq: number, sparkSpeed: number, sparkLife: number
    ): void {
        const ringStartAngle = Math.random() * Math.PI;
        const ringSquash = Math.pow(Math.random(), 0.45) * 0.992 + 0.008;
        const starCount = Math.floor(config.starCount);

        createParticleArc(0, PI_2, starCount, 0, (angle) => {
            const initSpeedX = Math.sin(angle) * speed * ringSquash;
            const initSpeedY = Math.cos(angle) * speed;
            const newSpeed = Math.sqrt(initSpeedX * initSpeedX + initSpeedY * initSpeedY);
            const newAngle = Math.atan2(initSpeedX, initSpeedY) + ringStartAngle;

            const star = createStar(
                x, y, config.color,
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

            const colorStars = this.stars.get(config.color) || [];
            colorStars.push(star);
            this.stars.set(config.color, colorStars);
        });
    }

    private createNormalBurst(
        x: number, y: number,
        config: ShellConfig,
        speed: number,
        starCount: number,
        sparkFreq: number, sparkSpeed: number, sparkLife: number
    ): void {
        createParticleArc(0, PI_2, starCount, 1, (angle) => {
            const starColor = config.color === INVISIBLE
                ? INVISIBLE
                : (config.color === 'random' ? random(FIREWORK_COLOR_CODES) : config.color);

            const star = createStar(
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

            const colorStars = this.stars.get(starColor) || [];
            colorStars.push(star);
            this.stars.set(starColor, colorStars);
        });
    }

    private crossetteEffect(star: StarParticle): void {
        const startAngle = Math.random() * Math.PI / 2;
        createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
            const newStar = createStar(star.x, star.y, star.color, angle, random(0.6, 1.35), 600);
            const colorStars = this.stars.get(star.color) || [];
            colorStars.push(newStar);
            this.stars.set(star.color, colorStars);
        });
    }

    private crackleEffect(star: StarParticle): void {
        createParticleArc(0, PI_2, 10, 1.8, (angle) => {
            const spark = createSpark(
                star.x, star.y,
                FIREWORK_COLORS.Gold,
                angle,
                Math.pow(Math.random(), 0.45) * 2.4,
                random(300, 500)
            );
            const colorSparks = this.sparks.get(FIREWORK_COLORS.Gold) || [];
            colorSparks.push(spark);
            this.sparks.set(FIREWORK_COLORS.Gold, colorSparks);
        });
        this.soundManager?.playCrackle();
    }

    // ============================================================================
    // 更新循环
    // ============================================================================

    private update(frameTime: number, lag: number): void {
        const timeStep = frameTime;
        const speed = lag;

        // 自动发射
        if (this.autoLaunch) {
            this.autoLaunchTimer -= timeStep;
            if (this.autoLaunchTimer <= 0) {
                this.launch();
                this.autoLaunchTimer = random(
                    this.autoLaunchInterval.min,
                    this.autoLaunchInterval.max
                );
            }
        }

        const gAcc = timeStep / 1000 * GRAVITY;
        const starDrag = 1 - (1 - this.starAirDrag) * speed;
        const starDragHeavy = 1 - (1 - this.starAirDragHeavy) * speed;
        const sparkDrag = 1 - (1 - this.sparkAirDrag) * speed;

        // 更新星星
        [...FIREWORK_COLOR_CODES, INVISIBLE].forEach(color => {
            const stars = this.stars.get(color) || [];
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                star.life -= timeStep;

                if (star.life <= 0) {
                    if (star.onDeath) star.onDeath(star);
                    stars.splice(i, 1);
                } else {
                    // 计算燃烧率（用于动态火花效果）
                    const burnRate = Math.pow(star.life / (star.maxLife || star.life), 0.5);
                    const burnRateInverse = 1 - burnRate;

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

                    // 螺旋旋转效果（上升时的螺旋轨迹）
                    if (star.spinRadius) {
                        star.spinAngle = (star.spinAngle || 0) + (star.spinSpeed || 0.8) * speed;
                        star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                        star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                    }

                    // 动态火花生成（随燃烧状态变化）
                    if (star.sparkFreq) {
                        star.sparkTimer = (star.sparkTimer || 0) - timeStep;
                        while (star.sparkTimer! < 0) {
                            // 动态调整火花频率：越接近燃尽，火花越稀疏
                            const dynamicFreq = star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                            star.sparkTimer! += dynamicFreq;

                            const sparkLifeVariation = star.sparkLifeVariation || 0.25;
                            const spark = createSpark(
                                star.x, star.y,
                                star.sparkColor || star.color,
                                Math.random() * PI_2,
                                Math.random() * (star.sparkSpeed || 0.5) * burnRate,
                                (star.sparkLife || 500) * (0.8 + Math.random() * sparkLifeVariation)
                            );
                            const colorSparks = this.sparks.get(spark.color) || [];
                            colorSparks.push(spark);
                            this.sparks.set(spark.color, colorSparks);
                        }
                    }

                    // 颜色过渡效果（彗星燃尽变透明）
                    if (star.transitionTime && star.life < star.transitionTime) {
                        if (star.secondColor && !star.colorChanged) {
                            star.colorChanged = true;
                            const newColor = star.secondColor;
                            star.color = newColor;
                            stars.splice(i, 1);
                            const newColorStars = this.stars.get(newColor) || [];
                            newColorStars.push(star);
                            this.stars.set(newColor, newColorStars);

                            // 如果变透明，停止发射火花
                            if (newColor === INVISIBLE) {
                                star.sparkFreq = 0;
                            }
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

    // ============================================================================
    // 渲染
    // ============================================================================

    private render(speed: number): void {
        const { dpr, width, height } = this;
        const ctx = this.trailsCtx || this.mainCtx;

        ctx.scale(dpr, dpr);
        this.mainCtx.scale(dpr, dpr);

        // 淡出效果
        if (this.trailsCtx) {
            this.trailsCtx.globalCompositeOperation = 'destination-out';
            this.trailsCtx.fillStyle = `rgba(0, 0, 0, ${this.trailFadeSpeed * speed})`;
            this.trailsCtx.fillRect(0, 0, width, height);
            this.trailsCtx.globalCompositeOperation = 'lighter';
        }

        this.mainCtx.clearRect(0, 0, width, height);

        // 绘制爆炸闪光
        while (this.burstFlashes.length) {
            const bf = this.burstFlashes.pop()!;
            const gradient = ctx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
            gradient.addColorStop(0.05, 'white');
            gradient.addColorStop(0.25, 'rgba(255, 160, 20, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 160, 20, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
        }

        // 绘制星星
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        this.mainCtx.strokeStyle = '#fff';
        this.mainCtx.lineWidth = 1;
        this.mainCtx.beginPath();

        FIREWORK_COLOR_CODES.forEach(color => {
            const stars = this.stars.get(color) || [];
            if (stars.length === 0) return;
            ctx.strokeStyle = color;
            ctx.beginPath();
            stars.forEach(star => {
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.prevX, star.prevY);
                this.mainCtx.moveTo(star.x, star.y);
                this.mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
            });
            ctx.stroke();
        });
        this.mainCtx.stroke();

        // 绘制火花
        ctx.lineWidth = 0.75;
        ctx.lineCap = 'butt';
        FIREWORK_COLOR_CODES.forEach(color => {
            const sparks = this.sparks.get(color) || [];
            if (sparks.length === 0) return;
            ctx.strokeStyle = color;
            ctx.beginPath();
            sparks.forEach(spark => {
                ctx.moveTo(spark.x, spark.y);
                ctx.lineTo(spark.prevX, spark.prevY);
            });
            ctx.stroke();
        });

        ctx.resetTransform();
        this.mainCtx.resetTransform();
    }

    // ============================================================================
    // 生命周期
    // ============================================================================

    start(): void {
        if (this.running) return;

        this.running = true;
        this.lastTime = performance.now();
        this.autoLaunchTimer = 500;

        const loop = () => {
            if (!this.running) return;

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

    stop(): void {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    dispose(): void {
        this.stop();
        this.soundManager?.dispose();
        this.stars.clear();
        this.sparks.clear();
        this.burstFlashes = [];
    }

    // ============================================================================
    // 状态查询
    // ============================================================================

    getState(): FireworksEngineState {
        let particleCount = 0;
        this.stars.forEach(arr => particleCount += arr.length);
        this.sparks.forEach(arr => particleCount += arr.length);

        return {
            running: this.running,
            particleCount,
            fps: 0, // TODO: 实现FPS计算
        };
    }

    isRunning(): boolean {
        return this.running;
    }
}

export default FireworksEngine;
