/**
 * ==============================================================================
 * rain-snow-ripple 配置文件
 * 雨雪涟漪效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export type RippleShape = 'circle' | 'heart' | 'star';

export interface AppConfig {
    rainSpeed: number;
    snowDensity: number;
    rainColor: string;
    snowColor: string;
    text: string;
    rippleShape: RippleShape;
    rippleSize: number;
    rippleLife: number;
    fallingText: string;
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
        ...GLOBAL_BG_PRESETS.basicColors,
        ...GLOBAL_BG_PRESETS.commonImages,
        { label: '雨夜霓虹', value: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2574&auto=format&fit=crop', type: 'image' as const },
        { label: '静谧雪山', value: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=2670&auto=format&fit=crop', type: 'image' as const },
    ],
    music: [
        { label: '这是我一生中最勇敢的瞬间', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/brave-moment.mp3' },
        { label: 'Rainy Mood', value: 'https://cdn.pixabay.com/audio/2022/05/17/audio_17e9237699.mp3' },
        { label: 'Soft Piano', value: 'https://cdn.pixabay.com/audio/2022/03/23/audio_0796b994d5.mp3' },
        { label: 'White Noise', value: 'https://cdn.pixabay.com/audio/2022/11/04/audio_c3be416972.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    rainSpeed: 1.2,
    snowDensity: 0.3,
    rainColor: '#39ff14',
    snowColor: '#ffd700',
    text: 'Merry Christmas',
    rippleShape: 'heart',
    rippleSize: 20,
    rippleLife: 0.02,
    fallingText: '🎁,🌹,🍬,❤️,Love,平安',
    fallingSpeed: 1.0,
    fallingDensity: 0.2,
    fallingSize: 20,
    bgValue: '#0a0f1e',
    bgConfig: createBgConfigWithOverlay({ type: 'color', value: '#0a0f1e' }, 0),
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const rainSnowRippleConfigMetadata = {
    panelTitle: '雨雪涟漪配置',
    panelSubtitle: 'Design Your Rain and Snow Ripple Effect',
    configSchema: {
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景氛围',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '播放音效' },

        text: { category: 'content' as const, label: '中心标题', type: 'input' as const },
        fallingText: { category: 'content' as const, label: '飘落内容', type: 'textarea' as const, placeholder: '输入Emoji或文字，用逗号分开' },

        rainSpeed: { category: 'visual' as const, label: '雨丝速度', type: 'slider' as const, min: 0.1, max: 4, step: 0.1 },
        snowDensity: { category: 'visual' as const, label: '雪花密度', type: 'slider' as const, min: 0, max: 1, step: 0.05 },
        rainColor: { category: 'visual' as const, label: '雨丝主色', type: 'color' as const },
        snowColor: { category: 'visual' as const, label: '雪花颜色', type: 'color' as const },

        fallingDensity: { category: 'visual' as const, label: '礼物密度', type: 'slider' as const, min: 0, max: 1, step: 0.05 },
        fallingSpeed: { category: 'visual' as const, label: '礼物速度', type: 'slider' as const, min: 0.5, max: 3, step: 0.1 },
        fallingSize: { category: 'visual' as const, label: '礼物大小', type: 'slider' as const, min: 12, max: 40, step: 1 },

        rippleShape: {
            category: 'visual' as const,
            label: '涟漪形状',
            type: 'select' as const,
            options: [
                { label: '浪漫涟漪 (圆)', value: 'circle' },
                { label: '爱的火花 (心)', value: 'heart' },
                { label: '璀璨星光 (星)', value: 'star' },
            ]
        },
        rippleSize: { category: 'visual' as const, label: '涟漪大小', type: 'slider' as const, min: 5, max: 50, step: 1 },
        rippleLife: { category: 'visual' as const, label: '消失速度', type: 'slider' as const, min: 0.01, max: 0.1, step: 0.005 },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '场景', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '定制内容', fields: ['text' as const, 'fallingText' as const] },
        { id: 2, label: '场景氛围', fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
        { id: 3, label: '雨雪调整', fields: ['rainSpeed' as const, 'snowDensity' as const, 'rainColor' as const, 'snowColor' as const] },
        { id: 4, label: '细节微调', fields: ['fallingDensity' as const, 'rippleShape' as const, 'rippleSize' as const] },
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
    ctx.stroke();
    ctx.restore();
}

export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;
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
    ctx.stroke();
    ctx.restore();
}

export function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}
