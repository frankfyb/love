/**
 * ==============================================================================
 * reasons-to-love 配置文件
 * 爱你的52个理由 - 心形文字特效
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    centerText: string;
    reasons: string[];
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
    textColor: string;
    glowColor: string;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('newyear-countdown'),
    music: [
        { label: 'Romantic Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Emotional', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
    defaultReasons: [
        "1.温柔", "2.善良", "3.大方", "4.美丽", "5.可爱", "6.迷人", "7.知心", "8.杰出", "9.多才", "10.多艺",
        "11.贴心", "12.大度", "13.光彩", "14.朝气", "15.甜美", "16.漂亮", "17.安静", "18.幽默", "19.听话", "20.节俭",
        "21.学霸", "22.礼貌", "23.助人", "24.温和", "25.大气", "26.苗条", "27.粘人", "28.从容", "29.动人", "30.浪漫",
        "31.单纯", "32.质朴", "33.爱我", "34.孝顺", "35.胆大", "36.豪爽", "37.优雅", "38.好贵", "39.有钱", "40.光亮",
        "41.积极", "42.向上", "43.乐观", "44.开朗", "45.健康", "46.活力", "47.朴素", "48.性感", "49.爱笑", "50.唯一",
        "51.懂我", "52.是你"
    ]
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    centerText: '520爱你的52个理由',
    reasons: PRESETS.defaultReasons,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0.0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
    textColor: '#ffffff',
    glowColor: '#ffba75',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const reasonsToLoveConfigMetadata = {
    panelTitle: '爱你的理由心形特效',
    panelSubtitle: '52 Reasons to Love You',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '520爱你的52个理由' },
        reasons: {
            category: 'content' as const,
            type: 'list' as const,
            label: '理由列表',
            placeholder: '输入理由，如：1.温柔',
            description: '将会排列成心形'
        },

        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景风格',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择背景氛围'
        },

        textColor: { category: 'visual' as const, type: 'color' as const, label: '文字颜色' },
        glowColor: { category: 'visual' as const, type: 'color' as const, label: '光晕颜色' },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '中心文字', icon: null, fields: ['centerText' as const, 'textColor' as const] },
        { id: 2, label: '理由编辑', icon: null, fields: ['reasons' as const] },
        { id: 3, label: '氛围设置', icon: null, fields: ['bgValue' as const, 'bgMusicUrl' as const] },
    ],
};

// ============================================================================
// 发光粒子类
// ============================================================================

export class GlowParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    hue: number;
    alpha: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = Math.random() * 100 + 50;
        this.size = Math.random() * 2 + 0.5;
        this.hue = 30 + Math.random() * 30;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = Math.max(0, this.life / 150);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
        ctx.fill();
    }
}
