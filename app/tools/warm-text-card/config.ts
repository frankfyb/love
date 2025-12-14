export type WarmTextCardConfig = {
  theme: 'warm' | 'forest' | 'night' | 'minimal';
  speed: number;
  maxCards: number;
  fontSizeScale: number;
  customMessages: string[];
};

export type AppConfig = WarmTextCardConfig;

export const defaultConfig: WarmTextCardConfig = {
  theme: 'warm',
  speed: 800,
  maxCards: 50,
  fontSizeScale: 1,
  customMessages: [
    '生活原本沉闷，但跑起来就有风',
    '保持热爱，奔赴山海',
    '愿你的世界总有微风和暖阳',
    '把温柔和浪漫留给值得的人',
  ],
};

export const THEMES = {
  warm: {
    name: '暖阳午后',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    cardBg: ['bg-white', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50'],
    textColor: 'text-orange-900',
    shadow: 'shadow-orange-200/50',
  },
  forest: {
    name: '静谧森林',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    cardBg: ['bg-white', 'bg-emerald-50', 'bg-teal-50', 'bg-green-50'],
    textColor: 'text-emerald-900',
    shadow: 'shadow-emerald-200/50',
  },
  night: {
    name: '星河入梦',
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    cardBg: ['bg-slate-800', 'bg-purple-900/80', 'bg-indigo-900/80', 'bg-slate-700'],
    textColor: 'text-indigo-100',
    shadow: 'shadow-purple-900/50',
  },
  minimal: {
    name: '极简白白',
    bg: 'bg-gray-50',
    cardBg: ['bg-white'],
    textColor: 'text-gray-800',
    shadow: 'shadow-gray-200',
  },
};

export type ControlType = 'slider' | 'text' | 'textarea' | 'select';

export type ConfigMeta = {
  key: keyof AppConfig;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: AppConfig['theme'] }[];
  placeholder?: string;
};

export const CONFIG_METADATA: ConfigMeta[] = [
  { key: 'theme', label: '主题风格', type: 'select', options: [
    { label: THEMES.warm.name, value: 'warm' },
    { label: THEMES.forest.name, value: 'forest' },
    { label: THEMES.night.name, value: 'night' },
    { label: THEMES.minimal.name, value: 'minimal' },
  ] },
  { key: 'speed', label: '生成速度 (ms)', type: 'slider', min: 200, max: 1500, step: 50 },
  { key: 'maxCards', label: '最大卡片数', type: 'slider', min: 10, max: 200, step: 5 },
  { key: 'fontSizeScale', label: '字体大小比例', type: 'slider', min: 0.5, max: 2, step: 0.1 },
  { key: 'customMessages', label: '自定义文案列表（逗号分隔）', type: 'textarea', placeholder: '示例：爱你, Merry Christmas, 平安喜乐' },
];
