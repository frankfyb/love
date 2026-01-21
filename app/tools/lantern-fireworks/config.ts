/**
 * lantern-fireworks 配置文件
 * 孔明灯与烟花 - 浪漫祈愿之夜
 */

import { createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

export interface WishItem {
    sender: string;
    wish: string;
}

export interface AppConfig {
    titleText: string;
    recipientName: string;
    wishes: WishItem[];
    fireworkDensity: number;
    lanternCount: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('lantern-fireworks'),
    music: [
        { label: '新年祝福音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '传统民乐', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '宁静钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
};

export const DEFAULT_WISHES: WishItem[] = [
    { sender: '小明', wish: '愿新的一年，心想事成，万事如意！' },
    { sender: '小红', wish: '希望家人平安健康，幸福美满~' },
    { sender: '阿杰', wish: '事业顺利，财源滚滚！' },
    { sender: '小美', wish: '愿所有的美好都如约而至 ✨' },
    { sender: '大伟', wish: '新年快乐！希望能找到真爱 ❤️' },
    { sender: '小琳', wish: '学业进步，考试顺利！加油！' },
    { sender: '老王', wish: '身体健康，一切顺心如意！' },
    { sender: '小李', wish: '2025发大财！暴富暴瘦！' },
];

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '愿望孔明灯',
    recipientName: '亲爱的你',
    wishes: DEFAULT_WISHES,
    fireworkDensity: 6,
    lanternCount: 12,
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#0a0a1a',
    }, 0),
    bgValue: '#0a0a1a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const lanternFireworksConfigMetadata = {
    panelTitle: '孔明灯与烟花配置',
    panelSubtitle: 'Lanterns & Fireworks',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁',
            placeholder: '例如：亲爱的小曾'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '标题',
            placeholder: '愿望孔明灯'
        },
        wishes: {
            category: 'content' as const,
            type: 'wishes' as const,
            label: '愿望列表',
            placeholder: '添加愿望',
            description: '为每个孔明灯添加祝福'
        },
        lanternCount: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '孔明灯数量',
            min: 4,
            max: 20,
            step: 1
        },
        fireworkDensity: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '烟花密度',
            min: 2,
            max: 12,
            step: 1
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
        { id: 'content' as const, label: '💌 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const] },
        { id: 2, label: '愿望内容', icon: null, fields: ['wishes' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['lanternCount' as const, 'fireworkDensity' as const] },
        { id: 4, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};
