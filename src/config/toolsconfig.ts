/**
 * 工具分类体系配置文件（tag改为数组版）
 * 核心变更：tag从字符串 "热门,节日专属" → 数组 ["热门", "节日专属"]
 */

// ====================== 1. 基础类型定义 ======================
/** 工具标签枚举（限定合法标签，避免随意输入） */
export type ToolTag = '热门' | '新品' | '节日专属' | '表白专属' | '视觉特效' | 'AI创作' | '灵感' | '记录' | '实用' | '文字卡片' | '雨雪效果' | '专属效果';

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
    id: 'rain-snow-ripple',
    toolName: '思念之境 · 雨雪涟漪',
    isActive: true,
    description: '送给远方的TA一场浪漫雨雪：飘落的爱心、柔美的涟漪、轻柔的音乐，用这份专属的浪漫告诉TA"我在想你"',
    tag: ['热门', '雨雪效果', '专属效果', '表白专属'],
    sort: 2,
    cover: '🌧️',
  },
  {
    id: 'warm-text-card',
    toolName: '暖心文字卡片',
    isActive: true,
    description: '生成温柔的文字卡片，适合表白、日常暖心问候，传递真挚情感',
    tag: ['热门', '灵感', '文字卡片'],
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
  },

  {
    id: 'galaxy-weaver',
    toolName: '银河工坊',
    isActive: true,
    description: '创造属于你的璀璨银河，用星辰大海表达永恒的爱意',
    tag: ['表白专属', '视觉特效'],
    sort: 14,
    cover: 'https://images.unsplash.com/photo-1512361738903-8ca45a2ec809?w=400&h=300&fit=crop',
  },




  // ====================== 新增工具 ======================






  {
    id: 'custom-fireworks',
    toolName: '定制烟花',
    isActive: true,
    description: '专属定制烟花秀，送给最爱的人最独特的祝福',
    tag: ['新品', '表白专属', '视觉特效'],
    sort: 32,
    cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  },
  // ====================== 浪漫爱心类工具 ======================
  {
    id: 'romantic-hearts',
    toolName: '浪漫爱心',
    isActive: true,
    description: '多种浪漫爱心效果，心跳脉动、流星浪漫、黑客风格、漂浮文字，表达浓浓爱意',
    tag: ['新品', '表白专属', '视觉特效'],
    sort: 33,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
  },

  // ====================== 生日祝福类工具 ======================

  // ====================== 时空穿梭类工具 ======================

  // ====================== 情侣浪漫类工具 ======================
  {
    id: 'couples-agreement',
    toolName: '情侣协议书',
    isActive: true,
    description: '浪漫甜蜜的爱情约定，自定义协议条款和透明度，制作专属于你们的爱情契约',
    tag: ['热门', '表白专属'],
    sort: 37,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
  },

  // ====================== 甜蜜互动类工具 ======================

  {
    id: 'love-clock-diy',
    toolName: '专属恋爱时钟',
    isActive: true,
    description: '用12张照片组成专属恋爱时钟，每一秒都是与你的甜蜜回忆',
    tag: ['新品', '表白专属', '记录'],
    sort: 40,
    cover: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&h=300&fit=crop',
  },
  {
    id: 'reasons-to-love',
    toolName: '爱你的理由',
    isActive: true,
    description: '心形文字特效，用52个理由告诉TA为什么爱，浪漫告白必备',
    tag: ['热门', '表白专属', '视觉特效'],
    sort: 41,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
  },


  // ====================== 统一爱心工具 ======================


];

/** 分类-工具关联配置 */
export const TOOL_CATEGORY_RELATIONS: ToolCategory[] = [
  // 基础工具关联

  { id: 'rel2', toolId: 'rain-snow-ripple', categoryId: 'festival' },
  { id: 'rel3', toolId: 'warm-text-card', categoryId: 'confession' },










  // 表白工具关联

  { id: 'rel40', toolId: 'galaxy-weaver', categoryId: 'confession' },

  { id: 'rel43', toolId: 'custom-fireworks', categoryId: 'confession' },
  { id: 'rel44', toolId: 'romantic-hearts', categoryId: 'confession' },





  // 纪念工具关联




  // AI创作工具关联
  { id: 'rel15', toolId: 'galaxy-weaver', categoryId: 'ai' },

  // 情侣浪漫工具关联
  { id: 'rel60', toolId: 'couples-agreement', categoryId: 'confession' },
  { id: 'rel61', toolId: 'couples-agreement', categoryId: 'memory' },

  // 新年投射工具关联


  // 公主请开心工具关联


  // 专属恋爱时钟工具关联
  { id: 'rel65', toolId: 'love-clock-diy', categoryId: 'confession' },
  { id: 'rel66', toolId: 'love-clock-diy', categoryId: 'memory' },

  // 爱你的理由工具关联
  { id: 'rel67', toolId: 'reasons-to-love', categoryId: 'confession' },

  // 红绿灯生日倒数工具关联


  // 星球滚动相册工具关联


  // 统一爱心工具关联


  // 2025时光记录工具关联

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