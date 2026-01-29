'use client';

import React, { useState, useEffect, useRef } from "react";
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { CustomSoundEngine } from './CustomSoundEngine';
import { TextBurnParticle, generateTextPoints, type Point } from './TextBurnParticle';
import type { AppConfig } from './config';
import { DEFAULT_CONFIG, newyearFireworksCardConfigMetadata, newyearFireworksConfigMetadata } from './config';

const soundEngine = new CustomSoundEngine();

interface DisplayUIProps {
  config: AppConfig;
}

export function DisplayUI({ config }: DisplayUIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<TextBurnParticle[]>([]);
  const textPointsRef = useRef<Point[]>([]);
  const launchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    audioRef,
    isPlaying,
    isMuted,
    handlePlayPause,
    handleToggleMute,
  } = useAudioControl({
    musicUrl: config.bgMusicUrl,
    enabled: config.enableSound,
    volume: config.volume,
  });

  useEffect(() => {
    soundEngine.setVolume(config.volume);
  }, [config.volume]);

  const renderBackground = () => {
    if (config.bgType === 'video' || config.bgValue.endsWith('.mp4') || config.bgValue.endsWith('.webm')) {
      return (
        <video
          key={config.bgValue}
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={config.bgValue}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    if (config.bgType === 'image' || config.bgValue.startsWith('http')) {
      return (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 transition-all duration-700"
          style={{ backgroundImage: `url(${config.bgValue})` }}
        />
      );
    }
    return (
      <div
        className="absolute inset-0 w-full h-full z-0 transition-colors duration-700"
        style={{ backgroundColor: config.bgValue }}
      />
    );
  };

  useEffect(() => {
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 6000; i++) {
        particlesRef.current.push(new TextBurnParticle(window.innerWidth, window.innerHeight));
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      ctx.scale(dpr, dpr);

      textPointsRef.current = generateTextPoints(
        config.textString,
        config.textScale,
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const launchFirework = () => {
      soundEngine.playLaunch();
      const launcher = particlesRef.current[0];
      launcher.launch(window.innerWidth, window.innerHeight);
    };

    if (launchTimerRef.current) clearInterval(launchTimerRef.current);
    if (config.autoLaunch) {
      // 增加发射间隔，让文字有足够时间展示
      launchTimerRef.current = setInterval(launchFirework, 12000);
      setTimeout(launchFirework, 1000);
    }

    let time = 0;

    const loop = () => {
      time += 0.05;

      const isMobile = window.innerWidth < 768;
      // 减慢画布淡出速度，让文字燃烧效果更持久
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${isMobile ? 0.08 : 0.05})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.globalCompositeOperation = 'source-over';

      const activeParticles = particlesRef.current;
      const textPoints = textPointsRef.current;
      const launcher = activeParticles[0];
      const logicalH = window.innerHeight;

      if (launcher.state === "LAUNCH") {
        launcher.x += launcher.vx;
        launcher.y += launcher.vy;
        launcher.vy += 0.25;

        launcher.trail.push({ x: launcher.x, y: launcher.y });
        if (launcher.trail.length > 15) launcher.trail.shift();

        ctx.beginPath();
        if (launcher.trail.length > 0) {
          ctx.moveTo(launcher.trail[0].x, launcher.trail[0].y);
          for (const p of launcher.trail) ctx.lineTo(p.x, p.y);
        }

        let trailColor = "rgba(255, 200, 100, 0.8)";
        if (config.particleTheme === "neon") trailColor = "rgba(0, 255, 255, 0.8)";
        if (config.particleTheme === "rainbow") trailColor = `hsla(${time * 50 % 360}, 100%, 70%, 0.8)`;

        ctx.strokeStyle = trailColor;
        ctx.lineWidth = isMobile ? 3 : 4;
        ctx.lineCap = "round";
        ctx.stroke();

        if (launcher.vy >= -1) {
          soundEngine.playExplosion();
          launcher.state = "FALL";
          launcher.alpha = 0;

          const exX = launcher.x;
          const exY = launcher.y;
          const count = Math.min(config.particleCount, activeParticles.length);

          for (let i = 1; i < count; i++) {
            const p = activeParticles[i];
            p.x = exX; p.y = exY; p.alpha = 1; p.state = "EXPLODE";
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * config.explosionForce * config.fireworkScale;
            p.vx = Math.cos(angle) * force;
            p.vy = Math.sin(angle) * force * 0.6;
            p.colorType = Math.random() > 0.4 ? "inner" : "outer";
            p.size = Math.random() * 2 + 1;
            p.assignColor(config);
          }
        }
      }

      for (let i = 1; i < activeParticles.length; i++) {
        const p = activeParticles[i];
        if (p.alpha <= 0.01 && p.state === "FALL") continue;

        if (p.state === "EXPLODE") {
          // 更丝滑的爆炸物理：使用渐进衰减
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96; // 更慢的衰减，让轨迹更长
          p.vy *= 0.96;
          p.vy += 0.03; // 更轻柔的重力
          p.alpha -= 0.003; // 更慢的淡出

          // 平滑过渡到FALL状态
          if (Math.abs(p.vx) < 0.8 && Math.abs(p.vy) < 0.8) {
            p.state = "FALL";
            p.vy = Math.random() * 1.5 + 0.5;
            p.vx = (Math.random() - 0.5) * 0.3;
          }
        } else if (p.state === "FALL") {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += config.gravity * 0.8; // 更轻柔的下落
          if (p.vy > 6) p.vy = 6;

          // 柔和的闪烁效果
          if (Math.random() < 0.03) p.alpha = Math.random() * 0.3 + 0.7;

          if (textPoints.length > 0 && p.y > logicalH * 0.15) {
            const targetIndex = i % textPoints.length;
            const target = textPoints[targetIndex];
            const rangeY = isMobile ? 350 : 550;
            if (p.y < target.y + 180 && p.y > target.y - rangeY && Math.abs(p.x - target.x) < rangeY) {
              p.targetX = target.x; p.targetY = target.y; p.baseX = target.x; p.baseY = target.y; p.state = "ASSEMBLE";
            }
          }
          if (p.y > logicalH) p.alpha = 0;
        } else if (p.state === "ASSEMBLE") {
          // 使用缓动函数让汇聚更丝滑
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // 距离越近速度越慢（缓出效果）
          const easeSpeed = Math.max(0.08, Math.min(0.2, dist * 0.002));
          p.x += dx * easeSpeed;
          p.y += dy * easeSpeed;
          p.alpha = Math.min(p.alpha + 0.05, 1);

          if (Math.abs(dx) < 25 && Math.random() < 0.0003) { soundEngine.playCrackle(); }
          if (dist < 2) { p.state = "BURN"; p.burnTime = 0; }
        } else if (p.state === "BURN") {
          p.burnTime = (p.burnTime || 0) + 1;

          // 文字稳定显示 - 只有微小的呼吸脉动
          const breathe = Math.sin(time * 1.5 + i * 0.02) * 0.3;
          p.x = p.baseX + breathe;
          p.y = p.baseY + breathe * 0.5;

          // 稳定高亮度
          p.alpha = 0.95;

          // 稳定的粒子大小，只有微小脉动
          const baseSize = isMobile ? 3.5 : 2.8;
          p.size = baseSize + Math.sin(time * 2 + i * 0.01) * 0.3;
        }

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          if (p.state === "BURN") {
            // ========== 清晰稳定的文字效果 ==========
            // 柔和光晕
            ctx.shadowBlur = 12;

            // 根据主题选择颜色 - 使用稳定的颜色，不闪烁
            let burnColor: string;
            let glowColor: string;

            if (config.particleTheme === "classic") {
              // 经典金色 - 温暖浪漫
              burnColor = "#FFD700";
              glowColor = "#FFA500";
            } else if (config.particleTheme === "rainbow") {
              // 彩虹 - 稳定的色相
              burnColor = `hsl(${p.hue}, 85%, 60%)`;
              glowColor = `hsl(${p.hue}, 100%, 50%)`;
            } else if (config.particleTheme === "neon") {
              // 霓虹 - 高饱和稳定色
              burnColor = p.color;
              glowColor = p.color;
              ctx.shadowBlur = 18;
            } else if (config.particleTheme === "custom") {
              // 自定义双色
              burnColor = p.colorType === "inner" ? config.textColor : config.textOuterColor;
              glowColor = config.textColor;
            } else {
              burnColor = p.color;
              glowColor = p.color;
            }

            ctx.shadowColor = glowColor;
            ctx.fillStyle = burnColor;
            ctx.globalAlpha = p.alpha;
            ctx.fill();

            ctx.shadowBlur = 0;
          } else if (p.state === "EXPLODE") {
            // 爆炸粒子
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // 其他状态
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1.0;
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      if (launchTimerRef.current) clearInterval(launchTimerRef.current);
    };
  }, [config]);

  const handleInteraction = (e: React.PointerEvent) => {
    soundEngine.init();
    if (audioRef.current && audioRef.current.paused && config.enableSound) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const particles = particlesRef.current;
    let count = 0; const interactRadius = window.innerWidth < 768 ? 80 : 60;
    for (let i = 1; i < particles.length; i++) {
      if (count > 100) break;
      const p = particles[i];
      if (p.state === "BURN" || (p.state === "FALL" && Math.abs(p.x - x) < interactRadius && Math.abs(p.y - y) < interactRadius)) {
        p.x = x; p.y = y;
        const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 6 + 2;
        p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
        p.state = "EXPLODE"; p.alpha = 1; p.size = Math.random() * 3 + 2;
        p.assignColor(config); count++;
      }
    }
    if (count > 0) soundEngine.playExplosion();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {renderBackground()}
      <div className="absolute inset-0 bg-black/40 z-1 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block w-full h-full touch-none" onPointerDown={handleInteraction} />
      <audio ref={audioRef} src={config.bgMusicUrl} loop />
      <AudioControlPanel isPlaying={isPlaying} isMuted={isMuted} onPlayPause={handlePlayPause} onToggleMute={handleToggleMute} enabled={config.enableSound} position="bottom-right" size="sm" />
      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none z-20 opacity-80 animate-pulse px-4">
        <p className="text-sm sm:text-base font-light tracking-[0.3em] text-orange-200 drop-shadow-[0_0_10px_rgba(255,100,0,0.8)] truncate">{config.textString}</p>
      </div>
    </div>
  );
}

export default function NewYearFireworksPage() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setConfig(prev => ({ ...prev, particleCount: 2000, fireworkScale: 1.0, explosionForce: 20 }));
    } else {
      setConfig(prev => ({ ...prev, particleCount: 5000 }));
    }
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setConfig(prev => ({ ...prev, fireworkScale: Math.max(0.5, Math.min(3.0, prev.fireworkScale + delta)) }));
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  return (<main className="relative w-screen h-screen bg-black overflow-hidden font-sans"><DisplayUI config={config} /></main>);
}

export { DEFAULT_CONFIG, newyearFireworksCardConfigMetadata, newyearFireworksConfigMetadata };