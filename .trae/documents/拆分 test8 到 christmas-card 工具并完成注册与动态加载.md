## 目标
- 将 `app/test8/page.tsx` 的界面拆分为独立工具“christmas-card”，包含实时视图组件与配置面板组件。
- 在 `toolRegistry` 中注册该工具，提供唯一 `toolKey`、名称、组件与默认配置。
- 在 `src/app/love/[loves]/page.tsx` 通过 URL 参数 `loves` 动态加载对应工具（显示面板 + 配置面板）。

## 拆分范围
- 视图组件：`DisplayLayer`（含礼物掉落逻辑、粒子背景、树文案渲染、样式关键帧）
- 配置组件：`ConfigPanel`（侧边折叠面板、配置项输入控件、说明文案）
- 共享元素：`Icons`、`GlassCard`（优化玻璃卡片）
- 默认配置与元数据：`DEFAULT_CONFIG`、`CONFIG_METADATA`（用于生成 UI）

## 新增/更新文件
- `app/tools/christmas-card/config.ts`
  - 导出：`DEFAULT_CONFIG`（从 test8 的 DEFAULT_CONFIG 拆出）
  - 可选导出：`CONFIG_METADATA`（供 ConfigUI 使用）
  - 定义 `AppConfig` 接口（统一 props 类型）
- `app/tools/christmas-card/DisplayUI.tsx`
  - 导出默认组件：`ChristmasCardDisplayUI`
  - 接口：`{ config: AppConfig; isPanelOpen?: boolean }`
  - 内容：整合 `DisplayLayer` 逻辑（保留 tsparticles 初始化、礼物掉落、树文案和样式）
- `app/tools/christmas-card/ConfigUI.tsx`
  - 导出默认组件：`ChristmasCardConfigUI`
  - 接口：`{ config: AppConfig; onChange: (key: keyof AppConfig, value: any) => void; isOpen: boolean; setIsOpen: (v: boolean) => void }`
  - 内容：整合 `ConfigPanel` 逻辑（使用 `CONFIG_METADATA` 渲染控件）

## 注册工具
- 新增文件：`src/config/toolsRegistry.ts`
  - 类型：`ToolBasicConfig`、`ToolRegistry`、`ToolKey`（至少包含 `'christmas-card'`）
  - 引入：`DEFAULT_CONFIG`、`DisplayUI`、`ConfigUI` 从 `@/tools/christmas-card/...`
  - 导出：
    - `toolRegistry`：包含键 `'christmas-card'`
    - `getToolFullConfig(toolKey: ToolKey)`：未找到时抛错（修复“未找到工具基础配置”）

## 动态加载页面
- 新增文件：`src/app/love/[loves]/page.tsx`
  - 读取路由参数 `loves`（类型 `ToolKey`）
  - 调用 `getToolFullConfig(loves)` 获取 `{ name, DisplayUI, ConfigUI, defaultConfig }`
  - 本地 `useState` 维护 `config`（初值 `defaultConfig`）、`isOpen`（折叠状态）
  - 渲染：左侧 `ConfigUI` + 右侧 `DisplayUI`，统一布局样式
  - 未找到工具时给出友好的错误 UI（避免 500）

## 替换/引用规范
- 保留 `app/test8/page.tsx` 作为独立示例页面（不影响工具加载）
- 通过 `@tsparticles/react` / `@tsparticles/slim` 依赖渲染粒子层（已在 package.json 中）
- 避免在工具内直接依赖 App 路由结构，保证复用性

## 验证步骤
- 路由：访问 `/love/christmas-card`，确认加载侧边配置与视图
- 交互：调整面板参数（数量/大小/颜色/速度）实时更新右侧视图
- 粒子：鼠标点击触发礼物掉落；顶部星星点击触发连续掉落
- 回退：错误 `ToolKey` 显示“未找到工具”的提示

## 说明与兼容
- 错误“未找到工具【christmas-card】的基础配置”是由于注册表缺失或路径错误导致，解决方案为在 `src/config/toolsRegistry.ts` 正确注册并从工具目录导入。
- 工具的 props 与类型统一在 `config.ts` 导出，确保 `ConfigUI` 与 `DisplayUI` 一致。
- 保持与现有 `@/` 别名一致（Next.js `tsconfig.json` `paths`），若不存在则改为相对路径导入。