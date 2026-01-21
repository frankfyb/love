'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';

// 导入配置和工具函数
import {
  AppConfig,
  DEFAULT_CONFIG,
  PRESETS,
  Star,
  SoundManager,
  initStars,
  getHeartPosition,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { galaxyWeaverConfigMetadata } from './config';

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen?: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const soundManagerRef = useRef<SoundManager | null>(null);

  const [isPressed, setIsPressed] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef(0);
  const pulseIntensityRef = useRef(0);

  // 音效 Hook
  const {
    isPlaying,
    isMuted,
    handlePlayPause: toggleMusic,
    handleToggleMute: toggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.4,
  });

  // 初始化音效管理器
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    soundManagerRef.current.setEnabled(!isMuted && config.enableSound);
  }, []);

  useEffect(() => {
    soundManagerRef.current?.setEnabled(!isMuted && config.enableSound);
  }, [isMuted, config.enableSound]);

  // 背景配置处理
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) {
      return parseBgValueToConfig(config.bgValue);
    }
    if (config.bgConfig) {
      return config.bgConfig;
    }
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    const targetSpeed = isPressed ? config.activePulseSpeed : config.basePulseSpeed;
    const currentSpeed = config.basePulseSpeed + (targetSpeed - config.basePulseSpeed) * pulseIntensityRef.current;
    timeRef.current += 0.01 * currentSpeed;

    const targetIntensity = isPressed ? 1.0 : 0.0;
    pulseIntensityRef.current += (targetIntensity - pulseIntensityRef.current) * 0.05;

    const heartbeat = Math.sin(timeRef.current * 3) * 0.5 + 0.5;
    const galaxyScale = 1 + heartbeat * 0.05 * pulseIntensityRef.current;

    // 绘制星星
    starsRef.current.forEach((star, i) => {
      let currentX = star.x;
      let currentY = star.y;

      if (longPressTriggered) {
        if (!star.targetX || !star.targetY) {
          const pos = getHeartPosition(i, starsRef.current.length, width, height, Math.min(width, height) / 40);
          star.targetX = pos.x + (Math.random() - 0.5) * 20;
          star.targetY = pos.y + (Math.random() - 0.5) * 20;
        }
        star.x += (star.targetX - star.x) * 0.05;
        star.y += (star.targetY! - star.y) * 0.05;
        currentX = star.x;
        currentY = star.y;
      } else {
        star.targetX = undefined;
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        const shake = isPressed ? (Math.random() - 0.5) * 5 : 0;
        const centerX = width / 2;
        const centerY = height / 2;
        currentX = centerX + (star.x - centerX) * galaxyScale + shake;
        currentY = centerY + (star.y - centerY) * galaxyScale + shake;
      }

      const alphaPulse = Math.sin(timeRef.current * 2 + star.blinkOffset) * 0.5 + 0.5;
      const finalAlpha = star.baseAlpha * alphaPulse * (isPressed ? 1.5 : 1);

      ctx.beginPath();
      ctx.fillStyle = config.galaxyColor;
      ctx.globalAlpha = Math.min(finalAlpha, 1);
      ctx.arc(currentX, currentY, star.size * (isPressed ? 1.5 : 1), 0, Math.PI * 2);
      ctx.fill();

      // 连线效果
      if (longPressTriggered && i % 10 === 0) {
        const nextStar = starsRef.current[(i + 10) % starsRef.current.length];
        const dist = Math.hypot(nextStar.x - currentX, nextStar.y - currentY);
        if (dist < 50) {
          ctx.beginPath();
          ctx.strokeStyle = config.galaxyColor;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 0.5;
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(nextStar.x, nextStar.y);
          ctx.stroke();
        }
      }
    });

    // 双星环绕
    if (config.showDoubleStar && !longPressTriggered) {
      const centerX = width / 2;
      const centerY = height / 2;
      const orbitRadius = 80 + heartbeat * 10;
      const angle1 = timeRef.current * 0.5;
      const angle2 = angle1 + Math.PI;

      const drawPlanet = (angle: number, name: string, color: string) => {
        const px = centerX + Math.cos(angle) * orbitRadius;
        const py = centerY + Math.sin(angle) * orbitRadius;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.globalAlpha = 1;
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, px, py - 18);
      };

      drawPlanet(angle1, config.name1, '#ff9a9e');
      drawPlanet(angle2, config.name2, '#a18cd1');
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [config, isPressed, longPressTriggered]);

  // 尺寸监听与初始化
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (containerRef.current && canvasRef.current) {
          const dpr = window.devicePixelRatio || 1;
          const width = containerRef.current.clientWidth || window.innerWidth;
          const height = containerRef.current.clientHeight || window.innerHeight;

          canvasRef.current.width = width * dpr;
          canvasRef.current.height = height * dpr;

          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.scale(dpr, dpr);
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;
          }

          starsRef.current = initStars(width, height, config.starCount);
        }
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [config.starCount]);

  // 启动动画
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // 交互事件处理
  const handleStart = () => {
    setIsPressed(true);
    soundManagerRef.current?.play('charge');

    pressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      soundManagerRef.current?.play('connect');
    }, 3000);
  };

  const handleEnd = () => {
    setIsPressed(false);
    setLongPressTriggered(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-black"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* 2. 画布层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block w-full h-full touch-none cursor-pointer active:cursor-grabbing"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        style={{ width: '100%', height: '100%' }}
      />

      {/* 3. 浮动文案层 */}
      <div className="absolute bottom-20 left-0 w-full text-center pointer-events-none transition-opacity duration-500 z-20"
        style={{ opacity: isPanelOpen ? 0 : 1 }}>
        <p className={`text-white text-opacity-80 text-lg tracking-widest font-light 
                      ${isPressed ? 'animate-pulse scale-110' : ''} transition-all duration-300 drop-shadow-md`}>
          {longPressTriggered ? "❤ 我们的星座已连结 ❤" : config.centerText}
        </p>
        <p className="text-white text-opacity-40 text-xs mt-2">
          {isPressed ? (longPressTriggered ? "" : "正在汇聚星光...") : "长按 3 秒汇聚星河"}
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
        startExpanded={false}
      />
    </div>
  );
}

export default function GalaxyWeaverPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <DisplayUI config={config} isPanelOpen={isPanelOpen} />
  );
}