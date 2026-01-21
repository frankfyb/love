/**
 * ==============================================================================
 * galaxy-weaver 配置文件
 * 银河工坊 - 交互式星空效果
 * ==============================================================================
 */

import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import { createBgConfigWithOverlay } from '@/utils/background-parser';
import type { StandardBgConfig } from '@/types/background';

// ============================================================================
// 配置类型定义
// ============================================================================

export interface AppConfig {
    starCount: number;
    galaxyColor: string;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    basePulseSpeed: number;
    activePulseSpeed: number;
    enableSound: boolean;
    bgMusicUrl: string;
    name1: string;
    name2: string;
    centerText: string;
    showDoubleStar: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: [
        { type: 'color', value: 'linear-gradient(to bottom, #020024, #090979, #000000)', label: '深空蓝 (默认)' },
        { type: 'color', value: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)', label: '午夜紫' },
        { type: 'color', value: 'linear-gradient(to bottom, #1a0b0b, #4a192c, #1a0b0b)', label: '星云红' },
        ...GLOBAL_BG_PRESETS.getToolPresets('galaxy-weaver'),
    ],
    music: [
        { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: 'Ambient Space', value: 'https://cdn.pixabay.com/audio/2022/05/16/audio_db65dadf58.mp3' },
        { label: 'Deep Meditation', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_346b9a840e.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    starCount: 1500,
    galaxyColor: '#a0c4ff',
    bgValue: 'linear-gradient(to bottom, #020024, #090979, #000000)',
    bgConfig: createBgConfigWithOverlay({
        type: 'color',
        value: 'linear-gradient(to bottom, #020024, #090979, #000000)'
    }, 0),
    basePulseSpeed: 1.0,
    activePulseSpeed: 4.0,
    enableSound: true,
    bgMusicUrl: PRESETS.music[0].value,
    name1: 'Orion',
    name2: 'Artemis',
    centerText: '按住屏幕，感受宇宙的脉动',
    showDoubleStar: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const galaxyWeaverConfigMetadata = {
    panelTitle: '银河工坊',
    panelSubtitle: 'Galaxy Weaver',
    tabs: [
        { id: "visual" as const, label: '视觉', icon: null },
        { id: "content" as const, label: '内容', icon: null },
        { id: "scene" as const, label: '场景', icon: null },
    ],
    configSchema: {
        bgValue: {
            category: 'scene' as const,
            type: 'media-grid' as const,
            label: '宇宙氛围',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择星空背景'
        },
        bgMusicUrl: {
            category: 'scene' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: {
            category: 'scene' as const,
            type: 'switch' as const,
            label: '启用音效'
        },
        basePulseSpeed: {
            label: '静息心率',
            type: 'slider' as const,
            min: 0.5, max: 3.0, step: 0.1,
            category: 'scene' as const,
        },
        activePulseSpeed: {
            label: '激动心率',
            type: 'slider' as const,
            min: 2.0, max: 10.0, step: 0.5,
            category: 'scene' as const,
        },
        galaxyColor: {
            label: '星光色调',
            type: 'color' as const,
            category: 'visual' as const,
        },
        starCount: {
            label: '繁星数量',
            type: 'slider' as const,
            min: 500, max: 3000, step: 100,
            category: 'visual' as const,
        },
        name1: {
            label: '名字 A',
            type: 'input' as const,
            category: 'content' as const,
        },
        name2: {
            label: '名字 B',
            type: 'input' as const,
            category: 'content' as const,
        },
        centerText: {
            label: '引导文案',
            type: 'input' as const,
            category: 'content' as const,
        },
        showDoubleStar: {
            label: '显示双星环绕',
            type: 'switch' as const,
            category: 'content' as const,
        },
    },
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['name1' as const, 'name2' as const, 'centerText' as const] },
        { id: 2, label: '宇宙场景', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
        { id: 3, label: '星河调整', icon: null, fields: ['starCount' as const, 'galaxyColor' as const] },
    ],
};

// ============================================================================
// 音效素材
// ============================================================================

export const AUDIO_SOURCES = {
    charge: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift2.mp3',
    ],
    connect: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
    ],
};

// ============================================================================
// 星星类型定义
// ============================================================================

export interface Star {
    x: number;
    y: number;
    z: number;
    size: number;
    baseAlpha: number;
    blinkOffset: number;
    vx: number;
    vy: number;
    targetX?: number;
    targetY?: number;
}

// ============================================================================
// 工具函数
// ============================================================================

export const random = (min: number, max: number) => Math.random() * (max - min) + min;

// 心形轨迹计算
export function getHeartPosition(index: number, total: number, width: number, height: number, scale: number) {
    const t = (index / total) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale
    };
}

// 初始化星星
export function initStars(width: number, height: number, count: number): Star[] {
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2,
            size: Math.random() * 2 + 0.5,
            baseAlpha: Math.random() * 0.5 + 0.3,
            blinkOffset: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
        });
    }
    return stars;
}

// ============================================================================
// 音效管理器
// ============================================================================

export class SoundManager {
    private pools: { [key: string]: HTMLAudioElement[] } = {};
    private cursors: { [key: string]: number } = {};
    private enabled: boolean = true;

    constructor() {
        if (typeof window === 'undefined') return;
        this.initPool('charge', AUDIO_SOURCES.charge, 4);
        this.initPool('connect', AUDIO_SOURCES.connect, 4);
    }

    private initPool(category: string, urls: string[], count: number) {
        this.pools[category] = [];
        this.cursors[category] = 0;
        for (let i = 0; i < count; i++) {
            const url = urls[i % urls.length];
            const audio = new Audio(url);
            audio.preload = 'auto';
            if (category === 'charge') audio.volume = 0.2;
            if (category === 'connect') audio.volume = 0.3;
            this.pools[category].push(audio);
        }
    }

    public play(category: 'charge' | 'connect') {
        if (!this.enabled || !this.pools[category]) return;
        const pool = this.pools[category];
        const cursor = this.cursors[category];
        const audio = pool[cursor];
        if (!audio) return;

        if (!audio.paused) audio.currentTime = 0;

        const baseVol = category === 'charge' ? 0.2 : 0.3;
        audio.volume = Math.max(0, Math.min(1, baseVol + random(-0.05, 0.05)));
        audio.playbackRate = category === 'charge' ? random(0.9, 1.1) : random(0.8, 1.0);

        audio.play().catch(() => { });
        this.cursors[category] = (cursor + 1) % pool.length;
    }

    public setEnabled(enable: boolean) {
        this.enabled = enable;
    }
}
