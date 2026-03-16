/**
 * ==============================================================================
 * romantic-hearts 粒子系统模块
 * 包含：Point、HeartParticle、ParticlePool、FloatingText、MeteorRain、FloatingHeart
 * ==============================================================================
 */

import { PARTICLE_SETTINGS, FLOATING_COLORS } from './config';

// ============================================================================
// Point 类 - 2D向量/点
// ============================================================================

export class Point {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    length(len?: number): number | Point {
        if (typeof len === 'undefined') {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        this.normalize();
        this.x *= len;
        this.y *= len;
        return this;
    }

    normalize(): Point {
        const len = this.length() as number;
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
}

// ============================================================================
// HeartParticle 类 - 心形粒子
// ============================================================================

export class HeartParticle {
    position: Point;
    velocity: Point;
    acceleration: Point;
    age: number;

    constructor() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }

    initialize(x: number, y: number, dx: number, dy: number) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * PARTICLE_SETTINGS.effect;
        this.acceleration.y = dy * PARTICLE_SETTINGS.effect;
        this.age = 0;
    }

    update(deltaTime: number) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    }

    draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        const ease = (t: number) => (--t) * t * t + 1;
        const size = image.width * ease(this.age / PARTICLE_SETTINGS.duration);
        context.globalAlpha = 1 - this.age / PARTICLE_SETTINGS.duration;
        context.drawImage(
            image,
            this.position.x - size / 2,
            this.position.y - size / 2,
            size,
            size
        );
    }
}

// ============================================================================
// ParticlePool 类 - 粒子池管理
// ============================================================================

export class ParticlePool {
    private particles: HeartParticle[];
    private firstActive: number = 0;
    private firstFree: number = 0;
    private duration: number;

    constructor(length: number) {
        this.particles = new Array(length);
        for (let i = 0; i < length; i++) {
            this.particles[i] = new HeartParticle();
        }
        this.duration = PARTICLE_SETTINGS.duration;
    }

    add(x: number, y: number, dx: number, dy: number) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree++;
        if (this.firstFree === this.particles.length) this.firstFree = 0;
        if (this.firstActive === this.firstFree) this.firstActive++;
        if (this.firstActive === this.particles.length) this.firstActive = 0;
    }

    update(deltaTime: number) {
        if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        }
        if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].update(deltaTime);
            }
            for (let i = 0; i < this.firstFree; i++) {
                this.particles[i].update(deltaTime);
            }
        }
        while (
            this.particles[this.firstActive]?.age >= this.duration &&
            this.firstActive !== this.firstFree
        ) {
            this.firstActive++;
            if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
    }

    draw(context: CanvasRenderingContext2D, image: HTMLImageElement) {
        if (this.firstActive < this.firstFree) {
            for (let i = this.firstActive; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        }
        if (this.firstFree < this.firstActive) {
            for (let i = this.firstActive; i < this.particles.length; i++) {
                this.particles[i].draw(context, image);
            }
            for (let i = 0; i < this.firstFree; i++) {
                this.particles[i].draw(context, image);
            }
        }
    }
}

// ============================================================================
// FloatingText 类 - 漂浮文字
// ============================================================================

export class FloatingText {
    x: number;
    y: number;
    opacity: number;
    velX: number;
    velY: number;
    targetScale: number;
    scale: number;
    width: number;
    height: number;
    color: string;
    text: string;

    constructor(ww: number, wh: number, texts: string[]) {
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.velX = (Math.random() - 0.5) * 4;
        this.velY = (Math.random() - 0.5) * 4;
        this.targetScale = Math.random() * 0.15 + 0.02;
        this.scale = this.targetScale * Math.random();
        this.width = 473.8;
        this.height = 408.6;
        this.color = FLOATING_COLORS[Math.floor(Math.random() * FLOATING_COLORS.length)];
        this.text = texts[Math.floor(Math.random() * texts.length)];
    }

    update(ww: number, wh: number) {
        this.x += this.velX;
        this.y += this.velY;
        this.scale += (this.targetScale - this.scale) * 0.01;

        if (this.x - this.width > ww || this.x + this.width < 0) {
            this.scale = 0;
            this.x = Math.random() * ww;
        }
        if (this.y - this.height > wh || this.y + this.height < 0) {
            this.scale = 0;
            this.y = Math.random() * wh;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.opacity;
        ctx.font = `${180 * this.scale}px "微软雅黑", sans-serif`;
        ctx.fillStyle = this.color;
        ctx.fillText(
            this.text,
            this.x - this.width * 0.5,
            this.y - this.height * 0.5,
            this.width
        );
    }
}

// ============================================================================
// MeteorRain 类 - 流星雨效果
// ============================================================================

export class MeteorRain {
    x: number;
    y: number;
    length: number;
    angle: number;
    width: number;
    height: number;
    speed: number;
    offsetX: number;
    offsetY: number;
    alpha: number;
    color1: string;
    color2: string;
    windowWidth: number;
    windowHeight: number;

    constructor(windowWidth: number, windowHeight: number) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.angle = 30;
        this.width = 0;
        this.height = 0;
        this.speed = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.alpha = 1;
        this.color1 = '#ea80b0';
        this.color2 = '';
        this.init();
    }

    init() {
        this.getPos();
        this.alpha = 1;
        this.getRandomColor();
        const x = Math.random() * 80 + 150;
        this.length = Math.ceil(x);
        this.angle = 30;
        const speedFactor = Math.random() + 0.5;
        this.speed = Math.ceil(speedFactor);
        const cos = Math.cos(this.angle * Math.PI / 180);
        const sin = Math.sin(this.angle * Math.PI / 180);
        this.width = this.length * cos;
        this.height = this.length * sin;
        this.offsetX = this.speed * cos;
        this.offsetY = this.speed * sin;
    }

    getRandomColor() {
        const a = Math.ceil(255 - 240 * Math.random());
        this.color1 = `rgba(${a},${a},${a},1)`;
        this.color2 = 'black';
    }

    countPos() {
        this.x = this.x - this.offsetX;
        this.y = this.y + this.offsetY;
    }

    getPos() {
        this.x = Math.random() * this.windowWidth;
        this.y = Math.random() * this.windowHeight;
    }

    draw(context: CanvasRenderingContext2D) {
        context.save();
        context.beginPath();
        context.lineWidth = 1;
        context.globalAlpha = this.alpha;
        const line = context.createLinearGradient(
            this.x, this.y,
            this.x + this.width,
            this.y - this.height
        );
        line.addColorStop(0, '#ea80b0');
        line.addColorStop(0.3, this.color1);
        line.addColorStop(0.6, this.color2);
        context.strokeStyle = line;
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.width, this.y - this.height);
        context.closePath();
        context.stroke();
        context.restore();
    }

    move(context: CanvasRenderingContext2D) {
        const x = this.x + this.width - this.offsetX;
        const y = this.y - this.height;
        context.clearRect(x - 3, y - 3, this.offsetX + 5, this.offsetY + 5);
        this.countPos();
        this.alpha -= 0.002;
        this.draw(context);
    }
}

// ============================================================================
// FloatingHeart 类 - 背景飘落爱心
// ============================================================================

export class FloatingHeart {
    x: number;
    y: number;
    size: number;
    shadowBlur: number;
    speedX: number;
    speedY: number;
    speedSize: number;
    opacity: number;
    vertices: { x: number; y: number }[];
    precision: number = 100;

    constructor(ww: number, wh: number) {
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.size = Math.random() * 2 + 1;
        this.shadowBlur = Math.random() * 10;
        this.speedX = (Math.random() + 0.2 - 0.6) * 8;
        this.speedY = (Math.random() + 0.2 - 0.6) * 8;
        this.speedSize = Math.random() * 0.05 + 0.01;
        this.opacity = 1;
        this.vertices = [];

        for (let i = 0; i < this.precision; i++) {
            const step = (i / this.precision - 0.5) * (Math.PI * 2);
            this.vertices.push({
                x: 15 * Math.pow(Math.sin(step), 3),
                y: -(13 * Math.cos(step) - 5 * Math.cos(2 * step) - 2 * Math.cos(3 * step) - Math.cos(4 * step))
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D, ww: number, wh: number) {
        this.size -= this.speedSize;
        this.x += this.speedX;
        this.y += this.speedY;

        ctx.save();
        ctx.translate(-1000, this.y);
        ctx.scale(this.size, this.size);
        ctx.beginPath();
        for (let i = 0; i < this.precision; i++) {
            const v = this.vertices[i];
            ctx.lineTo(v.x, v.y);
        }
        ctx.globalAlpha = this.size;
        ctx.shadowBlur = Math.round((3 - this.size) * 10);
        ctx.shadowColor = 'hsla(0, 100%, 60%, 0.5)';
        ctx.shadowOffsetX = this.x + 1000;
        ctx.globalCompositeOperation = 'screen';
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// ============================================================================
// 辅助函数：生成心形曲线上的点
// ============================================================================

export function pointOnHeart(t: number): Point {
    return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
    );
}

// ============================================================================
// 辅助函数：创建心形粒子图像
// ============================================================================

export function createHeartImage(heartColor: string): HTMLImageElement {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d')!;
    offscreen.width = PARTICLE_SETTINGS.size;
    offscreen.height = PARTICLE_SETTINGS.size;

    const to = (t: number): Point => {
        const point = pointOnHeart(t);
        point.x = PARTICLE_SETTINGS.size / 2 + (point.x * PARTICLE_SETTINGS.size) / 350;
        point.y = PARTICLE_SETTINGS.size / 2 - (point.y * PARTICLE_SETTINGS.size) / 350;
        return point;
    };

    offCtx.beginPath();
    let t = -Math.PI;
    let point = to(t);
    offCtx.moveTo(point.x, point.y);
    while (t < Math.PI) {
        t += 0.01;
        point = to(t);
        offCtx.lineTo(point.x, point.y);
    }
    offCtx.closePath();
    offCtx.fillStyle = heartColor || '#ea80b0';
    offCtx.fill();

    const img = new Image();
    img.src = offscreen.toDataURL();
    return img;
}
