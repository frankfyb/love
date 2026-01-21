/**
 * ==============================================================================
 * neon-wish-bubbles 配置文件
 * 霓虹许愿气泡 - 漂浮祝福文字效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    wishTexts: string[];
    textDensity: number;
    floatSpeed: number;
    glowIntensity: number;
    particleCount: number;
    minFontSize: number;
    maxFontSize: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('neon-wish-bubbles'),
    music: [
        { label: '春风轻语', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/spring-wind.mp3' },
        { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    wishTexts: [
        '有你在，就是最好的时光',
        '我们要一直在一起',
        '岁岁年年',
        '你在身边',
        '在你身边',
        '吵架了也会好好说话',
        '不会冷战',
        '你懂我的奇奇怪怪',
        '我陪你的可可爱爱',
        '一起看很多次日出日落',
        '一起逛很多次菜市场',
        '不管多久',
        '见你还是会心动',
        '你的偏爱',
        '是我最大的底气',
        '往后余生',
        '风雪是你',
        '平淡是你',
        '三餐四季',
        '平安喜乐',
        '日子安稳',
        '万事胜意',
        '暴富暴瘦',
        '好运连连',
        '每天都有值得开心的小事',
        '失眠退散',
        '一夜好眠',
        '皮肤变好',
        '头发变多',
        '想吃的东西都能吃到',
        '想去的地方都能抵达',
        '工作顺利',
        '少点加班',
        '多点摸鱼时间',
    ],
    textDensity: 12,
    floatSpeed: 3,
    glowIntensity: 15,
    particleCount: 2,
    minFontSize: 24,
    maxFontSize: 64,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)' },
        0.1
    ),
    bgValue: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const neonWishBubblesConfigMetadata = {
    panelTitle: '霓虹许愿气泡',
    panelSubtitle: '点亮夜空中的专属祝福',
    configSchema: {
        wishTexts: {
            category: 'content' as const,
            type: 'list' as const,
            label: '祝福语录',
            placeholder: '输入祝福语',
            description: '随机显示的祝福文字池，每行一句',
        },
        textDensity: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '气泡密度',
            min: 1,
            max: 30,
            step: 1,
            description: '屏幕中同时漂浮的背景文字数量',
        },
        floatSpeed: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '上浮速度',
            min: 1,
            max: 10,
            step: 0.5,
        },
        glowIntensity: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '霓虹强度',
            min: 0,
            max: 50,
            step: 1,
            description: '文字光晕的扩散范围',
        },
        particleCount: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '粒子密度',
            min: 1,
            max: 5,
            step: 1,
        },
        minFontSize: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '最小字体',
            min: 12,
            max: 40,
            step: 2,
        },
        maxFontSize: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '最大字体',
            min: 40,
            max: 120,
            step: 5,
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: {
            category: 'background' as const,
            type: 'switch' as const,
            label: '启用音效',
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music,
        },
    },
    tabs: [
        { id: 'content' as const, label: '祝福', icon: null },
        { id: 'visual' as const, label: '光效', icon: null },
        { id: 'background' as const, label: '环境', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '写祝福', icon: null, fields: ['wishTexts' as const] },
        { id: 2, label: '调氛围', icon: null, fields: ['textDensity' as const, 'floatSpeed' as const, 'glowIntensity' as const, 'particleCount' as const, 'minFontSize' as const, 'maxFontSize' as const] },
        { id: 3, label: '定背景', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 粒子类 - HeartParticle
// ============================================================================

export class HeartParticle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    fadeSpeed: number;
    color: string;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.02 + 0.01;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fadeSpeed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        const x = this.x;
        const y = this.y;
        const s = this.size;

        ctx.beginPath();
        ctx.moveTo(x, y + s / 4);
        ctx.quadraticCurveTo(x, y, x + s / 4, y);
        ctx.quadraticCurveTo(x + s / 2, y, x + s / 2, y + s / 4);
        ctx.quadraticCurveTo(x + s / 2, y, x + s * 3 / 4, y);
        ctx.quadraticCurveTo(x + s, y, x + s, y + s / 4);
        ctx.quadraticCurveTo(x + s, y + s / 2, x + s * 3 / 4, y + s * 3 / 4);
        ctx.lineTo(x + s / 2, y + s);
        ctx.lineTo(x + s / 4, y + s * 3 / 4);
        ctx.quadraticCurveTo(x, y + s / 2, x, y + s / 4);
        ctx.fill();

        ctx.restore();
    }
}

// ============================================================================
// 漂浮文字类 - FloatingText
// ============================================================================

export class FloatingText {
    text: string;
    x: number;
    y: number;
    baseX: number;
    fontSize: number;
    speed: number;
    opacity: number;
    swayOffset: number;
    swaySpeed: number;
    isInteractive: boolean;

    constructor(
        w: number,
        h: number,
        text: string,
        config: AppConfig,
        isInteractive: boolean = false,
        startX?: number,
        startY?: number
    ) {
        this.text = text;
        this.isInteractive = isInteractive;

        this.fontSize = Math.random() * (config.maxFontSize - config.minFontSize) + config.minFontSize;

        if (isInteractive && startX !== undefined && startY !== undefined) {
            this.baseX = startX;
            this.y = startY;
            this.opacity = 1;
        } else {
            this.baseX = Math.random() * w;
            this.y = Math.random() * h + h;
            this.opacity = Math.random() * 0.5 + 0.5;
        }

        this.x = this.baseX;
        this.speed = (config.floatSpeed * 0.5) + (Math.random() * config.floatSpeed * 0.5) + (this.fontSize / 50);
        this.swayOffset = Math.random() * 100;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
    }

    update(h: number, time: number) {
        this.y -= this.speed;
        this.x = this.baseX + Math.sin(time * this.swaySpeed + this.swayOffset) * 20;

        if (this.isInteractive) {
            this.opacity -= 0.002;
        }
    }

    isDead(h: number) {
        if (this.isInteractive) {
            return this.opacity <= 0 || this.y < -100;
        }
        return false;
    }
}
