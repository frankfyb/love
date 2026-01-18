import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/common/Loading';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';

// ========================== 1. 工具配置导入（保留原有，新增configMetadata）==========================

// 雨雪涟漪特效
import { DEFAULT_CONFIG as rainSnowRippleDefault, rainSnowRippleConfigMetadata as rainSnowRippleMetadata } from '@/tools/rain-snow-ripple/index';
const RainSnowRippleDisplayUI = dynamic(() => import('@/tools/rain-snow-ripple').then(mod => mod.default), { loading: () => <Loading /> });

// 温馨文字卡片
import { DEFAULT_CONFIG as warmTextDefault, warmTextCardConfigMetadata as warmTextMetadata } from '@/tools/warm-text-card/index';
const WarmTextCardDisplayUI = dynamic(() => import('@/tools/warm-text-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });


// 流光新年烟花
import { DEFAULT_CONFIG as newyearFireworksDefault, newyearFireworksConfigMetadata as newyearFireworksMetadata } from '@/tools/newyear-fireworks/index';
const NewYearFireworksDisplayUI = dynamic(() => import('@/tools/newyear-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });


// 银河工坊
import { DEFAULT_CONFIG as galaxyWeaverDefault, galaxyWeaverConfigMetadata as galaxyWeaverMetadata } from '@/tools/galaxy-weaver/index';
const GalaxyWeaverDisplayUI = dynamic(() => import('@/tools/galaxy-weaver').then(mod => mod.DisplayUI), { loading: () => <Loading /> });



// 圣诞树贺卡
import { DEFAULT_CONFIG as christmasTreeCardDefault, christmasTreeCardConfigMetadata as christmasTreeCardMetadata } from '@/tools/christmas-tree-card/index';
const ChristmasTreeCardDisplayUI = dynamic(() => import('@/tools/christmas-tree-card').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 新年倒计时
import { DEFAULT_CONFIG as newyearCountdownDefault, newYearCountdownCardConfigMetadata as newyearCountdownMetadata } from '@/tools/newyear-countdown/index';
const NewYearCountdownDisplayUI = dynamic(() => import('@/tools/newyear-countdown').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 霓虹许愿气泡
import { DEFAULT_CONFIG as neonWishBubblesDefault, neonWishBubblesConfigMetadata as neonWishBubblesMetadata } from '@/tools/neon-wish-bubbles/index';
const NeonWishBubblesDisplayUI = dynamic(() => import('@/tools/neon-wish-bubbles').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 招财进宝
import { DEFAULT_CONFIG as moneySwirlDefault, moneySwirlConfigMetadata as moneySwirlMetadata } from '@/tools/money-swirl/index';
const MoneySwirlDisplayUI = dynamic(() => import('@/tools/money-swirl').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 3D 红色爱心
import { DEFAULT_CONFIG as romanticHeart3DDefault, romanticHeart3DConfigMetadata as romanticHeart3DMetadata } from '@/tools/romantic-heart-3d/index';
const RomanticHeart3DDisplayUI = dynamic(() => import('@/tools/romantic-heart-3d/index').then(mod => mod.default), { loading: () => <Loading /> });

// 新春快乐 (3D烟花粒子文字)
import { DEFAULT_CONFIG as springFestivalDefault, springFestivalConfigMetadata as springFestivalMetadata } from '@/tools/spring-festival/index';
const SpringFestivalDisplayUI = dynamic(() => import('@/tools/spring-festival').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 孔明灯与烟花
import { DEFAULT_CONFIG as lanternFireworksDefault, lanternFireworksConfigMetadata as lanternFireworksMetadata } from '@/tools/lantern-fireworks/index';
const LanternFireworksDisplayUI = dynamic(() => import('@/tools/lantern-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 璀璨烟花 (高级烟花模拟)
import { DEFAULT_CONFIG as brilliantFireworksDefault, brilliantFireworksConfigMetadata as brilliantFireworksMetadata } from '@/tools/brilliant-fireworks/index';
const BrilliantFireworksDisplayUI = dynamic(() => import('@/tools/brilliant-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 梦幻粒子烟花 (tsParticles)
import { DEFAULT_CONFIG as tsparticlesFireworksDefault, tsparticlesFireworksConfigMetadata as tsparticlesFireworksMetadata } from '@/tools/tsparticles-fireworks/index';
const TsParticlesFireworksDisplayUI = dynamic(() => import('@/tools/tsparticles-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 3D烟花倒计时 (集成3D粒子效果与倒计时)
import { DEFAULT_CONFIG as countdown3dFireworksDefault, countdown3dFireworksCardConfigMetadata as countdown3dFireworksMetadata } from '@/tools/countdown-3d-fireworks/index';
const Countdown3DFireworksDisplayUI = dynamic(() => import('@/tools/countdown-3d-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 浪漫烟花 (高级烟花+打字机效果)
import { DEFAULT_CONFIG as romanticFireworksDefault, romanticFireworksCardConfigMetadata as romanticFireworksMetadata } from '@/tools/romantic-fireworks/index';
const RomanticFireworksDisplayUI = dynamic(() => import('@/tools/romantic-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 文字烟花 (文字点阵烟花效果)
import { DEFAULT_CONFIG as textFireworksDefault, textFireworksCardConfigMetadata as textFireworksMetadata } from '@/tools/text-fireworks/index';
const TextFireworksDisplayUI = dynamic(() => import('@/tools/text-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 城市烟花 (城市夜景烟花效果)
import { DEFAULT_CONFIG as cityFireworksDefault, cityFireworksCardConfigMetadata as cityFireworksMetadata } from '@/tools/city-fireworks/index';
const CityFireworksDisplayUI = dynamic(() => import('@/tools/city-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 极光烟花 (tsParticles增强版烟花效果)
import { DEFAULT_CONFIG as auroraFireworksDefault, auroraFireworksCardConfigMetadata as auroraFireworksMetadata } from '@/tools/aurora-fireworks/index';
const AuroraFireworksDisplayUI = dynamic(() => import('@/tools/aurora-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 3D烟花秀 (沉浸式3D烟花体验)
import { DEFAULT_CONFIG as fireworkShow3dDefault, fireworkShow3dCardConfigMetadata as fireworkShow3dMetadata } from '@/tools/firework-show-3d/index';
const FireworkShow3dDisplayUI = dynamic(() => import('@/tools/firework-show-3d').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 定制烟花 (专属定制送给最爱的人)
import { DEFAULT_CONFIG as customFireworksDefault, customFireworksCardConfigMetadata as customFireworksMetadata } from '@/tools/custom-fireworks/index';
const CustomFireworksDisplayUI = dynamic(() => import('@/tools/custom-fireworks').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 浪漫爱心 (集成多种浪漫爱心效果)
import { DEFAULT_CONFIG as romanticHeartsDefault, romanticHeartsConfigMetadata as romanticHeartsMetadata } from '@/tools/romantic-hearts/index';
const RomanticHeartsDisplayUI = dynamic(() => import('@/tools/romantic-hearts').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 粒子爱心 (粒子双心/钻石轨迹/脉动光晕)
import { DEFAULT_CONFIG as particleHeartsDefault, particleHeartsConfigMetadata as particleHeartsMetadata } from '@/tools/particle-hearts/index';
const ParticleHeartsDisplayUI = dynamic(() => import('@/tools/particle-hearts').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 生日祝福 (烟花文字/气球派对/聚光舞台/爱心祝福)
import { DEFAULT_CONFIG as birthdayWishDefault, birthdayWishConfigMetadata as birthdayWishMetadata } from '@/tools/birthday-wish/index';
const BirthdayWishDisplayUI = dynamic(() => import('@/tools/birthday-wish').then(mod => mod.DisplayUI), { loading: () => <Loading /> });

// 时空隧道 (年份数字螺旋隧道穿越效果)
import { DEFAULT_CONFIG as timeTunnelDefault, timeTunnelConfigMetadata as timeTunnelMetadata } from '@/tools/time-tunnel/index';
const TimeTunnelDisplayUI = dynamic(() => import('@/tools/time-tunnel').then(mod => mod.DisplayUI), { loading: () => <Loading /> });
// ========================== 2. 类型定义（扩展，新增configMetadata）==========================
/**
 * 工具基础配置项类型（扩展：新增configMetadata）
 */
type ToolKey = 'warm-text-card' | 'rain-snow-ripple' | 'newyear-fireworks' | 'galaxy-weaver' | 'christmas-tree-card' | 'newyear-countdown' | 'neon-wish-bubbles' | 'money-swirl' | 'romantic-heart-3d' | 'spring-festival' | 'lantern-fireworks' | 'brilliant-fireworks' | 'tsparticles-fireworks' | 'countdown-3d-fireworks' | 'romantic-fireworks' | 'text-fireworks' | 'city-fireworks' | 'aurora-fireworks' | 'firework-show-3d' | 'custom-fireworks' | 'romantic-hearts' | 'particle-hearts' | 'birthday-wish' | 'time-tunnel';

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
  'newyear-fireworks': {
    name: '流光新年烟花',
    DisplayUI: NewYearFireworksDisplayUI,
    defaultConfig: newyearFireworksDefault,
    configMetadata: newyearFireworksMetadata,
    // ConfigUI: EveWishFireworksConfigUI,
  },
  'galaxy-weaver': {
    name: '银河工坊',
    DisplayUI: GalaxyWeaverDisplayUI,
    defaultConfig: galaxyWeaverDefault,
    configMetadata: galaxyWeaverMetadata,
  },
  'christmas-tree-card': {
    name: '圣诞树贺卡',
    DisplayUI: ChristmasTreeCardDisplayUI,
    defaultConfig: christmasTreeCardDefault,
    configMetadata: christmasTreeCardMetadata,
  },
  'newyear-countdown': {
    name: '新年倒计时',
    DisplayUI: NewYearCountdownDisplayUI,
    defaultConfig: newyearCountdownDefault,
    configMetadata: newyearCountdownMetadata,
  },
  'neon-wish-bubbles': {
    name: '霓虹许愿气泡',
    DisplayUI: NeonWishBubblesDisplayUI,
    defaultConfig: neonWishBubblesDefault,
    configMetadata: neonWishBubblesMetadata,
  },
  'money-swirl': {
    name: '招财进宝',
    DisplayUI: MoneySwirlDisplayUI,
    defaultConfig: moneySwirlDefault,
    configMetadata: moneySwirlMetadata,
  },
  'romantic-heart-3d': {
    name: '3D 红色爱心',
    DisplayUI: RomanticHeart3DDisplayUI,
    defaultConfig: romanticHeart3DDefault,
    configMetadata: romanticHeart3DMetadata,
  },
  'spring-festival': {
    name: '新春快乐',
    DisplayUI: SpringFestivalDisplayUI,
    defaultConfig: springFestivalDefault,
    configMetadata: springFestivalMetadata,
  },
  'lantern-fireworks': {
    name: '孔明灯与烟花',
    DisplayUI: LanternFireworksDisplayUI,
    defaultConfig: lanternFireworksDefault,
    configMetadata: lanternFireworksMetadata,
  },
  'brilliant-fireworks': {
    name: '璀璨烟花',
    DisplayUI: BrilliantFireworksDisplayUI,
    defaultConfig: brilliantFireworksDefault,
    configMetadata: brilliantFireworksMetadata,
  },
  'tsparticles-fireworks': {
    name: '梦幻粒子烟花',
    DisplayUI: TsParticlesFireworksDisplayUI,
    defaultConfig: tsparticlesFireworksDefault,
    configMetadata: tsparticlesFireworksMetadata,
  },
  'countdown-3d-fireworks': {
    name: '3D烟花倒计时',
    DisplayUI: Countdown3DFireworksDisplayUI,
    defaultConfig: countdown3dFireworksDefault,
    configMetadata: countdown3dFireworksMetadata,
  },
  'romantic-fireworks': {
    name: '浪漫烟花',
    DisplayUI: RomanticFireworksDisplayUI,
    defaultConfig: romanticFireworksDefault,
    configMetadata: romanticFireworksMetadata,
  },
  'text-fireworks': {
    name: '文字烟花',
    DisplayUI: TextFireworksDisplayUI,
    defaultConfig: textFireworksDefault,
    configMetadata: textFireworksMetadata,
  },
  'city-fireworks': {
    name: '城市烟花',
    DisplayUI: CityFireworksDisplayUI,
    defaultConfig: cityFireworksDefault,
    configMetadata: cityFireworksMetadata,
  },
  'aurora-fireworks': {
    name: '极光烟花',
    DisplayUI: AuroraFireworksDisplayUI,
    defaultConfig: auroraFireworksDefault,
    configMetadata: auroraFireworksMetadata,
  },
  'firework-show-3d': {
    name: '3D烟花秀',
    DisplayUI: FireworkShow3dDisplayUI,
    defaultConfig: fireworkShow3dDefault,
    configMetadata: fireworkShow3dMetadata,
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
  'particle-hearts': {
    name: '粒子爱心',
    DisplayUI: ParticleHeartsDisplayUI,
    defaultConfig: particleHeartsDefault,
    configMetadata: particleHeartsMetadata,
  },
  'birthday-wish': {
    name: '生日祝福',
    DisplayUI: BirthdayWishDisplayUI,
    defaultConfig: birthdayWishDefault,
    configMetadata: birthdayWishMetadata,
  },
  'time-tunnel': {
    name: '时空隧道',
    DisplayUI: TimeTunnelDisplayUI,
    defaultConfig: timeTunnelDefault,
    configMetadata: timeTunnelMetadata,
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