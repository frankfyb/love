'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
  // 视觉设置
  starCount: number;
  galaxyColor: string;

  // 背景配置 (标准化)
  bgConfig?: StandardBgConfig;
  bgValue?: string; // 兼容 MediaGridControl

  // 交互设置
  basePulseSpeed: number;
  activePulseSpeed: number;

  // 音效设置
  enableSound: boolean;
  bgMusicUrl: string;

  // 文本内容
  name1: string;
  name2: string;
  centerText: string;
  showDoubleStar: boolean;
}

export const PRESETS = {
  backgrounds: [
    { type: 'color', value: 'linear-gradient(to bottom, #020024, #090979, #000000)', label: '深空蓝 (默认)' },
    { type: 'color', value: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)', label: '午夜紫' },
    { type: 'color', value: 'linear-gradient(to bottom, #1a0b0b, #4a192c, #1a0b0b)', label: '星云红' },
    ...GLOBAL_BG_PRESETS.getToolPresets('galaxy-weaver'),
  ],
  music: [
    { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    { label: 'Ambient Space', value: 'https://cdn.pixabay.com/audio/2022/05/16/audio_db65dadf58.mp3' }, // Ethereal substitution
    { label: 'Deep Meditation', value: 'https://cdn.pixabay.com/audio/2020/09/14/audio_346b9a840e.mp3' },
  ],
};

export const DEFAULT_CONFIG: AppConfig = {
  starCount: 1500,
  galaxyColor: '#a0c4ff',

  // 默认背景：深空渐变
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

// 配置面板元数据
export const galaxyWeaverConfigMetadata = {
  panelTitle: '银河工坊',
  panelSubtitle: 'Galaxy Weaver',
  tabs: [
    { id: "visual" as const, label: '视觉', icon: null },
    { id: "content" as const, label: '内容', icon: null },
    { id: "scene" as const, label: '场景', icon: null },
  ],
  configSchema: {
    // 场景 - 背景与音乐
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

    // 视觉 - 粒子参数
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

    // 内容 - 文本与开关
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

// 音效素材 (复用优质素材)
const AUDIO_SOURCES = {
  charge: [
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift2.mp3',
  ],
  connect: [
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3', // 较柔和的爆发
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
  ],
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * ==============================================================================
 * 2. 音效管理器 (SoundManager)
 * ==============================================================================
 */
class SoundManager {
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
      // 调整音量以适应宇宙氛围
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
    audio.playbackRate = category === 'charge' ? random(0.9, 1.1) : random(0.8, 1.0); // 稍微慢一点更梦幻

    audio.play().catch(() => { });
    this.cursors[category] = (cursor + 1) % pool.length;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
  }
}

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface Star {
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

  // 状态变量 refs
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
    volume: 0.4, // 默认音量适中
  });

  // 1. 初始化音效管理器
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    soundManagerRef.current.setEnabled(!isMuted && config.enableSound);
  }, []);

  useEffect(() => {
    soundManagerRef.current?.setEnabled(!isMuted && config.enableSound);
  }, [isMuted, config.enableSound]);

  // 2. 背景配置处理 (优先使用 bgValue, 回退到 bgConfig)
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) {
      return parseBgValueToConfig(config.bgValue);
    }
    if (config.bgConfig) {
      return config.bgConfig;
    }
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

  // 3. 星星初始化逻辑
  const initStars = useCallback((width: number, height: number, count: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      // 使用均匀分布铺满全屏，消除视觉上的"边框"空白，确保星空沉浸感
      const x = Math.random() * width;
      const y = Math.random() * height;

      stars.push({
        x: x,
        y: y,
        z: Math.random() * 2,
        size: Math.random() * 2 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3,
        blinkOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }
    starsRef.current = stars;
  }, []);

  // 4. 心形轨迹计算
  const getHeartPosition = (index: number, total: number, width: number, height: number, scale: number) => {
    const t = (index / total) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return {
      x: width / 2 + x * scale,
      y: height / 2 + y * scale
    };
  };

  // 5. 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取 DPR 修正后的逻辑尺寸 (CSS 像素)
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // 清空画布 (使用逻辑尺寸)
    ctx.clearRect(0, 0, width, height);

    // 计算速度与强度
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

        // 边界循环 (使用逻辑尺寸)
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

      // 连线效果 (星座)
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
      // 延迟确保容器已完成布局
      setTimeout(() => {
        if (containerRef.current && canvasRef.current) {
          const dpr = window.devicePixelRatio || 1;
          // 强制使用窗口尺寸作为兜底，确保全屏
          const width = containerRef.current.clientWidth || window.innerWidth;
          const height = containerRef.current.clientHeight || window.innerHeight;

          canvasRef.current.width = width * dpr;
          canvasRef.current.height = height * dpr;

          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.scale(dpr, dpr);
            // 确保样式尺寸也是 100%
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;
          }

          // 重新初始化星星
          initStars(width, height, config.starCount);
        }
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [config.starCount, initStars]);

  // 7. 启动动画
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // 8. 交互事件处理
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
      {/* 1. 背景层 (新) */}
      <div className="absolute inset-0 z-0 pointer-events-none" >
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

/**
 * ==============================================================================
 * 4. 主页面入口
 * ==============================================================================
 */
export default function GalaxyWeaverPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // 实际项目中可能由父级控制

  return (
    <DisplayUI config={config} isPanelOpen={isPanelOpen} />
  );
}