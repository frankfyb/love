'use client';

import React from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import type { WarmTextCardConfig } from './config';
import { THEMES } from './config';

// 从现有配置文件导入类型和默认配置
export type { WarmTextCardConfig as AppConfig } from './config';
export { defaultConfig as DEFAULT_CONFIG } from './config';

// 定义通用配置元数据
export const warmTextCardConfigMetadata: ToolConfigMetadata<WarmTextCardConfig> = {
  panelTitle: '温馨文字卡片',
  panelSubtitle: 'Warm Text Cards',
  configSchema: {
    theme: {
      label: '主题风格',
      type: 'select',
      options: [
        { label: THEMES.warm.name, value: 'warm' },
        { label: THEMES.forest.name, value: 'forest' },
        { label: THEMES.night.name, value: 'night' },
        { label: THEMES.minimal.name, value: 'minimal' },
      ],
      category: 'visual',
      description: '选择整体视觉主题风格'
    },
    speed: {
      label: '生成速度',
      type: 'slider',
      min: 200,
      max: 1500,
      step: 50,
      category: 'physics',
      description: '卡片生成的时间间隔（毫秒）'
    },
    maxCards: {
      label: '最大卡片数',
      type: 'slider',
      min: 10,
      max: 200,
      step: 5,
      category: 'physics',
      description: '屏幕上同时显示的最大卡片数量'
    },
    fontSizeScale: {
      label: '字体大小比例',
      type: 'slider',
      min: 0.5,
      max: 2,
      step: 0.1,
      category: 'visual',
      description: '控制卡片中文本的缩放比例'
    },
    customMessages: {
      label: '自定义文案列表',
      type: 'textarea',
      placeholder: '示例：爱你, Merry Christmas, 平安喜乐',
      category: 'content',
      description: '卡片上显示的文字内容，用逗号分隔'
    }
  },
  tabs: [
    { id: 'content', label: '内容' },
    { id: 'visual', label: '视觉' },
    { id: 'physics', label: '物理' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '内容', 
      fields: ['customMessages']
    },
    { 
      id: 2, 
      label: '样式', 
      fields: ['theme', 'fontSizeScale']
    },
    { 
      id: 3, 
      label: '物理', 
      fields: ['speed', 'maxCards']
    },
  ],
};

// 配置UI组件
export function ConfigUI({ 
  config, 
  onChange, 
  isOpen, 
  setIsOpen 
}: { 
  config: WarmTextCardConfig; 
  onChange: (key: keyof WarmTextCardConfig, value: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <GenericConfigPanel
      config={config}
      configMetadata={warmTextCardConfigMetadata}
      onChange={onChange}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}

// 展示UI组件
export { default as DisplayUI } from './DisplayUI';