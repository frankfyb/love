
export interface AppConfig {
  // 背景设置
  bgTheme: 'deepNight' | 'warmRoom' | 'custom';
  customBgUrl: string; // 支持 Base64 或 URL
  
  // 尺寸调整 (新功能)
  appleSize: number;   // 0.5 - 2.0
  windowScale: number; // 0.5 - 1.5

  // 浪漫特效
  starDensity: number; 
  starSpeed: number;   
  haloIntensity: number; 
  
  // 文案设置
  appleLabel: string;
  bubbleText: string;
  blessingText: string;
  
  // 礼物设置
  giftType: 'apple' | 'giftbox' | 'flower';
}

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: 'deepNight',
  customBgUrl: '',
  appleSize: 1.0,
  windowScale: 1.0,
  starDensity: 40,
  starSpeed: 1.0,
  haloIntensity: 0.8,
  appleLabel: '平安果',
  bubbleText: '晚安！',
  blessingText: '平安夜好梦，岁岁常欢愉~',
  giftType: 'apple',
};

// 保留原有的 CONFIG_METADATA 以保持向后兼容性
export const CONFIG_METADATA: Record<string, any> = {
  bgTheme: {
    label: '场景氛围',
    type: 'select',
    options: [
      { label: '静谧深夜', value: 'deepNight' },
      { label: '温馨暖屋', value: 'warmRoom' },
      { label: '自定义图片', value: 'custom' },
    ]
  },
  appleSize: { label: '礼物大小', type: 'slider', min: 0.5, max: 2.0, step: 0.1 },
  windowScale: { label: '窗户大小', type: 'slider', min: 0.5, max: 1.5, step: 0.1 },
  starDensity: { label: '星空密度', type: 'slider', min: 0, max: 100, step: 1 },
  starSpeed: { label: '闪烁速度', type: 'slider', min: 0.1, max: 3.0, step: 0.1 },
  haloIntensity: { label: '祝福光晕', type: 'slider', min: 0, max: 1, step: 0.1 },
  appleLabel: { label: '标签文字', type: 'text' },
  bubbleText: { label: '女孩气泡', type: 'text' },
  blessingText: { label: '点击祝福语', type: 'text' },
  giftType: {
    label: '礼物形态',
    type: 'select',
    options: [
      { label: '经典红苹果', value: 'apple' },
      { label: '神秘礼盒', value: 'giftbox' },
      { label: '冬日鲜花', value: 'flower' },
    ]
  }
};

// 添加通用配置元数据
export const eveGoodnightAppleConfigMetadata = {
  panelTitle: '平安夜工坊',
  panelSubtitle: 'Design Your Romance',
  configSchema: {
    bgTheme: {
      label: '场景氛围',
      type: 'select' as const,
      options: [
        { label: '静谧深夜', value: 'deepNight' },
        { label: '温馨暖屋', value: 'warmRoom' },
        { label: '自定义图片', value: 'custom' },
      ],
      category: 'scene' as const,
    },
    appleSize: { 
      label: '礼物大小', 
      type: 'slider' as const,
      min: 0.5, 
      max: 2.0, 
      step: 0.1,
      category: 'visual' as const,
    },
    windowScale: { 
      label: '窗户大小', 
      type: 'slider' as const,
      min: 0.5, 
      max: 1.5, 
      step: 0.1,
      category: 'visual' as const,
    },
    starDensity: { 
      label: '星空密度', 
      type: 'slider' as const,
      min: 0, 
      max: 100, 
      step: 1,
      category: 'visual' as const,
    },
    starSpeed: { 
      label: '闪烁速度', 
      type: 'slider' as const,
      min: 0.1, 
      max: 3.0, 
      step: 0.1,
      category: 'visual' as const,
    },
    haloIntensity: { 
      label: '祝福光晕', 
      type: 'slider' as const,
      min: 0, 
      max: 1, 
      step: 0.1,
      category: 'visual' as const,
    },
    appleLabel: { 
      label: '标签文字', 
      type: 'input' as const,
      category: 'content' as const,
    },
    bubbleText: { 
      label: '女孩气泡', 
      type: 'input' as const,
      category: 'content' as const,
    },
    blessingText: { 
      label: '点击祝福语', 
      type: 'input' as const,
      category: 'content' as const,
    },
    giftType: {
      label: '礼物形态',
      type: 'select' as const,
      options: [
        { label: '经典红苹果', value: 'apple' },
        { label: '神秘礼盒', value: 'giftbox' },
        { label: '冬日鲜花', value: 'flower' },
      ],
      category: 'visual' as const,
    }
  },
  tabs: [
    { id: 'scene' as const, label: '场景' },
    { id: 'visual' as const, label: '视觉' },
    { id: 'content' as const, label: '内容' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '场景', 
      fields: ['bgTheme' as const, 'windowScale' as const]
    },
    { 
      id: 2, 
      label: '礼物', 
      fields: ['giftType' as const, 'appleSize' as const, 'haloIntensity' as const]
    },
    { 
      id: 3, 
      label: '文案', 
      fields: ['appleLabel' as const, 'bubbleText' as const, 'blessingText' as const]
    },
  ],
};
