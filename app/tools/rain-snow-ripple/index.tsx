'use client';

import React from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import type { AppConfig, RippleShape } from './config';

// 从现有配置文件导入类型和默认配置
export type { AppConfig } from './config';
export { DEFAULT_CONFIG } from './config';

// 定义通用配置元数据
export const rainSnowRippleConfigMetadata: ToolConfigMetadata<AppConfig> = {
  panelTitle: '雨雪涟漪特效',
  panelSubtitle: 'Rain & Snow Ripple Effects',
  configSchema: {
    text: {
      label: '中心标题',
      type: 'input',
      category: 'content',
      description: '显示在画面中央的标题文字'
    },
    rainSpeed: {
      label: '雨丝速度',
      type: 'slider',
      min: 0.1,
      max: 4,
      step: 0.1,
      category: 'physics',
      description: '控制雨滴下降的速度'
    },
    snowDensity: {
      label: '雪花密度',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.05,
      category: 'visual',
      description: '控制屏幕上雪花的数量'
    },
    rainColor: {
      label: '雨丝主色',
      type: 'color',
      category: 'visual',
      description: '雨滴和涟漪的颜色'
    },
    snowColor: {
      label: '雪花颜色',
      type: 'color',
      category: 'visual',
      description: '雪花的颜色'
    },
    rippleShape: {
      label: '溅落形状',
      type: 'select',
      options: [
        { label: '浪漫涟漪 (圆)', value: 'circle' },
        { label: '爱的火花 (心)', value: 'heart' },
        { label: '璀璨星光 (星)', value: 'star' },
      ],
      category: 'visual',
      description: '雨滴落地时产生的涟漪形状'
    },
    rippleSize: {
      label: '波纹大小',
      type: 'slider',
      min: 5,
      max: 50,
      step: 1,
      category: 'visual',
      description: '涟漪的最大尺寸'
    },
    rippleLife: {
      label: '消失速度',
      type: 'slider',
      min: 0.01,
      max: 0.1,
      step: 0.005,
      category: 'physics',
      description: '涟漪消失的速度'
    },
    fallingText: {
      label: '飘落内容',
      type: 'textarea',
      placeholder: '输入Emoji或文字，用逗号分开',
      category: 'content',
      description: '飘落的元素内容，用逗号分隔'
    },
    fallingSpeed: {
      label: '礼物速度',
      type: 'slider',
      min: 0.5,
      max: 3,
      step: 0.1,
      category: 'physics',
      description: '飘落元素下降的速度'
    },
    fallingDensity: {
      label: '礼物密度',
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.05,
      category: 'visual',
      description: '飘落元素的密度'
    },
    fallingSize: {
      label: '礼物大小',
      type: 'slider',
      min: 12,
      max: 40,
      step: 1,
      category: 'visual',
      description: '飘落元素的大小'
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
      fields: ['text', 'fallingText']
    },
    { 
      id: 2, 
      label: '样式', 
      fields: ['rainColor', 'snowColor', 'rippleShape', 'rippleSize', 'snowDensity', 'fallingSize']
    },
    { 
      id: 3, 
      label: '物理', 
      fields: ['rainSpeed', 'rippleLife', 'fallingSpeed', 'fallingDensity']
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
  config: AppConfig; 
  onChange: (key: keyof AppConfig, value: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <GenericConfigPanel
      config={config}
      configMetadata={rainSnowRippleConfigMetadata}
      onChange={onChange}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}

// 展示UI组件
export { default as DisplayUI } from './DisplayUI';