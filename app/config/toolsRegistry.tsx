import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/common/Loading';

import { DEFAULT_CONFIG as christmasDefaultConfig } from '@/tools/christmas-card/config';
const ChristmasCardDisplayUI = dynamic(() => import('@/tools/christmas-card/DisplayUI'), { loading: () => <Loading /> });
const ChristmasCardConfigUI = dynamic(() => import('@/tools/christmas-card/ConfigUI'), { loading: () => <Loading /> });

import { DEFAULT_CONFIG as rainSnowRippleDefault } from '@/tools/rain-snow-ripple/config';
const RainSnowRippleDisplayUI = dynamic(() => import('@/tools/rain-snow-ripple/DisplayUI'), { loading: () => <Loading /> });
const RainSnowRippleConfigUI = dynamic(() => import('@/tools/rain-snow-ripple/ConfigUI'), { loading: () => <Loading /> });

import { defaultConfig as warmTextDefault } from '@/tools/warm-text-card/config';
const WarmTextCardDisplayUI = dynamic(() => import('@/tools/warm-text-card/DisplayUI'), { loading: () => <Loading /> });
const WarmTextCardConfigUI = dynamic(() => import('@/tools/warm-text-card/ConfigUI'), { loading: () => <Loading /> });

import { DEFAULT_CONFIG as birthdayDefaultConfig } from '@/tools/birthday-romance/config';
const BirthdayRomanceDisplayUI = dynamic(() => import('@/tools/birthday-romance/DisplayUI'), { loading: () => <Loading /> });
const BirthdayRomanceConfigUI = dynamic(() => import('@/tools/birthday-romance/ConfigUI'), { loading: () => <Loading /> });
import { DEFAULT_CONFIG as christmasAvatarDefault } from '@/tools/christmas-avatar/config';
const ChristmasAvatarDisplayUI = dynamic(() => import('@/tools/christmas-avatar/DisplayUI'), { loading: () => <Loading /> });
const ChristmasAvatarConfigUI = dynamic(() => import('@/tools/christmas-avatar/ConfigUI'), { loading: () => <Loading /> });

import { DEFAULT_CONFIG as birthdayRomanceV2Default } from '@/tools/birthday-romance-v2';
const BirthdayRomanceV2DisplayUI = dynamic(() => import('@/tools/birthday-romance-v2').then(mod => mod.DisplayUI), { loading: () => <Loading /> });
const BirthdayRomanceV2ConfigUI = dynamic(() => import('@/tools/birthday-romance-v2').then(mod => mod.ConfigUI), { loading: () => <Loading /> });
import { DEFAULT_CONFIG as axuyuantreeDefault } from '@/tools/axuyuantree/index';
const AxuyuantreeDisplayUI = dynamic(() => import('@/tools/axuyuantree').then(mod => mod.DisplayUI), { loading: () => <Loading /> });
const AxuyuantreeConfigUI = dynamic(() => import('@/tools/axuyuantree').then(mod => mod.ConfigUI), { loading: () => <Loading /> });  
// ========================== 类型定义（强化类型约束）==========================
/**
 * 工具基础配置项类型
 */
type ToolKey = 'christmas-card' | 'warm-text-card' | 'rain-snow-ripple' | 'birthday-romance' | 'christmas-avatar' | 'christmas-card-advanced' | 'birthday-romance-v2' | 'axuyuantree';

interface ToolBasicConfig {
  // 工具显示名称
  name: string;
  // 工具可视化组件
  DisplayUI: ComponentType<any>;
  // 工具配置组件
  ConfigUI: ComponentType<any>;
  // 工具默认配置
  defaultConfig: Record<string, any>;
}

/**
 * 工具注册表类型（关联工具标识和完整配置）
 */
// type ToolRegistry = Record<ToolKey, ToolBasicConfig>;

// ========================== 核心配置（聚合管理）==========================
/**
 * 工具核心配置注册表（所有工具配置统一管理）
 * 新增/删除工具只需修改这个对象，无需维护多个分散的注册表
 */
const toolRegistry= {
  'christmas-card': {
    name: '圣诞贺卡',
    DisplayUI: ChristmasCardDisplayUI,
    ConfigUI: ChristmasCardConfigUI,
    defaultConfig: christmasDefaultConfig,
  },
  'warm-text-card': {
    name: '温馨文字卡片',
    DisplayUI: WarmTextCardDisplayUI,
    ConfigUI: WarmTextCardConfigUI,
    defaultConfig: warmTextDefault,
  },
  
  'rain-snow-ripple': {
    name: '雨雪涟漪特效',
    DisplayUI: RainSnowRippleDisplayUI,
    ConfigUI: RainSnowRippleConfigUI,
    defaultConfig: rainSnowRippleDefault,
  },
  'birthday-romance': {
    name: '生日浪漫生成器',
    DisplayUI: BirthdayRomanceDisplayUI,
    ConfigUI: BirthdayRomanceConfigUI,
    defaultConfig: birthdayDefaultConfig,
  },
  'christmas-avatar': {
    name: '圣诞头像工坊',
    DisplayUI: ChristmasAvatarDisplayUI,
    ConfigUI: ChristmasAvatarConfigUI,
    defaultConfig: christmasAvatarDefault,
  },
  'birthday-romance-v2': {
    name: '生日浪漫生成器 V2',
    DisplayUI: BirthdayRomanceV2DisplayUI,
    ConfigUI: BirthdayRomanceV2ConfigUI,
    defaultConfig: birthdayRomanceV2Default,
  },
  'axuyuantree': {
    name: '许愿元树',
    DisplayUI: AxuyuantreeDisplayUI,
    ConfigUI: AxuyuantreeConfigUI,
    defaultConfig: axuyuantreeDefault,
  },
};


// ========================== 通用工具函数（统一封装）==========================
/**
 * 通用获取工具配置的方法（基础封装，避免重复逻辑）
 */
const getToolConfig = <T extends keyof ToolBasicConfig>(
  toolKey: ToolKey,
  configKey: T
): ToolBasicConfig[T] => {
  const toolConfig = toolRegistry[toolKey];
  if (!toolConfig) {
    throw new Error(`未找到工具【${toolKey}】的基础配置`);
  }

  const targetConfig = toolConfig[configKey];
  if (!targetConfig) {
    throw new Error(`未找到工具【${toolKey}】的${configKey}配置`);
  }

  return targetConfig;
};

/**
 * 获取工具UI组件
 */
export const getToolUI = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'DisplayUI');
};

/**
 * 获取工具配置UI组件
 */
export const getToolConfigUI = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'ConfigUI');
};

/**
 * 获取工具默认配置
 */
export const getToolDefaultConfig = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'defaultConfig');
};

/**
 * 获取工具显示名称
 */
export const getToolName = (toolKey: ToolKey) => {
  return getToolConfig(toolKey, 'name');
};

/**
 * 获取所有工具标识列表（方便遍历/下拉选择等场景）
 */
export const getToolKeyList = (): ToolKey[] => {
  return Object.keys(toolRegistry) as ToolKey[];
};

/**
 * 获取工具的完整配置（适用于需要同时使用多个配置项的场景）
 */
export const getToolFullConfig = (toolKey: ToolKey): ToolBasicConfig => {
  const toolConfig = toolRegistry[toolKey];
  if (!toolConfig) {
    throw new Error(`未找到工具【${toolKey}】的完整配置`);
  }
  return toolConfig;
};

// ========================== 导出完整注册表（可选，供特殊场景使用）==========================
export { toolRegistry };
