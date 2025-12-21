'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import { X, Maximize, Minimize, Settings, Play, Plus, Type, Palette } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type WarmTextCardConfig = {
  theme: 'warm' | 'forest' | 'night' | 'minimal';
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

export type AppConfig = WarmTextCardConfig;

export const defaultConfig: WarmTextCardConfig = {
  theme: 'warm',
  speed: 800,
  maxCards: 50,
  fontSizeScale: 1,
  customMessages: [
    '生活原本沉闷，但跑起来就有风',
    '保持热爱，奔赴山海',
    '愿你的世界总有微风和暖阳',
    '把温柔和浪漫留给值得的人',
  ],
};

export const THEMES = {
  warm: {
    name: '暖阳午后',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    cardBg: ['bg-white', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50'],
    textColor: 'text-orange-900',
    shadow: 'shadow-orange-200/50',
  },
  forest: {
    name: '静谧森林',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    cardBg: ['bg-white', 'bg-emerald-50', 'bg-teal-50', 'bg-green-50'],
    textColor: 'text-emerald-900',
    shadow: 'shadow-emerald-200/50',
  },
  night: {
    name: '星河入梦',
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    cardBg: ['bg-slate-800', 'bg-purple-900/80', 'bg-indigo-900/80', 'bg-slate-700'],
    textColor: 'text-indigo-100',
    shadow: 'shadow-purple-900/50',
  },
  minimal: {
    name: '极简白白',
    bg: 'bg-gray-50',
    cardBg: ['bg-white'],
    textColor: 'text-gray-800',
    shadow: 'shadow-gray-200',
  },
};

// 定义通用配置元数据
export const warmTextCardConfigMetadata: ToolConfigMetadata<WarmTextCardConfig> = {
  panelTitle: '温馨文字卡片',
  panelSubtitle: 'Warm Text Cards',
  configSchema: {
    theme: {
      label: '主题风格',
      type: 'select',
      options: [
        { label: THEMES.warm.name, value: 'warm' },
        { label: THEMES.forest.name, value: 'forest' },
        { label: THEMES.night.name, value: 'night' },
        { label: THEMES.minimal.name, value: 'minimal' },
      ],
      category: 'visual',
      description: '选择整体视觉主题风格'
    },
    speed: {
      label: '生成速度',
      type: 'slider',
      min: 200,
      max: 1500,
      step: 50,
      category: 'physics',
      description: '卡片生成的时间间隔（毫秒）'
    },
    maxCards: {
      label: '最大卡片数',
      type: 'slider',
      min: 10,
      max: 200,
      step: 5,
      category: 'physics',
      description: '屏幕上同时显示的最大卡片数量'
    },
    fontSizeScale: {
      label: '字体大小比例',
      type: 'slider',
      min: 0.5,
      max: 2,
      step: 0.1,
      category: 'visual',
      description: '控制卡片中文本的缩放比例'
    },
    customMessages: {
      label: '自定义文案列表',
      type: 'textarea',
      placeholder: '示例：爱你, Merry Christmas, 平安喜乐',
      category: 'content',
      description: '卡片上显示的文字内容，用逗号分隔'
    }
  },
  tabs: [
    { id: 'content', label: '内容' },
    { id: 'visual', label: '视觉' },
    { id: 'physics', label: '物理' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '内容', 
      fields: ['customMessages']
    },
    { 
      id: 2, 
      label: '样式', 
      fields: ['theme', 'fontSizeScale']
    },
    { 
      id: 3, 
      label: '物理', 
      fields: ['speed', 'maxCards']
    },
  ],
};

/**
 * ==============================================================================
 * 2. 工具函数 (Utils)
 * ==============================================================================
 */

// 生成指定范围内的随机整数 [min, max]
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成指定范围内的随机浮点数 [min, max)
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * ==============================================================================
 * 3. 配置面板组件 (ConfigUI)
 * ==============================================================================
 */

export function ConfigUI({ 
  config, 
  onChange, 
  isOpen, 
  setIsOpen 
}: { 
  config: WarmTextCardConfig; 
  onChange: (key: keyof WarmTextCardConfig, value: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <GenericConfigPanel
      config={config}
      configMetadata={warmTextCardConfigMetadata}
      onChange={onChange}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}

/**
 * ==============================================================================
 * 4. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

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

  const currentTheme = THEMES[theme as keyof typeof THEMES];
  const bgColorClass = currentTheme.cardBg[bgIndex % currentTheme.cardBg.length];

  return (
    <div
      onClick={() => onClick(data.id)}
      className={`absolute transition-all duration-1000 ease-out cursor-pointer select-none
        flex items-center justify-center p-6 rounded-2xl
        ${bgColorClass} ${currentTheme.textColor} ${currentTheme.shadow}
        hover:shadow-xl hover:scale-110 hover:z-50
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${isVisible ? scale : 0})`,
        opacity: isVisible ? 1 : 0,
        zIndex: zIndex,
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
        maxWidth: '300px',
        minWidth: '160px',
        filter: scale < 0.8 ? 'blur(1px)' : 'none',
      }}
    >
      <p className="text-center font-medium leading-relaxed font-serif text-lg">
        {text}
      </p>
    </div>
  );
};

// 显示界面主组件
type DisplayUIProps = {
  config: WarmTextCardConfig;
  isPanelOpen?: boolean;
};

export default function WarmTextCardDisplayUI({ config }: DisplayUIProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 切换全屏
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 生成新卡片
  const generateCard = useCallback(() => {
    setCards(prev => {
      // 确保 config.customMessages 存在且有内容
      const messages = config.customMessages || [];
      if (messages.length === 0 || prev.length >= config.maxCards) {
        setIsPlaying(false);
        return prev;
      }

      const scale = randomFloat(0.6, 1.3) * config.fontSizeScale;
      const zIndex = Math.floor(scale * 10); 
      
      const newCard: CardData = {
        id: Date.now() + Math.random(),
        text: messages[randomInt(0, messages.length - 1)],
        x: randomFloat(5, 95),
        y: randomFloat(5, 95),
        rotate: randomInt(-15, 15),
        scale: scale,
        zIndex: zIndex,
        bgIndex: randomInt(0, 10),
      };
      return [...prev, newCard];
    });
  }, [config.maxCards, config.customMessages, config.fontSizeScale]);

  // 动画循环
  useEffect(() => {
    if (isPlaying) {
      // 立即生成一张，避免首帧空白
      generateCard();
      timerRef.current = setInterval(generateCard, config.speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, config.speed, generateCard]);

  // 重置卡片
  const handleReset = () => {
    setCards([]);
    setIsPlaying(true);
    // 重置后立即生成一张，避免用户看不到变化
    setTimeout(generateCard, 0);
  };

  // 点击卡片置顶
  const handleCardClick = (id: number) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, zIndex: 100, scale: 1.5, rotate: 0 } as CardData : card
    ));
  };

  const currentTheme = THEMES[config.theme] || THEMES['warm'];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden transition-colors duration-700 ${currentTheme.bg}`}
    >
      {/* 浮动卡片层 */}
      <div className="absolute inset-0 z-0">
        {cards.map(card => (
          <WordCard 
            key={card.id} 
            data={card} 
            theme={config.theme} 
            onClick={handleCardClick}
          />
        ))}
      </div>

      {/* 顶部快捷栏 */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={toggleFullScreen}
          className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-gray-700 shadow-sm transition-all"
          title="全屏沉浸"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* 配置面板由 /love 路由统一加载，这里不再嵌入 */}

      {/* 初始引导 */}
      {!isPlaying && cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center animate-bounce-slow">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">准备好了吗？</h1>
            <p className="text-gray-600">点击左侧面板的"生成"按钮开始铺满屏幕</p>
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">温馨文字卡片</h1>
            <p className="text-gray-600">正在生成卡片...</p>
          </div>
        </div>
      )}
    </div>
  );
}