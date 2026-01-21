/**
 * 工具函数统一导出入口
 * 使用方式: import { random, randomColor, lerp } from '@/lib/utils';
 */

// 随机工具
export {
    random,
    randomRange,
    randomInt,
    randomChance,
    randomPick,
    shuffle,
} from './random';

// 颜色工具
export {
    FIREWORK_COLORS,
    FIREWORK_COLOR_CODES,
    ROMANTIC_COLORS,
    FLOATING_TEXT_COLORS,
    FESTIVE_COLORS,
    randomColor,
    parseToRGB,
    rgbToHex,
    hexToRgba,
    adjustBrightness,
    blendColors,
    generateGradient,
} from './color';

// 数学工具
export {
    PI,
    PI_2,
    PI_HALF,
    DEG_TO_RAD,
    RAD_TO_DEG,
    GRAVITY,
    DEFAULT_AIR_DRAG,
    HEAVY_AIR_DRAG,
    SPARK_AIR_DRAG,
    clamp,
    lerp,
    inverseLerp,
    remap,
    degToRad,
    radToDeg,
    distance,
    distanceVec,
    magnitude,
    normalize,
    angleBetween,
    easing,
} from './math';

export type { Vector2D, EasingFunction } from './math';
