/**
 * ==============================================================================
 * traffic-light-birthday 配置文件
 * 红绿灯生日倒数
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    oldAge: number;
    newAge: number;
    topText: string;
    bottomText: string;
    centerTextEn: string;
    centerTextCn: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    trafficLightColor: string;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Happy Birthday', value: 'https://cdn.pixabay.com/audio/2023/10/25/audio_51d547f671.mp3' },
        { label: 'Upbeat Celebration', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    oldAge: 37,
    newAge: 38,
    topText: '再见 37 岁',
    bottomText: '你好 38 岁',
    centerTextEn: 'HAPPY BIRTHDAY',
    centerTextCn: '每一岁 都珍贵',
    bgConfig: createBgConfigWithOverlay(
        { type: 'image' as const, value: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1920&auto=format&fit=crop' },
        0.2
    ),
    bgValue: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1920&auto=format&fit=crop',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    trafficLightColor: '#1f2937',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const trafficLightBirthdayConfigMetadata = {
    panelTitle: '红绿灯生日倒数',
    panelSubtitle: 'Traffic Light Birthday Wish',
    configSchema: {
        oldAge: { category: 'content' as const, type: 'input' as const, label: '过去年龄', placeholder: '37' },
        newAge: { category: 'content' as const, type: 'input' as const, label: '新年龄', placeholder: '38' },
        topText: { category: 'content' as const, type: 'input' as const, label: '顶部文案', placeholder: '再见 37 岁' },
        bottomText: { category: 'content' as const, type: 'input' as const, label: '底部文案', placeholder: '你好 38 岁' },
        centerTextEn: { category: 'content' as const, type: 'input' as const, label: '中间英文', placeholder: 'HAPPY BIRTHDAY' },
        centerTextCn: { category: 'content' as const, type: 'input' as const, label: '中间中文', placeholder: '每一岁 都珍贵' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择唯美夕阳或天空背景'
        },

        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '年龄设置', icon: null, fields: ['oldAge' as const, 'newAge' as const] },
        { id: 2, label: '祝福文案', icon: null, fields: ['topText' as const, 'bottomText' as const, 'centerTextEn' as const, 'centerTextCn' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};
