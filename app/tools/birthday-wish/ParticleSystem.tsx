/**
 * ==============================================================================
 * birthday-wish 粒子系统模块
 * 包含：FireworkParticle、Firework、HeartCanvas
 * ==============================================================================
 */

'use client';

import React, { useEffect, useRef } from 'react';

// ============================================================================
// FireworkParticle 类 - 烟花粒子
// ============================================================================

export class FireworkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    age: number;
    maxAge: number;
    size: number;

    constructor(x: number, y: number, color: string, isMobile: boolean) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (0.5 - Math.random()) * (isMobile ? 80 : 100);
        this.vy = (0.5 - Math.random()) * (isMobile ? 80 : 100);
        this.age = Math.random() * 100 | 0;
        this.maxAge = this.age;
        this.size = isMobile ? 1.5 : 2;
    }

    update() {
        this.x += this.vx / 20;
        this.y += this.vy / 20;
        this.vy += 1;
        this.age--;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.age / this.maxAge);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive(): boolean {
        return this.age > 0;
    }
}

// ============================================================================
// Firework 类 - 烟花弹
// ============================================================================

export class Firework {
    x: number;
    y: number;
    targetY: number;
    vel: number;
    color: string;
    exploded: boolean;
    isMobile: boolean;

    constructor(canvasWidth: number, canvasHeight: number, isMobile: boolean) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetY = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.3;
        this.vel = -(Math.random() * Math.sqrt(canvasHeight) / 3 + Math.sqrt(4 * canvasHeight) / 2) / 5;
        this.color = `hsl(${Math.random() * 360 | 0}, 100%, 60%)`;
        this.exploded = false;
        this.isMobile = isMobile;
    }

    update(): FireworkParticle[] {
        const particles: FireworkParticle[] = [];
        this.y += this.vel;
        this.vel += 0.04;

        if (this.vel >= 0 && !this.exploded) {
            this.exploded = true;
            const particleCount = this.isMobile ? 120 : 200;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new FireworkParticle(this.x, this.y, this.color, this.isMobile));
            }
        }

        return particles;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.exploded) {
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    isAlive(): boolean {
        return !this.exploded;
    }
}

// ============================================================================
// HeartCanvas 组件 - 爱心Canvas动画
// ============================================================================

interface HeartCanvasProps {
    color: string;
    isMobile: boolean;
}

export function HeartCanvas({ color, isMobile }: HeartCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            const size = isMobile ? 400 : 600;
            canvas.width = size;
            canvas.height = size;
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = isMobile ? '50vh' : '60vh';
        };
        resize();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(1, -1);
        ctx.fillStyle = color;

        let ws = 18;
        let hs = 16;
        let wsSpeed = 0.15;
        let hsSpeed = 0.15;
        const speed = 0.2;

        // 创建粒子数据 - 响应式数量
        const particles: Array<{ trans: number; rs: number; index: number }> = [];
        const layerConfigs = isMobile
            ? [[9, 2.5, 1.5, 300], [7, 5, 2, 200], [11, 2, 2.5, 400], [0, 2.7, 2, 300]]
            : [[9, 2.5, 2, 500], [7, 5, 2.5, 300], [11, 2, 3.5, 600], [0, 2.7, 2.5, 500]];

        for (let layer = 0; layer < 4; layer++) {
            const [transBase, transRange, rsMax, count] = layerConfigs[layer];

            for (let j = 0; j < count; j += speed) {
                particles.push({
                    trans: transBase + Math.random() * transRange,
                    rs: Math.random() * rsMax,
                    index: j,
                });
            }
        }

        const loop = () => {
            ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            ws += wsSpeed;
            if (ws < 16) wsSpeed *= -1;
            else if (ws > 18) wsSpeed *= -1;

            hs += hsSpeed;
            if (hs < 14) hsSpeed *= -1;
            else if (hs > 16) hsSpeed *= -1;

            particles.forEach(p => {
                const x = p.trans * ws * Math.pow(Math.sin(p.index), 3);
                const y = p.trans * (hs * Math.cos(p.index) - 5 * Math.cos(2 * p.index) - 2 * Math.cos(3 * p.index) - Math.cos(4 * p.index));
                ctx.beginPath();
                ctx.arc(x, y, p.rs, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            animationId = requestAnimationFrame(loop);
        };

        const intervalId = setInterval(loop, 100);

        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animationId);
        };
    }, [color, isMobile]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-10 flex items-center justify-center">
            <canvas ref={canvasRef} />
        </div>
    );
}
