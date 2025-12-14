'use client';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import type { AppConfig } from './config';

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

export default function BirthdayRomanceDisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen?: boolean }) {
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
