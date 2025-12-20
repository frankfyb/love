export type RippleShape = 'circle' | 'heart' | 'star'

export interface AppConfig {
  rainSpeed: number
  snowDensity: number
  rainColor: string
  snowColor: string
  text: string
  rippleShape: RippleShape
  rippleSize: number
  rippleLife: number
  fallingText: string
  fallingSpeed: number
  fallingDensity: number
  fallingSize: number
}

export const DEFAULT_CONFIG: AppConfig = {
  rainSpeed: 1.2,
  snowDensity: 0.3,
  rainColor: '#39ff14',
  snowColor: '#ffd700',
  text: 'Merry Christmas',
  rippleShape: 'heart',
  rippleSize: 20,
  rippleLife: 0.02,
  fallingText: '🎁,🌹,🍬,❤️,Love,平安',
  fallingSpeed: 1.0,
  fallingDensity: 0.2,
  fallingSize: 20,
}

type ControlType = 'slider' | 'color' | 'text' | 'select' | 'textarea'

export const CONFIG_METADATA: Array<{
  key: keyof AppConfig
  label: string
  type: ControlType
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
  placeholder?: string
}> = [
  { key: 'text', label: '中心标题', type: 'text' },
  { key: 'rainSpeed', label: '雨丝速度', type: 'slider', min: 0.1, max: 4, step: 0.1 },
  { key: 'snowDensity', label: '雪花密度', type: 'slider', min: 0, max: 1, step: 0.05 },
  { key: 'fallingText', label: '飘落内容 (逗号分隔)', type: 'textarea', placeholder: '输入Emoji或文字，用逗号分开' },
  { key: 'fallingDensity', label: '礼物密度', type: 'slider', min: 0, max: 1, step: 0.05 },
  { key: 'fallingSpeed', label: '礼物速度', type: 'slider', min: 0.5, max: 3, step: 0.1 },
  { key: 'fallingSize', label: '礼物大小', type: 'slider', min: 12, max: 40, step: 1 },
  {
    key: 'rippleShape',
    label: '溅落形状',
    type: 'select',
    options: [
      { label: '浪漫涟漪 (圆)', value: 'circle' },
      { label: '爱的火花 (心)', value: 'heart' },
      { label: '璀璨星光 (星)', value: 'star' },
    ],
  },
  { key: 'rippleSize', label: '波纹大小', type: 'slider', min: 5, max: 50, step: 1 },
  { key: 'rippleLife', label: '消失速度', type: 'slider', min: 0.01, max: 0.1, step: 0.005 },
  { key: 'rainColor', label: '雨丝主色', type: 'color' },
  { key: 'snowColor', label: '雪花颜色', type: 'color' },
]

// 添加通用配置元数据
export const rainSnowRippleConfigMetadata = {
  panelTitle: '雨雪涟漪配置',
  panelSubtitle: 'Design Your Rain and Snow Ripple Effect',
  configSchema: {
    text: {
      label: '中心标题',
      type: 'input' as const,
      category: 'content' as const,
    },
    rainSpeed: {
      label: '雨丝速度',
      type: 'slider' as const,
      min: 0.1,
      max: 4,
      step: 0.1,
      category: 'visual' as const,
    },
    snowDensity: {
      label: '雪花密度',
      type: 'slider' as const,
      min: 0,
      max: 1,
      step: 0.05,
      category: 'visual' as const,
    },
    fallingText: {
      label: '飘落内容 (逗号分隔)',
      type: 'textarea' as const,
      placeholder: '输入Emoji或文字，用逗号分开',
      category: 'content' as const,
    },
    fallingDensity: {
      label: '礼物密度',
      type: 'slider' as const,
      min: 0,
      max: 1,
      step: 0.05,
      category: 'visual' as const,
    },
    fallingSpeed: {
      label: '礼物速度',
      type: 'slider' as const,
      min: 0.5,
      max: 3,
      step: 0.1,
      category: 'visual' as const,
    },
    fallingSize: {
      label: '礼物大小',
      type: 'slider' as const,
      min: 12,
      max: 40,
      step: 1,
      category: 'visual' as const,
    },
    rippleShape: {
      label: '溅落形状',
      type: 'select' as const,
      options: [
        { label: '浪漫涟漪 (圆)', value: 'circle' },
        { label: '爱的火花 (心)', value: 'heart' },
        { label: '璀璨星光 (星)', value: 'star' },
      ],
      category: 'visual' as const,
    },
    rippleSize: {
      label: '波纹大小',
      type: 'slider' as const,
      min: 5,
      max: 50,
      step: 1,
      category: 'visual' as const,
    },
    rippleLife: {
      label: '消失速度',
      type: 'slider' as const,
      min: 0.01,
      max: 0.1,
      step: 0.005,
      category: 'visual' as const,
    },
    rainColor: {
      label: '雨丝主色',
      type: 'color' as const,
      category: 'visual' as const,
    },
    snowColor: {
      label: '雪花颜色',
      type: 'color' as const,
      category: 'visual' as const,
    },
  },
  tabs: [
    { id: 'content' as const, label: '内容' },
    { id: 'visual' as const, label: '视觉' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '内容', 
      fields: ['text' as const, 'fallingText' as const] 
    },
    { 
      id: 2, 
      label: '视觉', 
      fields: ['rainSpeed' as const, 'snowDensity' as const, 'fallingDensity' as const, 'fallingSpeed' as const, 'fallingSize' as const, 'rippleShape' as const, 'rippleSize' as const, 'rippleLife' as const, 'rainColor' as const, 'snowColor' as const] 
    },
  ],
};
