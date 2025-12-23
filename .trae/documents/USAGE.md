# GenericConfigPanel 使用指南

## 📋 概述

`GenericConfigPanel` 是一个通用的配置面板组件，支持多种控件类型，适用于各种工具的配置需求。

## 🎨 新增控件类型

### 1. `select-input` - 下拉选择 + 自定义输入组合控件

适用场景：需要提供预设选项，同时允许用户自定义输入的场景（如背景音乐 URL、API 端点等）

```typescript
interface Config {
  bgMusicUrl: string;
}

const configSchema = {
  bgMusicUrl: {
    category: 'audio',
    type: 'select-input',
    label: '背景音乐',
    placeholder: '输入自定义音乐 URL...',
    options: [
      { label: 'We Wish You Merry Christmas', value: 'https://...' },
      { label: 'Jingle Bells', value: 'https://...' },
    ]
  }
};
```

**特性**：
- 模式切换：预设选择 / 自定义输入
- 玻璃态设计，支持深色模式
- 自动保存用户选择

---

### 2. `sticker-picker` - 贴纸选择器

适用场景：装饰品选择、图标选择等需要视觉化选择的场景

```typescript
interface Config {
  decorationPicker: any; // 触发器字段
}

const configSchema = {
  decorationPicker: {
    category: 'decoration',
    type: 'sticker-picker',
    label: '添加装饰',
    options: [
      { label: '圣诞袜', value: '🧦', type: 'emoji' },
      { label: '圣诞树', value: '🎄', type: 'emoji' },
      { label: '礼物盒', value: '🎁', type: 'emoji' },
    ]
  }
};
```

**使用时需要传入 `extraData`**：

```tsx
<GenericConfigPanel
  config={config}
  configMetadata={metadata}
  onChange={handleChange}
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  extraData={{
    decorations: currentDecorations,  // 当前已添加的装饰品列表
    onClearDecorations: handleClear   // 清除所有装饰的回调
  }}
/>
```

**特性**：
- 4列网格布局展示贴纸
- 支持自定义图片 URL 输入
- 显示当前装饰数量统计
- 一键清除所有装饰
- 贴心的操作提示

---

### 3. `backgroundPresets` - 背景预设选择器（额外功能）

适用场景：快速选择背景图片、视频或颜色

```tsx
const PRESETS = {
  backgrounds: [
    { label: '飘雪视频', value: 'https://...mp4', type: 'video' },
    { label: '梦幻雪夜', value: 'https://...jpg', type: 'image' },
    { label: '复古红绿', value: '#0f392b', type: 'color' },
  ]
};

<GenericConfigPanel
  // ... 其他 props
  backgroundPresets={PRESETS.backgrounds}
  onBackgroundPresetChange={(preset) => {
    onChange('bgType', preset.type);
    onChange('bgValue', preset.value);
  }}
/>
```

**特性**：
- 自动在 `background` tab 显示
- 3列网格布局
- 视觉化预览（颜色、图片、视频缩略图）
- 视频类型显示标识图标
- 悬浮显示预设名称

---

## 🔧 完整使用示例

```typescript
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import type { ToolConfigMetadata } from '@/types/genericConfig';

// 1. 定义配置类型
interface MyToolConfig {
  particleCount: number;
  particleColor: string;
  bgType: 'image' | 'video' | 'color';
  bgValue: string;
  bgMusicUrl: string;
  enableSound: boolean;
  decorationPicker: any;
}

// 2. 定义配置元数据
const configMetadata: ToolConfigMetadata<MyToolConfig> = {
  panelTitle: '圣诞贺卡配置',
  panelSubtitle: 'Design Your Christmas',
  tabs: [
    { id: 'visual', label: '视觉', icon: Sparkles },
    { id: 'background', label: '背景', icon: ImageIcon },
    { id: 'audio', label: '音效', icon: Volume2 },
    { id: 'decoration', label: '装饰', icon: Sticker },
  ],
  configSchema: {
    particleCount: {
      category: 'visual',
      type: 'slider',
      label: '粒子密度',
      min: 20,
      max: 300,
      step: 10
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
      label: '背景地址/颜色',
      placeholder: 'URL or Hex Color'
    },
    bgMusicUrl: {
      category: 'audio',
      type: 'select-input',  // 新增控件
      label: '背景音乐',
      placeholder: '输入自定义音乐 URL...',
      options: PRESETS.music
    },
    enableSound: {
      category: 'audio',
      type: 'switch',
      label: '启用音效'
    },
    decorationPicker: {
      category: 'decoration',
      type: 'sticker-picker',  // 新增控件
      label: '添加装饰',
      options: PRESETS.stickers
    }
  }
};

// 3. 使用组件
function MyToolPage() {
  const [config, setConfig] = useState<MyToolConfig>(DEFAULT_CONFIG);
  const [decorations, setDecorations] = useState([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigChange = (key: keyof MyToolConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleAddSticker = (sticker: any) => {
    const newDeco = {
      id: Date.now().toString(),
      type: sticker.type,
      content: sticker.value,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setDecorations(prev => [...prev, newDeco]);
  };

  return (
    <>
      <DisplayUI config={config} decorations={decorations} />
      
      <GenericConfigPanel
        config={config}
        configMetadata={configMetadata}
        onChange={handleConfigChange}
        isOpen={isConfigOpen}
        setIsOpen={setIsConfigOpen}
        // 额外数据（用于 sticker-picker）
        extraData={{
          decorations,
          onClearDecorations: () => setDecorations([])
        }}
        // 背景预设（可选）
        backgroundPresets={PRESETS.backgrounds}
        onBackgroundPresetChange={(preset) => {
          handleConfigChange('bgType', preset.type);
          handleConfigChange('bgValue', preset.value);
        }}
      />
    </>
  );
}
```

---

## 📦 所有支持的控件类型

| 控件类型 | 用途 | 示例 |
|---------|------|------|
| `input` | 单行文本输入 | 标题、URL |
| `textarea` | 多行文本输入 | 描述、祝福语 |
| `select` | 下拉选择 | 模式选择、类型选择 |
| `select-input` ⭐ | 预设选择 + 自定义输入 | 背景音乐、API 端点 |
| `radio` | 单选按钮组 | 布局方向、对齐方式 |
| `switch` | 开关按钮 | 启用/禁用功能 |
| `slider` | 滑动条 | 数值范围调整 |
| `color` | 颜色选择器 | 主题色、背景色 |
| `list` | 列表构建器 | 标签、关键词 |
| `sticker-grid` | 贴纸网格 | 图标选择 |
| `sticker-picker` ⭐ | 高级贴纸选择器 | 装饰品管理 |
| `multi-select` | 多选按钮组 | 特性选择 |
| `file` | 文件上传 | 图片、视频上传 |

---

## 🎯 CategoryType 分类

支持的分类类型：
- `base` - 基础配置
- `visual` - 视觉效果
- `background` - 背景设置
- `audio` - 音效音乐
- `decoration` - 装饰元素
- `content` - 内容设置
- `scene` - 场景配置
- `physics` - 物理效果
- `gameplay` - 游戏玩法

---

## 💡 最佳实践

### 1. 合理分组
将相关的配置项放在同一个 tab 下，提升用户体验。

### 2. 提供描述
为复杂的配置项添加 `description`，帮助用户理解。

```typescript
{
  label: '粒子密度',
  description: '控制屏幕上粒子的数量，数值越大性能消耗越高',
  // ...
}
```

### 3. 条件显示
使用 `condition` 函数动态控制配置项的显示。

```typescript
{
  label: '背景图片 URL',
  type: 'input',
  condition: (config) => config.bgType === 'image'
}
```

### 4. 移动端优化
为移动端定义 `mobileSteps`，简化操作流程。

```typescript
mobileSteps: [
  { 
    id: 1, 
    label: '基础', 
    icon: <Settings2 />, 
    fields: ['bgType', 'bgValue'] 
  },
  // ...
]
```

---

## 🎨 样式定制

所有控件都采用玻璃态设计，自动支持深色模式。如需定制样式，可以通过 Tailwind CSS 的 `dark:` 修饰符调整。

---

## 🔄 版本更新

### v2.0 (当前版本)
- ✅ 新增 `select-input` 控件
- ✅ 新增 `sticker-picker` 控件
- ✅ 新增 `backgroundPresets` 功能
- ✅ 优化 `extraData` 支持
- ✅ 完善类型定义

### v1.0
- 基础控件支持
- 玻璃态 UI
- 响应式布局

---

## 📞 支持

如有问题或建议，欢迎反馈！
