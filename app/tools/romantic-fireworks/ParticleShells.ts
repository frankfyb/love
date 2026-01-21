/**
 * ========================================================================
 * 浪漫烟花工具 - 烟花类型和粒子定义
 * ========================================================================
 */

// 常量
export const PI_2 = Math.PI * 2;
export const PI_HALF = Math.PI * 0.5;
export const INVISIBLE = '_INVISIBLE_';

// 烟花颜色
export const COLOR: Record<string, string> = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffbf36',
    White: '#ffffff',
    Pink: '#ff69b4',
    Cyan: '#00ffff',
};

export const COLOR_CODES = Object.values(COLOR);
export const COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE];

// 颜色元组用于天空照明
export const COLOR_TUPLES: Record<string, { r: number; g: number; b: number }> = {};
COLOR_CODES.forEach(hex => {
    COLOR_TUPLES[hex] = {
        r: parseInt(hex.substr(1, 2), 16),
        g: parseInt(hex.substr(3, 2), 16),
        b: parseInt(hex.substr(5, 2), 16),
    };
});

// 颜色工具函数
export function randomColor(options?: { notSame?: boolean; notColor?: string; limitWhite?: boolean }) {
    let color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];

    // 限制白色出现频率
    if (options?.limitWhite && color === COLOR.White && Math.random() < 0.6) {
        color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
    }

    if (options?.notColor) {
        while (color === options.notColor) {
            color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
        }
    }

    return color;
}

export function whiteOrGold() {
    return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}

export function makePistilColor(shellColor: string) {
    return (shellColor === COLOR.White || shellColor === COLOR.Gold)
        ? randomColor({ notColor: shellColor })
        : whiteOrGold();
}

// ============================================================================
// 粒子接口定义
// ============================================================================
export interface StarInstance {
    visible: boolean;
    heavy: boolean;
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    speedX: number;
    speedY: number;
    life: number;
    fullLife: number;
    spinAngle: number;
    spinSpeed: number;
    spinRadius: number;
    sparkFreq: number;
    sparkSpeed: number;
    sparkTimer: number;
    sparkColor: string;
    sparkLife: number;
    sparkLifeVariation: number;
    strobe: boolean;
    strobeFreq: number;
    secondColor: string | null;
    transitionTime: number;
    colorChanged: boolean;
    onDeath: ((star: StarInstance) => void) | null;
    updateFrame: number;
}

export interface SparkInstance {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    speedX: number;
    speedY: number;
    life: number;
}

export interface BurstFlashInstance {
    x: number;
    y: number;
    radius: number;
}

export interface ShellOptions {
    shellSize: number;
    spreadSize: number;
    starLife: number;
    starLifeVariation?: number;
    starDensity?: number;
    starCount?: number;
    color: string | string[];
    secondColor?: string | null;
    glitter?: string;
    glitterColor?: string;
    pistil?: boolean;
    pistilColor?: string;
    streamers?: boolean;
    ring?: boolean;
    crossette?: boolean;
    floral?: boolean;
    fallingLeaves?: boolean;
    crackle?: boolean;
    horsetail?: boolean;
    strobe?: boolean;
    strobeColor?: string | null;
}

// ============================================================================
// 烟花类型生成器
// ============================================================================
export function crysanthemumShell(size: number, quality: number): ShellOptions {
    const glitter = Math.random() < 0.25;
    const singleColor = Math.random() < 0.72;
    const color = singleColor ? randomColor({ limitWhite: true }) : [randomColor(), randomColor({ notSame: true })];
    const pistil = singleColor && Math.random() < 0.42;
    const pistilColor = pistil ? makePistilColor(color as string) : undefined;
    const secondColor = singleColor && (Math.random() < 0.2 || color === COLOR.White)
        ? (pistilColor || randomColor({ notColor: color as string, limitWhite: true }))
        : null;
    const streamers = !pistil && color !== COLOR.White && Math.random() < 0.42;

    let starDensity = glitter ? 1.1 : 1.25;
    if (quality === 1) starDensity *= 0.8;
    if (quality === 3) starDensity = 1.2;

    return {
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity,
        color,
        secondColor,
        glitter: glitter ? 'light' : '',
        glitterColor: whiteOrGold(),
        pistil,
        pistilColor,
        streamers
    };
}

export function ringShell(size: number): ShellOptions {
    const color = randomColor();
    const pistil = Math.random() < 0.75;
    return {
        shellSize: size,
        ring: true,
        color,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: 2.2 * PI_2 * (size + 1),
        pistil,
        pistilColor: makePistilColor(color),
        glitter: !pistil ? 'light' : '',
        glitterColor: color === COLOR.Gold ? COLOR.Gold : COLOR.White,
        streamers: Math.random() < 0.3
    };
}

export function palmShell(size: number): ShellOptions {
    const color = randomColor();
    const thick = Math.random() < 0.5;
    return {
        shellSize: size,
        color,
        spreadSize: 250 + size * 75,
        starDensity: thick ? 0.15 : 0.4,
        starLife: 1800 + size * 200,
        glitter: thick ? 'thick' : 'heavy'
    };
}

export function willowShell(size: number): ShellOptions {
    return {
        shellSize: size,
        spreadSize: 300 + size * 100,
        starDensity: 0.6,
        starLife: 3000 + size * 300,
        glitter: 'willow',
        glitterColor: COLOR.Gold,
        color: INVISIBLE
    };
}

export function crackleShell(size: number, quality: number): ShellOptions {
    const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
    return {
        shellSize: size,
        spreadSize: 380 + size * 75,
        starDensity: quality === 1 ? 0.65 : 1,
        starLife: 600 + size * 100,
        starLifeVariation: 0.32,
        glitter: 'light',
        glitterColor: COLOR.Gold,
        color,
        crackle: true,
        pistil: Math.random() < 0.65,
        pistilColor: makePistilColor(color)
    };
}

export function strobeShell(size: number): ShellOptions {
    const color = randomColor({ limitWhite: true });
    return {
        shellSize: size,
        spreadSize: 280 + size * 92,
        starLife: 1100 + size * 200,
        starLifeVariation: 0.40,
        starDensity: 1.1,
        color,
        glitter: 'light',
        glitterColor: COLOR.White,
        strobe: true,
        strobeColor: Math.random() < 0.5 ? COLOR.White : null,
        pistil: Math.random() < 0.5,
        pistilColor: makePistilColor(color)
    };
}

export function getShellOptions(type: string, size: number, quality: number): ShellOptions {
    switch (type) {
        case 'crysanthemum':
            return crysanthemumShell(size, quality);
        case 'ring':
            return ringShell(size);
        case 'palm':
            return palmShell(size);
        case 'willow':
            return willowShell(size);
        case 'crackle':
            return crackleShell(size, quality);
        case 'strobe':
            return strobeShell(size);
        case 'random':
        default:
            const types = ['crysanthemum', 'ring', 'palm', 'crackle', 'strobe'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            return getShellOptions(randomType, size, quality);
    }
}

// ============================================================================
// 粒子管理器
// ============================================================================
export function createParticleCollection(): Record<string, StarInstance[]> {
    const collection: Record<string, StarInstance[]> = {};
    COLOR_CODES_W_INVIS.forEach(color => {
        collection[color] = [];
    });
    return collection;
}

export function createSparkCollection(): Record<string, SparkInstance[]> {
    const collection: Record<string, SparkInstance[]> = {};
    COLOR_CODES_W_INVIS.forEach(color => {
        collection[color] = [];
    });
    return collection;
}
