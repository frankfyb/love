'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, ChevronDown, ChevronUp, Gift, Sparkles, Snowflake, Flame } from 'lucide-react';

// ============================================================================
// 1. 类型定义与默认配置 (Types & Default Config)
// ============================================================================

export interface AppConfig {
  // 场景设置
  bgImage: string;
  bgOverlayOpacity: number;
  
  // 氛围特效
  effectType: 'snow' | 'candle' | 'none';
  particleCount: number; // 雪花数量或烛光强度
  
  // 圣诞老人设置
  santaImage: string;
  santaSpeed: number; // 动画速度
  
  // 祝福与礼物
  blessingText: string;
  giftContent: string; // 礼物描述或Emoji
  giftImage: string; // 礼物贴纸URL (可选)
}

export const DEFAULT_CONFIG: AppConfig = {
  bgImage: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=2574&auto=format&fit=crop',
  bgOverlayOpacity: 0.3,
  effectType: 'snow',
  particleCount: 100,
  santaImage: 'https://cdn-icons-png.flaticon.com/512/3799/3799971.png', // 卡通圣诞老人占位图
  santaSpeed: 1,
  blessingText: '平安夜快乐！愿你的世界如雪般纯净，如烛光般温暖。🍎',
  giftContent: '🎁 神秘大礼包',
  giftImage: 'https://cdn-icons-png.flaticon.com/512/4213/4213650.png', // 苹果/礼物贴纸
};

// 配置元数据
export const CONFIG_METADATA = [
  {
    group: '场景氛围',
    items: [
      { key: 'bgImage', type: 'image', label: '背景图片' },
      { key: 'bgOverlayOpacity', type: 'slider', label: '夜色浓度', min: 0, max: 0.8, step: 0.1 },
      { key: 'effectType', type: 'select', label: '浪漫特效', options: [
        { label: '❄️ 漫天飘雪', value: 'snow' },
        { label: '🕯️ 暖光烛火', value: 'candle' },
        { label: '无特效', value: 'none' },
      ]},
    ]
  },
  {
    group: '主角设置',
    items: [
      { key: 'santaImage', type: 'image', label: '圣诞老人形象' },
      { key: 'santaSpeed', type: 'slider', label: '行走/呼吸速度', min: 0.5, max: 3, step: 0.1 },
    ]
  },
  {
    group: '祝福内容',
    items: [
      { key: 'blessingText', type: 'text', label: '祝福语' },
      { key: 'giftContent', type: 'text', label: '礼物名称' },
      { key: 'giftImage', type: 'image', label: '礼物/苹果贴纸' },
    ]
  }
];

// ============================================================================
// 2. 配置面板组件 (ConfigUI)
// ============================================================================

interface ConfigUIProps {
  config: AppConfig;
  onChange: (key: string, val: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export function ConfigUI({ config, onChange, isOpen, setIsOpen }: ConfigUIProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderInput = (item: any) => {
    switch (item.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(config as any)[item.key]}
            onChange={(e) => onChange(item.key, e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 backdrop-blur-sm"
          />
        );
      case 'slider':
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={(config as any)[item.key]}
              onChange={(e) => onChange(item.key, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="text-xs text-white/80 w-8 text-right">{(config as any)[item.key]}</span>
          </div>
        );
      case 'select':
        return (
          <select
            value={(config as any)[item.key]}
            onChange={(e) => onChange(item.key, e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-400 backdrop-blur-sm [&>option]:text-black"
          >
            {item.options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'image':
        return (
          <div className="flex gap-2 items-center">
             <input
                type="text"
                value={(config as any)[item.key]}
                onChange={(e) => onChange(item.key, e.target.value)}
                placeholder="图片URL..."
                className="flex-1 bg-white/20 border border-white/30 rounded px-2 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none backdrop-blur-sm truncate"
            />
          </div>
        )
      default:
        return null;
    }
  };

  const pcSidebarClass = `fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
  const mobileCardClass = `fixed top-0 left-0 w-full bg-black/30 backdrop-blur-lg border-b border-white/10 z-50 transition-all duration-300 ease-in-out shadow-lg flex flex-col`;

  if (!isMobile) {
    return (
      <>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed left-4 top-4 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white shadow-lg transition-all group"
          >
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        )}
        <div className={pcSidebarClass}>
          <div className="p-6 space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-serif text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400" />
                配置面板
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {CONFIG_METADATA.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">{group.group}</h3>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.key} className="space-y-1">
                      <label className="text-xs text-white/70 block">{item.label}</label>
                      {renderInput(item)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-4 text-xs text-white/30 text-center">
              Designed for Christmas 🎄
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className={mobileCardClass}>
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white/5 active:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Settings className="w-4 h-4 text-red-300" />
            <span>节日配置</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-white/70" /> : <ChevronDown className="w-4 h-4 text-white/70" />}
        </div>
        {isOpen && (
          <div className="px-4 py-4 space-y-6 max-h-[60vh] overflow-y-auto">
             {CONFIG_METADATA.map((group, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-xs font-bold text-red-300/80 uppercase">{group.group}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {group.items.slice(0, 3).map((item) => (
                    <div key={item.key} className="space-y-1">
                       <div className="flex justify-between">
                         <label className="text-xs text-white/70">{item.label}</label>
                       </div>
                       {renderInput(item)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

// ============================================================================
// 3. 核心展示组件 (DisplayUI) - 包含优化后的交互逻辑
// ============================================================================

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  // 核心状态
  const [santaPos, setSantaPos] = useState(10); // 0 to 100 percentage
  const [direction, setDirection] = useState<'left' | 'right'>('right'); // 面朝方向
  const [isMoving, setIsMoving] = useState(false); // 是否正在行走
  const [isBagClicked, setIsBagClicked] = useState(false); // 礼物袋点击状态
  const [isAppleClicked, setIsAppleClicked] = useState(false); // 苹果点击状态(展示祝福)
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 雪花/特效渲染
  useEffect(() => {
    if (config.effectType !== 'snow') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let particles: Array<{x: number, y: number, r: number, d: number}> = [];
    
    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for(let i = 0; i < config.particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 4 + 1,
          d: Math.random() * config.particleCount
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      for(let i = 0; i < config.particleCount; i++) {
        let p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    let angle = 0;
    const update = () => {
      angle += 0.01;
      for(let i = 0; i < config.particleCount; i++) {
        let p = particles[i];
        p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
        p.x += Math.sin(angle) * 2;
        if(p.x > canvas.width + 5 || p.x < -5 || p.y > canvas.height) {
          if(i % 3 > 0) {
            particles[i] = {x: Math.random() * canvas.width, y: -10, r: p.r, d: p.d};
          } else {
            if(Math.sin(angle) > 0) {
               particles[i] = {x: -5, y: Math.random() * canvas.height, r: p.r, d: p.d};
            } else {
               particles[i] = {x: canvas.width + 5, y: Math.random() * canvas.height, r: p.r, d: p.d};
            }
          }
        }
      }
    };

    initParticles();
    draw();
    const handleResize = () => initParticles();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.effectType, config.particleCount]);

  // 2. 优化后的行走逻辑
  const handleBgClick = (e: React.MouseEvent) => {
    // 阻止交互元素的冒泡触发移动
    if ((e.target as HTMLElement).closest('.interactive-area')) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX;
      const newPos = (clickX / rect.width) * 100;
      
      // 判断方向
      if (newPos < santaPos) {
        setDirection('left');
      } else {
        setDirection('right');
      }
      
      // 开始移动状态
      setIsMoving(true);
      
      // 限制范围，避免圣诞老人走出屏幕太远
      setSantaPos(Math.min(Math.max(newPos, 5), 95));
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    // 只有当 left 属性变化结束时才停止行走动画
    if (e.propertyName === 'left') {
      setIsMoving(false);
    }
  };

  // 3. 重置交互
  const resetInteraction = () => {
    setIsAppleClicked(false);
    setIsBagClicked(false);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none font-sans cursor-pointer"
      onClick={handleBgClick}
    >
      {/* 背景与遮罩 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${config.bgImage})` }}
      />
      <div 
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500"
        style={{ opacity: config.bgOverlayOpacity }}
      />

      {/* 特效层 */}
      {config.effectType === 'candle' && (
         <div className="absolute inset-0 pointer-events-none mix-blend-overlay animate-pulse-slow">
           <div className="absolute inset-0 bg-gradient-radial from-orange-500/30 via-transparent to-black/60" />
           <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-orange-400/20 blur-[50px] animate-flicker" />
           <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-red-400/20 blur-[60px] animate-flicker delay-700" />
         </div>
      )}
      {config.effectType === 'snow' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />
      )}

      {/* 底部位置指示器 */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center pointer-events-none z-0 opacity-40">
         <div className="w-[80%] h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500/80 transition-all duration-[2000ms] ease-out"
              style={{ width: `${santaPos}%` }}
            />
         </div>
      </div>

      {/* --- 圣诞老人核心交互区 --- */}
      <div 
        className="interactive-area absolute bottom-[15%] transition-[left] duration-[2000ms] ease-in-out z-20 will-change-left"
        style={{ 
          left: `${santaPos}%`, 
          transform: `translateX(-50%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="relative group">
          
          {/* 圣诞老人与礼物袋容器 - 控制转向 */}
          <div 
            className="relative transition-transform duration-500"
            style={{
              transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
            }}
          >
            {/* 圣诞老人主体 - 控制行走颠簸动画 */}
            <div 
              className="relative w-40 h-40 md:w-56 md:h-56"
              style={{ 
                animation: isMoving ? `walkBob ${1/config.santaSpeed}s infinite ease-in-out` : 'none',
                transformOrigin: 'bottom center'
              }}
            >
               <img 
                 src={config.santaImage} 
                 alt="Santa" 
                 className="w-full h-full object-contain drop-shadow-2xl"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3799/3799971.png";
                 }}
               />
               
               {/* 礼物袋 (Gift Bag) */}
               {/* 注意：礼物袋如果是子元素，会随父亲scaleX翻转。如果不希望礼物袋反向，需要单独处理，但通常背在背上翻转是合理的 */}
               <div 
                  className={`absolute bottom-4 right-2 w-16 h-16 md:w-20 md:h-20 transition-all duration-300 origin-top-left cursor-pointer hover:scale-110 hover:brightness-110 ${isBagClicked ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100'}`}
                  style={{
                    animation: isMoving ? `swayBag ${2/config.santaSpeed}s infinite ease-in-out alternate` : 'none'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBagClicked(true);
                  }}
               >
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/9453/9453955.png" 
                    alt="Bag" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                  {/* 呼吸光圈提示可点击 */}
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
               </div>
            </div>
          </div>

          {/* 苹果/礼物弹出 (独立于翻转容器，保持正向或跟随逻辑) */}
          {/* 这里放在外层div里，但定位需要跟随。如果放在scaleX容器内，文字和图片会镜像。为了简单，我们让苹果弹出时不镜像，或者接受镜像。
              为了体验最好，我们让它绝对定位在老人上方，不参与scaleX(-1) */}
          {isBagClicked && !isAppleClicked && (
             <div 
               className="absolute top-0 right-[-10px] w-14 h-14 md:w-18 md:h-18 cursor-pointer z-30 interactive-area"
               style={{
                 // 简单的物理抛物线动画通过 keyframes 实现
                 animation: 'pop-arc 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
                 // 如果老人向左，我们需要调整苹果弹出的初始位置，这里简单处理为居中弹出
                 left: '50%',
                 transform: 'translateX(-50%)'
               }}
               onClick={(e) => {
                 e.stopPropagation();
                 setIsAppleClicked(true);
               }}
             >
                <img 
                  src={config.giftImage} 
                  alt="Gift"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,0,0.6)] animate-bounce-soft"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold shadow-xl animate-fade-in-up border border-red-100">
                  点我拆礼物!
                </div>
             </div>
          )}
        </div>
      </div>

      {/* --- 祝福弹窗 (Blessing Modal) --- */}
      {isAppleClicked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in interactive-area" onClick={(e) => e.stopPropagation()}>
          <div className="relative bg-white/10 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,0,0,0.3)] backdrop-blur-xl animate-scale-up overflow-hidden">
            
            {/* 装饰背景 */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/30 rounded-full blur-[40px]" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/30 rounded-full blur-[40px]" />

            <button 
              onClick={(e) => { e.stopPropagation(); resetInteraction(); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 space-y-6">
               <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-red-100 to-red-50 rounded-full flex items-center justify-center shadow-inner group cursor-pointer" onClick={() => {
                 // 再次点击礼物图标有个小反馈
               }}>
                 <img src={config.giftImage} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform" alt="Gift" />
               </div>
               
               <div className="space-y-3">
                 <h2 className="text-3xl font-serif text-red-200 font-bold drop-shadow-md tracking-wide">平安夜快乐</h2>
                 <p className="text-white/90 text-lg leading-relaxed font-light font-serif">
                   {config.blessingText}
                 </p>
               </div>

               <div className="pt-6 border-t border-white/10">
                 <p className="text-sm text-white/60 mb-3">您收到了一份心意</p>
                 <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-900/50 transform hover:scale-105 active:scale-95 transition-all">
                   <Gift className="w-5 h-5" />
                   {config.giftContent}
                 </div>
               </div>
            </div>
            
            {/* 烟花粒子 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full animate-firework" 
                      style={{
                        top: '40%', left: '50%',
                        animationDelay: `${i * 0.1}s`,
                        transform: `rotate(${i * 45}deg) translateY(-120px)`
                      }} 
                 />
               ))}
            </div>

          </div>
        </div>
      )}

      {/* --- 全局动画样式 --- */}
      <style jsx global>{`
        @keyframes walkBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          75% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes swayBag {
          0% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes pop-arc {
          0% { opacity: 0; transform: translate(-50%, 20px) scale(0.5); }
          50% { opacity: 1; transform: translate(-50%, -120px) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -100px) scale(1); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes firework {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-flicker {
          animation: flicker 3s infinite;
        }
        .animate-bounce-soft {
          animation: bounce-soft 2s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// 4. 默认导出
// ============================================================================

export default function SantaPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isPanelOpen} 
        setIsOpen={setIsPanelOpen} 
      />
    </div>
  );
}