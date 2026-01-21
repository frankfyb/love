/**
 * ==============================================================================
 * warm-text-card 配置文件
 * 温馨文字卡片 - 浮动暖心文案
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export type WarmTextCardTheme = 'warm' | 'forest' | 'night' | 'minimal' | 'christmas' | 'eve';

export interface AppConfig {
    theme: WarmTextCardTheme;
    speed: number;
    maxCards: number;
    fontSizeScale: number;
    customMessages: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export type CardData = {
    id: number;
    text: string;
    x: number;
    y: number;
    rotate: number;
    scale: number;
    zIndex: number;
    bgIndex: number;
};

// ============================================================================
// 主题配置
// ============================================================================

export const THEMES = {
    warm: {
        name: '暖阳午后',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#fff7ed' }, 0),
        cardBg: ['bg-white', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50'],
        textColor: 'text-orange-900',
        shadow: 'shadow-orange-200/50',
        decoration: 'none',
    },
    forest: {
        name: '静谧森林',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#ecfdf5' }, 0),
        cardBg: ['bg-white', 'bg-emerald-50', 'bg-teal-50', 'bg-green-50'],
        textColor: 'text-emerald-900',
        shadow: 'shadow-emerald-200/50',
        decoration: 'none',
    },
    night: {
        name: '星河入梦',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#0f172a' }, 0),
        cardBg: ['bg-slate-800', 'bg-purple-900/80', 'bg-indigo-900/80', 'bg-slate-700'],
        textColor: 'text-indigo-100',
        shadow: 'shadow-purple-900/50',
        decoration: 'stars',
    },
    minimal: {
        name: '极简白白',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#f9fafb' }, 0),
        cardBg: ['bg-white'],
        textColor: 'text-gray-800',
        shadow: 'shadow-gray-200',
        decoration: 'none',
    },
    eve: {
        name: '平安夜',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#0f172a' }, 0),
        cardBg: ['bg-[#1e293b]', 'bg-[#334155]', 'bg-[#172554]', 'bg-[#312e81]/80'],
        textColor: 'text-amber-100',
        shadow: 'shadow-blue-900/50',
        decoration: 'snow',
    },
    christmas: {
        name: '圣诞快乐',
        bgConfig: createBgConfigWithOverlay({ type: 'color' as const, value: '#fef2f2' }, 0),
        cardBg: ['bg-white', 'bg-red-50', 'bg-green-50', 'bg-amber-50'],
        textColor: 'text-red-900',
        shadow: 'shadow-red-200/50',
        decoration: 'holly',
    },
};

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('warm-text-card'),
    music: [
        { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Soft Acoustic', value: 'https://cdn.pixabay.com/audio/2022/03/15/audio_b88f533c35.mp3' },
        { label: 'Calm Background', value: 'https://cdn.pixabay.com/audio/2023/01/02/audio_0b50b0e6b2.mp3' },
        { label: 'Jingle Bells', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const THEME_PRESETS = [
    { label: '暖阳午后', value: 'warm', type: 'theme' as const, bgConfig: THEMES.warm.bgConfig },
    { label: '静谧森林', value: 'forest', type: 'theme' as const, bgConfig: THEMES.forest.bgConfig },
    { label: '星河入梦', value: 'night', type: 'theme' as const, bgConfig: THEMES.night.bgConfig },
    { label: '极简白白', value: 'minimal', type: 'theme' as const, bgConfig: THEMES.minimal.bgConfig },
    { label: '平安夜', value: 'eve', type: 'theme' as const, bgConfig: THEMES.eve.bgConfig },
    { label: '圣诞快乐', value: 'christmas', type: 'theme' as const, bgConfig: THEMES.christmas.bgConfig },
];

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    theme: 'warm',
    speed: 800,
    maxCards: 40,
    fontSizeScale: 1,
    customMessages: [
        '生活原本沉闷，但跑起来就有风',
        '保持热爱，奔赴山海',
        '愿你的世界总有微风和暖阳',
        '把温柔和浪漫留给值得的人',
        'Merry Christmas',
        '平安喜乐',
        '岁岁常欢愉',
    ],
    bgConfig: THEMES.warm.bgConfig,
    bgValue: '#fff7ed',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const warmTextCardConfigMetadata = {
    panelTitle: '温馨文字卡片配置',
    panelSubtitle: 'Design Your Warm Text Card',
    configSchema: {
        theme: {
            label: '卡片风格',
            type: 'select' as const,
            options: [
                { label: '暖阳午后', value: 'warm' },
                { label: '静谧森林', value: 'forest' },
                { label: '星河入梦', value: 'night' },
                { label: '极简白白', value: 'minimal' },
                { label: '平安夜', value: 'eve' },
                { label: '圣诞快乐', value: 'christmas' },
            ],
            category: 'visual' as const,
        },
        fontSizeScale: {
            label: '字体大小',
            type: 'slider' as const,
            min: 0.6,
            max: 1.8,
            step: 0.1,
            category: 'visual' as const,
        },
        speed: {
            label: '生成速度',
            type: 'slider' as const,
            min: 200,
            max: 2000,
            step: 100,
            category: 'visual' as const,
        },
        maxCards: {
            label: '最大数量',
            type: 'slider' as const,
            min: 10,
            max: 100,
            step: 5,
            category: 'visual' as const,
        },
        customMessages: {
            label: '文案内容',
            type: 'list' as const,
            category: 'content' as const,
            placeholder: '输入文案内容',
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '支持颜色、图片、视频，可自定义更换'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '内容', icon: null, fields: ['customMessages' as const] },
        { id: 2, label: '背景场景', icon: null, fields: ['bgValue' as const] },
        { id: 3, label: '效果调节', icon: null, fields: ['theme' as const, 'fontSizeScale' as const, 'speed' as const, 'maxCards' as const] },
    ],
};

// ============================================================================
// 工具函数
// ============================================================================

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
