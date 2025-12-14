# 雨雪涟漪特效 拆分与集成说明

## 原始文件结构
- 入口：`app/test9/page.tsx`
- 结构：
  - 配置层：`AppConfig`、`DEFAULT_CONFIG`、`CONFIG_METADATA`
  - 画布层：`VisualDisplay`（雨滴、雪花、波纹、飘落文字）
  - 配置面板：`ConfigPanel`（键值式 onConfigChange）
  - 根组件：`ChristmasInteractivePage`（状态与组合）

## 新组件关系
- 目录：`app/tools/rain-snow-ripple/`
  - `config.ts`：类型与默认配置、元数据
  - `DisplayUI.tsx`：画布渲染组件，`{ config }`
  - `ConfigUI.tsx`：配置面板组件，`{ config, onChange, isOpen, setIsOpen }`
- 注册：`app/config/toolsRegistry.ts`
  - `toolKey: rain-snow-ripple`
  - 引入并注册三件套与默认配置
- 路由：`/love/[loves]`
  - 通过 `loves=rain-snow-ripple` 加载对应工具

## 迁移 Checklist
- [x] 拆出 `config.ts` 并保留所有键
- [x] 抽取 `VisualDisplay` 为 `DisplayUI`
- [x] 抽取 `ConfigPanel` 为 `ConfigUI`（键值式）
- [x] 在 `toolsRegistry` 注册条目
- [x] 路由页按 `toolKey` 加载
- [x] 添加测试占位文件

## 使用说明
- 访问 `http://localhost:3000/love/rain-snow-ripple`
- 左侧面板修改参数，右侧画布实时更新
