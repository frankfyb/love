/**
 * ========================================================================
 * 粒子系统 - Shape Shifter 文字变形动画核心
 * ========================================================================
 */

// 粒子颜色类
export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    render(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

// 粒子点类
export class Point {
    x: number;
    y: number;
    z: number;
    a: number;
    h: number;

    constructor(args: { x?: number; y?: number; z?: number; a?: number; h?: number }) {
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.z = args.z || 5;
        this.a = args.a || 1;
        this.h = args.h || 0;
    }
}

// 粒子类 (Shape Shifter核心)
export class Dot {
    p: Point;
    e: number;
    s: boolean;
    c: Color;
    t: Point;
    q: Point[];

    constructor(x: number, y: number) {
        this.p = new Point({ x, y, z: 6, a: 1, h: 0 });
        this.e = 0.12; // 加快粒子移动速度，让文字更快形成
        this.s = true;
        // 使用更鲜艳的金色/白色渐变
        const colors = [
            [255, 215, 0],   // 金色
            [255, 255, 255], // 白色
            [255, 200, 100], // 浅金
            [255, 180, 80],  // 橙金
        ];
        const c = colors[Math.floor(Math.random() * colors.length)];
        this.c = new Color(c[0], c[1], c[2], this.p.a);
        this.t = new Point({ x: this.p.x, y: this.p.y, z: this.p.z, a: this.p.a, h: this.p.h });
        this.q = [];
    }

    distanceTo(n: Point, details: boolean = false): number | [number, number, number] {
        const dx = this.p.x - n.x;
        const dy = this.p.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return details ? [dx, dy, d] : d;
    }

    moveTowards(n: Point): boolean {
        const details = this.distanceTo(n, true) as [number, number, number];
        const dx = details[0];
        const dy = details[1];
        const d = details[2];
        const e = this.e * d;

        if (this.p.h === -1) {
            this.p.x = n.x;
            this.p.y = n.y;
            return true;
        }

        if (d > 1) {
            this.p.x -= (dx / d) * e;
            this.p.y -= (dy / d) * e;
        } else {
            if (this.p.h > 0) {
                this.p.h--;
            } else {
                return true;
            }
        }
        return false;
    }

    update() {
        if (this.moveTowards(this.t)) {
            const p = this.q.shift();
            if (p) {
                this.t.x = p.x || this.p.x;
                this.t.y = p.y || this.p.y;
                this.t.z = p.z || this.p.z;
                this.t.a = p.a || this.p.a;
                this.p.h = p.h || 0;
            } else {
                if (this.s) {
                    this.p.x -= Math.sin(Math.random() * 3.142);
                    this.p.y -= Math.sin(Math.random() * 3.142);
                } else {
                    this.move(new Point({
                        x: this.p.x + (Math.random() * 50) - 25,
                        y: this.p.y + (Math.random() * 50) - 25,
                    }));
                }
            }
        }

        // 透明度和大小渐变
        const dA = this.p.a - this.t.a;
        this.p.a = Math.max(0.1, this.p.a - dA * 0.05);
        const dZ = this.p.z - this.t.z;
        this.p.z = Math.max(1, this.p.z - dZ * 0.05);
    }

    move(p: Point) {
        this.q.push(p);
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.c.a = this.p.a;
        const size = this.p.z;

        // 添加发光效果
        ctx.save();
        ctx.shadowColor = `rgba(${this.c.r}, ${this.c.g}, ${this.c.b}, 0.8)`;
        ctx.shadowBlur = size * 3;

        ctx.fillStyle = this.c.render();
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, size, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // 绘制内核更亮的部分
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.p.a * 0.6})`;
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, size * 0.4, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    render(ctx: CanvasRenderingContext2D) {
        this.update();
        this.draw(ctx);
    }
}

/**
 * 生成文字形状点阵
 */
export function generateTextShape(
    text: string,
    canvas: HTMLCanvasElement
): { dots: Point[]; w: number; h: number } {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dots: [], w: 0, h: 0 };

    const gap = 13;
    const fontSize = 500;
    const fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif';

    canvas.width = Math.floor(window.innerWidth / gap) * gap;
    canvas.height = Math.floor(window.innerHeight / gap) * gap;

    ctx.fillStyle = 'red';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const isNumber = !isNaN(parseFloat(text)) && isFinite(parseFloat(text));
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const s = Math.min(
        fontSize,
        (canvas.width / ctx.measureText(text).width) * 0.8 * fontSize,
        (canvas.height / fontSize) * (isNumber ? 1 : 0.45) * fontSize
    );

    ctx.font = `bold ${s}px ${fontFamily}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const dots: Point[] = [];
    let x = 0, y = 0;
    let fx = canvas.width, fy = canvas.height, w = 0, h = 0;

    for (let p = 0; p < pixels.length; p += 4 * gap) {
        if (pixels[p + 3] > 0) {
            dots.push(new Point({ x, y }));
            w = x > w ? x : w;
            h = y > h ? y : h;
            fx = x < fx ? x : fx;
            fy = y < fy ? y : fy;
        }

        x += gap;
        if (x >= canvas.width) {
            x = 0;
            y += gap;
            p += gap * 4 * canvas.width;
        }
    }

    return { dots, w: w + fx, h: h + fy };
}
