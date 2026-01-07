import type { BgPresetItem } from '@/types/background';

/**
 * 全局背景预设库（所有工具可直接复用）
 * 设计原则：
 * - 分类清晰，易于查找和扩展
 * - 每个类别是独立的数组，可灵活组合
 * - 支持工具按需导入，避免加载无用资源
 */
export const GLOBAL_BG_PRESETS = {
  /**
   * 通用纯色背景（所有工具共用，基础色系）
   * 适合大多数场景，轻量级
   */
  basicColors: [
    { label: '极致深黑', value: '#05050f', type: 'color' as const },
    { label: '午夜深蓝', value: '#0f172a', type: 'color' as const },
    { label: '皇家紫', value: '#240a34', type: 'color' as const },
    { label: '深灰', value: '#1a1a1a', type: 'color' as const },
    { label: '石板灰', value: '#2d3436', type: 'color' as const },
  ] as const as BgPresetItem[],

  /**
   * 明亮色系背景（中性、温暖场景）
   */
  lightColors: [
    { label: '温柔粉', value: '#fef2f2', type: 'color' as const },
    { label: '清新绿', value: '#ecfdf5', type: 'color' as const },
    { label: '天空蓝', value: '#f0f9ff', type: 'color' as const },
    { label: '象牙白', value: '#fffff8', type: 'color' as const },
  ] as const as BgPresetItem[],

  /**
   * 节日动态背景（圣诞/新年/元宵工具共用）
   * 高级功能，需要视频支持
   */
  festivalVideos: [
    { 
      label: '唯美飘雪', 
      value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/20471-309698211.mp4', 
      type: 'video' as const,
      description: '温柔飘落的雪花动画',
    },
    { 
      label: '温馨壁炉', 
      value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/video/23881-337972830_small.mp4', 
      type: 'video' as const,
      description: '温暖的壁炉火焰',
    },
  ] as const as BgPresetItem[],

  /**
   * 通用高清图片背景（自然/城市场景）
   * 来自 Unsplash 的免费高质量图片
   */
  commonImages: [
    { 
      label: '极光雪夜', 
      value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2670&auto=format&fit=crop', 
      type: 'image' as const,
      description: '北极光点缀的雪地夜景',
    },
    { 
      label: '繁华都市', 
      value: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop', 
      type: 'image' as const,
      description: '璀璨的城市夜景',
    },
    {
      label: '星辰璀璨',
      value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2670&auto=format&fit=crop',
      type: 'image' as const,
      description: '壮观的星空景观',
    },
  ] as const as BgPresetItem[],

  /**
   * 工具专属背景（按需扩展）
   * 为不同工具提供定制化背景组合
   * 
   * @param toolKey - 工具唯一标识
   * @returns 工具对应的背景预设数组
   */
  getToolPresets: (toolKey: string): BgPresetItem[] => {
    switch (toolKey) {
      case 'newyear-countdown':
        // 新年倒计时：支持全系列背景
        return [
          ...GLOBAL_BG_PRESETS.basicColors,
          ...GLOBAL_BG_PRESETS.lightColors,
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages,
        ];
      case 'neon-wish-bubbles':
        // 霓虹许愿气泡：渐变背景为主
        return [
          { label: '海上晚霞', value: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)', type: 'color' as const },
          { label: '梦幻极光', value: 'linear-gradient(to bottom, #000000, #434343, #5e60ce, #6930c3)', type: 'color' as const },
          { label: '深海幽蓝', value: 'linear-gradient(to bottom, #0f172a, #1e3a8a, #3b82f6)', type: 'color' as const },
          { label: '粉紫幻境', value: 'linear-gradient(to bottom, #5b21b6, #7c3aed, #ec4899, #f9a8d4)', type: 'color' as const },
          { label: '橙红热浪', value: 'linear-gradient(to bottom, #7c2d12, #ea580c, #fb923c, #fbbf24)', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3),
          ...GLOBAL_BG_PRESETS.commonImages,
        ];
      case 'christmas-card':
        // 圣诞贺卡：主要是深色和节日视频
        return [
          ...GLOBAL_BG_PRESETS.basicColors,
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages.slice(0, 2), // 仅选择适配圣诞的图片
        ];
      case 'romantic-christmas':
        // 浪漫圣诞：添加温暖色调
        return [
          ...GLOBAL_BG_PRESETS.basicColors.slice(2, 4), // 紫色系
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages,
        ];
      case 'birthday-romance-v2':
        // 生日浪漫：明亮温暖
        return [
          ...GLOBAL_BG_PRESETS.lightColors,
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 2),
          ...GLOBAL_BG_PRESETS.commonImages,
        ];
      default:
        // 默认：仅基础颜色
        return GLOBAL_BG_PRESETS.basicColors;
    }
  },

  /**
   * 获取所有背景预设（不按工具区分）
   * 用于全局背景选择器
   */
  getAllPresets: (): BgPresetItem[] => {
    return [
      ...GLOBAL_BG_PRESETS.basicColors,
      ...GLOBAL_BG_PRESETS.lightColors,
      ...GLOBAL_BG_PRESETS.festivalVideos,
      ...GLOBAL_BG_PRESETS.commonImages,
    ];
  },
};