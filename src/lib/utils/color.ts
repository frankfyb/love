/**
 * 颜色工具函数库
 * 统一所有工具中的颜色相关函数和常量
 */

// ============================================================================
// 颜色常量定义
// ============================================================================

/**
 * 烟花颜色配置
 */
export const FIREWORK_COLORS = {
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

export const FIREWORK_COLOR_CODES = Object.values(FIREWORK_COLORS);

/**
 * 浪漫主题颜色
 */
export const ROMANTIC_COLORS = [
    '#ff6b9d', '#ff8fab', '#ffb3c6', '#ffc2d1',
    '#ea80b0', '#ff69b4', '#ff1493', '#db7093',
    '#e91e63', '#f48fb1', '#f8bbd9', '#fce4ec',
] as const;

/**
 * 浮动文字颜色
 */
export const FLOATING_TEXT_COLORS = [
    '#ff6b9d', '#ff8fab', '#ffc2d1', '#ea80b0',
    '#ff69b4', '#ff1493', '#db7093', '#e91e63',
    '#f48fb1', '#ffb6c1', '#ff7eb3', '#ff91a4',
] as const;

/**
 * 节日喜庆颜色
 */
export const FESTIVE_COLORS = [
    '#ff0000', '#ff6600', '#ffcc00', '#ff3333',
    '#cc0000', '#ff9900', '#ffff00', '#ff6666',
] as const;

// ============================================================================
// 颜色工具函数
// ============================================================================

/**
 * 从颜色数组中随机选择颜色
 * @param colors - 颜色数组，默认使用烟花颜色
 * @param options - 可选配置
 */
export function randomColor(
    colors: readonly string[] = FIREWORK_COLOR_CODES,
    options?: {
        notSame?: boolean;
        notColor?: string;
        limitWhite?: boolean;
    }
): string {
    let color = colors[Math.floor(Math.random() * colors.length)];

    // 限制白色出现概率
    if (options?.limitWhite && color === FIREWORK_COLORS.White && Math.random() < 0.6) {
        color = colors[Math.floor(Math.random() * colors.length)];
    }

    // 避免选择特定颜色
    if (options?.notSame && options?.notColor && color === options.notColor) {
        const filtered = colors.filter(c => c !== options.notColor);
        if (filtered.length > 0) {
            color = filtered[Math.floor(Math.random() * filtered.length)];
        }
    }

    return color;
}

/**
 * 解析十六进制颜色为 RGB 对象
 * @param hex - 十六进制颜色值
 */
export function parseToRGB(hex: string): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');
    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

/**
 * RGB 对象转十六进制颜色
 * @param rgb - RGB 对象
 */
export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n)))
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * 解析十六进制颜色为 RGBA 字符串
 * @param hex - 十六进制颜色值
 * @param alpha - 透明度 0-1
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
    const { r, g, b } = parseToRGB(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 调整颜色亮度
 * @param hex - 十六进制颜色值
 * @param factor - 亮度因子，大于1变亮，小于1变暗
 */
export function adjustBrightness(hex: string, factor: number): string {
    const rgb = parseToRGB(hex);
    return rgbToHex({
        r: rgb.r * factor,
        g: rgb.g * factor,
        b: rgb.b * factor,
    });
}

/**
 * 混合两个颜色
 * @param color1 - 第一个颜色
 * @param color2 - 第二个颜色
 * @param ratio - 混合比例，0-1，0为纯color1，1为纯color2
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
    const rgb1 = parseToRGB(color1);
    const rgb2 = parseToRGB(color2);
    return rgbToHex({
        r: rgb1.r + (rgb2.r - rgb1.r) * ratio,
        g: rgb1.g + (rgb2.g - rgb1.g) * ratio,
        b: rgb1.b + (rgb2.b - rgb1.b) * ratio,
    });
}

/**
 * 生成渐变色数组
 * @param startColor - 起始颜色
 * @param endColor - 结束颜色
 * @param steps - 步数
 */
export function generateGradient(startColor: string, endColor: string, steps: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < steps; i++) {
        colors.push(blendColors(startColor, endColor, i / (steps - 1)));
    }
    return colors;
}
