'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, XCircle } from 'lucide-react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';

// 导入配置和工具函数
import {
  AppConfig,
  BgType,
  DecorationItem,
  DEFAULT_CONFIG,
  PRESETS,
  detectBgType,
  playFallbackSound,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig, BgType, DecorationItem };
export { DEFAULT_CONFIG, PRESETS };
export { christmasTreeCardConfigMetadata } from './config';

/**
 * ==============================================================================
 * 原生 Canvas 粒子组件
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
      x: number; y: number; size: number; speedY: number; speedX: number; opacity: number;
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

        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
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
 * 主组件 (DisplayUI)
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
  const [internalDecorations, setInternalDecorations] = useState<DecorationItem[]>([]);
  const decorations = decorationsProp ?? internalDecorations;
  const setDecorations = setDecorationsProp ?? setInternalDecorations;
  const [interactionMode, setInteractionMode] = useState<'drag' | 'rotate' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const dragOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    audioRef: bgAudioRef,
    isPlaying,
    isMuted,
    handlePlayPause,
    handleToggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.5,
  });

  const bgType = detectBgType(config.bgValue);

  const playClickSound = useCallback(() => {
    if (!config.enableSound) return;
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => playFallbackSound());
    } else {
      playFallbackSound();
    }
  }, [config.enableSound]);

  const handleAddSticker = useCallback((sticker: any) => {
    if (onAddSticker) { onAddSticker(sticker); return; }
    if (!setDecorations) return;

    const newDeco: DecorationItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: sticker.type || 'emoji',
      content: sticker.value,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 40 + (Math.random() - 0.5) * 20,
      scale: 1,
      rotation: Math.random() * 30 - 15,
    };

    setDecorations(prev => [...prev, newDeco]);
    playClickSound();
  }, [onAddSticker, setDecorations, playClickSound]);

  useEffect(() => {
    if (config.decorationPicker && typeof config.decorationPicker === 'object') {
      handleAddSticker(config.decorationPicker);
    }
  }, [config.decorationPicker, handleAddSticker]);

  const handleDelete = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (setDecorations) { setDecorations(prev => prev.filter(d => d.id !== id)); }
    if (activeId === id) setActiveId(null);
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: 'drag' | 'rotate', currentData: { x: number, y: number, rotation: number }) => {
    e.stopPropagation();
    playClickSound();
    setActiveId(id);
    setInteractionMode(type);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }

    if (type === 'drag') {
      const clickXPercent = ((clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((clientY - rect.top) / rect.height) * 100;
      dragOffsetRef.current = { x: clickXPercent - currentData.x, y: clickYPercent - currentData.y };
    }
  };

  useEffect(() => {
    if (!interactionMode || !activeId) return;
    const container = containerRef.current;
    if (!container) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const rect = container.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
      else { clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY; }

      if (!setDecorations) return;
      setDecorations(prev => prev.map(deco => {
        if (deco.id !== activeId) return deco;
        if (interactionMode === 'drag') {
          const mouseXPercent = ((clientX - rect.left) / rect.width) * 100;
          const mouseYPercent = ((clientY - rect.top) / rect.height) * 100;
          return { ...deco, x: mouseXPercent - dragOffsetRef.current.x, y: mouseYPercent - dragOffsetRef.current.y };
        } else if (interactionMode === 'rotate') {
          const centerX = rect.left + (deco.x / 100) * rect.width;
          const centerY = rect.top + (deco.y / 100) * rect.height;
          const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
          return { ...deco, rotation: angleRad * (180 / Math.PI) + 90 };
        }
        return deco;
      }));
    };

    const handleGlobalUp = () => { setInteractionMode(null); };

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

  const handleBackgroundClick = () => { setActiveId(null); };

  const GlassCard = ({ children, className = "", variant = 'white' }: any) => {
    const bgColor = variant === 'green' ? `rgba(74, 222, 128, ${config.glassOpacity})` : `rgba(255, 255, 255, ${config.glassOpacity})`;
    return (
      <div
        onClick={(e) => { e.stopPropagation(); playClickSound(); }}
        className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 text-slate-900 border border-white/40 ${className}`}
        style={{ backdropFilter: `blur(${config.glassBlur}px)`, WebkitBackdropFilter: `blur(${config.glassBlur}px)`, backgroundColor: bgColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 font-bold">{children}</div>
      </div>
    );
  };

  const treeLevels = config.treeTextLevels.split('→').map(t => t.trim()).filter(Boolean);
  const bottomLetters = config.treeBottomLetters.split('/').map(t => t.trim()).filter(Boolean);

  return (
    <div ref={containerRef} onClick={handleBackgroundClick} className={`relative w-full h-full overflow-hidden transition-all duration-300 select-none ${isPanelOpen ? 'md:ml-[400px] w-auto' : ''}`}>
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black">
        {bgType === 'color' && <div className="w-full h-full transition-colors duration-500" style={{ background: config.bgValue }} />}
        {bgType === 'image' && <img src={config.bgValue} className="w-full h-full object-cover animate-fadeIn" alt="bg" />}
        {bgType === 'video' && <video key={config.bgValue} src={config.bgValue} className="w-full h-full object-cover animate-fadeIn" autoPlay loop muted playsInline />}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <ParticleCanvas count={config.particleCount} size={config.particleSize} speed={config.particleSpeed} color={config.particleColor} enable={config.enableSnow} />

      {/* Decorations Layer */}
      <div className="absolute inset-0 z-40 overflow-hidden touch-none">
        {decorations && decorations.length > 0 && decorations.map(deco => {
          const isSelected = activeId === deco.id;
          return (
            <div key={deco.id} style={{ left: `${deco.x}%`, top: `${deco.y}%`, transform: `translate(-50%, -50%) rotate(${deco.rotation}deg) scale(${deco.scale})`, zIndex: isSelected ? 100 : 50, touchAction: 'none' }} className="absolute group">
              <div className={`relative ${isSelected ? 'scale-105' : ''}`}>
                <div onMouseDown={(e) => handleInteractionStart(e, deco.id, 'drag', deco)} onTouchStart={(e) => handleInteractionStart(e, deco.id, 'drag', deco)} className="cursor-move active:cursor-grabbing">
                  {deco.type === 'emoji' ? <span className="text-5xl drop-shadow-lg pointer-events-none select-none">{deco.content}</span> : <img src={deco.content} alt="sticker" className="w-20 h-20 object-contain drop-shadow-lg pointer-events-none select-none" draggable={false} />}
                </div>
                {isSelected && (
                  <>
                    <div className="absolute -inset-3 border-2 border-dashed border-white/80 rounded-xl pointer-events-none animate-pulse opacity-70" />
                    <div className="absolute left-1/2 bottom-full h-8 w-0.5 bg-white/80 -translate-x-1/2 pointer-events-none" />
                    <div className="absolute left-1/2 bottom-[calc(100%+32px)] -translate-x-1/2 w-10 h-10 p-2 bg-white text-pink-500 rounded-full shadow-lg flex items-center justify-center cursor-alias hover:scale-110 active:scale-95 transition-transform z-50 touch-none" onMouseDown={(e) => handleInteractionStart(e, deco.id, 'rotate', deco)} onTouchStart={(e) => handleInteractionStart(e, deco.id, 'rotate', deco)}>
                      <RotateCw size={18} strokeWidth={3} className="pointer-events-none" />
                    </div>
                    <button onClick={(e) => handleDelete(e, deco.id)} onTouchStart={(e) => handleDelete(e, deco.id)} className="absolute -top-5 -right-5 w-8 h-8 bg-red-500 text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
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

      {/* 音效控制面板 */}
      <AudioControlPanel isPlaying={isPlaying} isMuted={isMuted} onPlayPause={handlePlayPause} onToggleMute={handleToggleMute} enabled={config.enableSound} position="bottom-right" size="sm" />

      <audio ref={bgAudioRef} src={config.bgMusicUrl} loop crossOrigin="anonymous" />
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
