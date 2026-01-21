/**
 * newyear-countdown配置文件
 * 包含配置接口、预设值和配置面板元数据
 */

import { createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

export interface AppConfig {
    targetDate: string;
    titleText: string;
    recipientName: string;
    fireworkDensity: number;
    explosionRange: number;
    greetings: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// 预设值
export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: 'Jingle Bells (Upbeat)', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
    greetingTemplates: [
        '✨ 新年快乐 ✨',
        '🧨 万事如意 🧨',
        '❤ 岁岁平安 ❤',
        '💰 恭喜发财 💰',
        '🌸 前程似锦 🌸',
        '平安喜乐',
        '大吉大利',
        '恭贺新春',
        '新春快乐',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
    titleText: '距离 2026 跨年还有',
    recipientName: '致 2026 最爱的你',
    fireworkDensity: 25,
    explosionRange: 16,
    greetings: PRESETS.greetingTemplates,
    bgConfig: createBgConfigWithOverlay(
        {
            type: 'color' as const,
            value: '#0f172a',
        },
        0.2
    ),
    bgValue: '#0f172a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置面板元数据
export const newYearCountdownCardConfigMetadata = {
    panelTitle: '专属新年烟花配置',
    panelSubtitle: 'Create Your Exclusive Moment',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的 Alice' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '倒计时标题', placeholder: '距离 2026 跨年还有' },
        targetDate: { category: 'content' as const, type: 'datetime' as const, label: '目标日期', timeType: 'datetime' as const, description: '选择倒计时的目标日期和时间' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '爆炸祝福语', placeholder: '输入祝福语', description: '每行一句，随机出现' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你最喜爱的背景氛围'
        },

        explosionRange: { category: 'visual' as const, type: 'slider' as const, label: '烟花爆炸范围', min: 5, max: 30, step: 1 },
        fireworkDensity: { category: 'visual' as const, type: 'slider' as const, label: '烟花发射密度', min: 10, max: 60, step: 5, help: '数值越小越密集' },

        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'targetDate' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetings' as const] },
        { id: 3, label: '背景场景', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
        { id: 4, label: '视觉调整', icon: null, fields: ['explosionRange' as const, 'fireworkDensity' as const] },
    ],
};
