/**
 * 通用粒子类
 * 所有粒子效果的基础实现
 */

import type { StarParticle, SparkParticle, BaseParticle } from './types';

// 内联常量（避免路径解析问题）
const PI_2 = Math.PI * 2;
const GRAVITY = 0.9;
const DEFAULT_AIR_DRAG = 0.98;
const HEAVY_AIR_DRAG = 0.992;
const SPARK_AIR_DRAG = 0.9;

// ============================================================================
// 粒子池管理
// ============================================================================

export class ParticlePool<T extends BaseParticle> {
    private pool: T[] = [];
    private active: T[] = [];
    private factory: () => T;

    constructor(factory: () => T, initialSize: number = 100) {
        this.factory = factory;
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }

    /**
     * 获取一个粒子
     */
    acquire(): T {
        const particle = this.pool.pop() || this.factory();
        this.active.push(particle);
        return particle;
    }

    /**
     * 释放一个粒子
     */
    release(particle: T): void {
        const index = this.active.indexOf(particle);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(particle);
        }
    }

    /**
     * 获取所有活跃粒子
     */
    getActive(): readonly T[] {
        return this.active;
    }

    /**
     * 清空所有活跃粒子
     */
    clear(): void {
        this.pool.push(...this.active);
        this.active = [];
    }

    /**
     * 获取活跃粒子数量
     */
    get activeCount(): number {
        return this.active.length;
    }
}

// ============================================================================
// 粒子工具函数
// ============================================================================

/**
 * 创建星星粒子
 */
export function createStar(
    x: number,
    y: number,
    color: string,
    angle: number,
    speed: number,
    life: number,
    speedOffX: number = 0,
    speedOffY: number = 0
): StarParticle {
    return {
        x,
        y,
        prevX: x,
        prevY: y,
        color,
        speedX: Math.sin(angle) * speed + speedOffX,
        speedY: Math.cos(angle) * speed + speedOffY,
        life,
        maxLife: life,
        heavy: false,
    };
}

/**
 * 创建火花粒子
 */
export function createSpark(
    x: number,
    y: number,
    color: string,
    angle: number,
    speed: number,
    life: number
): SparkParticle {
    return {
        x,
        y,
        prevX: x,
        prevY: y,
        color,
        speedX: Math.sin(angle) * speed,
        speedY: Math.cos(angle) * speed,
        life,
        maxLife: life,
        size: 1,
    };
}

/**
 * 更新星星粒子
 */
export function updateStar(
    star: StarParticle,
    deltaTime: number,
    speed: number,
    gravity: number = GRAVITY
): boolean {
    star.life -= deltaTime;

    if (star.life <= 0) {
        if (star.onDeath) {
            star.onDeath(star);
        }
        return false;
    }

    star.prevX = star.x;
    star.prevY = star.y;
    star.x += star.speedX * speed;
    star.y += star.speedY * speed;

    const drag = star.heavy ? HEAVY_AIR_DRAG : DEFAULT_AIR_DRAG;
    const dragSpeed = 1 - (1 - drag) * speed;

    star.speedX *= dragSpeed;
    star.speedY *= dragSpeed;
    star.speedY += (deltaTime / 1000) * gravity;

    return true;
}

/**
 * 更新火花粒子
 */
export function updateSpark(
    spark: SparkParticle,
    deltaTime: number,
    speed: number,
    gravity: number = GRAVITY
): boolean {
    spark.life -= deltaTime;

    if (spark.life <= 0) {
        return false;
    }

    spark.prevX = spark.x;
    spark.prevY = spark.y;
    spark.x += spark.speedX * speed;
    spark.y += spark.speedY * speed;

    const dragSpeed = 1 - (1 - SPARK_AIR_DRAG) * speed;
    spark.speedX *= dragSpeed;
    spark.speedY *= dragSpeed;
    spark.speedY += (deltaTime / 1000) * gravity;

    return true;
}

/**
 * 创建粒子弧线
 */
export function createParticleArc(
    start: number,
    arcLength: number,
    count: number,
    randomness: number,
    factory: (angle: number) => void
): void {
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

/**
 * 计算粒子透明度（基于生命周期）
 */
export function getParticleAlpha(particle: BaseParticle): number {
    if (!particle.maxLife) return 1;
    return Math.max(0, particle.life / particle.maxLife);
}
