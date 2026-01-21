import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

/**
 * ========================================================================
 * 文字烟花工具 - 配置文件
 * ========================================================================
 */

export interface AppConfig {
    titleText: string;
    subText: string;
    greetingText: string;
    autoLaunch: boolean;
    launchInterval: number;
    textInterval: number;
    starCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('text-fireworks'),
    music: [
        { label: '浪漫新年', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '温暖钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '2026 新年快乐！',
    subText: '龙年大吉',
    greetingText: '愿新的一年\n所有美好如期而至\n所有等待都有回应',
    autoLaunch: true,
    launchInterval: 200,
    textInterval: 5000,
    starCount: 250,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const textFireworksCardConfigMetadata = {
    panelTitle: '文字烟花配置',
    panelSubtitle: '绽放专属你的浪漫祝福',
    configSchema: {
        titleText: { category: 'content' as const, type: 'input' as const, label: '主标题', placeholder: '2026 新年快乐！' },
        subText: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: '龙年大吉' },
        greetingText: { category: 'content' as const, type: 'textarea' as const, label: '祝福语', placeholder: '输入你的祝福...', rows: 4 },

        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        launchInterval: { category: 'visual' as const, type: 'slider' as const, label: '发射间隔(ms)', min: 100, max: 500, step: 50 },
        textInterval: { category: 'visual' as const, type: 'slider' as const, label: '文字间隔(ms)', min: 3000, max: 10000, step: 1000 },
        starCount: { category: 'visual' as const, type: 'slider' as const, label: '星星数量', min: 100, max: 500, step: 50 },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '祝福内容', icon: null, fields: ['titleText' as const, 'subText' as const, 'greetingText' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoLaunch' as const, 'launchInterval' as const, 'textInterval' as const, 'starCount' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// Export alias for compatibility
export const textFireworksConfigMetadata = textFireworksCardConfigMetadata;
