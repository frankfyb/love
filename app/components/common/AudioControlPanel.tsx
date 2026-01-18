import React, { useEffect, useState, useCallback } from 'react';

interface AudioControlPanelProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否静音 */
  isMuted: boolean;
  /** 播放/暂停回调 */
  onPlayPause: () => void;
  /** 静音切换回调 */
  onToggleMute: () => void;
  /** 是否启用面板显示 */
  enabled: boolean;
  /** 面板位置 */
  position?: 'bottom-right' | 'bottom-center' | 'top-right' | 'top-left';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否初始展开（可选，用于某些场景） */
  startExpanded?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 音频控制面板组件 - 可复用的播放/暂停和静音按钮
 * 
 * ## 设计原则 (Best Practices)
 * 
 * 1. **用户体验优先**：
 *    - 按钮具有明确的视觉反馈（hover, active 状态）
 *    - 支持键盘导航和无障碍访问
 *    - 动画过渡流畅自然
 * 
 * 2. **灵活配置**：
 *    - 支持多种位置和尺寸配置
 *    - 可通过 className 自定义样式
 * 
 * 3. **性能优化**：
 *    - 使用 useCallback 避免不必要的重渲染
 *    - 条件渲染减少 DOM 节点
 * 
 * @example
 * <AudioControlPanel
 *   isPlaying={isPlaying}
 *   isMuted={isMuted}
 *   onPlayPause={handlePlayPause}
 *   onToggleMute={handleToggleMute}
 *   enabled={true}
 *   position="bottom-right"
 *   size="sm"
 * />
 */
export const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  isPlaying,
  isMuted,
  onPlayPause,
  onToggleMute,
  enabled,
  position = 'bottom-right',
  size = 'sm',
  startExpanded = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 处理显隐动画
  useEffect(() => {
    if (enabled) {
      // 延迟显示，避免闪烁
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // 动画结束后隐藏
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  // 处理按钮点击
  const handlePlayPauseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPlayPause();
  }, [onPlayPause]);

  const handleMuteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleMute();
  }, [onToggleMute]);

  // 如果未启用或不可见，不渲染
  if (!enabled || !isVisible) return null;

  // 位置样式映射
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-16 right-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // 按钮尺寸样式映射
  const buttonSizes: Record<string, string> = {
    sm: 'p-2.5 w-10 h-10',
    md: 'p-3 w-12 h-12',
    lg: 'p-4 w-14 h-14',
  };

  // 图标尺寸样式映射
  const iconSizes: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const positionClass = positionClasses[position] || positionClasses['bottom-right'];
  const buttonSize = buttonSizes[size] || buttonSizes['sm'];
  const iconSize = iconSizes[size] || iconSizes['sm'];

  // 通用按钮样式
  const buttonBaseClass = `
    ${buttonSize}
    rounded-full
    transition-all duration-200 ease-out
    text-white
    flex items-center justify-center
    shrink-0
    bg-white/10 backdrop-blur-sm
    border border-white/20
    hover:bg-white/25 hover:scale-110 hover:border-white/40
    active:scale-95 active:bg-white/30
    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
  `;

  return (
    <div
      className={`
        fixed ${positionClass} z-50 
        flex items-center gap-2 
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
      role="group"
      aria-label="音频控制"
    >
      {/* 播放/暂停按钮 */}
      <button
        onClick={handlePlayPauseClick}
        className={buttonBaseClass}
        title={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        aria-label={isPlaying ? '暂停' : '播放'}
        aria-pressed={isPlaying}
        type="button"
      >
        {isPlaying ? (
          // 暂停图标
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          // 播放图标
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* 静音按钮 */}
      <button
        onClick={handleMuteClick}
        className={buttonBaseClass}
        title={isMuted ? '取消静音' : '静音'}
        aria-label={isMuted ? '取消静音' : '静音'}
        aria-pressed={isMuted}
        type="button"
      >
        {isMuted ? (
          // 静音图标
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63a.996.996 0 00-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
          </svg>
        ) : (
          // 音量图标
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AudioControlPanel;
