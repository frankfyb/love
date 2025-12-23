import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/common/Loading';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';

// ========================== 1. 工具配置导入（保留原有，新增configMetadata）==========================
// 圣诞贺卡
import { DEFAULT_CONFIG as christmasDefaultConfig, christmasCardConfigMetadata as christmasMetadata } from '@/tools/christmas-card/index';
const ChristmasCardDisplayUI = dynamic(() => import('@/tools/christmas-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 雨雪涟漪特效
import { DEFAULT_CONFIG as rainSnowRippleDefault, rainSnowRippleConfigMetadata as rainSnowRippleMetadata } from '@/tools/rain-snow-ripple/index';
const RainSnowRippleDisplayUI = dynamic(() => import('@/tools/rain-snow-ripple').then(mod => mod.default), { loading: () => <Loading /> });

// 温馨文字卡片
import { DEFAULT_CONFIG as warmTextDefault, warmTextCardConfigMetadata as warmTextMetadata } from '@/tools/warm-text-card/index';
const WarmTextCardDisplayUI = dynamic(() => import('@/tools/warm-text-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 圣诞头像工坊
import { DEFAULT_CONFIG as christmasAvatarDefault, christmasAvatarConfigMetadata as christmasAvatarMetadata } from '@/tools/christmas-avatar/index';
const ChristmasAvatarDisplayUI = dynamic(() => import('@/tools/christmas-avatar').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 生日浪漫生成器 V2
import { DEFAULT_CONFIG as birthdayRomanceV2Default, birthdayRomanceV2ConfigMetadata as birthdayRomanceV2Metadata } from '@/tools/birthday-romance-v2';
const BirthdayRomanceV2DisplayUI = dynamic(() => import('@/tools/birthday-romance-v2').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 许愿元树
import { DEFAULT_CONFIG as axuyuantreeDefault, axuyuantreeConfigMetadata as axuyuantreeMetadata } from '@/tools/axuyuantree/index';
const AxuyuantreeDisplayUI = dynamic(() => import('@/tools/axuyuantree').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 平安夜工具 - 晚安平安果
import { DEFAULT_CONFIG as eveGoodnightAppleDefault, eveGoodnightAppleConfigMetadata as eveGoodnightAppleMetadata } from '@/tools/eve-goodnight-apple/index';
const EveGoodnightAppleDisplayUI = dynamic(() => import('@/tools/eve-goodnight-apple').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 平安夜工具 - 多重苹果祝福
import { DEFAULT_CONFIG as eveMultiAppleBlessingDefault, eveMultiAppleBlessingConfigMetadata as eveMultiAppleBlessingMetadata } from '@/tools/eve-multi-apple-blessing/index';
const EveMultiAppleBlessingDisplayUI = dynamic(() => import('@/tools/eve-multi-apple-blessing').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 平安夜工具 - 圣诞老人漫步
import { DEFAULT_CONFIG as eveSantaWalkDefault, eveSantaWalkConfigMetadata as eveSantaWalkMetadata } from '@/tools/eve-santa-walk/index';
const EveSantaWalkDisplayUI = dynamic(() => import('@/tools/eve-santa-walk').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 平安夜工具 - 许愿烟花
import { DEFAULT_CONFIG as eveWishFireworksDefault, eveWishFireworksConfigMetadata as eveWishFireworksMetadata } from '@/tools/eve-wish-fireworks/index';
const EveWishFireworksDisplayUI = dynamic(() => import('@/tools/eve-wish-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 流光新年烟花
import { DEFAULT_CONFIG as newyearFireworksDefault, newyearFireworksConfigMetadata as newyearFireworksMetadata } from '@/tools/newyear-fireworks/index';
const NewYearFireworksDisplayUI = dynamic(() => import('@/tools/newyear-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 时光隧道
import { DEFAULT_CONFIG as timeTunnelDefault, timeTunnelConfigMetadata as timeTunnelMetadata } from '@/tools/time-tunnel/index';
const TimeTunnelDisplayUI = dynamic(() => import('@/tools/time-tunnel').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 银河工坊
import { DEFAULT_CONFIG as galaxyWeaverDefault, galaxyWeaverConfigMetadata as galaxyWeaverMetadata } from '@/tools/galaxy-weaver/index';
const GalaxyWeaverDisplayUI = dynamic(() => import('@/tools/galaxy-weaver').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 锦鲤祝福池
import { DEFAULT_CONFIG as koiBlessingPoolDefault, koiBlessingPoolConfigMetadata as koiBlessingPoolMetadata } from '@/tools/koi-blessing-pool/index';
const KoiBlessingPoolDisplayUI = dynamic(() => import('@/tools/koi-blessing-pool').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 圣诞壁炉
import { DEFAULT_CONFIG as christmasFireplaceDefault, christmasFireplaceConfigMetadata as christmasFireplaceMetadata } from '@/tools/christmas-fireplace/index';
const ChristmasFireplaceDisplayUI = dynamic(() => import('@/tools/christmas-fireplace').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 浪漫圣诞树
import { DEFAULT_CONFIG as romanticChristmasDefault, romanticChristmasConfigMetadata as romanticChristmasMetadata } from '@/tools/romantic-christmas/index';
const RomanticChristmasDisplayUI = dynamic(() => import('@/tools/romantic-christmas').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 圣诞树贺卡
import { DEFAULT_CONFIG as christmasTreeCardDefault, christmasTreeCardConfigMetadata as christmasTreeCardMetadata } from '@/tools/christmas-tree-card/index';
const ChristmasTreeCardDisplayUI = dynamic(() => import('@/tools/christmas-tree-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// ========================== 2. 类型定义（扩展，新增configMetadata）==========================
/**
 * 工具基础配置项类型（扩展：新增configMetadata）
 */
type ToolKey = 'christmas-card' | 'warm-text-card' | 'rain-snow-ripple' | 'christmas-avatar' | 'birthday-romance-v2' | 'axuyuantree' | 'eve-goodnight-apple' | 'eve-multi-apple-blessing' | 'eve-santa-walk' | 'eve-wish-fireworks' | 'newyear-fireworks' | 'time-tunnel' | 'galaxy-weaver' | 'koi-blessing-pool' | 'christmas-fireplace' | 'romantic-christmas' | 'christmas-tree-card';

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
  'christmas-card': {
    name: '圣诞贺卡',
    DisplayUI: ChristmasCardDisplayUI,
    defaultConfig: christmasDefaultConfig,
    configMetadata: christmasMetadata, // 关联通用配置元数据
    // ConfigUI: ChristmasCardConfigUI, // 可选：保留自定义ConfigUI，逐步替换
  },
  'warm-text-card': {
    name: '温馨文字卡片',
    DisplayUI: WarmTextCardDisplayUI,
    defaultConfig: warmTextDefault,
    configMetadata: warmTextMetadata,
  },
  'rain-snow-ripple': {
    name: '雨雪涟漪特效',
    DisplayUI: RainSnowRippleDisplayUI,
    defaultConfig: rainSnowRippleDefault,
    configMetadata: rainSnowRippleMetadata,
    // ConfigUI: RainSnowRippleConfigUI,
  },
  'christmas-avatar': {
    name: '圣诞头像工坊',
    DisplayUI: ChristmasAvatarDisplayUI,
    defaultConfig: christmasAvatarDefault,
    configMetadata: christmasAvatarMetadata,
    // ConfigUI: ChristmasAvatarConfigUI,
  },
  'birthday-romance-v2': {
    name: '生日浪漫生成器 V2',
    DisplayUI: BirthdayRomanceV2DisplayUI,
    defaultConfig: birthdayRomanceV2Default,
    configMetadata: birthdayRomanceV2Metadata,
    // ConfigUI: BirthdayRomanceV2ConfigUI,
  },
  'axuyuantree': {
    name: '许愿元树',
    DisplayUI: AxuyuantreeDisplayUI,
    defaultConfig: axuyuantreeDefault,
    configMetadata: axuyuantreeMetadata,
  },
  'eve-goodnight-apple': {
    name: '晚安平安果',
    DisplayUI: EveGoodnightAppleDisplayUI,
    defaultConfig: eveGoodnightAppleDefault,
    configMetadata: eveGoodnightAppleMetadata,
  },
  'eve-multi-apple-blessing': {
    name: '多重苹果祝福',
    DisplayUI: EveMultiAppleBlessingDisplayUI,
    defaultConfig: eveMultiAppleBlessingDefault,
    configMetadata: eveMultiAppleBlessingMetadata,
    // ConfigUI: EveMultiAppleBlessingConfigUI,
  },
  'eve-santa-walk': {
    name: '圣诞老人漫步',
    DisplayUI: EveSantaWalkDisplayUI,
    defaultConfig: eveSantaWalkDefault,
    configMetadata: eveSantaWalkMetadata,
    // ConfigUI: EveSantaWalkConfigUI,
  },
  'eve-wish-fireworks': {
    name: '许愿烟花',
    DisplayUI: EveWishFireworksDisplayUI,
    defaultConfig: eveWishFireworksDefault,
    configMetadata: eveWishFireworksMetadata,
    // ConfigUI: EveWishFireworksConfigUI,
  },
  'newyear-fireworks': {
    name: '流光新年烟花',
    DisplayUI: NewYearFireworksDisplayUI,
    defaultConfig: newyearFireworksDefault,
    configMetadata: newyearFireworksMetadata,
  },
  'time-tunnel': {
    name: '时光隧道',
    DisplayUI: TimeTunnelDisplayUI,
    defaultConfig: timeTunnelDefault,
    configMetadata: timeTunnelMetadata,
  },
  'galaxy-weaver': {
    name: '银河工坊',
    DisplayUI: GalaxyWeaverDisplayUI,
    defaultConfig: galaxyWeaverDefault,
    configMetadata: galaxyWeaverMetadata,
  },
  'koi-blessing-pool': {
    name: '锦鲤祝福池',
    DisplayUI: KoiBlessingPoolDisplayUI,
    defaultConfig: koiBlessingPoolDefault,
    configMetadata: koiBlessingPoolMetadata,
  },
  'christmas-fireplace': {
    name: '圣诞壁炉',
    DisplayUI: ChristmasFireplaceDisplayUI,
    defaultConfig: christmasFireplaceDefault,
    configMetadata: christmasFireplaceMetadata,
  },
  'romantic-christmas': {
    name: '浪漫圣诞树',
    DisplayUI: RomanticChristmasDisplayUI,
    defaultConfig: romanticChristmasDefault,
    configMetadata: romanticChristmasMetadata,
  },
  'christmas-tree-card': {
    name: '圣诞树贺卡',
    DisplayUI: ChristmasTreeCardDisplayUI,
    defaultConfig: christmasTreeCardDefault,
    configMetadata: christmasTreeCardMetadata,
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