import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

/**
 * ========================================================================
 * 粒子爱心工具 - 配置文件
 * ========================================================================
 */

export interface AppConfig {
    recipientName: string;
    centerText: string;
    heartStyle: 'particle-dual' | 'diamond-trace' | 'pulse-glow';
    heartColor: string;
    particleDensity: number;
    glowIntensity: number;
    showFloatingHearts: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('particle-hearts'),
    music: [
        { label: '浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔夜曲', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '甜蜜爱情', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    heartColors: [
        { label: '粉红', value: '#ff69b4' },
        { label: '玫瑰', value: '#ff1493' },
        { label: '珊瑚', value: '#ff6b9d' },
        { label: '紫红', value: '#ea80b0' },
        { label: '深粉', value: '#db7093' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '致我最爱的你',
    centerText: '❤ 永远爱你 ❤',
    heartStyle: 'particle-dual',
    heartColor: '#ff69b4',
    particleDensity: 50,
    glowIntensity: 30,
    showFloatingHearts: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a1a' },
        0
    ),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const particleHeartsConfigMetadata = {
    panelTitle: '💕 粒子爱心配置',
    panelSubtitle: 'Romantic Particle Hearts',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '💌 送给谁', placeholder: '例如：亲爱的宝贝' },
        centerText: { category: 'content' as const, type: 'input' as const, label: '💖 中心文字', placeholder: '❤ 永远爱你 ❤' },

        heartStyle: {
            category: 'visual' as const, type: 'select' as const, label: '爱心样式', options: [
                { label: '💗 粒子双心', value: 'particle-dual' },
                { label: '💎 钻石轨迹', value: 'diamond-trace' },
                { label: '✨ 脉冲光晕', value: 'pulse-glow' },
            ]
        },
        heartColor: { category: 'visual' as const, type: 'color' as const, label: '爱心颜色', presetColors: PRESETS.heartColors },
        particleDensity: { category: 'visual' as const, type: 'slider' as const, label: '粒子密度', min: 10, max: 100, step: 10 },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '光晕强度', min: 0, max: 50, step: 5 },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心' },

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
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 效果', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '💌 定制', icon: null, fields: ['recipientName' as const, 'centerText' as const] },
        { id: 2, label: '🎨 样式', icon: null, fields: ['heartStyle' as const, 'heartColor' as const] },
        { id: 3, label: '✨ 效果', icon: null, fields: ['particleDensity' as const, 'glowIntensity' as const, 'showFloatingHearts' as const] },
        { id: 4, label: '背景氛围', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// Export alias for compatibility
export const particleHeartsCardConfigMetadata = particleHeartsConfigMetadata;
