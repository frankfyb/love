## 目标
- 在 `app/profile/page.tsx` 中实现“编辑资料”功能。
- 点击“编辑资料”按钮弹出模态框，允许修改：
  - 昵称（原 `h2`：浪漫制造家）
  - 签名（原 `p`："爱意随风起，风止意难平"）
  - 头像（原 `div`：🌸，使用 emoji 选择或输入）
- 统计数据（作品、访问、收藏）改为动态计算或保留本地存储状态。
- 数据持久化到 `localStorage`，确保刷新后资料不丢失。

## 实现步骤
1.  **定义数据结构与状态**
    - 创建 `UserProfile` 接口：`{ name: string; bio: string; avatar: string; stats: { works: number; visits: string; collections: number } }`。
    - 使用 `useState` 初始化 `profile`，默认值保持现有写死的数据。
    - 使用 `useEffect` 在组件加载时从 `localStorage` 读取 `user_profile` 并更新状态。

2.  **实现编辑模态框**
    - 新增 `isEditOpen` 状态控制编辑模态框显隐。
    - 在模态框内使用 `input` / `textarea` 绑定临时编辑状态。
    - 包含字段：
        - 昵称（Input）
        - 签名（Textarea）
        - 头像（简单 Input 输入 Emoji 或字符）

3.  **保存逻辑**
    - 点击“保存”时，将编辑后的数据更新到 `profile` 状态。
    - 同步写入 `localStorage.setItem('user_profile', JSON.stringify(newProfile))`。
    - 关闭模态框并提示“保存成功”。

4.  **界面联动**
    - 将 JSX 中写死的文本替换为 `profile.name`、`profile.bio`、`profile.avatar`。
    - 统计数据区域替换为 `profile.stats.works` 等（作品数可动态关联 `USER_LINKS_DATA.length`）。

5.  **代码优化**
    - 保持现有 Tailwind 样式与布局结构。
    - 添加必要的类型定义。

## 验证
- 点击“编辑资料”，修改信息后保存，界面即时更新。
- 刷新页面，修改后的信息依然存在。
