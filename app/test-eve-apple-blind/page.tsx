'use client';

import React, { useState } from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import { DisplayUI, eveAppleBlindConfigMetadata } from '@/tools/eve-apple-blind';
import type { AppConfig } from '@/tools/eve-apple-blind/index';

// 测试默认配置
const DEFAULT_TEST_CONFIG: AppConfig = {
  title: "平安喜乐",
  romanticMessage: "你是我原本寡淡的剧情里，最耀眼的惊喜。",
  triggerCount: 3,
  giftContent: "愿你三冬暖，愿你春不寒\n🍎 平安夜快乐！\n🎁 兑换券：一个拥抱\n🌟 隐藏款：心愿达成卡",
  backgroundType: 'fireplace',
  customBgUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1080&q=80",
  textEffect: 'warm_breath',
  fontType: 'serif',
  particleDensity: 60,
  showMusicBtn: true,
};

export default function TestEveAppleBlindPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_TEST_CONFIG);
  const [isOpen, setIsOpen] = useState(true);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <div className="absolute inset-0">
        <DisplayUI config={config} isPanelOpen={isOpen} />
      </div>
      
      <GenericConfigPanel 
        config={config}
        configMetadata={eveAppleBlindConfigMetadata}
        onChange={handleConfigChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}