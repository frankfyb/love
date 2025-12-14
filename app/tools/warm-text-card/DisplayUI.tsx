'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Maximize, Minimize, Settings } from 'lucide-react';
import { WarmTextCardConfig, THEMES } from './config';
import WarmTextCardConfigUI from './ConfigUI';
import { randomInt, randomFloat } from './utils';

// 单个卡片组件
const WordCard = ({ 
  data, 
  theme, 
  onClick 
}: { 
  data: WarmTextCardConfig['customMessages'][number]; 
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
type Props = {
  config: WarmTextCardConfig;
  isPanelOpen?: boolean;
};

export default function WarmTextCardDisplayUI({ config }: Props) {
  const [cards, setCards] = useState<WarmTextCardConfig['customMessages'][number][]>([]);
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
      setShowConfig(false);
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
      
      const newCard = {
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
      card.id === id ? { ...card, zIndex: 100, scale: 1.5, rotate: 0 } : card
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
            <p className="text-gray-600">点击左侧面板的“生成”按钮开始铺满屏幕</p>
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
