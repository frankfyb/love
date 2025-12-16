'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Settings2, X, Sparkles, Heart, MessageCircleHeart } from 'lucide-react';

// 1. 类型与配置定义
export interface AppConfig {
  customMessages: string;
  particleCount: number;
  floatSpeed: number;
  fontScale: number;
  showDecorations: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  customMessages: '生日快乐, Happy Birthday, 永远开心, All the best, 岁岁平安',
  particleCount: 50,
  floatSpeed: 1.0,
  fontScale: 1.5,
  showDecorations: true,
};

type ControlType = 'slider' | 'toggle' | 'textarea';

const CONFIG_METADATA: Array<{
  key: keyof AppConfig;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}> = [
  { key: 'customMessages', label: '定制祝福语 (逗号分隔)', type: 'textarea', placeholder: '输入祝福语...' },
  { key: 'fontScale', label: '文字大小', type: 'slider', min: 1.0, max: 4.0, step: 0.1 },
  { key: 'particleCount', label: '氛围浓度', type: 'slider', min: 20, max: 100, step: 10 },
  { key: 'floatSpeed', label: '流转速度', type: 'slider', min: 0.2, max: 2.5, step: 0.1 },
  { key: 'showDecorations', label: '开启卡通装饰', type: 'toggle' },
];

// 2. 配置面板组件 (ConfigUI)
export function ConfigUI({ config, onChange, isOpen, setIsOpen }: {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 left-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100'}`}
        aria-label="打开配置"
      >
        <Settings2 size={24} />
      </button>

      <div className={`fixed top-0 left-0 h-full w-80 md:w-96 z-40 transform transition-transform duration-500 ease-out backdrop-blur-xl bg-black/40 border-r border-white/10 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold tracking-wide">生日浪漫配置 V2</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide pb-20">
          <div className="mb-2 mt-0 flex items-center gap-3 text-white/80">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
              <MessageCircleHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">浪漫工坊</h3>
              <p className="text-[10px] text-pink-300/80 tracking-widest uppercase mt-0.5">Custom Surprise</p>
            </div>
          </div>

          {CONFIG_METADATA.map((meta) => (
            <div key={meta.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-200">{meta.label}</label>
                {meta.type === 'slider' && (
                  <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded">
                    {typeof (config as any)[meta.key] === 'number' ? (config as any)[meta.key].toFixed(1) : (config as any)[meta.key]}
                  </span>
                )}
              </div>

              {meta.type === 'textarea' && (
                <textarea
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  placeholder={meta.placeholder}
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none leading-relaxed"
                />
              )}

              {meta.type === 'toggle' && (
                <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-pink-400/30 transition-all duration-300">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-200">{meta.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={(config as any)[meta.key] as boolean}
                      onChange={(e) => onChange(meta.key, e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500 shadow-inner"></div>
                  </div>
                </label>
              )}

              {meta.type === 'slider' && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={(config as any)[meta.key] as number}
                    onChange={(e) => onChange(meta.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-8 border-t border-white/10">
            <p className="text-xs text-center text-white/30">Made with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </>
  );
}

// 3. 展示组件 (DisplayUI)
type ElementType = 'gift' | 'cake' | 'balloon' | 'text';

interface FloatingItem {
  id: string;
  type: ElementType;
  content: string;
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  depth: number;
  isInteracting?: boolean;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
}

const DECORATIONS = {
  gifts: ['🎁', '🎀', '🧧'],
  cakes: ['🎂', '🍰', '🧁'],
  balloons: ['🎈', '✨', '🎉'],
};

export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen?: boolean }) {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [mounted, setMounted] = useState(false);
  const explosionIdCounter = useRef(0);

  const parsedMessages = useMemo(() => {
    return config.customMessages
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [config.customMessages]);

  const generateItem = useCallback((existingId?: string): FloatingItem => {
    const depth = Math.random();
    let type: ElementType = 'text';
    let content = '';

    const isDecoration = config.showDecorations && Math.random() < 0.4;
    if (isDecoration) {
      const decorType = Math.random();
      if (decorType < 0.33) {
        type = 'gift';
        content = DECORATIONS.gifts[Math.floor(Math.random() * DECORATIONS.gifts.length)];
      } else if (decorType < 0.66) {
        type = 'cake';
        content = DECORATIONS.cakes[Math.floor(Math.random() * DECORATIONS.cakes.length)];
      } else {
        type = 'balloon';
        content = DECORATIONS.balloons[Math.floor(Math.random() * DECORATIONS.balloons.length)];
      }
    } else {
      type = 'text';
      const messages = parsedMessages.length > 0 ? parsedMessages : ['Happy Birthday'];
      content = messages[Math.floor(Math.random() * messages.length)];
    }

    let baseScale = 0.5 + (depth * 1.5);
    if (type === 'text') baseScale *= config.fontScale;

    return {
      id: existingId || Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.max(0.5, baseScale),
      duration: (15 + Math.random() * 25) / config.floatSpeed,
      delay: Math.random() * -40,
      opacity: 0.5 + (depth * 0.5),
      depth,
      isInteracting: false,
    };
  }, [config.showDecorations, config.fontScale, config.floatSpeed, parsedMessages]);

  useEffect(() => {
    setMounted(true);
    setItems(prevItems => {
      const targetCount = config.particleCount;
      const newItems: FloatingItem[] = [];
      for (let i = 0; i < targetCount; i++) {
        if (i < prevItems.length) {
          const prev = prevItems[i];
          if (!config.showDecorations && prev.type !== 'text') {
            newItems.push(generateItem());
            continue;
          }
          let scale = prev.scale;
          if (prev.type === 'text') {
            scale = (0.5 + (prev.depth * 1.5)) * config.fontScale;
          }
          newItems.push({ ...prev, scale, duration: (15 + Math.random() * 25) / config.floatSpeed });
        } else {
          newItems.push(generateItem());
        }
      }
      return newItems;
    });
  }, [config.particleCount, config.showDecorations, config.fontScale, config.floatSpeed, parsedMessages, generateItem]);

  const handleItemClick = (e: React.MouseEvent, item: FloatingItem) => {
    if (item.type !== 'text') return;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isInteracting: true } : i));
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const explosionId = explosionIdCounter.current++;
    setExplosions(prev => [...prev, { id: explosionId, x, y }]);
    setTimeout(() => { setExplosions(prev => prev.filter(ex => ex.id !== explosionId)); }, 1000);
    setTimeout(() => { setItems(prev => prev.map(i => i.id === item.id ? { ...i, isInteracting: false } : i)); }, 500);
  };

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(e, item)}
            className={`absolute top-0 left-0 will-change-transform select-none ${item.type === 'text' ? 'cursor-pointer hover:z-50' : ''}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.isInteracting ? 1 : item.opacity,
              transform: `scale(${item.isInteracting ? item.scale * 1.5 : item.scale})`,
              filter: `blur(${item.isInteracting ? 0 : (1 - item.depth) * 4}px)`,
              zIndex: Math.floor(item.depth * 100),
              animationName: item.isInteracting ? 'none' : 'floatUp',
              animationDuration: `${item.duration}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${item.delay}s`,
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s, filter 0.3s',
            }}
          >
            <div className={`animate-sway ${item.isInteracting ? 'animate-pulse text-yellow-300' : ''}`} style={{ animationDuration: `${item.duration * 0.5}s` }}>
              {item.type === 'text' ? (
                <span className={`font-bold whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                  ${item.isInteracting 
                    ? 'bg-gradient-to-r from-yellow-200 via-pink-400 to-yellow-200 bg-clip-text text-transparent scale-125' 
                    : 'bg-gradient-to-r from-pink-300 to-red-500 bg-clip-text text-transparent'}`}
                >
                  {item.content}
                </span>
              ) : (
                <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter brightness-110 contrast-125">{item.content}</span>
              )}
            </div>
          </div>
        ))}

        {explosions.map((ex) => (
          <div key={ex.id} className="fixed pointer-events-none z-[999]" style={{ left: ex.x, top: ex.y }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-red-500 animate-firework"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-20px)`,
                  '--tw-translate-y': `-${50 + Math.random() * 50}px`,
                  '--tw-rotate': `${i * 45}deg`
                } as React.CSSProperties}
              >
                <Heart className="w-6 h-6 fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(255,105,180,0.8)]" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg); }
          100% { transform: translateY(-120vh) rotate(10deg); }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(-20px); }
          50% { transform: translateX(20px); }
        }
        @keyframes firework {
          0% { opacity: 1; transform: rotate(var(--tw-rotate)) translateY(var(--tw-translate-y, 0)) scale(0.5); }
          100% { opacity: 0; transform: rotate(var(--tw-rotate)) translateY(var(--tw-translate-y, -80px)) scale(1.5); }
        }
        .animate-firework { animation: firework 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
