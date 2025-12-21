import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Settings, X, Music, Volume2, MousePointer2, Edit3, Palette } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  // Atmosphere
  lightMode: 'preset' | 'custom';
  lightTheme: 'mixed' | 'red' | 'gold' | 'blue' | 'white' | 'purple' | 'cyan'; // Added presets
  customLightColor: string; // Hex color for custom mode
  beamIntensity: number; 
  waterTurbidity: number; 
  
  // Koi
  koiCount: number; 
  koiSpeed: number; 
  koiSize: number; 
  
  // Interaction
  flashlightRadius: number;

  // Content (Blessings)
  blessings: string[]; // List of blessing texts

  // Audio
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export const DEFAULT_BLESSINGS = [
  "平安喜乐",
  "财源广进",
  "身体健康",
  "心想事成",
  "万事如意"
];

export const DEFAULT_CONFIG: AppConfig = {
  lightMode: 'preset',
  lightTheme: 'mixed',
  customLightColor: '#FFD700',
  beamIntensity: 0.6,
  waterTurbidity: 0.4,
  koiCount: 8,
  koiSpeed: 1.0,
  koiSize: 1.2,
  flashlightRadius: 180,
  blessings: [...DEFAULT_BLESSINGS],
  musicEnabled: true,
  sfxEnabled: true,
};

// 添加通用配置元数据
export const koiBlessingPoolConfigMetadata = {
  panelTitle: '锦鲤池设定',
  panelSubtitle: '新年祈福',
  tabs: [
    { id: "scene" as const, label: '光影', icon: null },
    { id: "visual" as const, label: '锦鲤', icon: null },
    { id: "content" as const, label: '祈福', icon: null },
    { id: "base" as const, label: '音效', icon: null },
  ],
  configSchema: {
    // Scene / Atmosphere
    lightMode: {
      label: '光照模式',
      type: 'select' as const,
      options: [
        { label: '预设主题', value: 'preset' },
        { label: '自定义颜色', value: 'custom' },
      ],
      category: 'scene' as const,
    },
    lightTheme: {
      label: '主题预设',
      type: 'select' as const,
      options: [
        { label: '五福临门 (混合)', value: 'mixed' },
        { label: '鸿运当头 (红)', value: 'red' },
        { label: '财源广进 (金)', value: 'gold' },
        { label: '健康长寿 (蓝)', value: 'blue' },
        { label: '纯净祈愿 (白)', value: 'white' },
        { label: '紫气东来 (紫)', value: 'purple' },
        { label: '青云直上 (青)', value: 'cyan' },
      ],
      category: 'scene' as const,
      // condition: (cfg: AppConfig) => cfg.lightMode === 'preset', // 条件显示暂不支持
    },
    customLightColor: {
      label: '选择颜色',
      type: 'color' as const,
      category: 'scene' as const,
      // condition: (cfg: AppConfig) => cfg.lightMode === 'custom', // 条件显示暂不支持
    },
    beamIntensity: { 
      label: '光束强度', 
      type: 'slider' as const, 
      min: 0.1, max: 1.0, step: 0.1,
      category: 'scene' as const,
    },
    waterTurbidity: {
      label: '水体朦胧',
      type: 'slider' as const, 
      min: 0, max: 0.8, step: 0.1,
      category: 'scene' as const,
    },

    // Visual / Koi
    koiCount: { 
      label: '锦鲤数量', 
      type: 'slider' as const, 
      min: 1, max: 25, step: 1,
      category: 'visual' as const,
    },
    koiSize: { 
      label: '锦鲤大小', 
      type: 'slider' as const, 
      min: 0.5, max: 2.5, step: 0.1,
      category: 'visual' as const,
    },
    koiSpeed: { 
      label: '游动速度', 
      type: 'slider' as const, 
      min: 0.5, max: 3.0, step: 0.1,
      category: 'visual' as const,
    },

    // Interaction
    flashlightRadius: {
      label: '光照范围',
      type: 'slider' as const,
      min: 100, max: 350, step: 10,
      category: 'scene' as const,
    },

    // Content (Blessings) - 这些字段需要特殊处理
    blessing0: { label: '祝福语 1', type: 'input' as const, category: 'content' as const },
    blessing1: { label: '祝福语 2', type: 'input' as const, category: 'content' as const },
    blessing2: { label: '祝福语 3', type: 'input' as const, category: 'content' as const },
    blessing3: { label: '祝福语 4', type: 'input' as const, category: 'content' as const },
    blessing4: { label: '祝福语 5', type: 'input' as const, category: 'content' as const },

    // Audio
     musicEnabled: {
      label: '背景音乐 (古筝)',
      type: 'switch' as const,
      category: 'base' as const
    },
    sfxEnabled: {
      label: '环境音效 (水声)',
      type: 'switch' as const,
      category: 'base' as const
    }
  },
};

/**
 * ==============================================================================
 * 2. 辅助逻辑 (物理和绘图)
 * ==============================================================================
 */

// Colors for blessings
const THEME_COLORS = {
  mixed: ['#FF4D4D', '#FFD700', '#4DA6FF', '#FF6B6B', '#FFA07A'],
  red: ['#FF4D4D', '#FF6B6B', '#CC0000', '#E63946'],
  gold: ['#FFD700', '#F0E68C', '#FFA500', '#DAA520'],
  blue: ['#4DA6FF', '#87CEEB', '#000080', '#4682B4'],
  white: ['#FFFFFF', '#E0E0E0', '#F5F5F5'],
  purple: ['#D8BFD8', '#DA70D6', '#9370DB', '#8A2BE2'],
  cyan: ['#00FFFF', '#20B2AA', '#40E0D0', '#7FFFD4'],
};

// Helper to get colors based on config
const getColorsForConfig = (config: AppConfig) => {
  if (config.lightMode === 'custom') {
    return [config.customLightColor];
  }
  return THEME_COLORS[config.lightTheme as keyof typeof THEME_COLORS] || THEME_COLORS.mixed;
};

class KoiFish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  size: number;
  tailOffset: number;
  id: number;
  isSelected: boolean; 
  blessing: string;

  constructor(width: number, height: number, colorPalette: string[], blessings: string[]) {
    this.id = Math.random();
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(this.angle);
    this.vy = Math.sin(this.angle);
    this.size = 1;
    this.tailOffset = Math.random() * 100;
    this.isSelected = false;
    
    // Assign random color from palette
    this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    // Assign random blessing
    this.blessing = blessings[Math.floor(Math.random() * blessings.length)];
  }

  update(
    targetX: number, 
    targetY: number, 
    isInLight: boolean, 
    width: number, 
    height: number,
    speedMult: number
  ) {
    let dx = this.vx;
    let dy = this.vy;

    // Priority: Follow if selected
    if (this.isSelected) {
      const tx = targetX - this.x;
      const ty = targetY - this.y;
      const dist = Math.sqrt(tx * tx + ty * ty);
      
      // Stronger steering towards target smoothly
      if (dist > 10) {
        const steerStrength = 0.15 * speedMult; 
        dx += (tx / dist) * steerStrength;
        dy += (ty / dist) * steerStrength;
      }
    } 
    // Attraction to light/mouse if not selected
    else if (isInLight) {
      const tx = targetX - this.x;
      const ty = targetY - this.y;
      const dist = Math.sqrt(tx * tx + ty * ty);
      
      if (dist > 10) {
        const steerStrength = 0.05 * speedMult;
        dx += (tx / dist) * steerStrength;
        dy += (ty / dist) * steerStrength;
      }
    } else {
        // Wandering logic
        if (Math.random() < 0.02) {
             this.angle += (Math.random() - 0.5) * 0.5;
             dx = Math.cos(this.angle);
             dy = Math.sin(this.angle);
        }
    }

    // Normalize velocity
    const speed = (this.isSelected ? 3.5 : 2) * speedMult; 
    const len = Math.sqrt(dx * dx + dy * dy);
    this.vx = (dx / len) * speed;
    this.vy = (dy / len) * speed;

    this.x += this.vx;
    this.y += this.vy;

    this.angle = Math.atan2(this.vy, this.vx);

    // Soft walls
    const margin = 100;
    if (this.x < -margin) this.x = width + margin;
    if (this.x > width + margin) this.x = -margin;
    if (this.y < -margin) this.y = height + margin;
    if (this.y > height + margin) this.y = -margin;

    this.tailOffset += 0.2 * speedMult;
  }

  draw(ctx: CanvasRenderingContext2D, isInLight: boolean, scale: number) {
    ctx.save();
    
    // --- Draw Blessing Text if Selected ---
    if (this.isSelected) {
       ctx.save();
       ctx.translate(this.x, this.y - 40 * scale * this.size); // Position above fish
       ctx.shadowColor = 'rgba(0,0,0,0.8)';
       ctx.shadowBlur = 4;
       ctx.shadowOffsetX = 1;
       ctx.shadowOffsetY = 1;
       ctx.fillStyle = '#FFF';
       ctx.font = `bold ${Math.max(16, 20 * scale)}px "Microsoft YaHei", sans-serif`;
       ctx.textAlign = 'center';
       
       // Text Glow
       ctx.shadowColor = this.color;
       ctx.shadowBlur = 15;
       
       ctx.fillText(this.blessing, 0, 0);
       
       // Decorative underline or particles could go here
       ctx.restore();
    }

    // --- Fish Transformations ---
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const finalScale = (this.isSelected ? 1.2 : 1.0) * scale * this.size;
    ctx.scale(finalScale, finalScale);

    // Glow effect
    if (isInLight || this.isSelected) {
      ctx.shadowBlur = this.isSelected ? 30 : 15;
      ctx.shadowColor = this.isSelected ? '#FFFFFF' : this.color;
    } else {
      ctx.shadowBlur = 0;
    }

    // Body Color
    let bodyColor = this.color;
    let alpha = 1.0;

    if (this.isSelected) {
      bodyColor = '#FFFFFF'; // White glow for selected
      alpha = 1.0;
    } else if (!isInLight) {
      bodyColor = '#333'; // Silhouette
      alpha = 0.6;
      ctx.shadowBlur = 5;
      ctx.shadowColor = this.color; 
    }

    ctx.fillStyle = bodyColor;
    ctx.globalAlpha = alpha;

    // Tail
    const tailWag = Math.sin(this.tailOffset) * 0.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.bezierCurveTo(-20, 0, -30, -10 + tailWag * 8, -40, -5 + tailWag * 12);
    ctx.lineTo(-40, 5 + tailWag * 12);
    ctx.bezierCurveTo(-30, 10 + tailWag * 8, -20, 0, -10, 0);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fins
    ctx.beginPath();
    ctx.moveTo(8, 5);
    ctx.quadraticCurveTo(12, 15, 2, 15);
    ctx.quadraticCurveTo(5, 10, 8, 5);
    ctx.fill(); 
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.quadraticCurveTo(12, -15, 2, -15);
    ctx.quadraticCurveTo(5, -10, 8, -5);
    ctx.fill(); 

    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(5, -10, 10, 0);
    ctx.fill();

    // Eyes
    if (isInLight || this.isSelected) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(14, -4, 2, 0, Math.PI * 2);
        ctx.arc(14, 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(15, -4, 1, 0, Math.PI * 2);
        ctx.arc(15, 4, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI) 和音频
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [lightSource, setLightSource] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [selectedFishId, setSelectedFishId] = useState<number | null>(null);
  
  const fishRef = useRef<KoiFish[]>([]);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Fish
  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const palette = getColorsForConfig(config);
    
    const currentFish = fishRef.current;
    
    // Logic: If count changed, rebuild. If just theme changed, update colors.
    if (currentFish.length !== config.koiCount) {
        const newFish = [];
        for (let i = 0; i < config.koiCount; i++) {
            newFish.push(new KoiFish(width, height, palette, config.blessings));
        }
        fishRef.current = newFish;
        setSelectedFishId(null);
    } else {
        // Update existing fish props
        fishRef.current.forEach(fish => {
           // If current color not in new palette (or custom changed), pick new one
           if (!palette.includes(fish.color)) {
               fish.color = palette[Math.floor(Math.random() * palette.length)];
           }
           // Update blessings list reference (randomly re-assign only if needed, 
           // but here we just ensure if they were to pick new ones)
           // Actually, let's keep their blessing unless it's no longer in the list?
           // For simplicity, we just update the text if the index matches or random
           if (!config.blessings.includes(fish.blessing)) {
              fish.blessing = config.blessings[Math.floor(Math.random() * config.blessings.length)];
           }
        });
    }

  }, [config.koiCount, config.lightTheme, config.lightMode, config.customLightColor, config.blessings]);

  // Audio Logic
  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'); 
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
    }
    config.musicEnabled ? musicRef.current.play().catch(() => {}) : musicRef.current.pause();

    if (!sfxRef.current) {
      sfxRef.current = new Audio('https://actions.google.com/sounds/v1/water/water_lapping.ogg'); 
      sfxRef.current.loop = true;
      sfxRef.current.volume = 0.4;
    }
    config.sfxEnabled ? sfxRef.current.play().catch(() => {}) : sfxRef.current.pause();
    
    return () => {
      musicRef.current?.pause();
      sfxRef.current?.pause();
    };
  }, [config.musicEnabled, config.sfxEnabled]);


  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      const { width, height } = container.getBoundingClientRect();
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Background
      const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
      bgGradient.addColorStop(0, '#000814'); 
      bgGradient.addColorStop(1, '#001a33'); 
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Light Beams
      const lightX = isInteracting ? lightSource.x : width / 2 + Math.sin(time * 0.5) * 150;
      
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      const beamGradient = ctx.createRadialGradient(lightX, 0, 0, lightX, height * 0.6, height * 1.5);
      
      // Determine Main Beam Color
      const palette = getColorsForConfig(config);
      const mainBeamColor = palette[0];
      
      beamGradient.addColorStop(0, `${mainBeamColor}FF`);
      beamGradient.addColorStop(0.3, `${mainBeamColor}66`);
      beamGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = beamGradient;
      ctx.globalAlpha = config.beamIntensity;
      
      // Main Cone
      ctx.beginPath();
      ctx.moveTo(lightX - config.flashlightRadius * 0.5, -50);
      ctx.lineTo(lightX + config.flashlightRadius * 0.5, -50);
      ctx.lineTo(lightX + config.flashlightRadius * 3.5, height * 1.2);
      ctx.lineTo(lightX - config.flashlightRadius * 3.5, height * 1.2);
      ctx.fill();

      // Caustics
      for(let i=0; i<5; i++) {
         const offset = Math.sin(time * 0.7 + i) * 300;
         const widthVar = Math.sin(time + i) * 50 + 100;
         const causticGrad = ctx.createLinearGradient(lightX + offset, 0, lightX + offset * 1.5, height);
         causticGrad.addColorStop(0, 'transparent');
         causticGrad.addColorStop(0.2, `rgba(255,255,255, ${0.15 * config.beamIntensity})`);
         causticGrad.addColorStop(1, 'transparent');
         ctx.fillStyle = causticGrad;
         ctx.fillRect(lightX + offset - widthVar/2, 0, widthVar, height);
      }
      
      // Particles
      ctx.fillStyle = mainBeamColor;
      for (let i = 0; i < 30; i++) {
          const px = lightX + (Math.random() - 0.5) * config.flashlightRadius * 3;
          const py = Math.random() * height;
          const pSize = Math.random() * 3 * config.beamIntensity;
          ctx.globalAlpha = (1 - py/height) * config.beamIntensity;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.restore();

      // Fish
      fishRef.current.forEach(fish => {
        fish.isSelected = fish.id === selectedFishId;

        const dx = fish.x - lightX;
        const isInLight = (dx*dx) / (config.flashlightRadius*2)**2 + (fish.y*fish.y)/(height*2)**2 < 0.5;
        
        let targetX = lightX;
        let targetY = height / 2;

        if (fish.isSelected) {
            targetX = lightSource.x;
            targetY = lightSource.y;
        } else if (isInteracting) {
            targetX = lightSource.x;
            targetY = lightSource.y;
        }
        
        fish.update(targetX, targetY, isInLight, width, height, config.koiSpeed);
        fish.draw(ctx, isInLight, config.koiSize);
      });

      // Dust
      ctx.fillStyle = '#ADD8E6'; 
      ctx.globalAlpha = 0.5 * config.waterTurbidity;
      for (let i = 0; i < 80; i++) {
          const px = (Math.sin(i * 132 + time * 0.3) * 0.5 + 0.5) * width;
          const py = (Math.cos(i * 45 + time * 0.1) * 0.5 + 0.5) * height;
          const size = Math.random() * 2 + 0.5;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
      }

      // Vignette
      const vignette = ctx.createRadialGradient(width/2, height/2, height/3, width/2, height/2, height);
      vignette.addColorStop(0, `rgba(0, 20, 40, ${config.waterTurbidity * 0.2})`);
      vignette.addColorStop(1, `rgba(0, 10, 20, ${config.waterTurbidity * 0.8})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [config, isInteracting, lightSource, selectedFishId]);

  // Handlers
  const handleMove = useCallback((x: number, y: number) => {
    setLightSource({ x, y });
    setIsInteracting(true);
  }, []);

  const handleLeave = () => {
    setIsInteracting(false);
  };

  const handleClick = (x: number, y: number) => {
    let clickedFishId: number | null = null;
    for (let i = fishRef.current.length - 1; i >= 0; i--) {
      const fish = fishRef.current[i];
      const dx = fish.x - x;
      const dy = fish.y - y;
      if (dx*dx + dy*dy < (40 * config.koiSize)**2) {
        clickedFishId = fish.id;
        break;
      }
    }

    if (clickedFishId === selectedFishId) {
      setSelectedFishId(null);
    } else {
      setSelectedFishId(clickedFishId);
      setLightSource({ x, y });
      setIsInteracting(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-black cursor-none"
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
      onClick={(e) => handleClick(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleLeave}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleClick(touch.clientX, touch.clientY);
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Interaction Cursor */}
      {isInteracting && (
        <div 
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
          style={{ left: lightSource.x, top: lightSource.y, opacity: isPanelOpen ? 0 : 1 }}
        >
          <div className={`w-12 h-12 rounded-full border-2 ${selectedFishId ? 'border-white animate-ping' : 'border-amber-300/50'} flex items-center justify-center`}>
             <div className={`w-2 h-2 rounded-full ${selectedFishId ? 'bg-white' : 'bg-amber-300'}`} />
          </div>
        </div>
      )}

      {/* Hint */}
      {!isInteracting && !selectedFishId && (
        <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm pointer-events-none animate-pulse flex flex-col items-center gap-2 text-center">
            <MousePointer2 className="w-8 h-8 opacity-80" />
            <span>移动光照，点击锦鲤获取祝福</span>
        </div>
      )}
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function KoiBlessingPoolPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleUpdateConfig = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-screen h-screen bg-[#000814] overflow-hidden font-sans select-none">
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />
      
      <div 
        className={`absolute top-10 left-10 transition-all duration-700 pointer-events-none ${
          isPanelOpen ? 'opacity-30 -translate-x-4 blur-sm' : 'opacity-100 translate-x-0 blur-0'
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-thin text-white tracking-widest opacity-90 mix-blend-lighten drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          2025
        </h1>
        <p className="text-base md:text-lg text-red-300/90 mt-3 font-light tracking-[0.3em] uppercase">
          新年 · 锦鲤 · 祈福
        </p>
      </div>
    </div>
  );
}