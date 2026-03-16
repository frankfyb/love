import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 音频控制 Hook - 为任何工具提供音乐播放、暂停、静音功能
 * 
 * ## 设计原则 (Best Practices)
 * 
 * 1. **背景音乐与交互音效分离**：
 *    - `enabled` 参数仅控制是否显示控制面板和初始化行为
 *    - 背景音乐始终可以通过控制面板手动播放
 *    - 交互音效（如烟花声）由各工具的 SoundManager 独立控制
 * 
 * 2. **浏览器自动播放政策兼容**：
 *    - 首次播放需要用户交互触发
 *    - 使用 `autoPlay` 参数控制是否尝试自动播放
 *    - 自动播放失败时静默处理，等待用户手动触发
 * 
 * 3. **状态持久化**：
 *    - 音乐 URL 变化时保持播放状态
 *    - 组件卸载时自动清理资源
 * 
 * @example
 * // 基础用法 - 背景音乐始终可控
 * const { isPlaying, handlePlayPause } = useAudioControl({
 *   musicUrl: 'https://example.com/music.mp3',
 *   enabled: true,
 *   volume: 0.5
 * });
 * 
 * @example
 * // 进阶用法 - 禁用自动播放，仅手动控制
 * const { isPlaying, handlePlayPause } = useAudioControl({
 *   musicUrl: config.bgMusicUrl,
 *   enabled: true,
 *   volume: 0.5,
 *   autoPlay: false  // 禁用自动播放
 * });
 */

interface UseAudioControlProps {
  /** 音乐文件 URL */
  musicUrl: string;
  /** 是否启用音频控制（控制面板显示和初始化） */
  enabled: boolean;
  /** 音量 (0-1) */
  volume: number;
  /** 
   * 是否尝试自动播放（默认 true）
   * 注意：受浏览器自动播放政策限制，可能会被阻止
   */
  autoPlay?: boolean;
  /** 是否循环播放（默认 true） */
  loop?: boolean;
}

export function useAudioControl({
  musicUrl,
  enabled,
  volume,
  autoPlay = true,
  loop = true
}: UseAudioControlProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasUserInteractedRef = useRef(false);
  const currentUrlRef = useRef<string>('');

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = loop;
      audio.preload = 'auto';

      // 监听加载完成
      audio.addEventListener('canplaythrough', () => {
        setIsReady(true);
      });

      // 监听播放结束（非循环模式）
      audio.addEventListener('ended', () => {
        if (!loop) {
          setIsPlaying(false);
        }
      });

      // 监听播放错误
      audio.addEventListener('error', (e) => {
        console.warn('Audio loading error:', e);
        setIsPlaying(false);
      });

      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [loop]);

  // 更新音乐源
  useEffect(() => {
    if (!audioRef.current || !musicUrl) return;

    // URL 发生变化时更新源
    if (currentUrlRef.current !== musicUrl) {
      const wasPlaying = isPlaying;

      // 停止当前播放
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }

      currentUrlRef.current = musicUrl;
      audioRef.current.src = musicUrl;
      audioRef.current.currentTime = 0;
      setIsReady(false);

      // 如果之前在播放，加载完成后继续播放
      if (wasPlaying) {
        audioRef.current.addEventListener('canplaythrough', () => {
          tryPlay();
        }, { once: true });
      }
    }
  }, [musicUrl]);

  // 自动播放逻辑
  useEffect(() => {
    if (!audioRef.current || !musicUrl || !enabled || !autoPlay) return;
    if (!isReady) return;

    // 只在首次加载且启用自动播放时尝试
    if (audioRef.current.paused && autoPlay) {
      tryPlay();
    }
  }, [musicUrl, enabled, autoPlay, isReady]);

  // 管理音量
  useEffect(() => {
    if (audioRef.current) {
      // 应用音量（考虑静音状态）
      audioRef.current.volume = isMuted ? 0 : Math.min(Math.max(volume, 0), 1);
    }
  }, [volume, isMuted]);

  // 尝试播放音频
  const tryPlay = useCallback(() => {
    if (!audioRef.current || !musicUrl) return Promise.resolve(false);

    return audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        hasUserInteractedRef.current = true;
        return true;
      })
      .catch(e => {
        // 自动播放被阻止是正常行为，不需要报错
        if (e.name === 'NotAllowedError') {
          console.log('Audio autoplay blocked. Waiting for user interaction.');
        } else {
          console.warn('Audio play failed:', e);
        }
        setIsPlaying(false);
        return false;
      });
  }, [musicUrl]);

  // 播放/暂停切换
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !musicUrl) return;

    if (audioRef.current.paused) {
      tryPlay();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [musicUrl, tryPlay]);

  // 静音/取消静音
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(Math.max(newVolume, 0), 1);
    }
  }, []);

  // 跳转到指定时间
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return {
    /** 音频元素引用 */
    audioRef,
    /** 是否正在播放 */
    isPlaying,
    /** 是否静音 */
    isMuted,
    /** 音频是否已加载就绪 */
    isReady,
    /** 播放/暂停切换 */
    handlePlayPause,
    /** 静音/取消静音切换 */
    handleToggleMute,
    /** 设置音量 */
    setVolume,
    /** 跳转到指定时间 */
    seekTo,
  };
}
