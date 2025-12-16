'use client';
import React from 'react';
import { Type, Snowflake, Wand2 } from 'lucide-react';
import { CONFIG_METADATA, AppConfig } from './config';

type Props = { 
  config: AppConfig; 
  onChange: (key: keyof AppConfig, value: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
};

export default function ConfigUI({ config, onChange, isOpen, setIsOpen }: Props) {
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
            {CONFIG_METADATA.map((item) => (
              <div key={item.key} className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/50 pl-1">{item.label}</label>
                {item.type === 'text' && (
                  <div className="relative">
                    <Type className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                    <input type="text" value={String((config as any)[item.key])} onChange={(e) => onChange(item.key, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10" />
                  </div>
                )}
                {item.type === 'number' && (
                  <div className="flex items-center gap-4">
                    <Snowflake className="w-4 h-4 text-white/40" />
                    <input type="range" min={item.min} max={item.max} step={item.step} value={Number((config as any)[item.key])} onChange={(e) => onChange(item.key, Number(e.target.value))} className="flex-1 accent-white/80 h-1 bg-white/10 rounded-lg cursor-pointer" />
                    <span className="text-xs font-mono text-white/60 w-8 text-right">{(config as any)[item.key]}</span>
                  </div>
                )}
                {item.type === 'color' && (
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10 relative">
                    <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: String((config as any)[item.key]) }} />
                    <input type="color" value={String((config as any)[item.key])} onChange={(e) => onChange(item.key, e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    <span className="text-xs font-mono text-white/60 ml-auto">{String((config as any)[item.key])}</span>
                  </div>
                )}
                {item.type === 'select' && (
                  <div className="grid grid-cols-1 gap-2">
                    {item.options?.map(opt => (
                      <button key={opt.value} onClick={() => onChange(item.key, opt.value)} className={`text-left text-sm px-4 py-2 rounded-lg border transition-all ${String((config as any)[item.key]) === opt.value ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'}`}>{opt.label}</button>
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
