'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置 (Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  targetDate: string;
  titleText: string;
  fireworkDensity: number; 
  greetings: string[];
  bgMusicUrl: string;
  enableSound: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
  titleText: '距离 2026 跨年还有',
  fireworkDensity: 20, 
  greetings: [
    '✨ 新年快乐 ✨', '🧨 万事如意 🧨', '❤ 岁岁平安 ❤', 
    '💰 恭喜发财 💰', '🌸 前程似锦 🌸', '平安喜乐', '大吉大利'
  ],
  bgMusicUrl: 'https://cdn.pixabay.com/audio/2022/12/16/audio_108f52236d.mp3', 
  enableSound: true,
};

// 音效素材映射
const AUDIO_SOURCES = {
  lift: [
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift2.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift3.mp3',
  ],
  burst: [
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3',
  ],
  crackle: [
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle1.mp3',
    'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle-sm-1.mp3',
  ]
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * ==============================================================================
 * 2. 高级音频管理器 (Advanced Sound Manager)
 * ==============================================================================
 */
class SoundManager {
  private pools: { [key: string]: HTMLAudioElement[] } = {};
  private cursors: { [key: string]: number } = {};
  private enabled: boolean = true;

  constructor() {
    if (typeof window === 'undefined') return;
    
    this.initPool('lift', AUDIO_SOURCES.lift, 6);
    this.initPool('burst', AUDIO_SOURCES.burst, 15);
    this.initPool('crackle', AUDIO_SOURCES.crackle, 8);
  }

  private initPool(category: string, urls: string[], count: number) {
    this.pools[category] = [];
    this.cursors[category] = 0;
    
    for (let i = 0; i < count; i++) {
      const url = urls[i % urls.length];
      const audio = new Audio(url);
      audio.preload = 'auto';
      if (category === 'lift') audio.volume = 0.3;
      if (category === 'burst') audio.volume = 0.5;
      if (category === 'crackle') audio.volume = 0.2;
      this.pools[category].push(audio);
    }
  }

  public play(category: 'lift' | 'burst' | 'crackle') {
    if (!this.enabled || !this.pools[category]) return;
    
    const pool = this.pools[category];
    const cursor = this.cursors[category];
    const audio = pool[cursor];
    
    if (!audio) return;

    if (!audio.paused) {
      audio.currentTime = 0;
    }
    
    const baseVol = category === 'burst' ? 0.6 : (category === 'lift' ? 0.3 : 0.25);
    audio.volume = Math.max(0, Math.min(1, baseVol + random(-0.1, 0.1)));
    audio.playbackRate = category === 'lift' ? random(0.8, 1.2) : random(0.9, 1.1);

    audio.play().catch(() => {});
    this.cursors[category] = (cursor + 1) % pool.length;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
  }
}

/**
 * ==============================================================================
 * 3. 物理引擎 (Physics Engine)
 * ==============================================================================
 */

// 3.1 爆炸粒子 (Spark) - 核心优化
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  hue: number;
  brightness: number;
  decay: number;
  gravity: number;
  friction: number;
  flicker: boolean;
  size: number;

  constructor(x: number, y: number, hue: number) {
    this.x = x;
    this.y = y;
    
    const angle = random(0, Math.PI * 2);
    // 速度分布优化：让粒子扩散更自然
    const speed = random(2, 16); 
    
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.hue = hue + random(-30, 30);
    this.brightness = random(50, 80);
    this.alpha = 1;
    // 寿命优化：衰减变慢，存活更久，线条更长
    this.decay = random(0.008, 0.02); 
    
    // 物理优化：减小重力，减小空气阻力(friction接近1)，让运动更丝滑
    this.gravity = 0.05; 
    this.friction = 0.96; 
    this.flicker = Math.random() > 0.4;
    this.size = random(1, 2.5);
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    
    this.x += this.vx;
    this.y += this.vy;
    
    this.alpha -= this.decay;
    if (this.brightness > 30) this.brightness -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    
    ctx.beginPath();
    
    // 优化：绘制圆形粒子，配合全屏拖尾层实现自然轨迹，放弃生硬的连线
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    
    let light = this.brightness;
    if (this.flicker) {
       light = this.brightness + random(-20, 20);
    }
    
    ctx.fillStyle = `hsla(${this.hue}, 100%, ${light}%, ${this.alpha})`;
    ctx.fill();
    
    // 闪烁核心
    if (this.flicker && Math.random() > 0.8) {
        ctx.beginPath();
        ctx.fillStyle = '#FFF';
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI*2);
        ctx.fill();
    }
  }
}

// 3.2 升空烟花 (Shell)
class Shell {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  hue: number;
  exploded: boolean;
  trail: {x: number, y: number}[];
  distToTarget: number;
  distTraveled: number;

  constructor(startX: number, startY: number, targetX: number, targetY: number) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.exploded = false;
    this.trail = [];
    
    this.hue = random(0, 360);
    
    const dx = targetX - startX;
    const dy = targetY - startY;
    this.distToTarget = Math.sqrt(dx*dx + dy*dy);
    this.distTraveled = 0;
    
    const angle = Math.atan2(dy, dx);
    const speed = random(13, 17);
    
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    this.trail.push({x: this.x, y: this.y});
    if(this.trail.length > 6) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    
    const v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    this.distTraveled += v;
    
    this.vy += 0.04; 

    if (this.distTraveled >= this.distToTarget || v < 2) {
      this.exploded = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.trail.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(this.trail[0].x, this.trail[0].y);
    for(let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
    }
    
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, 0.6)`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

// 3.3 文字灰烬 (Text Ember)
class TextEmber {
    x: number;
    y: number;
    text: string;
    alpha: number;
    hue: number;
    life: number;
    maxLife: number;
    scale: number;
    vx: number;
    vy: number;
    dashOffset: number;

    constructor(x: number, y: number, text: string, hue: number) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.hue = hue;
        this.alpha = 0;
        this.scale = 0.5; 
        this.maxLife = 220;
        this.life = this.maxLife; 
        
        this.vx = random(-0.2, 0.2); 
        this.vy = random(-0.3, -0.6);
        this.dashOffset = 0;
    }

    update() {
        if (this.scale < 1.0) {
            this.scale += 0.05;
            this.alpha = Math.min(1, this.alpha + 0.05);
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.dashOffset -= 1;
            this.life--;
            if (this.life < 80) {
                this.alpha -= 0.015; 
                this.scale += 0.002; 
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        ctx.font = "bold 64px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.setLineDash([3, 4]); 
        ctx.lineDashOffset = this.dashOffset;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 85%, ${this.alpha})`;
        ctx.strokeText(this.text, 0, 0);
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.6})`;
        ctx.strokeText(this.text, 0, 0);

        ctx.restore();
    }
}

/**
 * ==============================================================================
 * 4. 主组件 (DisplayUI)
 * ==============================================================================
 */

export function DisplayUI({ config }: { config: AppConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!config.enableSound);

  // 动画数据
  const shells = useRef<Shell[]>([]);
  const particles = useRef<Particle[]>([]);
  const texts = useRef<TextEmber[]>([]);
  const timer = useRef(0);

  // 初始化音效管理器
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    soundManagerRef.current.setEnabled(!isMuted);
  }, []);

  // 监听静音切换
  useEffect(() => {
    soundManagerRef.current?.setEnabled(!isMuted);
  }, [isMuted]);

  // 倒计时
  useEffect(() => {
    const calc = () => {
      const diff = new Date(config.targetDate).getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [config.targetDate]);

  // 核心动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    let rafId: number;

    const resize = () => {
      if (!containerRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerRef.current.clientWidth * dpr;
      canvas.height = containerRef.current.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // 1. 绘制背景 & 拖尾
      // 降低透明度 (0.15 -> 0.12)，让上一帧残留更久，形成自然的流光拖尾
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 5, 8, 0.12)'; 
      ctx.fillRect(0, 0, width, height);

      // 2. 之后的绘制全部使用 lighter 模式 (光效叠加)
      ctx.globalCompositeOperation = 'lighter';

      // 3. 发射器逻辑
      timer.current++;
      if (timer.current >= config.fireworkDensity) {
         const startX = random(width * 0.1, width * 0.9);
         const targetX = random(width * 0.1, width * 0.9);
         const targetY = random(height * 0.15, height * 0.5);
         
         shells.current.push(new Shell(startX, height, targetX, targetY));
         soundManagerRef.current?.play('lift');
         
         if (Math.random() > 0.6) {
             setTimeout(() => {
                shells.current.push(new Shell(random(width * 0.2, width * 0.8), height, random(width*0.2, width*0.8), random(height*0.2, height*0.5)));
                soundManagerRef.current?.play('lift');
             }, 100);
         }
         timer.current = 0;
      }

      // 4. 更新升空烟花
      for (let i = shells.current.length - 1; i >= 0; i--) {
        const s = shells.current[i];
        s.update();
        s.draw(ctx);
        if (s.exploded) {
          soundManagerRef.current?.play('burst');
          if (Math.random() > 0.5) {
             setTimeout(() => soundManagerRef.current?.play('crackle'), 100);
          }
          
          const particleCount = Math.floor(random(120, 180));
          for (let k = 0; k < particleCount; k++) {
            particles.current.push(new Particle(s.x, s.y, s.hue));
          }

          if (random(0, 1) > 0.6 && s.y < height * 0.65) {
             const text = config.greetings[Math.floor(random(0, config.greetings.length))];
             texts.current.push(new TextEmber(s.x, s.y, text, s.hue));
          }

          shells.current.splice(i, 1);
        }
      }

      // 5. 更新爆炸粒子
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.current.splice(i, 1);
      }

      // 6. 更新文字
      for (let i = texts.current.length - 1; i >= 0; i--) {
         const t = texts.current[i];
         t.update();
         t.draw(ctx);
         if (t.alpha <= 0 && t.life <= 0) texts.current.splice(i, 1);
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [config]);

  // 点击发射
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (bgAudioRef.current && bgAudioRef.current.paused && isPlaying) {
        bgAudioRef.current.play().catch(()=>{});
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const startX = random(rect.width * 0.1, rect.width * 0.9);
    shells.current.push(new Shell(startX, rect.height, x, y));
    soundManagerRef.current?.play('lift');
  };

  const toggleMusic = () => {
    if (!bgAudioRef.current) return;
    if (isPlaying) {
      bgAudioRef.current.pause();
    } else {
      bgAudioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full bg-[#050508] overflow-hidden select-none">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 cursor-pointer touch-none block"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      />

      {/* 倒计时 UI */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center mix-blend-screen">
         <div className="text-center animate-fade-in px-4">
            <h1 className="text-white/60 text-lg md:text-2xl mb-8 tracking-[0.4em] font-light uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {config.titleText}
            </h1>
            <div className="flex items-start justify-center gap-3 md:gap-8">
               <TimeUnit num={timeLeft.days} label="DAYS" />
               <Separator />
               <TimeUnit num={timeLeft.hours} label="HOURS" />
               <Separator />
               <TimeUnit num={timeLeft.minutes} label="MINS" />
               <Separator />
               <TimeUnit num={timeLeft.seconds} label="SECS" isSeconds />
            </div>
         </div>
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
        <button onClick={toggleMusic} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white transition-all active:scale-95">
           {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 text-white transition-all active:scale-95">
           {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <audio ref={bgAudioRef} src={config.bgMusicUrl} loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@200;600&display=swap');
        .animate-fade-in { animation: fadeIn 2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const Separator = () => <div className="text-xl md:text-5xl text-white/20 font-light mt-1 md:mt-2">:</div>;

function TimeUnit({ num, label, isSeconds = false }: { num: number, label: string, isSeconds?: boolean }) {
  return (
    <div className="flex flex-col items-center w-14 md:w-24">
      <span 
        className="font-['Inter'] font-semibold tabular-nums leading-none tracking-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
        style={{ 
          fontSize: isSeconds ? 'clamp(2.5rem, 6vw, 4.5rem)' : 'clamp(2rem, 5vw, 3.5rem)',
          color: isSeconds ? '#FFD700' : '#ffffff'
        }}
      >
        {num.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] md:text-xs text-white/40 mt-2 tracking-widest">{label}</span>
    </div>
  );
}

export default function NewYearCountdownPage() {
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  return <DisplayUI config={config} />;
}