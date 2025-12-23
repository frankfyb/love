/**
 * GenericConfigPanel 使用示例
 * 
 * 展示如何集成和使用新增的控件类型：
 * - select-input (预设选择 + 自定义输入)
 * - sticker-picker (贴纸选择器)
 * - backgroundPresets (背景预设)
 */

'use client';

import React, { useState } from 'react';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';
import { Sparkles, ImageIcon, Volume2, Sticker } from 'lucide-react';

// ============================================================================
// 1. 定义配置接口
// ============================================================================
interface ExampleConfig {
  // 视觉配置
  particleCount: number;
  particleColor: string;
  
  // 背景配置
  bgType: 'image' | 'video' | 'color';
  bgValue: string;
  
  // 音频配置
  bgMusicUrl: string;
  clickSoundUrl: string;
  enableSound: boolean;
  
  // 装饰配置
  decorationPicker: any;
}

// ============================================================================
// 2. 预设数据
// ============================================================================
const PRESETS = {
  // 背景预设
  backgrounds: [
    { label: '飘雪视频', value: 'https://assets.mixkit.co/videos/preview/mixkit-falling-snow-on-a-black-background-44583-large.mp4', type: 'video' },
    { label: '温馨壁炉', value: 'https://assets.mixkit.co/videos/preview/mixkit-burning-wood-in-a-fireplace-4309-large.mp4', type: 'video' },
    { label: '梦幻雪夜', value: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=2000', type: 'image' },
    { label: '复古红绿', value: '#0f392b', type: 'color' },
    { label: '午夜深蓝', value: '#0f172a', type: 'color' },
  ],
  
  // 音乐预设
  music: [
    { label: 'We Wish You Merry Christmas', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
    { label: 'Jingle Bells', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
  ],
  
  // 点击音效预设
  clickSounds: [
    { label: '清脆铃声', value: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3' },
    { label: '气泡音', value: 'https://cdn.pixabay.com/audio/2024/08/04/audio_245277864b.mp3' },
    { label: '魔法音效', value: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c29d0c6f5d.mp3' },
  ],
  
  // 贴纸预设
  stickers: [
    { label: '圣诞袜', value: '🧦', type: 'emoji' },
    { label: '圣诞树', value: '🎄', type: 'emoji' },
    { label: '礼物盒', value: '🎁', type: 'emoji' },
    { label: '圣诞老人', value: '🎅', type: 'emoji' },
    { label: '麋鹿', value: '🦌', type: 'emoji' },
    { label: '姜饼人', value: '🍪', type: 'emoji' },
    { label: '铃铛', value: '🔔', type: 'emoji' },
    { label: '雪人', value: '⛄', type: 'emoji' },
  ]
};

// ============================================================================
// 3. 默认配置
// ============================================================================
const DEFAULT_CONFIG: ExampleConfig = {
  particleCount: 100,
  particleColor: '#FFD700',
  bgType: 'color',
  bgValue: '#0f172a',
  bgMusicUrl: PRESETS.music[0].value,
  clickSoundUrl: PRESETS.clickSounds[0].value,
  enableSound: true,
  decorationPicker: null,
};

// ============================================================================
// 4. 配置元数据（重点：展示新控件的使用）
// ============================================================================
const configMetadata: ToolConfigMetadata<ExampleConfig> = {
  panelTitle: '配置面板示例',
  panelSubtitle: 'Demonstrating New Controls',
  
  tabs: [
    { id: 'visual', label: '视觉', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'background', label: '背景', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'audio', label: '音效', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'decoration', label: '装饰', icon: <Sticker className="w-4 h-4" /> },
  ],
  
  configSchema: {
    // ========== 视觉配置 ==========
    particleCount: {
      category: 'visual',
      type: 'slider',
      label: '粒子密度',
      description: '控制屏幕上粒子的数量',
      min: 20,
      max: 300,
      step: 10,
    },
    
    particleColor: {
      category: 'visual',
      type: 'color',
      label: '粒子颜色',
    },
    
    // ========== 背景配置 ==========
    bgType: {
      category: 'background',
      type: 'select',
      label: '背景类型',
      options: [
        { label: '纯色', value: 'color' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' },
      ],
    },
    
    bgValue: {
      category: 'background',
      type: 'input',
      label: '背景地址/颜色',
      placeholder: 'URL or Hex Color',
    },
    
    // ========== 音频配置（展示 select-input 控件）==========
    bgMusicUrl: {
      category: 'audio',
      type: 'select-input',  // 🆕 预设选择 + 自定义输入
      label: '背景音乐',
      placeholder: '输入自定义音乐 URL...',
      options: PRESETS.music,
    },
    
    clickSoundUrl: {
      category: 'audio',
      type: 'select',
      label: '点击音效',
      options: PRESETS.clickSounds,
    },
    
    enableSound: {
      category: 'audio',
      type: 'switch',
      label: '启用音效',
    },
    
    // ========== 装饰配置（展示 sticker-picker 控件）==========
    decorationPicker: {
      category: 'decoration',
      type: 'sticker-picker',  // 🆕 高级贴纸选择器
      label: '添加装饰',
      options: PRESETS.stickers,
    },
  },
};

// ============================================================================
// 5. 示例组件
// ============================================================================
export default function ConfigPanelExample() {
  const [config, setConfig] = useState<ExampleConfig>(DEFAULT_CONFIG);
  const [decorations, setDecorations] = useState<any[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // 配置变更处理
  const handleConfigChange = (key: keyof ExampleConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    console.log(`配置变更: ${String(key)} =`, value);
  };

  // 添加贴纸处理（用于 sticker-picker）
  const handleAddSticker = (sticker: any) => {
    const newDeco = {
      id: Date.now().toString(),
      type: sticker.type,
      content: sticker.value,
      x: Math.random() * 80 + 10,  // 10-90%
      y: Math.random() * 80 + 10,
      scale: 1,
      rotation: Math.random() * 20 - 10,
    };
    setDecorations(prev => [...prev, newDeco]);
    console.log('添加贴纸:', newDeco);
  };

  // 清除所有装饰
  const handleClearDecorations = () => {
    setDecorations([]);
    console.log('清除所有装饰');
  };

  // 背景预设变更处理
  const handleBackgroundPresetChange = (preset: any) => {
    handleConfigChange('bgType', preset.type);
    handleConfigChange('bgValue', preset.value);
    console.log('选择背景预设:', preset);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 配置面板 */}
      <GenericConfigPanel
        config={config}
        configMetadata={configMetadata}
        onChange={handleConfigChange}
        isOpen={isConfigOpen}
        setIsOpen={setIsConfigOpen}
        
        // 🆕 额外数据（用于 sticker-picker）
        extraData={{
          decorations,
          onClearDecorations: handleClearDecorations,
        }}
        
        // 🆕 背景预设（可选）
        backgroundPresets={PRESETS.backgrounds}
        onBackgroundPresetChange={handleBackgroundPresetChange}
      />

      {/* 主内容区域 - 显示当前配置 */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            GenericConfigPanel 使用示例
          </h1>
          
          <div className="space-y-4 text-white/80">
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 mb-2">当前配置</h3>
              <pre className="text-xs overflow-auto max-h-60 font-mono">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 mb-2">
                装饰列表 ({decorations.length})
              </h3>
              <pre className="text-xs overflow-auto max-h-40 font-mono">
                {JSON.stringify(decorations, null, 2)}
              </pre>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 border border-pink-500/30">
              <h3 className="text-sm font-semibold text-pink-300 mb-2">💡 提示</h3>
              <ul className="text-xs space-y-1 text-white/70">
                <li>• 打开左侧配置面板，尝试 <strong>"音效"</strong> tab 中的 <strong>select-input</strong> 控件</li>
                <li>• 在 <strong>"装饰"</strong> tab 中使用 <strong>sticker-picker</strong> 添加贴纸</li>
                <li>• 在 <strong>"背景"</strong> tab 底部查看 <strong>快速预设</strong> 选择器</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
