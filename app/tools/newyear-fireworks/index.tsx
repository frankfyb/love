'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings, X, Sparkles, Type, Palette, Music, Monitor, Volume2 } from "lucide-react";
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  // 场景设置
  bgTheme: "midnight" | "warmRed" | "deepBlue"; 
  bgValue: string;          // 背景媒体值 (颜色/图片URL/视频URL)
  bgType: "color" | "image" | "video"; 
  
  // 烟花视觉
  particleTheme: "classic" | "rainbow" | "neon" | "custom";
  fireworkScale: number;
  particleCount: number;
  explosionForce: number;
  
  // 文字设置
  textString: string;
  textColor: string;
  textOuterColor: string;
  textScale: number;
  burnIntensity: number;
  
  // 交互
  gravity: number;
  autoLaunch: boolean;
  
  // 音效
  volume: number;
  bgMusicUrl: string;
  enableSound: boolean;
}

// 预设资源库
export const PRESETS = {
  backgrounds: [
    { label: '极致深黑 (纯色)', value: '#05050f', type: 'color' },
    { label: '午夜深蓝 (纯色)', value: '#0f172a', type: 'color' },
    { label: '皇家紫 (纯色)', value: '#240a34', type: 'color' },
    { label: '唯美飘雪 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/20471-309698211.mp4', type: 'video' },
    { label: '温馨壁炉 (动态)', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/23881-337972830_small.mp4', type: 'video' },
  ],
  music: [
    { label: '新年倒计时音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
    { label: '欢快新年歌', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: '宁静钢琴曲', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
  ],
};

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: "midnight",
  bgValue: PRESETS.backgrounds[1].value, 
  bgType: "color",
  particleTheme: "rainbow",
  fireworkScale: 3,
  particleCount: 7500, // 注意：在组件加载时会根据屏幕宽度动态调整
  explosionForce: 25,
  textString: "2026-快乐",
  textColor: "#ffaa00",
  textOuterColor: "#ff4d00",
  textScale: 0.5,
  burnIntensity: 1.2,
  gravity: 0.15,
  autoLaunch: true,
  volume: 0.5,
  bgMusicUrl: PRESETS.music[0].value,
  enableSound: true,
};

// 配置元数据
export const newyearFireworksConfigMetadata = {
  panelTitle: "流光·新年",
  panelSubtitle: "Colorful New Year 2025",
  tabs: [
    { id: "visual" as const, label: "色彩", icon: <Palette size={16} /> },
    { id: "content" as const, label: "祝词", icon: <Type size={16} /> },
    { id: "scene" as const, label: "环境", icon: <Monitor size={16} /> },
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
    textColor: { label: "自定义焰心", type: "color" as const, category: "visual" as const, condition: (c: AppConfig) => c.particleTheme === 'custom' },
    textOuterColor: { label: "自定义外焰", type: "color" as const, category: "visual" as const, condition: (c: AppConfig) => c.particleTheme === 'custom' },
    
    fireworkScale: { label: "绽放半径", type: "slider" as const, min: 0.5, max: 3.0, step: 0.1, category: "visual" as const },
    particleCount: { label: "粒子密度", type: "slider" as const, min: 500, max: 8000, step: 100, category: "visual" as const },
    explosionForce: { label: "炸裂冲击", type: "slider" as const, min: 10, max: 50, step: 1, category: "visual" as const },
    
    textString: { label: "堆积文字", type: "input" as const, category: "content" as const, placeholder: "输入文字..." },
    textScale: { label: "文字尺寸", type: "slider" as const, min: 0.5, max: 2.0, step: 0.1, category: "content" as const },
    burnIntensity: { label: "燃烧猛烈度", type: "slider" as const, min: 0.1, max: 3.0, step: 0.1, category: "content" as const },
    
    // 场景 (背景类)
    bgValue: { 
      category: "scene" as const, 
      type: "media-grid" as const, 
      label: "背景场景", 
      defaultItems: PRESETS.backgrounds 
    },
    gravity: { label: "下坠速度", type: "slider" as const, min: 0.05, max: 0.5, step: 0.01, category: "scene" as const },
    
    // 音频类
    bgMusicUrl: { category: "scene" as const, type: "media-picker" as const, label: "背景音乐", defaultItems: PRESETS.music },
    enableSound: { category: "scene" as const, type: "switch" as const, label: "启用音效" },
    volume: { label: "音效音量", type: "slider" as const, min: 0, max: 1, step: 0.1, category: "scene" as const },
  },
  mobileSteps: [
    { id: 1, label: "色彩主题", icon: <Palette size={16} />, fields: ['particleTheme' as const, 'textColor' as const, 'textOuterColor' as const] },
    { id: 2, label: "烟花参数", icon: <Sparkles size={16} />, fields: ['fireworkScale' as const, 'particleCount' as const, 'explosionForce' as const] },
    { id: 3, label: "祝词文字", icon: <Type size={16} />, fields: ['textString' as const, 'textScale' as const, 'burnIntensity' as const] },
    { id: 4, label: "背景场景", icon: <Monitor size={16} />, fields: ['bgValue' as const, 'gravity' as const] },
    { id: 5, label: "音乐音效", icon: <Music size={16} />, fields: ['bgMusicUrl' as const, 'enableSound' as const, 'volume' as const] },
  ],
};

/**
 * ==============================================================================
 * 2. 核心引擎工具 (SoundEngine)
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
 * 3. 粒子系统类 (Particle System)
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
  color: string = "#fff";
  
  targetX: number = 0;
  targetY: number = 0;
  baseX: number = 0;
  baseY: number = 0;
  noiseOffset: number = Math.random() * 100;
  
  hue: number = 0;
  colorType: "inner" | "outer" = "inner";
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
    this.color = "#FFD700";
  }

  assignColor(config: AppConfig) {
    if (config.particleTheme === "custom") {
        this.color = this.colorType === "inner" ? config.textColor : config.textOuterColor;
    } else if (config.particleTheme === "rainbow") {
        this.hue = Math.random() * 360;
        this.color = `hsl(${this.hue}, 100%, 60%)`;
    } else if (config.particleTheme === "neon") {
        const neons = [180, 280, 300, 320];
        this.hue = neons[Math.floor(Math.random() * neons.length)];
        this.color = `hsl(${this.hue}, 100%, 60%)`;
    } else {
        if (this.colorType === "inner") {
            this.color = Math.random() > 0.5 ? "#FFD700" : "#FFA500";
        } else {
            this.color = Math.random() > 0.5 ? "#FF4500" : "#FF0000";
        }
    }
  }
}

// /**
//  * ==============================================================================
//  * 4. 设置面板组件 (Settings Panel)
//  * ==============================================================================
//  */

// interface SettingsPanelProps {
//   config: AppConfig;
//   onChange: (key: keyof AppConfig, val: any) => void;
//   isOpen: boolean;
//   onClose: () => void;
// }

// function SettingsPanel({ config, onChange, isOpen, onClose }: SettingsPanelProps) {
//   const [activeTab, setActiveTab] = useState<string>("visual");
//   const meta = newyearFireworksConfigMetadata;

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
//       <div className="bg-[#1a1a1a] w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[85vh] sm:rounded-2xl border-none sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#151515] shrink-0">
//           <div>
//             <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
//               <Sparkles className="text-yellow-500" size={20} />
//               {meta.panelTitle}
//             </h2>
//             <p className="text-xs text-gray-400 mt-0.5">{meta.panelSubtitle}</p>
//           </div>
//           <button 
//             onClick={onClose}
//             className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-white/10 bg-[#121212] shrink-0">
//           {meta.tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex-1 py-3 sm:py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative
//                 ${activeTab === tab.id ? 'text-yellow-400 bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
//               `}
//             >
//               {tab.icon}
//               <span className="hidden sm:inline">{tab.label}</span>
//               {activeTab === tab.id && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 bg-[#1a1a1a] scrollbar-thin scrollbar-thumb-white/20 pb-20 sm:pb-6">
//           {Object.entries(meta.configSchema).map(([key, schema]) => {
//             const fieldKey = key as keyof AppConfig;
//             if (schema.category !== activeTab) return null;
//             // @ts-ignore
//             if (schema.condition && !schema.condition(config)) return null;

//             return (
//               <div key={key} className="space-y-2">
//                 <label className="text-sm font-medium text-gray-300 block">
//                   {schema.label}
//                 </label>

//                 {/* SLIDER */}
//                 {schema.type === "slider" && (
//                   <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
//                     <input
//                       type="range"
//                       min={(schema as any).min}
//                       max={(schema as any).max}
//                       step={(schema as any).step}
//                       value={Number(config[fieldKey])}
//                       onChange={(e) => onChange(fieldKey, parseFloat(e.target.value))}
//                       className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 touch-none"
//                     />
//                     <span className="text-xs text-gray-400 w-10 text-right font-mono">{config[fieldKey]}</span>
//                   </div>
//                 )}

//                 {/* SELECT */}
//                 {schema.type === "select" && (
//                   <div className="grid grid-cols-2 gap-2">
//                     {(schema as any).options.map((opt: any) => (
//                       <button
//                         key={opt.value}
//                         onClick={() => onChange(fieldKey, opt.value)}
//                         className={`px-3 py-2.5 rounded-lg text-xs font-medium border transition-all
//                           ${config[fieldKey] === opt.value 
//                             ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
//                             : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:border-white/20'}
//                         `}
//                       >
//                         {opt.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {/* COLOR */}
//                 {schema.type === "color" && (
//                   <div className="flex items-center gap-3">
//                     <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shadow-sm">
//                         <input 
//                         type="color" 
//                         value={String(config[fieldKey])}
//                         onChange={(e) => onChange(fieldKey, e.target.value)}
//                         className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 m-0 cursor-pointer"
//                         />
//                     </div>
//                     <input 
//                       type="text"
//                       value={String(config[fieldKey])}
//                       onChange={(e) => onChange(fieldKey, e.target.value)}
//                       className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-sm text-white font-mono focus:border-yellow-500 outline-none uppercase"
//                     />
//                   </div>
//                 )}

//                 {/* INPUT */}
//                 {schema.type === "input" && (
//                   <input 
//                     type="text"
//                     value={String(config[fieldKey])}
//                     onChange={(e) => onChange(fieldKey, e.target.value)}
//                     placeholder={(schema as any).placeholder}
//                     className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-colors"
//                   />
//                 )}

//                 {/* SWITCH */}
//                 {schema.type === "switch" && (
//                   <button
//                     onClick={() => onChange(fieldKey, !config[fieldKey])}
//                     className={`w-14 h-8 rounded-full p-1 transition-colors ${config[fieldKey] ? 'bg-green-500' : 'bg-gray-700'}`}
//                   >
//                     <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${config[fieldKey] ? 'translate-x-6' : 'translate-x-0'}`} />
//                   </button>
//                 )}

//                 {/* MEDIA GRID */}
//                 {schema.type === "media-grid" && (
//                    <div className="grid grid-cols-2 gap-3">
//                       {(schema as any).defaultItems.map((item: any, idx: number) => {
//                         const isSelected = config.bgValue === item.value;
//                         return (
//                           <button
//                             key={idx}
//                             onClick={() => {
//                                 onChange('bgValue', item.value);
//                                 onChange('bgType', item.type || (item.value.startsWith('#') ? 'color' : 'image'));
//                             }}
//                             className={`relative h-20 sm:h-24 rounded-xl overflow-hidden group border-2 transition-all ${isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
//                           >
//                              {item.type === 'color' ? (
//                                <div className="w-full h-full" style={{ backgroundColor: item.value }} />
//                              ) : item.type === 'video' ? (
//                                <video src={item.value} className="w-full h-full object-cover pointer-events-none" muted loop />
//                              ) : (
//                                <img src={item.value} alt={item.label} className="w-full h-full object-cover" />
//                              )}
//                              <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
//                                 <span className="text-xs text-white font-medium truncate">{item.label}</span>
//                              </div>
//                              {isSelected && <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center"><div className="w-1.5 h-1 bg-black rotate-[-45deg] border-l border-b border-black -mt-0.5"/></div>}
//                           </button>
//                         );
//                       })}
//                    </div>
//                 )}

//                  {/* MEDIA PICKER */}
//                  {schema.type === "media-picker" && (
//                    <div className="space-y-2">
//                       {(schema as any).defaultItems.map((item: any, idx: number) => {
//                          const isSelected = config.bgMusicUrl === item.value;
//                          return (
//                            <button 
//                               key={idx}
//                               onClick={() => onChange('bgMusicUrl', item.value)}
//                               className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
//                                 ${isSelected ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}
//                               `}
//                            >
//                               <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isSelected ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
//                                 <Music size={14} />
//                               </div>
//                               <span className={`text-sm flex-1 truncate ${isSelected ? 'text-yellow-100' : 'text-gray-300'}`}>{item.label}</span>
//                               {isSelected && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />}
//                            </button>
//                          )
//                       })}
//                    </div>
//                  )}
//               </div>
//             );
//           })}
//         </div>
        
//         {/* Footer */}
//         <div className="p-4 bg-[#151515] border-t border-white/10 text-center text-xs text-gray-500 shrink-0">
//           滚动/滑动调整大小 • 点击屏幕发射烟花
//         </div>
//       </div>
//     </div>
//   );
// }

/**
 * ==============================================================================
 * 5. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
}

export function DisplayUI({ config }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const textPointsRef = useRef<Point[]>([]);
  const launchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 使用可复用的音效 Hook
  const {
    audioRef,
    isPlaying,
    isMuted,
    handlePlayPause,
    handleToggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: config.volume,
  });

  // 音效音量控制
  useEffect(() => {
    soundEngine.setVolume(config.volume);
  }, [config.volume]);
  const renderBackground = () => {
    if (config.bgType === 'video' || config.bgValue.endsWith('.mp4') || config.bgValue.endsWith('.webm')) {
        return (
            <video 
                key={config.bgValue}
                className="absolute inset-0 w-full h-full object-cover z-0"
                src={config.bgValue}
                autoPlay
                loop
                muted
                playsInline // 移动端关键属性
            />
        );
    }
    if (config.bgType === 'image' || config.bgValue.startsWith('http')) {
         return (
             <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center z-0 transition-all duration-700"
                style={{ backgroundImage: `url(${config.bgValue})` }}
             />
         );
    }
    return (
        <div 
            className="absolute inset-0 w-full h-full z-0 transition-colors duration-700"
            style={{ backgroundColor: config.bgValue }}
        />
    );
  };

  // 生成文字点阵 - 优化：针对PC和Mobile采用不同策略
  const generateTextPoints = useCallback((text: string, scale: number, width: number, height: number) => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];

    const isMobile = width < 768;

    // 1. 动态计算字号
    const targetWidth = width * (isMobile ? 0.9 : 0.85); // 移动端允许更宽
    let fontSize = Math.min(width / Math.max(text.length, 1) * (isMobile ? 1.4 : 1.6), isMobile ? 250 : 500) * scale;
    
    ctx.font = `900 ${fontSize}px "Microsoft YaHei", "Arial Black", sans-serif`;
    const textMetrics = ctx.measureText(text);
    if (textMetrics.width > targetWidth) {
        fontSize *= targetWidth / textMetrics.width;
    }
    
    // 应用最终字号
    ctx.font = `900 ${fontSize}px "Microsoft YaHei", "Arial Black", sans-serif`;
    
    // 2. 布局设置
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // PC端文字略微靠上，移动端居中偏上
    const centerY = height * (isMobile ? 0.4 : 0.35); 
    
    // 3. 绘制文字 (高清晰度优化)
    ctx.fillText(text, width / 2, centerY);
    
    // PC端：强力描边增加粒子密度；移动端：轻微描边
    const strokeWidth = fontSize * (isMobile ? 0.02 : 0.04); 
    if (strokeWidth > 0.5) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = "white";
        ctx.strokeText(text, width / 2, centerY);
    }

    // 4. 自适应采样 (Adaptive Sampling)
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const points: Point[] = [];
    
    // 核心优化：PC端采样密度翻倍 (gap减小)，移动端保持适中
    const estimatedArea = (fontSize * text.length * fontSize * 0.6); 
    let gap = Math.floor(Math.sqrt(estimatedArea / (isMobile ? 1200 : 3500))); // PC端目标点数更多
    
    // 强制限制
    const minGap = isMobile ? 3 : 2; // PC端最小2px，保证极其细腻
    const maxGap = isMobile ? 6 : 4;
    gap = Math.max(minGap, Math.min(gap, maxGap));

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        // 阈值调整：PC端更严格，保证边缘锐利
        if (imageData[(y * width + x) * 4 + 3] > (isMobile ? 100 : 128)) {
          points.push({ x, y });
        }
      }
    }
    
    return points.sort(() => Math.random() - 0.5);
  }, []);

  // Canvas 逻辑
  useEffect(() => {
    // 初始粒子池大小
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 6000; i++) {
        particlesRef.current.push(new Particle(window.innerWidth, window.innerHeight));
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 响应式 Resize 处理
    const handleResize = () => {
      // PC端使用 dpr=1.5 或 2 保证清晰，移动端限制为 1.5 节省性能
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      ctx.scale(dpr, dpr);

      textPointsRef.current = generateTextPoints(
        config.textString, 
        config.textScale, 
        window.innerWidth, 
        window.innerHeight
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const launchFirework = () => {
      soundEngine.playLaunch();
      const launcher = particlesRef.current[0];
      launcher.launch(window.innerWidth, window.innerHeight);
    };

    if (launchTimerRef.current) clearInterval(launchTimerRef.current);
    if (config.autoLaunch) {
       launchTimerRef.current = setInterval(launchFirework, 7000); 
       setTimeout(launchFirework, 800);
    }

    let time = 0;

    const loop = () => {
      time += 0.05;
      
      // 清空逻辑优化：PC端拖尾稍微长一点（0.15），移动端短一点（0.25）以防糊屏
      const isMobile = window.innerWidth < 768;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${isMobile ? 0.25 : 0.15})`; 
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      ctx.globalCompositeOperation = 'source-over'; 

      const activeParticles = particlesRef.current;
      const textPoints = textPointsRef.current;
      const launcher = activeParticles[0]; 
      const logicalH = window.innerHeight;

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
        
        let trailColor = "rgba(255, 200, 100, 0.8)";
        if (config.particleTheme === "neon") trailColor = "rgba(0, 255, 255, 0.8)";
        if (config.particleTheme === "rainbow") trailColor = `hsla(${time * 50 % 360}, 100%, 70%, 0.8)`;
        
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = isMobile ? 3 : 4;
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

            if (textPoints.length > 0 && p.y > logicalH * 0.15) { 
                const targetIndex = i % textPoints.length;
                const target = textPoints[targetIndex];
                
                // 移动端判定范围稍微小一点，防止粒子乱飞；PC端大一点保证快速汇聚
                const rangeY = isMobile ? 300 : 500;
                
                if (p.y < target.y + 150 && p.y > target.y - rangeY && Math.abs(p.x - target.x) < rangeY) {
                     p.targetX = target.x;
                     p.targetY = target.y;
                     p.baseX = target.x;
                     p.baseY = target.y;
                     p.state = "ASSEMBLE";
                }
            }
            if (p.y > logicalH) p.alpha = 0;
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

            if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) {
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
            // PC端粒子细腻(小)，移动端粒子饱满(大)
            const baseSize = isMobile ? 2.5 : 1.5; 
            p.size = (Math.sin(time * 5 + i) * 0.5 + 1.5) * baseSize;
        }

        if (p.alpha > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            
            if (p.state === "BURN" && config.particleTheme !== "custom") {
                 ctx.fillStyle = Math.random() > 0.8 ? "#FFFFFF" : p.color;
            } else {
                 ctx.fillStyle = p.color;
            }
            
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
  }, [config, generateTextPoints]);

  const handleInteraction = (e: React.PointerEvent) => {
    soundEngine.init();
    if (audioRef.current && audioRef.current.paused && config.enableSound) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = particlesRef.current;
    let count = 0;
    const interactRadius = window.innerWidth < 768 ? 80 : 60; // 移动端交互范围更大

    for (let i = 1; i < particles.length; i++) {
        if (count > 100) break;
        const p = particles[i];
        if (p.state === "BURN" || (p.state === "FALL" && Math.abs(p.x - x) < interactRadius && Math.abs(p.y - y) < interactRadius)) {
            p.x = x;
            p.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.state = "EXPLODE";
            p.alpha = 1;
            p.size = Math.random() * 3 + 2;
            p.assignColor(config);
            count++;
        }
    }
    if (count > 0) soundEngine.playExplosion();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* 1. 背景层 */}
      {renderBackground()}
      
      {/* 2. 遮罩层 */}
      <div className="absolute inset-0 bg-black/40 z-1 pointer-events-none" />

      {/* 3. Canvas 层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block w-full h-full touch-none"
        onPointerDown={handleInteraction}
      />
      
      {/* 4. 背景音乐 */}
      <audio 
        ref={audioRef}
        src={config.bgMusicUrl}
        loop
      />

      {/* 5. 音频控制面板 - 使用可复用组件 */}
      <AudioControlPanel
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onToggleMute={handleToggleMute}
        enabled={config.enableSound}
        position="bottom-right"
        size="sm"
      />

      {/* 6. UI 控件层 */}
      {/* <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
            onClick={togglePanel}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/10 shadow-lg active:scale-95 duration-200"
        >
            <Settings size={20} />
        </button>
      </div> */}

      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-20 opacity-80 animate-pulse px-4">
        <p className="text-sm sm:text-base font-light tracking-[0.3em] text-orange-200 drop-shadow-[0_0_10px_rgba(255,100,0,0.8)] truncate">
          {config.textString} • 薪火相传
        </p>
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 6. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function NewYearFireworksPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 初始化时检测设备性能和屏幕尺寸，进行针对性优化
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setConfig(prev => ({
        ...prev,
        particleCount: 2000, // 移动端粒子数量适中，配合较大的单体尺寸
        fireworkScale: 1.0,  // 减小爆炸范围，防止飞出屏幕
        explosionForce: 20,  // 减弱爆炸力度，使烟花更聚拢
      }));
    } else {
        // PC端增强配置
        setConfig(prev => ({
            ...prev,
            particleCount: 5000, // PC端海量粒子
        }));
    }

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
    <main className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      <DisplayUI 
        config={config} 
        // togglePanel={() => setIsPanelOpen(true)} 
      />
    </main>
  );
}