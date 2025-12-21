'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings, X, Sparkles, Zap, Type, Palette, Flame } from "lucide-react";

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  // 场景设置
  bgTheme: "midnight" | "warmRed" | "deepBlue";
  
  // 烟花视觉
  particleTheme: "classic" | "rainbow" | "neon" | "custom"; // 新增：色彩主题
  fireworkScale: number;    // 烟花大小
  particleCount: number;    // 粒子数量
  explosionForce: number;   // 爆炸力度
  
  // 文字设置
  textString: string;       // 堆积的文字
  textColor: string;        // 自定义：文字焰心颜色
  textOuterColor: string;   // 自定义：文字外焰颜色
  textScale: number;        // 文字大小
  burnIntensity: number;    // 燃烧剧烈程度
  
  // 交互
  gravity: number;          // 下坠重力
  autoLaunch: boolean;      // 自动发射
  
  // 音效
  volume: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: "midnight",
  particleTheme: "classic", // 默认经典
  fireworkScale: 1.5,
  particleCount: 3500,
  explosionForce: 25,
  textString: "新年快乐",
  textColor: "#ffaa00",    // 金色焰心 (用于自定义模式)
  textOuterColor: "#ff4d00", // 橙红外焰 (用于自定义模式)
  textScale: 1.0,
  burnIntensity: 1.2,
  gravity: 0.15,
  autoLaunch: true,
  volume: 0.5,
};

// 添加通用配置元数据
export const newyearFireworksConfigMetadata = {
  panelTitle: "流光·新年",
  panelSubtitle: "Colorful New Year 2025",
  tabs: [
    { id: "visual" as const, label: "色彩", icon: null },
    { id: "content" as const, label: "祝词", icon: null },
    { id: "scene" as const, label: "环境", icon: null },
  ],
  configSchema: {
    particleTheme: {
      label: "色彩主题",
      type: "select" as const,
      options: [
        { label: "经典烈焰", value: "classic" },
        { label: "缤纷彩虹", value: "rainbow" },
        { label: "赛博霓虹", value: "neon" },
        { label: "自定义双色", value: "custom" },
      ],
      category: "visual" as const,
    },
    textColor: { label: "自定义焰心", type: "color" as const, category: "visual" as const },
    textOuterColor: { label: "自定义外焰", type: "color" as const, category: "visual" as const },
    
    fireworkScale: { label: "绽放半径", type: "slider" as const, min: 0.5, max: 3.0, step: 0.1, category: "visual" as const },
    particleCount: { label: "粒子密度", type: "slider" as const, min: 1000, max: 6000, step: 100, category: "visual" as const },
    explosionForce: { label: "炸裂冲击", type: "slider" as const, min: 10, max: 50, step: 1, category: "visual" as const },
    
    textString: { label: "堆积文字", type: "input" as const, category: "content" as const, placeholder: "输入文字..." },
    textScale: { label: "文字尺寸", type: "slider" as const, min: 0.5, max: 2.0, step: 0.1, category: "content" as const },
    burnIntensity: { label: "燃烧猛烈度", type: "slider" as const, min: 0.1, max: 3.0, step: 0.1, category: "content" as const },
    
    gravity: { label: "下坠速度", type: "slider" as const, min: 0.05, max: 0.5, step: 0.01, category: "scene" as const },
    bgTheme: {
      label: "夜空氛围",
      type: "select" as const,
      options: [
        { label: "除夕子夜", value: "midnight" },
        { label: "暖红灯火", value: "warmRed" },
        { label: "深海极光", value: "deepBlue" },
      ],
      category: "scene" as const,
    },
    volume: { label: "音效音量", type: "slider" as const, min: 0, max: 1, step: 0.1, category: "scene" as const },
  },
};

/**
 * ==============================================================================
 * 2. 核心引擎工具 (Audio)
 * ==============================================================================
 */

class SoundEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setVolume(val: number) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }

  playLaunch() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.6);
  }

  playExplosion() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const bufferSize = this.ctx.sampleRate * 1.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.8);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  playCrackle() {
    if (!this.ctx || !this.masterGain || Math.random() > 0.1) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.value = Math.random() * 600 + 200;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(t + 0.05);
  }
}

const soundEngine = new SoundEngine();

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

type ParticleState = "LAUNCH" | "EXPLODE" | "FALL" | "ASSEMBLE" | "BURN";

interface Point {
  x: number;
  y: number;
}

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 2;
  alpha: number = 0;
  state: ParticleState = "FALL";
  color: string = "#fff"; // 当前颜色
  
  // 目标相关
  targetX: number = 0;
  targetY: number = 0;
  
  // 燃烧相关属性
  baseX: number = 0;
  baseY: number = 0;
  noiseOffset: number = Math.random() * 100;
  
  // 颜色属性
  hue: number = 0; // 色相 (用于彩虹/霓虹模式)
  colorType: "inner" | "outer" = "inner"; // 颜色层级

  // 拖尾记录
  trail: {x: number, y: number}[] = [];

  constructor(w: number, h: number) {
    this.reset(w, h);
  }

  reset(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = h + 100;
    this.vx = 0;
    this.vy = 0;
    this.alpha = 0;
    this.state = "FALL";
    this.trail = [];
  }

  launch(w: number, h: number) {
    this.x = w / 2;
    this.y = h;
    this.vx = (Math.random() - 0.5) * 1.5; 
    this.vy = -(Math.random() * 4 + 18);
    this.state = "LAUNCH";
    this.alpha = 1;
    this.size = 5;
    this.trail = [];
    this.color = "#FFD700"; // 发射时默认金色
  }

  // 根据配置和类型设置颜色
  assignColor(config: AppConfig) {
    if (config.particleTheme === "custom") {
        this.color = this.colorType === "inner" ? config.textColor : config.textOuterColor;
    } else if (config.particleTheme === "rainbow") {
        // 彩虹模式：全色相随机
        this.hue = Math.random() * 360;
        this.color = `hsl(${this.hue}, 100%, 60%)`;
    } else if (config.particleTheme === "neon") {
        // 霓虹模式：青/紫/粉
        const neons = [180, 280, 300, 320]; // Cyan, Purple, Magenta, Pink
        this.hue = neons[Math.floor(Math.random() * neons.length)];
        this.color = `hsl(${this.hue}, 100%, 60%)`;
    } else {
        // 经典模式：金/红/橙
        if (this.colorType === "inner") {
            this.color = Math.random() > 0.5 ? "#FFD700" : "#FFA500"; // 金/橙
        } else {
            this.color = Math.random() > 0.5 ? "#FF4500" : "#FF0000"; // 红/深红
        }
    }
  }
}

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const textPointsRef = useRef<Point[]>([]);
  const launchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const bgStyles = {
    midnight: "bg-gradient-to-b from-[#020205] via-[#050510] to-[#0a0500]",
    warmRed: "bg-gradient-to-b from-[#1a0505] via-[#2a0a0a] to-[#100000]",
    deepBlue: "bg-gradient-to-b from-[#000510] via-[#051020] to-[#000005]",
  };

  const generateTextPoints = useCallback((text: string, scale: number, width: number, height: number) => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext("2d");
    if (!ctx) return [];

    const fontSize = Math.min(width / text.length * 1.4, 250) * scale;
    ctx.font = `900 ${fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height * 0.7);

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const points: Point[] = [];
    const gap = 3; 

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        if (imageData[(y * width + x) * 4 + 3] > 128) {
          points.push({ x, y });
        }
      }
    }
    return points.sort(() => Math.random() - 0.5);
  }, []);

  useEffect(() => {
    soundEngine.setVolume(config.volume);
    
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 6000; i++) {
        particlesRef.current.push(new Particle(window.innerWidth, window.innerHeight));
      }
    }

    if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        textPointsRef.current = generateTextPoints(config.textString, config.textScale, width, height);
    }
  }, [config.textString, config.textScale, config.volume, generateTextPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      textPointsRef.current = generateTextPoints(config.textString, config.textScale, canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const launchFirework = () => {
      soundEngine.playLaunch();
      const launcher = particlesRef.current[0];
      launcher.launch(canvas.width, canvas.height);
    };

    if (config.autoLaunch) {
       launchTimerRef.current = setInterval(launchFirework, 7000); 
       setTimeout(launchFirework, 800);
    }

    let time = 0;

    const loop = () => {
      time += 0.05;
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 地面光效
      const pulse = Math.sin(time) * 0.2 + 0.8;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 100);
      let groundColor = "255, 100, 0"; // 默认橙红
      if (config.particleTheme === "neon") groundColor = "0, 255, 255";
      if (config.particleTheme === "rainbow") groundColor = "255, 0, 255";
      
      gradient.addColorStop(0, `rgba(${groundColor}, ${0.1 * pulse})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

      const activeParticles = particlesRef.current;
      const textPoints = textPointsRef.current;
      const launcher = activeParticles[0]; 

      // --- 发射器 ---
      if (launcher.state === "LAUNCH") {
        launcher.x += launcher.vx;
        launcher.y += launcher.vy;
        launcher.vy += 0.25; 
        
        launcher.trail.push({x: launcher.x, y: launcher.y});
        if (launcher.trail.length > 15) launcher.trail.shift();

        ctx.beginPath();
        if (launcher.trail.length > 0) {
            ctx.moveTo(launcher.trail[0].x, launcher.trail[0].y);
            for (const p of launcher.trail) ctx.lineTo(p.x, p.y);
        }
        
        // 拖尾颜色跟随主题
        let trailColor = "rgba(255, 200, 100, 0.8)";
        if (config.particleTheme === "neon") trailColor = "rgba(0, 255, 255, 0.8)";
        if (config.particleTheme === "rainbow") trailColor = `hsla(${time * 50 % 360}, 100%, 70%, 0.8)`;
        
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        if (launcher.vy >= -1) {
           soundEngine.playExplosion();
           launcher.state = "FALL"; 
           launcher.alpha = 0;

           const exX = launcher.x;
           const exY = launcher.y;
           
           const count = Math.min(config.particleCount, activeParticles.length);
           for (let i = 1; i < count; i++) {
             const p = activeParticles[i];
             p.x = exX;
             p.y = exY;
             p.alpha = 1;
             p.state = "EXPLODE";
             
             const angle = Math.random() * Math.PI * 2;
             const force = Math.random() * config.explosionForce * config.fireworkScale;
             
             p.vx = Math.cos(angle) * force;
             p.vy = Math.sin(angle) * force * 0.6; 
             
             p.colorType = Math.random() > 0.4 ? "inner" : "outer";
             p.size = Math.random() * 2 + 1;
             
             // 赋予颜色
             p.assignColor(config);
           }
        }
      }

      // --- 粒子群 ---
      for (let i = 1; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        if (p.alpha <= 0.01 && p.state === "FALL") continue;

        if (p.state === "EXPLODE") {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.vy += 0.05;
            p.alpha -= 0.005;

            if (Math.abs(p.vx) < 1 && Math.abs(p.vy) < 1) {
                p.state = "FALL";
                p.vy = Math.random() * 2;
                p.vx = (Math.random() - 0.5) * 0.5;
            }
        } 
        else if (p.state === "FALL") {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += config.gravity; 
            if (p.vy > 8) p.vy = 8;
            if (Math.random() < 0.05) p.alpha = Math.random() * 0.5 + 0.5;

            if (p.y > canvas.height * 0.6 && textPoints.length > 0) {
                const targetIndex = i % textPoints.length;
                const target = textPoints[targetIndex];
                
                if (p.y < target.y + 50 && p.y > target.y - 300) {
                     p.targetX = target.x;
                     p.targetY = target.y;
                     p.baseX = target.x;
                     p.baseY = target.y;
                     p.state = "ASSEMBLE";
                }
            }
            if (p.y > canvas.height) p.alpha = 0;
        }
        else if (p.state === "ASSEMBLE") {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.x += dx * 0.15;
            p.y += dy * 0.15;
            p.alpha = Math.min(p.alpha + 0.1, 1);

            if (Math.abs(dx) < 20 && Math.random() < 0.0005) {
               soundEngine.playCrackle();
            }

            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                p.state = "BURN";
            }
        }
        else if (p.state === "BURN") {
            p.noiseOffset += 0.1;
            const turbulenceX = Math.sin(p.noiseOffset) * config.burnIntensity * 2;
            const lift = Math.random() * config.burnIntensity * 4; 
            
            p.x = p.baseX + turbulenceX;
            p.y = p.baseY - lift;
            p.alpha = 0.6 + Math.random() * 0.4;
            
            if (Math.random() < 0.2) p.y = p.baseY;
            p.size = (Math.sin(time * 5 + i) * 0.5 + 1.5) * 1.5;
        }

        if (p.alpha > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            
            // 绘制颜色逻辑
            if (p.state === "BURN" && config.particleTheme !== "custom") {
                // 燃烧时，如果不是自定义模式，使用主题色并偶尔闪烁白色
                 ctx.fillStyle = Math.random() > 0.8 ? "#FFFFFF" : p.color;
            } else {
                 ctx.fillStyle = p.color;
            }
            
            // 针对自定义模式下的特殊处理（保持原有的双色逻辑）
            if (p.state === "BURN" && config.particleTheme === "custom") {
                 if (p.colorType === "inner") {
                    ctx.fillStyle = Math.random() > 0.7 ? "#FFFFFF" : config.textColor;
                 } else {
                    ctx.fillStyle = config.textOuterColor;
                 }
            }

            ctx.globalAlpha = p.alpha;
            ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      if (launchTimerRef.current) clearInterval(launchTimerRef.current);
    };
  }, [config]);

  const handleInteraction = (e: React.PointerEvent) => {
    soundEngine.init();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = particlesRef.current;
    let count = 0;
    for (let i = 1; i < particles.length; i++) {
        if (count > 80) break;
        const p = particles[i];
        if (p.state === "BURN" || p.alpha < 0.1) {
            p.x = x;
            p.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.state = "EXPLODE";
            p.alpha = 1;
            p.size = Math.random() * 3 + 2;
            p.assignColor(config); // 交互时也重新分配颜色
            count++;
        }
    }
    soundEngine.playExplosion();
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${bgStyles[config.bgTheme]}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onPointerDown={handleInteraction}
      />
      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-80 animate-pulse">
        <p className="text-sm font-light tracking-[0.3em] text-orange-200 drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">
          点燃新年 • 薪火相传
        </p>
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function NewYearFireworksPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setConfig(prev => ({
          ...prev,
          fireworkScale: Math.max(0.5, Math.min(3.0, prev.fireworkScale + delta))
        }));
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const handleChange = (key: keyof AppConfig, val: any) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden font-sans selection:bg-orange-500/30">
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />
    </main>
  );
}