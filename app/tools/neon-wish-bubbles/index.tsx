'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和类
import {
  AppConfig,
  DEFAULT_CONFIG,
  PRESETS,
  HeartParticle,
  FloatingText,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { neonWishBubblesConfigMetadata } from './config';

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen?: boolean;
  onConfigChange?: (key: string, value: any) => void;
}

export const DisplayUI: React.FC<DisplayUIProps> = ({ config, isPanelOpen }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const textsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<HeartParticle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);

  // 拆分文字池
  const textPool = useMemo(() => {
    if (Array.isArray(config.wishTexts)) {
      return config.wishTexts.filter(t => t.trim() !== '');
    }
    if (typeof config.wishTexts === 'string') {
      return (config.wishTexts as string).split('|').filter((t: string) => t.trim() !== '');
    }
    return [];
  }, [config.wishTexts]);

  // 使用音效 Hook
  const {
    isPlaying,
    isMuted,
    handlePlayPause: toggleMusic,
    handleToggleMute: toggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.5,
  });

  // 获取有效的背景配置
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) {
      return parseBgValueToConfig(config.bgValue);
    }
    if (config.bgConfig) {
      return config.bgConfig;
    }
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

  // 初始化画布与动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = containerRef.current;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // 初始化背景文字
    const initBackgroundTexts = () => {
      const currentBgCount = textsRef.current.filter(t => !t.isInteractive).length;
      const diff = config.textDensity - currentBgCount;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          const text = textPool[Math.floor(Math.random() * textPool.length)];
          const t = new FloatingText(width, height, text, config, false);
          t.y = Math.random() * height;
          textsRef.current.push(t);
        }
      } else if (diff < 0) {
        let removeCount = Math.abs(diff);
        textsRef.current = textsRef.current.filter(t => {
          if (!t.isInteractive && removeCount > 0) {
            removeCount--;
            return false;
          }
          return true;
        });
      }
    };

    initBackgroundTexts();

    // 动画循环
    const animate = () => {
      timeRef.current += 1;
      ctx.clearRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = textsRef.current.length - 1; i >= 0; i--) {
        const t = textsRef.current[i];

        t.update(height, timeRef.current);

        if (t.isInteractive) {
          if (t.isDead(height)) {
            textsRef.current.splice(i, 1);
            continue;
          }
        } else {
          if (t.y < -t.fontSize) {
            t.y = height + t.fontSize + Math.random() * 100;
            t.baseX = Math.random() * width;
            t.text = textPool[Math.floor(Math.random() * textPool.length)];
          }
        }

        // 生成拖尾粒子
        if (timeRef.current % (6 - Math.min(5, config.particleCount)) === 0) {
          particlesRef.current.push(new HeartParticle(t.x, t.y + t.fontSize / 2, '#fbcfe8'));
        }

        // 绘制霓虹文字
        ctx.save();
        ctx.globalAlpha = t.opacity;
        ctx.font = `bold ${t.fontSize}px sans-serif`;

        ctx.shadowColor = '#ff7eb3';
        ctx.shadowBlur = config.glowIntensity * 1.2;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.strokeText(t.text, t.x, t.y);

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillText(t.text, t.x, t.y);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeText(t.text, t.x, t.y);

        ctx.restore();
      }

      // 绘制和更新粒子
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config, textPool]);

  // 点击生成气泡
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const parent = containerRef.current;
    if (!parent) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = parent.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const text = textPool[Math.floor(Math.random() * textPool.length)];
    const newWish = new FloatingText(rect.width, rect.height, text, config, true, x, y);
    newWish.fontSize = Math.min(newWish.fontSize * 1.2, config.maxFontSize * 1.2);

    textsRef.current.push(newWish);

    for (let i = 0; i < 8; i++) {
      particlesRef.current.push(new HeartParticle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, '#fff'));
    }
  }, [config, textPool]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* 2. Canvas 层 */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full block pointer-events-auto cursor-pointer touch-none z-10"
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      />

      {/* 3. 提示文案 */}
      <div className="absolute bottom-8 w-full text-center pointer-events-none z-20">
        <p className="text-white/70 text-sm font-light tracking-widest" style={{ textShadow: '0 0 10px rgba(255,192,203, 0.5)' }}>
          点 击 屏 幕 · 许 下 心 愿
        </p>
      </div>

      {/* 4. 音效控制面板 */}
      <AudioControlPanel
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={toggleMusic}
        onToggleMute={toggleMute}
        enabled={config.enableSound}
        position="bottom-right"
        size="sm"
      />
    </div>
  );
};

export default function NeonWishBubblesPage() {
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  return <DisplayUI config={config} />;
}
