/**
 * ==============================================================================
 * birthday-wish 配置文件
 * 生日祝福工具 - 四种浪漫效果模式
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    recipientName: string;
    birthdayMessage: string;
    effectMode: 'fireworks-text' | 'balloon-party' | 'spotlight' | 'heart-blessing';
    textColor: string;
    balloonColors: string[];
    enableCountdown: boolean;
    countdownSeconds: number;
    showFloatingHearts: boolean;
    showSparkles: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 颜色常量
// ============================================================================

// 渐变色气球颜色配置 - 更浪漫的色彩
export const BALLOON_GRADIENTS = [
    ['#ff69b4', '#ff1493'], // 粉红
    ['#ff6b9d', '#e91e63'], // 玫瑰
    ['#f472b6', '#ec4899'], // 浪漫粉
    ['#a78bfa', '#7c3aed'], // 紫罗兰
    ['#60a5fa', '#3b82f6'], // 天空蓝
    ['#fbbf24', '#f59e0b'], // 金色
    ['#34d399', '#10b981'], // 薄荷绿
    ['#f472b6', '#8b5cf6'], // 粉紫
    ['#fb7185', '#f43f5e'], // 珊瑚红
    ['#c084fc', '#a855f7'], // 梦幻紫
];

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('birthday-wish'),
    music: [
        { label: '🎂 温馨生日歌', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🎉 欢乐派对', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '💕 浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '✨ 梦幻祝福', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    effectModes: [
        { label: '🎆 烟花文字', value: 'fireworks-text' },
        { label: '🎈 气球派对', value: 'balloon-party' },
        { label: '🔦 聚光舞台', value: 'spotlight' },
        { label: '💗 爱心祝福', value: 'heart-blessing' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '亲爱的你',
    birthdayMessage: '生日快乐',
    effectMode: 'balloon-party',
    textColor: '#ff69b4',
    balloonColors: BALLOON_GRADIENTS.flat(),
    enableCountdown: true,
    countdownSeconds: 5,
    showFloatingHearts: true,
    showSparkles: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const birthdayWishConfigMetadata = {
    panelTitle: '生日祝福配置',
    panelSubtitle: 'Birthday Wish Romantic Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '寿星姓名 💕', placeholder: '例如：亲爱的宝贝' },
        birthdayMessage: { category: 'content' as const, type: 'input' as const, label: '祝福语 🎂', placeholder: '生日快乐' },

        effectMode: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '效果模式',
            options: PRESETS.effectModes
        },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        enableCountdown: { category: 'visual' as const, type: 'switch' as const, label: '惊喜倒计时' },
        countdownSeconds: { category: 'visual' as const, type: 'slider' as const, label: '倒计时秒数', min: 3, max: 10, step: 1 },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心 💕' },
        showSparkles: { category: 'visual' as const, type: 'switch' as const, label: '璀璨星光 ✨' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你最喜爱的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '💌 定制', icon: null },
        { id: 'visual' as const, label: '✨ 效果', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '寿星定制', icon: null, fields: ['recipientName' as const, 'birthdayMessage' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['effectMode' as const, 'textColor' as const, 'enableCountdown' as const, 'countdownSeconds' as const, 'showFloatingHearts' as const, 'showSparkles' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 气球数据类型
// ============================================================================

export interface Balloon {
    id: number;
    width: number;
    delay: number;
    left: string;
    gradientStart: string;
    gradientEnd: string;
}

// 生成气球数据
export function generateBalloons(isMobile: boolean): Balloon[] {
    const result: Balloon[] = [];
    const count = isMobile ? 30 : 50;
    for (let i = 0; i < count; i++) {
        const gradient = BALLOON_GRADIENTS[i % BALLOON_GRADIENTS.length];
        result.push({
            id: i,
            width: isMobile ? 60 + Math.random() * 50 : 100 + Math.random() * 90,
            delay: Math.random() * 100,
            left: `${Math.random() * 100}%`,
            gradientStart: gradient[0],
            gradientEnd: gradient[1],
        });
    }
    return result;
}
