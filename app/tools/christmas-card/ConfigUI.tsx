'use client';
import React from 'react';
import { AppConfig, AppConfigKey, ConfigInputType, CONFIG_METADATA } from './config';

export interface ConfigMetaItem {
  key: AppConfigKey;
  label: string;
  type: ConfigInputType;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

type Props = {
  config: AppConfig;
  metaList?: ConfigMetaItem[]; // Made optional
  onChange: (key: AppConfigKey, value: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onReset?: () => void;
};

export default function ChristmasCardConfigUI({ config, metaList, onChange, isOpen, setIsOpen, onReset }: Props) {
  // Use provided metaList or fallback to imported CONFIG_METADATA
  const effectiveMetaList = metaList || CONFIG_METADATA;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 left-10 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95 ${isOpen ? 'translate-x-[280px]' : 'translate-x-0 opacity-0 hover:opacity-100'}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>

      <aside className={`fixed top-0 left-0 z-50 h-full w-[300px] bg-slate-900/90 backdrop-blur-xl border-r border-white/30 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-2xl font-bold text-transparent">节日工坊</h2>
            <p className="text-xs text-slate-400 mt-1">Standardized Config Panel</p>
          </div>
          {onReset && (
            <button onClick={onReset} className="text-xs text-slate-500 hover:text-white underline" title="重置为默认配置">
              重置
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-7 custom-scrollbar">
          {effectiveMetaList.map((meta) => (
            <div key={meta.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-200">{meta.label}</label>
                {meta.type === 'slider' && (
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{(config as any)[meta.key]}</span>
                )}
              </div>

              {meta.type === 'slider' && (
                <div className="relative h-4 flex items-center">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={(config as any)[meta.key] as number}
                    onChange={(e) => onChange(meta.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              )}

              {meta.type === 'color' && (
                <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                  <input
                    type="color"
                    value={(config as any)[meta.key] as string}
                    onChange={(e) => onChange(meta.key, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded bg-transparent border-none p-0"
                  />
                  <span className="font-mono text-xs uppercase text-slate-400">{(config as any)[meta.key]}</span>
                </div>
              )}

              {meta.type === 'text' && (
                <input
                  type="text"
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                />
              )}

              {meta.type === 'textarea' && (
                <textarea
                  rows={4}
                  value={(config as any)[meta.key] as string}
                  onChange={(e) => onChange(meta.key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
                />
              )}

              <p className="mt-1.5 text-[10px] text-slate-500 leading-tight">{meta.description}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
