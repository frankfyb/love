import type { ToolConfigMetadata } from '@/types/genericConfig';
import type { AppConfig } from './index';

export const eveAppleBlindConfigMetadata: ToolConfigMetadata<AppConfig> = {
  panelTitle: '盲盒配置台',
  panelSubtitle: 'Customize your surprise',
  configSchema: {
    title: {
      label: '主标题',
      type: 'input',
      category: 'content',
    },
    romanticMessage: {
      label: '过程情话',
      type: 'textarea',
      category: 'content',
    },
    triggerCount: {
      label: '盲盒解锁次数',
      type: 'select',
      options: [
        { label: '3次 (经典)', value: 3 },
        { label: '5次 (悬念)', value: 5 },
        { label: '9次 (长久)', value: 9 }
      ],
      category: 'gameplay',
    },
    giftContent: {
      label: '盲盒礼物池 (一行一个)',
      type: 'textarea',
      placeholder: '例如：\n拥抱券\n大餐一顿\n520红包',
      category: 'gameplay',
    },
    backgroundType: {
      label: '氛围背景',
      type: 'select',
      options: [
        { label: '暖光壁炉', value: 'fireplace' },
        { label: '飘雪森林', value: 'snowy_forest' },
        { label: '璀璨星空', value: 'starry_sky' },
        { label: '雾感朦胧', value: 'misty_haze' },
        { label: '自定义图片', value: 'custom' }
      ],
      category: 'scene',
    },
    customBgUrl: {
      label: '自定义背景URL',
      type: 'input',
      category: 'scene',
      condition: (config) => config.backgroundType === 'custom',
    },
    textEffect: {
      label: '文字特效',
      type: 'select',
      options: [
        { label: '暖光呼吸', value: 'warm_breath' },
        { label: '雪花描边', value: 'snow_stroke' },
        { label: '渐变流光', value: 'gradient_glow' },
        { label: '手写轨迹', value: 'handwritten' }
      ],
      category: 'visual',
    },
    fontType: {
      label: '字体风格',
      type: 'select',
      options: [
        { label: '优雅雪花体 (Serif)', value: 'serif' },
        { label: '浪漫手写体 (Cursive)', value: 'cursive' }
      ],
      category: 'content',
    },
    particleDensity: {
      label: '浪漫浓度',
      type: 'slider',
      min: 20,
      max: 100,
      step: 10,
      category: 'visual',
    },
    showMusicBtn: {
      label: '音乐装饰',
      type: 'switch',
      category: 'visual',
    },
  },
  tabs: [
    { id: 'content', label: '内容' },
    { id: 'gameplay', label: '玩法' },
    { id: 'scene', label: '场景' },
    { id: 'visual', label: '视觉' },
  ],
  mobileSteps: [
    { 
      id: 1, 
      label: '基础', 
      fields: ['title', 'romanticMessage', 'triggerCount'] 
    },
    { 
      id: 2, 
      label: '礼物', 
      fields: ['giftContent', 'backgroundType'] 
    },
    { 
      id: 3, 
      label: '样式', 
      fields: ['textEffect', 'fontType', 'particleDensity', 'showMusicBtn'] 
    },
  ],
};