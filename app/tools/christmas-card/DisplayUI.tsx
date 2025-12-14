'use client';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import { AppConfig } from './config';

type Gift = { id: number; x: number; y: number; emoji: string; rotation: number };

const EMOJIS = ['🎁', '🍬', '🧸', '🎄', '🍪', '🔔', '🎅', '🦌'];

export default function ChristmasCardDisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen?: boolean }) {
  const [init, setInit] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const treeLevels = useMemo(() => config.treeTextLevels.split('→').map((t) => t.trim()).filter(Boolean), [config.treeTextLevels]);
  const bottomLetters = useMemo(() => config.treeBottomLetters.split('/').map((t) => t.trim()).filter(Boolean), [config.treeBottomLetters]);

  useEffect(() => {
    initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => setInit(true));
  }, []);

  const particlesOptions: ISourceOptions = useMemo(() => ({
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: { events: { onClick: { enable: false }, onHover: { enable: true, mode: 'bubble' } }, modes: { bubble: { distance: 200, size: 6, duration: 2, opacity: 1, color: config.particleColor } } },
    particles: {
      color: { value: ['#ffffff', config.particleColor] },
      move: { enable: true, speed: config.particleSpeed, direction: 'bottom', random: true, straight: false, outModes: { default: 'out' } },
      number: { density: { enable: true, area: 800 }, value: config.particleCount },
      opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1 } },
      shape: { type: ['circle', 'star'] },
      size: { value: { min: 1, max: config.particleSize } },
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
            <text key={i} x={i % 2 === 0 ? 300 : 100} y={y} fill={config.particleColor} fontSize="24" className="animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>✦</text>
          ))}
        </svg>

        <div className="relative z-30 mb-6 cursor-pointer hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]" onClick={(e) => { e.stopPropagation(); for (let i = 0; i < 5; i++) { setTimeout(() => spawnGift((e as any).clientX + (Math.random() * 100 - 50), (e as any).clientY), i * 100); } }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill={config.particleColor} className="animate-bounce-slow">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div className="flex flex-col gap-4 items-center">
            <div className="grid grid-cols-2 gap-x-12 gap-y-5 items-center justify-items-center">
              {treeLevels.map((text, index) => {
                 const isLeft = index % 2 === 0;
                 const rowIndex = Math.floor(index / 2);
                 const minWidth = 70 + (rowIndex * 35);
                 
                 const displayText = config.capsuleText && text.includes('圣诞快乐') 
                    ? text.replace('圣诞快乐', config.capsuleText) 
                    : text;

                 return (
                    <div key={index} className={`${isLeft ? 'justify-self-end' : 'justify-self-start'}`}>
                      <GlassCard
                        blur={config.glassBlur}
                        opacity={config.glassOpacity}
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
