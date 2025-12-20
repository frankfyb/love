'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, X, Heart, Gift, Sparkles, ChevronDown, ChevronUp, Music, Snowflake, Star, Image as ImageIcon, PenTool, Type } from 'lucide-react';

// =================================================================================
// 1. 类型定义与默认配置 (Core Configuration)
// =================================================================================

export type BackgroundType = 'snowy_forest' | 'fireplace' | 'starry_sky' | 'misty_haze' | 'custom';
export type TextEffectType = 'snow_stroke' | 'warm_breath' | 'gradient_glow' | 'handwritten';
export type FontType = 'serif' | 'cursive';

export interface AppConfig {
  title: string;
  romanticMessage: string;
  
  // 盲盒配置
  triggerCount: number; // 触发盲盒的点击次数 (例如 3, 5, 9)
  giftContent: string; // 盲盒礼物内容，用换行符分隔多种礼物
  
  // 视觉配置
  backgroundType: BackgroundType;
  customBgUrl: string;
  textEffect: TextEffectType;
  fontType: FontType;
  
  // 基础配置
  particleDensity: number;
  showMusicBtn: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  title: "平安喜乐",
  romanticMessage: "你是我原本寡淡的剧情里，最耀眼的惊喜。",
  triggerCount: 3,
  giftContent: "愿你三冬暖，愿你春不寒\n🍎 平安夜快乐！\n🎁 兑换券：一个拥抱\n🌟 隐藏款：心愿达成卡",
  backgroundType: 'fireplace', // 默认暖光壁炉
  customBgUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1080&q=80",
  textEffect: 'warm_breath',
  fontType: 'serif',
  particleDensity: 60,
  showMusicBtn: true,
};

// 添加通用配置元数据
export const eveAppleBlindConfigMetadata = {
  panelTitle: '盲盒配置台',
  panelSubtitle: 'Customize your surprise',
  configSchema: {
    title: {
      label: '主标题',
      type: 'input' as const,
      category: 'content' as const,
    },
    romanticMessage: {
      label: '过程情话',
      type: 'textarea' as const,
      category: 'content' as const,
    },
    triggerCount: {
      label: '盲盒解锁次数',
      type: 'select' as const,
      options: [
        { label: '3次 (经典)', value: 3 },
        { label: '5次 (悬念)', value: 5 },
        { label: '9次 (长久)', value: 9 }
      ],
      category: 'gameplay' as const,
    },
    giftContent: {
      label: '盲盒礼物池 (一行一个)',
      type: 'textarea' as const,
      placeholder: '例如：\n拥抱券\n大餐一顿\n520红包',
      category: 'gameplay' as const,
    },
    backgroundType: {
      label: '氛围背景',
      type: 'select' as const,
      options: [
        { label: '暖光壁炉', value: 'fireplace' },
        { label: '飘雪森林', value: 'snowy_forest' },
        { label: '璀璨星空', value: 'starry_sky' },
        { label: '雾感朦胧', value: 'misty_haze' },
        { label: '自定义图片', value: 'custom' }
      ],
      category: 'scene' as const,
    },
    customBgUrl: {
      label: '自定义背景URL',
      type: 'input' as const,
      category: 'scene' as const,
      condition: (config: AppConfig) => config.backgroundType === 'custom',
    },
    textEffect: {
      label: '文字特效',
      type: 'select' as const,
      options: [
        { label: '暖光呼吸', value: 'warm_breath' },
        { label: '雪花描边', value: 'snow_stroke' },
        { label: '渐变流光', value: 'gradient_glow' },
        { label: '手写轨迹', value: 'handwritten' }
      ],
      category: 'visual' as const,
    },
    fontType: {
      label: '字体风格',
      type: 'select' as const,
      options: [
        { label: '优雅雪花体 (Serif)', value: 'serif' },
        { label: '浪漫手写体 (Cursive)', value: 'cursive' }
      ],
      category: 'content' as const,
    },
    particleDensity: {
      label: '浪漫浓度',
      type: 'slider' as const,
      min: 20,
      max: 100,
      step: 10,
      category: 'visual' as const,
    },
    showMusicBtn: {
      label: '音乐装饰',
      type: 'switch' as const,
      category: 'visual' as const,
    },
  },
  tabs: [
    { id: 'content' as const, label: '内容' },
    { id: 'gameplay' as const, label: '玩法' },
    { id: 'scene' as const, label: '场景' },
    { id: 'visual' as const, label: '视觉' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '基础', 
      fields: ['title' as const, 'romanticMessage' as const, 'triggerCount' as const]
    },
    { 
      id: 2, 
      label: '礼物', 
      fields: ['giftContent' as const, 'backgroundType' as const]
    },
    { 
      id: 3, 
      label: '样式', 
      fields: ['textEffect' as const, 'fontType' as const, 'particleDensity' as const, 'showMusicBtn' as const]
    },
  ],
};

// 样式预设系统
const BG_PRESETS = {
  fireplace: {
    bg: "radial-gradient(circle at 50% 80%, #5c1313 0%, #2a0808 60%, #000000 100%)",
    overlay: "bg-orange-500/5",
    accent: "text-orange-100",
    particleType: 'sparkle', // 火火星
    buttonColor: "bg-orange-700"
  },
  snowy_forest: {
    bg: "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
    overlay: "bg-blue-500/5",
    accent: "text-blue-50",
    particleType: 'snow',
    buttonColor: "bg-cyan-700"
  },
  starry_sky: {
    bg: "radial-gradient(circle at 50% 100%, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    overlay: "bg-purple-500/5",
    accent: "text-purple-50",
    particleType: 'star',
    buttonColor: "bg-indigo-600"
  },
  misty_haze: {
    bg: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    overlay: "bg-white/20",
    accent: "text-gray-700",
    particleType: 'heart', // 雾中爱心
    buttonColor: "bg-pink-400"
  },
  custom: {
    bg: "#000",
    overlay: "bg-black/20",
    accent: "text-white",
    particleType: 'snow',
    buttonColor: "bg-white/20"
  }
};

// =================================================================================
// 3. 核心展示组件 (DisplayUI)
// =================================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speed: number;
  opacity: number;
  type: 'seed' | 'heart' | 'snow' | 'sparkle' | 'star';
}

export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen: boolean }) {
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [giftText, setGiftText] = useState("");
  
  // 视觉状态
  const bgStyle = BG_PRESETS[config.backgroundType as keyof typeof BG_PRESETS] || BG_PRESETS.fireplace;
  const isCustomBg = config.backgroundType === 'custom';
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化礼物池
  const gifts = useMemo(() => {
    return config.giftContent.split('\n').filter(t => t.trim() !== '');
  }, [config.giftContent]);

  // 获取文字特效类名
  const getTextEffectClass = () => {
    switch (config.textEffect) {
      case 'snow_stroke': return 'effect-snow-stroke';
      case 'warm_breath': return 'effect-warm-breath';
      case 'gradient_glow': return 'effect-gradient-glow';
      case 'handwritten': return 'effect-handwritten';
      default: return '';
    }
  };

  // 获取字体类名
  const getFontClass = () => config.fontType === 'cursive' ? 'font-cursive' : 'font-serif';

  // 粒子循环
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setParticles(prev => 
        prev.map(p => {
          // 向上飘的特效 (点击反馈)
          if (p.type === 'heart' && p.speed > 0.5) { // 快速爱心
             return { ...p, y: p.y - p.speed, opacity: p.opacity - 0.02, scale: p.scale * 0.98 };
          }
          // 向下落的特效 (背景/雨)
          let newY = p.y + p.speed;
          if (newY > 110) newY = -10; // 循环
          
          return {
            ...p,
            y: p.type === 'sparkle' || (p.type === 'heart' && p.speed > 0.5) ? p.y - p.speed : newY,
            x: p.x + Math.sin(p.y * 0.02 + p.id) * 0.1,
            rotation: p.rotation + (p.type === 'star' ? 0.5 : 1),
          };
        }).filter(p => p.opacity > 0)
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 生成粒子
  const spawnParticles = (type: Particle['type'], count: number, x?: number, y?: number) => {
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: x ? (x / window.innerWidth * 100) + (Math.random() - 0.5) * 5 : Math.random() * 100,
      y: y ? (y / window.innerHeight * 100) + (Math.random() - 0.5) * 5 : (type === 'heart' ? -10 : Math.random() * 100),
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      speed: type === 'heart' ? 0.5 + Math.random() : 0.05 + Math.random() * 0.1,
      opacity: 1,
      type
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  // 背景氛围粒子初始化
  useEffect(() => {
    setParticles([]); // 重置
    const type = bgStyle.particleType as Particle['type'];
    // 初始生成50个背景粒子
    spawnParticles(type, 50);
  }, [config.backgroundType]);

  // 全局点击处理
  const handleGlobalClick = (e: React.MouseEvent) => {
    if (showGiftCard) return;

    // 1. 即时反馈：点击处爆出小爱心
    spawnParticles('heart', 5, e.clientX, e.clientY);
    
    // 2. 苹果震动反馈
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    // 3. 阶段逻辑
    if (nextCount === 1) {
      // 阶段1：播种 (Seed)
      spawnParticles('seed', 15, window.innerWidth/2, window.innerHeight/2);
    } 
    else if (nextCount === config.triggerCount - 1) {
      // 阶段N-1：爱心雨预警 -> 爆发
      const interval = setInterval(() => {
        spawnParticles('heart', 5);
      }, 100);
      setTimeout(() => clearInterval(interval), 3000);
    }
    else if (nextCount >= config.triggerCount) {
      // 最终阶段：盲盒开启
      const randomGift = gifts[Math.floor(Math.random() * gifts.length)] || "平安喜乐";
      setGiftText(randomGift);
      setTimeout(() => setShowGiftCard(true), 600);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClickCount(0);
    setShowGiftCard(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center transition-all duration-1000 ${getFontClass()}`}
      style={{ 
        background: isCustomBg ? `url(${config.customBgUrl}) center/cover no-repeat` : bgStyle.bg 
      }}
      onClick={handleGlobalClick}
    >
      {/* 遮罩层 (用于统一文字可读性) */}
      <div className={`absolute inset-0 ${isCustomBg ? 'bg-black/40' : ''} pointer-events-none`} />

      {/* 音乐按钮 */}
      {config.showMusicBtn && (
        <div className="absolute top-4 right-4 z-30 animate-spin-slow opacity-80 cursor-pointer" onClick={(e) => e.stopPropagation()}>
           <div className="p-2.5 backdrop-blur-md rounded-full border border-white/20 bg-white/10 shadow-lg">
             <Music size={18} className="text-white" />
           </div>
        </div>
      )}

      {/* 粒子层 */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute transition-transform will-change-transform"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              opacity: p.opacity,
            }}
          >
             {p.type === 'heart' && <Heart fill="#ff4d4d" className="text-red-500" size={24} />}
             {p.type === 'star' && <Star fill="#ffd700" className="text-yellow-300" size={16} />}
             {p.type === 'snow' && <Snowflake className="text-white/80" size={20} />}
             {p.type === 'sparkle' && <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_10px_white]" />}
             {p.type === 'seed' && <div className="w-2 h-3 bg-amber-900 rounded-[100%]" />}
          </div>
        ))}
      </div>

      {/* 核心内容区 */}
      <div className="relative z-20 flex flex-col items-center animate-hands-lift w-full px-6">
        
        {/* 标题 */}
        <h1 className={`text-5xl md:text-6xl font-bold mb-12 text-center drop-shadow-lg tracking-widest ${bgStyle.accent} ${getTextEffectClass()}`}>
          {config.title}
        </h1>

        {/* 苹果 & 双手 */}
        <div className="relative group cursor-pointer">
           {/* 阶段2：情话气泡 */}
           <div className={`absolute left-1/2 -translate-x-1/2 -top-32 w-72 text-center transition-all duration-700 z-30 
              ${clickCount >= 2 && !showGiftCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}>
              <div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/50 relative transform rotate-1">
                 <p className="text-gray-800 text-lg font-medium leading-relaxed font-cursive">
                   {config.romanticMessage}
                 </p>
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45" />
              </div>
           </div>

           {/* 苹果容器 */}
           <div className={`relative w-64 h-64 md:w-80 md:h-80 transition-all duration-300
              ${isShaking ? 'animate-shake' : 'animate-float'}
              ${showGiftCard ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
           `}>
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-2xl overflow-visible">
                 {/* 双手奉上 SVG */}
                 <g transform="translate(0, 8)" className="opacity-90">
                    <path d="M -10 110 Q 10 80 40 90 L 30 110 Z" fill={config.backgroundType === 'fireplace' ? '#7f1d1d' : '#2c3e50'} />
                    <path d="M 110 110 Q 90 80 60 90 L 70 110 Z" fill={config.backgroundType === 'fireplace' ? '#7f1d1d' : '#2c3e50'} />
                    <path d="M 10 110 C 10 90, 25 82, 48 88" fill="#ffdbac" />
                    <path d="M 90 110 C 90 90, 75 82, 52 88" fill="#ffdbac" />
                 </g>

                 {/* 苹果本体 */}
                 <g transform="translate(0, -5)">
                    <path d="M50 20 Q52 10 56 5" fill="none" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                    <path d="M50 20 Q65 0 80 20 Q65 40 50 20 Z" fill="#4ade80" />
                    <defs>
                      <radialGradient id="appleGradient">
                        <stop offset="0%" stopColor="#ff9a9e" />
                        <stop offset="100%" stopColor="#fecfef" />
                      </radialGradient>
                      <radialGradient id="redApple">
                         <stop offset="10%" stopColor="#ff4d4d" />
                         <stop offset="90%" stopColor="#990000" />
                      </radialGradient>
                    </defs>
                    <path 
                      d="M50 32 C 20 10, 0 45, 20 82 C 35 102, 65 102, 80 82 C 100 45, 80 10, 50 32 Z" 
                      fill="url(#redApple)" 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth="1"
                    />
                    <ellipse cx="35" cy="45" rx="8" ry="12" fill="white" opacity="0.2" transform="rotate(-15 35 45)" />
                 </g>
              </svg>
              
              {/* 点击提示 */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max animate-bounce">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                   {clickCount === 0 ? "点击屏幕开启盲盒" : clickCount < config.triggerCount ? `再点 ${config.triggerCount - clickCount} 下` : "即将揭晓..."}
                </span>
              </div>
           </div>
        </div>

        {/* 盲盒礼物卡片 (反转弹出) */}
        {showGiftCard && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 perspective-1000 z-50">
              <div className="relative w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-flip-in border-4 border-double border-pink-200 transform rotate-[-2deg]">
                 {/* 装饰 */}
                 <div className="absolute -top-6 -right-6 animate-pulse">
                    <Gift size={64} className="text-pink-500 drop-shadow-md" />
                 </div>
                 
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜获得</h3>
                 <div className="w-12 h-1 bg-pink-500 mx-auto rounded-full mb-6" />
                 
                 <div className="py-6 px-4 bg-pink-50 rounded-xl mb-8 border border-pink-100">
                    <p className="text-xl font-bold text-pink-600 whitespace-pre-line leading-relaxed font-cursive">
                      {giftText}
                    </p>
                 </div>
                 
                 <button 
                   onClick={handleReset}
                   className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                   <Sparkles size={18} /> 再开一次
                 </button>
              </div>
           </div>
        )}

      </div>
      
      {/* 样式注入 */}
      <style>{`
        .font-cursive { font-family: "Comic Sans MS", "Chalkboard SE", sans-serif; }
        .font-serif { font-family: "Georgia", serif; }

        .effect-snow-stroke { -webkit-text-stroke: 1px rgba(255,255,255,0.8); color: transparent; }
        .effect-warm-breath { animation: breath 3s infinite ease-in-out; text-shadow: 0 0 20px rgba(255,165,0,0.6); }
        .effect-gradient-glow { background: linear-gradient(to bottom, #fff, #ffe4e1); -webkit-background-clip: text; color: transparent; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
        
        @keyframes breath { 0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(255,200,0,0.5); } 50% { opacity: 0.8; text-shadow: 0 0 5px rgba(255,200,0,0.2); } }
        @keyframes hands-lift { from { transform: translateY(100vh); } to { transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes flip-in { 0% { transform: rotateY(90deg) scale(0.5); opacity: 0; } 100% { transform: rotateY(0) scale(1); opacity: 1; } }
        
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .animate-flip-in { animation: flip-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-hands-lift { animation: hands-lift 1.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

// =================================================================================
// 4. 主入口组件
// =================================================================================

export default function SafetyApplePage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans bg-black">
      <DisplayUI 
        config={config} 
        isPanelOpen={isConfigOpen} 
      />
    </div>
  );
}
