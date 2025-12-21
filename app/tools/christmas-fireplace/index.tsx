import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Gift, Star, Heart, Music, Snowflake, Moon } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  bgTheme: 'deepNight' | 'warmRoom'; // 移除 custom，专注于优化现有主题
  customBgUrl: string;
  appleSize: number;
  windowScale: number;
  starDensity: number;
  starSpeed: number;
  haloIntensity: number;
  appleLabel: string;
  bubbleText: string;
  blessingText: string;
  giftType: 'apple' | 'giftbox' | 'flower';
}

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: 'deepNight',
  customBgUrl: '',
  appleSize: 1.0,
  windowScale: 1.0,
  starDensity: 60,
  starSpeed: 1.5,
  haloIntensity: 0.9,
  appleLabel: '平安喜乐',
  bubbleText: '今晚的月色真美...',
  blessingText: '愿你被世界温柔以待 ✨',
  giftType: 'giftbox',
};

// 添加通用配置元数据
export const christmasFireplaceConfigMetadata = {
  panelTitle: '🎄 平安夜工坊',
  panelSubtitle: 'Create Your Christmas Magic',
  configSchema: {
    bgTheme: {
      label: '场景氛围',
      type: 'select' as const,
      options: [
        { label: '静谧雪夜', value: 'deepNight' },
        { label: '温馨暖阁', value: 'warmRoom' },
      ],
      category: 'scene' as const,
    },
    haloIntensity: { 
      label: '炉火暖光', 
      type: 'slider' as const, 
      min: 0.3, max: 1.2, step: 0.1, 
      category: 'scene' as const,
    },
    appleSize: { 
      label: '礼物尺寸', 
      type: 'slider' as const, 
      min: 0.6, max: 1.4, step: 0.1, 
      category: 'visual' as const,
    },
    starDensity: { 
      label: '火焰/星光', 
      type: 'slider' as const, 
      min: 20, max: 150, step: 10, 
      category: 'visual' as const,
    },
    appleLabel: { 
      label: '礼物标签', 
      type: 'input' as const, 
      category: 'content' as const,
    },
    bubbleText: { 
      label: '气泡心语', 
      type: 'input' as const, 
      category: 'content' as const,
    },
    blessingText: { 
      label: '袜子祝福', 
      type: 'input' as const, 
      category: 'content' as const,
    },
    giftType: {
      label: '礼物形态',
      type: 'select' as const,
      options: [
        { label: '神秘礼盒', value: 'giftbox' },
        { label: '平安红果', value: 'apple' },
        { label: '冬日玫瑰', value: 'flower' },
      ],
      category: 'visual' as const,
    }
  },
  tabs: [
    { id: 'scene' as const, label: '场景' },
    { id: 'visual' as const, label: '视觉' },
    { id: 'content' as const, label: '文案' },
  ],
};

/**
 * ==============================================================================
 * 2. 视觉特效组件 (Visual Effects)
 * ==============================================================================
 */

// 火焰粒子系统
class FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;

  constructor(w: number, h: number) {
    this.x = w / 2 + (Math.random() - 0.5) * (w * 0.5); // 火源宽度
    this.y = h - Math.random() * 10;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -Math.random() * 2 - 1.5; // 向上飘
    this.maxLife = Math.random() * 0.8 + 0.5;
    this.life = this.maxLife;
    this.size = Math.random() * 8 + 4;
    
    // 火焰颜色渐变：黄 -> 橙 -> 红 -> 烟灰
    const r = 255;
    const g = 100 + Math.random() * 100;
    const b = Math.random() * 50;
    this.color = `${r}, ${g}, ${b}`;
  }

  update() {
    this.x += this.vx + Math.sin(Date.now() / 200) * 0.5; // 摇曳感
    this.y += this.vy;
    this.life -= 0.015;
    this.size *= 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, `rgba(${this.color}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${this.color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

const FireplaceCanvas = ({ intensity }: { intensity: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: FireParticle[] = [];
    let frameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen'; // 混合模式让火焰更亮

      // 根据强度生成粒子
      if (particles.length < intensity * 3) {
        for(let i=0; i<3; i++) particles.push(new FireParticle(canvas.width, canvas.height));
      }

      particles.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
      });

      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [intensity]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-cover" />;
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
  const [giftsOpened, setGiftsOpened] = useState<boolean[]>([false, false, false]);
  const [activeStocking, setActiveStocking] = useState<number>(-1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleOpenGift = (index: number) => {
    if (giftsOpened[index]) return;
    const newOpened = [...giftsOpened];
    newOpened[index] = true;
    setGiftsOpened(newOpened);
    
    // 触发袜子祝福
    setActiveStocking(index);
    setTimeout(() => setActiveStocking(-1), 4000);
  };

  // 背景样式逻辑
  const roomStyle = config.bgTheme === 'deepNight' 
    ? { background: 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 60%, #312e81 100%)' }
    : { background: 'linear-gradient(to bottom, #451a03 0%, #78350f 60%, #92400e 100%)' };

  return (
    <div className="absolute inset-0 overflow-hidden" style={roomStyle}>
      {/* 墙纸纹理层 (Noise Texture for realism) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 动态火光反射层 (Flickering Ambient Light) */}
      <div className="absolute inset-0 pointer-events-none mix-blend-soft-light animate-flicker"
           style={{ 
             background: 'radial-gradient(circle at 50% 80%, #fb923c 0%, transparent 70%)',
             opacity: config.haloIntensity * 0.6 
           }} />
           
      {/* 暗角层 (Vignette) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* --- 窗户 (Window) --- */}
      <div className="absolute top-8 left-8 md:left-[15%] w-32 h-44 perspective-origin-center transform transition-all duration-700"
           style={{ transform: `scale(${config.windowScale}) rotateY(5deg)` }}>
        <div className="relative w-full h-full bg-[#0c1220] border-4 border-[#3a2616] rounded-t-full shadow-2xl overflow-hidden group">
           {/* 窗外景色 */}
           <div className="absolute inset-0 opacity-80">
             <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1e293b] to-[#0f172a]"></div>
             {config.bgTheme === 'deepNight' && (
               <>
                 <Moon className="absolute top-4 right-6 text-yellow-100/90 w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,200,0.8)]" />
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className="absolute bg-white rounded-full animate-snow"
                        style={{
                          width: Math.random() * 3 + 1 + 'px',
                          height: Math.random() * 3 + 1 + 'px',
                          left: Math.random() * 100 + '%',
                          top: -10 + 'px',
                          animationDuration: Math.random() * 3 + 4 + 's',
                          animationDelay: Math.random() * 2 + 's'
                        }} />
                 ))}
               </>
             )}
           </div>
           {/* 窗框十字 */}
           <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-[#3a2616] shadow-lg z-10"></div>
           <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-[#3a2616] shadow-lg z-10"></div>
           {/* 玻璃反光 */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-900/10 to-transparent pointer-events-none"></div>
        </div>
        {/* 窗台积雪 */}
        <div className="absolute -bottom-1 -left-2 -right-2 h-4 bg-white/90 rounded-full filter blur-[1px] shadow-sm transform rotate-1"></div>
      </div>

      {/* --- 主壁炉区域 (Main Fireplace) --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-auto flex flex-col items-center z-10">
        
        {/* 1. 壁炉顶板 (Mantel) & 装饰 */}
        <div className="w-[92%] md:w-[85%] relative z-20">
          {/* 松枝装饰 Garland */}
          <div className="absolute -top-6 left-0 right-0 h-12 flex justify-between items-end px-2 pointer-events-none z-30">
             <div className="w-full h-8 bg-[url('https://api.iconify.design/emojione:christmas-tree.svg')] bg-repeat-x opacity-80 filter brightness-75 drop-shadow-md" style={{ backgroundSize: '40px' }}></div>
          </div>
          
          {/* 顶板实体 */}
          <div className="h-6 bg-[#5d4037] rounded-sm shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-t border-[#8d6e63] relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          </div>
          
          {/* 悬挂的袜子 */}
          <div className="absolute top-5 left-0 right-0 flex justify-around px-12 md:px-20 z-20">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative group perspective-500">
                {/* 祝福语气泡 */}
                <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-48 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeStocking === i ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4 pointer-events-none'}`}>
                   <div className="bg-white/95 text-red-900 text-xs md:text-sm px-3 py-2 rounded-xl shadow-xl relative font-serif border border-red-100">
                     ✨ {config.blessingText}
                     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                   </div>
                </div>
                
                {/* 袜子 SVG */}
                <div className="w-12 md:w-16 h-20 md:h-24 origin-top transition-transform duration-300 hover:rotate-6 hover:scale-105 cursor-pointer drop-shadow-lg filter brightness-90 hover:brightness-110">
                   <svg viewBox="0 0 100 140" className="w-full h-full">
                     <defs>
                       <pattern id={`knit-${i}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                         <circle cx="2" cy="2" r="2" fill="rgba(255,255,255,0.2)" />
                       </pattern>
                     </defs>
                     <path d="M15,0 L85,0 L85,50 C85,70 80,130 40,130 L10,130 C10,130 10,105 30,105 C50,105 55,70 55,50 L15,50 Z" 
                           fill={i === 0 ? "#b91c1c" : i === 1 ? "#15803d" : "#c2410c"} />
                     <path d="M15,0 L85,0 L85,50 C85,70 80,130 40,130 L10,130 C10,130 10,105 30,105 C50,105 55,70 55,50 L15,50 Z" 
                           fill={`url(#knit-${i})`} />
                     <rect x="5" y="0" width="90" height="35" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
                   </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 壁炉主体 (Structure) - 增加石砖质感 */}
        <div className="w-[88%] md:w-[78%] h-[50vh] md:h-[55vh] relative flex justify-center items-end shadow-2xl">
           {/* 外框石材 */}
           <div className="absolute inset-0 bg-[#4e342e] rounded-t-lg border-x-[20px] border-t-[20px] border-[#3e2723] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {/* 石砖纹理 */}
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(335deg,rgba(0,0,0,0.3)_23px,transparent_10px),linear-gradient(155deg,rgba(0,0,0,0.3)_23px,transparent_10px),linear-gradient(335deg,rgba(0,0,0,0.3)_23px,transparent_10px),linear-gradient(155deg,rgba(0,0,0,0.3)_23px,transparent_10px)] bg-[length:58px_58px]"></div>
           </div>

           {/* 内部炉膛 (Firebox) */}
           <div className="w-[70%] h-[80%] bg-[#1a0f0a] rounded-t-[50%_15%] relative overflow-hidden shadow-[inset_0_10px_30px_rgba(0,0,0,1)] border-x-2 border-t-2 border-[#5d4037]/30">
              
              {/* 后墙黑炭 */}
              <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

              {/* 木材堆 (Logs) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-20 z-10">
                 <div className="absolute bottom-0 left-0 w-32 h-8 bg-[#3e2723] rounded-full rotate-6 shadow-lg border-b border-black"></div>
                 <div className="absolute bottom-0 right-0 w-36 h-9 bg-[#4e342e] rounded-full -rotate-3 shadow-lg border-b border-black"></div>
                 <div className="absolute bottom-5 left-8 w-28 h-7 bg-[#5d4037] rounded-full -rotate-6 shadow-lg z-10"></div>
                 {/* 燃烧的炭火光 */}
                 <div className="absolute bottom-0 left-10 w-28 h-10 bg-orange-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
              </div>

              {/* 火焰 Canvas */}
              <div className="absolute bottom-4 left-0 right-0 h-56 mix-blend-screen z-20 opacity-90" style={{ transformOrigin: 'bottom' }}>
                 <FireplaceCanvas intensity={config.starDensity} />
              </div>
           </div>
        </div>

        {/* 3. 地板/炉底 (Hearth) */}
        <div className="w-[96%] h-8 bg-[#3e2723] rounded-sm transform skew-x-12 shadow-2xl z-20 relative -mt-1 border-t border-[#5d4037]">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* 4. 礼物区域 (Gifts) */}
        <div className="absolute bottom-4 md:bottom-6 w-full flex justify-center gap-6 md:gap-16 items-end z-40 px-4"
             style={{ transform: `scale(${config.appleSize})`, transformOrigin: 'bottom center' }}>
           {giftsOpened.map((opened, i) => (
             <GiftItem 
               key={i} 
               index={i} 
               isOpened={opened} 
               config={config} 
               onOpen={() => handleOpenGift(i)} 
             />
           ))}
        </div>
      </div>

      {/* 女孩气泡 (Bubble) */}
      <div className="absolute top-[15%] right-[8%] animate-float hidden md:block">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.2)] max-w-xs">
           <p className="font-serif italic text-sm md:text-base text-shadow-sm">“ {config.bubbleText} ”</p>
        </div>
      </div>
      
      {/* 全局CSS动画补充 */}
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: ${config.haloIntensity * 0.5}; }
          50% { opacity: ${config.haloIntensity * 0.7}; }
        }
        .animate-flicker { animation: flicker 3s infinite ease-in-out; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 4s infinite ease-in-out; }

        @keyframes snow {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(100px) translateX(20px); opacity: 0; }
        }
        .animate-snow { animation: snow linear infinite; }
        
        .perspective-500 { perspective: 500px; }
        .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}

// 独立的礼物组件，优化逻辑
const GiftItem = ({ index, isOpened, config, onOpen }: any) => {
  if (!isOpened) {
    // 闭合状态：根据 giftType 渲染不同的包装
    const colors = ['bg-red-700', 'bg-emerald-700', 'bg-amber-600'];
    const ribbons = ['bg-yellow-400', 'bg-red-500', 'bg-white'];
    
    return (
      <div className={`relative group cursor-pointer transition-transform duration-300 hover:scale-110 hover:-translate-y-2`}
           onClick={onOpen}>
         <div className={`w-14 h-14 md:w-16 md:h-16 ${colors[index]} rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden border-b-4 border-black/20`}>
            {/* 包装细节 */}
            <div className={`absolute inset-y-0 left-1/2 w-3 md:w-4 ${ribbons[index]} -translate-x-1/2 shadow-sm`}></div>
            <div className={`absolute inset-x-0 top-1/2 h-3 md:h-4 ${ribbons[index]} -translate-y-1/2 shadow-sm`}></div>
            <Gift className="relative z-10 text-white/90 w-6 h-6 md:w-8 md:h-8 drop-shadow-md" />
         </div>
         {/* 阴影 */}
         <div className="absolute -bottom-2 left-2 right-2 h-1 bg-black/60 blur-sm rounded-full"></div>
      </div>
    );
  }

  // 打开状态：特效展示
  const effects = [
    { icon: <Star className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-[spin_3s_linear_infinite]" />, label: "Lucky Star" },
    { icon: <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse" />, label: "Warm Love" },
    { icon: <Music className="w-12 h-12 text-blue-300 animate-bounce" />, label: "Joyful Song" },
  ];
  
  const content = config.giftType === 'apple' 
    ? { icon: <span className="text-5xl filter drop-shadow-lg animate-bounce">🍎</span>, label: config.appleLabel }
    : config.giftType === 'flower'
    ? { icon: <span className="text-5xl filter drop-shadow-lg animate-pulse">🌹</span>, label: "To My Love" }
    : effects[index % 3];

  return (
    <div className="flex flex-col items-center animate-fade-in-up transform transition-all">
       <div className="relative">
         {/* 背后光晕 */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 blur-xl rounded-full animate-pulse"></div>
         <div className="relative z-10">{content.icon}</div>
         {/* 粒子爆炸模拟 (CSS) */}
         <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-200 rounded-full animate-[ping_1s_ease-out_infinite]"
                   style={{ transform: `rotate(${i * 60}deg) translate(20px)` }}></div>
            ))}
         </div>
       </div>
       <span className="mt-2 text-white/90 text-xs md:text-sm font-serif bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
         {content.label}
       </span>
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function ChristmasFireplacePage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) setIsPanelOpen(false);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none text-slate-200">
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />
    </div>
  );
}