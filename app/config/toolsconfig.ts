/**
 * 工具分类体系配置文件（tag改为数组版）
 * 核心变更：tag从字符串 "热门,节日专属" → 数组 ["热门", "节日专属"]
 */

// ====================== 1. 基础类型定义 ======================
/** 工具标签枚举（限定合法标签，避免随意输入） */
export type ToolTag = '热门' | '新品' | '节日专属' | '表白专属' | '视觉特效' | 'AI创作' | '灵感' | '记录' | '实用' | '文字卡片';

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
    isActive: false,
    description: '一键生成精美圣诞贺卡，支持自定义文字和样式，为亲朋好友送上节日祝福',
    tag: ['热门', '节日专属'], // 数组格式
    sort: 1,
    cover: '✨',
  },
  {
    id: 'rain-snow-ripple',
    toolName: '雨雪波纹特效',
    isActive: true,
    description: '添加浪漫的雨雪波纹背景，适配节日氛围，营造温馨浪漫的视觉效果',
    tag: ['热门', '视觉特效'],
    sort: 2,
    cover: 'https://images.unsplash.com/photo-1518006336073-55b36a3d8b95?w=400&h=300&fit=crop',
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
    id: 'money-swirl',
    toolName: '招财进宝',
    isActive: true,
    description: '3D 沉浸式金钱雨特效，许愿财运滚滚，富贵吉祥',
    tag: ['视觉特效', '节日专属'],
    sort: 14,
    cover: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
  },
  {
    id: 'newyear-fireworks',
    toolName: '流光新年烟花',
    isActive: true,
    description: '绚丽的新年烟花秀，迎接新年的到来，共同许下新年愿望',
    tag: ['节日专属', '视觉特效'],
    sort: 12,
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
  {
    id: 'christmas-tree-card',
    toolName: '圣诞树贺卡',
    isActive: true,
    description: '创建互动式圣诞树贺卡，支持自定义装饰和音乐，打造独特的节日祝福',
    tag: ['热门', '节日专属', '视觉特效'],
    sort: 18,
    cover: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop',
  },
  {
    id: 'newyear-countdown',
    toolName: '新年倒计时',
    isActive: true,
    description: '绚丽的新年倒计时烟花秀，迎接新年的到来，支持自定义目标日期和祝福词',
    tag: ['热门', '节日专属', '视觉特效'],
    sort: 19,
    cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop',
  },
  {
    id: 'neon-wish-bubbles',
    toolName: '霓虹许愿气泡',
    isActive: true,
    description: '点击屏幕让祝福气泡升起，霓虹光效的漂浮文字和爱心粒子，营造梦幻般的许愿氛围',
    tag: ['新品', '视觉特效', '表白专属'],
    sort: 20,
    cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
  },
  {
    id: 'romantic-heart-3d',
    toolName: '3D 红色爱心',
    isActive: true,
    description: '3D 粒子爱心特效，搭配浪漫文字与音乐，真挚表白的完美选择',
    tag: ['表白专属', '视觉特效'],
    sort: 30,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
  },
  // ====================== 新增工具 ======================
  {
    id: 'spring-festival',
    toolName: '新春快乐',
    isActive: true,
    description: '3D烟花粒子文字效果，红红火火迎新年，祝福新春快乐',
    tag: ['节日专属', '视觉特效'],
    sort: 21,
    cover: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&h=300&fit=crop',
  },
  {
    id: 'lantern-fireworks',
    toolName: '孔明灯与烟花',
    isActive: true,
    description: '孔明灯升空与烟花绽放的浪漫结合，许愿祈福的美好时刻',
    tag: ['节日专属', '视觉特效'],
    sort: 22,
    cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  },
  {
    id: 'brilliant-fireworks',
    toolName: '璀璨烟花',
    isActive: true,
    description: '绚烂璀璨的高级烟花秀，多种烟花类型自由选择，为你点亮最浪漫的夜空',
    tag: ['热门', '视觉特效', '节日专属', '表白专属'],
    sort: 23,
    cover: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop',
  },
  {
    id: 'tsparticles-fireworks',
    toolName: '梦幻粒子烟花',
    isActive: true,
    description: '基于tsParticles的梦幻烟花效果，细腻流畅的粒子动画',
    tag: ['视觉特效'],
    sort: 24,
    cover: 'https://images.unsplash.com/photo-1533628635777-112b2239b1c7?w=400&h=300&fit=crop',
  },
  {
    id: 'countdown-3d-fireworks',
    toolName: '3D烟花倒计时',
    isActive: true,
    description: '震撼的3D烟花与浪漫倒计时，为你的特别时刻绽放最美烟火',
    tag: ['热门', '节日专属', '表白专属', '视觉特效'],
    sort: 25,
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
  },
  {
    id: 'romantic-fireworks',
    toolName: '浪漫烟花',
    isActive: true,
    description: '高级烟花配合打字机效果，专为浪漫告白设计的烟花秀',
    tag: ['表白专属', '视觉特效'],
    sort: 26,
    cover: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=400&h=300&fit=crop',
  },
  {
    id: 'text-fireworks',
    toolName: '文字烟花',
    isActive: true,
    description: '文字点阵烟花效果，用绚烂烟花写下专属祝福',
    tag: ['视觉特效', '表白专属'],
    sort: 27,
    cover: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=400&h=300&fit=crop',
  },
  {
    id: 'city-fireworks',
    toolName: '城市烟花',
    isActive: true,
    description: '城市夜景烟花效果，在璀璨城市上空绽放浪漫',
    tag: ['视觉特效', '节日专属'],
    sort: 28,
    cover: 'https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?w=400&h=300&fit=crop',
  },
  {
    id: 'aurora-fireworks',
    toolName: '极光烟花',
    isActive: true,
    description: '浪漫极光烟花夜，飘落的爱心与璀璨星空交织，为你点亮最浪漫的夜晚',
    tag: ['热门', '表白专属', '视觉特效'],
    sort: 29,
    cover: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop',
  },
  {
    id: 'firework-show-3d',
    toolName: '3D烟花秀',
    isActive: true,
    description: '沉浸式3D烟花体验，全方位欣赏烟花绽放',
    tag: ['视觉特效', '节日专属'],
    sort: 31,
    cover: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=400&h=300&fit=crop',
  },
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
  {
    id: 'particle-hearts',
    toolName: '粒子爱心',
    isActive: true,
    description: '粒子双心、钻石轨迹、脉动光晕，用粒子编织爱的形状',
    tag: ['新品', '表白专属', '视觉特效'],
    sort: 34,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
  },
  // ====================== 生日祝福类工具 ======================
  {
    id: 'birthday-wish',
    toolName: '生日祝福',
    isActive: true,
    description: '为你的爱人送上最浪漫的生日惊喜，烟花绽放、气球飘飞、爱心满屏的专属祝福',
    tag: ['热门', '节日专属', '表白专属', '视觉特效'],
    sort: 35,
    cover: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
  },
  // ====================== 时空穿梭类工具 ======================
  {
    id: 'time-tunnel',
    toolName: '时空隧道',
    isActive: true,
    description: '年份数字螺旋穿梭隧道，穿越时空遇见你，科幻浪漫的视觉盛宴',
    tag: ['新品', '视觉特效', '表白专属'],
    sort: 36,
    cover: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop',
  },
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
  {
    id: 'festive-projection-diy',
    toolName: '新年好运投射',
    isActive: true,
    description: '贴纸雨撒向人物的浪漫效果，支持喜庆/浪漫/混合风格，为爱人送上新年祈福',
    tag: ['热门', '节日专属', '表白专属'],
    sort: 38,
    cover: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400&h=300&fit=crop',
  },
  // ====================== 甜蜜互动类工具 ======================
  {
    id: 'princess-welcome',
    toolName: '公主请开心',
    isActive: true,
    description: '专属公主的浪漫祝福卡片，精美三卡片设计搭配蝴蝶动效，送给最重要的她',
    tag: ['新品', '表白专属'],
    sort: 39,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
  },
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
  {
    id: 'traffic-light-birthday',
    toolName: '红绿灯生日倒数',
    isActive: true,
    description: '创意红绿灯生日祝福，挥别过去迎接新岁，每一岁都珍贵',
    tag: ['新品', '节日专属'],
    sort: 42,
    cover: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
  },
  {
    id: 'photo-planet',
    toolName: '星球滚动相册',
    isActive: true,
    description: '3D旋转照片星球，裹着心的光，让回忆在星空中永恒旋转',
    tag: ['新品', '表白专属', '视觉特效'],
    sort: 43,
    cover: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop',
  },
];

/** 分类-工具关联配置 */
export const TOOL_CATEGORY_RELATIONS: ToolCategory[] = [
  // 基础工具关联
  { id: 'rel1', toolId: 'christmas-card', categoryId: 'festival' },
  { id: 'rel2', toolId: 'rain-snow-ripple', categoryId: 'festival' },
  { id: 'rel3', toolId: 'warm-text-card', categoryId: 'confession' },

  // 节日工具关联
  { id: 'rel13', toolId: 'newyear-fireworks', categoryId: 'festival' },
  { id: 'rel19', toolId: 'christmas-tree-card', categoryId: 'festival' },
  { id: 'rel20', toolId: 'newyear-countdown', categoryId: 'festival' },
  { id: 'rel31', toolId: 'spring-festival', categoryId: 'festival' },
  { id: 'rel32', toolId: 'lantern-fireworks', categoryId: 'festival' },
  { id: 'rel33', toolId: 'brilliant-fireworks', categoryId: 'festival' },
  { id: 'rel34', toolId: 'countdown-3d-fireworks', categoryId: 'festival' },
  { id: 'rel35', toolId: 'city-fireworks', categoryId: 'festival' },
  { id: 'rel36', toolId: 'firework-show-3d', categoryId: 'festival' },
  { id: 'rel37', toolId: 'birthday-wish', categoryId: 'festival' },
  { id: 'rel38', toolId: 'money-swirl', categoryId: 'festival' },

  // 表白工具关联
  { id: 'rel21', toolId: 'neon-wish-bubbles', categoryId: 'confession' },
  { id: 'rel30', toolId: 'romantic-heart-3d', categoryId: 'confession' },
  { id: 'rel40', toolId: 'galaxy-weaver', categoryId: 'confession' },
  { id: 'rel41', toolId: 'romantic-fireworks', categoryId: 'confession' },
  { id: 'rel42', toolId: 'text-fireworks', categoryId: 'confession' },
  { id: 'rel43', toolId: 'custom-fireworks', categoryId: 'confession' },
  { id: 'rel44', toolId: 'romantic-hearts', categoryId: 'confession' },
  { id: 'rel45', toolId: 'particle-hearts', categoryId: 'confession' },
  { id: 'rel46', toolId: 'time-tunnel', categoryId: 'confession' },
  { id: 'rel47', toolId: 'aurora-fireworks', categoryId: 'confession' },
  { id: 'rel48', toolId: 'birthday-wish', categoryId: 'confession' },
  { id: 'rel49', toolId: 'brilliant-fireworks', categoryId: 'confession' },
  { id: 'rel55', toolId: 'countdown-3d-fireworks', categoryId: 'confession' },

  // 纪念工具关联
  { id: 'rel50', toolId: 'time-tunnel', categoryId: 'memory' },
  { id: 'rel51', toolId: 'birthday-wish', categoryId: 'memory' },
  { id: 'rel52', toolId: 'countdown-3d-fireworks', categoryId: 'memory' },

  // AI创作工具关联
  { id: 'rel15', toolId: 'galaxy-weaver', categoryId: 'ai' },

  // 情侣浪漫工具关联
  { id: 'rel60', toolId: 'couples-agreement', categoryId: 'confession' },
  { id: 'rel61', toolId: 'couples-agreement', categoryId: 'memory' },

  // 新年投射工具关联
  { id: 'rel62', toolId: 'festive-projection-diy', categoryId: 'festival' },
  { id: 'rel63', toolId: 'festive-projection-diy', categoryId: 'confession' },

  // 公主请开心工具关联
  { id: 'rel64', toolId: 'princess-welcome', categoryId: 'confession' },

  // 专属恋爱时钟工具关联
  { id: 'rel65', toolId: 'love-clock-diy', categoryId: 'confession' },
  { id: 'rel66', toolId: 'love-clock-diy', categoryId: 'memory' },

  // 爱你的理由工具关联
  { id: 'rel67', toolId: 'reasons-to-love', categoryId: 'confession' },

  // 红绿灯生日倒数工具关联
  { id: 'rel68', toolId: 'traffic-light-birthday', categoryId: 'festival' },
  { id: 'rel69', toolId: 'traffic-light-birthday', categoryId: 'memory' },

  // 星球滚动相册工具关联
  { id: 'rel70', toolId: 'photo-planet', categoryId: 'confession' },
  { id: 'rel71', toolId: 'photo-planet', categoryId: 'memory' },
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