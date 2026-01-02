import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 音频控制 Hook - 为任何工具提供音乐播放、暂停、静音功能
 * 
 * @example
 * const { audioRef, isPlaying, isMuted, handlePlayPause, handleToggleMute } = useAudioControl({
 *   musicUrl: 'https://example.com/music.mp3',
 *   enabled: true,
 *   volume: 0.5
 * });
 */

interface UseAudioControlProps {
  musicUrl: string;
  enabled: boolean;
  volume: number;
}

export function useAudioControl({ musicUrl, enabled, volume }: UseAudioControlProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const previousEnabledRef = useRef(enabled);

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audioRef.current = audio;
    }
  }, []);

  // 更新音乐源并处理自动播放
  useEffect(() => {
    if (!audioRef.current || !musicUrl) return;

    // 如果 URL 发生变化，更新源并重置
    if (audioRef.current.src !== musicUrl) {
      // 停止当前播放
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
      audioRef.current.src = musicUrl;
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // 设置源后，如果 enabled 为 true，自动播放
    if (enabled && audioRef.current.paused && audioRef.current.src) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => {
            console.log('Audio play blocked:', e);
            setIsPlaying(false);
          });
      }
    }
  }, [musicUrl, enabled]);

  // 管理音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.min(volume * 0.5, 1);
    }
  }, [volume, isMuted]);

  // 播放/暂停
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !musicUrl) return;

    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => {
            console.log('Audio play blocked:', e);
            setIsPlaying(false);
          });
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [musicUrl]);

  // 静音/取消静音
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    audioRef,
    isPlaying,
    isMuted,
    handlePlayPause,
    handleToggleMute,
  };
}
