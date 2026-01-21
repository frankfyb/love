/**
 * 烟花引擎模块统一导出
 */

// 主引擎类
export { FireworksEngine, default } from './FireworksEngine';

// 类型定义
export type {
    ShellType,
    BaseParticle,
    StarParticle,
    SparkParticle,
    BurstFlash,
    ShellConfig,
    LaunchConfig,
    FireworksEngineConfig,
    FireworksEngineState,
    ShellFactory,
    EffectRegistry,
} from './types';

// 粒子工具
export {
    ParticlePool,
    createStar,
    createSpark,
    updateStar,
    updateSpark,
    createParticleArc,
    getParticleAlpha,
} from './Particle';

// 效果注册表
export {
    createEffectRegistry,
    defaultEffectRegistry,
    getShellConfig,
    getAvailableShellTypes,
    SHELL_TYPE_OPTIONS,
    // 预设效果
    crysanthemumShell,
    palmShell,
    ringShell,
    crossetteShell,
    crackleShell,
    willowShell,
    strobeShell,
    horsetailShell,
} from './effects';
