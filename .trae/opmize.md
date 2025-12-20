核心任务
基于 https://github.com/frankfyb/love 项目的现有架构，将项目中「各工具独立编写的 ConfigUI 配置面板」改造为「元数据驱动的通用型配置面板」，要求适配所有工具、保留原有视觉风格、不破坏现有功能逻辑。
前置信息（项目背景）
项目核心架构：
路由层：app/love/[loves]/page.tsx（工具详情动态路由）、app/love/page.tsx（工具列表）；
工具层：app/tools/<toolKey>/index.tsx（每个工具包含独立的 ConfigUI 配置面板 + DisplayUI 展示面板）；
注册表层：app/config/toolsRegistry.ts（映射所有工具的 DisplayUI/ConfigUI/ 默认配置）；
组件层：app/components/ui/（基础 UI 组件：滑块、开关、下拉框等）。
现有问题：
每个工具的 ConfigUI 强耦合，样式 / 交互不统一；
新增工具需重复开发配置面板渲染逻辑；
移动端适配不一致，维护成本高。
改造目标：
抽离通用 ConfigPanel 组件，所有工具通过「配置元数据」驱动面板渲染；
保留原有 DisplayUI 逻辑，仅替换 ConfigUI；
复用项目现有 UI 组件样式，保持视觉一致性；
适配 PC / 移动端，兼容原有工具的收藏、分享等功能。
改造要求（分步骤执行）
请按照以下步骤输出完整的改造方案，包含代码实现、文件位置、修改说明：
步骤 1：定义通用配置元数据类型
文件位置：新增 app/types/genericConfig.ts；
要求：
定义 GenericControlType（包含 select/radio/switch/color/slider/input/textarea/list 等类型）；
定义 GenericConfigItemMetadata<T> 接口（包含 label/type/options/min/max/step/placeholder/category/description/condition 等字段）；
定义 ToolConfigMetadata<T> 接口（包含 configSchema/tabs/mobileSteps/panelTitle 等字段，关联工具的配置元数据）；
类型需支持泛型，适配任意工具的配置对象。
步骤 2：开发通用配置面板组件
文件位置：新增 app/components/generic/GenericConfigPanel.tsx；
要求：
基于 React Client 组件开发，复用项目 app/components/ui/ 中的基础 UI 组件（滑块、开关、下拉框等）；
实现「元数据→控件」的自动映射逻辑（FieldRenderer 函数，根据 type 渲染对应控件）；
实现 Tab 分类切换（基于工具元数据的 tabs 字段）；
适配 PC / 移动端布局（PC 端左侧固定面板，移动端底部弹出面板）；
接收 props：config（工具配置）、configMetadata（工具元数据）、onChange（配置变更回调）、isOpen/setIsOpen（面板显隐）；
支持配置项的「条件显示」（根据 condition 字段控制是否渲染）。
步骤 3：扩展工具注册表
文件位置：修改 app/config/toolsRegistry.ts；
要求：
移除原有工具的 ConfigUI 映射，新增 configMetadata 字段（关联工具的配置元数据）；
保留工具的 toolName/description/DisplayUI/defaultConfig 字段；
以「许愿树（axuyuantree）」为例，完成注册表的扩展示例。
步骤 4：改造工具目录（以 axuyuantree 为例）
文件位置：
新增 app/tools/axuyuantree/config.ts；
修改 app/tools/axuyuantree/index.tsx；
要求：
在 config.ts 中定义：
工具专属配置类型 AxuyuanTreeConfig；
默认配置 DEFAULT_CONFIG；
配置元数据 axuyuanTreeMetadata（符合 ToolConfigMetadata 接口，包含 tabs 分类、各配置项的元数据）；
在 index.tsx 中删除原有 ConfigUI 组件，仅保留 DisplayUI 组件，导出配置类型和默认配置。
步骤 5：改造工具详情页
文件位置：修改 app/love/[loves]/page.tsx；
要求：
移除原有动态加载自定义 ConfigUI 的逻辑；
引入通用 GenericConfigPanel 组件，传入工具的 config/configMetadata/onChange/isOpen/setIsOpen；
保留原有动态加载 DisplayUI 的逻辑，确保工具展示效果不受影响；
实现 handleConfigChange 回调，更新工具配置状态。
步骤 6：验证与适配说明
要求：
给出改造后工具的访问验证路径（如 /love/axuyuantree）；
列出核心验证点（面板渲染、配置变更响应、移动端适配、原有功能兼容）；
说明如何将其他工具（如 firework 烟花）快速迁移到通用面板。
输出格式要求
每个步骤需明确「文件路径」「代码实现」「修改说明」；
代码片段需标注语言类型（TypeScript/TSX），格式规范，包含必要注释；
关键修改点用加粗标注，说明修改原因和影响；
最后输出「改造总结」，包含优势、注意事项、后续扩展建议。
补充约束
代码需符合 Next.js 14+ App Router 规范（支持 React Server/Client 组件区分）；
样式需复用项目现有 Tailwind CSS 类名，保持视觉风格统一；
避免引入第三方依赖，仅使用项目已有的 lucide-react 图标库和基础 UI 组件；
兼容原有工具的默认配置和 onChange 回调逻辑。