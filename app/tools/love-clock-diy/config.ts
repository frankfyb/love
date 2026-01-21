/**
 * ==============================================================================
 * love-clock-diy 配置文件
 * 专属恋爱时钟 - DIY照片时钟效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    centerText: string;
    subText: string;
    images: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    clockColor: string;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: 'Sweet Acoustic', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_l_06f14066c0.mp3' },
    ],
    defaultImages: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2??q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
    ]
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    centerText: 'I love you so',
    subText: 'Every second with you',
    images: PRESETS.defaultImages,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#78716c' },
        0.3
    ),
    bgValue: '#78716c',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    clockColor: '#ffffff',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const loveClockDiyConfigMetadata = {
    panelTitle: '专属恋爱时钟',
    panelSubtitle: 'DIY Photo Clock',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: 'I love you so' },
        subText: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: 'Every second with you' },
        images: {
            category: 'content' as const,
            type: 'list' as const,
            label: '时钟照片(12张)',
            placeholder: '输入图片URL',
            description: '请按顺序提供12张照片URL（12点到11点）'
        },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
        },

        clockColor: { category: 'visual' as const, type: 'color' as const, label: '时钟颜色', description: '数字和指针的颜色' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '文字设置', icon: null, fields: ['centerText' as const, 'subText' as const] },
        { id: 2, label: '照片上传', icon: null, fields: ['images' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 时钟工具函数
// ============================================================================

export const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// 确保有12张图片
export function normalizeClockImages(images: string[]): string[] {
    const imgs = [...(images || [])];
    while (imgs.length < 12) {
        imgs.push(imgs[imgs.length % (images?.length || 1)] || PRESETS.defaultImages[0]);
    }
    return imgs.slice(0, 12);
}

// 计算时钟位置
export function getClockPosition(index: number, radius: number) {
    const angleDeg = index * 30 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
        x: 50 + radius * Math.cos(angleRad),
        y: 50 + radius * Math.sin(angleRad)
    };
}
