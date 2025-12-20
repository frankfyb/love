'use client';

import React, { useState } from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import { DisplayUI, DEFAULT_CONFIG, axuyuantreeConfigMetadata } from '@/tools/axuyuantree';
import type { AppConfig } from '@/tools/axuyuantree';

export default function TestAxuyuantreePage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
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
        configMetadata={axuyuantreeConfigMetadata}
        onChange={handleConfigChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}