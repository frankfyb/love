/**
 * 数学工具函数库
 * 统一所有工具中的数学计算函数
 */

// ============================================================================
// 常量定义
// ============================================================================

export const PI = Math.PI;
export const PI_2 = Math.PI * 2;
export const PI_HALF = Math.PI / 2;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

// 物理常量
export const GRAVITY = 0.9;
export const DEFAULT_AIR_DRAG = 0.98;
export const HEAVY_AIR_DRAG = 0.992;
export const SPARK_AIR_DRAG = 0.9;

// ============================================================================
// 基础数学函数
// ============================================================================

/**
 * 限制数值在指定范围内
 * @param value - 输入值
 * @param min - 最小值
 * @param max - 最大值
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 * @param start - 起始值
 * @param end - 结束值
 * @param t - 插值因子 0-1
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * 反向线性插值 - 计算 value 在 start 和 end 之间的比例
 * @param start - 起始值
 * @param end - 结束值
 * @param value - 当前值
 */
export function inverseLerp(start: number, end: number, value: number): number {
    if (start === end) return 0;
    return clamp((value - start) / (end - start), 0, 1);
}

/**
 * 重映射值从一个范围到另一个范围
 * @param value - 输入值
 * @param inMin - 输入范围最小值
 * @param inMax - 输入范围最大值
 * @param outMin - 输出范围最小值
 * @param outMax - 输出范围最大值
 */
export function remap(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    const t = inverseLerp(inMin, inMax, value);
    return lerp(outMin, outMax, t);
}

// ============================================================================
// 角度与弧度转换
// ============================================================================

/**
 * 角度转弧度
 */
export function degToRad(degrees: number): number {
    return degrees * DEG_TO_RAD;
}

/**
 * 弧度转角度
 */
export function radToDeg(radians: number): number {
    return radians * RAD_TO_DEG;
}

// ============================================================================
// 向量与几何计算
// ============================================================================

/**
 * 2D 向量类型
 */
export interface Vector2D {
    x: number;
    y: number;
}

/**
 * 计算两点之间的距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的距离（向量版本）
 */
export function distanceVec(p1: Vector2D, p2: Vector2D): number {
    return distance(p1.x, p1.y, p2.x, p2.y);
}

/**
 * 计算向量长度
 */
export function magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 向量归一化
 */
export function normalize(v: Vector2D): Vector2D {
    const mag = magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
}

/**
 * 计算两点之间的角度（弧度）
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

// ============================================================================
// 缓动函数
// ============================================================================

/**
 * 缓动函数类型
 */
export type EasingFunction = (t: number) => number;

export const easing = {
    // 线性
    linear: (t: number): number => t,

    // 二次方
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // 三次方
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => (--t) * t * t + 1,
    easeInOutCubic: (t: number): number =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // 正弦
    easeInSine: (t: number): number => 1 - Math.cos((t * PI) / 2),
    easeOutSine: (t: number): number => Math.sin((t * PI) / 2),
    easeInOutSine: (t: number): number => -(Math.cos(PI * t) - 1) / 2,

    // 指数
    easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

    // 弹性
    easeOutElastic: (t: number): number => {
        const c4 = (2 * PI) / 3;
        return t === 0
            ? 0
            : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    // 弹跳
    easeOutBounce: (t: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
};
