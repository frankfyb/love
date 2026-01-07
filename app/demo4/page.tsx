
'use client';
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// ==========================================
// 1. 类型定义与默认配置 (Architecture)
// ==========================================

/**
 * 浮光祈愿置接口
 */
export interface AppConfig {
  // 内容类
  wishTexts: string; // 许愿文案池，用竖线 | 分隔
  
  // 视觉动效类
  textDensity: number; // 屏幕文字密度 (5-30)
  floatSpeed: number; // 上浮速度 (1-10)
  glowIntensity: number; // 光效强度 (5-30)
  particleCount: number; // 粒子产生频率 (1-5)
  minFontSize: number; // 最小字体
  maxFontSize: number; // 最大字体

  // 背景类 (通用)
  bgValue: string; 

  // 音效类 (通用)
  bgMusicUrl: string;
  enableSound: boolean;
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  // 内容
  wishTexts: '平安喜乐|万事胜意|前程似锦|好运连连|心想事成|未来可期|岁岁平安|暴富暴瘦',
  
  // 视觉
  textDensity: 12,
  floatSpeed: 3,
  glowIntensity: 15,
  particleCount: 2,
  minFontSize: 24,
  maxFontSize: 64,

  // 背景：蓝粉渐变海上晚霞风格
  bgValue: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)', 
  
  // 音效
  bgMusicUrl: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/spring-wind.mp3', // 示例轻音乐
  enableSound: true,
};

/**
 * 配置面板元数据
 */
export const floatingWishesConfigMetadata = {
  panelTitle: '霓虹许愿气泡',
  panelSubtitle: '点亮夜空中的专属祝福',
  configSchema: {
    // 内容分类
    wishTexts: {
      category: 'content' as const,
      type: 'textarea' as const,
      label: '祝福语录',
      placeholder: '输入祝福语，用 | 分隔',
      description: '随机显示的祝福文字池，使用竖线 "|" 分隔不同词条',
    },
    // 视觉分类
    textDensity: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '气泡密度',
      min: 1,
      max: 30,
      step: 1,
      description: '屏幕中同时漂浮的背景文字数量',
    },
    floatSpeed: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '上浮速度',
      min: 1,
      max: 10,
      step: 0.5,
    },
    glowIntensity: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '霓虹强度',
      min: 0,
      max: 50,
      step: 1,
      description: '文字光晕的扩散范围',
    },
    // 字体大小范围
    minFontSize: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '最小字体',
      min: 12,
      max: 40,
      step: 2,
    },
    maxFontSize: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '最大字体',
      min: 40,
      max: 120,
      step: 5,
    },

    // 背景分类
    bgValue: {
      category: 'background' as const,
      type: 'background-picker' as const, // 假设通用面板支持此类
      label: '背景风格',
      defaultItems: [
        { label: '海上晚霞', value: 'linear-gradient(to bottom, #203a43, #2c5364, #ff7e5f, #feb47b)' },
        { label: '梦幻极光', value: 'linear-gradient(to bottom, #000000, #434343, #5e60ce, #6930c3)' },
        { label: '深海幽蓝', value: '#0f172a' },
      ],
    },
    enableSound: {
      category: 'background' as const,
      type: 'switch' as const,
      label: '启用音效',
    },
    bgMusicUrl: {
      category: 'background' as const,
      type: 'text' as const, // 简化为输入框，实际可用 media-picker
      label: '背景音乐URL',
    },
  },
  tabs: [
    { id: 'content' as const, label: '祝福', icon: null },
    { id: 'visual' as const, label: '光效', icon: null },
    { id: 'background' as const, label: '环境', icon: null },
  ],
  mobileSteps: [
    { id: 1, label: '写祝福', fields: ['wishTexts'] },
    { id: 2, label: '调氛围', fields: ['textDensity', 'floatSpeed', 'glowIntensity', 'minFontSize', 'maxFontSize'] },
    { id: 3, label: '定背景', fields: ['bgValue', 'enableSound', 'bgMusicUrl'] },
  ],
};

// ==========================================
// 2. 核心显示组件 (DisplayUI)
// ==========================================

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
  onConfigChange?: (key: string, value: any) => void;
}

// 粒子类定义
class HeartParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2; // 2px - 5px
    this.speedX = (Math.random() - 0.5) * 1;
    this.speedY = Math.random() * 1 + 0.5; // 向下落或飘散
    this.opacity = 1;
    this.fadeSpeed = Math.random() * 0.02 + 0.01;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY; // 粒子轻微下沉或随风
    this.opacity -= this.fadeSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    // 绘制爱心路径
    const x = this.x;
    const y = this.y;
    const s = this.size;
    
    ctx.beginPath();
    ctx.moveTo(x, y + s / 4);
    ctx.quadraticCurveTo(x, y, x + s / 4, y);
    ctx.quadraticCurveTo(x + s / 2, y, x + s / 2, y + s / 4);
    ctx.quadraticCurveTo(x + s / 2, y, x + s * 3/4, y);
    ctx.quadraticCurveTo(x + s, y, x + s, y + s / 4);
    ctx.quadraticCurveTo(x + s, y + s / 2, x + s * 3/4, y + s * 3/4);
    ctx.lineTo(x + s / 2, y + s);
    ctx.lineTo(x + s / 4, y + s * 3/4);
    ctx.quadraticCurveTo(x, y + s / 2, x, y + s / 4);
    ctx.fill();
    
    ctx.restore();
  }
}

// 漂浮文字类定义
class FloatingText {
  text: string;
  x: number;
  y: number;
  baseX: number;
  fontSize: number;
  speed: number;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
  isInteractive: boolean; // true: 点击生成的, false: 背景循环的

  constructor(
    w: number, 
    h: number, 
    text: string, 
    config: AppConfig, 
    isInteractive: boolean = false, 
    startX?: number, 
    startY?: number
  ) {
    this.text = text;
    this.isInteractive = isInteractive;
    
    this.fontSize = Math.random() * (config.maxFontSize - config.minFontSize) + config.minFontSize;
    
    // 如果是点击生成的，位置固定；否则随机
    if (isInteractive && startX !== undefined && startY !== undefined) {
      this.baseX = startX;
      this.y = startY;
      this.opacity = 1;
    } else {
      this.baseX = Math.random() * w;
      this.y = Math.random() * h + h; // 从下方开始或随机分布
      this.opacity = Math.random() * 0.5 + 0.5; // 初始不透明度
    }

    this.x = this.baseX;
    this.speed = (config.floatSpeed * 0.5) + (Math.random() * config.floatSpeed * 0.5) + (this.fontSize / 50); // 大字稍快
    this.swayOffset = Math.random() * 100;
    this.swaySpeed = Math.random() * 0.02 + 0.01;
  }

  update(h: number, time: number) {
    // 向上移动
    this.y -= this.speed;
    
    // 左右摇摆
    this.x = this.baseX + Math.sin(time * this.swaySpeed + this.swayOffset) * 20;

    // 交互生成的会逐渐消失
    if (this.isInteractive) {
      this.opacity -= 0.002;
    }
  }

  isDead(h: number) {
    if (this.isInteractive) {
      return this.opacity <= 0 || this.y < -100;
    }
    return false; // 背景文字在外部循环逻辑处理
  }
}

export const DisplayUI: React.FC<DisplayUIProps> = ({ config, isPanelOpen }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [isPlaying, setIsPlaying] = useState(false);
  const textsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<HeartParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // 拆分文字池
  const textPool = useMemo(() => {
    return config.wishTexts.split('|').filter(t => t.trim() !== '');
  }, [config.wishTexts]);

  // 音频控制
  useEffect(() => {
    if (audioRef.current) {
      if (config.enableSound) {
        // 尝试播放（可能被浏览器阻挡，需要用户交互）
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [config.enableSound, config.bgMusicUrl]);

  // 切换播放状态的手动处理
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  };

  // 初始化画布与动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    // 响应式调整大小
    const resize = () => {
      const parent = containerRef.current;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        // 处理高清屏
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    // 初始化背景文字
    // 只有当当前数量少于配置数量时才添加，避免重置时闪烁
    const initBackgroundTexts = () => {
        const currentBgCount = textsRef.current.filter(t => !t.isInteractive).length;
        const diff = config.textDensity - currentBgCount;
        
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                const text = textPool[Math.floor(Math.random() * textPool.length)];
                // 随机分布在屏幕各个位置，不仅仅是底部
                const t = new FloatingText(width, height, text, config, false);
                t.y = Math.random() * height; // 初始铺满屏幕
                textsRef.current.push(t);
            }
        } else if (diff < 0) {
            // 如果配置减少，随机移除一些背景文字
            let removeCount = Math.abs(diff);
            textsRef.current = textsRef.current.filter(t => {
                if (!t.isInteractive && removeCount > 0) {
                    removeCount--;
                    return false;
                }
                return true;
            });
        }
    };

    initBackgroundTexts();

    // 动画循环
    const animate = () => {
      timeRef.current += 1;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 1. 绘制和更新文字
      // 设置霓虹文字样式
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 遍历倒序，方便移除
      for (let i = textsRef.current.length - 1; i >= 0; i--) {
        const t = textsRef.current[i];
        
        // 更新位置
        t.update(height, timeRef.current);

        // 边界检测
        if (t.isInteractive) {
          if (t.isDead(height)) {
            textsRef.current.splice(i, 1);
            continue;
          }
        } else {
          // 背景文字循环：完全移出顶部后，回到底部
          if (t.y < -t.fontSize) {
            t.y = height + t.fontSize + Math.random() * 100;
            t.baseX = Math.random() * width;
            // 重新随机内容
            t.text = textPool[Math.floor(Math.random() * textPool.length)];
          }
        }

        // 生成拖尾粒子 (简单的频率控制)
        if (timeRef.current % (6 - Math.min(5, config.particleCount)) === 0) {
            // 粒子颜色淡粉色
            particlesRef.current.push(new HeartParticle(t.x, t.y + t.fontSize/2, '#fbcfe8'));
        }

        // 绘制
        ctx.save();
        ctx.globalAlpha = t.opacity;
        ctx.font = `bold ${t.fontSize}px sans-serif`;
        
        // --- 优化后的霓虹效果 ---
        
        // 1. 第一层：强光晕描边 (营造发光氛围)
        // 使用高饱和度粉色，配合模糊，制造霓虹漫射感
        ctx.shadowColor = '#ff7eb3'; 
        ctx.shadowBlur = config.glowIntensity * 1.2; // 增强光晕范围
        ctx.lineWidth = 3;
        // 描边本身半透明，让光晕更柔和
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)'; 
        ctx.strokeText(t.text, t.x, t.y);

        // 2. 第二层：通透填充 (制造玻璃/空气感)
        // 清除阴影，只绘制填充
        ctx.shadowBlur = 0; 
        // 极低透明度的白色，实现"字体透明"效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
        ctx.fillText(t.text, t.x, t.y);
        
        // 3. 第三层：核心亮边 (勾勒清晰轮廓)
        // 使用亮白色细线条，让文字在发光中依然清晰可辨
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'; 
        ctx.strokeText(t.text, t.x, t.y);
        
        ctx.restore();
      }

      // 2. 绘制和更新粒子
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.opacity <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config, textPool]); // 当配置变化时重新建立循环逻辑，但尽量保持状态

  // 点击生成气泡
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const parent = containerRef.current;
    if (!parent) return;

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const rect = parent.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const text = textPool[Math.floor(Math.random() * textPool.length)];
    const newWish = new FloatingText(rect.width, rect.height, text, config, true, x, y);
    
    // 点击生成的稍微大一点，显眼一点
    newWish.fontSize = Math.min(newWish.fontSize * 1.2, config.maxFontSize * 1.2);
    
    textsRef.current.push(newWish);

    // 同时也生成一爆粒子增强点击反馈
    for(let i=0; i<8; i++) {
        particlesRef.current.push(new HeartParticle(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20, '#fff'));
    }

  }, [config, textPool]);

  // 处理背景样式
  const getBackgroundStyle = () => {
    const value = config.bgValue;
    if (value.startsWith('#') || value.startsWith('rgb')) {
      return { backgroundColor: value };
    } else if (value.includes('gradient')) {
      return { backgroundImage: value };
    } else {
      return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none transition-all duration-500`}
      style={getBackgroundStyle()}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* 画布层 */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full block pointer-events-none"
      />

      {/* 音效控件 - 悬浮在右上角 */}
      {config.enableSound && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 transition-all"
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}

      {/* 音频元素 */}
      <audio 
        ref={audioRef}
        src={config.bgMusicUrl}
        loop
        crossOrigin="anonymous"
      />

      {/* 提示文案 - 仅当没有任何文字时或初始引导 */}
      <div className="absolute bottom-8 w-full text-center pointer-events-none opacity-60">
        <p className="text-white/70 text-sm font-light tracking-widest" style={{ textShadow: '0 0 10px rgba(255,192,203, 0.5)' }}>
          点 击 屏 幕 · 许 下 心 愿
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 3. 宿主环境模拟 (App Component)
// ==========================================

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 模拟配置修改
  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-screen bg-black">
       <DisplayUI 
         config={config} 
         isPanelOpen={isPanelOpen} 
         onConfigChange={handleConfigChange}
       />
    </div>
  );
}