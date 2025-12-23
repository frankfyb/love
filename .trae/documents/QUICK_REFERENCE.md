# GenericConfigPanel 快速参考

## 🚀 快速开始

### 1️⃣ 基础使用
```tsx
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';

<GenericConfigPanel
  config={config}
  configMetadata={metadata}
  onChange={handleChange}
  isOpen={isOpen}
  setIsOpen={setIsOpen}
/>
```

---

## 🆕 新增控件

### `select-input` - 预设 + 自定义
```typescript
{
  bgMusicUrl: {
    type: 'select-input',
    category: 'audio',
    label: '背景音乐',
    placeholder: '自定义 URL...',
    options: [
      { label: '音乐1', value: 'https://...' },
      { label: '音乐2', value: 'https://...' }
    ]
  }
}
```

### `sticker-picker` - 贴纸选择器
```typescript
{
  decorationPicker: {
    type: 'sticker-picker',
    category: 'decoration',
    label: '添加装饰',
    options: [
      { label: '🎄', value: '🎄', type: 'emoji' },
      { label: '🎁', value: '🎁', type: 'emoji' }
    ]
  }
}

// 使用时传入 extraData
<GenericConfigPanel
  extraData={{
    decorations: decorationsList,
    onClearDecorations: () => setDecorations([])
  }}
/>
```

### `backgroundPresets` - 背景预设
```tsx
<GenericConfigPanel
  backgroundPresets={[
    { label: '视频', value: 'https://...mp4', type: 'video' },
    { label: '图片', value: 'https://...jpg', type: 'image' },
    { label: '颜色', value: '#000', type: 'color' }
  ]}
  onBackgroundPresetChange={(preset) => {
    onChange('bgType', preset.type);
    onChange('bgValue', preset.value);
  }}
/>
```

---

## 📦 所有控件类型

| 类型 | 用途 |
|------|------|
| `input` | 单行输入 |
| `textarea` | 多行输入 |
| `select` | 下拉选择 |
| `select-input` 🆕 | 预设+自定义 |
| `radio` | 单选按钮 |
| `switch` | 开关 |
| `slider` | 滑动条 |
| `color` | 颜色选择 |
| `list` | 列表构建 |
| `sticker-grid` | 贴纸网格 |
| `sticker-picker` 🆕 | 高级贴纸选择 |
| `multi-select` | 多选 |
| `file` | 文件上传 |

---

## 🏷️ CategoryType

`'visual'` | `'background'` | `'audio'` | `'decoration'` | `'content'` | `'scene'` | `'physics'` | `'gameplay'` | `'base'`

---

## 💡 常用模板

### 完整配置示例
```typescript
interface MyConfig {
  // 视觉
  particleCount: number;
  particleColor: string;
  
  // 背景
  bgType: 'image' | 'video' | 'color';
  bgValue: string;
  
  // 音频
  bgMusicUrl: string;
  enableSound: boolean;
  
  // 装饰
  decorationPicker: any;
}

const metadata: ToolConfigMetadata<MyConfig> = {
  panelTitle: '配置面板',
  panelSubtitle: 'Subtitle',
  tabs: [
    { id: 'visual', label: '视觉', icon: <Sparkles /> },
    { id: 'background', label: '背景', icon: <ImageIcon /> },
    { id: 'audio', label: '音效', icon: <Volume2 /> },
    { id: 'decoration', label: '装饰', icon: <Sticker /> },
  ],
  configSchema: {
    particleCount: {
      category: 'visual',
      type: 'slider',
      label: '粒子密度',
      min: 20, max: 300, step: 10
    },
    particleColor: {
      category: 'visual',
      type: 'color',
      label: '粒子颜色'
    },
    bgType: {
      category: 'background',
      type: 'select',
      label: '背景类型',
      options: [
        { label: '纯色', value: 'color' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' }
      ]
    },
    bgValue: {
      category: 'background',
      type: 'input',
      label: '背景地址',
      placeholder: 'URL or Hex'
    },
    bgMusicUrl: {
      category: 'audio',
      type: 'select-input',
      label: '背景音乐',
      options: PRESETS.music
    },
    enableSound: {
      category: 'audio',
      type: 'switch',
      label: '启用音效'
    },
    decorationPicker: {
      category: 'decoration',
      type: 'sticker-picker',
      label: '添加装饰',
      options: PRESETS.stickers
    }
  }
};
```

---

## 📂 文件位置

- **组件**: `app/components/generic/GenericConfigPanel.tsx`
- **类型**: `app/types/genericConfig.ts`
- **示例**: `app/components/generic/ConfigPanelExample.tsx`
- **详细文档**: `app/components/generic/USAGE.md`

---

## 🔗 相关链接

- [详细使用指南](./USAGE.md)
- [集成总结](./INTEGRATION_SUMMARY.md)
- [使用示例](./ConfigPanelExample.tsx)
