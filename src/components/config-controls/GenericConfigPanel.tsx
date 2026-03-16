'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings2, ChevronLeft,
  Palette, Sparkles,
  Menu, X, Smartphone, LayoutTemplate,
} from 'lucide-react';

import type { CategoryType, ToolConfigMetadata } from '@/types/genericConfig';
import { FieldRenderer } from './FieldRenderer';
import { BackgroundPresetControl, ThemePresetControl } from './PresetControls';

// ============================================================================
// 面板 Props
// ============================================================================

interface GenericConfigPanelProps<T> {
  config: T;
  configMetadata: ToolConfigMetadata<T>;
  onChange: (key: keyof T, val: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface GenericConfigPanelExtraProps {
  /** 额外数据，用于特殊控件（如 sticker-picker 的 decorations） */
  extraData?: any;
  /** 背景预设数据（用于快速选择背景） */
  backgroundPresets?: Array<{ label: string; value: string; type: string }>;
  /** 背景预设变更回调 */
  onBackgroundPresetChange?: (preset: any) => void;
  /** 主题预设数据（用于快速选择主题） */
  themePresets?: Array<{ label: string; value: string; type: string; preview: string }>;
  /** 主题预设变更回调 */
  onThemePresetChange?: (preset: any) => void;
}

// ============================================================================
// 通用配置面板组件
// ============================================================================

export function GenericConfigPanel<T>({
  config,
  configMetadata,
  onChange,
  isOpen,
  setIsOpen,
  extraData,
  backgroundPresets,
  onBackgroundPresetChange,
  themePresets,
  onThemePresetChange
}: GenericConfigPanelProps<T> & GenericConfigPanelExtraProps) {
  const [activeTab, setActiveTab] = useState<CategoryType>(configMetadata.tabs[0]?.id || 'base');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);

  // 移动端检测
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端步骤定义
  const mobileSteps = configMetadata.mobileSteps || [
    { id: 1, label: '基础', icon: <Settings2 className="w-4 h-4" />, fields: [] },
    { id: 2, label: '样式', icon: <Palette className="w-4 h-4" />, fields: [] },
    { id: 3, label: '特效', icon: <Sparkles className="w-4 h-4" />, fields: [] },
  ];

  const activeFields = useMemo(() =>
    Object.keys(configMetadata.configSchema).filter(k => configMetadata.configSchema[k as keyof T].category === activeTab),
    [activeTab, configMetadata]);

  // 判断当前 tab 是否需要显示背景预设
  const shouldShowBackgroundPresets = activeTab === 'background' && backgroundPresets && backgroundPresets.length > 0;

  // 判断当前 tab 是否需要显示主题预设
  const shouldShowThemePresets = activeTab === 'visual' && themePresets && themePresets.length > 0;

  // --- 移动端渲染逻辑 ---
  if (isMobile) {
    return (
      <div className={`fixed top-0 left-0 right-0 z-[60] flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${!isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className={`
          w-full
          bg-white/70 dark:bg-gray-900/80 backdrop-blur-3xl
          border-b border-white/40 dark:border-white/10 
          shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-3xl overflow-hidden
          transition-all duration-500
        `}>

          {/* Mobile Header / Toggle */}
          <div
            className="h-16 flex items-center justify-between px-5 border-b border-white/30 dark:border-white/5 bg-white/40 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-500"><Smartphone className="w-4 h-4" /></span>
              <span className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                快速配置
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Mobile Steps Nav */}
          <div className="flex justify-around p-3 bg-white/20 dark:bg-white/5 border-b border-white/20 dark:border-white/5">
            {mobileSteps.map((step) => {
              const isActive = mobileStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setMobileStep(step.id)}
                  className={`
                    flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 relative
                    ${isActive ? 'bg-white shadow-sm text-pink-500 scale-105' : 'text-gray-400 hover:text-gray-600'}
                  `}
                >
                  <div className={isActive ? 'text-pink-500' : 'text-gray-400'}>{step.icon}</div>
                  <span className="text-[10px] font-bold">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Content Area */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {mobileSteps.find(s => s.id === mobileStep)?.fields.map(key => (
              <FieldRenderer<T>
                key={key as string}
                itemKey={key}
                metadata={configMetadata.configSchema[key]}
                configValue={config[key]}
                allConfig={config}
                onChange={onChange}
                extraData={extraData}
              />
            ))}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setMobileStep(prev => Math.max(1, prev - 1))}
                disabled={mobileStep === 1}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 disabled:opacity-50"
              >
                上一步
              </button>
              <button
                onClick={() => setMobileStep(prev => Math.min(mobileSteps.length, prev + 1))}
                disabled={mobileStep === mobileSteps.length}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/30 disabled:opacity-50"
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- PC 端渲染逻辑 ---
  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 z-50 p-3.5 bg-white/70 backdrop-blur-md shadow-lg rounded-full hover:scale-110 hover:rotate-90 transition-all duration-500 border border-white/50 group"
        >
          <Menu className="w-6 h-6 text-gray-700 group-hover:text-pink-500" />
        </button>
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-[420px] 
          bg-gradient-to-b from-white/80 via-white/60 to-white/40 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50
          backdrop-blur-3xl 
          border-r border-white/40 dark:border-white/10 
          shadow-[20px_0_40px_-10px_rgba(0,0,0,0.1)]
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header - 玻璃态标题栏 */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/30 dark:border-white/5 shrink-0 bg-white/10 dark:bg-white/5">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              {configMetadata.panelTitle || '配置工坊'}
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 tracking-wider uppercase opacity-70">
              {configMetadata.panelSubtitle || 'Design Your Romance'}
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/40 rounded-full transition-colors group border border-transparent hover:border-white/40">
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
          </button>
        </div>

        {/* Tab Navigation - 悬浮胶囊式 */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-white/40 backdrop-blur-sm">
            {configMetadata.tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CategoryType)}
                  className={`
                    flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 relative
                    ${isActive ? 'bg-white shadow-md text-pink-500 scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'}
                  `}
                >
                  <div className={`${isActive ? 'text-pink-500' : 'text-gray-400'} transition-colors`}>{tab.icon || <LayoutTemplate className="w-4 h-4" />}</div>
                  <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
                  {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-pink-500 rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content - 隐形滚动条 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32 space-y-2">
          {activeFields.map(key => (
            <FieldRenderer<T>
              key={key as string}
              itemKey={key as keyof T}
              metadata={configMetadata.configSchema[key as keyof T]}
              configValue={config[key as keyof T]}
              allConfig={config}
              onChange={onChange}
              extraData={extraData}
            />
          ))}

          {/* 背景预设选择器（仅在 background tab 显示） */}
          {shouldShowBackgroundPresets && (
            <BackgroundPresetControl
              presets={backgroundPresets}
              onChange={onBackgroundPresetChange}
            />
          )}

          {/* 主题预设选择器（仅在 visual tab 显示） */}
          {shouldShowThemePresets && (
            <ThemePresetControl
              presets={themePresets}
              onChange={onThemePresetChange}
            />
          )}

          <div className="h-12" />
        </div>
      </div>
    </>
  );
}