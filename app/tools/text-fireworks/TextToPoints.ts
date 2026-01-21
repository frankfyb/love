/**
 * ========================================================================
 * 文字转点阵工具
 * 将文字转换为粒子点阵，用于文字烟花效果
 * ========================================================================
 */

export interface Point {
    x: number;
    y: number;
}

/**
 * 将文字转换为点阵数组
 * @param text 要转换的文字
 * @param textSize 文字大小
 * @param font 字体
 * @returns 点阵坐标数组
 */
export function textToPoints(text: string, textSize: number, font: string = 'Arial, sans-serif'): Point[] {
    if (typeof window === 'undefined') return [];

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = textSize * 1.5;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.textBaseline = 'middle';
    ctx.font = `bold ${textSize}px ${font}`;
    ctx.fillStyle = 'white';
    ctx.fillText(text, 0, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const points: Point[] = [];
    const threshold = 50;
    const step = 2; // 采样步长，减少点数提高性能

    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const index = (x + y * canvas.width) * 4;
            if (data[index + 3] > threshold) {
                // 边缘检测，只保留边缘点
                const neighbors = [
                    [x + step, y],
                    [x - step, y],
                    [x, y + step],
                    [x, y - step]
                ];

                let isEdge = false;
                for (const [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                        const ni = (nx + ny * canvas.width) * 4;
                        if (data[ni + 3] < threshold) {
                            isEdge = true;
                            break;
                        }
                    } else {
                        isEdge = true;
                        break;
                    }
                }

                if (isEdge) {
                    points.push({ x: x / step, y: y / step });
                }
            }
        }
    }

    return points;
}

/**
 * 生成文字粒子爆炸的参数
 */
export function generateTextExplosionParams(baseX: number, baseY: number, point: Point, scale: number = 0.5) {
    return {
        x: baseX,
        y: baseY,
        vx: (point.x - 60) * scale,
        vy: (point.y - 15) * scale,
    };
}
