/**
 * ========================================================================
 * 3D烟花系统 - 立体烟花粒子引擎
 * ========================================================================
 */

interface Seed {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    born: number;
}

interface Spark {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    radius: number;
    alpha: number;
    color: string;
    trail: { x: number; y: number; z: number }[];
}

export class Fireworks3DSystem {
    private seeds: Seed[] = [];
    private sparks: Spark[] = [];
    private frames: number = 0;
    private seedTimer: number = 0;
    private seedInterval: number = 5;
    private seedLife: number = 100;
    private gravity: number = 0.02;
    private playerX: number = 0;
    private playerY: number = 0;
    private playerZ: number = -25;
    private yaw: number = 0;
    private pitch: number = 0;
    private scale: number = 600;
    private cx: number = 0;
    private cy: number = 0;

    private sparkColors = ['#f84', '#84f', '#8ff', '#fff', '#4f8', '#f44', '#ff8', '#f8f'];

    resize(width: number, height: number) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    private rasterizePoint(x: number, y: number, z: number): { x: number; y: number; d: number } {
        const pi = Math.PI;
        x -= this.playerX;
        y -= this.playerY;
        z -= this.playerZ;

        let p = Math.atan2(x, z);
        let d = Math.sqrt(x * x + z * z);
        x = Math.sin(p - this.yaw) * d;
        z = Math.cos(p - this.yaw) * d;

        p = Math.atan2(y, z);
        d = Math.sqrt(y * y + z * z);
        y = Math.sin(p - this.pitch) * d;
        z = Math.cos(p - this.pitch) * d;

        const rx1 = -1000, ry1 = 1, rx2 = 1000, ry2 = 1, rx3 = 0, ry3 = 0, rx4 = x, ry4 = z;
        const uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1);
        if (!uc) return { x: 0, y: 0, d: -1 };

        const ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc;
        const ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc;

        if (!z) z = 0.000000001;

        if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
            return {
                x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
                y: this.cy + y / z * this.scale,
                d: Math.sqrt(x * x + y * y + z * z)
            };
        } else {
            return {
                x: this.cx + (rx1 + ua * (rx2 - rx1)) * this.scale,
                y: this.cy + y / z * this.scale,
                d: -1
            };
        }
    }

    private spawnSeed() {
        const seed: Seed = {
            x: -50 + Math.random() * 100,
            y: 25,
            z: -50 + Math.random() * 100,
            vx: 0.1 - Math.random() * 0.2,
            vy: -1.5,
            vz: 0.1 - Math.random() * 0.2,
            born: this.frames
        };
        this.seeds.push(seed);
    }

    private splode(x: number, y: number, z: number) {
        const pi = Math.PI;
        const t = 5 + Math.floor(Math.random() * 150);
        const sparkV = 1 + Math.random() * 2.5;
        const color = this.sparkColors[Math.floor(Math.random() * this.sparkColors.length)];

        for (let m = 1; m < t; ++m) {
            const p1 = pi * 2 * Math.random();
            const p2 = pi * Math.random();
            const v = sparkV * (1 + Math.random() / 6);

            const spark: Spark = {
                x, y, z,
                vx: Math.sin(p1) * Math.sin(p2) * v,
                vy: Math.cos(p2) * v,
                vz: Math.cos(p1) * Math.sin(p2) * v,
                radius: 25 + Math.random() * 50,
                alpha: 1,
                color,
                trail: []
            };
            this.sparks.push(spark);
        }
    }

    update() {
        this.frames++;

        // 生成种子
        if (this.seedTimer < this.frames) {
            this.seedTimer = this.frames + this.seedInterval * Math.random() * 10;
            this.spawnSeed();
        }

        // 更新种子
        for (let i = this.seeds.length - 1; i >= 0; i--) {
            const seed = this.seeds[i];
            seed.vy += this.gravity;
            seed.x += seed.vx;
            seed.y += seed.vy;
            seed.z += seed.vz;

            if (this.frames - seed.born > this.seedLife) {
                this.splode(seed.x, seed.y, seed.z);
                this.seeds.splice(i, 1);
            }
        }

        // 更新火花
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            if (spark.alpha > 0 && spark.radius > 5) {
                spark.alpha -= 0.01;
                spark.radius /= 1.02;
                spark.vy += this.gravity;

                // 拖尾
                spark.trail.push({ x: spark.x, y: spark.y, z: spark.z });
                if (spark.trail.length > 5) spark.trail.shift();

                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.z += spark.vz;
                spark.vx /= 1.075;
                spark.vy /= 1.075;
                spark.vz /= 1.075;
            } else {
                this.sparks.splice(i, 1);
            }
        }

        //相机旋转
        const pi = Math.PI;
        const p = Math.atan2(this.playerX, this.playerZ);
        let d = Math.sqrt(this.playerX * this.playerX + this.playerZ * this.playerZ);
        d += Math.sin(this.frames / 80) / 1.25;
        const t = Math.sin(this.frames / 200) / 40;
        this.playerX = Math.sin(p + t) * d;
        this.playerZ = Math.cos(p + t) * d;
        this.yaw = pi + p + t;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // 绘制地面星点
        ctx.fillStyle = '#ff8';
        for (let i = -100; i < 100; i += 3) {
            for (let j = -100; j < 100; j += 4) {
                const x = i, z = j, y = 25;
                const point = this.rasterizePoint(x, y, z);
                if (point.d !== -1) {
                    const size = 250 / (1 + point.d);
                    const d = Math.sqrt(x * x + z * z);
                    const a = 0.75 - Math.pow(d / 100, 6) * 0.75;
                    if (a > 0) {
                        ctx.globalAlpha = a;
                        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
                    }
                }
            }
        }

        ctx.globalAlpha = 1;

        // 绘制种子
        for (const seed of this.seeds) {
            const point = this.rasterizePoint(seed.x, seed.y, seed.z);
            if (point.d !== -1) {
                const size = 200 / (1 + point.d);
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }

        // 绘制火花
        for (const spark of this.sparks) {
            const point = this.rasterizePoint(spark.x, spark.y, spark.z);
            if (point.d !== -1) {
                const size = spark.radius * 200 / (1 + point.d);

                // 拖尾
                if (spark.trail.length > 0) {
                    ctx.strokeStyle = spark.color;
                    let prevPoint = point;
                    for (let j = spark.trail.length - 1; j >= 0; j--) {
                        const trailPoint = this.rasterizePoint(spark.trail[j].x, spark.trail[j].y, spark.trail[j].z);
                        if (trailPoint.d !== -1) {
                            ctx.globalAlpha = (j / spark.trail.length) * spark.alpha / 2;
                            ctx.beginPath();
                            ctx.moveTo(prevPoint.x, prevPoint.y);
                            ctx.lineWidth = 1 + spark.radius * 10 / (spark.trail.length - j) / (1 + trailPoint.d);
                            ctx.lineTo(trailPoint.x, trailPoint.y);
                            ctx.stroke();
                            prevPoint = trailPoint;
                        }
                    }
                }

                // 火花本体
                ctx.globalAlpha = spark.alpha;
                ctx.fillStyle = spark.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }
}
