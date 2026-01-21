/**
 * 烟花引擎类型定义
 */

// 向量类型（内联定义）
interface Vector2D {
    x: number;
    y: number;
}

// ============================================================================
// 烟花类型
// ============================================================================

export type ShellType =
    | 'Random'
    | 'Crysanthemum'
    | 'Palm'
    | 'Ring'
    | 'Crossette'
    | 'Crackle'
    | 'Willow'
    | 'Strobe'
    | 'Horsetail'
    | 'Ghost';

// ============================================================================
// 粒子接口
// ============================================================================

export interface BaseParticle {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    speedX: number;
    speedY: number;
    life: number;
    maxLife?: number;
    color: string;
}

export interface StarParticle extends BaseParticle {
    heavy?: boolean;
    sparkFreq?: number;
    sparkTimer?: number;
    sparkSpeed?: number;
    sparkLife?: number;
    sparkColor?: string;
    strobe?: boolean;
    strobeFreq?: number;
    glitter?: boolean;
    glitterSize?: number;
    trail?: Vector2D[];
    trailLength?: number;
    onDeath?: (star: StarParticle) => void;
}

export interface SparkParticle extends BaseParticle {
    size?: number;
}

export interface BurstFlash {
    x: number;
    y: number;
    radius: number;
    alpha?: number;
}

// ============================================================================
// 烟花弹配置
// ============================================================================

export interface ShellConfig {
    type: ShellType;
    size: number;
    starLife: number;
    starCount: number;
    color: string;
    glitter?: string;
    glitterColor?: string;
    ring?: boolean;
    crossette?: boolean;
    crackle?: boolean;
    strobe?: boolean;
    heavy?: boolean;
    spreadSpeed?: number;
}

export interface LaunchConfig {
    x?: number;
    targetY?: number;
    shellConfig?: Partial<ShellConfig>;
}

// ============================================================================
// 引擎配置
// ============================================================================

export interface FireworksEngineConfig {
    // 画布
    canvas: HTMLCanvasElement;
    trailsCanvas?: HTMLCanvasElement;

    // 行为配置
    autoLaunch?: boolean;
    autoLaunchInterval?: { min: number; max: number };
    shellSize?: number;
    shellType?: ShellType;

    // 视觉效果
    showSkyLighting?: boolean;
    showTrails?: boolean;
    trailFadeSpeed?: number;

    // 音效
    enableSound?: boolean;
    soundVolume?: number;
}

export interface FireworksEngineState {
    running: boolean;
    particleCount: number;
    fps: number;
}

// ============================================================================
// 效果工厂类型
// ============================================================================

export type ShellFactory = (size: number) => ShellConfig;

export interface EffectRegistry {
    register(type: ShellType, factory: ShellFactory): void;
    get(type: ShellType): ShellFactory | undefined;
    getAll(): Map<ShellType, ShellFactory>;
    getRandom(): ShellFactory;
}
