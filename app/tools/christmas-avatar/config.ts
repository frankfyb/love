'use client';
export type StickerType = 'emoji' | 'svg';
export interface StickerAsset { id: string; type: StickerType; content: string; viewBox?: string; color?: string; label: string }
export interface StickerInstance { id: string; assetId: string; type: StickerType; content: string; viewBox?: string; color?: string; x: number; y: number; scale: number; rotation: number }
export type BgType = 'warm' | 'cool' | 'romantic' | 'aurora';
export interface AppConfig { 
  titleText: string; 
  particleCount: number; 
  primaryColor: string; 
  accentColor: string; 
  bgGradientType: BgType;
  userImage?: string; // 添加用户图片字段
  stickers?: StickerInstance[]; // 添加贴纸字段
}
export const DEFAULT_CONFIG: AppConfig = { 
  titleText: 'Merry Christmas', 
  particleCount: 150, 
  primaryColor: '#FFD700', 
  accentColor: '#39FF14', 
  bgGradientType: 'warm',
  stickers: [] // 默认空贴纸数组
};
export const CONFIG_METADATA: Array<{ key: keyof AppConfig; label: string; type: 'text' | 'select' | 'number' | 'color'; min?: number; max?: number; step?: number; options?: { label: string; value: BgType }[] }> = [
  { key: 'titleText', label: '节日寄语', type: 'text' },
  { key: 'bgGradientType', label: '氛围基调', type: 'select', options: [
    { label: '温暖壁炉 (红金)', value: 'warm' },
    { label: '冰雪奇缘 (蓝白)', value: 'cool' },
    { label: '暗夜浪漫 (紫金)', value: 'romantic' },
    { label: '极光幻境 (绿蓝)', value: 'aurora' },
  ]},
  { key: 'particleCount', label: '飞雪密度', type: 'number', min: 0, max: 400, step: 20 },
  { key: 'primaryColor', label: '边框主色', type: 'color' },
  { key: 'accentColor', label: '高光点缀', type: 'color' },
];
export const STICKER_ASSETS: StickerAsset[] = [
  { id: 'hat-santa', type: 'svg', label: '圣诞帽', viewBox: '0 0 512 512', color: '#D42E2E', content: 'M464 256h-8c-13.3 0-24-10.7-24-24V86.8c0-38.6-35.6-67.8-73.3-60.3l-2.2.4c-22.9 4.6-42.5 20.3-51.4 42.1L256 192l-49.1-123c-8.9-21.8-28.5-37.5-51.4-42.1l-2.2-.4C115.6 19 80 48.2 80 86.8V232c0 13.3-10.7 24-24 24h-8c-26.5 0-48 21.5-48 48v80c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-80c0-26.5-21.5-48-48-48zM256 64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-64 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z' },
  { id: 'antlers', type: 'svg', label: '麋鹿角', viewBox: '0 0 24 24', color: '#8B4513', content: 'M12 2C8 2 5 5 5 9c0 2.5 1.5 4.5 3.5 5.5C7 16 5 18 5 21h2c0-2.5 2-4.5 5-4.5s5 2 5 4.5h2c0-3-2-5-3.5-6.5 2-1 3.5-3 3.5-5.5 0-4-3-7-7-7z' },
  { id: 'hat-elf', type: 'svg', label: '精灵帽', viewBox: '0 0 512 512', color: '#2E8B57', content: 'M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-5.8 6.1-6.1 15.6-.5 21.9 2.8 3.2 6.9 4.8 11.2 4.8 4 0 7.8-1.5 10.8-4.3 1.2-1.1 82.6-81.4 82.6-81.4 46 22.8 97.4 34.4 149.7 34.4 141.4 0 256-93.1 256-208S397.4 32 256 32z' },
  { id: 'e1', type: 'emoji', content: '🎅', label: '圣诞老人' },
  { id: 'e2', type: 'emoji', content: '🦌', label: '麋鹿' },
  { id: 'e3', type: 'emoji', content: '🎄', label: '圣诞树' },
  { id: 'e4', type: 'emoji', content: '🎁', label: '礼物' },
  { id: 'e5', type: 'emoji', content: '❄️', label: '雪花' },
  { id: 'e6', type: 'emoji', content: '🔔', label: '铃铛' },
  { id: 'e7', type: 'emoji', content: '🧣', label: '围巾' },
  { id: 'e8', type: 'emoji', content: '⛄', label: '雪人' },
];
