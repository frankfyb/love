'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Image as ImageIcon, Sparkles, Minimize2, Maximize2, Move, Trash2 } from 'lucide-react';
import type { AppConfig, StickerInstance } from './config';
import { STICKER_ASSETS } from './config';

export default function DisplayUI({ config, isPanelOpen, onConfigChange }: { config: AppConfig; isPanelOpen: boolean; onConfigChange?: (key: keyof AppConfig, value: any) => void }) {
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
    const newSticker: StickerInstance = { id: crypto.randomUUID(), assetId: asset.id, type: asset.type, content: asset.content, viewBox: asset.viewBox, color: asset.color, x: 50, y: 30, scale: 1, rotation: 0 };
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
    const gradientColors: Record<string, [string, string]> = { warm: ['#5D0E0E', '#1A0505'], cool: ['#0F172A', '#1E3A8A'], romantic: ['#2E0228', '#000000'], aurora: ['#064e3b', '#0c4a6e'] };
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
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 3 + 1, speed: Math.random() * 1 + 0.5, alpha: Math.random() * 0.5 + 0.3 });
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
  const handleMouseUp = useCallback(() => { setIsDragging(false); initialStickerState.current = null; }, []);
  useEffect(() => {
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    else { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
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
            <div key={sticker.id} className={`absolute cursor-move select-none flex items-center justify-center transition-all ${selectedStickerId === sticker.id ? 'z-50' : 'z-30 hover:z-40'}`} style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`, filter: selectedStickerId === sticker.id ? `drop-shadow(0 0 10px ${config.accentColor})` : 'none' }} onMouseDown={(e) => handleMouseDown(e, sticker.id)}>
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
              <button key={s.id} onClick={() => addSticker(s.id)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20">
                {s.type === 'emoji' ? <span className="text-xl">{s.content}</span> : <svg viewBox={s.viewBox || '0 0 24 24'} className="w-5 h-5 fill-current" style={{ color: s.color }}><path d={s.content} /></svg>}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-10 z-50">
          <button onClick={handleExport} disabled={!userImage || isExporting} className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold tracking-widest transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 ${userImage ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-[0_0_40px_rgba(52,211,153,0.4)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
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