import { Monitor, Music, Palette, Sparkles, Type } from "lucide-react";
import type { StandardBgConfig } from '@/types/background';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';

/**
 * ==============================================================================
 * 配置类型定义
 * ==============================================================================
 */

export interface AppConfig {
    // 场景设置
    bgTheme: "midnight" | "warmRed" | "deepBlue";
    bgValue: string;
    bgType: "color" | "image" | "video";

    // 烟花视觉
    particleTheme: "classic" | "rainbow" | "neon" | "custom";
    fireworkScale: number;
    particleCount: number;
    explosionForce: number;

    // 文字设置
    textString: string;
    textColor: string;
    textOuterColor: string;
    textScale: number;
    burnIntensity: number;

    // 交互
    gravity: number;
    autoLaunch: boolean;

    // 音效
    volume: number;
    bgMusicUrl: string;
    enableSound: boolean;
    bgConfig?: StandardBgConfig;
}

/**
 * ==============================================================================
 * 预设资源库
 * ==============================================================================
 */

export const PRESETS = {
    backgrounds: [
        { label: '极致深黑 (纯色)', value: '#05050f', type: 'color' },
        { label: '午夜深蓝 (纯色)', value: '#0f172a', type: 'color' },
        { label: '皇家紫 (纯色)', value: '#240a34', type: 'color' },
        { label: '唯美飘雪 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/20471-309698211.mp4', type: 'video' },
        { label: '温馨壁炉 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/23881-337972830_small.mp4', type: 'video' },
    ],
    music: [
        { label: '新年倒计时音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '欢快新年歌', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '宁静钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

/**
 * ==============================================================================
 * 默认配置
 * ==============================================================================
 */

export const DEFAULT_CONFIG: AppConfig = {
    bgTheme: "midnight",
    bgValue: PRESETS.backgrounds[1].value,
    bgType: "color",
    particleTheme: "classic", // 经典烈焰更浪漫
    fireworkScale: 2.2, // 适中的爆炸范围
    particleCount: 8000, // 更多粒子让文字更清晰
    explosionForce: 20,
    textString: "新年快乐",
    textColor: "#FFD700", // 金色焰心
    textOuterColor: "#FF6B6B", // 浪漫粉红外焰
    textScale: 0.7, // 更大的文字
    burnIntensity: 0.8, // 更柔和的燃烧抖动
    gravity: 0.12, // 更慢的下落
    autoLaunch: true,
    volume: 0.5,
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0f172a' },
        0
    ),
};

/**
 * ==============================================================================
 * 配置元数据
 * ==============================================================================
 */

export const newyearFireworksCardConfigMetadata = {
    panelTitle: "流光·新年",
    panelSubtitle: "Colorful New Year 2026",
    tabs: [
        { id: "visual" as const, label: "色彩", icon: null },
        { id: "content" as const, label: "祝词", icon: null },
        { id: "scene" as const, label: "环境", icon: null },
    ],
    configSchema: {
        particleTheme: {
            label: "色彩主题",
            type: "select" as const,
            options: [
                { label: "经典烈焰", value: "classic" },
                { label: "缤纷彩虹", value: "rainbow" },
                { label: "赛博霓虹", value: "neon" },
                { label: "自定义双色", value: "custom" },
            ],
            category: "visual" as const,
        },
        textColor: {
            label: "自定义焰心",
            type: "color" as const,
            category: "visual" as const,
            condition: (c: AppConfig) => c.particleTheme === 'custom'
        },
        textOuterColor: {
            label: "自定义外焰",
            type: "color" as const,
            category: "visual" as const,
            condition: (c: AppConfig) => c.particleTheme === 'custom'
        },

        fireworkScale: {
            label: "绽放半径",
            type: "slider" as const,
            min: 0.5,
            max: 3.0,
            step: 0.1,
            category: "visual" as const
        },
        particleCount: {
            label: "粒子密度",
            type: "slider" as const,
            min: 500,
            max: 8000,
            step: 100,
            category: "visual" as const
        },
        explosionForce: {
            label: "炸裂冲击",
            type: "slider" as const,
            min: 10,
            max: 50,
            step: 1,
            category: "visual" as const
        },

        textString: {
            label: "堆积文字",
            type: "input" as const,
            category: "content" as const,
            placeholder: "输入文字..."
        },
        textScale: {
            label: "文字尺寸",
            type: "slider" as const,
            min: 0.5,
            max: 2.0,
            step: 0.1,
            category: "content" as const
        },
        burnIntensity: {
            label: "燃烧猛烈度",
            type: "slider" as const,
            min: 0.1,
            max: 3.0,
            step: 0.1,
            category: "content" as const
        },

        bgValue: {
            category: "scene" as const,
            type: "media-grid" as const,
            label: "背景场景",
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds
        },
        gravity: {
            label: "下坠速度",
            type: "slider" as const,
            min: 0.05,
            max: 0.5,
            step: 0.01,
            category: "scene" as const
        },

        bgMusicUrl: {
            category: "scene" as const,
            type: "media-picker" as const,
            label: "背景音乐",
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: {
            category: "scene" as const,
            type: "switch" as const,
            label: "启用音效"
        },
        volume: {
            label: "音效音量",
            type: "slider" as const,
            min: 0,
            max: 1,
            step: 0.1,
            category: "scene" as const
        },
    },
    mobileSteps: [
        { id: 1, label: "色彩主题", icon: null, fields: ['particleTheme' as const, 'textColor' as const, 'textOuterColor' as const] },
        { id: 2, label: "烟花参数", icon: null, fields: ['fireworkScale' as const, 'particleCount' as const, 'explosionForce' as const] },
        { id: 3, label: "祝词文字", icon: null, fields: ['textString' as const, 'textScale' as const, 'burnIntensity' as const] },
        { id: 4, label: "背景场景", icon: null, fields: ['bgValue' as const, 'gravity' as const] },
        { id: 5, label: "音乐音效", icon: null, fields: ['bgMusicUrl' as const, 'enableSound' as const, 'volume' as const] },
    ],
};

// Export alias for compatibility with toolsRegistry.tsx
export const newyearFireworksConfigMetadata = newyearFireworksCardConfigMetadata;
