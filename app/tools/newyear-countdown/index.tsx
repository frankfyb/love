'use client';

/**
 * newyear-countdown - 重构版本
 * 使用共享烟花引擎，保留倒计时和文字烟花特效
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { random } from '@/lib/utils';

// 使用共享引擎
import { FireworksEngine } from '@/engines/fireworks';

// 导入配置和本地组件
import {
  AppConfig,
  DEFAULT_CONFIG,
  PRESETS,
  newYearCountdownCardConfigMetadata,
} from './config';
import { TextEmber } from './TextEmber';

//重新导出配置
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS, newYearCountdownCardConfigMetadata };

// ============================================================================
// 主显示组件
// ============================================================================

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen?: boolean;
  onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FireworksEngine | null>(null);
  const textEmbersRef = useRef<TextEmber[]>([]);
  const animationFrameRef = useRef<number>(0);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);

  // 音频控制
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

  // 背景配置
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) return parseBgValueToConfig(config.bgValue);
    if (config.bgConfig) return config.bgConfig;
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

  const bgType = effectiveBgConfig.type;

  // 获取祝福语列表
  const getGreetingList = useCallback(() => {
    let list: string[] = [];
    if (Array.isArray(config.greetings)) {
      list = config.greetings;
    } else if (typeof config.greetings === 'string') {
      list = (config.greetings as string).split('\n').filter(s => s.trim() !== '');
    }
    return list.length > 0 ? list : PRESETS.greetingTemplates;
  }, [config.greetings]);

  // 祝福语轮播
  useEffect(() => {
    if (!isTimeUp) return;
    const greetingList = getGreetingList();
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prev) => (prev + 1) % greetingList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isTimeUp, getGreetingList]);

  // 倒计时逻辑
  useEffect(() => {
    const calc = () => {
      const diff = new Date(config.targetDate).getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
        setIsTimeUp(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTimeUp(true);
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [config.targetDate]);

  // 初始化烟花引擎
  useEffect(() => {
    if (!canvasRef.current) return;

    // 根据倒计时状态调整烟花密度
    const launchInterval = isTimeUp
      ? { min: 500, max: 1500 }  // 时间到了，更密集
      : { min: config.fireworkDensity * 40, max: config.fireworkDensity * 60 };

    engineRef.current = new FireworksEngine({
      canvas: canvasRef.current,
      shellSize: 2,
      shellType: 'Random',
      autoLaunch: true,
      autoLaunchInterval: launchInterval,
      enableSound: config.enableSound && !isMuted,
      soundVolume: 0.6,
      showSkyLighting: false,
    });

    engineRef.current.start();

    // 文字烟花生成逻辑：独立于引擎，根据时间和概率触发
    let lastTextTime = 0;
    const textSpawnInterval = setInterval(() => {
      if (!isTimeUp && textEmbersRef.current.length < 1 && random(0, 1) > 0.7) {
        const canvas = canvasRef.current;
        if (canvas) {
          const width = canvas.width / (window.devicePixelRatio || 1);
          const height = canvas.height / (window.devicePixelRatio || 1);

          // 在屏幕中上部随机位置生成文字烟花
          const x = random(width * 0.2, width * 0.8);
          const y = random(height * 0.2, height * 0.6);
          const hue = random(0, 360);

          const greetingList = getGreetingList();
          const text = greetingList[Math.floor(random(0, greetingList.length))];
          if (text) textEmbersRef.current.push(new TextEmber(x, y, text, hue));
        }
      }
    }, 4000); // 每4秒检查一次

    return () => {
      engineRef.current?.dispose();
      clearInterval(textSpawnInterval);
    };
  }, [isTimeUp, config.fireworkDensity, config.enableSound, isMuted, getGreetingList]);

  // 配置同步
  useEffect(() => {
    engineRef.current?.setSoundEnabled(config.enableSound && !isMuted);
  }, [config.enableSound, isMuted]);

  // 文字烟花渲染循环
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textLoop = () => {
      // 仅更新和绘制文字，不清除画布（烟花由引擎处理）
      ctx.save();

      for (let i = textEmbersRef.current.length - 1; i >= 0; i--) {
        const t = textEmbersRef.current[i];
        t.update();
        t.draw(ctx);
        if (t.alpha <= 0 && t.life <= 0) {
          textEmbersRef.current.splice(i, 1);
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(textLoop);
    };

    textLoop();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // 点击发射烟花
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!engineRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    engineRef.current.launchAt(x, y);
  }, []);

  const greetingList = getGreetingList();

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
      {/* 背景层 */}
      <div className="absolute inset-0 z-0">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* Canvas 层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-pointer touch-none block"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      />

      {/* 倒计时/祝福 UI */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
        {!isTimeUp ? (
          // 倒计时状态
          <div className="text-center animate-fade-in mix-blend-screen transition-opacity duration-1000">
            {config.recipientName && (
              <div className="text-white/90 text-xl md:text-3xl mb-6 font-serif tracking-widest animate-pulse drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {config.recipientName}
              </div>
            )}
            <h1 className="text-white/80 text-lg md:text-2xl mb-8 tracking-[0.4em] font-light uppercase drop-shadow-lg">
              {config.titleText}
            </h1>
            <div className="flex items-start justify-center gap-3 md:gap-8">
              <TimeUnit num={timeLeft.days} label="DAYS" />
              <Separator />
              <TimeUnit num={timeLeft.hours} label="HOURS" />
              <Separator />
              <TimeUnit num={timeLeft.minutes} label="MINS" />
              <Separator />
              <TimeUnit num={timeLeft.seconds} label="SECS" isSeconds />
            </div>
          </div>
        ) : (
          // 新年祝福状态
          <div className="text-center animate-fade-in flex flex-col items-center justify-center w-full h-full">
            <div className="relative z-50 p-8">
              <h1
                key={currentGreetingIndex}
                className="text-white font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-pulse-slow transition-all duration-1000"
              >
                {greetingList[currentGreetingIndex]}
              </h1>
              {config.recipientName && (
                <div className="mt-12 text-white/80 text-2xl md:text-3xl font-light tracking-[0.5em] animate-slide-up">
                  {config.recipientName}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 音效控制面板 */}
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
}

// ============================================================================
// 辅助组件
// ============================================================================

const Separator = () => <div className="text-xl md:text-5xl text-white/20 font-light mt-1 md:mt-2">:</div>;

function TimeUnit({ num, label, isSeconds = false }: { num: number, label: string, isSeconds?: boolean }) {
  return (
    <div className="flex flex-col items-center w-14 md:w-24">
      <span
        className="font-['Inter'] font-semibold tabular-nums leading-none tracking-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
        style={{
          fontSize: isSeconds ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
          color: isSeconds ? '#FFD700' : '#ffffff'
        }}
      >
        {num.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] md:text-xs text-white/40 mt-2 tracking-widest">{label}</span>
    </div>
  );
}

export default function NewYearCountdownCardPage() {
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  return <DisplayUI config={config} />;
}