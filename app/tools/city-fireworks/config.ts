/**
 * city-fireworks 配置文件
 */

import { createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

export interface AppConfig {
    greetings: string[];
    textDisplayTime: number;
    starCount: number;
    autoLaunch: boolean;
    launchInterval: number;
    showMoon: boolean;
    showCityline: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('city-fireworks'),
    music: [
        { label: '浪漫新年', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '温暖钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultGreetings: [
        '亲爱的你',
        '2026 新年快乐',
        '新的一年也要发光发热',
        '健健康康，平安喜乐',
        '万事如意，心想事成',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    greetings: PRESETS.defaultGreetings,
    textDisplayTime: 3500,
    starCount: 100,
    autoLaunch: true,
    launchInterval: 1500,
    showMoon: true,
    showCityline: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: 'rgba(0, 5, 24, 1)' },
        0
    ),
    bgValue: 'rgba(0, 5, 24, 1)',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const cityFireworksCardConfigMetadata = {
    panelTitle: '城市烟花配置',
    panelSubtitle: '点亮城市夜空的浪漫',
    configSchema: {
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语列表', placeholder: '输入祝福语', description: '每行一句，轮流展示' },

        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        launchInterval: { category: 'visual' as const, type: 'slider' as const, label: '发射间隔(ms)', min: 800, max: 3000, step: 100 },
        textDisplayTime: { category: 'visual' as const, type: 'slider' as const, label: '文字展示时间(ms)', min: 2000, max: 6000, step: 500 },
        starCount: { category: 'visual' as const, type: 'slider' as const, label: '星星数量', min: 50, max: 200, step: 10 },
        showMoon: { category: 'visual' as const, type: 'switch' as const, label: '显示月亮' },
        showCityline: { category: 'visual' as const, type: 'switch' as const, label: '显示城市轮廓' },

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
        { id: 1, label: '祝福内容', icon: null, fields: ['greetings' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoLaunch' as const, 'launchInterval' as const, 'textDisplayTime' as const, 'starCount' as const, 'showMoon' as const, 'showCityline' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};
