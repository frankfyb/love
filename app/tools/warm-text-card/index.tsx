'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize, Settings, Sparkles, X, Palette, Zap, Type, MessageSquare } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type WarmTextCardTheme = 'warm' | 'forest' | 'night' | 'minimal' | 'christmas' | 'eve';

export interface AppConfig {
  theme: WarmTextCardTheme;
  speed: number;
  maxCards: number;
  fontSizeScale: number;
  customMessages: string[];
}

export type CardData = {
  id: number;
  text: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  bgIndex: number;
};

export const DEFAULT_CONFIG: AppConfig = {
  theme: 'warm',
  speed: 800,
  maxCards: 40,
  fontSizeScale: 1,
  customMessages: [
    '生活原本沉闷，但跑起来就有风',
    '保持热爱，奔赴山海',
    '愿你的世界总有微风和暖阳',
    '把温柔和浪漫留给值得的人',
    'Merry Christmas',
    '平安喜乐',
    '岁岁常欢愉',
  ],
};

export const THEMES = {
  warm: {
    name: '暖阳午后',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    cardBg: ['bg-white', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50'],
    textColor: 'text-orange-900',
    shadow: 'shadow-orange-200/50',
    decoration: 'none',
  },
  forest: {
    name: '静谧森林',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    cardBg: ['bg-white', 'bg-emerald-50', 'bg-teal-50', 'bg-green-50'],
    textColor: 'text-emerald-900',
    shadow: 'shadow-emerald-200/50',
    decoration: 'none',
  },
  night: {
    name: '星河入梦',
    bg: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900',
    cardBg: ['bg-slate-800', 'bg-purple-900/80', 'bg-indigo-900/80', 'bg-slate-700'],
    textColor: 'text-indigo-100',
    shadow: 'shadow-purple-900/50',
    decoration: 'stars',
  },
  minimal: {
    name: '极简白白',
    bg: 'bg-gray-50',
    cardBg: ['bg-white'],
    textColor: 'text-gray-800',
    shadow: 'shadow-gray-200',
    decoration: 'none',
  },
  eve: {
    name: '平安夜',
    bg: 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81]',
    cardBg: ['bg-[#1e293b]', 'bg-[#334155]', 'bg-[#172554]', 'bg-[#312e81]/80'],
    textColor: 'text-amber-100',
    shadow: 'shadow-blue-900/50',
    decoration: 'snow',
  },
  christmas: {
    name: '圣诞快乐',
    bg: 'bg-gradient-to-br from-red-50 via-green-50 to-red-100',
    cardBg: ['bg-white', 'bg-red-50', 'bg-green-50', 'bg-amber-50'],
    textColor: 'text-red-900',
    shadow: 'shadow-red-200/50',
    decoration: 'holly',
  },
};

// 主题快速预设数据
export const THEME_PRESETS = [
  {
    label: '暖阳午后',
    value: 'warm',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, rgb(255, 245, 230), rgb(251, 191, 36))',
  },
  {
    label: '静谧森林',
    value: 'forest',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, rgb(240, 253, 250), rgb(153, 246, 228))',
  },
  {
    label: '星河入梦',
    value: 'night',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, rgb(15, 23, 42), rgb(88, 28, 135))',
  },
  {
    label: '极简白白',
    value: 'minimal',
    type: 'color',
    preview: '#f3f4f6',
  },
  {
    label: '平安夜',
    value: 'eve',
    type: 'gradient',
    preview: 'linear-gradient(to bottom, rgb(15, 23, 42), rgb(30, 27, 75), rgb(49, 46, 129))',
  },
  {
    label: '圣诞快乐',
    value: 'christmas',
    type: 'gradient',
    preview: 'linear-gradient(to bottom right, rgb(255, 240, 245), rgb(220, 252, 231))',
  },
];

// 添加通用配置元数据
export const warmTextCardConfigMetadata = {
  panelTitle: '温馨文字卡片配置',
  panelSubtitle: 'Design Your Warm Text Card',
  configSchema: {
    theme: {
      label: '主题风格',
      type: 'select' as const,
      options: [
        { label: '暖阳午后', value: 'warm' },
        { label: '静谧森林', value: 'forest' },
        { label: '星河入梦', value: 'night' },
        { label: '极简白白', value: 'minimal' },
        { label: '平安夜', value: 'eve' },
        { label: '圣诞快乐', value: 'christmas' },
      ],
      category: 'visual' as const,
    },
    fontSizeScale: {
      label: '字体大小',
      type: 'slider' as const,
      min: 0.6,
      max: 1.8,
      step: 0.1,
      category: 'visual' as const,
    },
    speed: {
      label: '生成速度',
      type: 'slider' as const,
      min: 200,
      max: 2000,
      step: 100,
      category: 'visual' as const,
    },
    maxCards: {
      label: '最大数量',
      type: 'slider' as const,
      min: 10,
      max: 100,
      step: 5,
      category: 'visual' as const,
    },
    customMessages: {
      label: '文案内容',
      type: 'list' as const,
      category: 'content' as const,
      placeholder: '输入文案内容',
    },
  },
  tabs: [
    { id: 'content' as const, label: '内容', icon: null },
    { id: 'visual' as const, label: '效果', icon: null },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '内容', 
      icon: null, 
      fields: ['customMessages' as const] 
    },
    { 
      id: 2, 
      label: '效果', 
      icon: null, 
      fields: ['theme' as const, 'fontSizeScale' as const, 'speed' as const, 'maxCards' as const] 
    },
  ],
};

/**
 * ==============================================================================
 * 2. 工具函数 (Utils)
 * ==============================================================================
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * ==============================================================================
 * 3. 组件实现 (Components)
 * ==============================================================================
 */

// 装饰背景层
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

// 单个卡片组件
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
  const isDark = config.theme === 'night' || config.theme === 'eve';
  const iconColor = isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black';
  const glassBg = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60';

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ${currentTheme.bg}`}
    >
      <BackgroundDecoration type={currentTheme.decoration || 'none'} />

      {/* 浮动卡片层 */}
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

      {/* 顶部控制栏 */}
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

      {/* 初始引导 */}
      {!isPlaying && cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
          <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl text-center animate-bounce-slow max-w-sm">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h1>
            <p className="text-sm md:text-base text-gray-600">点击右上角的星星开始</p>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

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
