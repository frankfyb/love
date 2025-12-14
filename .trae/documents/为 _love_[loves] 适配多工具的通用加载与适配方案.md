## 目标
- 让 `app/love/[loves]/page.tsx` 能加载并渲染不同风格与接口的工具（DisplayUI + ConfigUI），同时保持最小改动代价与良好扩展性。

## 统一约定（工具三件套）
- 目录：`app/tools/<toolKey>/`
- 必备导出：
  - `config.ts`：`DEFAULT_CONFIG`（或 `defaultConfig`）与工具专用类型（可选 `CONFIG_METADATA`）
  - `DisplayUI.tsx`：导出默认组件
  - `ConfigUI.tsx`：导出默认组件
- 基础接口（建议）：
  - ConfigUI（键值式）：`{ config, onChange(key, value), isOpen, setIsOpen }`
  - DisplayUI（只读式）：`{ config, isPanelOpen }`
- 兼容接口（全量式）：
  - ConfigUI（全量）：`{ config, onConfigChange(next), isPlaying, onPlayToggle, onReset, isOpen, onOpenChange }`
  - DisplayUI（可写式）：`{ config, onConfigChange(next), isPreview }`

## 注册与能力声明
- 在 `app/config/toolsRegistry.ts` 注册：
  - `toolKey: string`（如 `christmas-card`、`warm-text-card`）
  - `name: string`
  - `DisplayUI`、`ConfigUI` 组件
  - `defaultConfig: Record<string, any>`
  - `capabilities`（新增）：
    - `propsFlavor: 'keyed' | 'full'`（声明该工具组件参数风格）
    - `panelSupport: boolean`（是否支持折叠面板）
    - `previewSupport: boolean`（Display 是否支持预览写入）

## 动态页适配策略
- 解包路由参数（React 19）：`const { loves } = React.use(params)`
- 读取注册项：`getToolFullConfig(loves)`，拿到 `{ DisplayUI, ConfigUI, defaultConfig, capabilities }`
- 根据 `capabilities.propsFlavor` 分支渲染：
  - keyed：
    - ConfigUI：`{ config, onChange, isOpen, setIsOpen }`
    - DisplayUI：`{ config, isPanelOpen }`
  - full：
    - ConfigUI：`{ config, onConfigChange, isPlaying, onPlayToggle, onReset, isOpen, onOpenChange }`
    - DisplayUI：`{ config, onConfigChange }`
- 统一 `config` 状态在页内维护：
  - `const [config, setConfig] = useState(defaultConfig)`
  - 键值式 `onChange(key, val)` 转换为 `setConfig(prev => ({ ...prev, [key]: val }))`
  - 全量式直接 `onConfigChange(next)`

## 错误与降级
- 未找到 toolKey：渲染友好提示（避免 500）
- 注册项缺失字段：回退到键值式、忽略不可用能力
- 组件运行时异常：用错误边界封装（可选）

## 新工具落地步骤
1. 在 `app/tools/<toolKey>/` 编写三件套并导出默认配置
2. 在 `app/config/toolsRegistry.ts` 注册条目并附加 `capabilities`
3. 打开 `/love/<toolKey>` 验证：
   - 面板折叠、参数更新是否即刻生效
   - Display 与 Config 的写入/只读模式是否正确

## 迁移建议
- 对现有的 `warm-text-card` 等工具：
  - 若走全量式接口，注册 `propsFlavor: 'full'` 并使用 `onConfigChange` 适配
  - 将工具特有字段（如 `customMessages`）维持在 `defaultConfig`，保持 Display 与 Config 一致

## 扩展（可选）
- 在注册表加入 `adapter` 回调：
  - `adapter.mapConfigChange(key, value) => nextConfig`（允许复杂字段映射）
  - `adapter.initialState`（提供复杂初始状态）
- 加入 `getToolKeyList()` 生成工具选择器页（目录/下拉）。