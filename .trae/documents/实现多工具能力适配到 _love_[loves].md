## 目标
- 让 /love/[loves] 能根据不同工具的接口风格自动适配渲染方式，无需为每个工具单独改路由页。

## 注册表增强
- 在 app/config/toolsRegistry.ts 为每个工具条目增加 capabilities：
  - propsFlavor: 'keyed' | 'full'
  - panelSupport: boolean
  - previewSupport: boolean
- 为 ToolBasicConfig 新增 capabilities 字段；更新 getToolFullConfig 返回该字段。
- 为现有工具填充：
  - christmas-card → { propsFlavor: 'keyed', panelSupport: true }
  - warm-text-card → { propsFlavor: 'full', panelSupport: true, previewSupport: true }

## 路由页适配
- 在 app/love/[loves]/page.tsx：
  - 继续使用 React.use(params) 解包 loves。
  - 根据 tool.capabilities.propsFlavor 分支渲染：
    - keyed：
      - ConfigUI: { config, onChange(key, value), isOpen, setIsOpen }
      - DisplayUI: { config, isPanelOpen }
    - full：
      - ConfigUI: { config, onConfigChange(next), isPlaying, onPlayToggle, onReset, isOpen, onOpenChange }
      - DisplayUI: { config, onConfigChange(next), isPreview }
  - 统一维护 config：
    - 键值式：将 onChange(key, value) 映射为 setConfig(prev => ({ ...prev, [key]: value }))
    - 全量式：直接 setConfig(next)
  - isOpen 折叠状态统一维护；isPlaying/onPlayToggle 按需注入（默认 false → 切换时更新）。

## 适配器（可选）
- 在注册表项支持 adapter：
  - mapChange(key, value) → nextConfig（复杂字段的映射）
  - initialState（定制化初始 UI 状态，例如 isPlaying 默认值）

## 错误与降级处理
- 未找到 toolKey → 友好提示页面（保持现状）。
- 缺少 capabilities → 默认 propsFlavor='keyed'。
- 组件运行异常（开发期）→ 控制台提示；可后续加错误边界。

## 验证
- /love/christmas-card：键值式 onChange 生效，折叠面板正常。
- /love/warm-text-card：全量式 onConfigChange 生效；播放、重置、预览工作正常。

## 影响范围
- 仅修改 toolsRegistry 的类型与条目；仅在路由页新增分支逻辑；不改动各工具实现。