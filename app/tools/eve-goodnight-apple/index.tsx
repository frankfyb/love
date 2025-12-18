
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Settings2, X, ChevronUp, Star, Heart, Sparkles, Upload, Cloud, Moon } from 'lucide-react';

// --- 1. 类型定义与默认配置 (Core Configuration) ---

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

export const CONFIG_METADATA = {
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

// --- 2. 内部图形组件 (SVG Assets) ---

const CartoonGirl = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
    <rect x="40" y="80" width="120" height="60" rx="15" fill="#f0f0f0" />
    <path d="M 20 140 Q 100 120 180 140 L 180 200 L 20 200 Z" fill="#ffb7b2" />
    <path d="M 20 150 Q 100 130 180 150" fill="none" stroke="#ff9e99" strokeWidth="3" strokeDasharray="10 5" />
    <circle cx="100" cy="90" r="35" fill="#ffe0bd" />
    <path d="M 65 90 Q 60 50 100 50 Q 140 50 135 90 C 140 110 120 125 100 125 C 80 125 60 110 65 90" fill="#3e2723" />
    <path d="M 85 95 Q 90 98 95 95" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round" />
    <path d="M 105 95 Q 110 98 115 95" fill="none" stroke="#3e2723" strokeWidth="2" strokeLinecap="round" />
    <path d="M 70 65 Q 100 30 130 65" fill="#b39ddb" />
    <circle cx="130" cy="65" r="8" fill="#fff" />
  </svg>
);

// 升级版：拟人化苹果 (支持大小 prop, 支持点击变表情)
const PeaceApple = ({ 
  label, 
  isGlowing, 
  size, 
  onClick 
}: { 
  label: string, 
  isGlowing: boolean, 
  size: number, 
  onClick: () => void 
}) => {
  const controls = useAnimation();
  const [isHappy, setIsHappy] = useState(false);

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    });
  }, [controls]);

  const handleClick = () => {
    setIsHappy(true);
    onClick();
    setTimeout(() => setIsHappy(false), 3000); // 3秒后恢复
  };

  return (
    <motion.div
      className="relative cursor-pointer group select-none"
      style={{ width: `${12 * size}rem`, height: `${12 * size}rem` }} // 自定义大小
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, rotate: [0, -10, 10, 0] }}
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-pink-400 blur-3xl"
        animate={{ opacity: isGlowing ? [0.2, 0.5, 0.2] : 0 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl relative z-10">
        <path d="M 50 20 Q 55 5 65 5" fill="none" stroke="#5d4037" strokeWidth="4" strokeLinecap="round" />
        <path d="M 52 20 Q 70 5 80 20 Q 70 35 52 20" fill="#66bb6a" />
        <path d="M 50 30 C 20 30 10 50 10 75 C 10 100 30 110 50 110 C 70 110 90 100 90 75 C 90 50 80 30 50 30" fill="#ef5350" />
        <ellipse cx="30" cy="55" rx="5" ry="10" fill="white" fillOpacity="0.4" transform="rotate(-20 30 55)" />
        
        {/* 表情变化逻辑 */}
        {isHappy ? (
          <>
            {/* 开心的眼睛 ^ ^ */}
            <path d="M 25 70 L 30 65 L 35 70" fill="none" stroke="#3e2723" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 65 70 L 70 65 L 75 70" fill="none" stroke="#3e2723" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* 开心的嘴巴 (张开) */}
            <path d="M 35 80 Q 50 95 65 80 Z" fill="#3e2723" />
          </>
        ) : (
          <>
            {/* 普通眼睛 */}
            <circle cx="35" cy="65" r="3" fill="#3e2723" />
            <circle cx="65" cy="65" r="3" fill="#3e2723" />
            {/* 微笑嘴巴 */}
            <path d="M 35 75 Q 50 85 65 75" fill="none" stroke="#3e2723" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        
        <ellipse cx="30" cy="78" rx="4" ry="2" fill="#ffcdd2" opacity="0.6" />
        <ellipse cx="70" cy="78" rx="4" ry="2" fill="#ffcdd2" opacity="0.6" />
      </svg>
      
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-red-800 text-sm font-bold shadow-lg whitespace-nowrap border border-red-100">
        {label}
      </div>
    </motion.div>
  );
};

// 升级版：窗户 (支持 scale prop)
const NightWindow = ({ starDensity, starSpeed, scale }: { starDensity: number, starSpeed: number, scale: number }) => (
  <div 
    className="absolute top-10 right-10 origin-top-right transition-transform duration-500"
    style={{ transform: `scale(${scale})` }}
  >
    <div className="w-40 h-56 bg-[#1a237e] border-4 border-[#5d4037] rounded-t-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
      {/* 玻璃质感反光 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
      
      <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-[#5d4037] z-30" />
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#5d4037] z-30" />
      
      <div className="absolute top-8 right-8 w-12 h-12 bg-yellow-100 rounded-full blur-[1px] opacity-90 shadow-[0_0_20px_rgba(255,255,200,0.6)]" />
      
      {Array.from({ length: Math.floor(starDensity / 5) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: (Math.random() * 2 + 1) / (starSpeed || 1),
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  </div>
);

// --- 3. 配置面板组件 (ConfigUI) ---

export function ConfigUI({
  config,
  onChange,
  isOpen,
  setIsOpen
}: {
  config: AppConfig;
  onChange: (key: string, val: any) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState('basic');

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('customBgUrl', reader.result as string);
        onChange('bgTheme', 'custom'); // 自动切换到自定义模式
      };
      reader.readAsDataURL(file);
    }
  };

  const renderControl = (key: keyof typeof CONFIG_METADATA) => {
    const meta = CONFIG_METADATA[key];
    const value = config[key as keyof AppConfig];

    if (meta.type === 'select' && meta.options) {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{meta.label}</label>
          <div className="flex gap-2 mb-2">
            {meta.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange(key as keyof AppConfig, opt.value)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs transition-all ${
                  value === opt.value
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white/50 hover:bg-white text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* 如果是背景选择，且选了自定义，显示上传按钮 */}
          {key === 'bgTheme' && value === 'custom' && (
             <div className="mt-2">
               <label className="flex items-center justify-center w-full px-4 py-2 bg-white/50 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-white/80 transition">
                 <Upload size={16} className="mr-2 text-gray-600" />
                 <span className="text-xs text-gray-600">点击上传背景图片</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
               </label>
             </div>
          )}
        </div>
      );
    }

    if (meta.type === 'slider') {
      return (
        <div key={key} className="mb-4">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>{meta.label}</span>
            <span className="text-xs opacity-60">{typeof value === 'number' ? value.toFixed(1) : value}</span>
          </div>
          <input
            type="range"
            min={meta.min}
            max={meta.max}
            step={meta.step}
            value={value as number}
            onChange={(e) => onChange(key as keyof AppConfig, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      );
    }

    if (meta.type === 'text') {
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{meta.label}</label>
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(key as keyof AppConfig, e.target.value)}
            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      );
    }
    return null;
  };

  const DesktopDrawer = () => (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      className="fixed left-0 top-0 bottom-0 w-80 bg-white/30 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 hidden md:flex flex-col"
    >
      <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/10">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings2 size={20} /> 平安夜工坊
        </h2>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/30 rounded-full">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Sparkles size={12}/> 氛围设置</h3>
          {renderControl('bgTheme')}
          {renderControl('windowScale')}
          {renderControl('starDensity')}
          {renderControl('starSpeed')}
        </section>
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Sparkles size={12}/> 礼物定制</h3>
          {renderControl('giftType')}
          {renderControl('appleSize')}
          {renderControl('haloIntensity')}
        </section>
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Settings2 size={12}/> 祝福文案</h3>
          {renderControl('appleLabel')}
          {renderControl('bubbleText')}
          {renderControl('blessingText')}
        </section>
      </div>
    </motion.div>
  );

  const MobileCard = () => (
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 md:hidden flex flex-col items-center pt-2 px-2"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="flex border-b border-white/20">
              {['场景', '礼物', '文案'].map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(idx === 0 ? 'basic' : idx === 1 ? 'gift' : 'text')}
                  className={`flex-1 py-3 text-xs font-bold ${
                    (activeTab === 'basic' && idx === 0) || (activeTab === 'gift' && idx === 1) || (activeTab === 'text' && idx === 2)
                      ? 'bg-white/40 text-red-800'
                      : 'text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {activeTab === 'basic' && (
                <>
                  {renderControl('bgTheme')}
                  {renderControl('windowScale')}
                </>
              )}
              {activeTab === 'gift' && (
                <>
                  {renderControl('appleSize')}
                  {renderControl('haloIntensity')}
                </>
              )}
              {activeTab === 'text' && (
                <>
                  {renderControl('bubbleText')}
                  {renderControl('blessingText')}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-sm text-white font-medium hover:bg-white/30 transition-colors"
      >
        {isOpen ? <ChevronUp size={16} className="rotate-180" /> : <Settings2 size={16} />}
        {isOpen ? '收起配置' : '定制平安果'}
      </button>
    </motion.div>
  );

  return (
    <>
      <DesktopDrawer />
      <MobileCard />
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-6 top-6 z-50 p-3 bg-white/20 backdrop-blur-md rounded-full shadow-lg hidden md:block hover:bg-white/40 transition"
        >
          <Settings2 size={24} className="text-gray-800" />
        </button>
      )}
    </>
  );
}

// --- 4. 核心展示组件 (DisplayUI) ---

export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen: boolean }) {
  const [blessingVisible, setBlessingVisible] = useState(false);
  const [clickEffects, setClickEffects] = useState<{id: number, x: number, y: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 背景样式逻辑
  const bgStyle = () => {
    if (config.bgTheme === 'custom' && config.customBgUrl) {
      return { backgroundImage: `url(${config.customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (config.bgTheme === 'warmRoom') {
      return { background: 'linear-gradient(to bottom, #fff7ed, #ffedd5)' };
    }
    // Deep Night default
    return { background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)' };
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    const id = Date.now();
    setClickEffects(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setClickEffects(prev => prev.filter(p => p.id !== id)), 1000);
  };

  const handleAppleClick = () => {
    setBlessingVisible(true);
    setTimeout(() => setBlessingVisible(false), 3000);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden transition-all duration-1000"
      style={bgStyle()}
      onClick={handleGlobalClick}
    >
      {/* 氛围叠加层：暗角与噪点 (增加电影感) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* 动态流星 (仅在深色模式或自定义模式下出现) */}
      {(config.bgTheme === 'deepNight' || config.bgTheme === 'custom') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute h-0.5 w-24 bg-gradient-to-r from-transparent via-white to-transparent"
            initial={{ top: '10%', left: '80%', opacity: 0, rotate: -45 }}
            animate={{ top: '60%', left: '-10%', opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* 动态星星背景 */}
      {config.bgTheme === 'deepNight' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: config.starDensity }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full shadow-[0_0_4px_white]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{
                duration: Math.random() * 2 / config.starSpeed + 0.5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
              }}
            />
          ))}
        </div>
      )}

      {/* 漂浮的云层 (增加层次感) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
         <motion.div 
            className="absolute top-20 left-0 text-white/40"
            animate={{ x: ['-20%', '120%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
         >
           <Cloud size={120} fill="currentColor" />
         </motion.div>
         <motion.div 
            className="absolute top-40 left-0 text-white/20"
            animate={{ x: ['-20%', '120%'] }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: 20 }}
         >
           <Cloud size={160} fill="currentColor" />
         </motion.div>
      </div>

      {/* 场景层 */}
      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none z-10">
        <NightWindow starDensity={config.starDensity} starSpeed={config.starSpeed} scale={config.windowScale} />
        
        {/* 底部交互区 */}
        <div className="relative w-full h-[45%] bg-gradient-to-t from-white/30 to-white/5 backdrop-blur-sm border-t border-white/20 flex items-end justify-center pb-10 gap-8 md:gap-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          
          <div className="relative w-40 h-40 md:w-56 md:h-56 pointer-events-auto transition-transform hover:scale-105 origin-bottom">
            <CartoonGirl />
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="absolute -top-10 -right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl rounded-bl-none shadow-xl border border-pink-100"
            >
              <p className="text-gray-800 text-sm font-medium whitespace-nowrap">{config.bubbleText}</p>
            </motion.div>
          </div>

          <div className="relative mb-4 md:mb-8 pointer-events-auto z-20 flex items-end">
            <PeaceApple 
              label={config.appleLabel}
              isGlowing={config.haloIntensity > 0}
              size={config.appleSize}
              onClick={handleAppleClick} 
            />
            
            <AnimatePresence>
              {blessingVisible && (
                <motion.div
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: -140, opacity: 1, scale: 1 }}
                  exit={{ y: -160, opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 w-64 text-center pointer-events-none z-50"
                >
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/30">
                    <p className="font-bold text-lg drop-shadow-md">{config.blessingText}</p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-pink-500 rotate-45"></div>
                  </div>
                  {/* 爆开的粒子装饰 */}
                  {[...Array(6)].map((_, i) => (
                     <motion.div
                        key={i}
                        className="absolute top-0 left-1/2 text-yellow-300"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ 
                          x: (Math.random() - 0.5) * 100, 
                          y: (Math.random() - 0.5) * 100 - 20, 
                          opacity: 0,
                          scale: 0
                        }}
                        transition={{ duration: 0.8 }}
                     >
                       <Star size={16} fill="currentColor"/>
                     </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 点击反馈特效 */}
      {clickEffects.map(effect => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, scale: 0, rotate: 0 }}
          animate={{ opacity: 0, scale: 2, rotate: 45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute pointer-events-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ left: effect.x, top: effect.y }}
        >
          <Sparkles size={28} />
        </motion.div>
      ))}
    </div>
  );
}

// --- 5. 主入口组件 ---

export default function GoodnightPeaceApple() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsConfigOpen(false);
    }
  }, []);

  const handleConfigChange = (key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none">
      <DisplayUI config={config} isPanelOpen={isConfigOpen} />
      <ConfigUI 
        config={config} 
        onChange={handleConfigChange} 
        isOpen={isConfigOpen} 
        setIsOpen={setIsConfigOpen} 
      />
    </div>
  );
}