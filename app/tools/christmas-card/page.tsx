'use client';

import React, { useState } from 'react';
import { useConfigManager } from '@/hooks/useConfigManager';
import ChristmasCardConfigUI from './ConfigUI';
import ChristmasCardDisplayUI from './DisplayUI';
import { DEFAULT_CONFIG, CONFIG_METADATA } from './config';

export default function ChristmasCardPage() {
  // 1. 获取配置管理器实例 (Unified Management)
  const { config, updateConfig, resetConfig } = useConfigManager(DEFAULT_CONFIG);
  
  // UI 状态
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white">
       {/* 2. 配置面板：自动渲染 (Auto-Rendering) */}
       <ChristmasCardConfigUI
         config={config}
         metaList={CONFIG_METADATA}
         onChange={updateConfig}
         isOpen={isPanelOpen}
         setIsOpen={setIsPanelOpen}
         onReset={resetConfig}
       />

       {/* 3. 展示层：响应配置变化 (Reactive Display) */}
       <ChristmasCardDisplayUI
         config={config}
         isPanelOpen={isPanelOpen}
       />
    </div>
  );
}
