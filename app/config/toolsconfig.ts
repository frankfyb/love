/**
 * 工具分类体系配置文件（tag改为数组版）
 * 核心变更：tag从字符串 "热门,节日专属" → 数组 ["热门", "节日专属"]
 */

// ====================== 1. 基础类型定义 ======================
/** 工具标签枚举（限定合法标签，避免随意输入） */
export type ToolTag = '热门' | '新品' | '节日专属' | '表白专属' | '视觉特效' | 'AI创作' | '灵感' | '记录' | '实用';

/** 分类主表 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  sort: number;
  icon?: string;
}

/** 工具元数据表（tag改为数组） */
export interface ToolMetadata {
  id: string;
  toolName: string;
  isActive: boolean;
  description?: string;
  /** 工具标签（数组格式，支持多个） */
  tag?: ToolTag[];
  sort?: number;
  cover?: string;
}

/** 分类-工具关联表 */
export interface ToolCategory {
  id: string;
  toolId: string;
  categoryId: string;
}

// ====================== 2. 配置数据 ======================
/** 分类配置 */
export const CATEGORIES: Category[] = [
  { id: 'festival', name: '节日', description: '各类节日专属的浪漫工具', sort: 1, icon: 'Calendar' },
  { id: 'confession', name: '表白', description: '助力勇敢表达心意的工具', sort: 2, icon: 'Heart' },
  { id: 'memory', name: '纪念', description: '记录美好瞬间的工具', sort: 3, icon: 'BookMarked' },
  { id: 'ai', name: 'AI创作', description: 'AI驱动的浪漫创作工具', sort: 4, icon: 'Brain' },
];

/** 工具元数据配置（tag为数组） */
export const TOOL_METADATA: ToolMetadata[] = [
  {
    id: 'christmas-card',
    toolName: '圣诞贺卡生成器',
    isActive: true,
    description: '一键生成精美圣诞贺卡，支持自定义文字和样式',
    tag: ['热门', '节日专属'], // 数组格式
    sort: 1,
    cover: '',
  },
  {
    id: 'rain-snow-ripple',
    toolName: '雨雪波纹特效',
    isActive: true,
    description: '添加浪漫的雨雪波纹背景，适配节日氛围',
    tag: ['热门', '视觉特效'],
    sort: 2,
    cover: '',
  },
  {
    id: 'warm-text-card',
    toolName: '暖心文字卡片',
    isActive: true,
    description: '生成温柔的文字卡片，适合表白、日常暖心问候',
    tag: ['热门', '灵感'],
    sort: 3,
    cover: '',
  },
  {
    id: 'ai-poetry',
    toolName: 'AI浪漫诗集',
    isActive: true,
    description: 'AI生成专属浪漫诗集，支持自定义主题',
    tag: ['新品', 'AI创作'],
    sort: 4,
    cover: '',
  },
  {
    id: 'axuyuantree',
    toolName: '许愿元树',
    isActive: true,
    description: '在星光树下许下心愿，让愿望随星光闪耀',
    tag: ['热门', '节日专属', '表白专属'],
    sort: 5,
    cover: '',
  },
];

/** 分类-工具关联配置 */
export const TOOL_CATEGORY_RELATIONS: ToolCategory[] = [
  { id: 'rel1', toolId: 'christmas-card', categoryId: 'festival' },
  { id: 'rel2', toolId: 'rain-snow-ripple', categoryId: 'festival' },
  { id: 'rel3', toolId: 'warm-text-card', categoryId: 'confession' },
  { id: 'rel4', toolId: 'ai-poetry', categoryId: 'ai' },
  { id: 'rel5', toolId: 'warm-text-card', categoryId: 'memory' },
  { id: 'rel6', toolId: 'axuyuantree', categoryId: 'festival' },
];

// ====================== 3. 辅助函数（适配数组标签） ======================
/** 根据分类ID获取分类信息 */
export const getCategoryById = (categoryId: string) => CATEGORIES.find(cat => cat.id === categoryId);

/** 根据工具ID获取关联的所有分类ID */
export const getCategoryIdsByToolId = (toolId: string) => 
  TOOL_CATEGORY_RELATIONS.filter(rel => rel.toolId === toolId).map(rel => rel.categoryId);

/** 根据分类ID获取关联的工具（过滤未启用） */
export const getToolsByCategoryId = (categoryId = '') => {
  const activeTools = TOOL_METADATA.filter(tool => tool.isActive);
  if (!categoryId) return activeTools.sort((a, b) => (a.sort || 999) - (b.sort || 999));
  
  const relatedToolIds = TOOL_CATEGORY_RELATIONS.filter(rel => rel.categoryId === categoryId).map(rel => rel.toolId);
  return activeTools
    .filter(tool => relatedToolIds.includes(tool.id))
    .sort((a, b) => (a.sort || 999) - (b.sort || 999));
};

/** 搜索工具（支持标签模糊匹配） */
export const searchTools = (keyword = '') => {
  if (!keyword) return getToolsByCategoryId();
  
  const lowerKeyword = keyword.toLowerCase();
  return TOOL_METADATA.filter(tool => {
    if (!tool.isActive) return false;
    // 匹配名称/描述/标签（数组遍历）
    const matchName = tool.toolName.toLowerCase().includes(lowerKeyword);
    const matchDesc = tool.description ? tool.description.toLowerCase().includes(lowerKeyword) : false;
    const matchTag = tool.tag ? tool.tag.some(t => t.toLowerCase().includes(lowerKeyword)) : false;
    return matchName || matchDesc || matchTag;
  }).sort((a, b) => (a.sort || 999) - (b.sort || 999));
};

/** 获取所有唯一标签（用于标签筛选栏） */
export const getAllUniqueTags = (): ToolTag[] => {
  const allTags = TOOL_METADATA.filter(tool => tool.isActive).flatMap(tool => tool.tag || []);
  return Array.from(new Set(allTags)).sort(); // 去重并排序
};