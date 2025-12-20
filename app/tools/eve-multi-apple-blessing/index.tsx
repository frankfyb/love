'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, X, Heart, Gift, Snowflake, CloudFog, 
  Music, Box, ChevronDown, ChevronUp 
} from 'lucide-react';

/**
 * ==============================================================================
 * 1. 类型定义与默认配置 (Types & Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  bgTheme: string;            // 背景主题
  effectType: 'snow' | 'fog' | 'both' | 'none'; // 特效类型
  blessingStyle: 'sweet' | 'gentle' | 'poetic'; // 祝福语风格
  boxShape: 'square' | 'round' | 'heart';      // 盒子形状 (图片模式下此选项主要影响动画)
  boxLabel: string;           // 盒子上的文字
  giftList: string;           // 礼物列表（逗号分隔）
  showMusicBtn: boolean;      // 是否显示音乐按钮模拟
}

// 图片资源常量
const ASSETS = {
  bgImage: 'url("https://img0.baidu.com/it/u=2472036935,794404565&fm=253&app=138&f=JPEG?w=800&h=985")',
  boxImage: 'https://preview.qiantucdn.com/58pic/sX/AN/F3/Uq/hdm50itv187oxaqu9bsrz2py4w6lckje_PIC2018.png!w1024_new_small_1'
};

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: ASSETS.bgImage,
  effectType: 'both',
  blessingStyle: 'sweet',
  boxShape: 'square',
  boxLabel: '平安喜乐',
  giftList: '一个暖暖的拥抱,一杯热奶茶,看一场电影,为你唱首歌,手写信一张,清空购物车(限额),专属按摩券',
  showMusicBtn: true,
};

// 保留原有的 CONFIG_METADATA 以保持向后兼容性
export const CONFIG_METADATA: Record<string, any> = {
  bgTheme: {
    label: '氛围背景',
    type: 'select',
    options: [
      { label: '定制节日 (当前)', value: ASSETS.bgImage },
      { label: '梦幻粉紫', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
      { label: '深邃星空', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
      { label: '圣诞暖红', value: 'linear-gradient(to right, #ed213a, #93291e)' },
      { label: '清新森系', value: 'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)' },
    ]
  },
  effectType: {
    label: '浪漫特效',
    type: 'select',
    options: [
      { label: '漫天飘雪', value: 'snow' },
      { label: '朦胧迷雾', value: 'fog' },
      { label: '雪雾共舞', value: 'both' },
      { label: '无特效', value: 'none' },
    ]
  },
  blessingStyle: {
    label: '祝福风格',
    type: 'select',
    options: [
      { label: '甜腻告白 (Sweet)', value: 'sweet' },
      { label: '温柔陪伴 (Gentle)', value: 'gentle' },
      { label: '小众文艺 (Poetic)', value: 'poetic' },
    ]
  },
  boxShape: {
    label: '礼盒动画',
    type: 'select',
    options: [
      { label: '标准', value: 'square' },
      { label: 'Q弹', value: 'round' },
    ]
  },
  boxLabel: {
    label: '封面寄语',
    type: 'text',
    placeholder: '例如：平安喜乐'
  },
  giftList: {
    label: '礼物清单 (逗号分隔)',
    type: 'textarea',
    placeholder: '输入礼物，用逗号分隔'
  }
};

// 添加通用配置元数据
export const eveMultiAppleBlessingConfigMetadata = {
  panelTitle: '多重苹果祝福',
  panelSubtitle: 'Design Your Romance',
  configSchema: {
    bgTheme: {
      label: '氛围背景',
      type: 'select' as const,
      options: [
        { label: '定制节日 (当前)', value: ASSETS.bgImage },
        { label: '梦幻粉紫', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
        { label: '深邃星空', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
        { label: '圣诞暖红', value: 'linear-gradient(to right, #ed213a, #93291e)' },
        { label: '清新森系', value: 'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)' },
      ],
      category: 'scene' as const,
    },
    effectType: {
      label: '浪漫特效',
      type: 'select' as const,
      options: [
        { label: '漫天飘雪', value: 'snow' },
        { label: '朦胧迷雾', value: 'fog' },
        { label: '雪雾共舞', value: 'both' },
        { label: '无特效', value: 'none' },
      ],
      category: 'visual' as const,
    },
    blessingStyle: {
      label: '祝福风格',
      type: 'select' as const,
      options: [
        { label: '甜腻告白 (Sweet)', value: 'sweet' },
        { label: '温柔陪伴 (Gentle)', value: 'gentle' },
        { label: '小众文艺 (Poetic)', value: 'poetic' },
      ],
      category: 'content' as const,
    },
    boxShape: {
      label: '礼盒动画',
      type: 'select' as const,
      options: [
        { label: '标准', value: 'square' },
        { label: 'Q弹', value: 'round' },
      ],
      category: 'visual' as const,
    },
    boxLabel: {
      label: '封面寄语',
      type: 'input' as const,
      placeholder: '例如：平安喜乐',
      category: 'content' as const,
    },
    giftList: {
      label: '礼物清单 (逗号分隔)',
      type: 'textarea' as const,
      placeholder: '输入礼物，用逗号分隔',
      category: 'content' as const,
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
      fields: ['bgTheme' as const, 'effectType' as const]
    },
    { 
      id: 2, 
      label: '样式', 
      fields: ['boxShape' as const, 'boxLabel' as const]
    },
    { 
      id: 3, 
      label: '内容', 
      fields: ['blessingStyle' as const, 'giftList' as const]
    },
  ],
};

// 预设祝福语文案库
const BLESSINGS_LIB = {
  sweet: [
    "你是我所有的少女情怀和心之所向。",
    "平安夜不仅要吃苹果，还要吃你。",
    "众生皆苦，只有你是草莓味的。",
    "想送你整个宇宙，却只找到这颗苹果。",
    "我的世界因为有你，每天都是节日。"
  ],
  gentle: [
    "岁岁平平安安，年年万事如意。",
    "愿你遍历山河，觉得人间值得。",
    "平安夜快乐，不止今夜，更是每夜。",
    "希望你不仅平安，还要快乐自由。",
    "愿所有的美好，都如期而至。"
  ],
  poetic: [
    "山野万里，你是我藏在微风里的欢喜。",
    "祝你平安，在无人的角落，在璀璨的星河。",
    "雪花落下的时候，思念也悄悄堆积。",
    "将所有的晦气都留在过往，把平安带去明天。",
    "月亮被嚼碎了变成星星，你就藏在漫天星光里。"
  ]
};

/**
 * ==============================================================================
 * 2. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

// 辅助组件：雪花/粒子特效
const Particles = ({ type }: { type: 'snow' | 'fog' | 'both' | 'none' }) => {
  if (type === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {(type === 'snow' || type === 'both') && (
        [...Array(30)].map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            initial={{ y: -20, x: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ 
              y: "110vh", 
              opacity: [0, 1, 0],
              x: ["-10%", "10%", "-5%"] 
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute top-0 text-white text-opacity-80"
            style={{ fontSize: Math.random() * 20 + 10 + 'px' }}
          >
            ❄
          </motion.div>
        ))
      )}
      {(type === 'fog' || type === 'both') && (
        <motion.div 
          animate={{ x: ["-10%", "10%"] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-40 blur-3xl" 
        />
      )}
    </div>
  );
};

// 辅助组件：点击掉落的苹果 (样式优化)
const FallingItem = ({ x, y, onComplete }: { x: number, y: number, onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ y: y, x: x, opacity: 1, rotate: 0 }}
      animate={{ y: y + 300, opacity: 0, rotate: 360 }}
      transition={{ duration: 1.5, ease: "easeIn" }}
      onAnimationComplete={onComplete}
      className="absolute z-20 pointer-events-none text-3xl filter drop-shadow-md"
    >
      🍎
    </motion.div>
  );
};

// 辅助组件：爱心涟漪
const HeartRipple = ({ x, y, onComplete }: { x: number, y: number, onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1, x, y }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onComplete}
      className="absolute text-red-500 z-50 pointer-events-none"
    >
      <Heart fill="currentColor" />
    </motion.div>
  );
};

export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen: boolean }) {
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [fallingItems, setFallingItems] = useState<{id: number, x: number, y: number}[]>([]);
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);
  const [selectedApple, setSelectedApple] = useState<{gift: string, blessing: string} | null>(null);

  // 解析礼物列表
  const gifts = useMemo(() => config.giftList.split(/,|，/).filter(s => s.trim() !== ''), [config.giftList]);

  // 处理背景点击（掉落苹果）
  const handleBgClick = (e: React.MouseEvent) => {
    // 只有点在背景上才触发，避免点盒子触发
    const newItem = { id: Date.now(), x: e.clientX, y: e.clientY };
    setFallingItems(prev => [...prev, newItem]);
  };

  // 播放音效（模拟）
  const playSound = () => {
    console.log("Play: Ding!");
  };

  // 处理盒子里的苹果点击
  const handleAppleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    playSound();
    
    // 添加爱心涟漪
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const ripple = { id: Date.now(), x: rect.left + rect.width/2 - 12, y: rect.top + rect.height/2 - 12 };
    setRipples(prev => [...prev, ripple]);

    // 随机获取祝福和礼物
    const blessingLib = BLESSINGS_LIB[config.blessingStyle] || BLESSINGS_LIB.sweet;
    const randomBlessing = blessingLib[index % blessingLib.length];
    const randomGift = gifts[index % gifts.length] || "神秘惊喜";

    // 延迟一点显示弹窗，让动画先飞一会
    setTimeout(() => {
      setSelectedApple({ blessing: randomBlessing, gift: randomGift });
    }, 300);
  };

  // 盒子内容渲染 (重新设计 - 使用图片)
  const renderBoxContent = () => {
    if (!isBoxOpen) {
      return (
        <motion.div
          key="closed-box"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, -2, 2, 0] }}
          transition={{ type: "spring", stiffness: 200, rotate: { repeat: Infinity, duration: 3, repeatDelay: 1 } }}
          className="relative cursor-pointer flex items-center justify-center group"
          onClick={(e) => { e.stopPropagation(); setIsBoxOpen(true); }}
        >
          {/* 礼盒图片 */}
          <motion.img 
            src={ASSETS.boxImage}
            alt="礼盒"
            className="w-64 h-auto md:w-80 object-contain drop-shadow-2xl filter hover:brightness-110 transition-all duration-300"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
          
          {/* 文字 Tag - 悬浮在盒子上方 */}
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute top-[20%] z-20"
          >
             <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-red-100 transform -rotate-3">
               <span className="text-red-600 font-bold text-lg md:text-xl tracking-widest">{config.boxLabel}</span>
             </div>
          </motion.div>

          <div className="absolute -bottom-8 text-white/90 text-sm font-medium tracking-wide bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            点击拆开礼物
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="open-box"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/50 max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {[...Array(9)].map((_, i) => (
            <motion.button
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleAppleClick(e, i)}
              className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg relative group border-2 border-red-300"
            >
              {/* 苹果叶子 */}
              <div className="absolute -top-2 left-1/2 w-4 h-4 bg-green-600 rounded-tr-xl rounded-bl-xl transform -rotate-45 shadow-sm" />
              <span className="text-3xl md:text-4xl filter drop-shadow-md">🍎</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </motion.button>
          ))}
        </div>
        <button 
          className="absolute -top-4 -right-4 bg-white text-red-500 rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
          onClick={(e) => { e.stopPropagation(); setIsBoxOpen(false); }}
        >
          <X size={20} />
        </button>
      </motion.div>
    );
  };

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-cover bg-center transition-all duration-700"
      style={{ 
        backgroundImage: config.bgTheme.startsWith('url') ? config.bgTheme : config.bgTheme,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={handleBgClick}
    >
      {/* 1. 粒子层 */}
      <Particles type={config.effectType} />

      {/* 2. 主体盒子层 */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
        <AnimatePresence mode='wait'>
          {renderBoxContent()}
        </AnimatePresence>
        
        {!isBoxOpen && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="mt-12 md:mt-16 text-white/90 text-sm md:text-base bg-black/30 px-4 py-2 rounded-full backdrop-blur-md shadow-sm pointer-events-none"
           >
             点击屏幕其他位置，收集更多好运苹果
           </motion.div>
        )}
      </div>

      {/* 3. 交互反馈层 */}
      {fallingItems.map(item => (
        <FallingItem 
          key={item.id} x={item.x} y={item.y} 
          onComplete={() => setFallingItems(prev => prev.filter(i => i.id !== item.id))} 
        />
      ))}
      
      {ripples.map(ripple => (
        <HeartRipple 
          key={ripple.id} x={ripple.x} y={ripple.y} 
          onComplete={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))} 
        />
      ))}

      {/* 4. 祝福弹窗 */}
      <AnimatePresence>
        {selectedApple && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[4px]"
            onClick={() => setSelectedApple(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4 border-2 border-red-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">平安喜乐</h3>
              <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{selectedApple.blessing}"</p>
              
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <span className="text-xs text-red-400 block mb-1">获得礼物</span>
                <span className="font-bold text-gray-800 flex items-center justify-center gap-2 text-lg">
                  <Gift size={20} className="text-red-500" /> {selectedApple.gift}
                </span>
              </div>
              
              <button 
                onClick={() => setSelectedApple(null)}
                className="mt-6 px-8 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-red-500/30"
              >
                收下祝福
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ==============================================================================
 * 3. 配置面板组件 (ConfigUI)
 * ==============================================================================
 */

export function ConfigUI({ 
  config, 
  onChange, 
  isOpen, 
  setIsOpen 
}: { 
  config: AppConfig; 
  onChange: (key: string, val: any) => void; 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void 
}) {
  const [mobileExpanded, setMobileExpanded] = useState(true);

  return (
    <>
      {/* PC端侧边栏 (md以上显示) */}
      <div className={`hidden md:flex flex-col fixed left-0 top-0 h-full w-80 bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-2xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/30 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800 font-bold text-xl">
            <Settings2 className="w-6 h-6 text-red-500" />
            <span>定制祝福</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* PC 配置项渲染 */}
          <ConfigSection title="视觉氛围">
            <ConfigItem label={CONFIG_METADATA.bgTheme.label}>
              <select 
                value={config.bgTheme} 
                onChange={(e) => onChange('bgTheme', e.target.value)}
                className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:ring-2 focus:ring-red-300 outline-none"
              >
                {CONFIG_METADATA.bgTheme.options?.map((opt: { value: any; label: any; }) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </ConfigItem>
            
            <ConfigItem label={CONFIG_METADATA.effectType.label}>
              <div className="grid grid-cols-2 gap-2">
                {CONFIG_METADATA.effectType.options?.map((opt: { value: any; label: any; }) => (
                  <button
                    key={opt.value}
                    onClick={() => onChange('effectType', opt.value)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      config.effectType === opt.value 
                      ? 'bg-red-50 border-red-400 text-red-600 font-medium' 
                      : 'bg-white/40 border-transparent hover:bg-white/60 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigItem>
            
            <ConfigItem label={CONFIG_METADATA.boxShape.label}>
              <div className="flex gap-2">
                {CONFIG_METADATA.boxShape.options?.map((opt: { value: any; label: any; }) => (
                   <button
                   key={opt.value}
                   onClick={() => onChange('boxShape', opt.value)}
                   className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                     config.boxShape === opt.value 
                     ? 'bg-red-50 border-red-400 text-red-600' 
                     : 'bg-white/40 border-transparent text-gray-600'
                   }`}
                 >
                   {opt.label}
                 </button>
                ))}
              </div>
            </ConfigItem>
          </ConfigSection>

          <ConfigSection title="内容定制">
            <ConfigItem label={CONFIG_METADATA.boxLabel.label}>
              <input 
                type="text" 
                value={config.boxLabel}
                onChange={(e) => onChange('boxLabel', e.target.value)}
                className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:ring-2 focus:ring-red-300 outline-none"
              />
            </ConfigItem>
            
            <ConfigItem label={CONFIG_METADATA.blessingStyle.label}>
              <select 
                value={config.blessingStyle} 
                onChange={(e) => onChange('blessingStyle', e.target.value)}
                className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:ring-2 focus:ring-red-300 outline-none"
              >
                {CONFIG_METADATA.blessingStyle.options?.map((opt: { value: any; label: any; }) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </ConfigItem>

            <ConfigItem label={CONFIG_METADATA.giftList.label}>
               <textarea 
                value={config.giftList}
                rows={4}
                onChange={(e) => onChange('giftList', e.target.value)}
                className="w-full p-2 rounded-lg bg-white/50 border border-white/60 focus:ring-2 focus:ring-red-300 outline-none text-sm"
              />
            </ConfigItem>
          </ConfigSection>
        </div>
      </div>

      {/* PC端打开按钮 */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed left-6 top-6 z-50 bg-white/80 backdrop-blur p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-red-500"
        >
          <Settings2 />
        </button>
      )}

      {/* 移动端顶部悬浮卡片 (md以下显示) */}
      <div className="md:hidden fixed top-4 inset-x-4 z-[60] flex flex-col gap-2">
        {/* 顶部控制栏 */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 overflow-hidden transition-all duration-300">
           <div 
             className="p-3 flex justify-between items-center cursor-pointer active:bg-white/40"
             onClick={() => setMobileExpanded(!mobileExpanded)}
           >
             <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
               <span className="bg-red-100 p-1.5 rounded-full text-red-500"><Settings2 size={16} /></span>
               <span>场景布置</span>
             </div>
             {mobileExpanded ? <ChevronUp size={18} className="text-gray-500"/> : <ChevronDown size={18} className="text-gray-500"/>}
           </div>

           {/* 展开的配置内容 */}
           <AnimatePresence>
             {mobileExpanded && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden"
               >
                 <div className="p-3 pt-0 grid gap-4">
                   {/* 核心配置快速切换 */}
                   <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-medium">氛围主题</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                        {CONFIG_METADATA.bgTheme.options?.map((opt: { value: any; label: any; }, idx: number) => (
                           <div 
                             key={idx}
                             onClick={() => onChange('bgTheme', opt.value)}
                             className={`w-8 h-8 rounded-full flex-shrink-0 border-2 cursor-pointer ${config.bgTheme === opt.value ? 'border-red-500 scale-110' : 'border-transparent'}`}
                             style={{ 
                               background: opt.value.startsWith('url') ? opt.value : opt.value, 
                               backgroundSize: 'cover', 
                               backgroundPosition: 'center' 
                             }}
                           />
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1">特效</label>
                        <select 
                          className="w-full text-xs p-2 rounded bg-white/50"
                          value={config.effectType}
                          onChange={(e) => onChange('effectType', e.target.value)}
                        >
                          {CONFIG_METADATA.effectType.options?.map((o: { value: any; label: any; }) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1">礼盒动画</label>
                         <select 
                          className="w-full text-xs p-2 rounded bg-white/50"
                          value={config.boxShape}
                          onChange={(e) => onChange('boxShape', e.target.value)}
                        >
                          {CONFIG_METADATA.boxShape.options?.map((o: { value: any; label: any; }) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">寄语</label>
                      <input 
                        className="w-full text-xs p-2 rounded bg-white/50 border border-white/40"
                        value={config.boxLabel}
                        onChange={(e) => onChange('boxLabel', e.target.value)}
                      />
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// 辅助组件：配置块
function ConfigSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// 辅助组件：配置项
function ConfigItem({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

/**
 * ==============================================================================
 * 4. 主入口 (App)
 * ==============================================================================
 */

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // 初始化时检测屏幕大小，移动端默认收起PC侧边栏
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsConfigOpen(false);
    }
  }, []);

  const handleConfigChange = (key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-gray-900 bg-gray-50">
      {/* 渲染层 */}
      <DisplayUI config={config} isPanelOpen={isConfigOpen} />

      {/* 配置层 */}
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isConfigOpen} 
        setIsOpen={setIsConfigOpen} 
      />
    </div>
  );
}