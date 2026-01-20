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
          ...GLOBAL_BG_PRESETS.basicColors,
          ...GLOBAL_BG_PRESETS.festivalVideos,
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
      case 'warm-text-card':
        // 温馨文字卡片：支持全系列，提供灵活背景选择
        return [
          ...GLOBAL_BG_PRESETS.basicColors,
          ...GLOBAL_BG_PRESETS.lightColors,
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages,
        ];
      case 'romantic-heart-3d':
        // 浪漫3D爱心：深色背景为主，营造浪漫氛围
        return [
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3), // 深黑、深蓝、皇家紫
          ...GLOBAL_BG_PRESETS.festivalVideos, // 飘雪、壁炉等浪漫场景
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('极光') || img.label.includes('星辰')
          ),
        ];
      case 'spring-festival':
        // 新春快乐：深色背景为主，以更好展示烟花和粒子效果
        return [
          { label: '纯黑', value: '#000000', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3), // 深黑、深蓝、皇家紫
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰') || img.label.includes('极光')
          ),
        ];
      case 'lantern-fireworks':
        // 孔明灯与烟花：深色夜空背景，让灯光和烟花更突出
        return [
          { label: '深邃夜空', value: '#0a0a1a', type: 'color' as const },
          { label: '午夜蓝', value: '#0a0a2e', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3),
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰')
          ),
        ];
      case 'galaxy-weaver':
        // 银河工坊：深色星空为主
        return [
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3),
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰')
          ),
        ];
      case 'brilliant-fireworks':
        // 璀璨烟花：深色背景让烟花效果最突出，添加浪漫氛围选项
        return [
          { label: '纯黑', value: '#000000', type: 'color' as const },
          { label: '深空', value: '#050510', type: 'color' as const },
          { label: '浪漫深紫', value: '#0a0515', type: 'color' as const },
          { label: '午夜蓝', value: '#050a15', type: 'color' as const },
          { label: '深邃星空', value: '#080812', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 2),
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰') || img.label.includes('都市')
          ),
          {
            label: '城市夜景',
            value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '繁华都市的夜空',
          },
        ];
      case 'tsparticles-fireworks':
        // 梦幻粒子烟花：纯黑和深色背景，让流畅烟花效果更加梦幻
        return [
          { label: '纯黑', value: '#000000', type: 'color' as const },
          { label: '深邃夜空', value: '#0a0a1a', type: 'color' as const },
          { label: '深空', value: '#050510', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 2),
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰')
          ),
        ];
      case 'countdown-3d-fireworks':
        // 3D烟花倒计时：深邃夜空背景，突出3D烟花效果和倒计时文字
        return [
          { label: '纯黑', value: '#000000', type: 'color' as const },
          { label: '浪漫深紫', value: '#0a0518', type: 'color' as const },
          { label: '午夜星空', value: '#050515', type: 'color' as const },
          { label: '节日红黑', value: '#0a0508', type: 'color' as const },
          { label: '极光深蓝', value: '#051020', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 2),
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰') || img.label.includes('极光')
          ),
          {
            label: '新年烟花',
            value: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2669&auto=format&fit=crop',
            type: 'image' as const,
            description: '绚丽的新年烟花夜空',
          },
        ];
      case 'aurora-fireworks':
        // 极光烟花：浪漫极光和星空背景，配合飘落爱心效果
        return [
          { label: '浪漫紫夜', value: '#0a0015', type: 'color' as const },
          { label: '深邃星空', value: '#050510', type: 'color' as const },
          { label: '极光深蓝', value: '#0a1628', type: 'color' as const },
          { label: '神秘紫色', value: '#1a0a2e', type: 'color' as const },
          { label: '午夜玫瑰', value: '#1a0a1a', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3),
          ...GLOBAL_BG_PRESETS.festivalVideos,
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('极光') || img.label.includes('星辰')
          ),
          {
            label: '浪漫星河',
            value: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '梦幻的银河星空',
          },
          {
            label: '极光之夜',
            value: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '绚丽的北极光夜景',
          },
        ];
      case 'birthday-wish':
        // 生日祝福：浪漫派对氛围，温馨生日主题
        return [
          { label: '纯黑背景', value: '#000000', type: 'color' as const },
          { label: '浪漫粉夜', value: '#1a0a15', type: 'color' as const },
          { label: '温馨紫罗兰', value: '#150a1a', type: 'color' as const },
          { label: '派对深蓝', value: '#0a1020', type: 'color' as const },
          { label: '梦幻玫瑰', value: '#200a18', type: 'color' as const },
          ...GLOBAL_BG_PRESETS.basicColors.slice(0, 3),
          ...GLOBAL_BG_PRESETS.festivalVideos,
          {
            label: '生日气球',
            value: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '五彩缤纷的生日气球',
          },
          {
            label: '浪漫蛋糕',
            value: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '精美的生日蛋糕',
          },
          {
            label: '派对彩带',
            value: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2670&auto=format&fit=crop',
            type: 'image' as const,
            description: '欢乐的派对装饰',
          },
          ...GLOBAL_BG_PRESETS.commonImages.filter(img =>
            img.label.includes('星辰')
          ),
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