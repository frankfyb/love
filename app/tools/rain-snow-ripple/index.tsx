'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和工具函数
import {
  AppConfig,
  RippleShape,
  DEFAULT_CONFIG,
  PRESETS,
  drawHeart,
  drawStar,
  hexToRgb,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig, RippleShape };
export { DEFAULT_CONFIG, PRESETS };
export { rainSnowRippleConfigMetadata } from './config';

/**
 * ==============================================================================
 * 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

export default function RainSnowRippleDisplayUI({ config }: { config: AppConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    const handleResize = () => {
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

    // 实体类定义
    class Ripple {
      x: number;
      y: number;
      size: number;
      opacity: number;
      shape: RippleShape;
      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.size = 1; this.opacity = 1; this.shape = config.rippleShape;
      }
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
      constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.length = Math.random() * 20 + 10; this.speed = (Math.random() * 5 + 5);
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath(); ctx.strokeStyle = config.rainColor; ctx.lineWidth = 1; ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length); ctx.stroke();
      }
      update() {
        this.y += this.speed * config.rainSpeed;
        if (this.y > height) { ripples.push(new Ripple(this.x, height - 5)); this.y = -this.length; this.x = Math.random() * width; }
      }
    }

    class SnowFlake {
      x: number; y: number; radius: number; speed: number; wind: number; offset: number;
      constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.radius = Math.random() * 3 + 1; this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 2 - 1; this.offset = Math.random() * 100;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath(); ctx.fillStyle = config.snowColor; ctx.shadowBlur = 5; ctx.shadowColor = config.snowColor;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
      update() {
        this.y += this.speed; this.x += Math.sin((this.y + this.offset) * 0.01) + this.wind * 0.5;
        if (this.y > height) { this.y = -5; this.x = Math.random() * width; }
        if (this.x > width) this.x = 0; if (this.x < 0) this.x = width;
      }
    }

    class FallingItem {
      x!: number; y!: number; content!: string; speed!: number; size!: number; swing!: number; swingOffset!: number;
      constructor(options: string[]) { this.swingOffset = Math.random() * 100; this.reset(options, true); }
      reset(options: string[], initial = false) {
        this.x = Math.random() * width; this.y = initial ? Math.random() * height : -50;
        this.content = options[Math.floor(Math.random() * options.length)] || '❤';
        this.speed = (Math.random() * 0.5 + 0.5) * config.fallingSpeed;
        this.size = config.fallingSize * (Math.random() * 0.4 + 0.8); this.swing = Math.random() * 0.5 + 0.2;
      }
      update(options: string[]) {
        this.y += this.speed; this.x += Math.sin(this.y * 0.02 + this.swingOffset) * this.swing;
        if (this.y > height + 50) { this.reset(options); }
      }
      draw() {
        if (!ctx) return;
        ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,255,255,0.5)';
        ctx.fillText(this.content, this.x, this.y); ctx.shadowBlur = 0;
      }
    }

    const rainDrops: RainDrop[] = Array.from({ length: 150 }, () => new RainDrop());
    const snowFlakes: SnowFlake[] = Array.from({ length: 200 }, () => new SnowFlake());
    const fallingOptions = config.fallingText.split(/[，,]+/).map(s => s.trim()).filter(Boolean);
    const maxFallingItems = 50;
    const fallingItems: FallingItem[] = Array.from({ length: maxFallingItems }, () => new FallingItem(fallingOptions));

    const render = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

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