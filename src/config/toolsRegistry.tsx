import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import { GenericConfigPanel } from '@/components/config-controls/GenericConfigPanel';

// ========================== 1. 工具配置导入（保留原有，新增configMetadata）==========================

// 雨雪涟漪特效
import { DEFAULT_CONFIG as rainSnowRippleDefault, rainSnowRippleConfigMetadata as rainSnowRippleMetadata } from '@tools/rain-snow-ripple/index';
const RainSnowRippleDisplayUI = dynamic(() => import('@tools/rain-snow-ripple').then(mod => mod.default), { loading: () => <Loading /> });

// 温馨文字卡片
import { DEFAULT_CONFIG as warmTextDefault, warmTextCardConfigMetadata as warmTextMetadata } from '@tools/warm-text-card/index';
const WarmTextCardDisplayUI = dynamic(() => import('@tools/warm-text-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });




import { DEFAULT_CONFIG as galaxyWeaverDefault, galaxyWeaverConfigMetadata as galaxyWeaverMetadata } from '@tools/galaxy-weaver/index';
const GalaxyWeaverDisplayUI = dynamic(() => import('@tools/galaxy-weaver').then(mod => mod.DisplayUI), { loading: () => <Loading /> });


















import { DEFAULT_CONFIG as customFireworksDefault, customFireworksCardConfigMetadata as customFireworksMetadata } from '@tools/custom-fireworks/index';
const CustomFireworksDisplayUI = dynamic(() => import('@tools/custom-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 浪漫爱心 (集成多种浪漫爱心效果)
import { DEFAULT_CONFIG as romanticHeartsDefault, romanticHeartsConfigMetadata as romanticHeartsMetadata } from '@tools/romantic-hearts/index';
const RomanticHeartsDisplayUI = dynamic(() => import('@tools/romantic-hearts').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

import { DEFAULT_CONFIG as couplesAgreementDefault, couplesAgreementConfigMetadata as couplesAgreementMetadata } from '@tools/couples-agreement/index';
const CouplesAgreementDisplayUI = dynamic(() => import('@tools/couples-agreement').then(mod => mod.DisplayUI), { loading: () => <Loading /> });


import { DEFAULT_CONFIG as loveClockDiyDefault, loveClockDiyConfigMetadata as loveClockDiyMetadata } from '@tools/love-clock-diy/index';
const LoveClockDiyDisplayUI = dynamic(() => import('@tools/love-clock-diy').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 爱你的理由心形特效
import { DEFAULT_CONFIG as reasonsToLoveDefault, reasonsToLoveConfigMetadata as reasonsToLoveMetadata } from '@tools/reasons-to-love/index';
const ReasonsToLoveDisplayUI = dynamic(() => import('@tools/reasons-to-love').then(mod => mod.DisplayUI), { loading: () => <Loading /> });


/**
 * 工具基础配置项类型（扩展：新增configMetadata）
 */
type ToolKey = 'warm-text-card' | 'rain-snow-ripple' | 'galaxy-weaver' | 'custom-fireworks' | 'romantic-hearts' | 'couples-agreement' | 'love-clock-diy' | 'reasons-to-love';

interface ToolBasicConfig<T = any> {
  // 原有字段
  name: string;
  DisplayUI: ComponentType<any>;
  defaultConfig: T;
  // 新增：通用配置面板元数据（核心）
  configMetadata: ToolConfigMetadata<T>;
  // 可选：保留自定义ConfigUI（兼容老工具，逐步替换）
  ConfigUI?: ComponentType<any>;
}

// ========================== 3. 核心配置注册表（改造：新增configMetadata）==========================
const toolRegistry: Record<ToolKey, ToolBasicConfig> = {
  'warm-text-card': {
    name: '温馨文字卡片',
    DisplayUI: WarmTextCardDisplayUI,
    defaultConfig: warmTextDefault,
    configMetadata: warmTextMetadata,
    // ConfigUI: WarmTextCardConfigUI,
  },
  'rain-snow-ripple': {
    name: '雨雪涟漪特效',
    DisplayUI: RainSnowRippleDisplayUI,
    defaultConfig: rainSnowRippleDefault,
    configMetadata: rainSnowRippleMetadata,
    // ConfigUI: RainSnowRippleConfigUI,
  },

  'galaxy-weaver': {
    name: '银河工坊',
    DisplayUI: GalaxyWeaverDisplayUI,
    defaultConfig: galaxyWeaverDefault,
    configMetadata: galaxyWeaverMetadata,
  },



  'custom-fireworks': {
    name: '定制烟花',
    DisplayUI: CustomFireworksDisplayUI,
    defaultConfig: customFireworksDefault,
    configMetadata: customFireworksMetadata,
  },
  'romantic-hearts': {
    name: '浪漫爱心',
    DisplayUI: RomanticHeartsDisplayUI,
    defaultConfig: romanticHeartsDefault,
    configMetadata: romanticHeartsMetadata,
  },
  'couples-agreement': {
    name: '情侣协议书',
    DisplayUI: CouplesAgreementDisplayUI,
    defaultConfig: couplesAgreementDefault,
    configMetadata: couplesAgreementMetadata,
  },
  'love-clock-diy': {
    name: '专属恋爱时钟',
    DisplayUI: LoveClockDiyDisplayUI,
    defaultConfig: loveClockDiyDefault,
    configMetadata: loveClockDiyMetadata,
  },
  'reasons-to-love': {
    name: '爱你的理由',
    DisplayUI: ReasonsToLoveDisplayUI,
    defaultConfig: reasonsToLoveDefault,
    configMetadata: reasonsToLoveMetadata,
  },
};


export default toolRegistry;

// ========================== 4. 通用工具函数（新增：获取配置元数据）==========================
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

// 原有方法（保留）
export const getToolUI = (toolKey: ToolKey) => getToolConfig(toolKey, 'DisplayUI');
export const getToolDefaultConfig = (toolKey: ToolKey) => getToolConfig(toolKey, 'defaultConfig');
export const getToolName = (toolKey: ToolKey) => getToolConfig(toolKey, 'name');
export const getToolKeyList = (): ToolKey[] => Object.keys(toolRegistry) as ToolKey[];
export const getToolFullConfig = (toolKey: ToolKey): ToolBasicConfig => {
  const toolConfig = toolRegistry[toolKey];
  if (!toolConfig) throw new Error(`未找到工具【${toolKey}】的完整配置`);
  return toolConfig;
};

// 新增：获取工具配置元数据（通用面板核心）
export const getToolConfigMetadata = <T extends unknown>(toolKey: ToolKey): ToolConfigMetadata<T> => {
  return getToolConfig(toolKey, 'configMetadata') as ToolConfigMetadata<T>;
};

// // 改造：获取配置UI（优先返回通用面板，兼容自定义ConfigUI）
// export const getToolConfigUI = (toolKey: ToolKey) => {
//   const toolConfig = toolRegistry[toolKey];
//   if (!toolConfig) throw new Error(`未找到工具【${toolKey}】的配置UI`);

//   // 优先使用通用配置面板（核心改造）
//   return (props: { config: any; onChange: (key: string, value: any) => void }) => {
//     const { config, onChange } = props;
//     const metadata = getToolConfigMetadata(toolKey);
//     // 渲染通用配置面板
//     return <GenericConfigPanel 
//       config={config} 
//       configMetadata={metadata} 
//       onChange={onChange} 
//     />;
//   };

// 可选：兼容模式（部分工具保留自定义ConfigUI）
// return toolConfig.ConfigUI || ((props) => <GenericConfigPanel {...props} configMetadata={getToolConfigMetadata(toolKey)} />);
// };

// ========================== 导出完整注册表 ==========================
export { toolRegistry };