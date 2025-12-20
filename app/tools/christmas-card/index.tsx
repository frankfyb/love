'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type ConfigInputType = 'slider' | 'color' | 'text' | 'textarea';

export interface ConfigItemDefinition<T = any> {
  defaultValue: T;
  label: string;
  type: ConfigInputType;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

// 1. 定义配置标准化 Schema
export const APP_CONFIG_SCHEMA = {
  particleCount: { 
    defaultValue: 120, 
    label: '氛围粒子密度', 
    type: 'slider', 
    min: 20, 
    max: 300, 
    step: 10, 
    description: '调整背景雪花与星星的数量' 
  },
  particleSize: { 
    defaultValue: 3, 
    label: '粒子尺寸', 
    type: 'slider', 
    min: 1, 
    max: 6, 
    step: 0.5, 
    description: '背景粒子的大小' 
  },
  particleColor: { 
    defaultValue: '#FFD700', 
    label: '主题点缀色', 
    type: 'color', 
    description: '星星和高光的主色调' 
  },
  glassBlur: { 
    defaultValue: 12, 
    label: '磨砂质感', 
    type: 'slider', 
    min: 0, 
    max: 24, 
    step: 1, 
    description: '卡片背景模糊程度 (px)' 
  },
  glassOpacity: { 
    defaultValue: 0.85, 
    label: '卡片浓度', 
    type: 'slider', 
    min: 0.1, 
    max: 1.0, 
    step: 0.05, 
    description: '卡片背景的不透明度' 
  },
  particleSpeed: { 
    defaultValue: 0.6, 
    label: '飘落速度', 
    type: 'slider', 
    min: 0.1, 
    max: 3, 
    step: 0.1, 
    description: '雪花下落的快慢' 
  },
  capsuleText: { 
    defaultValue: '', 
    label: '一键祝福', 
    type: 'text', 
    description: '替换所有的"圣诞快乐"文本' 
  },
  treeTextLevels: { 
    defaultValue: '1圣→诞→圣诞→快乐→圣诞快乐→圣诞快乐→圣诞快乐快乐→圣诞快乐快乐→圣诞快乐圣诞快乐→圣诞快乐圣诞快乐', 
    label: '树体文案', 
    type: 'textarea', 
    description: '用"→"分隔，建议成对配置' 
  },
  treeBottomLetters: { 
    defaultValue: 'L/H/J/C/Y/E', 
    label: '树干拼图', 
    type: 'text', 
    description: '用"/"分隔字母' 
  },
} as const;

// 2. 自动推导配置类型，保证类型安全
export type AppConfigKey = keyof typeof APP_CONFIG_SCHEMA;
type ConfigDefaultValue = number | string;
export type AppConfig = {
  [K in AppConfigKey]: ConfigDefaultValue;
};

// 辅助函数：获取默认配置
export function getDefaultConfig(): AppConfig {
  const config = {} as AppConfig;
  const keys = Object.keys(APP_CONFIG_SCHEMA) as AppConfigKey[];
  for (const key of keys) {
    config[key] = APP_CONFIG_SCHEMA[key].defaultValue as ConfigDefaultValue;
  }
  return config;
}

// 类型守卫函数
const isString = (value: ConfigDefaultValue): value is string => typeof value === 'string';
const isNumber = (value: ConfigDefaultValue): value is number => typeof value === 'number';

// 兼容性导出
export const DEFAULT_CONFIG = getDefaultConfig();

export const CONFIG_METADATA = Object.entries(APP_CONFIG_SCHEMA).map(([key, meta]) => ({
  key: key as AppConfigKey,
  ...meta,
}));

// 添加通用配置元数据
export const christmasCardConfigMetadata = {
  panelTitle: '圣诞贺卡配置',
  panelSubtitle: 'Design Your Christmas Card',
  configSchema: {
    particleCount: {
      label: '氛围粒子密度',
      type: 'slider' as const,
      min: 20,
      max: 300,
      step: 10,
      description: '调整背景雪花与星星的数量',
      category: 'visual' as const,
    },
    particleSize: {
      label: '粒子尺寸',
      type: 'slider' as const,
      min: 1,
      max: 6,
      step: 0.5,
      description: '背景粒子的大小',
      category: 'visual' as const,
    },
    particleColor: {
      label: '主题点缀色',
      type: 'color' as const,
      description: '星星和高光的主色调',
      category: 'visual' as const,
    },
    glassBlur: {
      label: '磨砂质感',
      type: 'slider' as const,
      min: 0,
      max: 24,
      step: 1,
      description: '卡片背景模糊程度 (px)',
      category: 'visual' as const,
    },
    glassOpacity: {
      label: '卡片浓度',
      type: 'slider' as const,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      description: '卡片背景的不透明度',
      category: 'visual' as const,
    },
    particleSpeed: {
      label: '飘落速度',
      type: 'slider' as const,
      min: 0.1,
      max: 3,
      step: 0.1,
      description: '雪花下落的快慢',
      category: 'visual' as const,
    },
    capsuleText: {
      label: '一键祝福',
      type: 'input' as const,
      description: '替换所有的"圣诞快乐"文本',
      category: 'content' as const,
    },
    treeTextLevels: {
      label: '树体文案',
      type: 'textarea' as const,
      description: '用"→"分隔，建议成对配置',
      category: 'content' as const,
    },
    treeBottomLetters: {
      label: '树干拼图',
      type: 'input' as const,
      description: '用"/"分隔字母',
      category: 'content' as const,
    },
  },
  tabs: [
    { id: 'visual' as const, label: '视觉' },
    { id: 'content' as const, label: '内容' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '视觉', 
      fields: ['particleCount' as const, 'particleSize' as const, 'particleSpeed' as const, 'glassBlur' as const, 'glassOpacity' as const] 
    },
    { 
      id: 2, 
      label: '内容', 
      fields: ['capsuleText' as const, 'treeTextLevels' as const, 'treeBottomLetters' as const] 
    },
  ],
};

/**
 * ==============================================================================
 * 2. 配置面板组件 (ConfigUI)
 * ==============================================================================
 */

export interface ConfigMetaItem {
  key: AppConfigKey;
  label: string;
  type: ConfigInputType;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface ConfigUIProps {
  config: AppConfig;
  metaList?: ConfigMetaItem[]; // Made optional
  onChange: (key: AppConfigKey, value: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onReset?: () => void;
}

export function ConfigUI({ config, metaList, onChange, isOpen, setIsOpen, onReset }: ConfigUIProps) {
  // Use provided metaList or fallback to imported CONFIG_METADATA
  const effectiveMetaList = metaList || CONFIG_METADATA;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 left-10 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95 ${isOpen ? 'translate-x-[280px]' : 'translate-x-0 opacity-0 hover:opacity-100'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>

      <aside className={`fixed top-0 left-0 z-50 h-full w-[300px] bg-slate-900/90 backdrop-blur-xl border-r border-white/30 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-2xl font-bold text-transparent">节日工坊</h2>
            <p className="text-xs text-slate-400 mt-1">Standardized Config Panel</p>
          </div>
          {onReset && (
            <button onClick={onReset} className="text-xs text-slate-500 hover:text-white underline" title="重置为默认配置">
              重置
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 custom-scrollbar">
          {effectiveMetaList.map((meta) => (
            <div key={meta.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-200">{meta.label}</label>
                {meta.type === 'slider' && (
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{(config as any)[meta.key]}</span>
                )}
              </div>

              {meta.type === 'slider' && (
                <div className="relative h-4 flex items-center">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={(config as any)[meta.key] as number}
                    onChange={(e) => onChange(meta.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              )}

              {meta.type === 'color' && (
                <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                  <input
                    type="color"
                    value={(config as any)[meta.key] as string}
                    onChange={(e) => onChange(meta.key, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded bg-transparent border-none p-0"
                  />
                  <span className="font-mono text-xs uppercase text-slate-400">{(config as any)[meta.key]}</span>
                </div>
              )}

              {meta.type === 'text' && (
                <input
                  type="text"
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                />
              )}

              {meta.type === 'textarea' && (
                <textarea
                  rows={4}
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
                />
              )}

              <p className="mt-1.5 text-[10px] text-slate-500 leading-tight">{meta.description}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

type Gift = { id: number; x: number; y: number; emoji: string; rotation: number };

const EMOJIS = ['🎁', '🍬', '🧸', '🎄', '🍪', '🔔', '🎅', '🦌'];

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen?: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const [init, setInit] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const treeLevels = useMemo(() => isString(config.treeTextLevels) ? config.treeTextLevels.split('→').map((t) => t.trim()).filter(Boolean) : [], [config.treeTextLevels]);
  const bottomLetters = useMemo(() => isString(config.treeBottomLetters) ? config.treeBottomLetters.split('/').map((t) => t.trim()).filter(Boolean) : [], [config.treeBottomLetters]);

  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setInit(true));
  }, []);

  const particlesOptions: ISourceOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: { events: { onClick: { enable: false }, onHover: { enable: true, mode: 'bubble' } }, modes: { bubble: { distance: 200, size: 6, duration: 2, opacity: 1, color: isString(config.particleColor) ? config.particleColor : '#FFD700' } } },
    particles: {
      color: { value: ['#ffffff', isString(config.particleColor) ? config.particleColor : '#FFD700'] },
      move: { enable: true, speed: isNumber(config.particleSpeed) ? config.particleSpeed : 0.6, direction: 'bottom', random: true, straight: false, outModes: { default: 'out' } },
      number: { density: { enable: true, area: 800 }, value: isNumber(config.particleCount) ? config.particleCount : 120 },
      opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1 } },
      shape: { type: ['circle', 'star'] },
      size: { value: { min: 1, max: isNumber(config.particleSize) ? config.particleSize : 3 } },
      wobble: { enable: true, distance: 5, speed: 5 },
    },
    detectRetina: true,
  }), [config]);

  const spawnGift = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const rotation = Math.random() * 360;
    setGifts((prev) => [...prev, { id, x, y, emoji, rotation }]);
    setTimeout(() => { setGifts((prev) => prev.filter((g) => g.id !== id)); }, 2000);
  }, []);

  const handleContainerClick = (e: React.MouseEvent) => { spawnGift(e.clientX, e.clientY); };
  
  // 玻璃卡片组件
  const GlassCard = ({
    children,
    className = '',
    blur,
    opacity,
    variant = 'white',
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    blur: number;
    opacity: number;
    variant?: 'white' | 'green';
    onClick?: (e: React.MouseEvent) => void;
  }) => {
    const bgColor = variant === 'green'
      ? `rgba(74, 222, 128, ${opacity})`
      : `rgba(255, 255, 255, ${opacity})`;
      
    const Icons = {
      Star: ({ className }: { className?: string }) => (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    };
    
    return (
      <div
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-xl shadow-lg cursor-pointer select-none
          transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          text-slate-900 border border-white/40
          ${className}
        `}
        style={{
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          backgroundColor: bgColor,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 扫光动画层 */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
        <div className="relative z-10 font-bold tracking-wide">{children}</div>
      </div>
    );
  };
  
  return (
    <div ref={containerRef} onClick={handleContainerClick} className={`relative flex h-screen w-full flex-col items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${isPanelOpen ? 'pl-0 md:pl-[300px]' : 'pl-0'}`}>
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #020617 80%)' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">{init && <Particles id="tsparticles" className="h-full w-full" options={particlesOptions} />}</div>

      <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
        {gifts.map((gift) => (
          <div key={gift.id} className="absolute text-2xl animate-drop-gift" style={{ left: gift.x, top: gift.y, ['--rotation' as any]: `${gift.rotation}deg` }}>
            {gift.emoji}
          </div>
        ))}
      </div>

      <div className="relative z-20 flex flex-col items-center py-10 scale-90 md:scale-100 transition-transform duration-500">
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 z-0 h-full w-full max-w-[600px] pointer-events-none opacity-60" viewBox="0 0 400 800" preserveAspectRatio="none">
          <path d="M 200,80 C 250,120 300,160 200,200 C 100,240 50,300 200,350 C 350,400 380,450 200,500 C 50,550 50,600 200,650" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]" strokeDasharray="10 5" />
          {[100, 250, 400, 550].map((y, i) => (
            <text key={i} x={i % 2 === 0 ? 300 : 100} y={y} fill={isString(config.particleColor) ? config.particleColor : '#FFD700'} fontSize="24" className="animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>✦</text>
          ))}
        </svg>

        <div className="relative z-30 mb-6 cursor-pointer hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]" onClick={(e) => { e.stopPropagation(); for (let i = 0; i < 5; i++) { setTimeout(() => spawnGift((e as any).clientX + (Math.random() * 100 - 50), (e as any).clientY), i * 100); } }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill={isString(config.particleColor) ? config.particleColor : '#FFD700'} className="animate-bounce-slow">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div className="flex flex-col gap-4 items-center">
            <div className="grid grid-cols-2 gap-x-12 gap-y-5 items-center justify-items-center">
              {treeLevels.map((text, index) => {
                 const isLeft = index % 2 === 0;
                 const rowIndex = Math.floor(index / 2);
                 const minWidth = 70 + (rowIndex * 35);
                 
                 const displayText = isString(config.capsuleText) && isString(text) && text.includes('圣诞快乐') 
                    ? text.replace('圣诞快乐', config.capsuleText) 
                    : text;

                 return (
                    <div key={index} className={`${isLeft ? 'justify-self-end' : 'justify-self-start'}`}>
                      <GlassCard
                        blur={isNumber(config.glassBlur) ? config.glassBlur : 12}
                        opacity={isNumber(config.glassOpacity) ? config.glassOpacity : 0.85}
                        variant={isLeft ? 'green' : 'white'}
                        className="px-5 py-2.5 flex items-center justify-center text-center whitespace-nowrap group"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止冒泡防止触发背景点击
                          spawnGift(e.clientX, e.clientY);
                        }}
                      >
                         <span style={{ minWidth: `${minWidth}px` }} className="text-lg font-bold">{displayText}</span>
                         {/* 装饰星星 */}
                         <svg className="absolute -top-1.5 -right-1.5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      </GlassCard>
                    </div>
                 );
              })}
            </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          {bottomLetters.map((char, index) => (
            <div key={`bottom-${index}`} onClick={(e) => { e.stopPropagation(); spawnGift((e as any).clientX, (e as any).clientY); }} className="flex h-14 w-14 items-center justify-center text-2xl font-bold hover:-translate-y-2 hover:rotate-3 relative overflow-hidden rounded-xl shadow-lg cursor-pointer select-none transition-all duration-200 ease-out text-slate-900 border border-white/40" style={{ backdropFilter: `blur(${config.glassBlur}px)`, WebkitBackdropFilter: `blur(${config.glassBlur}px)`, backgroundColor: `rgba(255, 255, 255, ${index % 2 === 0 ? config.glassOpacity : config.glassOpacity})`, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
              {char}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar{width:6px}
        .custom-scrollbar::-webkit-scrollbar-track{background:rgba(255,255,255,.05)}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:10px}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.4)}
        @keyframes drop-gift{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(var(--rotation));opacity:0}}
        .animate-drop-gift{animation:drop-gift 1.5s cubic-bezier(.5,0,1,1) forwards;pointer-events:none}
        @keyframes bounce-slow{0%,100%{transform:translateY(-5%)}50%{transform:translateY(5%)}}
        .animate-bounce-slow{animation:bounce-slow 3s infinite ease-in-out}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .animate-spin-slow{animation:spin-slow 4s linear infinite}
      `}</style>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function ChristmasCardPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigChange = (key: string, val: any) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-50">
      <DisplayUI config={config} isPanelOpen={isConfigOpen} />
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isConfigOpen} 
        setIsOpen={setIsConfigOpen}
        onReset={handleReset}
      />
    </main>
  );
}