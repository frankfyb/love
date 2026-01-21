/**
 * TextEmber - 文字烟花类
 * 用于在烟花爆炸时显示祝福文字
 */

import { random } from '@/lib/utils';

export class TextEmber {
    x: number;
    y: number;
    text: string;
    alpha: number;
    hue: number;
    life: number;
    scale: number;
    vx: number;
    vy: number;
    dashOffset: number;

    constructor(x: number, y: number, text: string, hue: number) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.hue = hue;
        this.alpha = 0;
        this.scale = 0.5;
        this.life = 180;
        this.vx = random(-0.2, 0.2);
        this.vy = random(-0.3, -0.6);
        this.dashOffset = 0;
    }

    update() {
        if (this.scale < 1.0) {
            this.scale += 0.08;
            this.alpha = Math.min(1, this.alpha + 0.08);
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.dashOffset -= 1;
            this.life--;
            if (this.life < 60) {
                this.alpha -= 0.02;
                this.scale += 0.003;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        ctx.font = "bold 60px 'Cinzel', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.setLineDash([3, 4]);
        ctx.lineDashOffset = this.dashOffset;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 90%, ${this.alpha})`;
        ctx.strokeText(this.text, 0, 0);

        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.7})`;
        ctx.strokeText(this.text, 0, 0);

        ctx.restore();
    }
}
