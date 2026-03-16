/**
 * 随机工具函数库
 * 统一所有工具中的随机相关函数，避免重复定义
 */

/**
 * 通用随机函数
 * @param a - 如果是数组，返回随机元素；如果是数字且无b，返回0-a之间的随机数；如果a和b都是数字，返回a-b之间的随机数
 * @param b - 可选的上限
 */
export function random<T>(a: T[], b?: undefined): T;
export function random(a: number, b?: undefined): number;
export function random(a: number, b: number): number;
export function random<T>(a: number | T[], b?: number): T | number {
    if (Array.isArray(a)) {
        return a[Math.floor(Math.random() * a.length)];
    }
    if (b === undefined) {
        return Math.random() * a;
    }
    return Math.random() * (b - a) + a;
}

/**
 * 生成指定范围内的随机数
 * @param min - 最小值
 * @param max - 最大值
 */
export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * 生成指定范围内的随机整数
 * @param min - 最小值（包含）
 * @param max - 最大值（包含）
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 按概率返回 true
 * @param probability - 概率 0-1
 */
export function randomChance(probability: number): boolean {
    return Math.random() < probability;
}

/**
 * 从数组中随机选择指定数量的元素
 * @param array - 源数组
 * @param count - 选择数量
 */
export function randomPick<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Fisher-Yates 洗牌算法
 * @param array - 待洗牌数组
 */
export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
