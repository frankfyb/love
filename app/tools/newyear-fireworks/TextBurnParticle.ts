import type { AppConfig } from './config';

/**
 * ==============================================================================
 * 文字燃烧粒子系统
 * ==============================================================================
 * 
 * 这是 newyear-fireworks 工具的核心特色 - 粒子会汇聚成文字形状并产生燃烧效果
 * 包含四个独特状态：LAUNCH（发射）→ EXPLODE（爆炸）→ FALL（下落）→ ASSEMBLE（汇聚）→ BURN（燃烧）
 */

export type ParticleState = "LAUNCH" | "EXPLODE" | "FALL" | "ASSEMBLE" | "BURN";

export interface Point {
    x: number;
    y: number;
}

export class TextBurnParticle {
    x: number = 0;
    y: number = 0;
    vx: number = 0;
    vy: number = 0;
    size: number = 2;
    alpha: number = 0;
    state: ParticleState = "FALL";
    color: string = "#fff";

    // 文字汇聚目标
    targetX: number = 0;
    targetY: number = 0;
    baseX: number = 0;
    baseY: number = 0;
    noiseOffset: number = Math.random() * 100;

    // 颜色控制
    hue: number = 0;
    colorType: "inner" | "outer" = "inner";
    trail: { x: number; y: number }[] = [];

    constructor(w: number, h: number) {
        this.reset(w, h);
    }

    reset(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = h + 100;
        this.vx = 0;
        this.vy = 0;
        this.alpha = 0;
        this.state = "FALL";
        this.trail = [];
    }

    launch(w: number, h: number) {
        this.x = w / 2;
        this.y = h;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 4 + 18);
        this.state = "LAUNCH";
        this.alpha = 1;
        this.size = 5;
        this.trail = [];
        this.color = "#FFD700";
    }

    assignColor(config: AppConfig) {
        if (config.particleTheme === "custom") {
            this.color = this.colorType === "inner" ? config.textColor : config.textOuterColor;
        } else if (config.particleTheme === "rainbow") {
            this.hue = Math.random() * 360;
            this.color = `hsl(${this.hue}, 100%, 60%)`;
        } else if (config.particleTheme === "neon") {
            const neons = [180, 280, 300, 320];
            this.hue = neons[Math.floor(Math.random() * neons.length)];
            this.color = `hsl(${this.hue}, 100%, 60%)`;
        } else {
            // classic theme
            if (this.colorType === "inner") {
                this.color = Math.random() > 0.5 ? "#FFD700" : "#FFA500";
            } else {
                this.color = Math.random() > 0.5 ? "#FF4500" : "#FF0000";
            }
        }
    }
}

/**
 * ==============================================================================
 * 文字点阵生成工具
 * ==============================================================================
 */

export function generateTextPoints(
    text: string,
    scale: number,
    width: number,
    height: number
): Point[] {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];

    const isMobile = width < 768;

    // 1. 动态计算字号
    const targetWidth = width * (isMobile ? 0.9 : 0.85);
    let fontSize = Math.min(
        width / Math.max(text.length, 1) * (isMobile ? 1.4 : 1.6),
        isMobile ? 250 : 500
    ) * scale;

    ctx.font = `900 ${fontSize}px "Microsoft YaHei", "Arial Black", sans-serif`;
    const textMetrics = ctx.measureText(text);
    if (textMetrics.width > targetWidth) {
        fontSize *= targetWidth / textMetrics.width;
    }

    // 应用最终字号
    ctx.font = `900 ${fontSize}px "Microsoft YaHei", "Arial Black", sans-serif`;

    // 2. 布局设置
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerY = height * (isMobile ? 0.4 : 0.35);

    // 3. 绘制文字
    ctx.fillText(text, width / 2, centerY);

    // PC端强力描边增加粒子密度；移动端轻微描边
    const strokeWidth = fontSize * (isMobile ? 0.02 : 0.04);
    if (strokeWidth > 0.5) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = "white";
        ctx.strokeText(text, width / 2, centerY);
    }

    // 4. 自适应采样
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const points: Point[] = [];

    const estimatedArea = fontSize * text.length * fontSize * 0.6;
    let gap = Math.floor(Math.sqrt(estimatedArea / (isMobile ? 1200 : 3500)));

    // 强制限制
    const minGap = isMobile ? 3 : 2;
    const maxGap = isMobile ? 6 : 4;
    gap = Math.max(minGap, Math.min(gap, maxGap));

    for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
            if (imageData[(y * width + x) * 4 + 3] > (isMobile ? 100 : 128)) {
                points.push({ x, y });
            }
        }
    }

    return points.sort(() => Math.random() - 0.5);
}
