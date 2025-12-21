'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, X, Sparkles, Send, Clock, Heart, Music } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  // 场景氛围
  themeMode: 'cyberpunk' | 'romanticGold' | 'deepSpace';
  
  // 视觉参数
  tunnelSpeed: number;     // 隧道穿梭速度 0.1 - 5.0
  clockSpeed: number;      // 时钟旋转速度 1.0 - 20.0
  particleDensity: number; // 粒子密度 10 - 200
  glowIntensity: number;   // 光晕强度 0 - 1
  
  // 文案设置
  yearText: string;        // 目标年份，如 2026
  countdownText: string;   // 倒计时文字
  
  // 交互设置
  wishPlaceholder: string; // 许愿框提示
}

export const DEFAULT_CONFIG: AppConfig = {
  themeMode: 'cyberpunk',
  tunnelSpeed: 2.0,
  clockSpeed: 5.0,
  particleDensity: 80,
  glowIntensity: 0.8,
  yearText: '2026',
  countdownText: 'TIME FLIES',
  wishPlaceholder: '许下你的2026心愿...',
};

// 添加通用配置元数据
export const timeTunnelConfigMetadata = {
  panelTitle: '时光控制台',
  panelSubtitle: 'Design Your 2026',
  tabs: [
    { id: "visual" as const, label: '视觉', icon: null },
    { id: "content" as const, label: '文案', icon: null },
  ],
  configSchema: {
    themeMode: {
      label: '主题风格',
      type: 'select' as const,
      options: [
        { label: '赛博未来 (蓝紫)', value: 'cyberpunk' },
        { label: '流金岁月 (黑金)', value: 'romanticGold' },
        { label: '深空星际 (银白)', value: 'deepSpace' },
      ],
      category: 'visual' as const,
    },
    tunnelSpeed: {
      label: '穿梭速度',
      type: 'slider' as const,
      min: 0.1, max: 5.0, step: 0.1,
      category: 'visual' as const,
    },
    clockSpeed: {
      label: '时光流速',
      type: 'slider' as const,
      min: 1.0, max: 20.0, step: 1.0,
      category: 'visual' as const,
    },
    particleDensity: {
      label: '星辰密度',
      type: 'slider' as const,
      min: 20, max: 300, step: 10,
      category: 'visual' as const,
    },
    glowIntensity: {
      label: '光晕强度',
      type: 'slider' as const,
      min: 0.1, max: 1.0, step: 0.1,
      category: 'visual' as const,
    },
    yearText: {
      label: '目标年份',
      type: 'input' as const,
      category: 'content' as const,
    },
    countdownText: {
      label: '中心标语',
      type: 'input' as const,
      category: 'content' as const,
    },
    wishPlaceholder: {
      label: '许愿提示',
      type: 'input' as const,
      category: 'content' as const,
    },
  },
};

/**
 * ==============================================================================
 * 2. 工具函数与常量 (Utils)
 * ==============================================================================
 */
const THEME_COLORS = {
  cyberpunk: { bg: '#050510', primary: '#00f3ff', secondary: '#bc13fe', text: '#ffffff' },
  romanticGold: { bg: '#0a0a0a', primary: '#ffd700', secondary: '#ff8c00', text: '#fff8e1' },
  deepSpace: { bg: '#000000', primary: '#ffffff', secondary: '#a0a0ff', text: '#e0e0e0' },
};

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneState, setSceneState] = useState<'tunnel' | 'transition' | 'city'>('tunnel');
  const [wishes, setWishes] = useState<{ id: number; text: string; x: number; y: number; alpha: number }[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // 颜色主题
  const colors = useMemo(() => THEME_COLORS[config.themeMode], [config.themeMode]);

  // 粒子系统引用，避免重渲染丢失
  const particlesRef = useRef<any[]>([]);
  const animationRef = useRef<number>(0);
  const clockAngleRef = useRef(0);
  const frameCountRef = useRef(0);

  // 初始化愿望（示例）
  useEffect(() => {
    setWishes([
      { id: 1, text: '身体健康', x: 20, y: 30, alpha: 1 },
      { id: 2, text: '暴富', x: 80, y: 40, alpha: 1 },
    ]);
  }, []);

  // -----------------------
  // 核心渲染循环 (Canvas)
  // -----------------------
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 响应式尺寸
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 粒子类
    class Particle {
      x: number;
      y: number;
      z: number; // 深度
      angle: number;
      speed: number;
      color: string;

      constructor() {
        this.x = (Math.random() - 0.5) * canvas!.width * 2;
        this.y = (Math.random() - 0.5) * canvas!.height * 2;
        this.z = Math.random() * 2000 + 1000; // 初始深度
        this.angle = Math.atan2(this.y, this.x);
        this.speed = Math.random() * 0.5 + 0.5;
        this.color = Math.random() > 0.5 ? colors.primary : colors.secondary;
      }

      update(tunnelSpeed: number) {
        this.z -= (tunnelSpeed * 10 + 2); // 向屏幕移动
        if (this.z <= 0) {
          this.z = 2000;
          this.x = (Math.random() - 0.5) * canvas!.width * 2;
          this.y = (Math.random() - 0.5) * canvas!.height * 2;
        }
      }

      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scaleFactor: number) {
        const perspective = 300;
        const scale = perspective / (perspective + this.z) * scaleFactor;
        const screenX = centerX + this.x * scale;
        const screenY = centerY + this.y * scale;
        
        const size = (2 - (this.z / 2000)) * 3 * config.particleDensity / 50;
        const alpha = 1 - (this.z / 2000);

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * config.glowIntensity;
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 拖尾效果
        if (sceneState === 'tunnel') {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = size * 0.5;
            ctx.moveTo(screenX, screenY);
            // 简单的放射状拖尾
            const tailX = centerX + this.x * scale * 0.9;
            const tailY = centerY + this.y * scale * 0.9;
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }

    // 初始化粒子
    if (particlesRef.current.length === 0 || particlesRef.current.length !== config.particleDensity * 2) {
      particlesRef.current = Array.from({ length: config.particleDensity * 2 }, () => new Particle());
    }

    // 渲染函数
    const render = () => {
      if (!canvas || !ctx) return;
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 背景清空（带拖影效果）
      ctx.fillStyle = `${colors.bg}40`; // 0x40 alpha for trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. 绘制粒子隧道/星空
      particlesRef.current.forEach(p => {
        p.update(sceneState === 'city' ? 0.2 : config.tunnelSpeed); // 城市模式下变慢
        p.draw(ctx, cx, cy, sceneState === 'transition' ? 5 : 1);
      });

      // 2. 绘制场景内容
      if (sceneState === 'tunnel') {
        // --- 时钟模式 ---
        drawClock(ctx, cx, cy, colors, config);
      } else if (sceneState === 'transition') {
        // --- 过渡炸裂 ---
        drawExplosion(ctx, cx, cy, colors);
      } else if (sceneState === 'city') {
        // --- 未来城市蓝图 ---
        drawCityBlueprint(ctx, cx, cy, colors, config);
      }

      frameCountRef.current++;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [config, sceneState, colors]); // 依赖 config 变化

  // -----------------------
  // 绘图辅助函数
  // -----------------------
  function drawClock(ctx: CanvasRenderingContext2D, x: number, y: number, theme: any, cfg: AppConfig) {
    const radius = Math.min(x, y) * 0.4;
    
    // 外发光
    ctx.shadowBlur = 20 * cfg.glowIntensity;
    ctx.shadowColor = theme.primary;

    // 表盘圆环
    ctx.beginPath();
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 刻度
    for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * (radius - 20), y + Math.sin(ang) * (radius - 20));
        ctx.lineTo(x + Math.cos(ang) * radius, y + Math.sin(ang) * radius);
        ctx.stroke();
    }

    // 旋转指针
    clockAngleRef.current += 0.05 * cfg.clockSpeed;
    
    // 分针
    ctx.beginPath();
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 6;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(clockAngleRef.current) * (radius * 0.8), y + Math.sin(clockAngleRef.current) * (radius * 0.8));
    ctx.stroke();

    // 时针
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(clockAngleRef.current * 0.1) * (radius * 0.5), y + Math.sin(clockAngleRef.current * 0.1) * (radius * 0.5));
    ctx.stroke();

    // 中心文字
    ctx.shadowBlur = 0;
    ctx.fillStyle = theme.text;
    ctx.font = '700 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.countdownText, x, y + radius + 50);
  }

  function drawExplosion(ctx: CanvasRenderingContext2D, x: number, y: number, theme: any) {
    // 简单的全屏闪白效果
    const progress = (frameCountRef.current % 60) / 60;
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function drawCityBlueprint(ctx: CanvasRenderingContext2D, x: number, y: number, theme: any, cfg: AppConfig) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    
    // 地面网格
    ctx.strokeStyle = `${theme.primary}33`; // low opacity
    ctx.lineWidth = 1;
    const perspectiveY = h * 0.6;
    
    // 纵向线
    for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 100, h);
        ctx.lineTo(x + i * 20, perspectiveY);
        ctx.stroke();
    }
    // 横向线
    for (let i = 0; i < 10; i++) {
        const yPos = h - i * (h - perspectiveY) / 10;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(w, yPos);
        ctx.stroke();
    }

    // 2026 大字
    ctx.save();
    ctx.shadowBlur = 30 * cfg.glowIntensity;
    ctx.shadowColor = theme.secondary;
    ctx.fillStyle = theme.text;
    ctx.font = '900 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.yearText, x, perspectiveY - 50);
    ctx.restore();
  }

  // -----------------------
  // 交互逻辑
  // -----------------------
  const handleTrigger = () => {
    setSceneState('transition');
    setTimeout(() => {
        setSceneState('city');
    }, 1000); // 1秒过场
  };

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // 添加愿望到列表（实际应用中这里可以添加飞入动画逻辑）
    setWishes(prev => [
        ...prev, 
        { 
            id: Date.now(), 
            text: inputValue, 
            x: Math.random() * 80 + 10, // 10% - 90%
            y: Math.random() * 40 + 10, // 10% - 50%
            alpha: 1 
        }
    ]);
    setInputValue('');
  };

  // -----------------------
  // DOM 渲染 (Overlay UI)
  // -----------------------
  return (
    <div className={`absolute inset-0 overflow-hidden transition-colors duration-1000`} style={{ backgroundColor: colors.bg }}>
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Overlay UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        
        {/* 阶段一：时钟倒计时交互 */}
        {sceneState === 'tunnel' && (
           <div className="absolute bottom-20 pointer-events-auto animate-bounce">
             <button 
                onClick={handleTrigger}
                className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold tracking-widest hover:bg-white/20 transition-all group flex items-center gap-2"
                style={{ boxShadow: `0 0 20px ${colors.primary}` }}
             >
                <Clock className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                开启未来
             </button>
           </div>
        )}

        {/* 阶段三：城市与许愿 */}
        {sceneState === 'city' && (
          <div className="w-full h-full relative pointer-events-auto">
             {/* 漂浮的愿望 */}
             {wishes.map(wish => (
                <div 
                    key={wish.id}
                    className="absolute text-sm font-bold animate-pulse whitespace-nowrap px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                    style={{ 
                        left: `${wish.x}%`, 
                        top: `${wish.y}%`, 
                        color: colors.secondary,
                        boxShadow: `0 0 10px ${colors.secondary}40`
                    }}
                >
                    ✨ {wish.text}
                </div>
             ))}

             {/* 底部输入框 */}
             <div className="absolute bottom-10 left-0 right-0 flex justify-center px-4">
               <form onSubmit={handleWishSubmit} className="w-full max-w-md flex gap-2">
                 <input 
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={config.wishPlaceholder}
                    className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:border-white/50 transition-all"
                 />
                 <button 
                    type="submit"
                    className="bg-white/10 border border-white/20 rounded-xl px-4 text-white hover:bg-white/20 transition-colors"
                 >
                    <Send className="w-5 h-5" />
                 </button>
               </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function TimeTunnelPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans selection:bg-blue-500/30">
      <DisplayUI 
        config={config} 
        isPanelOpen={isPanelOpen} 
      />
    </div>
  );
}