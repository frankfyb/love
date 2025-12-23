'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize, Settings, Sparkles, X, Palette, Zap, Type, MessageSquare } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type WarmTextCardConfig = {
  theme: 'warm' | 'forest' | 'night' | 'minimal' | 'christmas' | 'eve';
  speed: number;
  maxCards: number;
  fontSizeScale: number;
  customMessages: string[];
};

// 定义卡片数据类型
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

export const defaultConfig: WarmTextCardConfig = {
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

// 自定义配置面板组件 (替代 GenericConfigPanel)
const ConfigPanel = ({
  config,
  onChange,
  isOpen,
  onClose
}: {
  config: WarmTextCardConfig;
  onChange: (key: keyof WarmTextCardConfig, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'visual' | 'physics'>('content');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-[100] w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-100">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings size={18} />
          <span>配置面板</span>
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex p-2 gap-1 bg-gray-50/50">
        {[
          { id: 'content', label: '内容', icon: MessageSquare },
          { id: 'visual', label: '视觉', icon: Palette },
          { id: 'physics', label: '动态', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all
              ${activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">文案内容</label>
              <textarea
                value={config.customMessages.join('\n')}
                onChange={(e) => onChange('customMessages', e.target.value.split('\n').filter(Boolean))}
                className="w-full h-64 p-3 rounded-xl border-gray-200 border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed resize-none"
                placeholder="每一行作为一条祝福语..."
              />
              <p className="mt-2 text-xs text-gray-500">每一行文字都会作为一张独立的卡片显示。</p>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">主题风格</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => onChange('theme', key)}
                    className={`relative p-3 rounded-xl text-left border-2 transition-all overflow-hidden group
                      ${config.theme === key 
                        ? 'border-blue-500 ring-1 ring-blue-500/20' 
                        : 'border-transparent hover:border-gray-200 bg-gray-50'}`}
                  >
                    <div className={`absolute inset-0 opacity-10 ${theme.bg}`}></div>
                    <div className="relative z-10">
                      <div className="font-medium text-gray-900 text-sm">{theme.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">字体大小</label>
                <span className="text-xs text-gray-500">{config.fontSizeScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={config.fontSizeScale}
                onChange={(e) => onChange('fontSizeScale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">生成速度</label>
                <span className="text-xs text-gray-500">{config.speed}ms</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="100"
                value={config.speed}
                onChange={(e) => onChange('speed', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400">数值越小，卡片生成越快</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">最大数量</label>
                <span className="text-xs text-gray-500">{config.maxCards}张</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.maxCards}
                onChange={(e) => onChange('maxCards', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400">屏幕上同时存在的卡片上限</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  theme: WarmTextCardConfig['theme']; 
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

export default function WarmTextCardDisplayUI() {
  const [config, setConfig] = useState<WarmTextCardConfig>(defaultConfig);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleConfigChange = (key: keyof WarmTextCardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

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
      // 移动端适当减小 scale
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
  // 计算图标颜色，根据背景深浅调整
  const isDark = config.theme === 'night' || config.theme === 'eve';
  const iconColor = isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-black';
  const glassBg = isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60';

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 ${currentTheme.bg}`}
      onClick={() => isPanelOpen && setIsPanelOpen(false)}
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
          onClick={(e) => {
             e.stopPropagation();
             setIsPlaying(!isPlaying);
          }}
          className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 ${glassBg} ${iconColor}`}
          title={isPlaying ? "暂停生成" : "继续生成"}
        >
          <Sparkles size={20} className={isPlaying ? "animate-spin-slow" : ""} />
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFullScreen();
          }}
          className={`hidden md:block p-3 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 ${glassBg} ${iconColor}`}
          title="全屏沉浸"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsPanelOpen(!isPanelOpen);
          }}
          className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 ${glassBg} ${iconColor}`}
          title="设置"
        >
          <Settings size={20} />
        </button>
      </div>
      
      {/* 侧边配置面板 */}
      <div 
        className="absolute inset-y-0 left-0 z-[100]"
        onClick={(e) => e.stopPropagation()} 
      >
         <ConfigPanel 
            config={config} 
            onChange={handleConfigChange} 
            isOpen={isPanelOpen} 
            onClose={() => setIsPanelOpen(false)}
         />
      </div>

      {/* 初始引导 */}
      {!isPlaying && cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
          <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl text-center animate-bounce-slow max-w-sm">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h1>
            <p className="text-sm md:text-base text-gray-600">点击右上角的设置按钮定制内容<br/>或点击星星开始</p>
          </div>
        </div>
      )}
    </div>
  );
}