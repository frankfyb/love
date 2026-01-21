/**
 * 璀璨烟花 - 配置文件
 * 包含类型定义、预设、默认配置和配置面板元数据
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { GLOBAL_MUSIC_PRESETS } from '@/constants/music-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 烟花类型（内联定义，避免循环依赖）
// ============================================================================

export type ShellType =
    | 'Random'
    | 'Crysanthemum'
    | 'Palm'
    | 'Ring'
    | 'Crossette'
    | 'Crackle'
    | 'Willow'
    | 'Strobe'
    | 'Horsetail';

const SHELL_TYPE_OPTIONS = [
    { label: '🎆 随机', value: 'Random' as ShellType },
    { label: '🌼 菊花', value: 'Crysanthemum' as ShellType },
    { label: '🌴 棕榈', value: 'Palm' as ShellType },
    { label: '🔵 环形', value: 'Ring' as ShellType },
    { label: '✨ 十字', value: 'Crossette' as ShellType },
    { label: '💥 爆裂', value: 'Crackle' as ShellType },
    { label: '🌿 柳叶', value: 'Willow' as ShellType },
    { label: '⚡ 频闪', value: 'Strobe' as ShellType },
    { label: '🐴 马尾', value: 'Horsetail' as ShellType },
];

// ============================================================================
// 工具配置类型
// ============================================================================

export interface AppConfig {
    titleText: string;
    recipientName: string;
    greetings: string[];
    shellType: ShellType;
    shellSize: number;
    autoLaunch: boolean;
    showFloatingHearts: boolean;
    showSparkles: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('brilliant-fireworks'),
    music: GLOBAL_MUSIC_PRESETS.getToolPresets('brilliant-fireworks'),
    shellTypes: SHELL_TYPE_OPTIONS,
    greetingTemplates: [
        '✨ 愿你的每一天都如烟花般璀璨 ✨',
        '💕 你是我心中最美的风景 💕',
        '🌟 与你相遇是最美的意外 🌟',
        '❤️ 余生请多指教 ❤️',
        '💫 愿所有美好如期而至 💫',
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '璀璨烟花夜',
    recipientName: '亲爱的你',
    greetings: PRESETS.greetingTemplates,
    shellType: 'Random',
    shellSize: 2,
    autoLaunch: true,
    showFloatingHearts: true,
    showSparkles: true,
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#000000',
    }, 0),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0]?.value || '',
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const configMetadata = {
    panelTitle: '璀璨烟花配置',
    panelSubtitle: 'Brilliant Fireworks Romantic Experience',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁 💕',
            placeholder: '例如：亲爱的宝贝'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '标题',
            placeholder: '璀璨烟花夜'
        },
        greetings: {
            category: 'content' as const,
            type: 'list' as const,
            label: '浪漫祝福语',
            placeholder: '输入祝福语',
            description: '每行一句，缓缓展示你的心意'
        },
        shellType: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '烟花类型',
            options: PRESETS.shellTypes.map(t => ({ label: t.label, value: t.value })),
        },
        shellSize: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '烟花大小',
            min: 0,
            max: 4,
            step: 1,
        },
        autoLaunch: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '自动燃放'
        },
        showFloatingHearts: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '飘落爱心 💕'
        },
        showSparkles: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '璀璨星光 ✨'
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
        },
        enableSound: {
            category: 'background' as const,
            type: 'switch' as const,
            label: '启用音效'
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
    },
    tabs: [
        { id: 'content' as const, label: '💌 定制', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'greetings' as const] },
        { id: 2, label: '烟花效果', icon: null, fields: ['shellType' as const, 'shellSize' as const, 'autoLaunch' as const, 'showFloatingHearts' as const, 'showSparkles' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// 向后兼容导出
export const brilliantFireworksConfigMetadata = configMetadata;
