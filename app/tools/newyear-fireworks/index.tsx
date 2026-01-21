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
      launchTimerRef.current = setInterval(launchFirework, 7000);
      setTimeout(launchFirework, 800);
    }

    let time = 0;

    const loop = () => {
      time += 0.05;

      const isMobile = window.innerWidth < 768;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${isMobile ? 0.25 : 0.15})`;
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
          p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; p.vy += 0.05; p.alpha -= 0.005;
          if (Math.abs(p.vx) < 1 && Math.abs(p.vy) < 1) {
            p.state = "FALL"; p.vy = Math.random() * 2; p.vx = (Math.random() - 0.5) * 0.5;
          }
        } else if (p.state === "FALL") {
          p.x += p.vx; p.y += p.vy; p.vy += config.gravity;
          if (p.vy > 8) p.vy = 8;
          if (Math.random() < 0.05) p.alpha = Math.random() * 0.5 + 0.5;

          if (textPoints.length > 0 && p.y > logicalH * 0.15) {
            const targetIndex = i % textPoints.length;
            const target = textPoints[targetIndex];
            const rangeY = isMobile ? 300 : 500;
            if (p.y < target.y + 150 && p.y > target.y - rangeY && Math.abs(p.x - target.x) < rangeY) {
              p.targetX = target.x; p.targetY = target.y; p.baseX = target.x; p.baseY = target.y; p.state = "ASSEMBLE";
            }
          }
          if (p.y > logicalH) p.alpha = 0;
        } else if (p.state === "ASSEMBLE") {
          const dx = p.targetX - p.x; const dy = p.targetY - p.y;
          p.x += dx * 0.15; p.y += dy * 0.15; p.alpha = Math.min(p.alpha + 0.1, 1);
          if (Math.abs(dx) < 20 && Math.random() < 0.0005) { soundEngine.playCrackle(); }
          if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) { p.state = "BURN"; }
        } else if (p.state === "BURN") {
          p.noiseOffset += 0.1;
          const turbulenceX = Math.sin(p.noiseOffset) * config.burnIntensity * 2;
          const lift = Math.random() * config.burnIntensity * 4;
          p.x = p.baseX + turbulenceX; p.y = p.baseY - lift; p.alpha = 0.6 + Math.random() * 0.4;
          if (Math.random() < 0.2) p.y = p.baseY;
          const baseSize = isMobile ? 2.5 : 1.5;
          p.size = (Math.sin(time * 5 + i) * 0.5 + 1.5) * baseSize;
        }

        if (p.alpha > 0) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          if (p.state === "BURN" && config.particleTheme !== "custom") {
            ctx.fillStyle = Math.random() > 0.8 ? "#FFFFFF" : p.color;
          } else { ctx.fillStyle = p.color; }
          if (p.state === "BURN" && config.particleTheme === "custom") {
            if (p.colorType === "inner") {
              ctx.fillStyle = Math.random() > 0.7 ? "#FFFFFF" : config.textColor;
            } else { ctx.fillStyle = config.textOuterColor; }
          }
          ctx.globalAlpha = p.alpha; ctx.fill();
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