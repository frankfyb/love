'use client';
import React, { useState } from 'react';
import { Settings, Play, Plus, Type, Palette, X } from 'lucide-react';
import { AppConfig, CONFIG_METADATA, THEMES, defaultConfig } from './config';

// 扩展Props类型，参考WarmTextCardConfigUI的设计
type Props = {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

// 默认显隐状态
const DEFAULT_IS_OPEN = false;

export default function ConfigPanel({ 
  config, 
  onChange,
  isOpen = DEFAULT_IS_OPEN,
  setIsOpen 
}: Props) {
  // 本地状态：新增自定义文本输入
  const [newCustomText, setNewCustomText] = useState("");

  // 封装配置更新方法（核心：参考updateConfig）
  const updateConfig = (updates: Partial<AppConfig>) => {
    Object.entries(updates).forEach(([k, v]) => onChange(k as keyof AppConfig, v));
  };

  // 添加自定义文本
  const addCustomText = () => {
    if (newCustomText.trim()) {
      updateConfig({
        customMessages: [...((config as any).customMessages || []), newCustomText] as any
      });
      setNewCustomText("");
    }
  };

  // 切换面板显隐
  const togglePanel = () => {
    setIsOpen && setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 悬浮控制按钮（参考WarmTextCardConfigUI的触发方式） */}
      <button
        onClick={togglePanel}
        className={`
          fixed top-6 left-6 z-[60] p-3 rounded-full 
          bg-white/10 backdrop-blur-md border border-white/20 text-white 
          shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95
          ${isOpen ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
        `}
        aria-label={isOpen ? "关闭配置面板" : "打开配置面板"}
      >
        {isOpen ? <X size={20} /> : <Settings size={20} />}
      </button>

      {/* 面板主体（参考WarmTextCardConfigUI的布局结构） */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl 
          border-r border-white/10 shadow-2xl z-50 transform transition-transform 
          duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 头部区域 */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
            <Palette className="text-emerald-400" /> 节日工坊
          </h2>
          <p className="text-xs text-slate-400 mt-1">Custom Christmas Capsule</p>
        </div>

        {/* 主体内容区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
      {/* 1. 使用提示 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Play size={14} className="text-emerald-400" /> 使用提示
        </h3>
        <div className="text-xs text-slate-400">在舞台点击卡片可置顶放大，生成由显示层控制。</div>
        <div className="flex gap-2">
          <button onClick={() => updateConfig({ customMessages: [...((config as any).customMessages || []), 'Merry Christmas!'] as any })} className="px-3 py-2 rounded bg-emerald-800 text-emerald-200">示例文案</button>
          <button onClick={() => Object.entries(defaultConfig).forEach(([k,v]) => onChange(k as keyof AppConfig, v))} className="px-3 py-2 rounded bg-slate-800 text-slate-200">重置</button>
        </div>
      </div>

          {/* 2. 元数据驱动的参数区 */}
          <div className="space-y-6">
            {CONFIG_METADATA.map((meta) => (
              <div key={meta.key} className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400"><span>{meta.label}</span>{meta.type === 'slider' && <span className="font-mono">{(config as any)[meta.key]}</span>}</div>
                {meta.type === 'select' && meta.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {meta.options.map(opt => (
                      <button key={opt.value} onClick={() => onChange(meta.key, opt.value)} className={`p-2 rounded-lg text-sm transition-all border-2 text-left ${config.theme === opt.value ? 'border-emerald-400 bg-emerald-900/20' : 'border-transparent bg-slate-800 hover:bg-slate-700'}`}>
                        <div className="font-medium text-slate-200">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                )}
                {meta.type === 'slider' && (
                  <input type="range" min={meta.min} max={meta.max} step={meta.step} value={(config as any)[meta.key] as number} onChange={(e) => onChange(meta.key, meta.step ? parseFloat(e.target.value) : e.target.value)} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                )}
                {meta.type === 'text' && (
                  <input type="text" value={(config as any)[meta.key] as string} onChange={(e) => onChange(meta.key, e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" />
                )}
                {meta.type === 'textarea' && (
                  <textarea rows={3} value={Array.isArray((config as any)[meta.key]) ? ((config as any)[meta.key] as any[]).join(', ') : ((config as any)[meta.key] as string)} onChange={(e) => onChange(meta.key, e.target.value.split(/[，,]+/).map(s => s.trim()).filter(Boolean))} placeholder={meta.placeholder} className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none" />
                )}
              </div>
            ))}
          </div>

          {/* 3. 参数调节区（动态渲染CONFIG_METADATA） */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Settings size={14} className="text-emerald-400" /> 参数微调
            </h3>
            
            {CONFIG_METADATA.map((meta) => (
              <div key={meta.key} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{meta.label}</span>
                  <span className="font-mono">
                    {meta.type === 'slider' ? `${config[meta.key]}${meta.unit || ''}` : config[meta.key]}
                  </span>
                </div>

                {meta.type === 'slider' && (
                  <input 
                    type="range" 
                    min={meta.min} 
                    max={meta.max} 
                    step={meta.step}
                    value={config[meta.key] as number}
                    onChange={(e) => updateConfig({ [meta.key]: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                )}

                {meta.type === 'color' && (
                  <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <input
                      type="color"
                      value={config[meta.key] as string}
                      onChange={(e) => updateConfig({ [meta.key]: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded bg-transparent border-none p-0"
                    />
                    <span className="font-mono text-xs uppercase text-slate-400">
                      {config[meta.key]}
                    </span>
                  </div>
                )}

                {meta.type === 'text' && (
                  <input
                    type="text"
                    value={config[meta.key] as string}
                    onChange={(e) => updateConfig({ [meta.key]: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                  />
                )}

                {meta.type === 'textarea' && (
                  <textarea
                    rows={4}
                    value={config[meta.key] as string}
                    onChange={(e) => updateConfig({ [meta.key]: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
                  />
                )}
                
                <p className="mt-1.5 text-[10px] text-slate-500 leading-tight">
                  {meta.description}
                </p>
              </div>
            ))}
          </div>

          {/* 4. 内容定制区（参考WarmTextCardConfigUI的内容管理） */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Type size={14} className="text-emerald-400" /> 内容定制
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCustomText}
                onChange={(e) => setNewCustomText(e.target.value)}
                placeholder="输入圣诞祝福文案..."
                className="flex-1 px-3 py-2 text-sm border border-white/10 bg-slate-800/50 rounded-lg focus:outline-none focus:border-emerald-400 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addCustomText()}
              />
              <button 
                onClick={addCustomText}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-400">已添加 {(((config as any).customMessages) || []).length} 条自定义文案</div>
          </div>
        </div>

        {/* 底部信息区 */}
        <div className="p-4 border-t border-white/10 bg-slate-800/50">
          <p className="text-xs text-center text-slate-400">
            Christmas Capsule Generator © 2024
          </p>
        </div>
      </div>

      {/* 全局滚动条样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </>
  );
}
