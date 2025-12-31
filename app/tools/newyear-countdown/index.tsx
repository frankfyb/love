'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
  targetDate: string;
  titleText: string;
  recipientName: string;
  fireworkDensity: number; 
  explosionRange: number;
  greetings: string[];
  bgValue: string;        // 背景配置值 (颜色/图片URL/视频URL)
  bgMusicUrl: string;
  enableSound: boolean;
}

export type BgType = 'image' | 'video' | 'color';

// 预设资源库
export const PRESETS = {
  backgrounds: [
    { label: '极致深黑 (纯色)', value: '#05050f', type: 'color', thumbnail: '' },
    { label: '午夜深蓝 (纯色)', value: '#0f172a', type: 'color', thumbnail: '' },
    { label: '皇家紫 (纯色)', value: '#240a34', type: 'color', thumbnail: '' },
    { label: '唯美飘雪 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/20471-309698211.mp4', type: 'video' },
    { label: '温馨壁炉 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/23881-337972830_small.mp4', type: 'video' },
    { label: '极光雪夜', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2670&auto=format&fit=crop', type: 'image' },
    { label: '繁华都市', value: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop', type: 'image' },
  ],
  music: [
    { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
    { label: 'Jingle Bells (Upbeat)', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
  ],
  greetingTemplates: [
    '✨ 新年快乐 ✨',
    '🧨 万事如意 🧨', 
    '❤ 岁岁平安 ❤',
    '💰 恭喜发财 💰', 
    '🌸 前程似锦 🌸',
    '平安喜乐',
    '大吉大利',
    '恭贺新春',
    '新春快乐',
  ],
};

export const DEFAULT_CONFIG: AppConfig = {
  targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
  titleText: '距离 2026 跨年还有',
  recipientName: '致 最特别的你',
  fireworkDensity: 25, 
  explosionRange: 16, 
  greetings: PRESETS.greetingTemplates,
  bgValue: PRESETS.backgrounds[1].value, // 默认午夜深蓝
  bgMusicUrl: PRESETS.music[0].value, 
  enableSound: true,
};

// 配置面板元数据
export const newYearCountdownCardConfigMetadata = {
  panelTitle: '专属新年烟花配置',
  panelSubtitle: 'Create Your Exclusive Moment',
  configSchema: {
    recipientName: { category: 'content' as const, type: 'input' as const, label: '接收人姓名', placeholder: '例如：亲爱的 Alice' },
    titleText: { category: 'content' as const, type: 'input' as const, label: '倒计时标题', placeholder: '距离 2026 跨年还有' },
    targetDate: { category: 'content' as const, type: 'datetime' as const, label: '目标日期', timeType: 'datetime' as const, description: '选择倒计时的目标日期和时间' },
    greetings: { category: 'content' as const, type: 'list' as const, label: '爆炸祝福语', placeholder: '输入祝福语', description: '每行一句，随机出现' },
    
    // Background Category
    bgValue: { 
      category: 'background' as const, 
      type: 'media-grid' as const, 
      label: '背景场景', 
      mediaType: 'background' as const, 
      defaultItems: PRESETS.backgrounds 
    },

    explosionRange: { category: 'visual' as const, type: 'slider' as const, label: '烟花爆炸范围', min: 5, max: 30, step: 1 },
    fireworkDensity: { category: 'visual' as const, type: 'slider' as const, label: '烟花发射密度', min: 10, max: 60, step: 5, help: '数值越小越密集' },
    
    enableSound: { category: 'background' as const, type: 'switch' as const, label: '启用音效' },
    bgMusicUrl: { category: 'background' as const, type: 'media-picker' as const, label: '背景音乐', mediaType: 'music' as const, defaultItems: PRESETS.music },
  },
  tabs: [
    { id: 'content' as const, label: '定制', icon: null },
    { id: 'background' as const, label: '背景', icon: null },
    { id: 'visual' as const, label: '视觉', icon: null },
  ],
  mobileSteps: [
    { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const, 'targetDate' as const] },
    { id: 2, label: '祝福语', icon: null, fields: ['greetings' as const] },
    { id: 3, label: '背景场景', icon: null, fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
    { id: 4, label: '视觉调整', icon: null, fields: ['explosionRange' as const, 'fireworkDensity' as const] },
  ],
};

// 音效素材
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
 * 2. 音效管理器 (SoundManager)
 * ==============================================================================
 */
class SoundManager {
  private pools: { [key: string]: HTMLAudioElement[] } = {};
  private cursors: { [key: string]: number } = {};
  private enabled: boolean = true;

  constructor() {
    if (typeof window === 'undefined') return;
    this.initPool('lift', AUDIO_SOURCES.lift, 6);
    this.initPool('burst', AUDIO_SOURCES.burst, 12);
    this.initPool('crackle', AUDIO_SOURCES.crackle, 6);
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

    if (!audio.paused) audio.currentTime = 0;
    
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

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  hue: number;
  decay: number;
  gravity: number;
  friction: number;
  size: number;

  constructor(x: number, y: number, hue: number, maxSpeed: number) {
    this.x = x;
    this.y = y;
    const angle = random(0, Math.PI * 2);
    const speed = random(2, maxSpeed); 
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.hue = hue + random(-30, 30);
    this.alpha = 1;
    this.decay = random(0.01, 0.025);
    this.gravity = 0.05; 
    this.friction = 0.95; 
    this.size = random(1.5, 3.0);
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${this.alpha})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

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
    const speed = random(13, 16);
    
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    this.trail.push({x: this.x, y: this.y});
    if(this.trail.length > 5) this.trail.shift();

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
    ctx.strokeStyle = `hsla(${this.hue}, 100%, 75%, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class TextEmber {
    x: number;
    y: number;
    text: string;
    alpha: number;
    hue: number;
    life: number;
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
        this.life = 180; 
        this.vx = random(-0.2, 0.2); 
        this.vy = random(-0.3, -0.6);
        this.dashOffset = 0;
    }

    update() {
        if (this.scale < 1.0) {
            this.scale += 0.08;
            this.alpha = Math.min(1, this.alpha + 0.08);
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.dashOffset -= 1;
            this.life--;
            if (this.life < 60) {
                this.alpha -= 0.02; 
                this.scale += 0.003; 
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        ctx.font = "bold 60px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.setLineDash([3, 4]); 
        ctx.lineDashOffset = this.dashOffset;
        
        ctx.lineWidth = 2.5; 
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 90%, ${this.alpha})`; 
        ctx.strokeText(this.text, 0, 0);
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.7})`;
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
  const [isTimeUp, setIsTimeUp] = useState(false); // 新增：是否到达目标时间
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0); // 新增：当前祝福语索引
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!config.enableSound);

  const shells = useRef<Shell[]>([]);
  const particles = useRef<Particle[]>([]);
  const texts = useRef<TextEmber[]>([]);
  const timer = useRef(0);

  // 稳健的背景类型检测
  const bgType = (() => {
    const val = config.bgValue || '';
    if (val.startsWith('#') || val.startsWith('rgb')) return 'color';
    if (/\.(mp4|webm|ogg|mov)$/i.test(val)) return 'video';
    if (val.includes('/video/')) return 'video';
    return 'image';
  })();

  // 统一获取祝福语列表
  const getGreetingList = useCallback(() => {
    let list: string[] = [];
    if (Array.isArray(config.greetings)) {
      list = config.greetings;
    } else if (typeof config.greetings === 'string') {
      list = (config.greetings as string).split('\n').filter(s => s.trim() !== '');
    }
    return list.length > 0 ? list : PRESETS.greetingTemplates;
  }, [config.greetings]);

  // 祝福语轮播定时器
  useEffect(() => {
    if (!isTimeUp) return;
    const greetingList = getGreetingList();
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prev) => (prev + 1) % greetingList.length);
    }, 4000); // 每4秒切换一次
    return () => clearInterval(interval);
  }, [isTimeUp, getGreetingList]);

  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    soundManagerRef.current.setEnabled(!isMuted);
  }, []);

  useEffect(() => {
    soundManagerRef.current?.setEnabled(!isMuted);
  }, [isMuted]);

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
        setIsTimeUp(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTimeUp(true); // 时间到
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [config.targetDate]);

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

      // 画布清除逻辑
      if (bgType === 'color') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; 
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalCompositeOperation = 'lighter';

      // 发射器
      timer.current++;
      if (timer.current >= config.fireworkDensity) {
         if (shells.current.length < 5) {
             const startX = random(width * 0.1, width * 0.9);
             const targetX = random(width * 0.1, width * 0.9);
             // 如果倒计时结束，烟花可以炸得更高，铺满全屏
             const minHeight = isTimeUp ? 0.1 : 0.15;
             const maxHeight = isTimeUp ? 0.6 : 0.5;
             const targetY = random(height * minHeight, height * maxHeight);
             
             shells.current.push(new Shell(startX, height, targetX, targetY));
             soundManagerRef.current?.play('lift');
             
             if (Math.random() > 0.7) {
                 setTimeout(() => {
                    shells.current.push(new Shell(random(width * 0.2, width * 0.8), height, random(width*0.2, width*0.8), random(height*0.2, height*0.5)));
                    soundManagerRef.current?.play('lift');
                 }, 150);
             }
         }
         timer.current = 0;
      }

      // 逻辑更新与绘制...
      for (let i = shells.current.length - 1; i >= 0; i--) {
        const s = shells.current[i];
        s.update();
        s.draw(ctx);
        if (s.exploded) {
          soundManagerRef.current?.play('burst');
          if (Math.random() > 0.5) setTimeout(() => soundManagerRef.current?.play('crackle'), 100);
          
          const particleCount = Math.floor(random(80, 120)); 
          for (let k = 0; k < particleCount; k++) {
            particles.current.push(new Particle(s.x, s.y, s.hue, config.explosionRange));
          }

          // 文字烟花生成逻辑：仅在未到达目标时间（倒计时阶段）生成
          // 到达目标时间后，文字由 UI 层统一展示
          if (!isTimeUp && texts.current.length < 1 && random(0, 1) > 0.6 && s.y < height * 0.65) {
             const greetingList = getGreetingList();
             const text = greetingList[Math.floor(random(0, greetingList.length))];
             if (text) texts.current.push(new TextEmber(s.x, s.y, text, s.hue));
          }
          shells.current.splice(i, 1);
        }
      }

      if (particles.current.length > 800) particles.current.splice(0, particles.current.length - 800);
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.current.splice(i, 1);
      }

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
  }, [config, bgType, isTimeUp, getGreetingList]); // 添加依赖

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

  const greetingList = getGreetingList();

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black">
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0">
        {bgType === 'color' && <div className="w-full h-full transition-colors duration-500" style={{ background: config.bgValue }} />}
        {bgType === 'image' && <img src={config.bgValue} className="w-full h-full object-cover animate-fadeIn" alt="bg" />}
        {bgType === 'video' && (
          <video 
            key={config.bgValue} 
            src={config.bgValue} 
            className="w-full h-full object-cover animate-fadeIn" 
            autoPlay 
            loop 
            muted 
            playsInline 
          />
        )}
        {(bgType === 'image' || bgType === 'video') && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />}
      </div>

      {/* 2. Canvas 层 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 cursor-pointer touch-none block"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      />

      {/* 3. 倒计时/祝福 UI */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
         {!isTimeUp ? (
           // 倒计时状态
           <div className="text-center animate-fade-in mix-blend-screen transition-opacity duration-1000">
              {config.recipientName && (
                <div className="text-white/90 text-xl md:text-3xl mb-6 font-serif tracking-widest animate-pulse drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  {config.recipientName}
                </div>
              )}
              <h1 className="text-white/80 text-lg md:text-2xl mb-8 tracking-[0.4em] font-light uppercase drop-shadow-lg">
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
         ) : (
           // 新年祝福状态
           <div className="text-center animate-fade-in flex flex-col items-center justify-center w-full h-full">
              <div className="relative z-50 p-8">
                <h1 
                  key={currentGreetingIndex} // key 变化触发重绘动画
                  className="text-white font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-pulse-slow transition-all duration-1000"
                >
                  {greetingList[currentGreetingIndex]}
                </h1>
                {config.recipientName && (
                  <div className="mt-12 text-white/80 text-2xl md:text-3xl font-light tracking-[0.5em] animate-slide-up">
                    {config.recipientName}
                  </div>
                )}
              </div>
           </div>
         )}
      </div>

      {/* 4. 控制按钮 */}
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
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .animate-slide-up { animation: slideUp 1.5s ease-out forwards; }
        .animate-pulse-slow { animation: pulseSlow 3s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseSlow { 
          0%, 100% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.85; transform: scale(1.05); } 
        }
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

export default function NewYearCountdownCardPage() {
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  return <DisplayUI config={config} />;
}