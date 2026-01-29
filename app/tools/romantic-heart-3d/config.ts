/**
 * ==============================================================================
 * romantic-heart-3d 配置文件
 * 3D 浪漫爱心工具 - Three.js 粒子心形效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';
import type { CategoryType, ToolConfigMetadata } from '@/types/genericConfig';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface RomanticHeart3DConfig {
    bgMusicUrl: string;
    enableSound: boolean;
    texts: string[];
    heartObjUrl: string;
    bgValue?: string;
    bgConfig?: StandardBgConfig;
}

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: RomanticHeart3DConfig = {
    bgMusicUrl: 'https://sf6-cdn-tos.douyinstatic.com/obj/ies-music/7170534431801838367.mp3',
    enableSound: true,
    texts: [
        "于我而言，你是最好且是唯一❤️",
        "宝贝，永远爱你❤️"
    ],
    heartObjUrl: 'https://assets.codepen.io/127738/heart_2.obj',
    bgValue: '#131124',
    bgConfig: createBgConfigWithOverlay({
        type: 'color',
        value: '#131124',
    }, 0),
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const romanticHeart3DConfigMetadata: ToolConfigMetadata<RomanticHeart3DConfig> = {
    panelTitle: '3D 爱心配置',
    panelSubtitle: 'Romantic Heart Settings',
    tabs: [
        { id: 'content' as CategoryType, label: '内容', icon: null },
        { id: 'background' as CategoryType, label: '背景', icon: null },
        { id: 'music' as CategoryType, label: '音乐', icon: null },
    ],
    configSchema: {
        texts: {
            category: 'content' as CategoryType,
            type: 'list' as const,
            label: '表白文字',
            description: '输入你想说的话，将会逐行显示',
            placeholder: '输入文字...'
        },
        bgValue: {
            category: 'background' as CategoryType,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: GLOBAL_BG_PRESETS.getToolPresets('romantic-heart-3d'),
            description: '选择浪漫背景'
        },
        bgConfig: { category: 'background' as CategoryType, type: 'readonly' as const, label: '背景配置' },
        heartObjUrl: { category: 'visual' as CategoryType, type: 'readonly' as const, label: '模型地址' },
        bgMusicUrl: {
            category: 'music' as CategoryType,
            type: 'media-picker' as const,
            label: '背景音乐',
            description: '选择或输入背景音乐链接',
            mediaType: 'music' as const,
            defaultItems: []
        },
        enableSound: {
            category: 'music' as CategoryType,
            type: 'switch' as const,
            label: '启用音效'
        }
    },
    mobileSteps: [
        { id: 1, label: '内容设置', icon: null, fields: ['texts'] },
        { id: 2, label: '背景设置', icon: null, fields: ['bgValue'] },
        { id: 3, label: '音乐设置', icon: null, fields: ['bgMusicUrl' as const, 'enableSound' as const] }
    ]
};

// ============================================================================
// 3D 渲染常量
// ============================================================================

export const HEART_3D_CONSTANTS = {
    // 粒子数量
    PARTICLE_COUNT: 10000,
    // 相机初始位置
    CAMERA_Z: 1.8,
    // 控制器距离
    MAX_DISTANCE: 3,
    MIN_DISTANCE: 0.7,
    // Z轴切片参数
    MAX_Z: 0.23,
    RATE_Z: 0.5,
    // 颜色调色板
    PALETTE_COLORS: [
        "#f0a1a8",
        "#de1c31",
        "#f0a1a8",
        "#ff1775",
    ],
};
