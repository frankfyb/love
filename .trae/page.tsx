'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings, X, Sparkles, Play, Volume2, VolumeX } from "lucide-react";

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type ColorTheme = 'colorful' | 'classic' | 'custom';

export interface AppConfig {
  particleCount: number;    
  countdownNumber: number;  
  isCountdownActive: boolean; 
  finalText: string;        
  volume: number;
  enableSound: boolean;
  // 色彩配置
  colorTheme: ColorTheme;
  customColor1: string; // Hex
  customColor2: string; // Hex
}

// 音频资源库
const AUDIO_ASSETS = {
  burst: [
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-2.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3"
  ],
  crackle: [
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle-sm-1.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle1.mp3"
  ],
  lift: [
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift2.mp3",
    "https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift3.mp3"
  ]
};

const DEFAULT_CONFIG: AppConfig = {
  particleCount: 6000, 
  countdownNumber: 10,
  isCountdownActive: false,
  finalText: "2026\n新年快乐", 
  volume: 0.6,
  enableSound: true,
  colorTheme: 'colorful', 
  customColor1: '#ff00ff', 
  customColor2: '#ffd700', 
};

/**
 * ==============================================================================
 * 2. 核心引擎工具 (SoundEngine & ColorUtils)
 * ==============================================================================
 */

// Hex 转 HSL 辅助函数
function hexToHSL(hex: string): { h: number, s: number, l: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return { h, s, l };
}

class SoundPool {
  pools: Record<string, HTMLAudioElement[]> = {};
  limit: number = 10;
  volume: number = 0.5;
  enabled: boolean = true;

  constructor() {
    // 只有在客户端才初始化
    if (typeof window !== 'undefined') {
        this.initPool('burst', AUDIO_ASSETS.burst);
        this.initPool('crackle', AUDIO_ASSETS.crackle);
        this.initPool('lift', AUDIO_ASSETS.lift);
    }
  }

  initPool(key: string, urls: string[]) {
    this.pools[key] = [];
    if (typeof window !== 'undefined') {
        for (let i = 0; i < 5; i++) {
            const url = urls[i % urls.length];
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.pools[key].push(audio);
        }
    }
  }

  play(type: 'burst' | 'crackle' | 'lift') {
    if (!this.enabled || typeof window === 'undefined') return;
    
    // 懒加载初始化 (如果 constructor 时是服务端)
    if (!this.pools[type] || this.pools[type].length === 0) {
        if(type === 'burst') this.initPool('burst', AUDIO_ASSETS.burst);
        if(type === 'crackle') this.initPool('crackle', AUDIO_ASSETS.crackle);
        if(type === 'lift') this.initPool('lift', AUDIO_ASSETS.lift);
    }

    const pool = this.pools[type];
    if (!pool || pool.length === 0) return;
    
    let audio = pool.find(a => a.paused);
    if (!audio) {
        if (pool.length < this.limit) {
            const urls = AUDIO_ASSETS[type];
            audio = new Audio(urls[Math.floor(Math.random() * urls.length)]);
            pool.push(audio);
        } else {
            audio = pool[0];
            audio.currentTime = 0;
        }
    } else {
        const urls = AUDIO_ASSETS[type];
        if (Math.random() > 0.6) {
            audio.src = urls[Math.floor(Math.random() * urls.length)];
        }
    }
    audio.volume = this.volume;
    audio.play().catch(e => {});
  }

  setVolume(v: number) {
    this.volume = v;
  }
}

const soundSystem = new SoundPool();

/**
 * 粒子系统定义
 */
type ParticleState = "IDLE" | "ROCKET_ASCEND" | "EXPLODE_TO_TEXT" | "TEXT_HOLD" | "DISSIPATE" | "SIDE_FIREWORK";
type ParticleRole = "TEXT" | "ROCKET" | "SIDE_BLAST" | "SPARK" | "INTERACTIVE_ROCKET"; 

interface Point { x: number; y: number; }

// 背景星光
class StarParticle {
    x: number;
    y: number;
    size: number;
    baseAlpha: number;
    alpha: number;
    blinkSpeed: number;
    blinkOffset: number;

    constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.5;
        this.baseAlpha = Math.random() * 0.6 + 0.2;
        this.alpha = this.baseAlpha;
        this.blinkSpeed = 0.002 + Math.random() * 0.005;
        this.blinkOffset = Math.random() * Math.PI * 2;
    }

    update(time: number) {
        this.alpha = this.baseAlpha + Math.sin(time * this.blinkSpeed + this.blinkOffset) * 0.2;
    }
}

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 2;
  alpha: number = 0;
  
  state: ParticleState = "IDLE";
  role: ParticleRole = "TEXT";
  
  // 色彩
  hue: number = 0;
  sat: number = 100;
  light: number = 50;
  
  // 目标位置
  targetX: number = 0;
  targetY: number = 0;
  
  // 随机性参数
  wobble: number = 0;
  
  constructor(w: number, h: number) {
    this.reset(w, h);
  }

  reset(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = h + 100;
    this.alpha = 0;
    this.state = "IDLE";
  }

  // 获取随机颜色基于配置 (防泛白逻辑)
  assignColor(config: AppConfig, type: 'text' | 'firework') {
    const minLight = 40;
    const maxLight = 60;

    if (config.colorTheme === 'colorful') {
        this.hue = Math.random() * 360;
        this.sat = 100;
        this.light = minLight + Math.random() * (maxLight - minLight);
    } 
    else if (config.colorTheme === 'custom') {
        const c1 = hexToHSL(config.customColor1);
        const c2 = hexToHSL(config.customColor2);
        const useC1 = Math.random() > 0.5;
        const base = useC1 ? c1 : c2;
        
        this.hue = base.h + (Math.random() - 0.5) * 30; 
        this.sat = base.s;
        this.light = Math.min(base.l, maxLight); 
    }
    else {
        // Classic: 金 + 紫
        if (Math.random() > 0.5) {
             this.hue = 45; // Gold
             this.sat = 100;
             this.light = 50; 
        } else {
             this.hue = 280 + Math.random() * 40; // Purple/Pink
             this.sat = 100;
             this.light = 55;
        }
    }
  }

  // 1. 发射火箭
  launchRocket(startX: number, startY: number, targetX: number, targetY: number, config: AppConfig, role: ParticleRole = "ROCKET") {
    this.role = role;
    this.state = "ROCKET_ASCEND";
    this.x = startX;
    this.y = startY;
    
    this.targetX = targetX;
    this.targetY = targetY;

    // 交互火箭速度稍快
    const timeSteps = role === "INTERACTIVE_ROCKET" ? 30 : 40;
    this.vx = (targetX - startX) / timeSteps;
    this.vy = (targetY - startY) / timeSteps;
    
    this.alpha = 1;
    this.size = Math.random() * 2 + 2;
    
    this.assignColor(config, 'firework');
    // 火箭头部稍微亮一点
    this.light = Math.min(this.light + 10, 65);

    this.wobble = Math.random() * Math.PI * 2;
  }

  // 2. 炸开成文字
  explodeToText(targetX: number, targetY: number, config: AppConfig) {
    this.role = "TEXT";
    this.state = "EXPLODE_TO_TEXT";
    this.targetX = targetX;
    this.targetY = targetY;
    
    const angle = Math.random() * Math.PI * 2;
    const force = Math.random() * 15;
    this.vx = Math.cos(angle) * force;
    this.vy = Math.sin(angle) * force;

    this.alpha = 1;
    this.assignColor(config, 'text');
    this.size = Math.random() * 2.5 + 1.0;
  }

  // 3. 侧边/全域/交互烟花爆炸
  launchBlast(w: number, h: number, type: 'side' | 'full' | 'interactive', config: AppConfig) {
    this.role = "SIDE_BLAST";
    this.state = "SIDE_FIREWORK";
    
    if (type !== 'interactive') {
        let centerX, centerY;
        if (type === 'side') {
            const side = Math.random() > 0.5 ? 0.2 : 0.8;
            centerX = w * side + (Math.random()-0.5) * (w * 0.1);
            centerY = h * 0.4 + (Math.random()-0.5) * (h * 0.2);
        } else {
            centerX = Math.random() * w;
            centerY = Math.random() * h * 0.6; 
        }
        this.x = centerX;
        this.y = centerY;
    }
    
    const angle = Math.random() * Math.PI * 2;
    const force = Math.random() * (type === 'full' ? 20 : 12) + 3;
    
    this.vx = Math.cos(angle) * force;
    this.vy = Math.sin(angle) * force;
    
    this.assignColor(config, 'firework');
    
    this.alpha = 1;
    this.size = Math.random() * 2.5 + 0.5;
  }
}

/**
 * ==============================================================================
 * 3. 配置面板组件 (ConfigUI)
 * ==============================================================================
 */

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, val: any) => void;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

function ConfigPanel({ config, onChange, isOpen, onClose, onRestart }: ConfigPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onPointerDown={(e) => e.stopPropagation()}>
      <div className="bg-[#1a1a1a]/90 w-full max-w-md mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-pink-500" size={20} />
            庆典设置
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
             <label className="text-sm text-gray-300 flex items-center gap-2">
                <Sparkles size={14} /> 色彩主题
             </label>
             <div className="grid grid-cols-3 gap-2">
                 {(['colorful', 'classic', 'custom'] as const).map(theme => (
                     <button
                        key={theme}
                        onClick={() => onChange('colorTheme', theme)}
                        className={`py-2 text-xs rounded-lg border transition-all ${config.colorTheme === theme ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-white/5 border-transparent text-gray-400'}`}
                     >
                        {theme === 'colorful' ? '缤纷多彩' : theme === 'classic' ? '经典紫金' : '自定义'}
                     </button>
                 ))}
             </div>
             
             {config.colorTheme === 'custom' && (
                 <div className="flex gap-4 pt-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-500">主色调</label>
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <input 
                                type="color" 
                                value={config.customColor1}
                                onChange={(e) => onChange('customColor1', e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                            />
                            <span className="text-xs font-mono text-gray-400">{config.customColor1}</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-500">副色调</label>
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <input 
                                type="color" 
                                value={config.customColor2}
                                onChange={(e) => onChange('customColor2', e.target.value)}
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                            />
                            <span className="text-xs font-mono text-gray-400">{config.customColor2}</span>
                        </div>
                    </div>
                 </div>
             )}
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
             <label className="text-sm text-gray-300 flex items-center gap-2">
                <Sparkles size={14} /> 收尾祝福语
             </label>
             <textarea 
               value={config.finalText}
               onChange={(e) => onChange('finalText', e.target.value)}
               className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none transition-colors h-20 resize-none"
               placeholder="输入倒计时结束后的文字..."
             />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} /> 粒子设置
            </h3>
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex justify-between">
                <span>粒子密度</span>
                <span className="text-xs text-gray-500">{config.particleCount}</span>
              </label>
              <input 
                type="range" min="2000" max="10000" step="500"
                value={config.particleCount}
                onChange={(e) => onChange('particleCount', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          <button 
            onClick={() => { onRestart(); onClose(); }}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-pink-500/25 active:scale-95 transition-all"
          >
            重新开始倒计时
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<StarParticle[]>([]);
  const textPointsRef = useRef<Point[]>([]);
  
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef(config); 

  useEffect(() => {
    configRef.current = config;
  }, [config]);
  
  // 初始化
  useEffect(() => {
    // 移动端减少粒子数
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 8000 : 15000;

    if (particlesRef.current.length < maxParticles) {
        const needed = maxParticles - particlesRef.current.length;
        for (let i = 0; i < needed; i++) {
            particlesRef.current.push(new Particle(window.innerWidth, window.innerHeight));
        }
    }
    if (starsRef.current.length < 300) {
        for (let i = 0; i < 300; i++) {
            starsRef.current.push(new StarParticle(window.innerWidth, window.innerHeight));
        }
    }
  }, []);

  useEffect(() => {
    soundSystem.enabled = config.enableSound;
    soundSystem.setVolume(config.volume);
  }, [config.volume, config.enableSound]);

  // 生成文字点阵
  const generateTextPoints = useCallback((text: string, width: number, height: number) => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];

    const isMobile = width < 768;
    const isMultiLine = text.includes('\n');
    
    // 字体调整
    let fontSize = isMobile ? width * 0.55 : height * 0.6;
    if (isMultiLine) fontSize = isMobile ? width * 0.25 : height * 0.3; 
    if (text.length > 2 && !isMultiLine) fontSize *= 0.5; 
    
    ctx.font = `900 ${fontSize}px "Microsoft YaHei", "Arial Black", sans-serif`;
    ctx.fillStyle = "white"; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const points: Point[] = [];
    const gap = isMobile ? 3 : 4; 

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        if (imageData[(y * width + x) * 4 + 3] > 64) {
          points.push({ x, y });
        }
      }
    }
    return points.sort(() => Math.random() - 0.5);
  }, []);

  // 生成爆炸效果 (从一个点炸出多个粒子)
  const spawnExplosion = useCallback((x: number, y: number, colorConfig: AppConfig | null = null) => {
      const activeParticles = particlesRef.current;
      const countToSpawn = 80; // 爆炸粒子数量
      let spawned = 0;
      
      // 随机起点遍历，防止总是复用相同的粒子
      let startIndex = Math.floor(Math.random() * activeParticles.length);
      
      const configToUse = colorConfig || configRef.current;

      for (let i = 0; i < activeParticles.length; i++) {
          if (spawned >= countToSpawn) break;
          const idx = (startIndex + i) % activeParticles.length;
          const p = activeParticles[idx];
          
          if (p.state === "IDLE" || p.alpha <= 0) {
              p.x = x;
              p.y = y;
              p.state = "SIDE_FIREWORK";
              p.role = "SPARK";
              
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 8 + 2; // 爆炸范围
              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed;
              p.alpha = 1;
              p.size = Math.random() * 2 + 1;
              
              // 赋予颜色
              p.assignColor(configToUse, 'firework');
              
              spawned++;
          }
      }
  }, []);

  // 点击触发烟花
  const handleInteraction = useCallback((e: React.PointerEvent) => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const rect = canvas.getBoundingClientRect();
     const targetX = e.clientX - rect.left;
     const targetY = e.clientY - rect.top;
     
     soundSystem.play('lift');

     const activeParticles = particlesRef.current;
     const rocketCount = 5;
     let launched = 0;
     const currentConfig = configRef.current;

     for (let i = 0; i < activeParticles.length; i++) {
         if (launched >= rocketCount) break;
         const p = activeParticles[i];
         if (p.state === "IDLE" || p.state === "DISSIPATE" || p.alpha <= 0) {
             const startX = Math.random() * window.innerWidth;
             const startY = window.innerHeight;
             p.launchRocket(startX, startY, targetX, targetY, currentConfig, "INTERACTIVE_ROCKET");
             launched++;
         }
     }
  }, []);

  // 单步执行逻辑
  const runSequence = useCallback((currentCount: number) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const activeParticles = particlesRef.current;
    
    const isFinal = currentCount <= 0;
    const currentConfig = configRef.current; 
    const displayText = isFinal ? currentConfig.finalText : currentCount.toString();
    
    // 1. 生成点阵
    const points = generateTextPoints(displayText, width, height);
    textPointsRef.current = points;

    // 2. 发射火箭 (Phase 1)
    soundSystem.play('lift');
    
    const rocketGroups = 8;
    const rocketParticlesPerGroup = 10; 
    let particleIdx = 0;
    
    for (let g = 0; g < rocketGroups; g++) {
        const startX = width * 0.1 + Math.random() * width * 0.8;
        const startY = height;
        const targetX = width / 2 + (Math.random() - 0.5) * (width * 0.2);
        const targetY = height / 2 + (Math.random() - 0.5) * (height * 0.2);
        
        for (let k = 0; k < rocketParticlesPerGroup; k++) {
            while(particleIdx < activeParticles.length) {
                const p = activeParticles[particleIdx];
                if (p.state === "IDLE" || p.state === "DISSIPATE" || p.alpha <= 0) {
                    p.launchRocket(
                        startX + (Math.random()-0.5)*10, 
                        startY, 
                        targetX, 
                        targetY,
                        currentConfig
                    );
                    break;
                }
                particleIdx++;
            }
            particleIdx++;
        }
    }

    // 3. 炸开成字 (Phase 2)
    const burstDelay = 400; // 火箭飞行时间
    setTimeout(() => {
        soundSystem.play('burst');
        
        let allocated = 0;
        const totalPoints = points.length;
        
        for (let i = 0; i < activeParticles.length; i++) {
            if (allocated >= totalPoints) break;
            const p = activeParticles[i];
            
            if (p.state === "ROCKET_ASCEND" || p.state === "IDLE" || p.state === "DISSIPATE") {
                const target = points[allocated];
                if (p.state !== "ROCKET_ASCEND") {
                    p.x = width / 2 + (Math.random()-0.5) * 50;
                    p.y = height / 2 + (Math.random()-0.5) * 50;
                }
                if (p.role !== "INTERACTIVE_ROCKET") {
                    p.explodeToText(target.x, target.y, currentConfig);
                    allocated++;
                }
            }
        }
        
        // 自动烟花：倒计时结束时的全屏烟花，或者数字切换时的伴随烟花
        if (isFinal) {
             for(let i=0; i<8; i++) {
                 setTimeout(() => {
                     spawnExplosion(
                         Math.random() * width, 
                         Math.random() * height * 0.6, 
                         currentConfig
                     );
                 }, i * 200);
             }
        } else {
             // 数字切换时，两侧放几个烟花
             spawnExplosion(width * 0.2, height * 0.4, currentConfig);
             spawnExplosion(width * 0.8, height * 0.4, currentConfig);
        }

    }, burstDelay);

    // 4. 消散 (Phase 3)
    const holdDuration = isFinal ? 3000 : 900;
    
    setTimeout(() => {
        soundSystem.play('crackle');
        activeParticles.forEach(p => {
            if (p.state === "TEXT_HOLD" || p.state === "EXPLODE_TO_TEXT") {
                p.state = "DISSIPATE";
                p.vx = (Math.random() - 0.5) * 3;
                p.vy = Math.random() * 3;
            }
        });
    }, burstDelay + holdDuration);

    if (!isFinal) {
        timerIdRef.current = setTimeout(() => {
            runSequence(currentCount - 1);
        }, 1000);
    } 

  }, [generateTextPoints, spawnExplosion]); 

  // 启动/停止逻辑
  useEffect(() => {
    if (config.isCountdownActive) {
        if (timerIdRef.current) clearTimeout(timerIdRef.current);
        runSequence(config.countdownNumber); 
    } else {
        if (timerIdRef.current) clearTimeout(timerIdRef.current);
    }
    return () => { if (timerIdRef.current) clearTimeout(timerIdRef.current); };
  }, [config.isCountdownActive, config.countdownNumber, runSequence]);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let loopId = 0;
    let time = 0;
    
    const render = () => {
      time += 0.016;
      
      // 背景
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 星星
      ctx.globalCompositeOperation = "source-over";
      starsRef.current.forEach(star => {
          star.update(time);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.6})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // 粒子 - 混合模式
      ctx.globalCompositeOperation = "lighter";
      const activeParticles = particlesRef.current;
      const currentConfig = configRef.current;

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        if (p.state === "IDLE") continue;

        // --- ROCKET ASCEND ---
        if (p.state === "ROCKET_ASCEND") {
            p.x += p.vx;
            p.y += p.vy;
            
            const wobble = Math.sin(time * 20 + p.wobble) * 1.0;
            const drawX = p.x + wobble;
            
            // 尾迹 (带颜色)
            ctx.beginPath();
            ctx.moveTo(drawX, p.y);
            ctx.lineTo(drawX - p.vx * 3, p.y - p.vy * 3);
            ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha * 0.6})`;
            ctx.lineWidth = p.size * 0.8;
            ctx.lineCap = "round";
            ctx.stroke();
            
            // 头部
            ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 1)`;
            ctx.beginPath();
            ctx.arc(drawX, p.y, p.size * 0.6, 0, Math.PI*2);
            ctx.fill();

            // 逻辑: 到达目标
            if (Math.abs(p.y - p.targetY) < 20) {
                 if (p.role === "INTERACTIVE_ROCKET") {
                     // 交互火箭：到达后炸出真正的烟花
                     soundSystem.play('burst');
                     p.alpha = 0; // 隐藏自己
                     p.state = "IDLE"; 
                     spawnExplosion(p.x, p.y, currentConfig); // 生成爆炸群
                 } else {
                     // 文字火箭：等待定时器转化为文字
                     p.alpha = 0; 
                 }
            }
        }
        
        // --- EXPLODE TO TEXT ---
        else if (p.state === "EXPLODE_TO_TEXT") {
            p.x += (p.targetX - p.x) * 0.12; 
            p.y += (p.targetY - p.y) * 0.12;
            
            if (Math.abs(p.targetX - p.x) < 2 && Math.abs(p.targetY - p.y) < 2) {
                p.state = "TEXT_HOLD";
            }
            
            ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI*2);
            ctx.fill();
        }

        // --- TEXT HOLD ---
        else if (p.state === "TEXT_HOLD") {
            const flash = Math.sin(time * 8 + p.x) * 0.2 + 0.8;
            
            // 关键修改：降低核心亮度，防止泛白
            const renderLight = Math.min(p.light, 50); 
            
            // 光晕 (深色)
            ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, 20%, ${p.alpha * 0.2 * flash})`;
            ctx.beginPath();
            ctx.arc(p.targetX, p.targetY, p.size * 2.5, 0, Math.PI*2);
            ctx.fill();
            
            // 核心
            ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${renderLight}%, ${p.alpha * flash})`;
            ctx.fillRect(p.targetX - p.size/2, p.targetY - p.size/2, p.size, p.size);
        }

        // --- DISSIPATE ---
        else if (p.state === "DISSIPATE") {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; 
            p.alpha -= 0.02;
            
            if (p.alpha <= 0) {
                p.state = "IDLE";
            } else {
                ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }

        // --- SIDE_FIREWORK (真实爆炸效果) ---
        else if (p.state === "SIDE_FIREWORK") {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vy += 0.1; 
            p.alpha -= 0.015;
            
            if (p.alpha <= 0) {
                p.state = "IDLE";
            } else {
                ctx.beginPath();
                ctx.moveTo(p.x - p.vx*2, p.y - p.vy*2);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`;
                ctx.lineWidth = p.size * 0.5;
                ctx.stroke();
            }
        }
      }
      
      ctx.globalCompositeOperation = "source-over";
      loopId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(loopId);
  }, [config.particleCount, spawnExplosion]); 

  return (
    <div className="absolute inset-0 z-0">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full touch-none cursor-crosshair"
        onPointerDown={handleInteraction}
      />
    </div>
  );
}

/**
 * ==============================================================================
 * 5. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function NewYearPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startCountdown = () => {
    setHasStarted(true);
    setTimeout(() => {
        setConfig(prev => ({ ...prev, isCountdownActive: true }));
    }, 100);
  };

  const restart = () => {
    setConfig(prev => ({ ...prev, isCountdownActive: false }));
    setTimeout(() => {
        setConfig(prev => ({ ...prev, isCountdownActive: true }));
    }, 100);
  };

  const updateConfig = (key: keyof AppConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden text-white font-sans selection:bg-purple-500/30">
      <div className="absolute inset-0 bg-black z-0" />
      
      <div className="absolute inset-0 z-10">
        <DisplayUI config={config} isPanelOpen={isPanelOpen} />
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start pointer-events-auto">
           <div className="text-sm text-white/30 tracking-widest uppercase font-light">
              2026 Countdown
           </div>
           
           <div className="flex gap-4">
               <button 
                onClick={() => updateConfig('enableSound', !config.enableSound)}
                className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full transition-all active:scale-95"
               >
                 {config.enableSound ? <Volume2 size={20} className="text-purple-400" /> : <VolumeX size={20} className="text-gray-400" />}
               </button>

               <button 
                onClick={() => setIsPanelOpen(true)}
                className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full transition-all active:scale-95 group"
               >
                 <Settings size={20} className="text-gray-300 group-hover:rotate-90 transition-transform duration-500" />
               </button>
           </div>
        </div>

        {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/70 backdrop-blur-sm z-50 transition-all duration-700">
                <div className="text-center space-y-8 animate-in zoom-in duration-500">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        2026 跨年倒计时
                    </h1>
                    <p className="text-purple-200/80 text-lg font-light tracking-[0.2em]">星河璀璨 · 紫韵流金</p>
                    
                    <button 
                        onClick={startCountdown}
                        className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-xl tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Play size={24} fill="black" /> 开启庆典
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity" />
                    </button>
                </div>
            </div>
        )}

        <div className="text-center pointer-events-none opacity-40">
           <p className="text-[10px] font-mono text-gray-500">Immersive Engine v11.0 (Fixed)</p>
        </div>
      </div>

      <ConfigPanel 
        config={config} 
        onChange={updateConfig} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        onRestart={restart}
      />
    </main>
  );
}