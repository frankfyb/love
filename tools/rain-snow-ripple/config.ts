/**
 * ==============================================================================
 * rain-snow-ripple 配置文件
 * 雨雪涟漪效果: 营造唯美浪漫的视觉体验
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';
import type { CategoryType, ToolConfigMetadata } from '@/types/genericConfig';

// ============================================================================
// 配置类型定义
// ============================================================================

export type RippleShape = 'circle' | 'heart' | 'star' | 'random';

export interface AppConfig {
    rainSpeed: number;
    snowDensity: number;
    rainColor: string;
    snowColor: string;
    text: string;
    rippleShape: RippleShape;
    rippleSize: number;
    rippleLife: number;
    fallingText: string[];
    fallingSpeed: number;
    fallingDensity: number;
    fallingSize: number;
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
        // 纯色背景（最稳定）
        { label: '纯黑背景', value: '#000000', type: 'color' as const },
        { label: '深蓝夜空', value: '#0f172a', type: 'color' as const },
        { label: '深邃蓝夜', value: '#0c4a6e', type: 'color' as const },
        { label: '神秘紫罗兰', value: '#2e1065', type: 'color' as const },
        { label: '浪漫玫瑰红', value: '#4c0519', type: 'color' as const },
        { label: '温柔粉紫', value: '#3b1f3b', type: 'color' as const },
        { label: '午夜蓝', value: '#1e3a5f', type: 'color' as const },
        { label: '深空灰', value: '#1a1a2e', type: 'color' as const },

        // 图片背景（Pexels CDN - 免费可商用）
        { label: '🖼️ 雨滴玻璃', value: 'https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },
        { label: '🖼️ 雪夜街灯', value: 'https://images.pexels.com/photos/688660/pexels-photo-688660.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },
        { label: '🖼️ 浪漫星空', value: 'https://images.pexels.com/photos/1539225/pexels-photo-1539225.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },
        { label: '🖼️ 樱花飘落', value: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },
        { label: '🖼️ 月光湖畔', value: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },
        { label: '🖼️ 城市雨夜', value: 'https://images.pexels.com/photos/1121123/pexels-photo-1121123.jpeg?auto=compress&cs=tinysrgb&w=1200', type: 'image' as const },

        // 视频背景（Pexels Videos CDN）
        { label: '🎬 雨滴窗户', value: 'https://videos.pexels.com/video-files/3044133/3044133-uhd_2560_1440_30fps.mp4', type: 'video' as const },
        { label: '🎬 雪花飘落', value: 'https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_25fps.mp4', type: 'video' as const },
        { label: '🎬 星空流转', value: 'https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_30fps.mp4', type: 'video' as const },
        { label: '🎬 海浪轻拍', value: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4', type: 'video' as const },
    ],
    music: [
        // 浪漫轻音乐（Pixabay 免费音频，稳定可用）
        { label: '💕 浪漫钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🌧️ 雨夜心语', value: 'https://cdn.pixabay.com/audio/2022/05/17/audio_17e9237699.mp3' },
        { label: '❄️ 冬日暖阳', value: 'https://cdn.pixabay.com/audio/2022/11/04/audio_c3be416972.mp3' },
        { label: '🌙 月光小夜曲', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '🌸 春日物语', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '💭 静谧时光', value: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b32e02f9.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    rainSpeed: 0.8,
    snowDensity: 0.4,
    // 浪漫粉紫色调
    rainColor: '#f9a8d4', // Pink 300
    snowColor: '#fdf2f8', // Pink 50
    text: '思念如雨 落地生花',
    rippleShape: 'heart',
    rippleSize: 30,
    rippleLife: 0.02,
    fallingText: ['💕', '💗', '✨', '🌸', '💖', 'Love', '❤️', '🦋'],
    fallingSpeed: 1.0,
    fallingDensity: 0.25,
    fallingSize: 28,
    bgValue: '#0f172a',
    bgConfig: createBgConfigWithOverlay({ type: 'color', value: '#0f172a' }, 0.2),
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const rainSnowRippleConfigMetadata: ToolConfigMetadata<AppConfig> = {
    panelTitle: '思念之境配置',
    panelSubtitle: 'Create Your Eternal Memory',
    configSchema: {
        bgValue: {
            category: 'background' as CategoryType,
            type: 'media-grid' as const,
            label: '氛围背景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择一张唯美的背景图或纯色'
        },
        bgConfig: { category: 'background' as CategoryType, type: 'readonly' as const, label: '背景配置' },
        bgMusicUrl: {
            category: 'background' as CategoryType,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: { category: 'background' as CategoryType, type: 'switch' as const, label: '环境音效' },

        text: { category: 'content' as CategoryType, label: '中心文字', type: 'input' as const, placeholder: '例如: I Love You' },
        fallingText: {
            category: 'content' as CategoryType,
            type: 'list' as const,
            label: '飘落素材池',
            placeholder: '输入Emoji或短语',
            description: '随机在那飘落的内容池，每行一个素材',
        },

        rainSpeed: { category: 'visual' as CategoryType, label: '雨滴速度', type: 'slider' as const, min: 0, max: 5, step: 0.1, description: '设为0可停止下雨' },
        snowDensity: { category: 'visual' as CategoryType, label: '雪花密度', type: 'slider' as const, min: 0, max: 1, step: 0.05, description: '设为0可停止下雪' },
        rainColor: { category: 'visual' as CategoryType, label: '雨滴颜色', type: 'color' as const },
        snowColor: { category: 'visual' as CategoryType, label: '雪花颜色', type: 'color' as const },

        fallingDensity: { category: 'visual' as CategoryType, label: '飘落物密度', type: 'slider' as const, min: 0, max: 0.5, step: 0.01 },
        fallingSpeed: { category: 'visual' as CategoryType, label: '飘落物速度', type: 'slider' as const, min: 0.5, max: 4, step: 0.1 },
        fallingSize: { category: 'visual' as CategoryType, label: '飘落物大小', type: 'slider' as const, min: 10, max: 60, step: 2 },

        rippleShape: {
            category: 'visual' as CategoryType,
            label: '涟漪形状',
            type: 'select' as const,
            options: [
                { label: '经典圆形', value: 'circle' },
                { label: '浪漫爱心', value: 'heart' },
                { label: '闪烁星光', value: 'star' },
                { label: '随机变化', value: 'random' },
            ]
        },
        rippleSize: { category: 'visual' as CategoryType, label: '涟漪大小', type: 'slider' as const, min: 5, max: 80, step: 1 },
        rippleLife: { category: 'visual' as CategoryType, label: '波纹寿命', type: 'slider' as const, min: 0.01, max: 0.1, step: 0.01 },
    },
    tabs: [
        { id: 'content' as CategoryType, label: '文字', icon: null },
        { id: 'background' as CategoryType, label: '背景', icon: null },
        { id: 'visual' as CategoryType, label: '特效', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '内容设置', fields: ['text' as const, 'fallingText' as const] },
        { id: 2, label: '背景音乐', fields: ['bgValue' as const, 'bgMusicUrl' as const] },
        { id: 3, label: '雨雪调节', fields: ['rainSpeed' as const, 'snowDensity' as const, 'rainColor' as const, 'snowColor' as const] },
        { id: 4, label: '氛围微调', fields: ['fallingDensity' as const, 'fallingSpeed' as const, 'rippleShape' as const] },
    ],
};

// ============================================================================
// 绘图工具函数
// ============================================================================

export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.4;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill(); // Changed to fill for better visibility with stroke potentially
    ctx.stroke();
    ctx.restore();
}

export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2.2; // Slightly sharper stars
    let rot = Math.PI / 2 * 3;
    const cx = 0;
    const cy = 0;
    const step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x0 = cx + Math.cos(rot) * outerRadius;
        let y0 = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x0, y0);
        rot += step;
        x0 = cx + Math.cos(rot) * innerRadius;
        y0 = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x0, y0);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

export function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
