import type { StandardBgConfig, BgMediaType } from '@/types/background';

/**
 * 工具函数：将旧版 bgValue 转换为标准化背景配置
 * 所有工具可复用此函数，避免重复解析逻辑
 * 
 * @param bgValue - 旧版背景值（颜色/图片URL/视频URL）
 * @param options - 可选配置覆盖
 * @returns 标准化背景配置
 */
export const parseBgValueToConfig = (
  bgValue: string,
  options?: Partial<StandardBgConfig>
): StandardBgConfig => {
  let type: BgMediaType = 'color';
  
  if (!bgValue) {
    return { type: 'color', value: '#0f172a', ...options };
  }

  // 颜色判断
  if (bgValue.startsWith('#') || bgValue.startsWith('rgb') || bgValue.startsWith('hsl')) {
    type = 'color';
  } 
  // 视频判断
  else if (/\.(mp4|webm|ogg|mov)$/i.test(bgValue) || bgValue.includes('/video/')) {
    type = 'video';
  } 
  // 图片判断（URL 或路径）
  else if (bgValue.startsWith('http') || bgValue.startsWith('/')) {
    type = 'image';
  }

  return {
    type,
    value: bgValue,
    videoAutoPlay: true,
    videoLoop: true,
    videoMuted: true,
    imageFit: 'cover',
    overlayOpacity: type === 'image' || type === 'video' ? 0.4 : 0,
    ...options,
  };
};

/**
 * 工具函数：将标准化配置转换回 bgValue（兼容旧逻辑）
 * 
 * @param config - 标准化背景配置
 * @returns 背景值字符串
 */
export const convertBgConfigToValue = (config: StandardBgConfig): string => {
  return config.value;
};

/**
 * 工具函数：检测背景类型（自动检测）
 * 
 * @param bgValue - 背景值
 * @returns 背景类型
 */
export const detectBgType = (bgValue: string): BgMediaType => {
  if (!bgValue) return 'color';
  if (bgValue.startsWith('#') || bgValue.startsWith('rgb') || bgValue.startsWith('hsl')) {
    return 'color';
  }
  if (/\.(mp4|webm|ogg|mov)$/i.test(bgValue) || bgValue.includes('/video/')) {
    return 'video';
  }
  return 'image';
};

/**
 * 工具函数：创建具有覆盖层的背景配置
 * 用于增加视觉对比度，使文字更清晰
 * 
 * @param config - 原始背景配置
 * @param overlayOpacity - 覆盖层透明度（0-1）
 * @param overlayColor - 覆盖层颜色（默认黑色）
 * @returns 带覆盖层的背景配置
 */
export const createBgConfigWithOverlay = (
  config: StandardBgConfig,
  overlayOpacity: number = 0.4,
  overlayColor: string = 'rgba(0, 0, 0, 1)'
): StandardBgConfig => {
  return {
    ...config,
    overlayOpacity,
    overlayColor,
  };
};

/**
 * 工具函数：合并背景配置（深度合并）
 * 用于继承基础配置并覆盖特定属性
 * 
 * @param base - 基础配置
 * @param overrides - 覆盖配置
 * @returns 合并后的配置
 */
export const mergeBgConfig = (
  base: StandardBgConfig,
  overrides: Partial<StandardBgConfig>
): StandardBgConfig => {
  return {
    ...base,
    ...overrides,
  };
};