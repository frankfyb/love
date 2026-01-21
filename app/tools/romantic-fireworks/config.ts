import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

/**
 * ========================================================================
 * 浪漫烟花工具 - 配置文件
 * ========================================================================
 */

export interface AppConfig {
    titleText: string;
    recipientName: string;
    greetingText: string;
    autoLaunch: boolean;
    shellSize: number;
    shellType: 'random' | 'crysanthemum' | 'ring' | 'palm' | 'willow' | 'crackle' | 'strobe';
    quality: number;
    skyLighting: number;
    finaleMode: boolean;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('romantic-fireworks'),
    music: [
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '新年快乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '2026 新年快乐',
    recipientName: '致我最爱的你',
    greetingText: '愿新的一年\\n所有的美好如期而至\\n所有的等待都有回应\\n愿你平安喜乐\\n万事胜意',
    autoLaunch: true,
    shellSize: 3,
    shellType: 'random',
    quality: 2,
    skyLighting: 2,
    finaleMode: false,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

export const romanticFireworksCardConfigMetadata = {
    panelTitle: '浪漫烟花配置',
    panelSubtitle: '打造专属你的烟花盛宴',
    configSchema: {
        recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的你' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '标题文字', placeholder: '2026 新年快乐' },
        greetingText: { category: 'content' as const, type: 'textarea' as const, label: '祝福语', placeholder: '输入你的祝福...', rows: 5 },

        autoLaunch: { category: 'visual' as const, type: 'switch' as const, label: '自动发射' },
        finaleMode: { category: 'visual' as const, type: 'switch' as const, label: '终极模式' },
        shellType: {
            category: 'visual' as const, type: 'select' as const, label: '烟花类型', options: [
                { label: '随机', value: 'random' },
                { label: '菊花', value: 'crysanthemum' },
                { label: '环形', value: 'ring' },
                { label: '棕榈', value: 'palm' },
                { label: '柳树', value: 'willow' },
                { label: '爆裂', value: 'crackle' },
                { label: '闪烁', value: 'strobe' },
            ]
        },
        shellSize: { category: 'visual' as const, type: 'slider' as const, label: '烟花大小', min: 1, max: 5, step: 1 },
        quality: {
            category: 'visual' as const, type: 'select' as const, label: '画质', options: [
                { label: '低', value: 1 },
                { label: '正常', value: 2 },
                { label: '高', value: 3 },
            ]
        },
        skyLighting: {
            category: 'visual' as const, type: 'select' as const, label: '天空照明', options: [
                { label: '无', value: 0 },
                { label: '暗淡', value: 1 },
                { label: '正常', value: 2 },
            ]
        },

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
        { id: 1, label: '祝福内容', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'greetingText' as const] },
        { id: 2, label: '烟花设置', icon: null, fields: ['autoLaunch' as const, 'finaleMode' as const, 'shellType' as const, 'shellSize' as const, 'quality' as const, 'skyLighting' as const] },
        { id: 3, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
    ],
};

// Export alias for compatibility
export const romanticFireworksConfigMetadata = romanticFireworksCardConfigMetadata;
