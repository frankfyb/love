
export type ConfigInputType = 'slider' | 'color' | 'text' | 'textarea';

export interface ConfigItemDefinition<T = any> {
  defaultValue: T;
  label: string;
  type: ConfigInputType;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

// 1. 定义配置标准化 Schema
export const APP_CONFIG_SCHEMA = {
  particleCount: { 
    defaultValue: 120, 
    label: '氛围粒子密度', 
    type: 'slider', 
    min: 20, 
    max: 300, 
    step: 10, 
    description: '调整背景雪花与星星的数量' 
  },
  particleSize: { 
    defaultValue: 3, 
    label: '粒子尺寸', 
    type: 'slider', 
    min: 1, 
    max: 6, 
    step: 0.5, 
    description: '背景粒子的大小' 
  },
  particleColor: { 
    defaultValue: '#FFD700', 
    label: '主题点缀色', 
    type: 'color', 
    description: '星星和高光的主色调' 
  },
  glassBlur: { 
    defaultValue: 12, 
    label: '磨砂质感', 
    type: 'slider', 
    min: 0, 
    max: 24, 
    step: 1, 
    description: '卡片背景模糊程度 (px)' 
  },
  glassOpacity: { 
    defaultValue: 0.85, 
    label: '卡片浓度', 
    type: 'slider', 
    min: 0.1, 
    max: 1.0, 
    step: 0.05, 
    description: '卡片背景的不透明度' 
  },
  particleSpeed: { 
    defaultValue: 0.6, 
    label: '飘落速度', 
    type: 'slider', 
    min: 0.1, 
    max: 3, 
    step: 0.1, 
    description: '雪花下落的快慢' 
  },
  capsuleText: { 
    defaultValue: '', 
    label: '一键祝福', 
    type: 'text', 
    description: '替换所有的“圣诞快乐”文本' 
  },
  treeTextLevels: { 
    defaultValue: '1圣→诞→圣诞→快乐→圣诞快乐→圣诞快乐→圣诞快乐快乐→圣诞快乐快乐→圣诞快乐圣诞快乐→圣诞快乐圣诞快乐', 
    label: '树体文案', 
    type: 'textarea', 
    description: '用“→”分隔，建议成对配置' 
  },
  treeBottomLetters: { 
    defaultValue: 'L/H/J/C/Y/E', 
    label: '树干拼图', 
    type: 'text', 
    description: '用“/”分隔字母' 
  },
} as const;

// 2. 自动推导配置类型，保证类型安全
export type AppConfigKey = keyof typeof APP_CONFIG_SCHEMA;
export type AppConfig = {
  [K in AppConfigKey]: typeof APP_CONFIG_SCHEMA[K]['defaultValue'];
};

// 辅助函数：获取默认配置
export function getDefaultConfig(): AppConfig {
  const config = {} as AppConfig;
  for (const key in APP_CONFIG_SCHEMA) {
    config[key as AppConfigKey] = APP_CONFIG_SCHEMA[key as AppConfigKey].defaultValue;
  }
  return config;
}

// 兼容性导出
export const DEFAULT_CONFIG = getDefaultConfig();

export const CONFIG_METADATA = Object.entries(APP_CONFIG_SCHEMA).map(([key, meta]) => ({
  key: key as AppConfigKey,
  ...meta,
}));
