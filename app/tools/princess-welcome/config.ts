/**
 * ==============================================================================
 * princess-welcome 配置文件
 * 公主请开心 - 专属祝福卡片
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
    card1Text: string;
    card1SubText: string;
    card2Text: string;
    card2SubText: string;
    card3Text: string;
    card3SubText: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    themeColor: string;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Cheerful Pop', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    princessImages: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2??q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"
    ]
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '陈小姐',
    card1Text: '公主请开心',
    card1SubText: 'Please be happy Princess',
    card2Text: '公主请顺利',
    card2SubText: 'Princess please have a good day',
    card3Text: '公主请发财',
    card3SubText: 'Princess please get rich',
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#fce7f3' },
        0.1
    ),
    bgValue: '#fce7f3',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    themeColor: '#ec4899',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const princessWelcomeConfigMetadata = {
    panelTitle: '公主请开心专属定制',
    panelSubtitle: 'Princess Greetings Generator',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '称呼', placeholder: '例如：陈小姐' },
        card1Text: { category: 'content' as const, type: 'input' as const, label: '卡片1标题', placeholder: '公主请开心' },
        card1SubText: { category: 'content' as const, type: 'input' as const, label: '卡片1副标题', placeholder: 'English text...' },
        card2Text: { category: 'content' as const, type: 'input' as const, label: '卡片2标题', placeholder: '公主请顺利' },
        card2SubText: { category: 'content' as const, type: 'input' as const, label: '卡片2副标题', placeholder: 'English text...' },
        card3Text: { category: 'content' as const, type: 'input' as const, label: '卡片3标题', placeholder: '公主请发财' },
        card3SubText: { category: 'content' as const, type: 'input' as const, label: '卡片3副标题', placeholder: 'English text...' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },

        themeColor: { category: 'visual' as const, type: 'color' as const, label: '主题颜色', description: '页面的主色调' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '称呼设置', icon: null, fields: ['recipientName' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['card1Text' as const, 'card1SubText' as const, 'card2Text' as const, 'card2SubText' as const, 'card3Text' as const, 'card3SubText' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 工具函数
// ============================================================================

export function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
}
