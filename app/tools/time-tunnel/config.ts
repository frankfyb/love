/**
 * ==============================================================================
 * time-tunnel 配置文件
 * 时空隧道工具 - 3D年份穿梭效果
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
    yearRange: { start: number; end: number };
    tunnelSpeed: number;
    textColor: string;
    glowColor: string;
    tunnelDepth: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

// ============================================================================
// 预设配置
// ============================================================================

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('time-tunnel'),
    music: [
        { label: '🌌 时空穿梭', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
        { label: '🚀 科幻氛围', value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
        { label: '✨ 星际漫游', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    ],
};

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_CONFIG: AppConfig = {
    centerText: '穿越时空 遇见你',
    yearRange: { start: 2000, end: 2040 },
    tunnelSpeed: 1,
    textColor: '#ffffff',
    glowColor: '#00ffff',
    tunnelDepth: 100,
    bgConfig: createBgConfigWithOverlay(
        { type: 'color' as const, value: '#000000' },
        0
    ),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// ============================================================================
// 配置面板元数据
// ============================================================================

export const timeTunnelConfigMetadata = {
    panelTitle: '时空隧道配置',
    panelSubtitle: 'Time Tunnel Settings',
    configSchema: {
        centerText: { category: 'content' as const, type: 'input' as const, label: '中心文字', placeholder: '穿越时空 遇见你' },

        tunnelSpeed: { category: 'visual' as const, type: 'slider' as const, label: '旋转速度', min: 0.5, max: 3, step: 0.1 },
        tunnelDepth: { category: 'visual' as const, type: 'slider' as const, label: '隧道深度', min: 50, max: 200, step: 10 },
        textColor: { category: 'visual' as const, type: 'color' as const, label: '数字颜色' },
        glowColor: { category: 'visual' as const, type: 'color' as const, label: '光晕颜色' },

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
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '效果', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['centerText' as const] },
        { id: 2, label: '视觉效果', icon: null, fields: ['tunnelSpeed' as const, 'tunnelDepth' as const, 'textColor' as const, 'glowColor' as const] },
        { id: 3, label: '背景氛围', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    ],
};

// ============================================================================
// 粒子类型定义
// ============================================================================

export interface YearParticle {
    year: number;
    angle: number;
    radius: number;
    z: number;
    speed: number;
    rotationSpeed: number;
    opacity: number;
    size: number;
}

// ============================================================================
// 隧道渲染工具函数
// ============================================================================

export interface TunnelRenderContext {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    config: AppConfig;
}

// 绘制隧道背景（黑洞效果）
export function drawTunnel({ ctx, width, height, centerX, centerY }: TunnelRenderContext) {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.3, 'rgba(10, 10, 30, 0.9)');
    gradient.addColorStop(0.7, 'rgba(20, 20, 50, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// 绘制中心涡旋效果
export function drawVortex({ ctx, centerX, centerY, config }: TunnelRenderContext) {
    const time = Date.now() / 1000;

    // 绘制旋转的光圈
    for (let i = 0; i < 3; i++) {
        const radius = 30 + i * 15;
        const alpha = 0.3 - i * 0.08;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * (0.5 + i * 0.2) * config.tunnelSpeed);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    // 中心发光点
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    glowGradient.addColorStop(0.2, config.glowColor + '88');
    glowGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = glowGradient;
    ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
}

// 绘制年份粒子
export function drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: YearParticle[],
    centerX: number,
    centerY: number,
    config: AppConfig,
    years: number[]
) {
    const maxZ = config.tunnelDepth;

    // 按z轴排序，远的先绘制
    particles.sort((a, b) => b.z - a.z);

    particles.forEach(p => {
        // 更新粒子z位置（向观察者移动）
        p.z -= p.speed * config.tunnelSpeed;
        if (p.z < 0) {
            p.z = maxZ;
            p.angle = Math.random() * Math.PI * 2;
            p.radius = Math.random() * 300 + 50;
            p.year = years[Math.floor(Math.random() * years.length)];
        }

        // 更新旋转角度（螺旋效果）
        p.angle += p.rotationSpeed * config.tunnelSpeed;

        // 计算3D投影
        const perspective = 300 / (p.z + 100);
        const x = centerX + Math.cos(p.angle) * p.radius * perspective;
        const y = centerY + Math.sin(p.angle) * p.radius * perspective;

        // 根据深度计算大小和透明度
        const depthFactor = 1 - p.z / maxZ;
        const size = p.size * perspective * 0.8;
        const opacity = p.opacity * depthFactor * 0.9;

        if (opacity > 0.05 && size > 2) {
            ctx.save();

            // 绘制光晕效果
            ctx.shadowBlur = 15 * depthFactor;
            ctx.shadowColor = config.glowColor;

            // 绘制年份文字
            ctx.font = `bold ${Math.max(8, size)}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = opacity;
            ctx.fillStyle = config.textColor;
            ctx.fillText(p.year.toString(), x, y);

            ctx.restore();
        }
    });
}

// 初始化粒子
export function initParticles(years: number[], tunnelDepth: number): YearParticle[] {
    const particles: YearParticle[] = [];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
        const year = years[Math.floor(Math.random() * years.length)];
        particles.push({
            year,
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 300 + 50,
            z: Math.random() * tunnelDepth,
            speed: 0.5 + Math.random() * 1.5,
            rotationSpeed: 0.002 + Math.random() * 0.005,
            opacity: 0.3 + Math.random() * 0.7,
            size: 12 + Math.random() * 16,
        });
    }

    return particles;
}
