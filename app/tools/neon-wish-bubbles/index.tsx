'use client';

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 1. 核心配置与元数据 (Core Configuration & Metadata)
 * ==============================================================================
 */

export interface AppConfig {
  // 内容类
  wishTexts: string[]; // 许愿文案池
  
  // 视觉动效类
  textDensity: number; // 屏幕文字密度 (5-30)
  floatSpeed: number; // 上浮速度 (1-10)
  glowIntensity: number; // 光效强度 (5-30)
  particleCount: number; // 粒子产生频率 (1-5)
  minFontSize: number; // 最小字体
  maxFontSize: number; // 最大字体

  // 背景类 (通用)
  bgConfig?: StandardBgConfig;
  bgValue?: string; 

  // 音效类 (通用)
  bgMusicUrl: string;
  enableSound: boolean;
}

export const PRESETS = {
  backgrounds: GLOBAL_BG_PRESETS.getToolPresets('neon-wish-bubbles'),
  music: [
    { label: '春风轻语', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/spring-wind.mp3' },
    { label: 'Peaceful Piano', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
  ],
};

export const DEFAULT_CONFIG: AppConfig = {
  // 内容
  wishTexts: [
    // 爱情篇
    '有你在，就是最好的时光',
    '我们要一直在一起',
    '岁岁年年',
    '你在身边',
    '在你身边',
    '吵架了也会好好说话',
    '不会冷战',
    '你懂我的奇奇怪怪',
    '我陪你的可可爱爱',
    '一起看很多次日出日落',
    '一起逛很多次菜市场',
    '不管多久',
    '见你还是会心动',
    '你的偏爱',
    '是我最大的底气',
    '往后余生',
    '风雪是你',
    '平淡是你',
    // 祝福篇
    '三餐四季',
    '平安喜乐',
    '日子安稳',
    '万事胜意',
    '暴富暴瘦',
    '好运连连',
    '每天都有值得开心的小事',
    '失眠退散',
    '一夜好眠',
    '皮肤变好',
    '头发变多',
    '想吃的东西都能吃到',
    '想去的地方都能抵达',
    '工作顺利',
    '少点加班',
    '多点摸鱼时间',
  ],
  
  // 视觉
  textDensity: 12,
  floatSpeed: 3,
  glowIntensity: 15,
  particleCount: 2,
  minFontSize: 24,
  maxFontSize: 64,

  // 背景：蓝粉渐变海上晚霞风格
  bgConfig: createBgConfigWithOverlay(
    { 
      type: 'color' as const, 
      value: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)', 
    },
    0.1
  ),
  bgValue: 'linear-gradient(to bottom, #2c3e50, #4ca1af, #c471ed, #f64f59)', 
  
  // 音效
  bgMusicUrl: PRESETS.music[0].value,
  enableSound: true,
};

export const neonWishBubblesConfigMetadata = {
  panelTitle: '霓虹许愿气泡',
  panelSubtitle: '点亮夜空中的专属祝福',
  configSchema: {
    // 内容分类
    wishTexts: {
      category: 'content' as const,
      type: 'list' as const,
      label: '祝福语录',
      placeholder: '输入祝福语',
      description: '随机显示的祝福文字池，每行一句',
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
    particleCount: {
      category: 'visual' as const,
      type: 'slider' as const,
      label: '粒子密度',
      min: 1,
      max: 5,
      step: 1,
    },
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
      type: 'media-grid' as const,
      label: '背景风格',
      mediaType: 'background' as const,
      defaultItems: PRESETS.backgrounds,
    },
    enableSound: {
      category: 'background' as const,
      type: 'switch' as const,
      label: '启用音效',
    },
    bgMusicUrl: {
      category: 'background' as const,
      type: 'media-picker' as const,
      label: '背景音乐',
      mediaType: 'music' as const,
      defaultItems: PRESETS.music,
    },
  },
  tabs: [
    { id: 'content' as const, label: '祝福', icon: null },
    { id: 'visual' as const, label: '光效', icon: null },
    { id: 'background' as const, label: '环境', icon: null },
  ],
  mobileSteps: [
    { id: 1, label: '写祝福', icon: null, fields: ['wishTexts' as const] },
    { id: 2, label: '调氛围', icon: null, fields: ['textDensity' as const, 'floatSpeed' as const, 'glowIntensity' as const, 'particleCount' as const, 'minFontSize' as const, 'maxFontSize' as const] },
    { id: 3, label: '定背景', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const] },
  ],
};

/**
 * ==============================================================================
 * 2. 粒子类定义 (Particle System)
 * ==============================================================================
 */

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

/**
 * ==============================================================================
 * 3. 漂浮文字类定义 (Floating Text System)
 * ==============================================================================
 */

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

/**
 * ==============================================================================
 * 4. 主显示组件 (DisplayUI)
 * ==============================================================================
 */

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen?: boolean;
  onConfigChange?: (key: string, value: any) => void;
}

export const DisplayUI: React.FC<DisplayUIProps> = ({ config, isPanelOpen }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const textsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<HeartParticle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  
  // 拆分文字池
  const textPool = useMemo(() => {
    if (Array.isArray(config.wishTexts)) {
      return config.wishTexts.filter(t => t.trim() !== '');
    }
    // 兼容旧格式（字符串用 | 分隔）
    if (typeof config.wishTexts === 'string') {
      return (config.wishTexts as string).split('|').filter((t: string) => t.trim() !== '');
    }
    return [];
  }, [config.wishTexts]);

  // 使用音效 Hook
  const {
    isPlaying,
    isMuted,
    handlePlayPause: toggleMusic,
    handleToggleMute: toggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: 0.5,
  });

  // 获取有效的背景配置
  const effectiveBgConfig = useMemo(() => {
    if (config.bgValue) {
      return parseBgValueToConfig(config.bgValue);
    }
    if (config.bgConfig) {
      return config.bgConfig;
    }
    return DEFAULT_CONFIG.bgConfig!;
  }, [config.bgValue, config.bgConfig]);

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
    const initBackgroundTexts = () => {
        const currentBgCount = textsRef.current.filter(t => !t.isInteractive).length;
        const diff = config.textDensity - currentBgCount;
        
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                const text = textPool[Math.floor(Math.random() * textPool.length)];
                const t = new FloatingText(width, height, text, config, false);
                t.y = Math.random() * height; // 初始铺满屏幕
                textsRef.current.push(t);
            }
        } else if (diff < 0) {
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
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = textsRef.current.length - 1; i >= 0; i--) {
        const t = textsRef.current[i];
        
        t.update(height, timeRef.current);

        // 边界检测
        if (t.isInteractive) {
          if (t.isDead(height)) {
            textsRef.current.splice(i, 1);
            continue;
          }
        } else {
          // 背景文字循环
          if (t.y < -t.fontSize) {
            t.y = height + t.fontSize + Math.random() * 100;
            t.baseX = Math.random() * width;
            t.text = textPool[Math.floor(Math.random() * textPool.length)];
          }
        }

        // 生成拖尾粒子
        if (timeRef.current % (6 - Math.min(5, config.particleCount)) === 0) {
            particlesRef.current.push(new HeartParticle(t.x, t.y + t.fontSize/2, '#fbcfe8'));
        }

        // 绘制霓虹文字
        ctx.save();
        ctx.globalAlpha = t.opacity;
        ctx.font = `bold ${t.fontSize}px sans-serif`;
        
        // 第一层：强光晕描边
        ctx.shadowColor = '#ff7eb3'; 
        ctx.shadowBlur = config.glowIntensity * 1.2;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.5)'; 
        ctx.strokeText(t.text, t.x, t.y);

        // 第二层：通透填充
        ctx.shadowBlur = 0; 
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
        ctx.fillText(t.text, t.x, t.y);
        
        // 第三层：核心亮边
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
  }, [config, textPool]);

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

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
      {/* 1. 背景层 */}
      <div className="absolute inset-0 z-0">
        <BackgroundRenderer config={effectiveBgConfig} />
      </div>

      {/* 2. Canvas 层 */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full block pointer-events-auto cursor-pointer touch-none z-10"
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      />

      {/* 3. 提示文案 */}
      <div className="absolute bottom-8 w-full text-center pointer-events-none z-20">
        <p className="text-white/70 text-sm font-light tracking-widest" style={{ textShadow: '0 0 10px rgba(255,192,203, 0.5)' }}>
          点 击 屏 幕 · 许 下 心 愿
        </p>
      </div>

      {/* 4. 音效控制面板 */}
      <AudioControlPanel
        isPlaying={isPlaying}
        isMuted={isMuted}
        onPlayPause={toggleMusic}
        onToggleMute={toggleMute}
        enabled={config.enableSound}
        position="bottom-right"
        size="sm"
      />
    </div>
  );
};

/**
 * ==============================================================================
 * 5. 默认导出（用于独立页面）
 * ==============================================================================
 */

export default function NeonWishBubblesPage() {
  const [config] = useState<AppConfig>(DEFAULT_CONFIG);
  return <DisplayUI config={config} />;
}
