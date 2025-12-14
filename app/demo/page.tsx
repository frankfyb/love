/**
 * BirthdayRomanceGenerator V2
 * * 更新日志：
 * 1. 配置面板简化：合并琐碎选项，保留核心控制。
 * 2. 新增功能：自定义祝福语录输入。
 * 3. 视觉优化：字体大小可调，默认字体增大。
 * 4. 交互增强：点击文字触发爱心爆炸效果。
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings2, X, PartyPopper, Heart, Sparkles, MessageCircleHeart } from 'lucide-react';

// ==========================================
// 1. 配置层 (Configuration Layer)
// ==========================================

interface AppConfig {
  customMessages: string;    // 自定义祝福语
  particleCount: number;     // 粒子数量
  floatSpeed: number;        // 漂浮速度
  fontScale: number;         // 字体大小倍率
  showDecorations: boolean;  // 显示装饰(礼物/蛋糕等)
}

const DEFAULT_CONFIG: AppConfig = {
  customMessages: "生日快乐, Happy Birthday, 永远开心, All the best, 岁岁平安",
  particleCount: 50,
  floatSpeed: 1.0,
  fontScale: 1.5,
  showDecorations: true,
};

type ConfigType = 'slider' | 'toggle' | 'textarea';

interface ConfigItemMetadata {
  key: keyof AppConfig;
  label: string;
  type: ConfigType;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

const CONFIG_METADATA: ConfigItemMetadata[] = [
  { key: 'customMessages', label: '定制祝福语 (逗号分隔)', type: 'textarea', placeholder: '输入祝福语...' },
  { key: 'fontScale', label: '文字大小', type: 'slider', min: 1.0, max: 4.0, step: 0.1 },
  { key: 'particleCount', label: '氛围浓度', type: 'slider', min: 20, max: 100, step: 10 },
  { key: 'floatSpeed', label: '流转速度', type: 'slider', min: 0.2, max: 2.5, step: 0.1 },
  { key: 'showDecorations', label: '开启卡通装饰', type: 'toggle' },
];

// ==========================================
// 2. 逻辑与数据层 (Logic & Data)
// ==========================================

type ElementType = 'gift' | 'cake' | 'balloon' | 'text';

interface FloatingItem {
  id: string;
  type: ElementType;
  content: string;    // 实际显示的字符内容
  x: number;          // %
  y: number;          // %
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
  depth: number;      // 0-1
  isInteracting?: boolean; // 是否正在交互中
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

// ==========================================
// 3. 组件实现 (Component Implementation)
// ==========================================

export default function BirthdayGeneratorPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [mounted, setMounted] = useState(false);
  const explosionIdCounter = useRef(0);

  // 解析自定义文字
  const parsedMessages = React.useMemo(() => {
    return config.customMessages
      .split(/[,，\n]/) // 支持中英文逗号和换行分隔
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [config.customMessages]);

  // 生成单个粒子
  const generateItem = useCallback((existingId?: string): FloatingItem => {
    const depth = Math.random();
    
    // 决定类型：文字 vs 装饰
    // 如果开启装饰，约 40% 概率是装饰，60% 是文字
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
      // 随机取一条祝福语，如果没有则使用默认
      const messages = parsedMessages.length > 0 ? parsedMessages : ['Happy Birthday'];
      content = messages[Math.floor(Math.random() * messages.length)];
    }

    // 基础大小
    let baseScale = 0.5 + (depth * 1.5); 
    // 文字需要额外放大
    if (type === 'text') {
      baseScale *= config.fontScale;
    }

    return {
      id: existingId || Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.max(0.5, baseScale), // 最小尺寸限制
      duration: (15 + Math.random() * 25) / config.floatSpeed,
      delay: Math.random() * -40,
      opacity: 0.5 + (depth * 0.5),
      depth,
      isInteracting: false,
    };
  }, [config.showDecorations, config.fontScale, config.floatSpeed, parsedMessages]);

  // 粒子系统维护
  useEffect(() => {
    setMounted(true);
    setItems(prevItems => {
      const targetCount = config.particleCount;
      const newItems: FloatingItem[] = [];

      // 复用或清理
      for (let i = 0; i < targetCount; i++) {
        if (i < prevItems.length) {
          const prev = prevItems[i];
          // 如果装饰被关闭但当前是装饰，需要重生
          if (!config.showDecorations && prev.type !== 'text') {
             newItems.push(generateItem());
             continue;
          }
          // 检查文字内容是否在新的列表中（如果是文字类型）
          // 简单处理：如果是文字，且配置列表变了，一定概率重生，或者直接保持当前显示的（更有机）
          // 这里我们只更新大小和速度，让它自然过渡
          let scale = prev.scale;
          // 重新计算文字大小
          if (prev.type === 'text') {
             // 简单的反推 baseScale 有点难，直接基于 depth 重算
             scale = (0.5 + (prev.depth * 1.5)) * config.fontScale;
          }

          newItems.push({
            ...prev,
            scale,
            duration: (15 + Math.random() * 25) / config.floatSpeed,
          });
        } else {
          newItems.push(generateItem());
        }
      }
      return newItems;
    });
  }, [config.particleCount, config.showDecorations, config.fontScale, config.floatSpeed, parsedMessages, generateItem]);

  // --- 交互逻辑 ---

  const handleItemClick = (e: React.MouseEvent, item: FloatingItem) => {
    if (item.type !== 'text') return;
    
    // 1. 触发该元素的视觉反馈
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, isInteracting: true } : i
    ));

    // 2. 触发全屏爆炸效果
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const explosionId = explosionIdCounter.current++;
    setExplosions(prev => [...prev, { id: explosionId, x, y }]);

    // 清理爆炸
    setTimeout(() => {
      setExplosions(prev => prev.filter(ex => ex.id !== explosionId));
    }, 1000);

    // 恢复元素状态
    setTimeout(() => {
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, isInteracting: false } : i
      ));
    }, 500);
  };

  const handleConfigChange = (key: keyof AppConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // --- 渲染辅助 ---

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-pink-500/30">
      
      {/* ========================================
        Display Layer (展示层)
        ========================================
      */}
      <div className="absolute inset-0 z-0">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={(e) => handleItemClick(e, item)}
            className={`absolute top-0 left-0 will-change-transform select-none
              ${item.type === 'text' ? 'cursor-pointer hover:z-50' : ''}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.isInteracting ? 1 : item.opacity,
              transform: `scale(${item.isInteracting ? item.scale * 1.5 : item.scale})`,
              filter: `blur(${item.isInteracting ? 0 : (1 - item.depth) * 4}px)`,
              zIndex: Math.floor(item.depth * 100),
              animation: item.isInteracting ? 'none' : `floatUp ${item.duration}s linear infinite`,
              animationDelay: `${item.delay}s`,
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s, filter 0.3s',
            }}
          >
            <div 
              className={`animate-sway ${item.isInteracting ? 'animate-pulse text-yellow-300' : ''}`} 
              style={{ animationDuration: `${item.duration * 0.5}s` }}
            >
              {item.type === 'text' ? (
                <span className={`font-bold whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                  ${item.isInteracting 
                    ? 'bg-gradient-to-r from-yellow-200 via-pink-400 to-yellow-200 bg-clip-text text-transparent scale-125' 
                    : 'bg-gradient-to-r from-pink-300 to-red-500 bg-clip-text text-transparent'}`}
                >
                  {item.content}
                </span>
              ) : (
                <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter brightness-110 contrast-125">
                  {item.content}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* 爆炸效果层 */}
        {explosions.map((ex) => (
          <div 
            key={ex.id} 
            className="fixed pointer-events-none z-[999]"
            style={{ left: ex.x, top: ex.y }}
          >
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
          0% { opacity: 1; transform: rotate(var(--tw-rotate)) translateY(0) scale(0.5); }
          100% { opacity: 0; transform: rotate(var(--tw-rotate)) translateY(var(--tw-translate-y)) scale(1.5); }
        }
        .animate-firework {
          animation: firework 0.8s ease-out forwards;
        }
      `}</style>


      {/* ========================================
        UI Layer (UI 层 - Config Panel)
        ========================================
      */}
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`absolute left-6 bottom-6 z-50 p-3 rounded-full transition-all duration-500 shadow-lg border backdrop-blur-md group
          ${isPanelOpen 
            ? 'bg-red-500/10 border-red-500/30 rotate-90' 
            : 'bg-white/10 border-amber-400/30 hover:bg-amber-400/20 rotate-0'}`}
      >
        {isPanelOpen ? (
          <X className="w-6 h-6 text-red-400" />
        ) : (
          <Settings2 className="w-6 h-6 text-amber-400 group-hover:text-amber-300" />
        )}
      </button>

      {/* Glass Panel - Simplified */}
      <div 
        className={`absolute top-0 left-0 h-full w-80 z-40 transform transition-transform duration-500 ease-in-out
          ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl border-r border-white/10 shadow-2xl" />
        
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 opacity-80" />

        <div className="relative h-full overflow-y-auto custom-scrollbar p-6 text-white/90">
          
          {/* Header */}
          <div className="mb-8 mt-2 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
              <MessageCircleHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                浪漫工坊
              </h1>
              <p className="text-[10px] text-pink-300/80 tracking-widest uppercase mt-0.5">Custom Surprise</p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-7">
            {CONFIG_METADATA.map((meta) => (
              <div key={meta.key} className="group">
                
                {/* Textarea Input */}
                {meta.type === 'textarea' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-pink-200/80 uppercase tracking-wider ml-1">
                      {meta.label}
                    </label>
                    <textarea
                      value={config[meta.key] as string}
                      onChange={(e) => handleConfigChange(meta.key, e.target.value)}
                      placeholder={meta.placeholder}
                      rows={4}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Toggle Type */}
                {meta.type === 'toggle' && (
                  <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-pink-400/30 transition-all duration-300">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      {meta.label}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config[meta.key] as boolean}
                        onChange={(e) => handleConfigChange(meta.key, e.target.checked)}
                      />
                      <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500 shadow-inner"></div>
                    </div>
                  </label>
                )}

                {/* Slider Type */}
                {meta.type === 'slider' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-300">
                        {meta.label}
                      </label>
                      <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-md min-w-[3rem] text-center">
                        {typeof config[meta.key] === 'number' 
                          ? (config[meta.key] as number).toFixed(1)
                          : config[meta.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      value={config[meta.key] as number}
                      onChange={(e) => handleConfigChange(meta.key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Tip */}
          <div className="mt-8 p-4 rounded-lg bg-pink-500/5 border border-pink-500/10 text-center">
            <p className="text-xs text-pink-200/60 leading-relaxed">
              提示：试着点击屏幕上漂浮的文字<br/>会发生浪漫的事情哦 ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}