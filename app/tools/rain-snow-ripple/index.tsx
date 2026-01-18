'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type RippleShape = 'circle' | 'heart' | 'star';

export interface AppConfig {
  // 核心视觉
  rainSpeed: number;
  snowDensity: number;
  rainColor: string;
  snowColor: string;
  text: string;
  rippleShape: RippleShape;
  rippleSize: number;
  rippleLife: number;

  // 飘落物配置
  fallingText: string;
  fallingSpeed: number;
  fallingDensity: number;
  fallingSize: number;

  // 场景与音效 (新增)
  bgConfig?: StandardBgConfig;
  bgValue?: string;
  bgMusicUrl: string;
  enableSound: boolean;
}

export const PRESETS = {
  backgrounds: [
    ...GLOBAL_BG_PRESETS.basicColors,
    ...GLOBAL_BG_PRESETS.commonImages,
    // 特定氛围
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

  // 新增默认值
  bgValue: '#0a0f1e',
  bgConfig: createBgConfigWithOverlay({ type: 'color', value: '#0a0f1e' }, 0),
  bgMusicUrl: PRESETS.music[0].value,
  enableSound: true,
};

// 通用配置元数据
export const rainSnowRippleConfigMetadata = {
  panelTitle: '雨雪涟漪配置',
  panelSubtitle: 'Design Your Rain and Snow Ripple Effect',
  configSchema: {
    // 1. 场景设置
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

    // 2. 内容设置
    text: { category: 'content' as const, label: '中心标题', type: 'input' as const },
    fallingText: { category: 'content' as const, label: '飘落内容', type: 'textarea' as const, placeholder: '输入Emoji或文字，用逗号分开' },

    // 3. 视觉-雨/雪
    rainSpeed: { category: 'visual' as const, label: '雨丝速度', type: 'slider' as const, min: 0.1, max: 4, step: 0.1 },
    snowDensity: { category: 'visual' as const, label: '雪花密度', type: 'slider' as const, min: 0, max: 1, step: 0.05 },
    rainColor: { category: 'visual' as const, label: '雨丝主色', type: 'color' as const },
    snowColor: { category: 'visual' as const, label: '雪花颜色', type: 'color' as const },

    // 4. 视觉-礼物/涟漪
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

/**
 * ==============================================================================
 * 2. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

export default function RainSnowRippleDisplayUI({ config }: { config: AppConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化音效控制
  const {
    isPlaying,
    isMuted,
    handlePlayPause,
    handleToggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.4,
  });

  // 解析背景配置
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) return parseBgValueToConfig(config.bgValue);
    if (config.bgConfig) return config.bgConfig;
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // 响应式尺寸调整
    const handleResize = () => {
      // 延迟确保容器布局
      setTimeout(() => {
        if (!container || !canvas) return;
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }, 50);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 绘图辅助函数
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
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
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2;
      let rot = Math.PI / 2 * 3;
      let cx = 0;
      let cy = 0;
      let step = Math.PI / spikes;
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
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    // 实体类定义
    class Ripple {
      x: number;
      y: number;
      size: number;
      opacity: number;
      shape: RippleShape;
      constructor(x: number, y: number) { this.x = x; this.y = y; this.size = 1; this.opacity = 1; this.shape = config.rippleShape; }
      update() { this.size += 0.5; this.opacity -= config.rippleLife; }
      draw() {
        if (!ctx || this.opacity <= 0) return;
        ctx.strokeStyle = `rgba(${hexToRgb(config.rainColor)}, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        const s = Math.min(this.size, config.rippleSize);
        if (this.shape === 'heart') drawHeart(ctx, this.x, this.y - s / 2, s);
        else if (this.shape === 'star') drawStar(ctx, this.x, this.y, s * 0.6);
        else { ctx.beginPath(); ctx.ellipse(this.x, this.y, s, s * 0.3, 0, 0, Math.PI * 2); ctx.stroke(); }
      }
    }

    let ripples: Ripple[] = [];

    class RainDrop {
      x: number; y: number; length: number; speed: number;
      constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.length = Math.random() * 20 + 10; this.speed = (Math.random() * 5 + 5); }
      draw() { if (!ctx) return; ctx.beginPath(); ctx.strokeStyle = config.rainColor; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length); ctx.stroke(); }
      update() { this.y += this.speed * config.rainSpeed; if (this.y > height) { ripples.push(new Ripple(this.x, height - 5)); this.y = -this.length; this.x = Math.random() * width; } }
    }

    class SnowFlake {
      x: number; y: number; radius: number; speed: number; wind: number; offset: number;
      constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.radius = Math.random() * 3 + 1; this.speed = Math.random() * 1 + 0.5; this.wind = Math.random() * 2 - 1; this.offset = Math.random() * 100; }
      draw() { if (!ctx) return; ctx.beginPath(); ctx.fillStyle = config.snowColor; ctx.shadowBlur = 5; ctx.shadowColor = config.snowColor; ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
      update() { this.y += this.speed; this.x += Math.sin((this.y + this.offset) * 0.01) + this.wind * 0.5; if (this.y > height) { this.y = -5; this.x = Math.random() * width; } if (this.x > width) this.x = 0; if (this.x < 0) this.x = width; }
    }

    class FallingItem {
      x!: number; y!: number; content!: string; speed!: number; size!: number; swing!: number; swingOffset!: number;
      constructor(options: string[]) { this.swingOffset = Math.random() * 100; this.reset(options, true); }
      reset(options: string[], initial = false) { this.x = Math.random() * width; this.y = initial ? Math.random() * height : -50; this.content = options[Math.floor(Math.random() * options.length)] || '❤'; this.speed = (Math.random() * 0.5 + 0.5) * config.fallingSpeed; this.size = config.fallingSize * (Math.random() * 0.4 + 0.8); this.swing = Math.random() * 0.5 + 0.2; }
      update(options: string[]) { this.y += this.speed; this.x += Math.sin(this.y * 0.02 + this.swingOffset) * this.swing; if (this.y > height + 50) { this.reset(options); } }
      draw() { if (!ctx) return; ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.fillText(this.content, this.x, this.y); ctx.shadowBlur = 0; }
    }

    const rainDrops: RainDrop[] = Array.from({ length: 150 }, () => new RainDrop());
    const snowFlakes: SnowFlake[] = Array.from({ length: 200 }, () => new SnowFlake());
    const fallingOptions = config.fallingText.split(/[，,]+/).map(s => s.trim()).filter(Boolean);
    const maxFallingItems = 50;
    const fallingItems: FallingItem[] = Array.from({ length: maxFallingItems }, () => new FallingItem(fallingOptions));

    // 渲染循环
    const render = () => {
      // 核心：实现拖尾效果的同时保持背景可见
      // 使用 destination-out 擦除上一帧的一部分，从而露出背景
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 0.1 的透明度意味着保留 90% 的上一帧，形成拖尾
      ctx.fillRect(0, 0, width, height);

      // 切换回正常绘制模式
      ctx.globalCompositeOperation = 'source-over';

      ripples = ripples.filter(r => r.opacity > 0);
      ripples.forEach(r => { r.update(); r.draw(); });

      rainDrops.forEach(d => { d.update(); d.draw(); });

      const activeSnow = Math.floor(snowFlakes.length * config.snowDensity);
      for (let i = 0; i < activeSnow; i++) { snowFlakes[i].update(); snowFlakes[i].draw(); }

      if (fallingOptions.length > 0) {
        const activeFalling = Math.floor(maxFallingItems * config.fallingDensity);
        for (let i = 0; i < activeFalling; i++) { fallingItems[i].update(fallingOptions); fallingItems[i].draw(); }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none"
    >
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* 2. Canvas 层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* 3. 文字内容层 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <h1
          className="text-6xl md:text-8xl font-bold tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] text-center px-4 animate-pulse transition-all duration-500"
          style={{
            textShadow: `0 0 30px ${config.rainColor}`,
            fontFamily: '"Cinzel", serif'
          }}
        >
          {config.text}
        </h1>
      </div>

      {/* 4. 音效控制面板 */}
      <AudioControlPanel
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onToggleMute={handleToggleMute}
        enabled={config.enableSound}
        position="bottom-right"
      />
    </div>
  );
}