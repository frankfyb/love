/**
 * ========================================================================
 * 粒子爱心系统 - 粒子类和渲染引擎
 * ========================================================================
 */

// 粒子双心的粒子类
export class DualHeartParticle {
    trans: number;
    rs: number;
    index: number;
    ws: number;
    x: number;
    y: number;

    constructor(trans: number, rs: number, index: number, ws: number) {
        this.trans = trans;
        this.rs = rs;
        this.index = index;
        this.ws = ws;
        this.x = this.trans * (16 * Math.sin(this.index) ** 3);
        this.y = this.trans * (16 * Math.cos(this.index) - 5 * Math.cos(2 * this.index) - 2 * Math.cos(3 * this.index) - Math.cos(4 * this.index));
    }

    getPosition(ws: number, hs: number): { x: number; y: number } {
        return {
            x: ws / 2 + this.x * this.rs,
            y: hs / 2 - this.y * this.rs
        };
    }
}

// 钻石轨迹粒子类
export class DiamondTraceParticle {
    vx: number;
    vy: number;
    R: number;
    speed: number;
    q: number;
    D: number;
    force: number;
    color: string;
    trace: { x: number; y: number }[];
    x: number;
    y: number;
    hue: number;

    constructor(x: number, y: number, heartPointsCount: number, hue: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.R = 2;
        this.speed = Math.random() * 2 + 0.5;
        this.q = Math.floor(Math.random() * heartPointsCount);
        this.D = 2 * (Math.random() * 2 - 1);
        this.force = 0.2 * Math.random() + 0.7;
        this.hue = hue;
        this.color = `hsl(${this.hue}, 100%, 50%)`;
        this.trace = [];
        for (let k = 0; k < 50; k++) {
            this.trace.push({ x, y });
        }
    }

    update(targetPoints: number[][], heartPointsCount: number, traceK: number) {
        const t = targetPoints[this.q];
        const dx = t[0] - this.x;
        const dy = t[1] - this.y;
        this.x += this.vx;
        this.y += this.vy;
        this.vx += this.force * dx;
        this.vy += this.force * dy;

        if (Math.abs(this.vx) > 4) {
            this.vx *= 0.7;
        }
        if (Math.abs(this.vy) > 4) {
            this.vy *= 0.7;
        }

        this.q += this.D;
        if (this.q >= heartPointsCount) {
            this.q = 0;
        } else if (this.q < 0) {
            this.q = heartPointsCount - 1;
        }

        this.hue += 0.4;
        if (this.hue > 360) {
            this.hue = 0;
        }
        this.color = `hsl(${this.hue}, 100%, 50%)`;

        this.trace[traceK].x = this.x;
        this.trace[traceK].y = this.y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        for (let k = 0; k < this.trace.length; k++) {
            ctx.fillRect(this.trace[k].x, this.trace[k].y, 1, 1);
        }
    }
}

// 脉冲光晕粒子类
export class PulseGlowParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    scale: number;
    pulseSpeed: number;
    color: string;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.scale = Math.random() * 0.5 + 0.5;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.alpha = Math.abs(Math.sin(Date.now() * this.pulseSpeed * 0.001));
    }

    draw(ctx: CanvasRenderingContext2D, glowIntensity: number) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.6;
        ctx.fillStyle = this.color;

        // 绘制光晕
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 5 * this.scale + glowIntensity / 10);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '66');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);

        // 绘制核心
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2 * this.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 生成爱心形状的目标点
 */
export function generateHeartPoints(heartPointsCount: number, ws: number, hs: number): number[][] {
    const targetPoints: number[][] = [];

    for (let i = 0; i < heartPointsCount; i++) {
        const t = (Math.PI * 2 * i) / heartPointsCount;
        const x = ws / 2 + (16 * Math.sin(t) ** 3) * 15;
        const y = hs / 2 - (16 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 15;
        targetPoints.push([x, y]);
    }

    return targetPoints;
}

/**
 * 生成粒子双心配置
 */
export function generateDualHeartParticles(count: number, ws: number): DualHeartParticle[] {
    const particles: DualHeartParticle[] = [];

    for (let i = 0; i < count; i++) {
        const trans = 1.7;
        const rs = Math.random() * 6 + 4;
        const index = (Math.PI * 2 * i) / count;
        particles.push(new DualHeartParticle(trans, rs, index, ws));
    }

    return particles;
}

/**
 * 生成钻石轨迹粒子
 */
export function generateDiamondParticles(count: number, ws: number, hs: number, heartPointsCount: number): DiamondTraceParticle[] {
    const particles: DiamondTraceParticle[] = [];

    for (let i = 0; i < count; i++) {
        const hue = Math.floor((360 / count) * i);
        particles.push(new DiamondTraceParticle(ws / 2, hs / 2, heartPointsCount, hue));
    }

    return particles;
}

/**
 * 生成脉冲光晕粒子
 */
export function generatePulseGlowParticles(count: number, ws: number, hs: number, color: string): PulseGlowParticle[] {
    const particles: PulseGlowParticle[] = [];

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const radius = 150 + Math.random() * 100;
        const x = ws / 2 + Math.cos(angle) * radius;
        const y = hs / 2 + Math.sin(angle) * radius;
        particles.push(new PulseGlowParticle(x, y, color));
    }

    return particles;
}
