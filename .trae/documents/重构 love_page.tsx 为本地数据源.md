## 改造目标
- 移除所有远程 API 相关逻辑与状态
- 使用工具注册表 `app/config/toolsRegistry.ts` 作为唯一数据源
- 维持原有 UI 结构与样式（筛选、搜索、卡片网格、面包屑等）
- 提升类型完整性并添加清晰注释

## 拆除远程逻辑
- 删除：`fetchTools`、`fetchCategories` 两个回调与其 `useEffect` 绑定
- 删除：`loading`、`error` 这类与网络请求绑定的状态及对应 JSX 分支
- 删除：所有 `fetch(...)` 和错误处理（try/catch）

## 本地数据源实现
- 新增本地类型：
  - `interface Category { id: string; name: string }`
  - `interface ToolItem { toolKey: string; toolName: string; description?: string; tag?: string; category?: string }`
- 引入工具注册表方法：`getToolKeyList`、`getToolFullConfig`
- 构建本地工具列表：
  - 遍历 `getToolKeyList()`，读取 `name` 形成 `ToolItem`
  - 默认 `tag: '热门'`，`description: ''`
  - 本地分类映射（假设）：
    - `christmas-card` → `节日`
    - `rain-snow-ripple` → `节日`
    - `warm-text-card` → `表白`
- 本地分类数据：使用静态列表（保持与现有 UI 文案一致）
  - `[ {id:'festival', name:'节日'}, {id:'confession', name:'表白'}, {id:'memory', name:'纪念'}, {id:'ai', name:'AI创作'} ]`
- 将工具的 `category` 字段映射到上述分类（用于筛选）

## 过滤与搜索（本地计算）
- 保留 `activeCategory`、`q` 两个状态
- 使用 `useMemo` 基于本地工具数据执行过滤与搜索
  - 搜索：`toolName` 模糊匹配 `q`
  - 分类：当 `activeCategory` 为空时不过滤，否则按映射字段过滤

## UI 保持
- 保持筛选条、搜索输入框、工具卡片网格、面包屑结构与样式不变
- 移除加载骨架与错误提示区块（无网络状态）
- `ToolCard` 的点击行为改为：`window.location.assign('/love/' + toolKey)`（与现有详情路由保持一致语义）

## 注释与类型
- 在关键改造点添加注释（移除远程、引入本地源、过滤逻辑）
- TypeScript 完整标注所有状态与派生值类型

## 验证
- 打开 `/love` 列表页：展示来自注册表的工具
- 分类筛选与搜索生效
- 点击卡片跳转到 `/love/[toolKey]`
