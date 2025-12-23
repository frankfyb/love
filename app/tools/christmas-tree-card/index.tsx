'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, AlertCircle, RotateCw, XCircle } from 'lucide-react';

/**
 * ==============================================================================
 * 0. 原生 Canvas 粒子组件 (Native Canvas Particles)
 * ==============================================================================
 */

interface ParticleCanvasProps {
  count: number;
  size: number;
  speed: number;
  color: string;
  enable: boolean;
}

const ParticleCanvas = React.memo<ParticleCanvasProps>(({ count, size, speed, color, enable }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enable || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * size + 0.5,
          speedY: Math.random() * speed + 0.2,
          speedX: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      particles.forEach((p) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    initParticles();
    draw();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, size, speed, color, enable]);

  if (!enable) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type BgType = 'image' | 'video' | 'color';

export interface DecorationItem {
  id: string;
  type: 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface AppConfig {
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  particleColor: string;
  glassBlur: number;
  glassOpacity: number;
  bgType: BgType;
  bgValue: string;
  enableSnow: boolean;
  bgMusicUrl: string;
  clickSoundUrl: string;
  enableSound: boolean;
  decorationPicker: any;
  capsuleText: string;
  treeTextLevels: string;
  treeBottomLetters: string;
}

export const PRESETS = {
  backgrounds: [
    { label: '飘雪视频', value: 'https://assets.mixkit.co/videos/preview/mixkit-falling-snow-on-a-black-background-44583-large.mp4', type: 'video' },
    { label: '温馨壁炉', value: 'https://assets.mixkit.co/videos/preview/mixkit-burning-wood-in-a-fireplace-4309-large.mp4', type: 'video' },
    { label: '金色光斑', value: 'https://assets.mixkit.co/videos/preview/mixkit-gold-bokeh-lights-2274-large.mp4', type: 'video' },
    { label: '梦幻雪夜', value: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?q=80&w=2574&auto=format&fit=crop', type: 'image' },
    { label: '极光森林', value: 'https://images.unsplash.com/photo-1531685218231-579524f35d5c?q=80&w=2670&auto=format&fit=crop', type: 'image' },
    { label: '复古红绿', value: '#0f392b', type: 'color' },
    { label: '午夜深蓝', value: '#0f172a', type: 'color' },
  ],
  music: [
    { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
    { label: 'Jingle Bells (Upbeat)', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
  ],
  clickSounds: [
    { label: '清脆铃声', value: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3' },
    { label: '气泡音', value: 'https://cdn.pixabay.com/audio/2024/08/04/audio_245277864b.mp3' },
    { label: '魔法音效', value: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c29d0c6f5d.mp3' },
  ],
  stickers: [
    { label: '圣诞袜', value: '🧦', type: 'emoji' },
    { label: '圣诞树', value: '🎄', type: 'emoji' },
    { label: '礼物盒', value: '🎁', type: 'emoji' },
    { label: '圣诞老人', value: '🎅', type: 'emoji' },
    { label: '麋鹿', value: '🦌', type: 'emoji' },
    { label: '姜饼人', value: '🍪', type: 'emoji' },
    { label: '铃铛', value: '🔔', type: 'emoji' },
    { label: '雪人', value: '⛄', type: 'emoji' },
  ]
};

export const DEFAULT_CONFIG: AppConfig = {
  particleCount: 100,
  particleSize: 3,
  particleSpeed: 1,
  particleColor: '#FFD700',
  glassBlur: 12,
  glassOpacity: 0.85,
  bgType: 'color', 
  bgValue: '#0f172a',
  enableSnow: true,
  bgMusicUrl: PRESETS.music[0].value,
  clickSoundUrl: PRESETS.clickSounds[0].value,
  enableSound: true,
  decorationPicker: null,
  capsuleText: '',
  treeTextLevels: '1圣→诞→圣诞→快乐→圣诞快乐→圣诞快乐→圣诞快乐快乐→圣诞快乐快乐→圣诞快乐圣诞快乐→圣诞快乐圣诞快乐',
  treeBottomLetters: 'L/H/J/C/Y/E',
};

export const christmasTreeCardConfigMetadata = {
  panelTitle: '圣诞树贺卡配置',
  panelSubtitle: 'Design Your Christmas Tree Card',
  configSchema: {
    particleCount: { category: 'visual' as const, type: 'slider' as const, label: '氛围粒子密度', min: 20, max: 300, step: 10 },
    particleSize: { category: 'visual' as const, type: 'slider' as const, label: '粒子尺寸', min: 1, max: 6, step: 0.5 },
    particleSpeed: { category: 'visual' as const, type: 'slider' as const, label: '粒子速度', min: 0.1, max: 3, step: 0.1 },
    particleColor: { category: 'visual' as const, type: 'color' as const, label: '主题点缀色' },
    glassBlur: { category: 'visual' as const, type: 'slider' as const, label: '卡片磨砂程度', min: 0, max: 24, step: 1 },
    glassOpacity: { category: 'visual' as const, type: 'slider' as const, label: '卡片透明度', min: 0.1, max: 1, step: 0.05 },
    bgType: { category: 'background' as const, type: 'select' as const, label: '背景类型', options: [{label: '纯色', value: 'color'}, {label: '图片', value: 'image'}, {label: '视频', value: 'video'}] },
    bgValue: { category: 'background' as const, type: 'input' as const, label: '背景地址/颜色', placeholder: 'URL or Hex Color' },
    enableSnow: { category: 'background' as const, type: 'switch' as const, label: '开启粒子雪花' },
    enableSound: { category: 'audio' as const, type: 'switch' as const, label: '启用音效' },
    bgMusicUrl: { category: 'audio' as const, type: 'select-input' as const, label: '背景音乐', options: PRESETS.music },
    clickSoundUrl: { category: 'audio' as const, type: 'select' as const, label: '点击音效', options: PRESETS.clickSounds },
    decorationPicker: { category: 'decoration' as const, type: 'sticker-picker' as const, label: '添加装饰', options: PRESETS.stickers },
    capsuleText: { category: 'content' as const, type: 'input' as const, label: '一键祝福', placeholder: '替换"圣诞快乐"' },
    treeTextLevels: { category: 'content' as const, type: 'textarea' as const, label: '树体文案 (→分隔)' },
    treeBottomLetters: { category: 'content' as const, type: 'input' as const, label: '树干字母 (/分隔)' },
  },
  tabs: [
    { id: 'visual' as const, label: '视觉', icon: null },
    { id: 'background' as const, label: '背景', icon: null },
    { id: 'audio' as const, label: '音效', icon: null },
    { id: 'decoration' as const, label: '装饰', icon: null },
    { id: 'content' as const, label: '内容', icon: null },
  ],
  mobileSteps: [
    { id: 1, label: '基础', icon: null, fields: ['bgType' as const, 'bgValue' as const, 'enableSnow' as const] },
    { id: 2, label: '样式', icon: null, fields: ['particleCount' as const, 'particleColor' as const, 'glassBlur' as const] },
    { id: 3, label: '内容', icon: null, fields: ['capsuleText' as const, 'treeTextLevels' as const, 'treeBottomLetters' as const] },
  ],
};

/**
 * ==============================================================================
 * 2. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  decorations?: DecorationItem[];
  setDecorations?: React.Dispatch<React.SetStateAction<DecorationItem[]>>;
  isPanelOpen?: boolean;
  onAddSticker?: (sticker: any) => void;
}

export function DisplayUI({ config, decorations: decorationsProp, setDecorations: setDecorationsProp, isPanelOpen = false, onAddSticker }: DisplayUIProps) {
  // 内部状态管理装饰品（如果外部没有提供）
  const [internalDecorations, setInternalDecorations] = useState<DecorationItem[]>([]);
  const decorations = decorationsProp ?? internalDecorations;
  const setDecorations = setDecorationsProp ?? setInternalDecorations;
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'drag' | 'rotate' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const dragOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 背景音乐逻辑
  useEffect(() => {
     if(bgAudioRef.current && isPlaying) {
        bgAudioRef.current.play().catch(e => {
           console.log("Auto-play blocked after source change", e);
           setIsPlaying(false);
        });
     }
  }, [config.bgMusicUrl]);

  const toggleMusic = async () => {
    if (!bgAudioRef.current) return;
    if (isPlaying) {
      bgAudioRef.current.pause();
    } else {
      try {
        setAudioError(false);
        await bgAudioRef.current.play();
      } catch (err) {
        console.error("Play failed:", err);
        setAudioError(true);
        setIsPlaying(false);
      }
    }
  };

  // 点击音效逻辑
  const playClickSound = useCallback(() => {
    if (!config.enableSound) return;
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => playFallbackSound());
    } else {
      playFallbackSound();
    }
  }, [config.enableSound]);

  const playFallbackSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("Web Audio API fallback also failed", e);
    }
  };

  // 添加装饰品
  const handleAddSticker = useCallback((sticker: any) => {
    // 如果外部提供了 onAddSticker，使用外部的
    if (onAddSticker) {
      onAddSticker(sticker);
      return;
    }
    
    // 否则使用内部状态管理
    if (!setDecorations) return;
    
    const newDeco: DecorationItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: sticker.type || 'emoji',
      content: sticker.value,
      x: 50 + (Math.random() - 0.5) * 20,  // 随机位置，中心附近
      y: 40 + (Math.random() - 0.5) * 20,
      scale: 1,
      rotation: Math.random() * 30 - 15,  // 随机旋转 -15° 到 15°
    };
    
    setDecorations(prev => [...prev, newDeco]);
    playClickSound();
  }, [onAddSticker, setDecorations, playClickSound]);

  // 监听 config.decorationPicker 的变化，当配置面板添加装饰时触发
  useEffect(() => {
    if (config.decorationPicker && typeof config.decorationPicker === 'object') {
      handleAddSticker(config.decorationPicker);
    }
  }, [config.decorationPicker, handleAddSticker]);

  // 删除装饰品
  const handleDelete = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (setDecorations) {
      setDecorations(prev => prev.filter(d => d.id !== id));
    }
    if (activeId === id) setActiveId(null);
  };

  // 交互处理：开始拖拽或旋转
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: 'drag' | 'rotate', currentData: {x: number, y: number, rotation: number}) => {
    e.stopPropagation();
    playClickSound();
    
    setActiveId(id);
    setInteractionMode(type);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    if (type === 'drag') {
        const clickXPercent = ((clientX - rect.left) / rect.width) * 100;
        const clickYPercent = ((clientY - rect.top) / rect.height) * 100;
        dragOffsetRef.current = {
          x: clickXPercent - currentData.x,
          y: clickYPercent - currentData.y
        };
    }
  };

  // 交互处理：全局移动
  useEffect(() => {
    if (!interactionMode || !activeId) return;
    const container = containerRef.current;
    if (!container) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const rect = container.getBoundingClientRect();
      let clientX, clientY;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (!setDecorations) return;
      setDecorations(prev => prev.map(deco => {
        if (deco.id !== activeId) return deco;

        if (interactionMode === 'drag') {
            const mouseXPercent = ((clientX - rect.left) / rect.width) * 100;
            const mouseYPercent = ((clientY - rect.top) / rect.height) * 100;
            let newX = mouseXPercent - dragOffsetRef.current.x;
            let newY = mouseYPercent - dragOffsetRef.current.y;
            return { ...deco, x: newX, y: newY };
        } else if (interactionMode === 'rotate') {
            const centerX = rect.left + (deco.x / 100) * rect.width;
            const centerY = rect.top + (deco.y / 100) * rect.height;
            
            const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
            const angleDeg = angleRad * (180 / Math.PI);
            
            return { ...deco, rotation: angleDeg + 90 };
        }
        return deco;
      }));
    };

    const handleGlobalUp = () => {
      setInteractionMode(null);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [interactionMode, activeId, setDecorations, decorations]);

  const handleBackgroundClick = () => {
    setActiveId(null);
  };

  // Glass Card Component
  const GlassCard = ({ children, className = "", variant = 'white' }: any) => {
    const bgColor = variant === 'green' ? `rgba(74, 222, 128, ${config.glassOpacity})` : `rgba(255, 255, 255, ${config.glassOpacity})`;
    return (
      <div 
        onClick={(e) => { e.stopPropagation(); playClickSound(); }}
        className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 text-slate-900 border border-white/40 ${className}`}
        style={{
          backdropFilter: `blur(${config.glassBlur}px)`,
          WebkitBackdropFilter: `blur(${config.glassBlur}px)`,
          backgroundColor: bgColor,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50 pointer-events-none"/>
        <div className="relative z-10 font-bold">{children}</div>
      </div>
    );
  };

  const treeLevels = config.treeTextLevels.split('→').map(t => t.trim()).filter(Boolean);
  const bottomLetters = config.treeBottomLetters.split('/').map(t => t.trim()).filter(Boolean);

  return (
    <div 
      ref={containerRef}
      onClick={handleBackgroundClick}
      className={`relative w-full h-full overflow-hidden transition-all duration-300 select-none ${isPanelOpen ? 'md:ml-[400px] w-auto' : ''}`}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black">
        {config.bgType === 'color' && <div className="w-full h-full transition-colors duration-500" style={{ background: config.bgValue }} />}
        {config.bgType === 'image' && <img src={config.bgValue} className="w-full h-full object-cover animate-fadeIn" alt="bg" />}
        {config.bgType === 'video' && <video key={config.bgValue} src={config.bgValue} className="w-full h-full object-cover animate-fadeIn" autoPlay loop muted playsInline />}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <ParticleCanvas count={config.particleCount} size={config.particleSize} speed={config.particleSpeed} color={config.particleColor} enable={config.enableSnow} />

      {/* Decorations Layer */}
      <div className="absolute inset-0 z-40 overflow-hidden touch-none">
        {decorations && decorations.length > 0 && decorations.map(deco => {
          const isSelected = activeId === deco.id;
          return (
            <div
              key={deco.id}
              style={{
                left: `${deco.x}%`,
                top: `${deco.y}%`,
                transform: `translate(-50%, -50%) rotate(${deco.rotation}deg) scale(${deco.scale})`,
                zIndex: isSelected ? 100 : 50,
                touchAction: 'none',
              }}
              className="absolute group"
            >
              <div className={`relative ${isSelected ? 'scale-105' : ''}`}>
                <div
                  onMouseDown={(e) => handleInteractionStart(e, deco.id, 'drag', deco)}
                  onTouchStart={(e) => handleInteractionStart(e, deco.id, 'drag', deco)}
                  className="cursor-move active:cursor-grabbing"
                >
                  {deco.type === 'emoji' ? (
                    <span className="text-5xl drop-shadow-lg pointer-events-none select-none">{deco.content}</span>
                  ) : (
                    <img src={deco.content} alt="sticker" className="w-20 h-20 object-contain drop-shadow-lg pointer-events-none select-none" draggable={false} />
                  )}
                </div>
                
                {isSelected && (
                  <>
                    <div className="absolute -inset-3 border-2 border-dashed border-white/80 rounded-xl pointer-events-none animate-pulse opacity-70" />
                    <div className="absolute left-1/2 bottom-full h-8 w-0.5 bg-white/80 -translate-x-1/2 pointer-events-none" />
                    <div 
                      className="absolute left-1/2 bottom-[calc(100%+32px)] -translate-x-1/2 w-10 h-10 p-2 bg-white text-pink-500 rounded-full shadow-lg flex items-center justify-center cursor-alias hover:scale-110 active:scale-95 transition-transform z-50 touch-none"
                      onMouseDown={(e) => handleInteractionStart(e, deco.id, 'rotate', deco)}
                      onTouchStart={(e) => handleInteractionStart(e, deco.id, 'rotate', deco)}
                    >
                      <RotateCw size={18} strokeWidth={3} className="pointer-events-none" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, deco.id)}
                      onTouchStart={(e) => handleDelete(e, deco.id)}
                      className="absolute -top-5 -right-5 w-8 h-8 bg-red-500 text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Christmas Tree */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
        <div className="scale-[0.85] md:scale-100 transition-transform duration-500 pointer-events-auto flex flex-col items-center">
          <div onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="mb-4 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)] cursor-pointer hover:scale-125 transition-transform animate-pulse">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          </div>
          <div className="grid grid-cols-2 gap-x-8 md:gap-x-12 gap-y-3 md:gap-y-4 items-center justify-items-center">
            {treeLevels.map((text, index) => {
              const isLeft = index % 2 === 0;
              const rowIndex = Math.floor(index / 2);
              const minWidth = 60 + (rowIndex * 30);
              const displayText = config.capsuleText && text.includes('圣诞快乐') ? text.replace('圣诞快乐', config.capsuleText) : text;
              return (<div key={index} className={`${isLeft ? 'justify-self-end' : 'justify-self-start'}`}><GlassCard variant={isLeft ? 'green' : 'white'} className="px-4 py-2 md:px-5 md:py-2.5 flex items-center justify-center text-center whitespace-nowrap min-h-[40px]"><span style={{ minWidth: `${minWidth}px` }} className="text-sm md:text-lg font-bold">{displayText}</span></GlassCard></div>);
            })}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">{bottomLetters.map((char, i) => (<div key={i} onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="w-12 h-12 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-lg border border-white/20 text-white font-bold text-xl cursor-pointer hover:bg-white/50 transition-colors">{char}</div>))}</div>
        </div>
      </div>

      {/* Music Toggle */}
      <div className="absolute top-6 right-6 z-40 flex flex-col items-end gap-2">
        <button onClick={(e) => { e.stopPropagation(); toggleMusic(); }} className={`p-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg transition-all hover:scale-110 ${isPlaying ? 'bg-pink-500 text-white animate-spin-slow' : 'bg-black/30 text-white/70'}`}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}</button>
        {audioError && (<div className="text-[10px] text-red-300 bg-black/50 px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle size={10} /> 播放失败</div>)}
      </div>

      <audio ref={bgAudioRef} src={config.bgMusicUrl} loop crossOrigin="anonymous" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => setAudioError(true)} />
      <audio ref={clickAudioRef} src={config.clickSoundUrl} crossOrigin="anonymous" preload="auto" />

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}

/**
 * ==============================================================================
 * 3. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function ChristmasTreeCardPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [decorations, setDecorations] = useState<DecorationItem[]>([]);
  const [isPanelOpen] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-50">
      <DisplayUI config={config} decorations={decorations} setDecorations={setDecorations} isPanelOpen={isPanelOpen} />
    </main>
  );
}
