/**
 * ==============================================================================
 * photo-planet 配置文件
 * 星球相册工具 - 3D旋转照片星球效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    title: string;
    subtitle: string;
    loveText: string;
    photos: string[];
    rotationSpeed: number;
    sphereSize: number;
    showHearts: boolean;
    heartColor: string;
    glowIntensity: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 默认照片列表
// ============================================================================

export const DEFAULT_PHOTOS = [
    'https://picsum.photos/seed/couple1/200/200',
    'https://picsum.photos/seed/couple2/200/200',
    'https://picsum.photos/seed/couple3/200/200',
    'https://picsum.photos/seed/couple4/200/200',
    'https://picsum.photos/seed/couple5/200/200',
    'https://picsum.photos/seed/couple6/200/200',
    'https://picsum.photos/seed/couple7/200/200',
    'https://picsum.photos/seed/couple8/200/200',
    'https://picsum.photos/seed/couple9/200/200',
    'https://picsum.photos/seed/couple10/200/200',
    'https://picsum.photos/seed/couple11/200/200',
    'https://picsum.photos/seed/couple12/200/200',
    'https://picsum.photos/seed/couple13/200/200',
    'https://picsum.photos/seed/couple14/200/200',
    'https://picsum.photos/seed/couple15/200/200',
    'https://picsum.photos/seed/couple16/200/200',
    'https://picsum.photos/seed/couple17/200/200',
    'https://picsum.photos/seed/couple18/200/200',
    'https://picsum.photos/seed/couple19/200/200',
    'https://picsum.photos/seed/couple20/200/200',
];

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('photo-planet'),
    music: [
        { label: '💕 浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🌙 星空夜曲', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '💗 甜蜜时光', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    heartColors: [
        { label: '💗 浪漫粉', value: '#ff69b4' },
        { label: '❤️ 热情红', value: '#ff1744' },
        { label: '💜 梦幻紫', value: '#e040fb' },
        { label: '🧡 温暖橙', value: '#ff9100' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    title: '裹着心的光',
    subtitle: '有你很暖',
    loveText: 'Love You',
    photos: DEFAULT_PHOTOS,
    rotationSpeed: 0.5,
    sphereSize: 320,
    showHearts: true,
    heartColor: '#ff69b4',
    glowIntensity: 0.8,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#0a0a0a' },
        0
    ),
    bgValue: '#0a0a0a',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const photoPlanetConfigMetadata = {
    panelTitle: '星球相册配置',
    panelSubtitle: 'Photo Planet Settings',
    configSchema: {
        title: { category: 'content' as const, type: 'input' as const, label: '主标题', placeholder: '裹着心的光' },
        subtitle: { category: 'content' as const, type: 'input' as const, label: '副标题', placeholder: '有你很暖' },
        loveText: { category: 'content' as const, type: 'input' as const, label: '浪漫文字', placeholder: 'Love You' },

        rotationSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 0.1, max: 2, step: 0.1 },
        sphereSize: { category: 'visual' as const, type: 'slider' as const, label: '星球大小', min: 200, max: 500, step: 20 },
        showHearts: { category: 'visual' as const, type: 'switch' as const, label: '显示漂浮爱心' },
        heartColor: {
            category: 'visual' as const,
            type: 'select' as const,
            label: '爱心颜色',
            options: PRESETS.heartColors
        },
        glowIntensity: { category: 'visual' as const, type: 'slider' as const, label: '发光强度', min: 0.2, max: 1.5, step: 0.1 },

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
        { id: 'content' as const, label: '文字', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '文字定制', icon: null, fields: ['title' as const, 'subtitle' as const, 'loveText' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['rotationSpeed' as const, 'sphereSize' as const, 'showHearts' as const, 'heartColor' as const, 'glowIntensity' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

// ============================================================================
// 照片瓦片数据类型
// ============================================================================

export interface PhotoTileData {
    id: number;
    photo: string;
    rotateY: number;
    rotateX: number;
    translateZ: number;
}

// 生成球面照片瓦片位置 - 斐波那契球面分布
export function generatePhotoTiles(photos: string[], sphereSize: number): PhotoTileData[] {
    const tiles: PhotoTileData[] = [];
    const photoList = photos.length > 0 ? photos : DEFAULT_PHOTOS;

    const totalPhotos = 20;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < totalPhotos; i++) {
        const y = 1 - (i / (totalPhotos - 1)) * 2;
        const theta = goldenAngle * i;

        const rotateY = (theta * 180) / Math.PI;
        const rotateX = (Math.asin(y) * 180) / Math.PI;

        tiles.push({
            id: i,
            photo: photoList[i % photoList.length],
            rotateY: rotateY,
            rotateX: rotateX,
            translateZ: sphereSize / 2,
        });
    }

    return tiles;
}

// ============================================================================
// 漂浮爱心数据类型
// ============================================================================

export interface FloatingHeart {
    x: number;
    y: number;
    size: number;
    alpha: number;
    vy: number;
    vx: number;
    rotation: number;
    rotationSpeed: number;
}

// 绘制爱心形状
export function drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number,
    rot: number
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size, size * 0.1, 0, size);
    ctx.bezierCurveTo(size, size * 0.1, size * 0.5, -size * 0.3, 0, size * 0.3);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
}
