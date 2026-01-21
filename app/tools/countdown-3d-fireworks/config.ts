import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

/**
 * ========================================================================
 * 3D烟花倒计时工具 - 配置文件
 * ========================================================================
 */

export interface AppConfig {
    targetDate: string;
    titleText: string;
    recipientName: string;
    countdownText: string;
    celebrationText: string[] | string;
    showFloatingHearts: boolean;
    showSparkles: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('countdown-3d-fireworks'),
    music: [
        { label: '浪漫星空', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '新年喜庆', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '梦幻夜曲', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '甘蜜时光', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    celebrationTemplates: [
        ['2026', '新', '年', '快', '乐'],
        ['爱', '你', '一', '万', '年'],
        ['幸', '福', '美', '满'],
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
    titleText: '距离 2026 跨年还有',
    recipientName: '💕 致最爱的你 💕',
    countdownText: '3',
    celebrationText: ['2026', '新', '年', '快', '乐'],
    showFloatingHearts: true,
    showSparkles: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const countdown3dFireworksCardConfigMetadata = {
    panelTitle: '3D烟花倒计时配置',
    panelSubtitle: 'Romantic 3D Fireworks Countdown',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '送给谁 💕', placeholder: '例如：亲爱的宝贝' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '倒计时标题', placeholder: '距离 2026 跨年还有' },
        targetDate: { category: 'content' as const, type: 'datetime' as const, label: '目标日期', timeType: 'datetime' as const, description: '选择倒计时的目标日期' },
        countdownText: { category: 'content' as const, type: 'input' as const, label: '倒计时秒数', placeholder: '3', description: '从几秒开始倒数（例如3、5、10）' },
        celebrationText: { category: 'content' as const, type: 'list' as const, label: '庆祝文字 🎉', placeholder: '输入庆祝文字', description: '每行一个字或词，逐个展示' },

        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '飘落爱心 💕' },
        showSparkles: { category: 'visual' as const, type: 'switch' as const, label: '璀璨星光 ✨' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你最喜爱的背景氛围'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '基础设置', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'targetDate' as const] },
        { id: 2, label: '倒计时设置', icon: null, fields: ['countdownText' as const, 'celebrationText' as const, 'showFloatingHearts' as const, 'showSparkles' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// Export  alias for compatibility
export const countdown3dFireworksConfigMetadata = countdown3dFireworksCardConfigMetadata;
