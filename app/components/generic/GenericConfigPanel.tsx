'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Settings2, ChevronDown, ChevronUp, ChevronLeft, 
  Upload, Type, Palette, Sparkles, Image as ImageIcon, 
  Menu, X, Gift, Wind, Box, Smartphone, LayoutTemplate,
  Plus, Trash2, Video, Music, Check, Volume2, VolumeX
} from 'lucide-react';

// ============================================================================
// 1. 类型导入
// ============================================================================
import type { GenericControlType, CategoryType, GenericConfigItemMetadata, ToolConfigMetadata } from '@/types/genericConfig';

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║  📋 组件类型说明文档 - GenericConfigPanel 控件库                           ║
 * ║  本文档说明了所有可用的控件类型、使用场景和集成方式                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 * 
 * 📊 控件类型总览 (14 种)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1️⃣  Input（输入框）
 *   ├─ 文件路径: InputControl (行 51-61)
 *   ├─ 使用场景: 单行文本输入（URL、文件路径、短文本）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'input',
 *   │    label: '输入框标签',
 *   │    placeholder: '提示文本',
 *   │    description: '可选描述',
 *   │    condition: (config) => boolean // 可选条件渲染
 *   │  }
 *   ├─ 集成示例:
 *   │  bgValue: {
 *   │    type: 'input',
 *   │    label: '背景地址/颜色',
 *   │    placeholder: 'URL or Hex Color',
 *   │    category: 'background'
 *   │  }
 *   └─ 返回值: string
 * 
 * 2️⃣  Textarea（文本域）
 *   ├─ 文件路径: TextareaControl (行 63-73)
 *   ├─ 使用场景: 多行文本编辑（代码、长文本、分隔符分隔的内容）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'textarea',
 *   │    label: '文本域标签',
 *   │    placeholder: '提示文本',
 *   │    description: '可选描述',
 *   │    rows: 3 // 默认行数
 *   │  }
 *   ├─ 集成示例:
 *   │  treeTextLevels: {
 *   │    type: 'textarea',
 *   │    label: '树体文案 (→分隔)',
 *   │    category: 'content'
 *   │  }
 *   └─ 返回值: string
 * 
 * 3️⃣  Select（下拉框）
 *   ├─ 文件路径: CustomSelectControl (行 76-133)
 *   ├─ 使用场景: 从预设选项中选择一项（背景类型、预设样式等）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'select',
 *   │    label: '下拉框标签',
 *   │    options: [
 *   │      { label: '显示文本', value: '值', icon: '🎄' }
 *   │    ],
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  bgType: {
 *   │    type: 'select',
 *   │    label: '背景类型',
 *   │    options: [
 *   │      { label: '纯色', value: 'color' },
 *   │      { label: '图片', value: 'image' },
 *   │      { label: '视频', value: 'video' }
 *   │    ],
 *   │    category: 'background'
 *   │  }
 *   └─ 返回值: string (选中的 value)
 * 
 * 4️⃣  Select-Input（下拉选择 + 自定义输入）
 *   ├─ 文件路径: SelectInputControl (行 338-375)
 *   ├─ 使用场景: 预设 + 自定义混合模式（背景音乐、自定义 URL）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'select-input',
 *   │    label: '下拉选择框标签',
 *   │    options: [
 *   │      { label: '预设1', value: 'url1' },
 *   │      { label: '预设2', value: 'url2' }
 *   │    ],
 *   │    placeholder: '自定义输入提示',
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  bgMusicUrl: {
 *   │    type: 'select-input',
 *   │    label: '背景音乐',
 *   │    options: [
 *   │      { label: 'We Wish...', value: 'https://...' },
 *   │      { label: 'Jingle Bells', value: 'https://...' }
 *   │    ],
 *   │    category: 'audio'
 *   │  }
 *   └─ 返回值: string (预设值或自定义输入)
 * 
 * 5️⃣  Switch（开关）
 *   ├─ 文件路径: SwitchControl (行 213-223)
 *   ├─ 使用场景: 布尔值切换（启用/禁用功能）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'switch',
 *   │    label: '开关标签',
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  enableSound: {
 *   │    type: 'switch',
 *   │    label: '启用音效',
 *   │    category: 'audio'
 *   │  }
 *   │  enableSnow: {
 *   │    type: 'switch',
 *   │    label: '开启粒子雪花',
 *   │    category: 'background'
 *   │  }
 *   └─ 返回值: boolean
 * 
 * 6️⃣  Slider（滑块）
 *   ├─ 文件路径: SliderControl (行 225-238)
 *   ├─ 使用场景: 数值范围选择（密度、速度、透明度等）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'slider',
 *   │    label: '滑块标签',
 *   │    min: 0,
 *   │    max: 100,
 *   │    step: 1,
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  particleCount: {
 *   │    type: 'slider',
 *   │    label: '氛围粒子密度',
 *   │    min: 20,
 *   │    max: 300,
 *   │    step: 10,
 *   │    category: 'visual'
 *   │  }
 *   │  glassBlur: {
 *   │    type: 'slider',
 *   │    label: '卡片磨砂程度',
 *   │    min: 0,
 *   │    max: 24,
 *   │    step: 1,
 *   │    category: 'visual'
 *   │  }
 *   └─ 返回值: number
 * 
 * 7️⃣  Color（颜色选择器）
 *   ├─ 文件路径: ColorControl (行 262-277)
 *   ├─ 使用场景: 颜色值选择（主题色、粒子色等）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'color',
 *   │    label: '颜色标签',
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  particleColor: {
 *   │    type: 'color',
 *   │    label: '主题点缀色',
 *   │    category: 'visual'
 *   │  }
 *   └─ 返回值: string (hex 颜色码，如 "#FFD700")
 * 
 * 8️⃣  Radio（单选组）
 *   ├─ 文件路径: RadioGroupControl (行 240-260)
 *   ├─ 使用场景: 多选项单选（布局方式、显示模式等）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'radio',
 *   │    label: '单选组标签',
 *   │    options: [
 *   │      { label: '选项1', value: 'value1' },
 *   │      { label: '选项2', value: 'value2' }
 *   │    ],
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  displayMode: {
 *   │    type: 'radio',
 *   │    label: '显示模式',
 *   │    options: [
 *   │      { label: '竖向', value: 'vertical' },
 *   │      { label: '横向', value: 'horizontal' },
 *   │      { label: '网格', value: 'grid' }
 *   │    ],
 *   │    category: 'visual'
 *   │  }
 *   └─ 返回值: string (选中的 value)
 * 
 * 9️⃣  StickerGrid（表情网格）
 *   ├─ 文件路径: StickerGridControl (行 279-300)
 *   ├─ 使用场景: Emoji/表情选择（装饰品选择）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'sticker-grid',
 *   │    label: '表情选择',
 *   │    options: [
 *   │      { label: '圣诞袜', value: '🧦', icon: '🧦' },
 *   │      { label: '圣诞树', value: '🎄', icon: '🎄' }
 *   │    ],
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  selectedEmoji: {
 *   │    type: 'sticker-grid',
 *   │    label: '选择装饰',
 *   │    options: PRESETS.stickers,
 *   │    category: 'decoration'
 *   │  }
 *   └─ 返回值: string (表情值如 "🎄")
 * 
 * 🔟  List（列表生成器）
 *   ├─ 文件路径: ListBuilderControl (行 136-211)
 *   ├─ 使用场景: 动态列表管理（添加/删除项目）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'list',
 *   │    label: '列表标签',
 *   │    placeholder: '输入项目',
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  customItems: {
 *   │    type: 'list',
 *   │    label: '自定义项目',
 *   │    placeholder: '输入新项目，按 Enter 添加',
 *   │    category: 'content'
 *   │  }
 *   ├─ 特点: 支持数组和逗号分隔字符串两种格式
 *   └─ 返回值: string (逗号分隔) 或 string[] (数组)
 * 
 * 1️⃣1️⃣ MultiSelect（多选）
 *   ├─ 文件路径: MultiSelectControl (行 302-328)
 *   ├─ 使用场景: 多项选择（特性启用、标签选择等）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'multi-select',
 *   │    label: '多选标签',
 *   │    options: [
 *   │      { label: '选项1', value: 'val1' },
 *   │      { label: '选项2', value: 'val2' }
 *   │    ],
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  enabledEffects: {
 *   │    type: 'multi-select',
 *   │    label: '启用特效',
 *   │    options: [
 *   │      { label: '粒子', value: 'particles' },
 *   │      { label: '阴影', value: 'shadow' },
 *   │      { label: '闪烁', value: 'blink' }
 *   │    ],
 *   │    category: 'visual'
 *   │  }
 *   └─ 返回值: string[]
 * 
 * 1️⃣2️⃣ StickerPicker（装饰品选择器）
 *   ├─ 文件路径: StickerPickerControl (行 378-452)
 *   ├─ 使用场景: 复杂的装饰品选择（预设 + 自定义 URL + 统计）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'sticker-picker',
 *   │    label: '添加装饰',
 *   │    options: PRESETS.stickers,
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  decorationPicker: {
 *   │    type: 'sticker-picker',
 *   │    label: '添加装饰',
 *   │    options: PRESETS.stickers,
 *   │    category: 'decoration'
 *   │  }
 *   ├─ 特点:
 *   │  • 支持预设表情选择
 *   │  • 支持自定义图片 URL
 *   │  • 显示当前装饰数量
 *   │  • 支持一键清除所有装饰
 *   ├─ 额外数据 (extraData):
 *   │  {
 *   │    decorations: DecorationItem[],
 *   │    onClearDecorations: () => void
 *   │  }
 *   └─ 返回值: { type: 'emoji'|'image', value: string, label?: string }
 * 
 * 1️⃣3️⃣ File（文件上传）
 *   ├─ 文件路径: FileControl (行 330-335)
 *   ├─ 使用场景: 文件上传入口（目前仅为 UI 占位符）
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'file',
 *   │    label: '上传类型',
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  customImage: {
 *   │    type: 'file',
 *   │    label: '上传背景图',
 *   │    category: 'background'
 *   │  }
 *   └─ 返回值: File (需要实现上传逻辑)
 * 
 * 1️⃣4️⃣ MediaGrid（媒体网格选择器）
 *   ├─ 文件路径: MediaGridControl (行 500+)
 *   ├─ 使用场景: 背景媒体选择（颜色/图片/视频）+ 自定义上传
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'media-grid',
 *   │    label: '背景选择',
 *   │    mediaType: 'background', // 'background' | 'music'
 *   │    defaultItems: [...], // 预设项目
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  backgroundValue: {
 *   │    type: 'media-grid',
 *   │    label: '背景场景',
 *   │    mediaType: 'background',
 *   │    defaultItems: PRESETS.backgrounds,
 *   │    category: 'background'
 *   │  }
 *   └─ 返回值: string (URL 或 Hex 颜色)
 * 
 * 1️⃣5️⃣ MediaPicker（媒体选择器）
 *   ├─ 文件路径: MediaPickerControl (行 600+)
 *   ├─ 使用场景: 音乐/音频媒体选择 + 播放控制
 *   ├─ 元数据配置:
 *   │  {
 *   │    type: 'media-picker',
 *   │    label: '背景音乐',
 *   │    mediaType: 'music',
 *   │    defaultItems: [...],
 *   │    description: '可选描述'
 *   │  }
 *   ├─ 集成示例:
 *   │  bgMusicUrl: {
 *   │    type: 'media-picker',
 *   │    label: '音乐选择',
 *   │    mediaType: 'music',
 *   │    defaultItems: PRESETS.music,
 *   │    category: 'audio'
 *   │  }
 *   ├─ 额外字段 (extraData):
 *   │  {
 *   │    isMusicPlaying: boolean,
 *   │    onMusicPlayingChange?: (playing: boolean) => void
 *   │  }
 *   └─ 返回值: string (音乐 URL)
 * 
 * 1️⃣6️⃣ BackgroundPreset（背景预设选择器）[特殊组件]
 *   ├─ 文件路径: BackgroundPresetControl (行 700+)
 *   ├─ 使用场景: 背景快速预设选择（仅在 background tab 显示）
 *   ├─ 特点:
 *   │  • 支持颜色、图片、视频三种背景预览
 *   │  • 视频有特殊标识
 *   │  • 悬浮显示标签
 *   ├─ 集成方式:
 *   │  <GenericConfigPanel
 *   │    backgroundPresets={[
 *   │      { label: '飘雪', value: 'url', type: 'video' },
 *   │      { label: '红色', value: '#FF0000', type: 'color' }
 *   │    ]}
 *   │    onBackgroundPresetChange={handleChange}
 *   │  />
 *   └─ 返回值: 通过 onBackgroundPresetChange 回调
 * 
 * 1️⃣7️⃣ ThemePreset（主题预设选择器）[特殊组件]
 *   ├─ 文件路径: ThemePresetControl (行 750+)
 *   ├─ 使用场景: 主题快速预设选择（仅在 visual tab 显示）
 *   ├─ 特点:
 *   │  • 显示预览背景
 *   │  • 2列网格布局
 *   │  • 悬浮显示标签
 *   ├─ 集成方式:
 *   │  <GenericConfigPanel
 *   │    themePresets={[
 *   │      { label: '圣诞红', value: 'theme1', preview: 'linear-gradient(...)' },
 *   │      { label: '冰蓝', value: 'theme2', preview: 'linear-gradient(...)' }
 *   │    ]}
 *   │    onThemePresetChange={handleChange}
 *   │  />
 *   └─ 返回值: 通过 onThemePresetChange 回调
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📌 使用场景速查表
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 场景                          推荐控件                    说明
 * ─────────────────────────────────────────────────────────────────────────────
 * URL/路径输入                   select-input               预设 + 自定义
 * 纯文本输入                     input                      单行简短文本
 * 长篇文本编辑                   textarea                   多行内容
 * 颜色选择                       color                      RGB/HEX 选择
 * 布尔启用/禁用                  switch                     开关状态
 * 数值范围调整                   slider                     0-100 范围内
 * 从多个选项选一个               select 或 radio            radio 更直观
 * 表情/Emoji 选择                sticker-grid               4列网格展示
 * 背景媒体网格选择               media-grid                 支持颜色/图片/视频
 * 音乐媒体选择                   media-picker               带播放控制
 * 动态列表管理                   list                       支持增删
 * 多项选择                       multi-select               返回数组
 * 装饰品高级选择                 sticker-picker             预设+自定义+统计
 * 背景快速切换                   BackgroundPreset           配合面板使用
 * 主题快速切换                   ThemePreset                配合面板使用
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔧 集成步骤
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. 定义数据结构 (types/xx.ts)
 *    interface MyConfig {
 *      bgValue: string;
 *      enableSound: boolean;
 *      particleColor: string;
 *    }
 * 
 * 2. 定义元数据 (config/xxMetadata.ts)
 *    export const myConfigMetadata = {
 *      configSchema: {
 *        bgValue: {
 *          type: 'select-input',
 *          label: '背景地址',
 *          category: 'background',
 *          options: [...]
 *        },
 *        enableSound: {
 *          type: 'switch',
 *          label: '启用音效',
 *          category: 'audio'
 *        },
 *        particleColor: {
 *          type: 'color',
 *          label: '粒子色',
 *          category: 'visual'
 *        }
 *      },
 *      tabs: [
 *        { id: 'background', label: '背景' },
 *        { id: 'audio', label: '音效' },
 *        { id: 'visual', label: '视觉' }
 *      ]
 *    }
 * 
 * 3. 在组件中使用
 *    <GenericConfigPanel
 *      config={config}
 *      configMetadata={myConfigMetadata}
 *      onChange={handleConfigChange}
 *      isOpen={isPanelOpen}
 *      setIsOpen={setIsPanelOpen}
 *      extraData={{
 *        decorations: decorations,
 *        onClearDecorations: () => setDecorations([])
 *      }}
 *    />
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💡 高级特性
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. 条件渲染 (Conditional Rendering)
 *    可以根据其他字段值来显示/隐藏某个字段：
 *    ```
 *    bgValue: {
 *      type: 'input',
 *      condition: (config) => config.bgType === 'color'
 *    }
 *    ```
 * 
 * 2. 动态选项 (Dynamic Options)
 *    选项可以是动态的，根据上下文变化：
 *    ```
 *    bgMusicUrl: {
 *      type: 'select-input',
 *      options: config.bgType === 'video' 
 *        ? videoMusicPresets 
 *        : defaultMusicPresets
 *    }
 *    ```
 * 
 * 3. 额外数据传递 (Extra Data)
 *    通过 extraData 传递额外信息给特殊控件：
 *    ```
 *    <GenericConfigPanel
 *      extraData={{
 *        decorations: decorations,
 *        onClearDecorations: clearDecorations
 *      }}
 *    />
 *    ```
 * 
 * 4. 分类标签系统 (Category System)
 *    所有字段通过 category 分类，可以按 tab 组织显示：
 *    - 'visual': 视觉效果
 *    - 'background': 背景设置
 *    - 'audio': 音频设置
 *    - 'decoration': 装饰品
 *    - 'content': 内容文本
 *    - 自定义分类...
 * 
 * 5. 移动端适配
 *    通过 mobileSteps 定义移动端分步骤配置：
 *    ```
 *    mobileSteps: [
 *      { id: 1, label: '基础', fields: ['bgType', 'bgValue'] },
 *      { id: 2, label: '样式', fields: ['particleColor'] }
 *    ]
 *    ```
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 实际应用示例 - 背景场景配置
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * // 许愿新光树配置元数据示例（来自 demo4/page.tsx）
 * export const starlightWishesConfigMetadata = {
 *   panelTitle: '许愿新光树配置',
 *   panelSubtitle: 'Design Your Starlight Tree',
 *   configSchema: {
 *     // --- 背景媒体网格 ---
 *     backgroundValue: {
 *       type: 'media-grid',
 *       label: '背景场景',
 *       mediaType: 'background',
 *       category: 'background',
 *       defaultItems: [
 *         { id: 'c_1', value: '#0f172a', label: '深邃夜空', type: 'color' },
 *         { id: 'c_2', value: '#1a0b2e', label: '紫色梦境', type: 'color' },
 *         { id: 'img_1', url: 'https://...', label: '梦幻森林', type: 'image' },
 *         { id: 'vid_1', url: 'https://...', label: '粒子流光', type: 'video' }
 *       ]
 *     },
 * 
 *     // --- 背景音乐媒体选择 ---
 *     bgMusicUrl: {
 *       type: 'media-picker',
 *       label: '背景音乐',
 *       mediaType: 'music',
 *       category: 'audio',
 *       defaultItems: [
 *         { id: 'm_1', value: 'https://...', label: '新年烟火' }
 *       ]
 *     },
 * 
 *     isMusicPlaying: {
 *       type: 'switch',
 *       label: '播放音乐',
 *       category: 'audio'
 *     },
 * 
 *     // --- 其他配置 ---
 *     treeBaseWidth: {
 *       type: 'slider',
 *       label: '树冠宽度',
 *       min: 300, max: 800, step: 10,
 *       category: 'visual'
 *     },
 *     starSize: {
 *       type: 'slider',
 *       label: '星光大小',
 *       min: 1, max: 8, step: 0.5,
 *       category: 'visual'
 *     }
 *   },
 *   tabs: [
 *     { id: 'background', label: '背景场景' },
 *     { id: 'audio', label: '音效' },
 *     { id: 'visual', label: '视觉效果' }
 *   ]
 * }
 * 
 * // 使用面板
 * <GenericConfigPanel
 *   config={config}
 *   configMetadata={starlightWishesConfigMetadata}
 *   onChange={(key, val) => setConfig({...config, [key]: val})}
 *   isOpen={isPanelOpen}
 *   setIsOpen={setIsPanelOpen}
 *   extraData={{
 *     isMusicPlaying: config.isMusicPlaying,
 *     onMusicPlayingChange: (playing) => setConfig({...config, isMusicPlaying: playing})
 *   }}
 * />
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 *   panelTitle: '圣诞树贺卡配置',
 *   panelSubtitle: 'Design Your Christmas Tree Card',
 *   configSchema: {
 *     // 背景相关
 *     bgType: { 
 *       category: 'background', 
 *       type: 'select', 
 *       label: '背景类型',
 *       options: [{label: '纯色', value: 'color'}, ...]
 *     },
 *     bgValue: { 
 *       category: 'background',
 *       type: 'select-input',
 *       label: '背景地址/颜色',
 *       options: PRESETS.backgrounds
 *     },
 * 
 *     // 粒子效果
 *     particleCount: {
 *       category: 'visual',
 *       type: 'slider',
 *       label: '粒子密度',
 *       min: 20,
 *       max: 300,
 *       step: 10
 *     },
 * 
 *     // 音效控制
 *     enableSound: {
 *       category: 'audio',
 *       type: 'switch',
 *       label: '启用音效'
 *     },
 *     bgMusicUrl: {
 *       category: 'audio',
 *       type: 'select-input',
 *       label: '背景音乐',
 *       options: PRESETS.music
 *     },
 * 
 *     // 装饰品管理
 *     decorationPicker: {
 *       category: 'decoration',
 *       type: 'sticker-picker',
 *       label: '添加装饰',
 *       options: PRESETS.stickers
 *     },
 * 
 *     // 内容编辑
 *     capsuleText: {
 *       category: 'content',
 *       type: 'input',
 *       label: '一键祝福',
 *       placeholder: '替换"圣诞快乐"'
 *     }
 *   },
 *   tabs: [
 *     { id: 'background', label: '背景' },
 *     { id: 'visual', label: '视觉' },
 *     { id: 'audio', label: '音效' },
 *     { id: 'decoration', label: '装饰' },
 *     { id: 'content', label: '内容' }
 *   ],
 *   mobileSteps: [
 *     { id: 1, label: '基础', fields: ['bgType', 'bgValue', 'enableSnow'] },
 *     { id: 2, label: '样式', fields: ['particleCount', 'particleColor', 'glassBlur'] },
 *     { id: 3, label: '内容', fields: ['capsuleText', 'treeTextLevels'] }
 *   ]
 * }
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 实际应用示例 - 许愿新光树（使用 media-grid 和 media-picker）
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * export const starlightWishesConfigMetadata = {
 *   panelTitle: '许愿新光树配置',
 *   panelSubtitle: 'Design Your Starlight Tree',
 *   configSchema: {
 *     backgroundValue: {
 *       type: 'media-grid',
 *       label: '背景场景',
 *       mediaType: 'background',
 *       category: 'background',
 *       defaultItems: [
 *         { id: 'c_1', value: '#0f172a', label: '深邃夜空', type: 'color' },
 *         { id: 'i_1', url: 'https://...', label: '梦幻森林', type: 'image' }
 *       ]
 *     },
 *     bgMusicUrl: {
 *       type: 'media-picker',
 *       label: '背景音乐',
 *       mediaType: 'music',
 *       category: 'audio',
 *       defaultItems: [
 *         { id: 'm_1', value: 'https://...', label: '新年烟火' }
 *       ]
 *     },
 *     isMusicPlaying: {
 *       type: 'switch',
 *       label: '播放音乐',
 *       category: 'audio'
 *     }
 *   },
 *   tabs: [
 *     { id: 'background', label: '背景场景', icon: ImageIcon },
 *     { id: 'audio', label: '音效', icon: Music }
 *   ]
 * }
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */


// ============================================================================
// 2. 高颜值玻璃态组件库 (Glassmorphism Components)
// ============================================================================

const Label = ({ children, description }: { children: React.ReactNode, description?: string }) => (
  <div className="mb-2">
    <div className="flex items-center justify-between">
       <label className="block text-xs font-bold text-gray-700 dark:text-gray-100 tracking-wide">{children}</label>
    </div>
    {description && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-light">{description}</p>}
  </div>
);

// 玻璃态基础容器
const BaseControl = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    w-full 
    bg-white/40 dark:bg-black/20 
    backdrop-blur-md 
    border border-white/50 dark:border-white/10 
    rounded-xl 
    shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] 
    transition-all duration-300
    hover:bg-white/60 dark:hover:bg-white/10
    hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)]
    hover:border-pink-200/50 dark:hover:border-pink-500/30
    group
    focus-within:ring-2 focus-within:ring-pink-300/50 focus-within:border-pink-300
    focus-within:bg-white/70 dark:focus-within:bg-black/40
    ${className}
  `}>
    {children}
  </div>
);

const InputControl = ({ value, onChange, placeholder }: any) => (
  <BaseControl className="px-3 py-2.5">
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
    />
  </BaseControl>
);

const TextareaControl = ({ value, onChange, placeholder }: any) => (
  <BaseControl className="px-3 py-2.5">
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent focus:outline-none text-sm resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
    />
  </BaseControl>
);

// 玻璃态下拉框
const CustomSelectControl = ({ value, onChange, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find((opt: any) => opt.value === value) || options?.[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2.5 
          bg-white/40 dark:bg-black/20 backdrop-blur-md
          border border-white/50 dark:border-white/10
          rounded-xl text-sm flex items-center justify-between 
          hover:bg-white/60 dark:hover:bg-white/10 transition-all 
          focus:outline-none focus:ring-2 focus:ring-pink-300/50
          shadow-sm text-gray-700 dark:text-gray-200
        `}
      >
        <div className="flex items-center gap-2.5">
          {selectedOption?.icon && <span className="opacity-80 text-pink-500">{selectedOption.icon}</span>}
          <span className="font-medium">{selectedOption?.label || value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn origin-top p-1">
          {options?.map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`
                w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 rounded-lg transition-all
                ${value === opt.value 
                  ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'}
              `}
            >
              {opt.icon && <span className={`opacity-80 scale-90 ${value === opt.value ? 'text-pink-500' : 'text-gray-400'}`}>{opt.icon}</span>}
              {opt.label}
              {value === opt.value && <X className="w-3.5 h-3.5 ml-auto text-pink-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 玻璃态列表生成器
const ListBuilderControl = ({ value, onChange, placeholder }: any) => {
  const [inputValue, setInputValue] = useState('');
  // 支持数组和字符串两种格式
  const items = Array.isArray(value) 
    ? value 
    : value ? value.split(',').filter((i: string) => i.trim() !== '') : [];

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newItems = [...items, inputValue.trim()];
    // 如果原值是数组，则返回数组；否则返回逗号分隔的字符串
    onChange(Array.isArray(value) ? newItems : newItems.join(','));
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(Array.isArray(value) ? newItems : newItems.join(','));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={placeholder}
            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100"
          />
        </BaseControl>
        <button 
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl shadow-lg hover:shadow-pink-500/40 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all font-medium flex items-center justify-center gap-1"
        >
          <span className="text-sm">+</span>
          <span className="text-xs font-semibold hidden xs:inline">添加</span>
        </button>
      </div>

      <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/40 dark:border-white/5 min-h-[80px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
            <Box className="w-3 h-3"/> 已添加 ({items.length})
          </span>
          {!Array.isArray(value) && <span className="text-[10px] text-gray-400 bg-white/40 px-2 py-0.5 rounded-full">逗号分隔</span>}
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400 italic">暂无内容，请添加</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, idx: number) => (
              <div 
                key={`${item}-${idx}`} 
                className="group flex items-center gap-1.5 bg-white/70 dark:bg-gray-800/80 border border-white/50 dark:border-white/10 px-3 py-1 rounded-full text-xs shadow-sm hover:shadow-md hover:border-pink-200 transition-all animate-fadeIn"
              >
                <span className="text-gray-700 dark:text-gray-200 max-w-[150px] truncate font-medium">{item}</span>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SwitchControl = ({ value, onChange }: any) => (
  <button
    onClick={() => onChange(!value)}
    className={`
      relative w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 
      ${value ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]' : 'bg-gray-200 dark:bg-gray-700'}
    `}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SliderControl = ({ value, onChange, min, max, step }: any) => (
  <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2.5 rounded-xl border border-white/40 dark:border-white/5">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
    />
    <span className="text-xs font-mono w-10 text-center bg-white/50 dark:bg-black/30 rounded px-1 py-0.5 text-gray-600 dark:text-gray-300 font-medium">{value}</span>
  </div>
);

const RadioGroupControl = ({ value, onChange, options }: any) => (
  <div className="flex bg-white/30 dark:bg-black/20 p-1.5 rounded-xl border border-white/40 dark:border-white/5 gap-1">
    {options?.map((opt: any) => {
      const isActive = String(value) === String(opt.value);
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-300
            ${isActive 
              ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'}
          `}
        >
          {opt.label}
        </button>
      )
    })}
  </div>
);

const ColorControl = ({ value, onChange }: any) => (
  <div className="flex items-center gap-3 border border-white/50 dark:border-white/10 p-2.5 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-md">
    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-md cursor-pointer group">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
      />
    </div>
    <div className="flex flex-col">
       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Color</span>
       <span className="text-xs text-gray-600 dark:text-gray-300 font-mono font-medium">{value}</span>
    </div>
  </div>
);

const StickerGridControl = ({ value, onChange, options }: any) => (
  <div className="grid grid-cols-4 gap-2.5">
    {options.map((opt: any) => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-300
            ${isActive 
              ? 'bg-pink-50/80 border-pink-400 ring-2 ring-pink-200 dark:bg-pink-900/30' 
              : 'bg-white/40 border-white/60 hover:border-pink-300 hover:bg-white/60 dark:bg-white/5 dark:border-white/10'}
          `}
        >
          <div className={`transition-transform duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-gray-400 grayscale'}`}>{opt.icon}</div>
          <span className={`text-[9px] font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}`}>{opt.label}</span>
        </button>
      );
    })}
  </div>
);

const MultiSelectControl = ({ value, onChange, options }: any) => {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (val: string) => selected.includes(val) ? onChange(selected.filter((v: string) => v !== val)) : onChange([...selected, val]);
  
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt: any) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
              ${isActive 
                ? 'bg-pink-50 border-pink-300 text-pink-600 shadow-[0_0_8px_rgba(236,72,153,0.2)] dark:bg-pink-900/30 dark:border-pink-500/50 dark:text-pink-300' 
                : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/70 hover:border-pink-200 dark:bg-white/5 dark:border-white/10'}
            `}
          >
            {isActive && <X className="w-3 h-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const FileControl = ({ label }: any) => (
  <button className="w-full flex items-center justify-center gap-2 px-3 py-5 border-dashed border-2 border-white/60 dark:border-white/20 rounded-xl text-gray-500 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50/30 transition-all text-xs group bg-white/20 backdrop-blur-sm">
    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
    <span className="font-medium">点击上传 {label}</span>
  </button>
);

// Select + Input 组合控件（用于预设选择 + 自定义输入）
const SelectInputControl = ({ value, onChange, options, placeholder }: any) => {
  const [mode, setMode] = React.useState<'preset' | 'custom'>('preset');
  
  return (
    <div className="space-y-2">
      {/* 模式切换 */}
      <div className="flex bg-white/30 dark:bg-black/20 p-1 rounded-lg border border-white/40 dark:border-white/5 gap-1">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === 'preset'
              ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          预设选择
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            mode === 'custom'
              ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          自定义
        </button>
      </div>
      
      {/* 控件内容 */}
      {mode === 'preset' ? (
        <CustomSelectControl value={value} onChange={onChange} options={options} />
      ) : (
        <InputControl value={value} onChange={onChange} placeholder={placeholder || '输入自定义 URL...'} />
      )}
    </div>
  );
};

// 贴纸选择器控件
const StickerPickerControl = ({ value, onChange, options, extraData }: any) => {
  const [customUrl, setCustomUrl] = React.useState('');
  const { decorations = [], onClearDecorations } = extraData || {};
  
  const handleAddSticker = (sticker: any) => {
    if (onChange) {
      onChange(sticker);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* 贴纸网格 */}
      <div className="grid grid-cols-4 gap-2">
        {options?.map((opt: any, idx: number) => (
          <button
            key={idx}
            onClick={() => handleAddSticker(opt)}
            className="aspect-square flex items-center justify-center text-2xl bg-white/40 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all border border-white/20 hover:scale-105 active:scale-95 shadow-sm"
          >
            {opt.icon || opt.value}
          </button>
        ))}
      </div>
      
      {/* 自定义输入 */}
      <div className="flex gap-2">
        <BaseControl className="flex-1 px-3 py-2 hover:bg-white/60">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="自定义图片 URL..."
            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </BaseControl>
        <button
          onClick={() => {
            if (customUrl.trim()) {
              handleAddSticker({ type: 'image', value: customUrl, label: 'Custom' });
              setCustomUrl('');
            }
          }}
          disabled={!customUrl.trim()}
          className="px-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* 当前装饰统计 */}
      {decorations && decorations.length > 0 && (
        <div className="pt-2 border-t border-white/10 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              当前装饰 ({decorations.length})
            </span>
          </div>
          <button
            onClick={onClearDecorations}
            className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清除所有装饰
          </button>
        </div>
      )}
      
      {/* 提示文本 */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
        💡 提示：点击装饰品可选中，选中后拖动主体可移动，拖动上方手柄可旋转。
      </p>
    </div>
  );
};

// 媒体网格控件（支持背景媒体的颜色、图片、视频选择）
const MediaGridControl = ({ value, onChange, defaultItems = [], mediaType = 'background', extraData }: any) => {
  const [activeType, setActiveType] = useState<'color' | 'image' | 'video' | 'music'>(
    mediaType === 'background' ? 'color' : 'music'
  );
  const [urlInput, setUrlInput] = useState('');
  const [customItems, setCustomItems] = useState<any[]>([]);

  // 合并预设和自定义资源
  const getCombinedItems = () => {
    const presets = defaultItems.filter((item: any) => item.type === activeType);
    const customs = customItems.filter((item: any) => item.type === activeType);
    return [...customs, ...presets];
  };

  const handleAddCustom = () => {
    if (!urlInput.trim()) return;
    const newItem = {
      id: `custom_${Date.now()}`,
      type: activeType,
      value: urlInput,
      label: `Custom ${customItems.length + 1}`,
      isCustom: true,
    };
    setCustomItems([...customItems, newItem]);
    onChange(newItem.value);
    setUrlInput('');
  };

  const handleDeleteCustom = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const allItems = getCombinedItems();

  return (
    <div className="space-y-4">
      {/* 类型切换（仅背景模式显示） */}
      {mediaType === 'background' && (
        <div className="flex gap-1.5 bg-white/30 dark:bg-black/20 p-1 rounded-xl border border-white/40 dark:border-white/5">
          {(['color', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                activeType === type
                  ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
              }`}
            >
              {type === 'color' ? '纯色' : type === 'image' ? '图片' : '视频'}
            </button>
          ))}
        </div>
      )}

      {/* 自定义输入区域 */}
      {(mediaType === 'background' && activeType !== 'color') || mediaType === 'music' ? (
        <div className="flex gap-2">
          <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder={mediaType === 'background' ? `输入 ${activeType} URL...` : '输入音乐 URL...'}
              className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
            />
          </BaseControl>
          <button
            onClick={handleAddCustom}
            disabled={!urlInput.trim()}
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-lg shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* 媒体网格 */}
      {allItems.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {allItems.map((item, index) => {
            const isSelected = value === item.value;
            const displayValue = item.value || item.url;

            return (
              <div
                key={item.id || `item_${activeType}_${index}`}
                onClick={() => onChange(displayValue)}
                className={`
                  group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-video
                  ${isSelected
                    ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] scale-[1.02]'
                    : 'border-white/20 hover:border-pink-300/50 hover:shadow-md'
                  }
                `}
              >
                {/* 内容预览 */}
                {activeType === 'color' && item.value && (
                  <div className="w-full h-full" style={{ backgroundColor: item.value }} />
                )}
                {activeType === 'image' && displayValue && (
                  <img src={displayValue} alt={item.label} className="w-full h-full object-cover" />
                )}
                {activeType === 'video' && displayValue && (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                    <Video className="text-white/50 w-6 h-6" />
                    <span className="absolute bottom-1 right-1 text-[8px] bg-black/50 px-1 rounded text-white/80">VIDEO</span>
                  </div>
                )}
                {activeType === 'music' && displayValue && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-col gap-1 p-2">
                    <Music className="text-white w-6 h-6" />
                    <span className="text-[10px] text-white/90 truncate w-full text-center font-medium">{item.label || 'Music'}</span>
                  </div>
                )}

                {/* 选中指示器 */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-pink-500 rounded-lg flex items-center justify-center bg-pink-500/10">
                    <div className="bg-pink-500 rounded-full p-0.5 shadow-sm">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                )}

                {/* 自定义标记和删除按钮 */}
                {item.isCustom && (
                  <>
                    <div className="absolute bottom-0 right-0 bg-blue-500/80 text-[8px] text-white px-1.5 py-0.5 rounded-tl-lg">
                      自定义
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustom(item.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </>
                )}

                {/* 标签悬浮 */}
                {!isSelected && item.label && (activeType !== 'music' || true) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[9px] text-white px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {allItems.length === 0 && (
        <div className="text-center py-8 text-xs text-gray-400">
          <p>暂无{mediaType === 'background' ? '背景' : '音乐'}资源，请添加</p>
        </div>
      )}
    </div>
  );
};

// 媒体选择器控件（用于音乐选择+播放控制）
const MediaPickerControl = ({ value, onChange, defaultItems = [], mediaType = 'music', extraData }: any) => {
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const { isMusicPlaying = false, onMusicPlayingChange } = extraData || {};

  const handleAddCustom = () => {
    if (!urlInput.trim()) return;
    const newItem = {
      id: `custom_${Date.now()}`,
      type: 'music',
      value: urlInput,
      label: `Custom Music ${customItems.length + 1}`,
      isCustom: true,
    };
    setCustomItems([...customItems, newItem]);
    onChange(newItem.value);
    setUrlInput('');
  };

  const handleDeleteCustom = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const allItems = [...customItems, ...defaultItems];

  return (
    <div className="space-y-4">
      {/* 自定义输入 */}
      <div className="flex gap-2">
        <BaseControl className="flex-1 px-3 py-2.5 hover:bg-white/60">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="输入音乐 URL (MP3/WAV/OGG)..."
            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </BaseControl>
        <button
          onClick={handleAddCustom}
          disabled={!urlInput.trim()}
          className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-lg shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 播放控制 */}
      {onMusicPlayingChange && (
        <div className="flex items-center justify-between bg-white/30 dark:bg-black/20 p-3 rounded-xl border border-white/40 dark:border-white/5">
          <span className="text-sm text-gray-700 dark:text-gray-100 font-medium flex items-center gap-2">
            {isMusicPlaying ? (
              <Volume2 className="w-4 h-4 text-green-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            {isMusicPlaying ? '播放中' : '已停止'}
          </span>
          <button
            onClick={() => onMusicPlayingChange(!isMusicPlaying)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center ${
              isMusicPlaying
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-all duration-300 ${
                isMusicPlaying ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      )}

      {/* 音乐网格 */}
      {allItems.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {allItems.map((item, index) => {
            const isSelected = value === item.value;
            return (
              <div
                key={item.id || `music_${index}`}
                onClick={() => onChange(item.value)}
                className={`
                  group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-video
                  ${isSelected
                    ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] scale-[1.02]'
                    : 'border-white/20 hover:border-pink-300/50 hover:shadow-md'
                  }
                `}
              >
                {/* 音乐背景预览 */}
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-col gap-1.5 p-2">
                  <Music className="text-white w-6 h-6" />
                  <span className="text-[10px] text-white/90 truncate w-full text-center font-medium px-1">{item.label || '未命名'}</span>
                </div>

                {/* 选中指示器 */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-pink-500 rounded-lg flex items-center justify-center bg-pink-500/10">
                    <div className="bg-pink-500 rounded-full p-0.5 shadow-sm">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                )}

                {/* 自定义标记和删除按钮 */}
                {item.isCustom && (
                  <>
                    <div className="absolute bottom-0 right-0 bg-blue-500/80 text-[8px] text-white px-1.5 py-0.5 rounded-tl-lg">
                      自定义
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustom(item.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {allItems.length === 0 && (
        <div className="text-center py-8 text-xs text-gray-400">
          <p>暂无音乐资源，请添加</p>
        </div>
      )}
    </div>
  );
};

// 背景预设选择器（特殊控件）
const BackgroundPresetControl = ({ presets, onChange }: any) => {
  if (!presets || presets.length === 0) return null;
  
  return (
    <div className="mb-6 border-t border-white/10 dark:border-white/5 pt-4">
      <Label>快速预设</Label>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onChange(preset)}
            className="h-16 rounded-lg border border-white/20 dark:border-white/10 overflow-hidden relative group transition-all hover:ring-2 hover:ring-pink-300/50"
          >
            {/* 背景预览 */}
            {preset.type === 'color' && (
              <div className="w-full h-full" style={{ background: preset.value }} />
            )}
            {preset.type === 'image' && (
              <img src={preset.value} className="w-full h-full object-cover" alt={preset.label} />
            )}
            {preset.type === 'video' && (
              <video src={preset.value} className="w-full h-full object-cover" muted />
            )}
            
            {/* 悬浮标签 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity px-1 text-center">
              {preset.label}
            </div>
            
            {/* 视频标识 */}
            {preset.type === 'video' && (
              <div className="absolute top-1 right-1">
                <Video className="w-3 h-3 text-white drop-shadow-md" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// 主题预设选择器（特殊控件）
const ThemePresetControl = ({ presets, onChange }: any) => {
  if (!presets || presets.length === 0) return null;
  
  return (
    <div className="mb-6 border-t border-white/10 dark:border-white/5 pt-4">
      <Label>快速预设</Label>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset: any, idx: number) => (
          <button
            key={idx}
            onClick={() => onChange(preset)}
            className="h-20 rounded-lg border border-white/20 dark:border-white/10 overflow-hidden relative group transition-all hover:ring-2 hover:ring-pink-300/50"
          >
            {/* 主题预览 */}
            <div className="w-full h-full" style={{ background: preset.preview }} />
            
            {/* 悬浮标签 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity px-2 text-center">
              {preset.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. 字段渲染器
// ============================================================================
const FieldRenderer = <T,>({ 
  itemKey, configValue, allConfig, metadata, onChange, extraData 
}: { 
  itemKey: keyof T; configValue: any; allConfig: T; metadata: GenericConfigItemMetadata<T>; onChange: (key: keyof T, val: any) => void; extraData?: any;
}) => {
  if (metadata.condition && !metadata.condition(allConfig)) return null;

  const commonProps = { value: configValue, onChange: (val: any) => onChange(itemKey, val), ...metadata, extraData };
  let Control;
  switch (metadata.type) {
    case 'input': Control = InputControl; break;
    case 'textarea': Control = TextareaControl; break;
    case 'select': Control = CustomSelectControl; break;
    case 'select-input': Control = SelectInputControl; break;
    case 'sticker-picker': Control = StickerPickerControl; break;
    case 'media-grid': Control = MediaGridControl; break;
    case 'media-picker': Control = MediaPickerControl; break;
    case 'list': Control = ListBuilderControl; break;
    case 'radio': Control = RadioGroupControl; break;
    case 'switch': Control = SwitchControl; break;
    case 'slider': Control = SliderControl; break;
    case 'color': Control = ColorControl; break;
    case 'sticker-grid': Control = StickerGridControl; break;
    case 'multi-select': Control = MultiSelectControl; break;
    case 'file': Control = FileControl; break;
    default: Control = InputControl;
  }

  return (
    <div className="mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <Label description={metadata.description}>{metadata.label}</Label>
        {metadata.type === 'switch' && (
           // @ts-ignore
           <Control {...commonProps} />
        )}
      </div>
      {metadata.type !== 'switch' && (
         // @ts-ignore
         <Control {...commonProps} />
      )}
    </div>
  );
};

// ============================================================================
// 4. 通用配置面板组件
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
    { id: 1, label: '基础', icon: <Settings2 className="w-4 h-4"/>, fields: [] },
    { id: 2, label: '样式', icon: <Palette className="w-4 h-4"/>, fields: [] },
    { id: 3, label: '特效', icon: <Sparkles className="w-4 h-4"/>, fields: [] },
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
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
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
                  <div className={`${isActive ? 'text-pink-500' : 'text-gray-400'} transition-colors`}>{tab.icon || <LayoutTemplate className="w-4 h-4"/>}</div>
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

        {/* Footer - 悬浮按钮 */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 via-white/60 to-transparent dark:from-black/90 pointer-events-none">
          <button className="pointer-events-auto w-full py-3.5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-sm flex items-center justify-center gap-2 group border border-white/20 backdrop-blur-xl">
             <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
             生成预览 / 导出
          </button>
        </div> */}
      </div>
    </>
  );
}