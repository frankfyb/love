/**
 * 烟花效果注册表
 * 管理不同类型烟花的生成配置
 */

import type { ShellType, ShellConfig, ShellFactory, EffectRegistry } from './types';

const PI_2 = Math.PI * 2;
const INVISIBLE = '_INVISIBLE_';

// 内联颜色常量（避免路径解析问题）
const FIREWORK_COLORS = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffae00',
    White: '#ffffff',
    Pink: '#ff7eb3',
    Cyan: '#00ffff',
    Orange: '#ff6600',
    Yellow: '#ffff00',
} as const;

const FIREWORK_COLOR_CODES = Object.values(FIREWORK_COLORS);

// 随机颜色函数
function randomColor(
    colors: readonly string[] = FIREWORK_COLOR_CODES,
    options?: { limitWhite?: boolean }
): string {
    let color = colors[Math.floor(Math.random() * colors.length)];
    if (options?.limitWhite && color === FIREWORK_COLORS.White && Math.random() < 0.6) {
        color = colors[Math.floor(Math.random() * colors.length)];
    }
    return color;
}

// ============================================================================
// 效果注册表实现
// ============================================================================

class EffectRegistryImpl implements EffectRegistry {
    private effects: Map<ShellType, ShellFactory> = new Map();

    register(type: ShellType, factory: ShellFactory): void {
        this.effects.set(type, factory);
    }

    get(type: ShellType): ShellFactory | undefined {
        return this.effects.get(type);
    }

    getAll(): Map<ShellType, ShellFactory> {
        return new Map(this.effects);
    }

    getRandom(): ShellFactory {
        const types = Array.from(this.effects.keys()).filter(t => t !== 'Random');
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.effects.get(randomType) || this.effects.get('Crysanthemum')!;
    }
}

// ============================================================================
// 预设烟花效果
// ============================================================================

/**
 * 菊花烟花 - 最经典的球形爆炸
 */
export function crysanthemumShell(size: number): ShellConfig {
    const glitter = Math.random() < 0.25;
    const color = Math.random() < 0.68
        ? randomColor(FIREWORK_COLOR_CODES, { limitWhite: true })
        : randomColor(FIREWORK_COLOR_CODES);

    return {
        type: 'Crysanthemum',
        size: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: Math.pow((300 + size * 100) / 50, 2) * (glitter ? 1.1 : 1.5),
        color,
        glitter: glitter ? 'light' : undefined,
        glitterColor: Math.random() < 0.5 ? FIREWORK_COLORS.Gold : FIREWORK_COLORS.White,
    };
}

/**
 * 棕榈烟花 - 带有长拖尾的下垂效果
 */
export function palmShell(size: number): ShellConfig {
    return {
        type: 'Palm',
        size: 250 + size * 75,
        starLife: 1800 + size * 200,
        starCount: Math.pow((250 + size * 75) / 50 * 0.6, 2),
        color: randomColor(FIREWORK_COLOR_CODES),
        glitter: 'heavy',
        glitterColor: FIREWORK_COLORS.Gold,
        heavy: true,
    };
}

/**
 * 环形烟花 - 圆环形状
 */
export function ringShell(size: number): ShellConfig {
    const color = randomColor(FIREWORK_COLOR_CODES);
    return {
        type: 'Ring',
        size: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: 2.2 * PI_2 * (size + 1),
        color,
        ring: true,
        glitter: 'light',
        glitterColor: color === FIREWORK_COLORS.Gold ? FIREWORK_COLORS.Gold : FIREWORK_COLORS.White,
    };
}

/**
 * 十字烟花 - 粒子在消亡时再次爆炸形成十字
 */
export function crossetteShell(size: number): ShellConfig {
    return {
        type: 'Crossette',
        size: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: Math.pow((300 + size * 100) / 50, 2),
        color: randomColor(FIREWORK_COLOR_CODES, { limitWhite: true }),
        crossette: true,
    };
}

/**
 * 爆裂烟花 - 带有噼啪声的金色闪光
 */
export function crackleShell(size: number): ShellConfig {
    const color = Math.random() < 0.75 ? FIREWORK_COLORS.Gold : randomColor(FIREWORK_COLOR_CODES);
    return {
        type: 'Crackle',
        size: 380 + size * 75,
        starLife: 600 + size * 100,
        starCount: Math.pow((380 + size * 75) / 50, 2),
        color,
        crackle: true,
        glitter: 'light',
        glitterColor: FIREWORK_COLORS.Gold,
    };
}

/**
 * 柳叶烟花 - 金色长拖尾下垂效果
 */
export function willowShell(size: number): ShellConfig {
    return {
        type: 'Willow',
        size: 300 + size * 100,
        starLife: 3000 + size * 300,
        starCount: Math.pow((300 + size * 100) / 50 * 0.7, 2),
        color: INVISIBLE,
        glitter: 'willow',
        glitterColor: FIREWORK_COLORS.Gold,
        heavy: true,
    };
}

/**
 * 频闪烟花 - 闪烁效果
 */
export function strobeShell(size: number): ShellConfig {
    return {
        type: 'Strobe',
        size: 280 + size * 90,
        starLife: 1100 + size * 200,
        starCount: Math.pow((280 + size * 90) / 50 * 0.8, 2),
        color: FIREWORK_COLORS.White,
        strobe: true,
        glitter: 'light',
        glitterColor: FIREWORK_COLORS.White,
    };
}

/**
 * 马尾烟花 - 类似马尾的效果
 */
export function horsetailShell(size: number): ShellConfig {
    return {
        type: 'Horsetail',
        size: 270 + size * 80,
        starLife: 2500 + size * 250,
        starCount: Math.pow((270 + size * 80) / 50 * 0.9, 2),
        color: randomColor([FIREWORK_COLORS.Gold, FIREWORK_COLORS.Orange, FIREWORK_COLORS.Red]),
        glitter: 'heavy',
        glitterColor: FIREWORK_COLORS.Gold,
        heavy: true,
    };
}

// ============================================================================
// 创建并导出效果注册表
// ============================================================================

export function createEffectRegistry(): EffectRegistry {
    const registry = new EffectRegistryImpl();

    // 注册所有预设效果
    registry.register('Crysanthemum', crysanthemumShell);
    registry.register('Palm', palmShell);
    registry.register('Ring', ringShell);
    registry.register('Crossette', crossetteShell);
    registry.register('Crackle', crackleShell);
    registry.register('Willow', willowShell);
    registry.register('Strobe', strobeShell);
    registry.register('Horsetail', horsetailShell);

    return registry;
}

// 默认效果注册表实例
export const defaultEffectRegistry = createEffectRegistry();

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 获取烟花配置
 */
export function getShellConfig(type: ShellType, size: number): ShellConfig {
    if (type === 'Random') {
        const factory = defaultEffectRegistry.getRandom();
        return factory(size);
    }

    const factory = defaultEffectRegistry.get(type);
    if (!factory) {
        return crysanthemumShell(size);
    }

    return factory(size);
}

/**
 * 获取所有可用的烟花类型
 */
export function getAvailableShellTypes(): ShellType[] {
    return [
        'Random',
        'Crysanthemum',
        'Palm',
        'Ring',
        'Crossette',
        'Crackle',
        'Willow',
        'Strobe',
        'Horsetail',
    ];
}

/**
 * 烟花类型选项（用于配置面板）
 */
export const SHELL_TYPE_OPTIONS = [
    { label: '🎆 随机', value: 'Random' as ShellType },
    { label: '🌼 菊花', value: 'Crysanthemum' as ShellType },
    { label: '🌴 棕榈', value: 'Palm' as ShellType },
    { label: '🔵 环形', value: 'Ring' as ShellType },
    { label: '✨ 十字', value: 'Crossette' as ShellType },
    { label: '💥 爆裂', value: 'Crackle' as ShellType },
    { label: '🌿 柳叶', value: 'Willow' as ShellType },
    { label: '⚡ 频闪', value: 'Strobe' as ShellType },
    { label: '🐴 马尾', value: 'Horsetail' as ShellType },
];
