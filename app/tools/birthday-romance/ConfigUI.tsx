'use client';
import React from 'react';
import { Settings2, X, ChevronRight, Sparkles, MessageCircleHeart } from 'lucide-react';
import { CONFIG_METADATA, AppConfig } from './config';

type Props = {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

export default function BirthdayRomanceConfigUI({ config, onChange, isOpen, setIsOpen }: Props) {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-6 left-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100'}`}
        aria-label="打开配置"
      >
        <Settings2 size={24} />
      </button>

      <div className={`fixed top-0 left-0 h-full w-80 md:w-96 z-40 transform transition-transform duration-500 ease-out backdrop-blur-xl bg-black/40 border-r border-white/10 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold tracking-wide">生日浪漫配置</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            {isOpen ? <X size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide pb-20">
          <div className="mb-2 mt-0 flex items-center gap-3 text-white/80">
            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
              <MessageCircleHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">浪漫工坊</h3>
              <p className="text-[10px] text-pink-300/80 tracking-widest uppercase mt-0.5">Custom Surprise</p>
            </div>
          </div>

          {CONFIG_METADATA.map((meta) => (
            <div key={meta.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-200">{meta.label}</label>
                {meta.type === 'slider' && (
                  <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded">
                    {typeof (config as any)[meta.key] === 'number' ? (config as any)[meta.key].toFixed(1) : (config as any)[meta.key]}
                  </span>
                )}
              </div>

              {meta.type === 'textarea' && (
                <textarea
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  placeholder={meta.placeholder}
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none leading-relaxed"
                />
              )}

              {meta.type === 'toggle' && (
                <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-pink-400/30 transition-all duration-300">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-200">{meta.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={(config as any)[meta.key] as boolean}
                      onChange={(e) => onChange(meta.key, e.target.checked)}
                    />
                    <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-500 shadow-inner"></div>
                  </div>
                </label>
              )}

              {meta.type === 'slider' && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={(config as any)[meta.key] as number}
                    onChange={(e) => onChange(meta.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-8 border-t border-white/10">
            <p className="text-xs text-center text-white/30">Made with Next.js & Tailwind CSS</p>
          </div>
        </div>
      </div>
    </>
  );
}
