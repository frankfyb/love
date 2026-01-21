/**
 * ==============================================================================
 * festive-projection-diy 配置文件
 * 新年好运投射 - 浪漫贴纸雨效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    greetingText: string;
    subText: string;
    userPhoto: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    streamSpeed: number;
    stickerDensity: number;
    stickerStyle: 'festive' | 'romantic' | 'mixed';
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: '新年喜庆', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '温馨旋律', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    festiveStickers: [
        '🧧', '💰', '🧨', '🏮', '✨', '福', '🐟', '🐍', '🍊', '🎉',
        '🎇', '🎆', '💫', '⭐', '🌟',
        '新年快乐', '恭喜发财', '大吉大利', '万事如意', '2026'
    ],
    romanticStickers: [
        '💕', '💖', '💗', '💓', '💞', '💘', '❤️', '🌹', '🌸', '✨',
        '💫', '⭐', '🌟', '🦋', '🌺', '💐',
        '爱你', 'LOVE', '永远', '幸福', '甜蜜'
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    greetingText: '新年快乐',
    subText: 'Happy New Year 2026',
    userPhoto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop',
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#1a0a2e' },
        0.1
    ),
    bgValue: '#1a0a2e',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    streamSpeed: 4,
    stickerDensity: 50,
    stickerStyle: 'mixed',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const festiveProjectionDiyConfigMetadata = {
    panelTitle: '新年好运投射',
    panelSubtitle: 'Lucky Sticker Rain Effect',
    configSchema: {
        greetingText: { category: 'content' as const, type: 'input' as const, label: '🎉 大标题', placeholder: '新年快乐' },
        subText: { category: 'content' as const, type: 'input' as const, label: '✨ 副标题', placeholder: 'Happy New Year 2026' },
        userPhoto: {
            category: 'content' as const,
            type: 'media-picker' as const,
            label: '📷 人物照片',
            mediaType: 'image' as const,
            description: '上传或输入照片URL'
        },

        stickerStyle: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '🎨 贴纸风格',
            options: [
                { label: '🧧 喜庆新年', value: 'festive' },
                { label: '💕 浪漫爱心', value: 'romantic' },
                { label: '✨ 混合风格', value: 'mixed' },
            ]
        },
        streamSpeed: { category: 'visual' as const, type: 'slider' as const, label: '🚀 飘落速度', min: 1, max: 10, step: 1, description: '贴纸下落的速度' },
        stickerDensity: { category: 'visual' as const, type: 'slider' as const, label: '🌟 贴纸密度', min: 20, max: 100, step: 10, description: '屏幕上贴纸的数量' },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '背景颜色或图片'
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '📝 内容', icon: null },
        { id: 'visual' as const, label: '✨ 视觉', icon: null },
        { id: 'background' as const, label: '🎵 背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '照片上传', icon: null, fields: ['userPhoto' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetingText' as const, 'subText' as const] },
        { id: 3, label: '贴纸效果', icon: null, fields: ['stickerStyle' as const, 'streamSpeed' as const, 'stickerDensity' as const] },
        { id: 4, label: '背景音乐', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 粒子类型定义
// ============================================================================

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    content: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    isText: boolean;
    color: string;
    life: number;
    maxLife: number;
    layer: number;
    scale: number;
    targetScale: number;
}

// ============================================================================
// 粒子工具函数
// ============================================================================

export function getStickers(style: 'festive' | 'romantic' | 'mixed'): string[] {
    switch (style) {
        case 'festive':
            return PRESETS.festiveStickers;
        case 'romantic':
            return PRESETS.romanticStickers;
        case 'mixed':
        default:
            return [...PRESETS.festiveStickers, ...PRESETS.romanticStickers];
    }
}

export function getSourcePoint(width: number, height: number, isMobile: boolean) {
    return {
        x: isMobile ? width * 0.15 : width * 0.10,
        y: isMobile ? height * 0.12 : height * 0.10,
    };
}

export function getTargetArea(width: number, height: number, isMobile: boolean) {
    return {
        x: isMobile ? width * 0.75 : width * 0.78,
        y: isMobile ? height * 0.70 : height * 0.65,
    };
}

export function createParticle(
    width: number,
    height: number,
    stickers: string[],
    isMobile: boolean
): Particle {
    const content = stickers[Math.floor(Math.random() * stickers.length)];
    const isText = content.length > 2;

    const source = getSourcePoint(width, height, isMobile);
    const target = getTargetArea(width, height, isMobile);

    const startX = source.x + (Math.random() - 0.5) * 40;
    const startY = source.y + (Math.random() - 0.5) * 40;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const baseAngle = Math.atan2(dy, dx);

    const spreadAngle = Math.PI / 3;
    const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;

    const speed = 2.5 + Math.random() * 4;
    const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
    const layerScale = [1.5, 1.1, 0.7][layer];
    const layerSpeed = [1.2, 1, 0.8][layer];

    const colors = ['#FFD700', '#FF6B6B', '#FFFFFF', '#FFA500', '#FF69B4', '#FF4444', '#FFAA00', '#FFE4B5'];

    const baseSizeEmoji = isMobile ? 30 : 44;
    const baseSizeText = isMobile ? 18 : 26;
    const maxLife = 100 + Math.random() * 100;

    return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed * layerSpeed,
        vy: Math.sin(angle) * speed * layerSpeed,
        content,
        size: (isText ? baseSizeText + Math.random() * 14 : baseSizeEmoji + Math.random() * 24) * layerScale,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0,
        isText,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife,
        layer,
        scale: 0.3,
        targetScale: layerScale,
    };
}
