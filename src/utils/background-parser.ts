/**
 * 背景值解析工具
 * 将各种格式的 bgValue 字符串解析为标准化 StandardBgConfig
 */

import type { StandardBgConfig, BgMediaType } from '@/types/background';

/**
 * 根据 bgValue 字符串自动判断类型并生成 StandardBgConfig
 * 支持颜色值、图片URL、视频URL
 */
export function parseBgValueToConfig(bgValue: string): StandardBgConfig {
    if (!bgValue) {
        return { type: 'color', value: '#000000' };
    }

    let type: BgMediaType = 'color';

    // 判断是否为 CSS 颜色值
    if (
        bgValue.startsWith('#') ||
        bgValue.startsWith('rgb') ||
        bgValue.startsWith('hsl') ||
        bgValue.includes('gradient')
    ) {
        type = 'color';
    }
    // 判断是否为视频
    else if (
        /\.(mp4|webm|ogg|mov)$/i.test(bgValue) ||
        bgValue.includes('/video/')
    ) {
        type = 'video';
    }
    // 其他视为图片
    else if (bgValue) {
        type = 'image';
    }

    return {
        type,
        value: bgValue,
        videoAutoPlay: true,
        videoLoop: true,
        videoMuted: true,
        overlayOpacity: type === 'image' || type === 'video' ? 0.4 : 0,
    };
}

/**
 * 创建带覆盖层的背景配置
 * @param base 基础配置（type + value）
 * @param overlayOpacity 覆盖层透明度 (0-1)
 * @param overlayColor 覆盖层颜色（默认黑色）
 */
export function createBgConfigWithOverlay(
    base: { type: BgMediaType; value: string },
    overlayOpacity: number = 0.4,
    overlayColor: string = 'rgba(0, 0, 0, 1)'
): StandardBgConfig {
    return {
        type: base.type,
        value: base.value,
        videoAutoPlay: true,
        videoLoop: true,
        videoMuted: true,
        overlayColor,
        overlayOpacity,
    };
}
