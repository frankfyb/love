export interface AppConfig {
  customMessages: string
  particleCount: number
  floatSpeed: number
  fontScale: number
  showDecorations: boolean
}

export const DEFAULT_CONFIG: AppConfig = {
  customMessages: '生日快乐, Happy Birthday, 永远开心, All the best, 岁岁平安',
  particleCount: 50,
  floatSpeed: 1.0,
  fontScale: 1.5,
  showDecorations: true,
}

type ControlType = 'slider' | 'toggle' | 'textarea'

export const CONFIG_METADATA: Array<{
  key: keyof AppConfig
  label: string
  type: ControlType
  min?: number
  max?: number
  step?: number
  placeholder?: string
}> = [
  { key: 'customMessages', label: '定制祝福语 (逗号分隔)', type: 'textarea', placeholder: '输入祝福语...' },
  { key: 'fontScale', label: '文字大小', type: 'slider', min: 1.0, max: 4.0, step: 0.1 },
  { key: 'particleCount', label: '氛围浓度', type: 'slider', min: 20, max: 100, step: 10 },
  { key: 'floatSpeed', label: '流转速度', type: 'slider', min: 0.2, max: 2.5, step: 0.1 },
  { key: 'showDecorations', label: '开启卡通装饰', type: 'toggle' },
]
