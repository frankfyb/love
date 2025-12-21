'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Settings, X, Heart, Minimize2, Maximize2, Sparkles, User, Palette, Zap } from 'lucide-react';

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
  // 视觉设置
  bgTheme: 'deepSpace' | 'midnightPurple' | 'nebulaRed';
  starCount: number;      // 粒子数量
  galaxyColor: string;    // 银河主色调
  
  // 交互设置
  basePulseSpeed: number; // 基础呼吸速度
  activePulseSpeed: number; // 按压时速度
  
  // 浪漫内容
  name1: string;
  name2: string;
  centerText: string;
  showDoubleStar: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  bgTheme: 'deepSpace',
  starCount: 1500,
  galaxyColor: '#a0c4ff',
  basePulseSpeed: 1.0,
  activePulseSpeed: 4.0,
  name1: 'Orion',
  name2: 'Artemis',
  centerText: '按住屏幕，感受宇宙的脉动',
  showDoubleStar: true,
};

// 添加通用配置元数据
export const galaxyWeaverConfigMetadata = {
  panelTitle: '银河工坊',
  panelSubtitle: 'Galaxy Weaver',
  tabs: [
    { id: "visual" as const, label: '视觉', icon: null },
    { id: "content" as const, label: '内容', icon: null },
    { id: "scene" as const, label: '场景', icon: null },
  ],
  configSchema: {
    bgTheme: {
      label: '宇宙氛围',
      type: 'select' as const,
      options: [
        { label: '深空蓝', value: 'deepSpace' },
        { label: '午夜紫', value: 'midnightPurple' },
        { label: '星云红', value: 'nebulaRed' },
      ],
      category: 'scene' as const,
    },
    galaxyColor: {
      label: '星光色调',
      type: 'color' as const,
      category: 'visual' as const,
    },
    starCount: {
      label: '繁星数量',
      type: 'slider' as const,
      min: 500,
      max: 3000,
      step: 100,
      category: 'visual' as const,
    },
    name1: {
      label: '名字 A',
      type: 'input' as const,
      category: 'content' as const,
    },
    name2: {
      label: '名字 B',
      type: 'input' as const,
      category: 'content' as const,
    },
    centerText: {
      label: '引导文案',
      type: 'input' as const,
      category: 'content' as const,
    },
    showDoubleStar: {
      label: '显示双星环绕',
      type: 'switch' as const,
      category: 'content' as const,
    },
    basePulseSpeed: {
      label: '静息心率',
      type: 'slider' as const,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      category: 'scene' as const,
    },
    activePulseSpeed: {
      label: '激动心率',
      type: 'slider' as const,
      min: 2.0,
      max: 10.0,
      step: 0.5,
      category: 'scene' as const,
    },
  },
};

/**
 * ==============================================================================
 * 2. 核心展示组件 (DisplayUI)
 * 使用 Canvas 进行高性能渲染
 * ==============================================================================
 */

interface Star {
  x: number;
  y: number;
  z: number; // 深度
  size: number;
  baseAlpha: number;
  blinkOffset: number;
  vx: number; // 速度
  vy: number;
  targetX?: number; // 星座模式下的目标X
  targetY?: number; // 星座模式下的目标Y
}

interface DisplayUIProps {
  config: AppConfig;
  isPanelOpen: boolean;
}

export function DisplayUI({ config, isPanelOpen }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 状态变量 refs (避免闭包问题)
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef(0);
  const pulseIntensityRef = useRef(0); // 当前脉动强度 0-1
  const dimensionsRef = useRef({ w: 0, h: 0 });

  // 背景样式映射
  const bgGradient = useMemo(() => {
    switch (config.bgTheme) {
      case 'midnightPurple': return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
      case 'nebulaRed': return 'linear-gradient(to bottom, #1a0b0b, #4a192c, #1a0b0b)';
      case 'deepSpace':
      default: return 'linear-gradient(to bottom, #020024, #090979, #00d4ff00)'; // 极深蓝到透明
    }
  }, [config.bgTheme]);

  // 初始化星星
  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < config.starCount; i++) {
      // 银河分布逻辑：主要集中在对角线或中心带
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(width, height) * 0.8; // 散布半径
      
      // 使用正态分布让星星聚集在中间形成“银河”
      const u = Math.random();
      const v = Math.random();
      const gaussian = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      
      const x = width / 2 + gaussian * (width / 3);
      const y = height / 2 + (Math.random() - 0.5) * height; // 纵向弥散

      stars.push({
        x: x,
        y: y,
        z: Math.random() * 2, 
        size: Math.random() * 2 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3,
        blinkOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }
    starsRef.current = stars;
  }, [config.starCount]);

  // 计算心形坐标 (用于长按星座效果)
  const getHeartPosition = (index: number, total: number, width: number, height: number, scale: number) => {
    const t = (index / total) * Math.PI * 2;
    // 心形参数方程
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return {
      x: width / 2 + x * scale,
      y: height / 2 + y * scale
    };
  };

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 更新时间
    const targetSpeed = isPressed ? config.activePulseSpeed : config.basePulseSpeed;
    // 平滑过渡速度
    const currentSpeed = config.basePulseSpeed + (targetSpeed - config.basePulseSpeed) * pulseIntensityRef.current;
    timeRef.current += 0.01 * currentSpeed;

    // 更新脉动强度 (按压时 lerp 到 1)
    const targetIntensity = isPressed ? 1.0 : 0.0;
    pulseIntensityRef.current += (targetIntensity - pulseIntensityRef.current) * 0.05;

    // 心跳计算 (sin wave)
    const heartbeat = Math.sin(timeRef.current * 3) * 0.5 + 0.5; // 0 to 1
    const galaxyScale = 1 + heartbeat * 0.05 * pulseIntensityRef.current; // 银河随心跳轻微缩放

    // 绘制星星
    starsRef.current.forEach((star, i) => {
      // 1. 位置更新
      let currentX = star.x;
      let currentY = star.y;

      if (longPressTriggered) {
        // 星座模式：飞向心形
        if (!star.targetX || !star.targetY) {
          const pos = getHeartPosition(i, starsRef.current.length, width, height, Math.min(width, height) / 40);
          star.targetX = pos.x + (Math.random() - 0.5) * 20; // 稍微抖动
          star.targetY = pos.y + (Math.random() - 0.5) * 20;
        }
        // Lerp to target
        star.x += (star.targetX - star.x) * 0.05;
        star.y += (star.targetY! - star.y) * 0.05;
        currentX = star.x;
        currentY = star.y;
      } else {
        // 银河模式：自然漂移 + 震动
        star.targetX = undefined; // reset
        star.x += star.vx;
        star.y += star.vy;
        
        // 边界循环
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // 震动效果 (随心跳)
        const shake = isPressed ? (Math.random() - 0.5) * 5 : 0;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 应用缩放 (模拟宇宙呼吸)
        currentX = centerX + (star.x - centerX) * galaxyScale + shake;
        currentY = centerY + (star.y - centerY) * galaxyScale + shake;
      }

      // 2. 绘制
      const alphaPulse = Math.sin(timeRef.current * 2 + star.blinkOffset) * 0.5 + 0.5;
      const finalAlpha = star.baseAlpha * alphaPulse * (isPressed ? 1.5 : 1);
      
      ctx.beginPath();
      ctx.fillStyle = config.galaxyColor;
      ctx.globalAlpha = Math.min(finalAlpha, 1);
      ctx.arc(currentX, currentY, star.size * (isPressed ? 1.5 : 1), 0, Math.PI * 2);
      ctx.fill();

      // 长按时连接线条 (星座效果)
      if (longPressTriggered && i % 10 === 0) {
        const nextStar = starsRef.current[(i + 10) % starsRef.current.length];
        const dist = Math.hypot(nextStar.x - currentX, nextStar.y - currentY);
        if (dist < 50) {
          ctx.beginPath();
          ctx.strokeStyle = config.galaxyColor;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 0.5;
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(nextStar.x, nextStar.y);
          ctx.stroke();
        }
      }
    });

    // 绘制双星环绕 (如果开启)
    if (config.showDoubleStar && !longPressTriggered) {
      const centerX = width / 2;
      const centerY = height / 2;
      const orbitRadius = 80 + heartbeat * 10;
      const angle1 = timeRef.current * 0.5;
      const angle2 = angle1 + Math.PI;

      const drawPlanet = (angle: number, name: string, color: string) => {
        const px = centerX + Math.cos(angle) * orbitRadius;
        const py = centerY + Math.sin(angle) * orbitRadius;
        
        // 轨迹
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 行星本体
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.globalAlpha = 1;
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 名字标签
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, px, py - 15);
      };

      drawPlanet(angle1, config.name1, '#ff9a9e');
      drawPlanet(angle2, config.name2, '#a18cd1');
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [config, isPressed, longPressTriggered]);

  // 尺寸监听与初始化
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        dimensionsRef.current = { w: window.innerWidth, h: window.innerHeight };
        initStars(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [initStars]);

  // 启动动画
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // 交互处理
  const handleStart = () => {
    setIsPressed(true);
    // 长按 3秒 触发星座
    pressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
    }, 3000);
  };

  const handleEnd = () => {
    setIsPressed(false);
    setLongPressTriggered(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden select-none touch-none"
      style={{ background: bgGradient, zIndex: 0 }}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* 浮动文案层 (不影响点击Canvas) */}
      <div className="absolute bottom-20 left-0 w-full text-center pointer-events-none transition-opacity duration-500"
           style={{ opacity: isPanelOpen ? 0 : 1 }}>
        <p className={`text-white text-opacity-80 text-lg tracking-widest font-light 
                      ${isPressed ? 'animate-pulse scale-110' : ''} transition-all`}>
          {longPressTriggered ? "❤ 我们的星座已连结 ❤" : config.centerText}
        </p>
        <p className="text-white text-opacity-40 text-xs mt-2">
          {isPressed ? (longPressTriggered ? "" : "正在汇聚星光...") : "长按 3 秒汇聚星河"}
        </p>
      </div>
    </div>
  );
}

/**
 * ==============================================================================
 * 3. 主页面入口 (Main Page)
 * ==============================================================================
 */

export default function GalaxyWeaverPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      <DisplayUI config={config} isPanelOpen={isPanelOpen} />
    </div>
  );
}