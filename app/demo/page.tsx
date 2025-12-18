'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, X, ChevronUp, Sparkles } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration & Types)
 * ==============================================================================
 */

export type FireworkStyle = 'classic' | 'heart' | 'star';

export interface AppConfig {
  // 基础场景
  backgroundType: 'seaside' | 'night' | 'custom';
  customBgUrl: string;
  globalOpacity: number;
  
  // 视觉风格
  fireworkColor: string; // 主色调
  particleCount: number; // 爆炸粒子密度
  trailLength: number; // 拖尾长度
  fireworkStyle: FireworkStyle; // 烟花形状类型
  
  // 交互与文字
  wishText: string;
  showAppleTrigger: boolean; 
  textDuration: number; // 文字烟花燃烧时长 (秒)
  textResolution: number; // 文字采样密度 (越小越密，建议 4-6)
  
  // 物理参数
  gravity: number;
  wind: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  backgroundType: 'seaside',
  customBgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop', 
  globalOpacity: 0.2, 
  
  fireworkColor: '#FFD700',
  particleCount: 150,
  trailLength: 0.92,
  fireworkStyle: 'classic',
  
  wishText: "平安夜快乐\nAll I Want Is You",
  showAppleTrigger: true,
  textDuration: 5, // 默认5秒
  textResolution: 5,
  
  gravity: 0.15,
  wind: 0,
};

export const CONFIG_METADATA = {
  backgroundType: {
    label: '背景场景',
    type: 'select',
    options: [
      { label: '静谧海边', value: 'seaside' },
      { label: '深邃夜空', value: 'night' },
      { label: '自定义图片', value: 'custom' },
    ]
  },
  customBgUrl: { label: '自定义背景URL', type: 'text', showIf: (c: AppConfig) => c.backgroundType === 'custom' },
  
  fireworkStyle: {
    label: '烟花/粒子形状',
    type: 'select',
    options: [
      { label: '经典圆形', value: 'classic' },
      { label: '浪漫爱心', value: 'heart' },
      { label: '闪烁星形', value: 'star' },
    ]
  },
  
  fireworkColor: { label: '烟花主色', type: 'color' },
  wishText: { label: '许愿祝福文字', type: 'textarea' },
  textDuration: { label: '文字燃烧时长(秒)', type: 'slider', min: 2, max: 20, step: 1 },
  
  particleCount: { label: '爆炸粒子数', type: 'slider', min: 50, max: 400, step: 10 },
  gravity: { label: '重力系数', type: 'slider', min: 0.05, max: 0.5, step: 0.01 },
  showAppleTrigger: { label: '显示平安果按钮', type: 'boolean' },
};

/**
 * ==============================================================================
 * 2. 内部工具函数 & 粒子类 (Utility Functions & Classes)
 * ==============================================================================
 */
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// 辅助：绘制不同形状
const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, style: FireworkStyle) => {
  if (style === 'heart') {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.fill();
  } else if (style === 'star') {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;
    let rot = Math.PI / 2 * 3;
    let cx = x;
    let cy = y;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      cx = x + Math.cos(rot) * outerRadius;
      cy = y + Math.sin(rot) * outerRadius;
      ctx.lineTo(cx, cy);
      rot += step;

      cx = x + Math.cos(rot) * innerRadius;
      cy = y + Math.sin(rot) * innerRadius;
      ctx.lineTo(cx, cy);
      rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
  } else {
    // Classic circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
};

// 1. 普通爆炸粒子
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
  gravity: number;
  style: FireworkStyle;
  size: number;

  constructor(x: number, y: number, color: string, gravity: number, style: FireworkStyle) {
    this.x = x;
    this.y = y;
    const angle = random(0, Math.PI * 2);
    const speed = random(1, 6);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.color = color;
    this.decay = random(0.01, 0.03);
    this.gravity = gravity;
    this.style = style;
    this.size = random(1, 3);
  }

  update() {
    this.vx *= 0.95; 
    this.vy *= 0.95;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    drawShape(ctx, this.x, this.y, this.size, this.style);
  }
}

// 2. 文字构成粒子 (Text Particles)
class TextParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  alpha: number;
  flickerSpeed: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string, duration: number) {
    this.baseX = x;
    this.baseY = y;
    // 初始位置稍微随机，模拟汇聚或燃烧抖动
    this.x = x + random(-2, 2);
    this.y = y + random(-2, 2);
    this.size = random(1, 2.5);
    this.color = color;
    this.alpha = 0; // Fade in
    this.flickerSpeed = random(0.02, 0.05);
    this.maxLife = duration * 60; // 60fps approx
    this.life = 0;
  }

  update() {
    this.life++;
    
    // Fade in and out logic
    if (this.life < 30) {
      this.alpha = this.life / 30;
    } else if (this.life > this.maxLife - 60) {
      this.alpha = (this.maxLife - this.life) / 60;
    } else {
      // Shimmer effect
      this.alpha = 0.8 + Math.sin(this.life * this.flickerSpeed) * 0.2;
    }

    // Gentle jitter like burning embers
    this.x = this.baseX + Math.sin(this.life * 0.1) * 1;
    this.y = this.baseY + Math.cos(this.life * 0.1) * 1;
    
    // Occasional spark falling
    if (Math.random() < 0.01) {
       this.y += 1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01) return;
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 4;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// 3. 烟花火箭
class Firework {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: {x: number, y: number}[];

  constructor(startX: number, startY: number, targetX: number, targetY: number, color: string) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.color = color;
    this.exploded = false;
    this.trail = [];
    
    const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
    const speed = distance / 40; 
    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > 5) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;

    const dist = Math.sqrt(Math.pow(this.x - this.targetX, 2) + Math.pow(this.y - this.targetY, 2));
    if (dist < 10 || this.vy > 0) { 
      this.exploded = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.trail.length > 0) {
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.stroke();
    }
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;

  constructor(w: number, h: number) {
    this.x = random(0, w);
    this.y = random(0, h / 2);
    this.vx = -random(10, 20); 
    this.vy = random(5, 10);
    this.maxLife = 30;
    this.life = this.maxLife;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const opacity = this.life / this.maxLife;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
    ctx.stroke();
  }
}


/**
 * ==============================================================================
 * 3. ConfigUI 组件 (Configuration Panel)
 * ==============================================================================
 */
export function ConfigUI({
  config,
  onChange,
  isOpen,
  setIsOpen
}: {
  config: AppConfig;
  onChange: (key: string, val: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const renderInput = (key: string, meta: any) => {
    if (meta.showIf && !meta.showIf(config)) return null;

    return (
      <div key={key} className="mb-4 group">
        <label className="block text-xs font-medium text-gray-200 mb-1 flex items-center gap-2">
          {meta.label}
        </label>
        
        {meta.type === 'select' && (
          <select
            value={(config as any)[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-sm"
          >
            {meta.options.map((opt: any) => (
              <option key={opt.value} value={opt.value} className="text-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {meta.type === 'color' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(config as any)[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="h-8 w-12 rounded bg-transparent cursor-pointer border-0"
            />
            <span className="text-xs text-gray-400 font-mono">{(config as any)[key]}</span>
          </div>
        )}

        {meta.type === 'slider' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={meta.min}
              max={meta.max}
              step={meta.step}
              value={(config as any)[key]}
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
              className="flex-1 accent-amber-400 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8 text-right text-gray-300">{(config as any)[key]}</span>
          </div>
        )}

        {meta.type === 'boolean' && (
          <button
            onClick={() => onChange(key, !(config as any)[key])}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              (config as any)[key] ? 'bg-amber-500' : 'bg-white/20'
            }`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${
               (config as any)[key] ? 'translate-x-5' : ''
            }`} />
          </button>
        )}

        {(meta.type === 'text' || meta.type === 'textarea') && (
           meta.type === 'textarea' ? 
           <textarea 
              value={(config as any)[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-amber-400"
           /> :
           <input
             type="text"
             value={(config as any)[key]}
             onChange={(e) => onChange(key, e.target.value)}
             className="w-full bg-white/10 border border-white/20 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
           />
        )}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-lg hover:bg-black/60 transition-all duration-300 ${
          isOpen ? 'top-4 right-4 md:right-auto md:left-[340px]' : 'top-4 left-4'
        }`}
      >
        {isOpen ? <X size={20} /> : <Settings size={20} />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-full md:w-80 bg-slate-900/60 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:h-screen h-auto max-h-[70vh] md:max-h-screen rounded-b-3xl md:rounded-none top-0`}
      >
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-6 flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            平安夜许愿配置
          </h2>
          <div className="space-y-2">
            {Object.entries(CONFIG_METADATA).map(([key, meta]) => renderInput(key, meta))}
          </div>
        </div>
        <div className="md:hidden h-6 w-full flex justify-center items-center bg-white/5 border-t border-white/10 cursor-pointer" onClick={() => setIsOpen(false)}>
           <ChevronUp size={16} className="text-white/50" />
        </div>
      </div>
    </>
  );
}

/**
 * ==============================================================================
 * 4. DisplayUI 组件 (Main Rendering & Interaction)
 * ==============================================================================
 */
export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const configRef = useRef(config);
  const particles = useRef<Particle[]>([]);
  const textParticles = useRef<TextParticle[]>([]);
  const fireworks = useRef<Firework[]>([]);
  const shootingStars = useRef<ShootingStar[]>([]);
  const animationId = useRef<number>(0);
  const appleTimer = useRef<NodeJS.Timeout | null>(null);

  const [applePosition, setApplePosition] = useState({ x: '50%', y: '85%' });
  const [isWishing, setIsWishing] = useState(false);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Helper: Convert Text to Particle Coords
  const createTextFirework = (text: string, width: number, height: number) => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    // Draw text
    const fontSize = width < 768 ? 40 : 80;
    ctx.font = `bold ${fontSize}px serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split lines
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const resolution = configRef.current.textResolution || 5; 
    
    // Scan pixels
    const newTextParticles: TextParticle[] = [];
    for (let y = 0; y < height; y += resolution) {
      for (let x = 0; x < width; x += resolution) {
        const index = (y * width + x) * 4;
        const alpha = imageData[index + 3];
        if (alpha > 128) {
           // Color Variation
           const color = Math.random() > 0.5 ? configRef.current.fireworkColor : '#ffffff';
           newTextParticles.push(new TextParticle(x, y, color, configRef.current.textDuration));
        }
      }
    }
    
    textParticles.current = newTextParticles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (window.innerWidth < 768) {
          setApplePosition({ x: '50%', y: '80%' });
      } else {
          setApplePosition({ x: '50%', y: '85%' });
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = () => {
      // Trail effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + (1 - configRef.current.trailLength) * 0.4})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.globalCompositeOperation = 'lighter';

      // 1. Fireworks
      for (let i = fireworks.current.length - 1; i >= 0; i--) {
        const fw = fireworks.current[i];
        fw.update();
        fw.draw(ctx);
        if (fw.exploded) {
          const color = fw.color;
          const count = configRef.current.particleCount;
          for (let j = 0; j < count; j++) {
            particles.current.push(new Particle(fw.x, fw.y, color, configRef.current.gravity, configRef.current.fireworkStyle));
          }
          fireworks.current.splice(i, 1);
        }
      }

      // 2. Explosion Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.current.splice(i, 1);
      }

      // 3. Text Particles (The Custom Wish)
      for (let i = textParticles.current.length - 1; i >= 0; i--) {
        const tp = textParticles.current[i];
        tp.update();
        tp.draw(ctx);
        if (tp.life > tp.maxLife) {
             textParticles.current.splice(i, 1);
             if (textParticles.current.length === 0) {
                 setIsWishing(false); // Reset state when all particles gone
             }
        }
      }

      // 4. Shooting Stars
      if (Math.random() < 0.005) {
        shootingStars.current.push(new ShootingStar(canvas.width, canvas.height));
      }
      for (let i = shootingStars.current.length - 1; i >= 0; i--) {
        const s = shootingStars.current[i];
        s.update();
        s.draw(ctx);
        if (s.life <= 0) shootingStars.current.splice(i, 1);
      }

      animationId.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId.current);
    };
  }, []);

  // --- Interactions ---

  const launchFirework = (x: number, y: number, color?: string) => {
    if (!canvasRef.current) return;
    const h = canvasRef.current.height;
    fireworks.current.push(new Firework(
      x + random(-20, 20), 
      h, 
      x, 
      y, 
      color || config.fireworkColor
    ));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
       for(let i=0; i<5; i++) {
          const p = new Particle(x, y, '#fff', 0.1, 'classic');
          p.vx *= 2; p.vy *= 2;
          particles.current.push(p);
       }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        launchFirework(
          centerX + random(-100, 100), 
          centerY + random(-100, 100),
          `hsl(${random(0, 360)}, 100%, 50%)`
        );
      }, i * 100);
    }
  };

  const handleAppleDown = () => {
    appleTimer.current = setTimeout(() => {
      if (!canvasRef.current) return;
      
      setIsWishing(true);
      
      // 1. Generate Text Particles
      createTextFirework(configRef.current.wishText, canvasRef.current.width, canvasRef.current.height);
      
      // 2. Launch Accompaniment Fireworks
      const w = window.innerWidth;
      const h = window.innerHeight;
      launchFirework(w * 0.2, h * 0.3, configRef.current.fireworkColor);
      setTimeout(() => launchFirework(w * 0.8, h * 0.3, configRef.current.fireworkColor), 300);

    }, 800);
  };

  const handleAppleUp = () => {
    if (appleTimer.current) {
      clearTimeout(appleTimer.current);
      appleTimer.current = null;
    }
  };

  const getBackgroundStyle = () => {
    if (config.backgroundType === 'custom') {
      return { backgroundImage: `url(${config.customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (config.backgroundType === 'night') {
      return { background: 'linear-gradient(to bottom, #020024 0%, #090979 35%, #000000 100%)' };
    }
    return { 
       background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 60%, #082f49 100%)',
    };
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={getBackgroundStyle()}
    >
      {config.backgroundType === 'seaside' && (
        <>
           <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-amber-100 shadow-[0_0_60px_rgba(255,255,255,0.4)] opacity-80 blur-[1px]" />
           <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
           <div className="absolute bottom-0 w-full h-32 bg-blue-900/10 blur-3xl" />
        </>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 touch-none"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      />

      {/* Removed the previous HTML Overlay for wishes. 
         Now the wish is rendered directly on canvas as particles.
      */}

      {config.showAppleTrigger && (
        <div
          className={`absolute transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer transition-all duration-500 ${isWishing ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
          style={{ left: applePosition.x, top: applePosition.y }}
          onPointerDown={handleAppleDown}
          onPointerUp={handleAppleUp}
          onPointerLeave={handleAppleUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg flex items-center justify-center border border-red-400/30">
                <div className="absolute -top-2 left-1/2 w-1 h-3 bg-green-700 rounded-full rotate-12" />
                <div className="absolute -top-2 left-1/2 w-3 h-3 bg-green-500 rounded-tr-xl rounded-bl-xl rotate-45" />
                <div className="absolute top-2 left-3 w-4 h-3 bg-white/30 rounded-full rotate-[-20deg] blur-[1px]" />
                <span className="text-white/90 font-serif text-xs mt-1">平安</span>
            </div>
          </div>
          <span className="text-white/60 text-xs font-light tracking-widest bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
            长按许愿
          </span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-white/30 text-xs pointer-events-none hidden md:block">
        双击释放烟花 · 长按平安果许愿
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 5. 主入口 (Main App Component)
 * ==============================================================================
 */
export default function ChristmasEvePage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsConfigOpen(false);
    }
  }, []);

  const handleConfigChange = useCallback((key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      <DisplayUI config={config} isPanelOpen={isConfigOpen} />
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isConfigOpen} 
        setIsOpen={setIsConfigOpen} 
      />
    </div>
  );
}