
import React, { useEffect, useState } from 'react';

interface AudioControlPanelProps {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onToggleMute: () => void;
  enabled: boolean;
  position?: 'bottom-right' | 'bottom-center' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 音频控制面板组件 - 可复用的播放/暂停和静音按钮
 * 
 * 支持动态启用/禁用，确保在分享界面正确显示和工作
 * 
 * @example
 * <AudioControlPanel
 *   isPlaying={isPlaying}
 *   isMuted={isMuted}
 *   onPlayPause={handlePlayPause}
 *   onToggleMute={handleToggleMute}
 *   enabled={config.enableSound}
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
}) => {
  // 添加本地状态追踪，确保组件在 enabled 变更时正确响应
  const [isVisible, setIsVisible] = useState(enabled);

  useEffect(() => {
    // 使用微任务队列而不是 requestAnimationFrame，确保更快的初始化
    if (enabled) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  const positionClass = {
    'bottom-right': 'bottom-16 right-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }[position];

  const buttonSize = {
    sm: 'p-2.5 w-10 h-10',
    md: 'p-3 w-12 h-12',
    lg: 'p-4 w-14 h-14',
  }[size];

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className={`fixed ${positionClass} z-50 flex items-center gap-2 transition-opacity duration-300 opacity-100`}>
      {/* 播放/暂停按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        className={`${buttonSize} hover:bg-white/20 rounded-full transition-colors text-white flex items-center justify-center shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 hover:scale-110`}
        title={isPlaying ? '暂停' : '播放'}
        aria-label={isPlaying ? '暂停' : '播放'}
        type="button"
      >
        {isPlaying ? (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* 静音按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className={`${buttonSize} hover:bg-white/20 rounded-full transition-colors text-white flex items-center justify-center shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 hover:scale-110`}
        title={isMuted ? '取消静音' : '静音'}
        aria-label={isMuted ? '取消静音' : '静音'}
        type="button"
      >
        {isMuted ? (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6 9.4L12 13.9 7.4 9.4 5.9 10.9 10.5 15.5 5.9 20.1l1.5 1.5L12 17.1l4.6 4.5 1.5-1.5L13.5 15.5l4.6-4.6-1.5-1.5z" />
            <path d="M3 9v6h4l5 5v-16l-5 5H3z" />
          </svg>
        ) : (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AudioControlPanel;
