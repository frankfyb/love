/**
 * ==============================================================================
 * couples-agreement 配置文件
 * 情侣协议书 - 浪漫甜蜜的爱情约定
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    titleText: string;
    partyAName: string;
    partyBName: string;
    clauses: string[];
    signatureDate: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    themeColor: string;
    paperOpacity: number;
    showFloatingHearts: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温柔情歌', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '甜蜜原声', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_l_06f14066c0.mp3' },
        { label: '梦幻夜曲', value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3' },
    ],
    defaultClauses: [
        '要有共同的人生目标，未来是你',
        '可以有异性朋友，但要保持分寸',
        '彼此信任坦诚，不可以欺骗',
        '不生隔夜气，当天事情当天解决',
        '生气时，绝不可以放狠话，会伤感情',
        '不要冷战，有问题及时沟通',
        '答应对方的事情要说到做到',
    ]
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '情侣协议书',
    partyAName: '小张',
    partyBName: '小美',
    clauses: PRESETS.defaultClauses,
    signatureDate: new Date().toISOString().split('T')[0],
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#1a1a2e' },
        0.1
    ),
    bgValue: '#1a1a2e',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    themeColor: '#ff6b9d',
    paperOpacity: 0.92,
    showFloatingHearts: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const couplesAgreementConfigMetadata = {
    panelTitle: '情侣协议专属定制',
    panelSubtitle: 'Create Your Love Agreement',
    configSchema: {
        partyAName: { category: 'content' as const, type: 'input' as const, label: '💕 甲方姓名', placeholder: '例如：小张' },
        partyBName: { category: 'content' as const, type: 'input' as const, label: '💕 乙方姓名', placeholder: '例如：小美' },
        titleText: { category: 'content' as const, type: 'input' as const, label: '协议标题', placeholder: '情侣协议书' },
        signatureDate: { category: 'content' as const, type: 'datetime' as const, label: '签署日期', timeType: 'date' as const },
        clauses: { category: 'content' as const, type: 'list' as const, label: '💌 协议条款', placeholder: '输入条款内容', description: '每一行代表一条约定' },

        themeColor: { category: 'visual' as const, type: 'color' as const, label: '💗 主题颜色', description: '协议书的主色调' },
        paperOpacity: { category: 'visual' as const, type: 'slider' as const, label: '📄 协议透明度', min: 0.3, max: 1, step: 0.05, description: '调整协议纸张的透明度' },
        showFloatingHearts: { category: 'visual' as const, type: 'switch' as const, label: '💕 飘落爱心' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择浪漫的背景氛围'
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
        { id: 1, label: '签署人', icon: null, fields: ['partyAName' as const, 'partyBName' as const, 'signatureDate' as const] },
        { id: 2, label: '约定条款', icon: null, fields: ['clauses' as const, 'titleText' as const] },
        { id: 3, label: '视觉效果', icon: null, fields: ['themeColor' as const, 'paperOpacity' as const, 'showFloatingHearts' as const] },
        { id: 4, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 飘落爱心数据类型
// ============================================================================

export interface FloatingHeart {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
}

// 生成飘落爱心数据
export function generateFloatingHearts(count: number = 15): FloatingHeart[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 12 + Math.random() * 16,
        duration: 8 + Math.random() * 8,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.4,
    }));
}
