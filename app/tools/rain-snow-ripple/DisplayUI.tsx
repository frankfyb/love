'use client';
import React, { useEffect, useRef } from 'react';
import type { AppConfig, RippleShape } from './config';

export default function RainSnowRippleDisplayUI({ config }: { config: AppConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const topCurveHeight = size * 0.4;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2;
      let rot = Math.PI / 2 * 3;
      let cx = 0;
      let cy = 0;
      let step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x0 = cx + Math.cos(rot) * outerRadius;
        let y0 = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x0, y0);
        rot += step;
        x0 = cx + Math.cos(rot) * innerRadius;
        y0 = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x0, y0);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    class Ripple {
      x: number;
      y: number;
      size: number;
      opacity: number;
      shape: RippleShape;
      constructor(x: number, y: number) { this.x = x; this.y = y; this.size = 1; this.opacity = 1; this.shape = config.rippleShape; }
      update() { this.size += 0.5; this.opacity -= config.rippleLife; }
      draw() {
        if (!ctx || this.opacity <= 0) return;
        ctx.strokeStyle = `rgba(${hexToRgb(config.rainColor)}, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        const s = Math.min(this.size, config.rippleSize);
        if (this.shape === 'heart') drawHeart(ctx, this.x, this.y - s / 2, s);
        else if (this.shape === 'star') drawStar(ctx, this.x, this.y, s * 0.6);
        else { ctx.beginPath(); ctx.ellipse(this.x, this.y, s, s * 0.3, 0, 0, Math.PI * 2); ctx.stroke(); }
      }
    }

    let ripples: Ripple[] = [];

    class RainDrop { x: number; y: number; length: number; speed: number;
      constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.length = Math.random() * 20 + 10; this.speed = (Math.random() * 5 + 5); }
      draw() { if (!ctx) return; ctx.beginPath(); ctx.strokeStyle = config.rainColor; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length); ctx.stroke(); }
      update() { this.y += this.speed * config.rainSpeed; if (this.y > height) { ripples.push(new Ripple(this.x, height - 5)); this.y = -this.length; this.x = Math.random() * width; } }
    }

    class SnowFlake { x: number; y: number; radius: number; speed: number; wind: number; offset: number;
      constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.radius = Math.random() * 3 + 1; this.speed = Math.random() * 1 + 0.5; this.wind = Math.random() * 2 - 1; this.offset = Math.random() * 100; }
      draw() { if (!ctx) return; ctx.beginPath(); ctx.fillStyle = config.snowColor; ctx.shadowBlur = 5; ctx.shadowColor = config.snowColor; ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
      update() { this.y += this.speed; this.x += Math.sin((this.y + this.offset) * 0.01) + this.wind * 0.5; if (this.y > height) { this.y = -5; this.x = Math.random() * width; } if (this.x > width) this.x = 0; if (this.x < 0) this.x = width; }
    }

    class FallingItem { x: number; y: number; content: string; speed: number; size: number; swing: number; swingOffset: number;
      constructor(options: string[]) { this.swingOffset = Math.random() * 100; this.reset(options, true); }
      reset(options: string[], initial = false) { this.x = Math.random() * width; this.y = initial ? Math.random() * height : -50; this.content = options[Math.floor(Math.random() * options.length)] || '❤'; this.speed = (Math.random() * 0.5 + 0.5) * config.fallingSpeed; this.size = config.fallingSize * (Math.random() * 0.4 + 0.8); this.swing = Math.random() * 0.5 + 0.2; }
      update(options: string[]) { this.y += this.speed; this.x += Math.sin(this.y * 0.02 + this.swingOffset) * this.swing; if (this.y > height + 50) { this.reset(options); } }
      draw() { if (!ctx) return; ctx.font = `${this.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,255,255,0.5)'; ctx.fillText(this.content, this.x, this.y); ctx.shadowBlur = 0; }
    }

    const rainDrops: RainDrop[] = Array.from({ length: 150 }, () => new RainDrop());
    const snowFlakes: SnowFlake[] = Array.from({ length: 200 }, () => new SnowFlake());
    const fallingOptions = config.fallingText.split(/[，,]+/).map(s => s.trim()).filter(Boolean);
    const maxFallingItems = 50;
    const fallingItems: FallingItem[] = Array.from({ length: maxFallingItems }, () => new FallingItem(fallingOptions));

    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 30, 0.25)';
      ctx.fillRect(0, 0, width, height);
      ripples = ripples.filter(r => r.opacity > 0);
      ripples.forEach(r => { r.update(); r.draw(); });
      rainDrops.forEach(d => { d.update(); d.draw(); });
      const activeSnow = Math.floor(snowFlakes.length * config.snowDensity);
      for (let i = 0; i < activeSnow; i++) { snowFlakes[i].update(); snowFlakes[i].draw(); }
      if (fallingOptions.length > 0) {
        const activeFalling = Math.floor(maxFallingItems * config.fallingDensity);
        for (let i = 0; i < activeFalling; i++) { fallingItems[i].update(fallingOptions); fallingItems[i].draw(); }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, [config]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0f1e]">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center px-4 animate-pulse" style={{ textShadow: `0 0 30px ${config.rainColor}80` }}>{config.text}</h1>
      </div>
    </div>
  );
}
