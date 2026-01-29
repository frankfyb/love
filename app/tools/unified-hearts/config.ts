/**
 * ==============================================================================
 * unified-hearts 统一爱心工具 - 配置文件
 * 合并：particle-hearts + romantic-hearts + romantic-heart-3d + reasons-to-love
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 爱心模式类型
// ============================================================================

export type HeartMode = 'particle' | 'romantic' | '3d' | 'text-heart';
export type ParticleStyle = 'particle-dual' | 'diamond-trace' | 'pulse-glow';
export type RomanticEffect = 'pulse' | 'meteor' | 'matrix' | 'floating';

// ============================================================================
// 统一配置类型
// ============================================================================

export interface UnifiedHeartsConfig {
    // 模式选择
    mode: HeartMode;

    // 通用配置
    recipientName: string;
    centerText: string;
    heartColor: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;

    // 粒子爱心模式配置
    particleStyle: ParticleStyle;
    particleDensity: number;
    glowIntensity: number;
    showFloatingHearts: boolean;

    // 浪漫爱心模式配置
    romanticEffect: RomanticEffect;
    floatingTexts: string[];
    particleCount: number;

    // 3D爱心模式配置
    texts3D: string[];
    heartObjUrl: string;

    // 心形文字模式配置
    reasons: string[];
    textColor: string;
    glowColor: string;
}

// ============================================================================
// 颜色常量
// ============================================================================

export const ROMANTIC_COLORS = [
    '#ff6b9d', '#ff8fab', '#ffb3c6', '#ffc2d1',
    '#ea80b0', '#ff69b4', '#ff1493', '#db7093',
    '#e91e63', '#f48fb1', '#f8bbd9', '#fce4ec'
];

export const FLOATING_COLORS = [
    '#eea2a4', '#8fb7d3', '#b7d4c6', '#c3bedd',
    '#f1d5e4', '#cae1d3', '#f3c89d', '#d0b0c3',
    '#819d53', '#c99294', '#cec884', '#ff8e70'
];

export const HEART_3D_PALETTE = [
    "#f0a1a8", "#de1c31", "#f0a1a8", "#ff1775"
];

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('romantic-hearts'),

    music: [
        { label: '浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔夜曲', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '甜蜜旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '情歌轻吟', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
    ],

    heartColors: [
        { label: '粉红', value: '#ff69b4' },
        { label: '玫瑰', value: '#ff1493' },
        { label: '珊瑚', value: '#ff6b9d' },
        { label: '紫红', value: '#ea80b0' },
        { label: '深粉', value: '#db7093' },
    ],

    modes: [
        { label: '💗 粒子爱心', value: 'particle', description: '绚丽粒子双心效果' },
        { label: '❤️ 浪漫爱心', value: 'romantic', description: '多种浪漫效果模式' },
        { label: '💎 3D爱心', value: '3d', description: '立体粒子心形效果' },
        { label: '💌 心形文字', value: 'text-heart', description: '52个理由排列成心' },
    ],

    particleStyles: [
        { label: '💗 粒子双心', value: 'particle-dual' },
        { label: '💎 钻石轨迹', value: 'diamond-trace' },
        { label: '✨ 脉冲光晕', value: 'pulse-glow' },
    ],

    romanticEffects: [
        { label: '❤️ 心跳脉动', value: 'pulse' },
        { label: '🌠 流星浪漫', value: 'meteor' },
        { label: '💫 黑客风格', value: 'matrix' },
        { label: '🎈 漂浮文字', value: 'floating' },
    ],

    floatingTextTemplates: [
        '💗 I Love You 💗',
        '❤️', '你是我的唯一', '永远爱你', '宝贝', '心心相印',
    ],

    defaultReasons: [
        "1.温柔", "2.善良", "3.大方", "4.美丽", "5.可爱", "6.迷人", "7.知心", "8.杰出", "9.多才", "10.多艺",
        "11.贴心", "12.大度", "13.光彩", "14.朝气", "15.甜美", "16.漂亮", "17.安静", "18.幽默", "19.听话", "20.节俭",
        "21.学霸", "22.礼貌", "23.助人", "24.温和", "25.大气", "26.苗条", "27.粘人", "28.从容", "29.动人", "30.浪漫",
        "31.单纯", "32.质朴", "33.爱我", "34.孝顺", "35.胆大", "36.豪爽", "37.优雅", "38.好贵", "39.有钱", "40.光亮",
        "41.积极", "42.向上", "43.乐观", "44.开朗", "45.健康", "46.活力", "47.朴素", "48.性感", "49.爱笑", "50.唯一",
        "51.懂我", "52.是你"
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: UnifiedHeartsConfig = {
    // 模式
    mode: 'particle',

    // 通用
    recipientName: '致我最爱的你',
    centerText: '❤ 永远爱你 ❤',
    heartColor: '#ff69b4',
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a1a' },
        0
    ),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,

    // 粒子爱心
    particleStyle: 'particle-dual',
    particleDensity: 50,
    glowIntensity: 30,
    showFloatingHearts: true,

    // 浪漫爱心
    romanticEffect: 'pulse',
    floatingTexts: PRESETS.floatingTextTemplates,
    particleCount: 500,

    // 3D爱心
    texts3D: ["于我而言，你是最好且是唯一❤️", "宝贝，永远爱你❤️"],
    heartObjUrl: 'https://assets.codepen.io/127738/heart_2.obj',

    // 心形文字
    reasons: PRESETS.defaultReasons,
    textColor: '#ffffff',
    glowColor: '#ffba75',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const unifiedHeartsConfigMetadata = {
    panelTitle: '❤️ 统一爱心工具',
    panelSubtitle: 'Unified Hearts Generator',
    configSchema: {
        // 模式选择
        mode: {
            category: 'mode' as const,
            type: 'card-select' as const,
            label: '选择风格',
            options: PRESETS.modes,
            description: '选择你喜欢的爱心展示风格'
        },

        // 通用配置
        recipientName: { category: 'content' as const, type: 'input' as const, label: '💌 送给谁', placeholder: '例如：亲爱的宝贝', showWhen: { mode: ['particle', 'romantic'] } },
        centerText: { category: 'content' as const, type: 'input' as const, label: '💖 中心文字', placeholder: '❤ 永远爱你 ❤', showWhen: { mode: ['particle', 'romantic', 'text-heart'] } },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '爱心颜色', presetColors: PRESETS.heartColors, showWhen: { mode: ['particle', 'romantic'] } },

        // 粒子爱心专属
        particleStyle: {
            category: 'visual' as const, type: 'select' as const, label: '粒子样式',
            options: PRESETS.particleStyles, showWhen: { mode: ['particle'] }
        },
        particleDensity: { category: 'visual' as const, type: 'slider' as const, label: '粒子密度', min: 10, max: 100, step: 10, showWhen: { mode: ['particle'] } },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '光晕强度', min: 0, max: 50, step: 5, showWhen: { mode: ['particle'] } },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心', showWhen: { mode: ['particle'] } },

        // 浪漫爱心专属
        romanticEffect: {
            category: 'visual' as const, type: 'select' as const, label: '效果模式',
            options: PRESETS.romanticEffects, showWhen: { mode: ['romantic'] }
        },
        floatingTexts: { category: 'content' as const, type: 'list' as const, label: '飘动文字', placeholder: '输入要飘动的文字', showWhen: { mode: ['romantic'] } },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '粒子数量', min: 100, max: 1000, step: 50, showWhen: { mode: ['romantic'] } },

        // 3D爱心专属
        texts3D: { category: 'content' as const, type: 'list' as const, label: '表白文字', placeholder: '输入你想说的话', showWhen: { mode: ['3d'] } },

        // 心形文字专属
        reasons: { category: 'content' as const, type: 'list' as const, label: '理由列表', placeholder: '输入理由，如：1.温柔', description: '将会排列成心形', showWhen: { mode: ['text-heart'] } },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色', showWhen: { mode: ['text-heart'] } },
        glowColor: { category: 'visual' as const, type: 'color' as const, label: '光晕颜色', showWhen: { mode: ['text-heart'] } },

        // 背景音乐（通用）
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'mode' as const, label: '💖 风格', icon: null },
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 效果', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '风格选择', icon: null, fields: ['mode' as const] },
        { id: 2, label: '专属定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['heartColor' as const, 'particleStyle' as const, 'romanticEffect' as const] },
        { id: 4, label: '背景氛围', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 3D渲染常量
// ============================================================================

export const HEART_3D_CONSTANTS = {
    PARTICLE_COUNT: 10000,
    CAMERA_Z: 1.8,
    MAX_DISTANCE: 3,
    MIN_DISTANCE: 0.7,
    MAX_Z: 0.23,
    RATE_Z: 0.5,
    PALETTE_COLORS: HEART_3D_PALETTE,
};

// ============================================================================
// 粒子设置常量
// ============================================================================

export const PARTICLE_SETTINGS = {
    length: 500,
    duration: 2,
    velocity: 100,
    effect: -0.75,
    size: 30,
};

// ============================================================================
// 发光粒子类（用于心形文字模式）
// ============================================================================

export class GlowParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    hue: number;
    alpha: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = Math.random() * 100 + 50;
        this.size = Math.random() * 2 + 0.5;
        this.hue = 30 + Math.random() * 30;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = Math.max(0, this.life / 150);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
        ctx.fill();
    }
}

// ============================================================================
// 心形算法工具函数
// ============================================================================

/**
 * 心形曲线参数方程
 * @param t 参数 0 ~ 2π
 * @param scale 缩放比例
 * @returns {x, y} 坐标
 */
export function heartCurve(t: number, scale: number = 1): { x: number; y: number } {
    const x = 16 * Math.pow(Math.sin(t), 3) * scale;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
    return { x, y };
}

/**
 * 生成心形轮廓点
 * @param count 点数量
 * @param scale 缩放
 * @returns 点数组
 */
export function generateHeartPoints(count: number, scale: number = 1): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        points.push(heartCurve(t, scale));
    }
    return points;
}

/**
 * 填充心形内部点
 * @param count 点数量
 * @param scale 缩放
 * @returns 点数组
 */
export function generateFilledHeartPoints(count: number, scale: number = 1): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // 均匀填充
        const point = heartCurve(t, scale * r);
        points.push(point);
    }
    return points;
}

// 导出别名以保持兼容性
export type AppConfig = UnifiedHeartsConfig;
