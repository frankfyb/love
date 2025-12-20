'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, X, Heart, Sparkles, Send, PenTool } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  backgroundColor: string;
  treeBaseWidth: number;
  starSize: number;
  blinkSpeed: number;
  fireworkIntensity: number;
  gravity: number;
  uiGlassOpacity: number;
  fontStyle: 'sans' | 'serif' | 'mono';
}

export const DEFAULT_CONFIG: AppConfig = {
  backgroundColor: '#0f172a', // Slate-900
  treeBaseWidth: 500, // 稍微调窄一点以适应分层结构
  starSize: 3,
  blinkSpeed: 1,
  fireworkIntensity: 60,
  gravity: 0.15,
  uiGlassOpacity: 0.2,
  fontStyle: 'serif',
};

// 添加通用配置元数据
export const axuyuantreeConfigMetadata = {
  panelTitle: '许愿新光树配置',
  panelSubtitle: 'Design Your Starlight Tree',
  configSchema: {
    backgroundColor: {
      label: '夜空背景色',
      type: 'color' as const,
      category: 'scene' as const,
    },
    treeBaseWidth: {
      label: '树冠宽度',
      type: 'slider' as const,
      min: 300,
      max: 800,
      step: 10,
      category: 'scene' as const,
    },
    starSize: {
      label: '星光大小',
      type: 'slider' as const,
      min: 1,
      max: 8,
      step: 0.5,
      category: 'visual' as const,
    },
    blinkSpeed: {
      label: '闪烁速度系数',
      type: 'slider' as const,
      min: 0.1,
      max: 5,
      step: 0.1,
      category: 'visual' as const,
    },
    fireworkIntensity: {
      label: '烟花粒子数量',
      type: 'slider' as const,
      min: 20,
      max: 150,
      step: 10,
      category: 'visual' as const,
    },
    gravity: {
      label: '重力模拟',
      type: 'slider' as const,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      category: 'physics' as const,
    },
    uiGlassOpacity: {
      label: '面板透明度',
      type: 'slider' as const,
      min: 0.1,
      max: 0.9,
      step: 0.1,
      category: 'scene' as const,
    },
    fontStyle: {
      label: '字体风格',
      type: 'select' as const,
      options: [
        { label: '无衬线 (Sans)', value: 'sans' },
        { label: '衬线 (Serif)', value: 'serif' },
        { label: '等宽 (Mono)', value: 'mono' },
      ],
      category: 'content' as const,
    },
  },
  tabs: [
    { id: 'scene' as const, label: '场景', icon: null },
    { id: 'content' as const, label: '内容', icon: null },
    { id: 'visual' as const, label: '视觉', icon: null },
    { id: 'physics' as const, label: '物理', icon: null }
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '场景', 
      icon: null, 
      fields: ['backgroundColor' as const, 'treeBaseWidth' as const, 'uiGlassOpacity' as const] 
    },
    { 
      id: 2, 
      label: '视觉', 
      icon: null, 
      fields: ['starSize' as const, 'blinkSpeed' as const, 'fireworkIntensity' as const] 
    },
    { 
      id: 3, 
      label: '物理', 
      icon: null, 
      fields: ['gravity' as const, 'fontStyle' as const] 
    },
  ],
};

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

// Types used internally
interface Wish {
  id: string;
  nickname: string;
  content: string;
  color: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'launching' | 'exploding' | 'settled';
  particles: Particle[];
  phase: number; // for blinking
  timestamp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  alpha: number;
}

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredWish, setHoveredWish] = useState<Wish | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Input State
  const [inputNickname, setInputNickname] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [inputColor, setInputColor] = useState('#ffd700');

  // Animation Refs (to avoid closures in loop)
  const wishesRef = useRef<Wish[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>(0);

  // Sync state with ref
  useEffect(() => {
    wishesRef.current = wishes;
  }, [wishes]);

  /**
   * Helper: Calculate Tree Geometry
   * Defines a 3-tier Christmas tree shape
   */
  const getTreeDimensions = useCallback((w: number, h: number, baseW: number) => {
    const topY = h * 0.2;
    const bottomY = h * 0.8;
    const height = bottomY - topY;
    const centerX = w / 2;
    
    // Define 3 levels (tiers)
    // Each level has a Y range and a Width range
    // Level 1 (Top)
    const l1Top = topY;
    const l1Bot = topY + height * 0.35;
    const l1Width = baseW * 0.4;

    // Level 2 (Middle)
    const l2Top = topY + height * 0.25; // Overlap
    const l2Bot = topY + height * 0.65;
    const l2Width = baseW * 0.7;

    // Level 3 (Bottom)
    const l3Top = topY + height * 0.55; // Overlap
    const l3Bot = bottomY;
    const l3Width = baseW;

    return { centerX, topY, bottomY, l1Top, l1Bot, l1Width, l2Top, l2Bot, l2Width, l3Top, l3Bot, l3Width };
  }, []);

  /**
   * Helper: Generate random position within the Tiered Christmas Tree
   */
  const getTreePosition = useCallback((width: number, height: number, treeBaseW: number) => {
    const dim = getTreeDimensions(width, height, treeBaseW);
    
    // Randomly select a tier based on area (roughly) to ensure even distribution
    const r = Math.random();
    let yMin, yMax, wMaxAtBot, wMaxAtTop;
    
    // Simple probability distribution: more points at bottom
    if (r < 0.2) {
      // Top Tier
      yMin = dim.l1Top;
      yMax = dim.l1Bot;
      wMaxAtBot = dim.l1Width;
      wMaxAtTop = 0;
    } else if (r < 0.55) {
      // Middle Tier
      yMin = dim.l2Top;
      yMax = dim.l2Bot;
      wMaxAtBot = dim.l2Width;
      wMaxAtTop = dim.l2Width * 0.3; // Starts somewhat wide
    } else {
      // Bottom Tier
      yMin = dim.l3Top;
      yMax = dim.l3Bot;
      wMaxAtBot = dim.l3Width;
      wMaxAtTop = dim.l3Width * 0.3;
    }

    const randomY = yMin + Math.random() * (yMax - yMin);
    const progress = (randomY - yMin) / (yMax - yMin);
    
    // Linear width interpolation within the tier
    const currentMaxWidth = wMaxAtTop + (wMaxAtBot - wMaxAtTop) * progress;
    
    // Add some "jaggedness" or clustering to edges for better definition? 
    // Just simple random for now, the tiers define the shape well.
    const x = dim.centerX + (Math.random() - 0.5) * currentMaxWidth;

    return { x, y: randomY };
  }, [getTreeDimensions]);

  /**
   * Main Animation Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width;
    let h = canvas.height;

    const render = () => {
      // Background Clear
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, w, h);

      const time = Date.now() * 0.001;
      const gravity = config.gravity;

      // 1. Draw Static Background Stars (Sky)
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(i * 132.1 + time * 0.05) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 43.2 + time * 0.05) * 0.5 + 0.5) * h;
        const opacity = Math.abs(Math.sin(time * 0.5 + i)) * 0.3 + 0.1;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.random() > 0.9 ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Tree Silhouette (The "Ghost" Tree)
      const dim = getTreeDimensions(w, h, config.treeBaseWidth);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(74, 222, 128, 0.2)'; // Greenish glow
      
      // Helper to draw a tier
      const drawTier = (yTop: number, yBot: number, widthBot: number, widthTop: number = 0) => {
        ctx.beginPath();
        ctx.moveTo(dim.centerX - widthTop/2, yTop);
        ctx.lineTo(dim.centerX + widthTop/2, yTop);
        ctx.lineTo(dim.centerX + widthBot/2, yBot);
        // Scalloped bottom? straight for now
        ctx.lineTo(dim.centerX - widthBot/2, yBot);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.fill();
        ctx.stroke();
      };

      // Draw Trunk
      ctx.fillStyle = 'rgba(139, 69, 19, 0.2)'; // Brownish
      ctx.fillRect(dim.centerX - 15, dim.bottomY, 30, h - dim.bottomY);
      
      // Draw Tiers (Bottom to Top)
      drawTier(dim.l3Top, dim.l3Bot, dim.l3Width, dim.l3Width * 0.3);
      drawTier(dim.l2Top, dim.l2Bot, dim.l2Width, dim.l2Width * 0.3);
      drawTier(dim.l1Top, dim.l1Bot, dim.l1Width, 0);
      
      ctx.restore();

      // 3. Draw The Top Star (Bethlehem Star)
      const topStarSize = 12 + Math.sin(time * 2) * 2;
      const topStarAlpha = 0.8 + Math.sin(time * 3) * 0.2;
      
      // Glow
      const grad = ctx.createRadialGradient(dim.centerX, dim.topY, 2, dim.centerX, dim.topY, 30);
      grad.addColorStop(0, `rgba(255, 255, 200, ${topStarAlpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dim.centerX, dim.topY, 30, 0, Math.PI * 2);
      ctx.fill();

      // Star Shape
      ctx.fillStyle = '#fffcba';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = dim.centerX + Math.cos(angle) * topStarSize;
        const y = dim.topY + Math.sin(angle) * topStarSize;
        ctx.lineTo(x, y);
        const innerAngle = angle + Math.PI / 5;
        const ix = dim.centerX + Math.cos(innerAngle) * (topStarSize * 0.4);
        const iy = dim.topY + Math.sin(innerAngle) * (topStarSize * 0.4);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();


      // 4. Process Wishes (Stars & Fireworks)
      const activeWishes = wishesRef.current;
      let needsUpdate = false;
      let activeHover: Wish | null = null;

      activeWishes.forEach((wish) => {
        // State Machine
        if (wish.state === 'launching') {
          // Move towards center top roughly
          wish.y -= 8; // Speed up
          wish.x += Math.sin(time * 10 + parseFloat(wish.id)) * 1.5; // Wiggle slightly

          // Draw trail
          ctx.beginPath();
          ctx.moveTo(wish.x, wish.y + 15);
          ctx.lineTo(wish.x, wish.y);
          ctx.lineWidth = 2;
          ctx.strokeStyle = `rgba(255,255,255,0.3)`;
          ctx.stroke();

          // Explode condition
          if (wish.y <= h * 0.35) {
            wish.state = 'exploding';
            // Create particles
            for (let i = 0; i < config.fireworkIntensity; i++) {
              const angle = (Math.PI * 2 * i) / config.fireworkIntensity;
              const speed = Math.random() * 4 + 2;
              const spread = Math.random() * 0.5 + 0.5;
              wish.particles.push({
                x: wish.x,
                y: wish.y,
                vx: Math.cos(angle) * speed * spread,
                vy: Math.sin(angle) * speed * spread,
                life: 1.0 + Math.random() * 0.5,
                color: wish.color,
                alpha: 1,
              });
            }
            needsUpdate = true;
          }

          // Draw Launching Star
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(wish.x, wish.y, 3, 0, Math.PI * 2);
          ctx.fill();

        } else if (wish.state === 'exploding') {
          // Render Explosion Particles
          wish.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95; // Drag
            p.vy *= 0.95;
            p.vy += gravity * 0.2; // Light gravity
            p.life -= 0.02;
            p.alpha = Math.max(0, p.life);

            if (p.life > 0) {
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          });

          // Filter dead particles
          wish.particles = wish.particles.filter(p => p.life > 0);

          if (wish.particles.length === 0) {
            wish.state = 'settled';
            needsUpdate = true;
          } else {
            needsUpdate = true; 
          }

        } else if (wish.state === 'settled') {
          // Lerp to target tree position
          const dx = wish.targetX - wish.x;
          const dy = wish.targetY - wish.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Easing movement
          if (dist > 1) {
            wish.x += dx * 0.08;
            wish.y += dy * 0.08;
            needsUpdate = true;
          } else {
            wish.x = wish.targetX;
            wish.y = wish.targetY;
          }

          // Blinking Logic
          const blinkFreq = config.blinkSpeed + (wish.content.length % 5) * 0.2;
          const alpha = 0.4 + Math.sin(time * blinkFreq + wish.phase) * 0.6;

          // Draw Tree Star
          const size = config.starSize;
          
          // Outer Glow
          const gradient = ctx.createRadialGradient(wish.x, wish.y, 0, wish.x, wish.y, size * 3);
          gradient.addColorStop(0, wish.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = alpha * 0.5;
          ctx.beginPath();
          ctx.arc(wish.x, wish.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Star Core (Rotated slightly for variety)
          ctx.fillStyle = '#fff';
          ctx.save();
          ctx.translate(wish.x, wish.y);
          ctx.rotate(wish.phase);
          ctx.beginPath();
          // Draw a simple 4-point star shape for variety instead of just circle
          const s = size;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(s/4, -s/4, s, 0);
          ctx.quadraticCurveTo(s/4, s/4, 0, s);
          ctx.quadraticCurveTo(-s/4, s/4, -s, 0);
          ctx.quadraticCurveTo(-s/4, -s/4, 0, -s);
          ctx.fill();
          ctx.restore();

          // Mouse Interaction Check
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const d = Math.sqrt((mx - wish.x) ** 2 + (my - wish.y) ** 2);
          if (d < 20) {
            activeHover = wish;
            // Draw hover ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(wish.x, wish.y, 12, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      if (needsUpdate) {
        setWishes([...wishesRef.current]);
      }

      if (activeHover !== null) {
        const hoverWish = activeHover as Wish;
        setHoveredWish(hoverWish);
        setTooltipPos({ x: hoverWish.x, y: hoverWish.y });
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredWish(null);
        document.body.style.cursor = 'default';
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Resize Handler
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        w = canvasRef.current.width;
        h = canvasRef.current.height;
        
        // Recalculate target positions for settled stars on resize
        wishesRef.current.forEach(wish => {
          if (wish.state === 'settled') {
             const newPos = getTreePosition(w, h, config.treeBaseWidth);
             wish.targetX = newPos.x;
             wish.targetY = newPos.y;
             // Snap immediately on resize to avoid flying around
             wish.x = newPos.x;
             wish.y = newPos.y;
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [config, getTreeDimensions, getTreePosition]);

  /**
   * Handlers
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const submitWish = () => {
    if (!inputContent.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2;
    const startY = canvas.height;
    const { x: targetX, y: targetY } = getTreePosition(canvas.width, canvas.height, config.treeBaseWidth);

    const newWish: Wish = {
      id: Math.random().toString(36).substr(2, 9),
      nickname: inputNickname || '神秘人',
      content: inputContent,
      color: inputColor,
      x: startX,
      y: startY,
      targetX,
      targetY,
      state: 'launching',
      particles: [],
      phase: Math.random() * Math.PI * 2,
      timestamp: Date.now(),
    };

    setWishes(prev => [...prev, newWish]);
    setIsModalOpen(false);
    setInputContent('');
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onMouseMove={handleMouseMove}
        style={{ touchAction: 'none' }}
      />

      {/* Foreground UI Layer (Buttons & Overlays) */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-all duration-500 ${isPanelOpen ? 'pl-80' : ''}`}>
        
        {/* Title / Header */}
        <div className="absolute top-8 w-full text-center pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-serif text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-widest">
            许愿星光树
          </h1>
          <p className="text-pink-200/80 mt-2 font-serif text-lg tracking-widest">Make a wish upon a star</p>
        </div>

        {/* Wish Button */}
        <div className="absolute bottom-12 w-full flex justify-center pointer-events-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-md rounded-full border border-pink-300/30 text-white font-serif text-xl overflow-hidden hover:bg-white/20 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              <PenTool className="w-5 h-5" />
              写下心愿
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Tooltip Overlay */}
        {hoveredWish && (
          <div
            className="absolute pointer-events-none z-50 flex flex-col items-center animate-in fade-in zoom-in duration-200"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 20,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-white/90 backdrop-blur-xl text-slate-900 p-4 rounded-xl shadow-2xl max-w-xs border border-white/50 relative">
              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-white/90 rotate-45 border-b border-r border-white/50"></div>
              
              <div className="text-xs font-bold text-pink-600 mb-1 flex items-center gap-1">
                <Heart size={12} fill="currentColor" />
                {hoveredWish.nickname} 的星光
              </div>
              <p className="font-serif text-sm leading-relaxed text-gray-800 break-words">
                {hoveredWish.content}
              </p>
              <div className="mt-2 text-[10px] text-gray-400 text-right">
                {new Date(hoveredWish.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            style={{
              boxShadow: `0 0 50px ${inputColor}40`
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 text-white">
              <h3 className="text-2xl font-serif flex items-center gap-2">
                <Sparkles className="text-yellow-300" />
                许愿仪式
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              
              {/* Nickname */}
              <div>
                <label className="block text-xs text-pink-200 mb-1 pl-1">你的名字</label>
                <input
                  type="text"
                  value={inputNickname}
                  onChange={(e) => setInputNickname(e.target.value)}
                  placeholder="留个名字吧..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-pink-400 transition-colors"
                />
              </div>

              {/* Wish Content - Simulated Handwriting Area */}
              <div>
                <label className="block text-xs text-pink-200 mb-1 pl-1">写下心愿 (支持手写体)</label>
                <div className="relative">
                  <textarea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="在这里写下你的圣诞心愿..."
                    rows={4}
                    className={`w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400 transition-colors resize-none text-lg leading-relaxed ${
                       // Applying a handwriting-like font fallback logic
                       "font-[cursive]" 
                    }`}
                    style={{ fontFamily: "'Dancing Script', 'Zeyada', cursive, serif" }}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-white/40">
                    {inputContent.length} 字
                  </div>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs text-pink-200 mb-2 pl-1">选择星光颜色</label>
                <div className="flex gap-3 justify-center">
                  {['#ffd700', '#ff69b4', '#00ffff', '#ff4500', '#adff2f', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setInputColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${inputColor === c ? 'border-white scale-110 shadow-[0_0_10px_white]' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitWish}
                disabled={!inputContent.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                <Send size={18} />
                点亮星光
              </button>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
          </div>
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

export default function StarlightWishesPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load font for handwriting simulation
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    }
  }, []);

  const handleConfigChange = (key: string, val: any) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-50">
      <DisplayUI config={config} isPanelOpen={isConfigOpen} />
    </main>
  );
}