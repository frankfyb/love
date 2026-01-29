
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

export interface AppConfig {
    title: string;
    coupleName: string;
    events: string[]; // Format: Date | Location | Content | [ImageURL]

    // Visual settings
    trackColorStart: string;
    trackColorEnd: string;
    cardColor: string;
    textColor: string;
    particleColor: string;

    // Geometry
    helixRadius: number;
    helixSpacing: number;

    // Background & Audio
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// Presets - 治愈系配色
export const PRESETS = {
    // 浅色系低对比度朦胧背景
    backgrounds: [
        { type: 'color', value: '#fff1f2', label: '柔粉回忆' }, // Rose 50
        { type: 'color', value: '#f0f9ff', label: '云端漫步' }, // Sky 50
        { type: 'color', value: '#fdf4ff', label: '紫色梦境' }, // Fuchsia 50
        { type: 'color', value: '#f8fafc', label: '纯净时光' }, // Slate 50
        // ...GLOBAL_BG_PRESETS.getToolPresets('time-record-3d') // Keep some defaults if needed
    ],
    music: [
        { label: 'Warm Piano', value: 'https://cdn.pixabay.com/audio/2022/05/18/audio_6b933a362f.mp3' }, // Soft Rain type
        { label: 'Gentle Acoustic', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
    defaultEvents: [
        '2025-01-01 | 巴黎铁塔 | 第一次一起跨年，许下心愿 | https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80',
        '2025-02-14 | 温馨小窝 | 情人节烛光晚餐，你做的牛排最好吃 | https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80',
        '2025-05-20 | 海边日落 | 牵手漫步沙滩，听海浪的声音 | https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
        '2025-08-07 | 迪士尼 | 陪你做一日在逃公主，看最美烟花 | https://images.unsplash.com/photo-1524008279394-3aed4643b30b?w=500&q=80',
        '2025-12-25 | 飘雪街头 | 圣诞节的惊喜礼物，围巾很暖 | https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=500&q=80'
    ]
};

export const DEFAULT_CONFIG: AppConfig = {
    title: '2025 · 我们的独家记忆',
    coupleName: 'Alice & Bob',
    events: PRESETS.defaultEvents,

    // 柔边渐变色
    trackColorStart: '#fda4af', // Rose 300
    trackColorEnd: '#93c5fd',   // Blue 300
    cardColor: '#ffffff',       // White
    textColor: '#475569',       // Slate 600
    particleColor: '#f472b6',   // Pink 400

    helixRadius: 180,
    helixSpacing: 120,

    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#fff1f2', // Default soft pink bg
        },
        0 // No overlay for pure look, or very light
    ),
    bgValue: '#fff1f2',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const timeRecordConfigMetadata = {
    panelTitle: '时光记录配置',
    panelSubtitle: 'Customize Your Timelines',
    configSchema: {
        title: { category: 'content' as const, type: 'input' as const, label: '页面标题', placeholder: '我们的独家记忆' },
        coupleName: { category: 'content' as const, type: 'input' as const, label: '主角姓名', placeholder: 'Alice & Bob' },
        events: {
            category: 'content' as const,
            type: 'list' as const,
            label: '时光事件列表',
            placeholder: '2025-01-01 | 地点 | 事件描述 | [可选图片链接]',
            description: '格式: 时间 | 地点 | 描述 | 图片链接 (建议使用宽高比3:4或1:1的图片)'
        },

        helixRadius: { category: 'visual' as const, type: 'slider' as const, label: '轨道半径', min: 100, max: 400, step: 10 },
        helixSpacing: { category: 'visual' as const, type: 'slider' as const, label: '事件间距', min: 80, max: 300, step: 10 },

        trackColorStart: { category: 'visual' as const, type: 'color' as const, label: '轨道渐变起点' },
        trackColorEnd: { category: 'visual' as const, type: 'color' as const, label: '轨道渐变终点' },
        cardColor: { category: 'visual' as const, type: 'color' as const, label: '卡片背景色' },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        particleColor: { category: 'visual' as const, type: 'color' as const, label: '氛围粒子色' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '开启音乐' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ]
};
