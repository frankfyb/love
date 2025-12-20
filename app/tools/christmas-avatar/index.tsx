'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Type, Snowflake, Wand2, Download, Image as ImageIcon, 
  Sparkles, Minimize2, Maximize2, Move, Trash2 
} from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export type StickerType = 'emoji' | 'svg';
export interface StickerAsset { 
  id: string; 
  type: StickerType; 
  content: string; 
  viewBox?: string; 
  color?: string; 
  label: string 
}

export interface StickerInstance { 
  id: string; 
  assetId: string; 
  type: StickerType; 
  content: string; 
  viewBox?: string; 
  color?: string; 
  x: number; 
  y: number; 
  scale: number; 
  rotation: number 
}

export type BgType = 'warm' | 'cool' | 'romantic' | 'aurora';

export interface AppConfig { 
  titleText: string; 
  particleCount: number; 
  primaryColor: string; 
  accentColor: string; 
  bgGradientType: BgType;
  userImage?: string; // 添加用户图片字段
  stickers?: StickerInstance[]; // 添加贴纸字段
}

export const DEFAULT_CONFIG: AppConfig = { 
  titleText: 'Merry Christmas', 
  particleCount: 150, 
  primaryColor: '#FFD700', 
  accentColor: '#39FF14', 
  bgGradientType: 'warm',
  stickers: [] // 默认空贴纸数组
};

// 添加通用配置元数据
export const christmasAvatarConfigMetadata = {
  panelTitle: '圣诞头像工坊',
  panelSubtitle: 'Design Your Christmas Avatar',
  configSchema: {
    titleText: {
      label: '节日寄语',
      type: 'input' as const,
      category: 'content' as const,
    },
    bgGradientType: {
      label: '氛围基调',
      type: 'select' as const,
      options: [
        { label: '温暖壁炉 (红金)', value: 'warm' },
        { label: '冰雪奇缘 (蓝白)', value: 'cool' },
        { label: '暗夜浪漫 (紫金)', value: 'romantic' },
        { label: '极光幻境 (绿蓝)', value: 'aurora' },
      ],
      category: 'scene' as const,
    },
    particleCount: {
      label: '飞雪密度',
      type: 'slider' as const,
      min: 0,
      max: 400,
      step: 20,
      category: 'visual' as const,
    },
    primaryColor: {
      label: '边框主色',
      type: 'color' as const,
      category: 'visual' as const,
    },
    accentColor: {
      label: '高光点缀',
      type: 'color' as const,
      category: 'visual' as const,
    }
  },
  tabs: [
    { id: 'content' as const, label: '内容' },
    { id: 'scene' as const, label: '场景' },
    { id: 'visual' as const, label: '视觉' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '内容', 
      fields: ['titleText' as const] 
    },
    { 
      id: 2, 
      label: '场景', 
      fields: ['bgGradientType' as const, 'particleCount' as const] 
    },
    { 
      id: 3, 
      label: '视觉', 
      fields: ['primaryColor' as const, 'accentColor' as const] 
    },
  ],
};

export const STICKER_ASSETS: StickerAsset[] = [
  { id: 'hat-santa', type: 'svg', label: '圣诞帽', viewBox: '0 0 512 512', color: '#D42E2E', content: 'M464 256h-8c-13.3 0-24-10.7-24-24V86.8c0-38.6-35.6-67.8-73.3-60.3l-2.2.4c-22.9 4.6-42.5 20.3-51.4 42.1L256 192l-49.1-123c-8.9-21.8-28.5-37.5-51.4-42.1l-2.2-.4C115.6 19 80 48.2 80 86.8V232c0 13.3-10.7 24-24 24h-8c-26.5 0-48 21.5-48 48v80c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-80c0-26.5-21.5-48-48-48zM256 64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-64 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z' },
  { id: 'antlers', type: 'svg', label: '麋鹿角', viewBox: '0 0 24 24', color: '#8B4513', content: 'M12 2C8 2 5 5 5 9c0 2.5 1.5 4.5 3.5 5.5C7 16 5 18 5 21h2c0-2.5 2-4.5 5-4.5s5 2 5 4.5h2c0-3-2-5-3.5-6.5 2-1 3.5-3 3.5-5.5 0-4-3-7-7-7z' },
  { id: 'hat-elf', type: 'svg', label: '精灵帽', viewBox: '0 0 512 512', color: '#2E8B57', content: 'M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-5.8 6.1-6.1 15.6-.5 21.9 2.8 3.2 6.9 4.8 11.2 4.8 4 0 7.8-1.5 10.8-4.3 1.2-1.1 82.6-81.4 82.6-81.4 46 22.8 97.4 34.4 149.7 34.4 141.4 0 256-93.1 256-208S397.4 32 256 32z' },
  { id: 'e1', type: 'emoji', content: '🎅', label: '圣诞老人' },
  { id: 'e2', type: 'emoji', content: '🦌', label: '麋鹿' },
  { id: 'e3', type: 'emoji', content: '🎄', label: '圣诞树' },
  { id: 'e4', type: 'emoji', content: '🎁', label: '礼物' },
  { id: 'e5', type: 'emoji', content: '❄️', label: '雪花' },
  { id: 'e6', type: 'emoji', content: '🔔', label: '铃铛' },
  { id: 'e7', type: 'emoji', content: '🧣', label: '围巾' },
  { id: 'e8', type: 'emoji', content: '⛄', label: '雪人' },
];

/**
 * ==============================================================================
 * 2. 配置面板组件 (ConfigUI)
 * ==============================================================================
 */

interface ConfigUIProps { 
  config: AppConfig; 
  onChange: (key: keyof AppConfig, value: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}

export function ConfigUI({ config, onChange, isOpen, setIsOpen }: ConfigUIProps) {
  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`fixed top-6 left-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="打开配置">
        <Wand2 size={20} />
      </button>
      <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-500 bg-black/40 backdrop-blur-xl border-r border-white/10 shadow-2xl ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <Wand2 className="w-6 h-6" style={{ color: config.accentColor }} />
          <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">圣诞工坊</h1>
          <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white">✕</button>
        </div>
        <div className="h-full w-full p-6 overflow-y-auto space-y-6">
          <div className="space-y-6">
            {Object.entries(christmasAvatarConfigMetadata.configSchema).map(([key, item]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/50 pl-1">{item.label}</label>
                {item.type === 'input' && (
                  <div className="relative">
                    <Type className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                    <input 
                      type="text" 
                      value={String((config as any)[key])} 
                      onChange={(e) => onChange(key as keyof AppConfig, e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10" 
                    />
                  </div>
                )}
                {item.type === 'slider' && (
                  <div className="flex items-center gap-4">
                    <Snowflake className="w-4 h-4 text-white/40" />
                    <input 
                      type="range" 
                      min={item.min} 
                      max={item.max} 
                      step={item.step} 
                      value={Number((config as any)[key])} 
                      onChange={(e) => onChange(key as keyof AppConfig, Number(e.target.value))} 
                      className="flex-1 accent-white/80 h-1 bg-white/10 rounded-lg cursor-pointer" 
                    />
                    <span className="text-xs font-mono text-white/60 w-8 text-right">{(config as any)[key]}</span>
                  </div>
                )}
                {item.type === 'color' && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 relative">
                    <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: String((config as any)[key]) }} />
                    <input 
                      type="color" 
                      value={String((config as any)[key])} 
                      onChange={(e) => onChange(key as keyof AppConfig, e.target.value)} 
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                    />
                    <span className="text-xs font-mono text-white/60 ml-auto">{String((config as any)[key])}</span>
                  </div>
                )}
                {item.type === 'select' && (
                  <div className="grid grid-cols-1 gap-2">
                    {item.options?.map(opt => (
                      <button 
                        key={opt.value} 
                        onClick={() => onChange(key as keyof AppConfig, opt.value)} 
                        className={`text-left text-sm px-4 py-2 rounded-lg border transition-all ${String((config as any)[key]) === opt.value ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
  onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const snowCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialStickerState = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // 从配置中获取用户图片和贴纸
  const userImage = config.userImage || null;
  const [stickers, setStickers] = useState<StickerInstance[]>(config.stickers || []);

  // 当配置中的 stickers 变化时，更新本地状态
  useEffect(() => {
    if (config.stickers && JSON.stringify(config.stickers) !== JSON.stringify(stickers)) {
      setStickers(config.stickers);
    }
  }, [config.stickers, stickers]);

  const addSticker = (assetId: string) => {
    const asset = STICKER_ASSETS.find(a => a.id === assetId);
    if (!asset) return;
    const newSticker: StickerInstance = { 
      id: crypto.randomUUID(), 
      assetId: asset.id, 
      type: asset.type, 
      content: asset.content, 
      viewBox: asset.viewBox, 
      color: asset.color, 
      x: 50, 
      y: 30, 
      scale: 1, 
      rotation: 0 
    };
    const updatedStickers = [...stickers, newSticker];
    setStickers(updatedStickers);
    setSelectedStickerId(newSticker.id);
    // 更新配置中的 stickers
    onConfigChange?.('stickers' as keyof AppConfig, updatedStickers);
  };
  
  const removeSticker = (id: string) => { 
    const updatedStickers = stickers.filter(s => s.id !== id);
    setStickers(updatedStickers);
    if (selectedStickerId === id) setSelectedStickerId(null);
    // 更新配置中的 stickers
    onConfigChange?.('stickers' as keyof AppConfig, updatedStickers);
  };
  
  const updateSticker = (id: string, updates: Partial<StickerInstance>) => { 
    const updatedStickers = stickers.map(s => s.id === id ? { ...s, ...updates } : s);
    setStickers(updatedStickers);
    // 更新配置中的 stickers
    onConfigChange?.('stickers' as keyof AppConfig, updatedStickers);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      const url = URL.createObjectURL(file); 
      // 更新配置中的用户图片
      onConfigChange?.('userImage', url);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const canvas = exportCanvasRef.current;
    if (!canvas || !userImage) { setIsExporting(false); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsExporting(false); return; }
    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    const gradientColors: Record<string, [string, string]> = { 
      warm: ['#5D0E0E', '#1A0505'], 
      cool: ['#0F172A', '#1E3A8A'], 
      romantic: ['#2E0228', '#000000'], 
      aurora: ['#064e3b', '#0c4a6e'] 
    };
    const colors = gradientColors[config.bgGradientType] || gradientColors.warm;
    const bgGradient = ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, colors[0]);
    bgGradient.addColorStop(1, colors[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userImage;
    await new Promise((resolve) => { img.onload = resolve; });
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const frameSize = size * 0.65;
    ctx.beginPath();
    ctx.arc(0, 0, frameSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(frameSize / img.width, frameSize / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.strokeStyle = config.primaryColor;
    ctx.shadowColor = config.accentColor;
    ctx.shadowBlur = 30;
    ctx.arc(0, 0, frameSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    stickers.forEach(sticker => {
      ctx.save();
      const sx = (sticker.x / 100) * size;
      const sy = (sticker.y / 100) * size;
      ctx.translate(sx, sy);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.scale(sticker.scale, sticker.scale);
      if (sticker.type === 'emoji') {
        ctx.font = '120px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.content, 0, 0);
      } else {
        const p = new Path2D(sticker.content);
        ctx.fillStyle = sticker.color || '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        const svgBaseScale = 0.3;
        ctx.scale(svgBaseScale, svgBaseScale);
        ctx.translate(-256, -256);
        ctx.fill(p);
      }
      ctx.restore();
    });
    if (config.titleText) {
      ctx.save();
      ctx.fillStyle = config.primaryColor;
      ctx.font = 'bold 90px "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = config.accentColor;
      ctx.shadowBlur = 20;
      ctx.fillText(config.titleText, size / 2, size * 0.92);
      ctx.restore();
    }
    ctx.save();
    const snowCount = config.particleCount;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < snowCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 4 + 2;
      const alpha = Math.random() * 0.6 + 0.2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    const link = document.createElement('a');
    link.download = `christmas-avatar-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  useEffect(() => {
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; r: number; speed: number; alpha: number }> = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push({ 
          x: Math.random() * canvas.width, 
          y: Math.random() * canvas.height, 
          r: Math.random() * 3 + 1, 
          speed: Math.random() * 1 + 0.5, 
          alpha: Math.random() * 0.5 + 0.3 
        });
      }
    };
    initParticles();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y += p.speed;
        p.x += Math.sin(p.y * 0.01) * 0.5;
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, [config.particleCount]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedStickerId(id);
    setIsDragging(true);
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialStickerState.current = { x: sticker.x, y: sticker.y };
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedStickerId || !initialStickerState.current) return;
    const dxPx = e.clientX - dragStartPos.current.x;
    const dyPx = e.clientY - dragStartPos.current.y;
    const dxPct = (dxPx / window.innerWidth) * 100;
    const dyPct = (dyPx / window.innerHeight) * 100;
    updateSticker(selectedStickerId, { x: initialStickerState.current.x + dxPct, y: initialStickerState.current.y + dyPct });
  }, [isDragging, selectedStickerId]);
  
  const handleMouseUp = useCallback(() => { 
    setIsDragging(false); 
    initialStickerState.current = null; 
  }, []);
  
  useEffect(() => {
    if (isDragging) { 
      window.addEventListener('mousemove', handleMouseMove); 
      window.addEventListener('mouseup', handleMouseUp); 
    }
    else { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    }
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getBgClass = () => {
    switch (config.bgGradientType) {
      case 'cool': return 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900';
      case 'romantic': return 'bg-gradient-to-br from-[#2E0228] via-[#520838] to-black';
      case 'aurora': return 'bg-gradient-to-br from-[#064e3b] via-[#0c4a6e] to-black';
      case 'warm': default: return 'bg-gradient-to-br from-[#5D0E0E] via-[#3E0808] to-black';
    }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden text-white ${getBgClass()} font-sans selection:bg-pink-500 selection:text-white`}>
      <div className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center ${isPanelOpen ? 'pl-80' : 'pl-0'}`} onClick={() => setSelectedStickerId(null)}>
        <div className="relative group max-w-2xl w-full aspect-square max-h-[80vh] flex flex-col items-center justify-center z-20">
          <div className="relative w-[60vh] h-[60vh] md:w-[500px] md:h-[500px] rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500" style={{ boxShadow: `0 0 80px ${config.primaryColor}30`, border: `6px solid ${config.primaryColor}` }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-black/20 backdrop-blur-sm relative group cursor-pointer">
              {userImage ? <img src={userImage} alt="Avatar" className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 group-hover:bg-white/5 transition-colors">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs font-bold tracking-widest">UPLOAD IMAGE</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
            {config.titleText && (
              <div className="absolute -bottom-20 left-0 right-0 text-center pointer-events-none z-30">
                <h2 className="text-5xl font-bold tracking-widest" style={{ color: config.primaryColor, textShadow: `0 0 20px ${config.accentColor}`, fontFamily: 'serif' }}>{config.titleText}</h2>
              </div>
            )}
          </div>
          {stickers.map((sticker) => (
            <div 
              key={sticker.id} 
              className={`absolute cursor-move select-none flex items-center justify-center transition-all ${selectedStickerId === sticker.id ? 'z-50' : 'z-30 hover:z-40'}`} 
              style={{ 
                left: `${sticker.x}%`, 
                top: `${sticker.y}%`, 
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`, 
                filter: selectedStickerId === sticker.id ? `drop-shadow(0 0 10px ${config.accentColor})` : 'none' 
              }} 
              onMouseDown={(e) => handleMouseDown(e, sticker.id)}
            >
              {sticker.type === 'emoji' ? <div className="text-6xl leading-none">{sticker.content}</div> : (
                <svg viewBox={sticker.viewBox} className="w-24 h-24 drop-shadow-lg" style={{ fill: sticker.color }}>
                  <path d={sticker.content} />
                </svg>
              )}
              {selectedStickerId === sticker.id && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 bg-black/70 backdrop-blur-md rounded-full p-1.5 shadow-xl border border-white/10">
                  <button onClick={(e) => { e.stopPropagation(); updateSticker(sticker.id, { scale: Math.max(0.3, sticker.scale - 0.1) }) }} className="p-1.5 hover:text-green-400 text-white transition-colors"><Minimize2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); updateSticker(sticker.id, { scale: sticker.scale + 0.1 }) }} className="p-1.5 hover:text-green-400 text-white transition-colors"><Maximize2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); updateSticker(sticker.id, { rotation: sticker.rotation + 45 }) }} className="p-1.5 hover:text-yellow-400 text-white transition-colors"><Move size={16} /></button>
                  <div className="w-px h-4 bg-white/20 mx-1 self-center" />
                  <button onClick={(e) => { e.stopPropagation(); removeSticker(sticker.id) }} className="p-1.5 hover:text-red-500 text-white transition-colors"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
          <div className="absolute -right-10 top-10 flex flex-col gap-2 z-50">
            {STICKER_ASSETS.map((s) => (
              <button 
                key={s.id} 
                onClick={() => addSticker(s.id)} 
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
              >
                {s.type === 'emoji' ? <span className="text-xl">{s.content}</span> : (
                  <svg viewBox={s.viewBox || '0 0 24 24'} className="w-5 h-5 fill-current" style={{ color: s.color }}>
                    <path d={s.content} />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-10 z-50">
          <button 
            onClick={handleExport} 
            disabled={!userImage || isExporting} 
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold tracking-widest transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 ${
              userImage ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]' : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {isExporting ? <Sparkles className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{userImage ? '下载专属头像 (含雪花)' : '请先上传照片'}</span>
          </button>
        </div>
      </div>
      <canvas ref={snowCanvasRef} className="absolute inset-0 pointer-events-none z-40 opacity-80" />
      <canvas ref={exportCanvasRef} className="hidden" />
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function ChristmasAvatarPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigChange = (key: string, val: any) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-50">
      <DisplayUI 
        config={config} 
        isPanelOpen={isConfigOpen} 
        onConfigChange={handleConfigChange} 
      />
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isConfigOpen} 
        setIsOpen={setIsConfigOpen} 
      />
    </main>
  );
}