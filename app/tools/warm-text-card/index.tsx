'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Maximize, Minimize, Sparkles } from 'lucide-react';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';

// 导入配置和工具函数
import {
  AppConfig,
  CardData,
  WarmTextCardTheme,
  DEFAULT_CONFIG,
  PRESETS,
  THEMES,
  randomInt,
  randomFloat,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig, CardData, WarmTextCardTheme };
export { DEFAULT_CONFIG, PRESETS, THEMES, THEME_PRESETS } from './config';
export { warmTextCardConfigMetadata } from './config';

/**
 * ==============================================================================
 * 装饰背景层组件
 * ==============================================================================
 */

const BackgroundDecoration = ({ type }: { type: string }) => {
  if (type === 'none') return null;

  const items = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${randomInt(0, 100)}%`,
    top: `${randomInt(0, 100)}%`,
    delay: `${randomFloat(0, 5)}s`,
    duration: `${randomFloat(3, 8)}s`,
    size: randomInt(2, 6)
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute rounded-full opacity-60 animate-pulse
            ${type === 'snow' ? 'bg-white shadow-[0_0_5px_white]' : ''}
            ${type === 'stars' ? 'bg-yellow-100 shadow-[0_0_8px_yellow]' : ''}
            ${type === 'holly' ? (item.id % 2 === 0 ? 'bg-red-400' : 'bg-green-400') : ''}
          `}
          style={{
            left: item.left,
            top: item.top,
            width: type === 'stars' ? item.size : item.size * 2,
            height: type === 'stars' ? item.size : item.size * 2,
            animationDuration: item.duration,
            animationDelay: item.delay,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
};

/**
 * ==============================================================================
 * 单个卡片组件
 * ==============================================================================
 */

const WordCard = ({
  data,
  theme,
  onClick
}: {
  data: CardData;
  theme: WarmTextCardTheme;
  onClick: (id: number) => void;
}) => {
  const { x, y, rotate, scale, text, zIndex, bgIndex } = data;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const currentTheme = THEMES[theme] || THEMES.warm;
  const bgColorClass = currentTheme.cardBg[bgIndex % currentTheme.cardBg.length];
  const isDarkTheme = theme === 'night' || theme === 'eve';
  const borderClass = isDarkTheme ? 'border border-white/10' : 'border border-transparent';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(data.id);
      }}
      className={`absolute transition-all duration-1000 ease-out cursor-pointer select-none
        flex items-center justify-center p-4 md:p-6 rounded-xl md:rounded-2xl
        ${bgColorClass} ${currentTheme.textColor} ${currentTheme.shadow} ${borderClass}
        hover:shadow-2xl hover:scale-110 hover:z-[999] active:scale-95
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${isVisible ? scale : 0})`,
        opacity: isVisible ? 1 : 0,
        zIndex: zIndex,
        boxShadow: isDarkTheme ? '0 4px 20px -2px rgba(0,0,0,0.5)' : '0 10px 30px -5px rgba(0,0,0,0.1)',
        maxWidth: '80vw',
        minWidth: '120px',
        width: 'max-content',
        filter: scale < 0.7 ? 'blur(0.5px)' : 'none',
      }}
    >
      <p
        className="text-center font-medium leading-relaxed font-serif whitespace-pre-wrap break-words"
        style={{ fontSize: '1.125rem' }}
      >
        {text}
      </p>

      {theme === 'christmas' && scale > 1 && (
        <span className="absolute -top-2 -right-2 text-xl animate-bounce" style={{ animationDuration: '3s' }}>
          🎄
        </span>
      )}
      {theme === 'eve' && scale > 1 && (
        <span className="absolute -top-3 -right-1 text-yellow-200 text-lg animate-pulse">
          ✨
        </span>
      )}
    </div>
  );
};

/**
 * ==============================================================================
 * 主组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
  onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    audioRef: bgAudioRef,
    isPlaying: isMusicPlaying,
    isMuted,
    handlePlayPause: toggleMusic,
    handleToggleMute: toggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.5,
  });

  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) {
      return parseBgValueToConfig(config.bgValue);
    }
    if (config.bgConfig) {
      return config.bgConfig;
    }
    return THEMES[config.theme]?.bgConfig || THEMES.warm.bgConfig;
  }, [config.bgValue, config.bgConfig, config.theme]);

  const bgType = effectiveBgConfig.type;

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const generateCard = useCallback(() => {
    setCards(prev => {
      const messages = config.customMessages || [];
      let nextCards = [...prev];
      if (nextCards.length >= config.maxCards) {
        if (prev.length > config.maxCards + 5) {
          nextCards = prev.slice(prev.length - config.maxCards);
        }
      }

      if (messages.length === 0) return nextCards;

      const scale = randomFloat(0.7, 1.2) * config.fontSizeScale;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const finalScale = isMobile ? scale * 0.85 : scale;

      const zIndex = Math.floor(finalScale * 10);

      const newCard: CardData = {
        id: Date.now() + Math.random(),
        text: messages[randomInt(0, messages.length - 1)],
        x: randomFloat(5, 95),
        y: randomFloat(5, 95),
        rotate: randomInt(-12, 12),
        scale: finalScale,
        zIndex: zIndex,
        bgIndex: randomInt(0, 10),
      };

      return [...nextCards, newCard];
    });
  }, [config.maxCards, config.customMessages, config.fontSizeScale]);

  useEffect(() => {
    if (isPlaying) {
      generateCard();
      timerRef.current = setInterval(generateCard, config.speed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, config.speed, generateCard]);

  const handleCardClick = (id: number) => {
    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, zIndex: 999, scale: card.scale * 1.2, rotate: 0 } as CardData : card
    ));
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const currentTheme = THEMES[config.theme] || THEMES.warm;
  const isDark = bgType === 'video' || bgType === 'image' || config.theme === 'night' || config.theme === 'eve';
  const iconColor = isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black';
  const glassBg = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* 2. 装饰层 */}
      <BackgroundDecoration type={currentTheme.decoration || 'none'} />

      {/* 3. 浮动卡片层 */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {cards.map(card => (
          <WordCard
            key={card.id}
            data={card}
            theme={config.theme}
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* 4. 顶部控制栏 */}
      <div className="absolute top-4 right-4 z-50 flex gap-3 safe-area-top">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 ${glassBg} ${iconColor}`}
          title={isPlaying ? "暂停生成" : "继续生成"}
        >
          <Sparkles size={20} className={isPlaying ? "animate-spin-slow" : ""} />
        </button>

        <button
          onClick={toggleFullScreen}
          className={`hidden md:block p-3 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 ${glassBg} ${iconColor}`}
          title="全屏沉浸"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* 5. 初始引导 */}
      {!isPlaying && cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
          <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl text-center animate-bounce-slow max-w-sm">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h1>
            <p className="text-sm md:text-base text-gray-600">点击右上角的星星开始</p>
          </div>
        </div>
      )}

      {/* 6. 音效控制面板 */}
      <AudioControlPanel
        isPlaying={isMusicPlaying}
        isMuted={isMuted}
        onPlayPause={toggleMusic}
        onToggleMute={toggleMute}
        enabled={config.enableSound}
        position="bottom-right"
        size="sm"
      />

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>
    </div>
  );
}

export default function WarmTextCardPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-50">
      <DisplayUI config={config} isPanelOpen={false} onConfigChange={handleConfigChange} />
    </main>
  );
}
