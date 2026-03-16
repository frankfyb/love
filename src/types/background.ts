/**
 * 通用背景类型定义（所有工具共享）
 */
export type BgMediaType = 'color' | 'image' | 'video';

/**
 * 标准化背景配置（替代各工具零散的 bgValue）
 * 所有支持背景的工具统一使用此配置
 */
export interface StandardBgConfig {
  type: BgMediaType;              // 背景类型
  value: string;                  // 颜色值/图片URL/视频URL
  // 视频特有配置（所有工具共用）
  videoAutoPlay?: boolean;        // 是否自动播放
  videoLoop?: boolean;            // 是否循环
  videoMuted?: boolean;           // 是否静音
  // 图片特有配置
  imageFit?: 'cover' | 'contain' | 'fill';
  // 可选覆盖层（用于增加对比度）
  overlayColor?: string;          // 覆盖层颜色
  overlayOpacity?: number;        // 覆盖层透明度 0-1
}

/**
 * 背景预设项格式（统一各工具的 PRESETS.backgrounds）
 * 用于生成背景选择器
 */
export interface BgPresetItem {
  label: string;                  // 显示标签
  value: string;                  // 背景值
  type: BgMediaType;              // 背景类型
  thumbnail?: string;             // 预览图URL
  description?: string;           // 描述文字
}

/**
 * 工具配置扩展：所有带背景的工具需继承此接口
 * 实现向后兼容和标准化背景配置
 */
export interface WithBgConfig {
  bgConfig?: StandardBgConfig;    // 标准化背景配置（推荐）
}

/**
 * 背景渲染选项
 */
export interface BgRenderOptions {
  enableOverlay?: boolean;        // 是否启用覆盖层
  className?: string;             // CSS 类名
  style?: React.CSSProperties;   // 内联样式
}