## 目标

* 在 `app/profile/page.tsx` 中实现作品列表的本地动态化，不再使用 Mock 数据。

* 聚合各工具页面（`app/love/[loves]/page.tsx`）生成的 `toolTemplates:${toolKey}` 数据，统一展示在 Profile 页面的“我的作品”中。

* 提供删除（本地数据清除）与编辑（跳转回工具页加载配置）功能。

* 优化数据处理流程，添加完整性校验与异常处理，满足性能与稳定性要求。

## 数据结构设计

* **输入数据**：

  * 工具页存储格式：`localStorage` 中的 `toolTemplates:${toolKey}`，值为 JSON 数组 `Array<{ id, name, data }>`。

  * `toolKey` 来源：`app/config/toolsRegistry.ts` 中的 `getToolKeyList()`。

* **标准化数据（UserWorkItem）**：

  * `id`: 唯一标识（组合 `toolKey` + `templateId`）

  * `title`: 模板名称（`name`）

  * `toolKey`: 所属工具标识

  * `toolName`: 工具中文名（从 Registry 获取）

  * `date`: 创建日期（从 `id` 时间戳解析）

  * `config`: 原始配置数据（`data`）

  * `visits`: 访问量（模拟或置 0，因无后端）

## 实现步骤

1. **数据聚合与标准化（Data Aggregation）**

   * 在 `app/profile/page.tsx` 中新增 `useEffect`，遍历所有 `toolKey`。

   * 读取对应的 `localStorage` 项，解析并转换为 `UserWorkItem` 格式。

   * 执行数据完整性校验（Validation）：检查 `id`、`name`、`data` 是否存在且格式正确。

   * 按时间倒序排列，更新到 `works` 状态。

   * 添加错误捕获（try-catch），若解析失败记录日志并跳过。

2. **界面展示（UI Implementation）**

   * 替换 `USER_LINKS_DATA` 为动态 `works` 列表。

   * 复用 `UserLinkItem` 组件（需微调 Props 适配新结构）：

     * 显示：标题、工具类型（Tag）、创建时间。

     * 交互：删除、编辑、分享。

3. **交互逻辑（Interaction Logic）**

   * **删除**：

     * 弹出确认模态框。

     * 确认后，从 `works` 状态移除。

     * **同步删除本地存储**：读取对应 `toolKey` 的 `localStorage`，过滤掉该 ID 的条目后重新写入。

   * **编辑**：

     * 点击跳转：`/love/${toolKey}?config=${encodeURIComponent(JSON.stringify(config))}`。

     * 复用工具页已有的 URL Config 解析逻辑，实现“编辑即加载”。

   * **分享**：

     * 生成链接并复制到剪贴板（同工具页逻辑）。

4. **稳定性与性能（Stability & Performance）**

   * **异常处理**：`JSON.parse` 包裹在 try-catch 中；校验无效数据（如 null 或 结构缺失）。

   * **性能优化**：数据读取在 `useEffect` 中一次性完成；内存占用极低（仅文本 JSON）。

   * **备份机制**（简易版）：删除前可先将数据存入 `deleted_works_backup`（可选，视复杂度而定，暂按直接删除但增加 Toast 提示）。

## 代码调整

* 修改 `app/profile/page.tsx`：引入 `toolsRegistry`，实现数据加载与操作逻辑。

* 修改 `app/components/business/UserLinkItem.tsx`：适配新的数据类型接口。

## 验证

* 在工具页保存几个模板。

* 进入 Profile 页，确认能看到这些作品。

* 点击“编辑”，跳转回工具页并还原配置。

* 点击“删除”，确认作品消失且刷新后不再出现。

