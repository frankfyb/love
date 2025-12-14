'use client';
import React from 'react';
import { Settings2, X, ChevronRight, Sparkles, CloudRain, Heart, Star, Circle, Droplets, Gift } from 'lucide-react';
import { CONFIG_METADATA, AppConfig } from './config';

type Props = {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

export default function RainSnowRippleConfigUI({ config, onChange, isOpen, setIsOpen }: Props) {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 left-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg transition-all duration-300 hover:bg白色/20 hover:scale-105 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100'}`}
        aria-label="打开配置"
      >
        <Settings2 size={24} />
      </button>

      <div className={`fixed top-0 left-0 h-full w-80 md:w-96 z-40 transform transition-transform duration-500 ease-out backdrop-blur-xl bg-black/40 border-r border-white/10 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border白色/10">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold tracking-wide">圣诞特效配置</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg白色/10 text白色/70 hover:text白色 transition-colors">
            {isOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide pb-20">
          {CONFIG_METADATA.map((item) => (
            <div key={item.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                  {item.key === 'rainSpeed' && <CloudRain size={14} className="text-blue-400" />}
                  {item.key === 'rippleShape' && <Droplets size={14} className="text-pink-400" />}
                  {item.key === 'fallingText' && <Gift size={14} className="text-red-400" />}
                  {item.label}
                </label>
                {item.type === 'slider' && (
                  <span className="text-xs font-mono text白色/60 bg白色/5 px-2 py-0.5 rounded">{(config as any)[item.key]}</span>
                )}
              </div>

              {item.type === 'text' && (
                <input type="text" value={(config as any)[item.key] as string} onChange={(e) => onChange(item.key, e.target.value)} className="w-full bg白色/5 border border白色/10 rounded-lg px-4 py-2 text白色 placeholder白色/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              )}

              {item.type === 'textarea' && (
                <textarea value={(config as any)[item.key] as string} onChange={(e) => onChange(item.key, e.target.value)} placeholder={item.placeholder} rows={2} className="w-full bg白色/5 border border白色/10 rounded-lg px-4 py-2 text白色 text-sm placeholder白色/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none" />
              )}

              {item.type === 'select' && item.options && (
                <div className="grid grid-cols-3 gap-2">
                  {item.options.map((opt) => {
                    const isSelected = (config as any)[item.key] === opt.value;
                    return (
                      <button key={opt.value} onClick={() => onChange(item.key, opt.value)} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isSelected ? 'bg-emerald-500/20 border-emerald-500/50 text白色' : 'bg白色/5 border-transparent text白色/50 hover:bg白色/10'}`}>
                        {opt.value === 'heart' && <Heart size={16} className={isSelected ? 'fill-current' : ''} />}
                        {opt.value === 'star' && <Star size={16} className={isSelected ? 'fill-current' : ''} />}
                        {opt.value === 'circle' && <Circle size={16} className={isSelected ? 'fill-current' : ''} />}
                        <span className="text-xs mt-1 scale-90">{opt.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {item.type === 'slider' && (
                <div className="relative flex items-center w-full h-2">
                  <input type="range" min={item.min} max={item.max} step={item.step} value={(config as any)[item.key] as number} onChange={(e) => onChange(item.key, parseFloat(e.target.value))} className="w-full h-1 bg白色/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none focus:ring-0" />
                </div>
              )}

              {item.type === 'color' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border白色/20 shadow-inner" style={{ backgroundColor: (config as any)[item.key] as string }} />
                  <input type="color" value={(config as any)[item.key] as string} onChange={(e) => onChange(item.key, e.target.value)} className="flex-1 h-10 bg透明 cursor-pointer rounded-lg border border白色/10 p-1" />
                </div>
              )}
            </div>
          ))}

          <div className="pt-8 border-t border白色/10">
            <p className="text-xs text-center text白色/30">Made with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </>
  );
}
