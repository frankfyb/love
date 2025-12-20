'use client';

import React, { useState } from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';

// 测试配置类型
interface TestConfig {
  backgroundColor: string;
  treeBaseWidth: number;
  starSize: number;
  blinkSpeed: number;
  fireworkIntensity: number;
  gravity: number;
  uiGlassOpacity: number;
  fontStyle: 'sans' | 'serif' | 'mono';
}

// 测试默认配置
const DEFAULT_TEST_CONFIG: TestConfig = {
  backgroundColor: '#0f172a',
  treeBaseWidth: 500,
  starSize: 3,
  blinkSpeed: 1,
  fireworkIntensity: 60,
  gravity: 0.15,
  uiGlassOpacity: 0.2,
  fontStyle: 'serif',
};

// 测试配置元数据
const testConfigMetadata: ToolConfigMetadata<TestConfig> = {
  panelTitle: '测试控制台',
  panelSubtitle: 'Test Configuration Panel',
  configSchema: {
    backgroundColor: {
      label: '背景色',
      type: 'color',
      category: 'scene',
    },
    treeBaseWidth: {
      label: '宽度',
      type: 'slider',
      min: 300,
      max: 800,
      step: 10,
      category: 'scene',
    },
    starSize: {
      label: '星大小',
      type: 'slider',
      min: 1,
      max: 8,
      step: 0.5,
      category: 'visual',
    },
    blinkSpeed: {
      label: '闪烁速度',
      type: 'slider',
      min: 0.1,
      max: 5,
      step: 0.1,
      category: 'visual',
    },
    fireworkIntensity: {
      label: '烟花强度',
      type: 'slider',
      min: 20,
      max: 150,
      step: 10,
      category: 'visual',
    },
    gravity: {
      label: '重力',
      type: 'slider',
      min: 0.05,
      max: 0.5,
      step: 0.01,
      category: 'physics',
    },
    uiGlassOpacity: {
      label: '透明度',
      type: 'slider',
      min: 0.1,
      max: 0.9,
      step: 0.1,
      category: 'scene',
    },
    fontStyle: {
      label: '字体',
      type: 'select',
      options: [
        { label: 'Sans', value: 'sans' },
        { label: 'Serif', value: 'serif' },
        { label: 'Mono', value: 'mono' },
      ],
      category: 'content',
    },
  },
  tabs: [
    { id: 'scene', label: '场景' },
    { id: 'visual', label: '视觉' },
    { id: 'physics', label: '物理' },
    { id: 'content', label: '内容' },
  ],
  mobileSteps: [
    { id: 1, label: '场景', fields: ['backgroundColor', 'treeBaseWidth', 'uiGlassOpacity'] },
    { id: 2, label: '视觉', fields: ['starSize', 'blinkSpeed', 'fireworkIntensity'] },
    { id: 3, label: '物理', fields: ['gravity', 'fontStyle'] },
  ],
};

export default function TestGenericConfigPage() {
  const [config, setConfig] = useState<TestConfig>(DEFAULT_TEST_CONFIG);
  const [isOpen, setIsOpen] = useState(true);

  const handleConfigChange = (key: keyof TestConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">通用配置面板测试</h1>
          <p className="mb-6">这是一个测试页面，用于验证通用配置面板的功能</p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">当前配置:</h2>
            <pre className="text-left text-sm bg-gray-700 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <GenericConfigPanel 
        config={config}
        configMetadata={testConfigMetadata}
        onChange={handleConfigChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}