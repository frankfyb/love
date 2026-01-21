/**
 * ==============================================================================
 * christmas-tree-card 配置文件
 * 圣诞树贺卡
 * ==============================================================================
 */

// ============================================================================
// 配置类型定义
// ============================================================================

export type BgType = 'image' | 'video' | 'color';

export interface DecorationItem {
    id: string;
    type: 'emoji' | 'image';
    content: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export interface AppConfig {
    particleCount: number;
    particleSize: number;
    particleSpeed: number;
    particleColor: string;
    glassBlur: number;
    glassOpacity: number;
    bgValue: string;
    enableSnow: boolean;
    bgMusicUrl: string;
    clickSoundUrl: string;
    enableSound: boolean;
    decorationPicker: any;
    capsuleText: string;
    treeTextLevels: string;
    treeBottomLetters: string;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: [
        { label: '飘雪视频', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/20471-309698211.mp4', type: 'video' },
        { label: '温馨壁炉', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/23881-337972830_small.mp4', type: 'video' },
        { label: '梦幻雪夜', value: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?q=80&w=2574&auto=format&fit=crop', type: 'image' },
        { label: '复古红绿', value: '#0f392b', type: 'color' },
        { label: '午夜深蓝', value: '#0f172a', type: 'color' },
    ],
    music: [
        { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: 'Jingle Bells (Upbeat)', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' }
    ],
    clickSounds: [
        { label: '清脆铃声', value: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3' },
        { label: '气泡音', value: 'https://cdn.pixabay.com/audio/2024/08/04/audio_245277864b.mp3' },
        { label: '魔法音效', value: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c29d0c6f5d.mp3' },
    ],
    stickers: [
        { label: '圣诞袜', value: '🧦', type: 'emoji' },
        { label: '圣诞树', value: '🎄', type: 'emoji' },
        { label: '礼物盒', value: '🎁', type: 'emoji' },
        { label: '圣诞老人', value: '🎅', type: 'emoji' },
        { label: '麋鹿', value: '🦌', type: 'emoji' },
        { label: '姜饼人', value: '🍪', type: 'emoji' },
        { label: '铃铛', value: '🔔', type: 'emoji' },
        { label: '雪人', value: '⛄', type: 'emoji' },
    ]
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    particleCount: 100,
    particleSize: 3,
    particleSpeed: 1,
    particleColor: '#FFD700',
    glassBlur: 12,
    glassOpacity: 0.85,
    bgValue: '#0f172a',
    enableSnow: true,
    bgMusicUrl: PRESETS.music[0].value,
    clickSoundUrl: PRESETS.clickSounds[0].value,
    enableSound: true,
    decorationPicker: null,
    capsuleText: '我的正每天快乐',
    treeTextLevels: '圣→诞→圣诞→快乐→圣诞快乐→圣诞快乐→圣诞快乐快乐→圣诞快乐快乐→圣诞快乐圣诞快乐→圣诞快乐圣诞快乐',
    treeBottomLetters: 'L/H/J/C/Y/E',
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const christmasTreeCardConfigMetadata = {
    panelTitle: '圣诞树贺卡配置',
    panelSubtitle: 'Design Your Christmas Tree Card',
    configSchema: {
        particleColor: { category: 'visual' as const, type: 'color' as const, label: '主题点缀色' },
        particleCount: { category: 'visual' as const, type: 'slider' as const, label: '氛围粒子密度', min: 20, max: 300, step: 10 },
        particleSize: { category: 'visual' as const, type: 'slider' as const, label: '粒子尺寸', min: 1, max: 6, step: 0.5 },
        particleSpeed: { category: 'visual' as const, type: 'slider' as const, label: '粒子速度', min: 0.1, max: 3, step: 0.1 },
        glassBlur: { category: 'visual' as const, type: 'slider' as const, label: '卡片磨砂程度', min: 0, max: 24, step: 1 },
        glassOpacity: { category: 'visual' as const, type: 'slider' as const, label: '卡片透明度', min: 0.1, max: 1, step: 0.05 },
        enableSnow: { category: 'background' as const, type: 'switch' as const, label: '开启粒子雪花' },
        bgValue: { category: 'background' as const, type: 'media-grid' as const, label: '背景场景', mediaType: 'background' as const, defaultItems: PRESETS.backgrounds },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
        bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
        capsuleText: { category: 'content' as const, type: 'input' as const, label: '一键祝福', placeholder: '替换"圣诞快乐"' },
        treeTextLevels: { category: 'content' as const, type: 'textarea' as const, label: '树体文案 (→分隔)' },
        treeBottomLetters: { category: 'content' as const, type: 'input' as const, label: '树干字母 (/分隔)' },
    },
    tabs: [
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
        { id: 'content' as const, label: '内容', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '基础', icon: null, fields: ['bgValue' as const, 'enableSnow' as const] },
        { id: 2, label: '样式', icon: null, fields: ['particleCount' as const, 'particleColor' as const, 'glassBlur' as const] },
        { id: 3, label: '内容', icon: null, fields: ['capsuleText' as const, 'treeTextLevels' as const, 'treeBottomLetters' as const] },
    ],
};

// ============================================================================
// 工具函数
// ============================================================================

export function detectBgType(value: string): BgType {
    if (!value) return 'color';
    if (value.startsWith('#') || value.startsWith('rgb')) return 'color';
    if (value.endsWith('.mp4') || value.endsWith('.webm')) return 'video';
    if (value.includes('video') || value.includes('mixkit')) return 'video';
    return 'image';
}

export function playFallbackSound() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.error("Web Audio API fallback also failed", e);
    }
}
