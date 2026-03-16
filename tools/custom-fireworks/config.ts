/**
 * 定制烟花 - 配置文件 (Ultimate Edition)
 * 融合了 brilliant-fireworks + romantic-fireworks + city-fireworks 的所有浪漫元素
 * 包含类型定义、预设、默认配置和配置面板元数据
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { GLOBAL_MUSIC_PRESETS } from '@/constants/music-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 类型定义
// ============================================================================

// 烟花类型 - 使用引擎原生格式，避免转换
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

export interface AppConfig {
    // 核心定制内容
    recipientName: string;
    customTitle: string;

    // 粒子动画文字序列 (from spring-festival)
    countdownSequence: string[];

    // 烟花效果
    shellType: ShellType;
    shellSize: number;
    autoLaunch: boolean;
    finaleMode: boolean;
    skyLighting: boolean;
    particleQuality: 'low' | 'normal' | 'high';

    // 浪漫装饰元素 (from brilliant-fireworks)
    showFloatingHearts: boolean;
    showSparkles: boolean;

    // 浪漫场景元素 (from city-fireworks)
    showStarField: boolean;
    starCount: number;
    showMoon: boolean;

    // 背景与音效
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设
// ============================================================================

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

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('custom-fireworks'),
    music: GLOBAL_MUSIC_PRESETS.getToolPresets('custom-fireworks'),
    shellTypes: SHELL_TYPE_OPTIONS,
    // 默认动画文字序列
    defaultSequence: ['新', '年', '快', '乐', '❤'],
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
    countdownSequence: PRESETS.defaultSequence,
    shellType: 'Random',
    shellSize: 2,
    autoLaunch: true,
    finaleMode: false,
    skyLighting: true,
    particleQuality: 'normal',
    showFloatingHearts: true,
    showSparkles: true,
    showStarField: true,
    starCount: 100,
    showMoon: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: 'rgba(0, 5, 24, 1)' },
        0
    ),
    bgValue: 'rgba(0, 5, 24, 1)',
    bgMusicUrl: PRESETS.music[0]?.value || '',
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const configMetadata = {
    panelTitle: '💕 定制烟花配置',
    panelSubtitle: '送给最爱的人 · 浪漫璀璨烟花夜',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁 💕',
            placeholder: '例如：亲爱的宝贝'
        },
        customTitle: {
            category: 'content' as const,
            type: 'input' as const,
            label: '专属标语',
            placeholder: '专属定制 - 献给最爱的你'
        },
        countdownSequence: {
            category: 'content' as const,
            type: 'list' as const,
            label: '动画文字序列 ✨',
            placeholder: '输入字符',
            description: '依次显示的粒子动画文字'
        },
        shellType: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '烟花类型 🎆',
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
            label: '自动发射'
        },
        finaleMode: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '终极模式 🚀',
            description: '快速连续发射'
        },
        skyLighting: {
            category: 'visual' as const,
            type: 'switch' as const,
            label: '天空照明 🌙'
        },
        showFloatingHearts: {
            category: 'decor' as const,
            type: 'switch' as const,
            label: '飘落爱心 💕'
        },
        showSparkles: {
            category: 'decor' as const,
            type: 'switch' as const,
            label: '璀璨星光 ✨'
        },
        showStarField: {
            category: 'decor' as const,
            type: 'switch' as const,
            label: '星空背景 🌌'
        },
        starCount: {
            category: 'decor' as const,
            type: 'slider' as const,
            label: '星星数量',
            min: 50,
            max: 200,
            step: 10,
        },
        showMoon: {
            category: 'decor' as const,
            type: 'switch' as const,
            label: '浪漫月亮 🌙'
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
        { id: 'visual' as const, label: '🎆 烟花', icon: null },
        { id: 'decor' as const, label: '✨ 氛围', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'customTitle' as const] },
        { id: 2, label: '动画文字', icon: null, fields: ['countdownSequence' as const] },
        { id: 3, label: '烟花效果', icon: null, fields: ['shellType' as const, 'shellSize' as const, 'autoLaunch' as const, 'finaleMode' as const, 'skyLighting' as const, 'particleQuality' as const] },
        { id: 4, label: '浪漫氛围', icon: null, fields: ['showFloatingHearts' as const, 'showSparkles' as const, 'showStarField' as const, 'starCount' as const, 'showMoon' as const] },
        { id: 5, label: '背景音效', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// 向后兼容导出
export const customFireworksCardConfigMetadata = configMetadata;
