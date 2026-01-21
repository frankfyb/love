import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

/**
 * ========================================================================
 * 3D烟花秀工具 - 配置文件
 * ========================================================================
 */

export interface AppConfig {
    displayText: string;
    greetings: string[];
    autoRotate: boolean;
    rotateSpeed: number;
    fireworkDensity: number;
    particleCount: number;
    trailLength: number;
    showGround: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('firework-show-3d'),
    music: [
        { label: '新年祝福', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '欢乐时光', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '梦幻夜空', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    displayText: '新年快乐',
    greetings: [
        '愿新的一年',
        '所有美好如期而至',
        '所有等待都有回应'
    ],
    autoRotate: true,
    rotateSpeed: 0.5,
    fireworkDensity: 3,
    particleCount: 150,
    trailLength: 5,
    showGround: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const fireworkShow3dCardConfigMetadata = {
    panelTitle: '3D烟花秀配置',
    panelSubtitle: '沉浸式3D烟花体验',
    configSchema: {
        displayText: { category: 'content' as const, type: 'input' as const, label: '显示文字', placeholder: '新年快乐' },
        greetings: { category: 'content' as const, type: 'list' as const, label: '祝福语', placeholder: '输入祝福语' },

        autoRotate: { category: 'visual' as const, type: 'switch' as const, label: '自动旋转' },
        rotateSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 0.1, max: 2, step: 0.1 },
        fireworkDensity: { category: 'visual' as const, type: 'slider' as const, label: '烟花密度', min: 1, max: 10, step: 1 },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '粒子数量', min: 50, max: 300, step: 10 },
        trailLength: { category: 'visual' as const, type: 'slider' as const, label: '尾迹长度', min: 1, max: 10, step: 1 },
        showGround: { category: 'visual' as const, type: 'switch' as const, label: '显示地面' },

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
        { id: 1, label: '文字设置', icon: null, fields: ['displayText' as const, 'greetings' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoRotate' as const, 'rotateSpeed' as const, 'fireworkDensity' as const, 'particleCount' as const, 'trailLength' as const, 'showGround' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// Export alias for compatibility
export const fireworkShow3dConfigMetadata = fireworkShow3dCardConfigMetadata;

// 音效源
export const AUDIO_SOURCES = {
    burst: [
        'https://cdn.freesound.org/previews/442/442127_5121236-lq.mp3',
        'https://cdn.freesound.org/previews/442/442126_5121236-lq.mp3',
    ],
};
