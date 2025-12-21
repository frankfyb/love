import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, X, Music, Star, Sparkles, 
  TreePine, Gift, Zap, Moon, Sun, 
  Palette, Smartphone, Heart, CloudSnow, 
  Image as ImageIcon, Smile
} from 'lucide-react';

/**
 * ==============================================================================
 * 1. CONFIGURATION DEFINITIONS & METADATA
 * ==============================================================================
 */

export interface AppConfig {
  // 场景设置
  bgTheme: 'starryNight' | 'romanticPink' | 'northernLights';
  snowDensity: number;   // 0 - 200
  
  // 树木设置
  treeStyle: 'realistic' | 'fantasy' | 'whiteGold';
  treeScale: number;
  glowIntensity: number;
  
  // 交互与音效
  enableSound: boolean;
  
  // 内容
  greetingText: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: 'starryNight',
  snowDensity: 50,
  treeStyle: 'realistic',
  treeScale: 1.0,
  glowIntensity: 10,
  enableSound: true,
  greetingText: 'Merry Christmas, My Love',
};

// 配置元数据
export const CONFIG_METADATA = {
  panelTitle: 'Romantic Christmas Studio',
  panelSubtitle: 'Create Your Magic Moment',
  configSchema: {
    bgTheme: {
      label: '浪漫氛围',
      type: 'select',
      options: [
        { label: '梵高星空 (Starry Night)', value: 'starryNight' },
        { label: '粉色初恋 (Romantic Pink)', value: 'romanticPink' },
        { label: '极光幻境 (Northern Lights)', value: 'northernLights' },
      ],
      category: 'scene',
    },
    snowDensity: { 
      label: '飘雪密度', 
      type: 'slider', 
      min: 0, max: 200, step: 10,
      category: 'scene',
    },
    treeStyle: {
      label: '圣诞树风格',
      type: 'select',
      options: [
        { label: '经典松木 (Classic)', value: 'realistic' },
        { label: '梦幻水晶 (Fantasy)', value: 'fantasy' },
        { label: '白金奢华 (White Gold)', value: 'whiteGold' },
      ],
      category: 'visual',
    },
    treeScale: { 
      label: '树木大小', 
      type: 'slider', 
      min: 0.8, max: 1.4, step: 0.1,
      category: 'visual',
    },
    glowIntensity: { 
      label: '光晕强度', 
      type: 'slider', 
      min: 5, max: 30, step: 1,
      category: 'visual',
    },
    enableSound: {
      label: '开启音效',
      type: 'boolean',
      category: 'interaction',
    },
    greetingText: {
      label: '祝福语',
      type: 'input',
      category: 'content',
    },
  },
  tabs: [
    { id: 'scene', label: '氛围', icon: Moon },
    { id: 'visual', label: '装扮', icon: TreePine },
    { id: 'content', label: '心意', icon: Heart },
  ],
};

/**
 * ==============================================================================
 * 2. CORE UTILITIES & ASSETS
 * ==============================================================================
 */

// 简单的音效合成器
const playSound = (type: 'pop' | 'bell' | 'magic' | 'sparkle') => {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  if (type === 'pop') {
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'bell') {
    // 模拟铃声：多个泛音
    const baseFreq = 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc.start(now);
    osc.stop(now + 1);
  } else if (type === 'magic') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 1.0);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.0);
    osc.start(now);
    osc.stop(now + 1.0);
  }
};

/**
 * ==============================================================================
 * 3. VISUAL COMPONENTS
 * ==============================================================================
 */

// --- Decoration Library ---
const DECORATION_CATEGORIES = [
  { id: 'classic', label: '经典' },
  { id: 'fun', label: '趣味' },
  { id: 'romantic', label: '浪漫' },
];

const DECORATION_TYPES = [
  // Classic
  { id: 'star_gold', category: 'classic', icon: '⭐', label: '金星', color: '#FFD700', type: 'emoji' },
  { id: 'ball_red', category: 'classic', icon: '🔴', label: '红球', color: '#FF4444', type: 'emoji' },
  { id: 'bell_anim', category: 'classic', component: 'Bell', label: '摇铃', color: '#FFA500', type: 'component' },
  { id: 'cane', category: 'classic', icon: '🍬', label: '拐杖糖', color: '#FF69B4', type: 'emoji' },
  
  // Fun
  { id: 'gingerbread', category: 'fun', icon: '🍪', label: '姜饼人', color: '#D2691E', type: 'emoji' },
  { id: 'snowman', category: 'fun', icon: '⛄', label: '雪人', color: '#FFF', type: 'emoji' },
  { id: 'sock', category: 'fun', icon: '🧦', label: '袜子', color: '#FF4444', type: 'emoji' },
  
  // Romantic
  { id: 'heart_anim', category: 'romantic', component: 'HeartPulse', label: '跳动的心', color: '#FF1493', type: 'component' },
  { id: 'ring', category: 'romantic', icon: '💍', label: '钻戒', color: '#E0FFFF', type: 'emoji' },
  { id: 'rose', category: 'romantic', icon: '🌹', label: '玫瑰', color: '#DC143C', type: 'emoji' },
  { id: 'sparkle_anim', category: 'romantic', component: 'Sparkle', label: '闪光', color: '#FFFFE0', type: 'component' },
];

interface Decoration {
  uuid: string;
  typeId: string;
  x: number; 
  y: number; 
  scale: number;
  rotation: number;
}

// --- Dynamic Decoration Components ---
const AnimatedBell = () => (
  <motion.svg viewBox="0 0 24 24" width="32" height="32" stroke="gold" fill="gold" strokeWidth="1"
    animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
    transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.5 }}
  >
    <path d="M12 2C9 2 7 4 7 7v5l-2 4h14l-2-4V7c0-3-2-5-5-5zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
  </motion.svg>
);

const HeartPulse = () => (
  <motion.svg viewBox="0 0 24 24" width="32" height="32" fill="#FF1493" stroke="none"
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ repeat: Infinity, duration: 1.2 }}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </motion.svg>
);

const SparkleAnim = () => (
  <motion.svg viewBox="0 0 24 24" width="32" height="32" fill="#FFFFE0"
    animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
    transition={{ repeat: Infinity, duration: 2 }}
  >
    <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
  </motion.svg>
);

// --- Background Component ---
const RomanticBackground = ({ config }: { config: AppConfig }) => {
  const bgStyle = useMemo(() => {
    switch (config.bgTheme) {
      case 'romanticPink': 
        return 'linear-gradient(to bottom, #2c001e 0%, #681846 40%, #c75a7c 100%)';
      case 'northernLights': 
        return 'linear-gradient(to bottom, #000000 0%, #0B1026 50%, #2B32B2 100%)';
      case 'starryNight': default: 
        return 'linear-gradient(to bottom, #090910 0%, #15162c 50%, #2a2a4e 100%)';
    }
  }, [config.bgTheme]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000"
      style={{ background: bgStyle }}
    >
      {/* 极光层 (仅在极光主题显示) */}
      {config.bgTheme === 'northernLights' && (
        <motion.div 
          className="absolute inset-0 opacity-40 blur-3xl"
          style={{ background: 'conic-gradient(from 0deg at 50% 50%, #00ff87 0deg, #60efff 120deg, #0061ff 240deg, #00ff87 360deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* 飘雪 */}
      {Array.from({ length: config.snowDensity }).map((_, i) => (
        <motion.div
          key={`snow-${i}`}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: ['0vh', '100vh'],
            opacity: [0, 1, 0],
            x: Math.random() * 40 - 20
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        />
      ))}

      {/* 月亮 */}
      <div className="absolute top-10 right-10 opacity-80 mix-blend-screen filter drop-shadow-[0_0_20px_rgba(255,255,200,0.5)]">
         <motion.div
           className="w-20 h-20 rounded-full bg-yellow-100"
           animate={{ boxShadow: ['0 0 20px rgba(255,255,200,0.5)', '0 0 50px rgba(255,255,200,0.8)', '0 0 20px rgba(255,255,200,0.5)'] }}
           transition={{ duration: 4, repeat: Infinity }}
         />
      </div>
    </div>
  );
};

// --- Complex Tree SVG ---
const RealisticTree = ({ config, isLit }: { config: AppConfig; isLit: boolean }) => {
  // 定义三种风格的颜色方案
  const colors = useMemo(() => {
    switch (config.treeStyle) {
      case 'whiteGold':
        return {
          leaves: ['#E0F2F1', '#B2DFDB', '#80CBC4'],
          stroke: isLit ? '#FFD700' : '#B0BEC5',
          trunk: '#5D4037'
        };
      case 'fantasy':
        return {
          leaves: ['#F3E5F5', '#E1BEE7', '#CE93D8'], // 紫色系
          stroke: isLit ? '#00FFFF' : '#BA68C8',
          trunk: '#4A148C'
        };
      case 'realistic': default:
        return {
          leaves: ['#1B5E20', '#2E7D32', '#43A047'], // 经典绿
          stroke: isLit ? '#FFD700' : '#1B5E20',
          trunk: '#3E2723'
        };
    }
  }, [config.treeStyle, isLit]);

  return (
    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-2xl overflow-visible">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="treeGradient" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stopColor={colors.leaves[2]} />
           <stop offset="100%" stopColor={colors.leaves[0]} />
        </linearGradient>
      </defs>

      {/* 树干 */}
      <motion.rect 
        x="90" y="250" width="20" height="40" 
        fill={colors.trunk} 
        rx="2"
      />

      {/* 树叶层叠 - 使用贝塞尔曲线绘制更自然的形态 */}
      <g filter={isLit ? "url(#glow)" : ""}>
        {/* 底层 */}
        <motion.path
          d="M30 250 Q100 270 170 250 L140 180 Q100 190 60 180 Z"
          fill={colors.leaves[0]}
          stroke={colors.stroke}
          strokeWidth="0.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
          style={{ transformOrigin: '100px 250px' }}
        />
        {/* 中层 */}
        <motion.path
          d="M45 180 Q100 200 155 180 L130 120 Q100 130 70 120 Z"
          fill={colors.leaves[1]}
          stroke={colors.stroke}
          strokeWidth="0.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
          style={{ transformOrigin: '100px 180px' }}
        />
        {/* 顶层 */}
        <motion.path
          d="M60 120 Q100 135 140 120 L100 40 Z"
          fill={colors.leaves[2]}
          stroke={colors.stroke}
          strokeWidth="0.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
          style={{ transformOrigin: '100px 120px' }}
        />
      </g>

      {/* 流光灯带 (点亮时显示) */}
      {isLit && (
        <motion.path
          d="M90 50 Q120 80 80 110 T100 170 T70 230"
          fill="none"
          stroke={config.treeStyle === 'fantasy' ? '#00FFFF' : '#FFD700'}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ filter: 'drop-shadow(0 0 5px gold)' }}
        />
      )}
    </svg>
  );
};

// --- Main Tree Container ---
const MagicTree = ({ config, decorations, onAddDecoration, isLit, isZoomed }: any) => {
  return (
    <motion.div
      className="relative z-10 flex items-center justify-center w-full h-full"
      animate={{
        scale: isZoomed ? 1.4 : config.treeScale,
        y: isZoomed ? 150 : 0,
      }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="relative w-[340px] h-[500px] md:w-[450px] md:h-[650px]">
        
        {/* 树体 */}
        <RealisticTree config={config} isLit={isLit} />

        {/* 顶星 */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ 
              rotate: isLit ? 360 : 0,
              scale: isLit ? [1, 1.2, 1] : 1,
              filter: isLit ? 'drop-shadow(0 0 15px #FFD700)' : 'none'
            }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" } }}
          >
            <Star size={48} fill="#FFD700" stroke="none" />
          </motion.div>
        </div>

        {/* 装饰物渲染 */}
        <AnimatePresence>
          {decorations.map((deco: Decoration) => {
            const typeInfo = DECORATION_TYPES.find(t => t.id === deco.typeId);
            return (
              <motion.div
                key={deco.uuid}
                className="absolute cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
                style={{ 
                  left: `${deco.x}%`, 
                  top: `${deco.y}%`,
                  zIndex: 20 
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: deco.scale, 
                  rotate: deco.rotation,
                  filter: isLit ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none'
                }}
                exit={{ scale: 0, opacity: 0 }}
                drag
                dragMomentum={false}
              >
                {typeInfo?.type === 'component' ? (
                  typeInfo.id === 'bell_anim' ? <AnimatedBell /> :
                  typeInfo.id === 'heart_anim' ? <HeartPulse /> :
                  typeInfo.id === 'sparkle_anim' ? <SparkleAnim /> : null
                ) : (
                  <span className="text-3xl filter drop-shadow-md">{typeInfo?.icon}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 点亮时的全屏光效 */}
      {isLit && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ 
              background: `radial-gradient(circle, ${
                config.treeStyle === 'fantasy' ? 'rgba(200,100,255,0.2)' : 'rgba(255,215,0,0.2)'
              } 0%, transparent 70%)` 
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Interactive UI Layer ---
const InteractiveLayer = ({ 
  config, 
  onDragStart, 
  onLightUp, 
  isLit,
  onReset,
  toggleZoom
}: any) => {
  const [activeCategory, setActiveCategory] = useState('classic');

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6">
      
      {/* 顶部标题栏 */}
      <div className="flex justify-center pointer-events-auto">
         {/* 仅在未点亮时显示提示，点亮后显示祝福 */}
         <AnimatePresence mode="wait">
          {!isLit ? (
            <motion.div 
              key="title"
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white"
            >
              <h1 className="font-serif italic text-lg text-yellow-100">Decorate with Love</h1>
            </motion.div>
          ) : (
            <motion.div
              key="greeting"
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="mt-12 text-center"
            >
              <h2 className="text-4xl md:text-6xl font-script text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 drop-shadow-[0_0_15px_rgba(255,105,180,0.6)]" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                {config.greetingText}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右侧装饰栏 - 分类显示 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-end gap-2 pr-2">
        
        {/* 分类 Tabs */}
        <div className="flex flex-col gap-2 mr-2 mb-2">
          {DECORATION_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                activeCategory === cat.id 
                  ? 'bg-pink-500 text-white shadow-lg scale-110' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat.id === 'classic' && <TreePine size={18} />}
              {cat.id === 'fun' && <Smile size={18} />}
              {cat.id === 'romantic' && <Heart size={18} />}
            </button>
          ))}
        </div>

        {/* 装饰物列表 */}
        <div className="bg-black/40 backdrop-blur-xl rounded-l-2xl border-l border-white/10 p-3 flex flex-col gap-3 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {DECORATION_TYPES.filter(d => d.category === activeCategory).map((item) => (
            <motion.div
              key={item.id}
              className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-xl text-2xl cursor-grab active:cursor-grabbing hover:bg-white/20 transition-colors border border-white/5"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.9 }}
              onPointerDown={(e) => onDragStart(e, item)}
              title={item.label}
            >
              {item.type === 'component' ? (
                // 预览时稍微缩小组件
                <div className="scale-75 pointer-events-none">
                  {item.id === 'bell_anim' && <AnimatedBell />}
                  {item.id === 'heart_anim' && <HeartPulse />}
                  {item.id === 'sparkle_anim' && <SparkleAnim />}
                </div>
              ) : (
                item.icon
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="flex justify-center items-end gap-6 pointer-events-auto mb-8">
        <button 
          onClick={toggleZoom}
          className="p-4 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition border border-white/10"
          title="Zoom View"
        >
          <Smartphone className="w-6 h-6" />
        </button>
        
        <motion.button
          onClick={onLightUp}
          className={`px-10 py-4 rounded-full font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-3 transition-all duration-500 ${
            isLit 
              ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white scale-110' 
              : 'bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-100 border border-yellow-500/30 hover:border-yellow-500/60'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className={`w-6 h-6 ${isLit ? 'fill-white' : 'fill-yellow-400'}`} />
          {isLit ? 'Magic ON' : 'Light Up'}
        </motion.button>

        <button 
          onClick={onReset}
          className="p-4 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-red-500/20 transition border border-white/10"
          title="Clear All"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export function DisplayUI({ config, isPanelOpen }: { config: AppConfig; isPanelOpen: boolean }) {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [activeDrag, setActiveDrag] = useState<any>(null);
  const [isLit, setIsLit] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 拖拽逻辑
  const handleDragStart = (e: React.PointerEvent, item: any) => {
    e.preventDefault();
    if(config.enableSound) playSound('pop');
    setActiveDrag({
      item,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeDrag) {
      setActiveDrag({
        ...activeDrag,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      // 放置判定范围
      if (xPercent > 10 && xPercent < 90 && yPercent > 5 && yPercent < 95) {
        if(config.enableSound) playSound('bell');
        const newDeco: Decoration = {
          uuid: Math.random().toString(36).substr(2, 9),
          typeId: activeDrag.item.id,
          x: xPercent,
          y: yPercent,
          scale: 1,
          rotation: Math.random() * 20 - 10
        };
        setDecorations(prev => [...prev, newDeco]);
      }
      
      setActiveDrag(null);
    }
  };

  const handleLightUp = () => {
    if(config.enableSound) playSound('magic');
    setIsLit(!isLit);
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden select-none touch-none ${isPanelOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setActiveDrag(null)}
    >
      <RomanticBackground config={config} />
      
      <MagicTree 
        config={config} 
        decorations={decorations} 
        isLit={isLit}
        isZoomed={isZoomed}
      />

      <InteractiveLayer 
        config={config}
        onDragStart={handleDragStart}
        onLightUp={handleLightUp}
        isLit={isLit}
        onReset={() => {
          setDecorations([]);
          setIsLit(false);
        }}
        toggleZoom={() => setIsZoomed(!isZoomed)}
      />

      {/* 拖拽中的幽灵元素 */}
      {activeDrag && (
        <div 
          className="fixed pointer-events-none text-4xl z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-80"
          style={{ left: activeDrag.x, top: activeDrag.y }}
        >
           {activeDrag.item.type === 'component' ? (
                <div className="scale-100">
                  {activeDrag.item.id === 'bell_anim' && <AnimatedBell />}
                  {activeDrag.item.id === 'heart_anim' && <HeartPulse />}
                  {activeDrag.item.id === 'sparkle_anim' && <SparkleAnim />}
                </div>
              ) : (
                activeDrag.item.icon
              )}
        </div>
      )}
    </div>
  );
}

/**
 * ==============================================================================
 * 4. CONFIGURATION UI COMPONENT
 * ==============================================================================
 */

function ConfigUI({ 
  config, 
  onConfigChange, 
  isOpen, 
  onClose 
}: { 
  config: AppConfig; 
  onConfigChange: (newConfig: AppConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState('scene');

  const updateConfig = (key: keyof AppConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* 配置面板 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-gray-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 flex flex-col text-gray-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-pink-900/20 to-purple-900/20">
              <div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                  {CONFIG_METADATA.panelTitle}
                </h2>
                <p className="text-xs text-gray-400">{CONFIG_METADATA.panelSubtitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {CONFIG_METADATA.tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id ? 'text-pink-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Config Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {Object.entries(CONFIG_METADATA.configSchema)
                .filter(([_, schema]) => schema.category === activeTab)
                .map(([key, schema]: [string, any]) => (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">{schema.label}</label>
                      {schema.type === 'slider' && (
                        <span className="text-xs font-mono text-pink-400">
                          {(config as any)[key]}
                        </span>
                      )}
                    </div>

                    {schema.type === 'slider' && (
                      <input
                        type="range"
                        min={schema.min}
                        max={schema.max}
                        step={schema.step}
                        value={(config as any)[key]}
                        onChange={(e) => updateConfig(key as keyof AppConfig, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    )}

                    {schema.type === 'select' && (
                      <div className="grid grid-cols-1 gap-2">
                        {schema.options.map((opt: any) => (
                          <button
                            key={opt.value}
                            onClick={() => updateConfig(key as keyof AppConfig, opt.value)}
                            className={`px-4 py-3 rounded-xl text-sm text-left transition-all border ${
                              (config as any)[key] === opt.value
                                ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                                : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {schema.type === 'boolean' && (
                      <div 
                        onClick={() => updateConfig(key as keyof AppConfig, !(config as any)[key])}
                        className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                          (config as any)[key] ? 'bg-pink-600' : 'bg-gray-700'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                            (config as any)[key] ? 'translate-x-7' : 'translate-x-0'
                          }`} 
                        />
                      </div>
                    )}

                    {schema.type === 'input' && (
                      <input
                        type="text"
                        value={(config as any)[key]}
                        onChange={(e) => updateConfig(key as keyof AppConfig, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                        placeholder="Type here..."
                      />
                    )}
                  </div>
                ))}
            </div>
            
             <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
               Made with ❤️ for Christmas
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * ==============================================================================
 * 5. MAIN PAGE
 * ==============================================================================
 */

export default function ChristmasGeneratorPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Settings Trigger */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="absolute top-6 left-6 z-30 p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/10 transition-all hover:rotate-90 shadow-lg group"
      >
        <Settings className="w-6 h-6 text-gray-300 group-hover:text-white" />
      </button>

      {/* Main Display Layer */}
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />

      {/* Configuration Panel Layer */}
      <ConfigUI 
        config={config} 
        onConfigChange={setConfig} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}