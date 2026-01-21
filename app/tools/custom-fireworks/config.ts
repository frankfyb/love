/**
 * 定制烟花 - 配置文件
 * 包含类型定义、预设、默认配置和配置面板元数据
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { GLOBAL_MUSIC_PRESETS } from '@/constants/music-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 类型定义
// ============================================================================

export type ShellType = 'random' | 'crysanthemum' | 'ring' | 'palm' | 'willow' | 'strobe';

export interface AppConfig {
    recipientName: string;
    customTitle: string;
    greetings: string[];
    shellType: ShellType;
    autoLaunch: boolean;
    finaleMode: boolean;
    skyLighting: boolean;
    particleQuality: 'low' | 'normal' | 'high';
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('custom-fireworks'),
    music: GLOBAL_MUSIC_PRESETS.getToolPresets('custom-fireworks'),
    defaultGreetings: [
        '新年快乐',
        '万事如意',
        '心想事成',
        '永远爱你',
        '幸福美满',
    ],
    shellTypes: [
        { label: '🎆 随机', value: 'random' as ShellType },
        { label: '🌼 菊花', value: 'crysanthemum' as ShellType },
        { label: '🔵 环形', value: 'ring' as ShellType },
        { label: '🌴 棕榈', value: 'palm' as ShellType },
        { label: '🌿 柳树', value: 'willow' as ShellType },
        { label: '⚡ 闪烁', value: 'strobe' as ShellType },
    ],
    colors: {
        Red: '#ff0043',
        Green: '#14fc56',
        Blue: '#1e7fff',
        Purple: '#e60aff',
        Gold: '#ffbf36',
        White: '#ffffff',
        Pink: '#ff69b4',
        Cyan: '#00ffff',
    },
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    recipientName: '最爱的宝贝',
    customTitle: '专属定制 - 献给最爱的你',
    greetings: PRESETS.defaultGreetings,
    shellType: 'random',
    autoLaunch: true,
    finaleMode: false,
    skyLighting: true,
    particleQuality: 'normal',
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0]?.value || '',
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const configMetadata = {
    panelTitle: '定制烟花配置',
    panelSubtitle: '送给最爱的人',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁',
            placeholder: '最爱的宝贝'
        },
        customTitle: {
            category: 'content' as const,
            type: 'input' as const,
            label: '专属标语',
            placeholder: '专属定制 - 献给最爱的你'
        },
        greetings: {
            category: 'content' as const,
            type: 'list' as const,
            label: '祝福语',
            placeholder: '输入祝福语',
            description: '每行一句，轮播展示'
        },
        shellType: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '烟花类型',
            options: PRESETS.shellTypes.map(t => ({ label: t.label, value: t.value })),
        },
        autoLaunch: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '自动发射'
        },
        finaleMode: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '终极模式',
            description: '快速连续发射'
        },
        skyLighting: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '天空照明'
        },
        particleQuality: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '粒子质量',
            options: [
                { label: '低', value: 'low' },
                { label: '正常', value: 'normal' },
                { label: '高', value: 'high' },
            ]
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
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'customTitle' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetings' as const] },
        { id: 3, label: '烟花设置', icon: null, fields: ['shellType' as const, 'autoLaunch' as const, 'finaleMode' as const, 'skyLighting' as const, 'particleQuality' as const] },
        { id: 4, label: '背景音效', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// 向后兼容导出
export const customFireworksCardConfigMetadata = configMetadata;
