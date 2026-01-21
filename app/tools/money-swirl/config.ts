/**
 * ==============================================================================
 * money-swirl 配置文件
 * 招财进宝 - 3D金钱漩涡效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    centerImage: string;
    particleImage: string;
    particleCount: number;
    orbitSpeed: number;
    fallSpeed: number;
    turbulence: number;
    centerSize: number;
    particleSize: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: [
        ...GLOBAL_BG_PRESETS.basicColors,
        ...GLOBAL_BG_PRESETS.lightColors,
        { label: '金色大厅', value: 'https://images.unsplash.com/photo-1565514020176-db711bd40902?q=80&w=2600&auto=format&fit=crop', type: 'image' as const },
    ],
    music: [
        { label: 'Jazz Comedy', value: 'https://cdn.pixabay.com/audio/2022/03/25/audio_51d451369f.mp3' },
        { label: 'Happy Swing', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_c36142750e.mp3' },
        { label: 'Cha Ching', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/kaching.mp3' },
    ],
    images: {
        cat: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1000&auto=format&fit=crop',
        bill: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
        coin: 'https://images.unsplash.com/photo-1621504455581-71fb342b4b45?q=80&w=600&auto=format&fit=crop',
    }
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    centerImage: PRESETS.images.cat,
    particleImage: PRESETS.images.bill,
    particleCount: 200,
    orbitSpeed: 2.5,
    fallSpeed: 2.5,
    turbulence: 60,
    centerSize: 200,
    particleSize: 80,
    bgValue: '#080808',
    bgConfig: createBgConfigWithOverlay({ type: 'color', value: '#080808' }, 0),
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const moneySwirlConfigMetadata = {
    panelTitle: '招财进宝配置',
    panelSubtitle: 'Prosperity Vortex Generator',
    configSchema: {
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景氛围',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '播放音效' },

        centerImage: {
            category: 'content' as const,
            type: 'input' as const,
            label: '中心图像',
            description: '输入图片URL'
        },
        particleImage: {
            category: 'content' as const,
            type: 'input' as const,
            label: '飘落元素',
            description: '输入图片URL'
        },

        particleCount: { category: 'visual' as const, label: '粒子数量', type: 'slider' as const, min: 50, max: 500, step: 10 },
        orbitSpeed: { category: 'visual' as const, label: '旋转速度', type: 'slider' as const, min: 0.5, max: 10, step: 0.5 },
        fallSpeed: { category: 'visual' as const, label: '下落速度', type: 'slider' as const, min: 0.5, max: 10, step: 0.5 },
        turbulence: { category: 'visual' as const, label: '气流扰动', type: 'slider' as const, min: 0, max: 200, step: 10 },
        centerSize: { category: 'visual' as const, label: '中心尺寸', type: 'slider' as const, min: 50, max: 400, step: 10 },
        particleSize: { category: 'visual' as const, label: '粒子尺寸', type: 'slider' as const, min: 20, max: 150, step: 5 },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '场景', icon: null },
        { id: 'visual' as const, label: '动态', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '内容定制', fields: ['centerImage' as const, 'particleImage' as const] },
        { id: 2, label: '场景氛围', fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
        { id: 3, label: '动态调整', fields: ['particleCount' as const, 'orbitSpeed' as const, 'fallSpeed' as const] },
    ],
};
