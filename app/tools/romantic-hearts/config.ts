/**
 * ==============================================================================
 * romantic-hearts 配置文件
 * 浪漫爱心工具 - 多种效果模式（心跳脉动、流星浪漫、黑客风格、漂浮文字）
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
    centerText: string;
    floatingTexts: string[];
    heartColor: string;
    effectMode: 'pulse' | 'meteor' | 'matrix' | 'floating';
    particleCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 颜色常量
// ============================================================================

// 浪漫心形曲线颜色
export const ROMANTIC_COLORS = [
    '#ff6b9d', '#ff8fab', '#ffb3c6', '#ffc2d1',
    '#ea80b0', '#ff69b4', '#ff1493', '#db7093',
    '#e91e63', '#f48fb1', '#f8bbd9', '#fce4ec'
];

// 浮动文字颜色板
export const FLOATING_COLORS = [
    '#eea2a4', '#8fb7d3', '#b7d4c6', '#c3bedd',
    '#f1d5e4', '#cae1d3', '#f3c89d', '#d0b0c3',
    '#819d53', '#c99294', '#cec884', '#ff8e70',
    '#e0a111', '#fffdf6', '#cbd7ac', '#e8c6c0',
    '#dc9898', '#ecc8ba', '#5d3f51', '#61649f'
];

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('romantic-hearts'),
    music: [
        { label: '浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔情歌', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '甜蜜旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    effectModes: [
        { label: '❤️ 心跳脉动', value: 'pulse' },
        { label: '🌠 流星浪漫', value: 'meteor' },
        { label: '💫 黑客风格', value: 'matrix' },
        { label: '🎈 漂浮文字', value: 'floating' },
    ],
    floatingTextTemplates: [
        '💗 I Love You 💗',
        '❤️',
        '你是我的唯一',
        '永远爱你',
        '宝贝',
        '心心相印',
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '致我最爱的你',
    centerText: '❤ 永远爱你 ❤',
    floatingTexts: PRESETS.floatingTextTemplates,
    heartColor: '#ea80b0',
    effectMode: 'pulse',
    particleCount: 500,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a1a' },
        0.1
    ),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const romanticHeartsConfigMetadata = {
    panelTitle: '浪漫爱心配置',
    panelSubtitle: 'Romantic Hearts Settings',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的小曾' },
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '❤ 永远爱你 ❤' },
        floatingTexts: { category: 'content' as const, type: 'list' as const, label: '飘动文字', placeholder: '输入要飘动的文字', description: '每行一句，随机出现' },

        effectMode: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '效果模式',
            options: PRESETS.effectModes
        },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '爱心颜色' },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '粒子数量', min: 100, max: 1000, step: 50 },

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
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 2, label: '飘动文字', icon: null, fields: ['floatingTexts' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['effectMode' as const, 'heartColor' as const, 'particleCount' as const] },
        { id: 4, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

// ============================================================================
// 心形粒子设置常量
// ============================================================================

export const PARTICLE_SETTINGS = {
    length: 500,
    duration: 2,
    velocity: 100,
    effect: -0.75,
    size: 30,
};
