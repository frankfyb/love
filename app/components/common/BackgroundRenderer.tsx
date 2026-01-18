'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import type { StandardBgConfig, BgMediaType } from '@/types/background';

interface BackgroundRendererProps {
  config: StandardBgConfig;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 通用背景渲染组件：支持颜色/图片/视频，所有工具复用
 * 特性：
 * - 可配置覆盖层（增加对比度）
 * - 自动视频播放处理
 * - 响应式设计
 */
export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  config,
  className = '',
  style = {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    type,
    value,
    videoAutoPlay = true,
    videoLoop = true,
    videoMuted = true,
    imageFit = 'cover',
    overlayColor = 'rgba(0, 0, 0, 1)',
    overlayOpacity = 0,
  } = config;

  // 视频自动播放逻辑（兼容浏览器策略）
  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;

    const playVideo = async () => {
      try {
        await videoRef.current?.play();
      } catch (e) {
        // 若自动播放失败，绑定点击事件触发播放
        const handleClick = () => {
          videoRef.current?.play();
          document.removeEventListener('click', handleClick);
        };
        document.addEventListener('click', handleClick);
      }
    };

    playVideo();
    return () => {
      videoRef.current?.pause();
    };
  }, [type, value]);

  // 计算覆盖层样式（混混模式优化）
  const overlayStyle = useMemo(() => {
    if (overlayOpacity <= 0) return {};
    return {
      backgroundColor: overlayColor,
      opacity: overlayOpacity,
    };
  }, [overlayColor, overlayOpacity]);

  // 根据类型渲染不同背景
  const renderContent = () => {
    switch (type) {
      case 'color':
        const isGradient = value.includes('gradient');
        return (
          <div
            className={`w-full h-full ${className}`}
            style={{
              ...style,
              [isGradient ? 'backgroundImage' : 'backgroundColor']: value
            }}
          />
        );
      case 'image':
        return (
          <div className={`w-full h-full relative overflow-hidden ${className}`} style={style}>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${value})`,
                backgroundSize: imageFit,
              }}
            />
            {/* 覆盖层 */}
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0"
                style={overlayStyle}
              />
            )}
          </div>
        );
      case 'video':
        return (
          <div className={`w-full h-full relative overflow-hidden ${className}`} style={style}>
            <video
              ref={videoRef}
              src={value}
              autoPlay={videoAutoPlay}
              loop={videoLoop}
              muted={videoMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            {/* 覆盖层 */}
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0"
                style={overlayStyle}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

/**
 * 兼容旧版 bgValue 的包装函数
 * 自动解析 bgValue 为标准化配置，为温和迁移提供节满
 * 
 * @deprecated 新工具请使用 `BackgroundRenderer` 组件
 */
export const LegacyBgRenderer: React.FC<{
  bgValue: string;
  className?: string;
  overlayOpacity?: number;
}> = ({ bgValue, className, overlayOpacity = 0.4 }) => {
  // 自动解析 bgValue 为标准化配置
  const parseBgConfig = (value: string): StandardBgConfig => {
    let type: BgMediaType = 'color';
    if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
      type = 'color';
    } else if (/\.(mp4|webm|ogg|mov)$/i.test(value) || value.includes('/video/')) {
      type = 'video';
    } else if (value) {
      type = 'image';
    }
    return {
      type,
      value,
      videoAutoPlay: true,
      videoLoop: true,
      videoMuted: true,
      overlayOpacity: type === 'image' || type === 'video' ? overlayOpacity : 0,
    };
  };

  return <BackgroundRenderer config={parseBgConfig(bgValue)} className={className} />;
};

/**
 * 批量背景渲染器（支持公共背景库）
 * 用于在辉光效果中存放不同背景
 */
export const MultiBackgroundRenderer: React.FC<{
  configs: StandardBgConfig[];
  activeIndex: number;
  className?: string;
}> = ({ configs, activeIndex, className }) => {
  if (activeIndex < 0 || activeIndex >= configs.length) return null;
  return <BackgroundRenderer config={configs[activeIndex]} className={className} />;
};