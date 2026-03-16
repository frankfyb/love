'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/ui/AudioControlPanel';
import { BackgroundRenderer } from '@/components/ui/BackgroundRenderer';
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
 * 核心展示组件 (DisplayUI) - 浪漫优化版
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

  // ========== 主渲染逻辑 ==========
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // 立即获取初始尺寸
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 标记是否需要重新分布飘落物
    let needsRedistribute = false;

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctxLocal = canvas.getContext('2d');
      if (ctxLocal) ctxLocal.scale(dpr, dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    setupCanvas();

    const handleResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      setupCanvas();
      needsRedistribute = true;
    };

    window.addEventListener('resize', handleResize);

    // ========== 浪漫涟漪类 ==========
    class Ripple {
      x: number;
      y: number;
      size: number;
      opacity: number;
      shape: RippleShape;
      color: string;

      constructor(x: number, y: number, shape?: RippleShape, color?: string) {
        this.x = x;
        this.y = y;
        this.size = 1;
        this.opacity = 1;
        // 处理随机形状
        const baseShape = shape || config.rippleShape;
        if (baseShape === 'random') {
          const shapes: RippleShape[] = ['circle', 'heart', 'star'];
          this.shape = shapes[Math.floor(Math.random() * shapes.length)];
        } else {
          this.shape = baseShape;
        }
        this.color = color || config.rainColor;
      }

      update() {
        this.size += 0.8;
        this.opacity -= config.rippleLife;
      }

      draw() {
        if (!ctx || this.opacity <= 0) return;
        const rgb = hexToRgb(this.color);
        ctx.strokeStyle = `rgba(${rgb}, ${this.opacity * 0.8})`;
        ctx.fillStyle = `rgba(${rgb}, ${this.opacity * 0.15})`;
        ctx.lineWidth = 2;
        const s = Math.min(this.size, config.rippleSize);

        if (this.shape === 'heart') {
          drawHeart(ctx, this.x, this.y - s / 2, s);
        } else if (this.shape === 'star') {
          drawStar(ctx, this.x, this.y, s * 0.6);
        } else {
          ctx.beginPath();
          ctx.ellipse(this.x, this.y, s, s * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    let ripples: Ripple[] = [];

    // ========== 浪漫雨滴类 ==========
    class RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.length = Math.random() * 25 + 15;
        this.speed = Math.random() * 4 + 6;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        gradient.addColorStop(0, `rgba(${hexToRgb(config.rainColor)}, 0)`);
        gradient.addColorStop(0.5, `rgba(${hexToRgb(config.rainColor)}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${hexToRgb(config.rainColor)}, ${this.opacity * 0.8})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }

      update() {
        this.y += this.speed * config.rainSpeed;
        if (this.y > height) {
          ripples.push(new Ripple(this.x, height - 5));
          this.y = -this.length - Math.random() * 100;
          this.x = Math.random() * width;
        }
      }
    }

    // ========== 梦幻雪花类 ==========
    class SnowFlake {
      x: number;
      y: number;
      radius: number;
      speed: number;
      wind: number;
      offset: number;
      opacity: number;
      twinkle: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 4 + 2;
        this.speed = Math.random() * 0.8 + 0.3;
        this.wind = (Math.random() - 0.5) * 0.5;
        this.offset = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.twinkle = Math.random() * 0.02 + 0.01;
      }

      draw() {
        if (!ctx) return;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        glow.addColorStop(0, `rgba(${hexToRgb(config.snowColor)}, ${this.opacity})`);
        glow.addColorStop(0.4, `rgba(${hexToRgb(config.snowColor)}, ${this.opacity * 0.5})`);
        glow.addColorStop(1, `rgba(${hexToRgb(config.snowColor)}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${hexToRgb(config.snowColor)}, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      update(time: number) {
        this.y += this.speed;
        this.x += Math.sin(time * 0.001 + this.offset) * 0.5 + this.wind;
        this.opacity = 0.4 + Math.sin(time * this.twinkle + this.offset) * 0.3;

        if (this.y > height + 10) {
          this.y = -10;
          this.x = Math.random() * width;
        }
        if (this.x > width + 10) this.x = -10;
        if (this.x < -10) this.x = width + 10;
      }
    }

    // ========== 浪漫飘落物类（修复漂移问题） ==========
    class FallingItem {
      x: number;
      y: number;
      baseX: number;
      content: string;
      speed: number;
      size: number;
      swingAmplitude: number;
      swingSpeed: number;
      swingOffset: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;

      constructor(options: string[]) {
        this.swingOffset = Math.random() * Math.PI * 2;
        this.swingSpeed = Math.random() * 0.002 + 0.001;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.015;
        this.opacity = 0;
        this.x = 0;
        this.y = 0;
        this.baseX = 0;
        this.content = '';
        this.speed = 0;
        this.size = 0;
        this.swingAmplitude = 0;
        this.reset(options, true);
      }

      reset(options: string[], initial = false) {
        this.baseX = Math.random() * width;
        this.x = this.baseX;
        this.y = initial ? Math.random() * height : -60 - Math.random() * 100;
        this.content = options[Math.floor(Math.random() * options.length)] || '💕';
        this.speed = (Math.random() * 0.5 + 0.5) * config.fallingSpeed;
        this.size = config.fallingSize * (Math.random() * 0.4 + 0.8);
        this.swingAmplitude = Math.random() * 30 + 15;
        this.swingOffset = Math.random() * Math.PI * 2;
        this.opacity = initial ? Math.random() * 0.5 + 0.5 : 0;
      }

      update(options: string[], time: number) {
        this.y += this.speed;
        // 围绕baseX做正弦摆动，不会累积漂移
        this.x = this.baseX + Math.sin(time * this.swingSpeed + this.swingOffset) * this.swingAmplitude;
        this.rotation += this.rotationSpeed;

        if (this.opacity < 1) this.opacity = Math.min(1, this.opacity + 0.015);

        if (this.y > height + 80) {
          this.reset(options);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 182, 193, 0.6)';

        ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.content, 0, 0);

        ctx.restore();
      }
    }

    // ========== 点击爱心粒子爆发类（优化丝滑版） ==========
    class LoveParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      content: string;
      rotation: number;
      rotationSpeed: number;
      scale: number;
      trail: { x: number; y: number; alpha: number }[];

      constructor(x: number, y: number, burst = false) {
        this.x = x;
        this.y = y;
        // 更自然的爆发角度分布（向上偏移）
        const angle = burst
          ? (Math.random() * Math.PI * 0.8 - Math.PI * 0.9) // 向上扇形
          : (Math.random() * Math.PI * 2);
        const speed = burst
          ? (Math.random() * 6 + 3) // 爆发更有力
          : (Math.random() * 3 + 1);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.maxLife = 80 + Math.random() * 60;
        this.life = this.maxLife;
        this.size = Math.random() * 18 + 14;
        this.color = ['#ff6b9d', '#ff9eb5', '#ffc0cb', '#ffb6c1', '#ff69b4', '#f472b6'][Math.floor(Math.random() * 6)];
        this.content = ['💕', '💗', '💖', '💘', '❤️', '✨', '🌸', '💝'][Math.floor(Math.random() * 8)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.scale = 1;
        this.trail = [];
      }

      update() {
        // 保存轨迹点
        if (this.life > this.maxLife * 0.3) {
          this.trail.push({ x: this.x, y: this.y, alpha: this.life / this.maxLife * 0.3 });
          if (this.trail.length > 5) this.trail.shift();
        }

        // 更丝滑的物理效果
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // 更轻柔的重力
        this.vx *= 0.985; // 更缓慢的减速
        this.vy *= 0.99;
        this.rotation += this.rotationSpeed;
        this.rotationSpeed *= 0.98;

        // 缓动缩放
        const lifeRatio = this.life / this.maxLife;
        this.scale = lifeRatio < 0.3
          ? lifeRatio / 0.3 // 淡出时缩小
          : Math.min(1, (this.maxLife - this.life) / 10 + 0.5); // 淡入时放大

        this.life--;
      }

      draw() {
        if (!ctx || this.life <= 0) return;
        const alpha = Math.pow(this.life / this.maxLife, 0.7); // 非线性透明度过渡

        // 绘制轨迹
        this.trail.forEach((point, i) => {
          ctx.save();
          ctx.globalAlpha = point.alpha * alpha * 0.5;
          ctx.font = `${this.size * 0.4}px "Segoe UI Emoji"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.content, point.x, point.y);
          ctx.restore();
        });

        // 绘制主体
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = alpha;

        // 多层光晕
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.content, 0, 0);

        // 额外光晕层
        ctx.shadowBlur = 40;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillText(this.content, 0, 0);

        ctx.restore();
      }
    }

    let loveParticles: LoveParticle[] = [];

    const rainDrops: RainDrop[] = Array.from({ length: 120 }, () => new RainDrop());
    const snowFlakes: SnowFlake[] = Array.from({ length: 150 }, () => new SnowFlake());
    const fallingOptions = config.fallingText || [];
    const maxFallingItems = 40;
    const fallingItems: FallingItem[] = Array.from({ length: maxFallingItems }, () => new FallingItem(fallingOptions));

    let startTime = Date.now();

    // 点击事件处理（优化版）
    const handleCanvasClick = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;
      if (e instanceof TouchEvent) {
        clientX = e.touches[0]?.clientX || 0;
        clientY = e.touches[0]?.clientY || 0;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 生成爱心粒子爆发（使用burst模式）
      for (let i = 0; i < 15; i++) {
        loveParticles.push(new LoveParticle(x, y, true));
      }

      // 同时生成一个涟漪
      ripples.push(new Ripple(x, y));
    };

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasClick);

    const render = () => {
      const time = Date.now() - startTime;

      // 如果窗口大小改变，重新分布所有飘落物
      if (needsRedistribute) {
        fallingItems.forEach(item => {
          item.baseX = Math.random() * width;
          item.x = item.baseX;
        });
        snowFlakes.forEach(flake => {
          flake.x = Math.random() * width;
        });
        rainDrops.forEach(drop => {
          drop.x = Math.random() * width;
        });
        needsRedistribute = false;
      }

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      ripples = ripples.filter(r => r.opacity > 0);
      ripples.forEach(r => { r.update(); r.draw(); });

      if (config.rainSpeed > 0) {
        rainDrops.forEach(d => { d.update(); d.draw(); });
      }

      const activeSnow = Math.floor(snowFlakes.length * config.snowDensity);
      for (let i = 0; i < activeSnow; i++) {
        snowFlakes[i].update(time);
        snowFlakes[i].draw();
      }

      if (fallingOptions.length > 0) {
        const activeFalling = Math.floor(maxFallingItems * config.fallingDensity);
        for (let i = 0; i < activeFalling; i++) {
          fallingItems[i].update(fallingOptions, time);
          fallingItems[i].draw();
        }
      }

      loveParticles = loveParticles.filter(p => p.life > 0);
      loveParticles.forEach(p => { p.update(); p.draw(); });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchstart', handleCanvasClick);
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden bg-black select-none"
    >
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000">
        <BackgroundRenderer config={effectiveBgConfig} />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.6)] pointer-events-none" />
      </div>

      {/* 2. Canvas 层 - 可交互 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block cursor-pointer"
        style={{ width: '100%', height: '100%' }}
      />

      {/* 3. 交互提示 */}
      <div className="absolute bottom-32 left-0 right-0 z-15 flex justify-center pointer-events-none">
        <div className="text-white/30 text-xs tracking-widest animate-pulse">
          点击屏幕 · 绽放爱意
        </div>
      </div>

      {/* 4. 文字内容层 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-6">
        <div className="flex flex-col items-center animate-fade-in-up">
          <span className="text-white/40 text-sm md:text-base tracking-[0.5em] mb-4 uppercase translate-y-2 opacity-0 animate-slide-in-slow">
            Eternal Memory
          </span>
          <h1
            className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-[0.2em] text-white text-center transition-all duration-1000"
            style={{
              textShadow: `0 0 60px ${config.rainColor}40, 0 0 30px ${config.rainColor}30, 0 0 10px rgba(255,255,255,0.5)`,
              fontFamily: '"Cinzel", "Times New Roman", serif'
            }}
          >
            {config.text || '思念如雨'}
          </h1>
          <div className="mt-8 flex items-center gap-4 opacity-0 animate-fade-in-delayed">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </div>

      {/* 5. 音效控制面板 */}
      <AudioControlPanel
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onToggleMute={handleToggleMute}
        enabled={config.enableSound}
        position="bottom-right"
        className="mb-10 mr-6 md:mb-6 md:mr-6 rounded-full shadow-2xl backdrop-blur-md bg-white/5 border border-white/10"
      />

      <style jsx global>{`
        @keyframes fade-in-up {
           0% { opacity: 0; transform: translateY(30px); }
           100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-slow {
           0% { opacity: 0; transform: translateY(10px); }
           100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
           0% { opacity: 0; }
           100% { opacity: 1; }
        }
        .animate-fade-in-up {
           animation: fade-in-up 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-slide-in-slow {
           animation: slide-in-slow 2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards;
        }
        .animate-fade-in-delayed {
           animation: fade-in-delayed 2.5s ease-out 1.2s forwards;
        }
      `}</style>
    </div>
  );
}