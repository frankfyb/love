/**
 * ========================================================================
 * 3D烟花秀系统 - 3D烟花渲染引擎
 * ========================================================================
 */

// 类型定义
export interface Seed {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    born: number;
}

export interface TrailPoint {
    x: number;
    y: number;
    z: number;
}

export interface Spark {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    color: string;
    glowColor: string;
    radius: number;
    alpha: number;
    trail: TrailPoint[];
    twinkle: number;
    twinkleSpeed: number;
}

export interface RasterPoint {
    x: number;
    y: number;
    d: number;
}

export class Firework3DShowSystem {
    private seeds: Seed[] = [];
    private sparks: Spark[] = [];
    private frames: number = 0;
    private seedTimer: number = 0;
    private seedInterval: number = 10;
    private seedLife: number = 80;
    private gravity: number = 0.02;

    // Camera settings
    private playerX: number = 0;
    private playerY: number = 5;
    private playerZ: number = -35;
    private yaw: number = 0;
    private pitch: number = 0;
    private scale: number = 600;
    private cx: number = 0;
    private cy: number = 0;

    // 配置项
    private fireworkDensity: number = 3;
    private particleCount: number = 150;
    private trailLength: number = 5;
    private autoRotate: boolean = true;
    private rotateSpeed: number = 0.5;

    private sparkColors = [
        { color: '#ff6b6b', glow: '#ff0000' },
        { color: '#4ecdc4', glow: '#00ffff' },
        { color: '#ffe66d', glow: '#ffff00' },
        { color: '#a8dadc', glow: '#00aaff' },
        { color: '#f1faee', glow: '#ffffff' },
        { color: '#ff006e', glow: '#ff00ff' },
    ];

    constructor(config?: {
        fireworkDensity?: number;
        particleCount?: number;
        trailLength?: number;
        autoRotate?: boolean;
        rotateSpeed?: number;
    }) {
        if (config) {
            this.fireworkDensity = config.fireworkDensity ?? this.fireworkDensity;
            this.particleCount = config.particleCount ?? this.particleCount;
            this.trailLength = config.trailLength ?? this.trailLength;
            this.autoRotate = config.autoRotate ?? this.autoRotate;
            this.rotateSpeed = config.rotateSpeed ?? this.rotateSpeed;
        }
    }

    public updateConfig(config: {
        fireworkDensity?: number;
        particleCount?: number;
        trailLength?: number;
        autoRotate?: boolean;
        rotateSpeed?: number;
    }) {
        if (config.fireworkDensity !== undefined) this.fireworkDensity = config.fireworkDensity;
        if (config.particleCount !== undefined) this.particleCount = config.particleCount;
        if (config.trailLength !== undefined) this.trailLength = config.trailLength;
        if (config.autoRotate !== undefined) this.autoRotate = config.autoRotate;
        if (config.rotateSpeed !== undefined) this.rotateSpeed = config.rotateSpeed;
    }

    resize(width: number, height: number) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    private rasterizePoint(x: number, y: number, z: number): RasterPoint {
        // 3D 到 2D 透视投影
        const relX = x - this.playerX;
        const relY = y - this.playerY;
        const relZ = z - this.playerZ;

        // 旋转
        let angle = Math.atan2(relX, relZ);
        let dist = Math.sqrt(relX * relX + relZ * relZ);
        const rotX = Math.sin(angle - this.yaw) * dist;
        const rotZ = Math.cos(angle - this.yaw) * dist;

        angle = Math.atan2(relY, rotZ);
        dist = Math.sqrt(relY * relY + rotZ * rotZ);
        const rotY = Math.sin(angle - this.pitch) * dist;
        const finalZ = Math.cos(angle - this.pitch) * dist;

        // 投影到屏幕
        if (finalZ > 0.1) {
            return {
                x: this.cx + (rotX / finalZ) * this.scale,
                y: this.cy + (rotY / finalZ) * this.scale,
                d: Math.sqrt(relX * relX + relY * relY + relZ * relZ)
            };
        }

        return { x: 0, y: 0, d: -1 };
    }

    private spawnSeed() {
        const seed: Seed = {
            x: -40 + Math.random() * 80,
            y: 0,
            z: -40 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -1.2 - Math.random() * 0.3,
            vz: (Math.random() - 0.5) * 0.5,
            born: this.frames
        };
        this.seeds.push(seed);
    }

    private explode(x: number, y: number, z: number) {
        const colorSet = this.sparkColors[Math.floor(Math.random() * this.sparkColors.length)];
        const numSparks = Math.floor(this.particleCount * (0.8 + Math.random() * 0.4));

        for (let i = 0; i < numSparks; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.8 + Math.random() * 1.2;

            const spark: Spark = {
                x, y, z,
                vx: Math.sin(phi) * Math.cos(theta) * speed,
                vy: Math.cos(phi) * speed,
                vz: Math.sin(phi) * Math.sin(theta) * speed,
                color: colorSet.color,
                glowColor: colorSet.glow,
                radius: 2 + Math.random() * 3,
                alpha: 1,
                trail: [],
                twinkle: Math.random(),
                twinkleSpeed: 0.05 + Math.random() * 0.05
            };
            this.sparks.push(spark);
        }
    }

    update() {
        this.frames++;

        // 生成烟花种子
        const spawnRate = 10 / this.fireworkDensity;
        if (this.seedTimer < this.frames) {
            this.seedTimer = this.frames + spawnRate + Math.random() * spawnRate;
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
                this.explode(seed.x, seed.y, seed.z);
                this.seeds.splice(i, 1);
            }
        }

        // 更新火花
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];

            if (spark.alpha > 0 && spark.radius > 0.5) {
                spark.vy += this.gravity;
                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.z += spark.vz;

                spark.vx *= 0.98;
                spark.vy *= 0.98;
                spark.vz *= 0.98;

                spark.alpha -= 0.008;
                spark.radius *= 0.99;

                // 闪烁效果
                spark.twinkle += spark.twinkleSpeed;
                if (spark.twinkle > 1 || spark.twinkle < 0) {
                    spark.twinkleSpeed = -spark.twinkleSpeed;
                }

                // 尾迹
                spark.trail.push({ x: spark.x, y: spark.y, z: spark.z });
                if (spark.trail.length > this.trailLength) {
                    spark.trail.shift();
                }
            } else {
                this.sparks.splice(i, 1);
            }
        }

        // 相机自动旋转
        if (this.autoRotate) {
            this.yaw += 0.001 * this.rotateSpeed;
        }
    }

    draw(ctx: CanvasRenderingContext2D, showGround: boolean = true) {
        // 绘制地面网格
        if (showGround) {
            ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
            ctx.lineWidth = 1;

            for (let i = -50; i <= 50; i += 10) {
                const p1 = this.rasterizePoint(i, 0, -50);
                const p2 = this.rasterizePoint(i, 0, 50);
                if (p1.d !== -1 && p2.d !== -1) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }

                const p3 = this.rasterizePoint(-50, 0, i);
                const p4 = this.rasterizePoint(50, 0, i);
                if (p3.d !== -1 && p4.d !== -1) {
                    ctx.beginPath();
                    ctx.moveTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.stroke();
                }
            }
        }

        // 绘制烟花种子
        ctx.fillStyle = '#ffaa00';
        for (const seed of this.seeds) {
            const point = this.rasterizePoint(seed.x, seed.y, seed.z);
            if (point.d !== -1) {
                const size = 150 / (1 + point.d);
                ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
            }
        }

        // 绘制火花
        for (const spark of this.sparks) {
            const point = this.rasterizePoint(spark.x, spark.y, spark.z);
            if (point.d !== -1) {
                const size = spark.radius * 120 / (1 + point.d);
                const alpha = spark.alpha * spark.twinkle;

                // 绘制发光效果
                ctx.save();
                ctx.globalAlpha = alpha * 0.3;
                ctx.fillStyle = spark.glowColor;
                const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 3);
                gradient.addColorStop(0, spark.glowColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(point.x - size * 3, point.y - size * 3, size * 6, size * 6);
                ctx.restore();

                // 绘制尾迹
                if (spark.trail.length > 1) {
                    ctx.strokeStyle = spark.color;
                    ctx.globalAlpha = alpha * 0.5;
                    ctx.lineWidth = Math.max(1, size / 2);
                    ctx.beginPath();
                    const firstTrail = this.rasterizePoint(spark.trail[0].x, spark.trail[0].y, spark.trail[0].z);
                    if (firstTrail.d !== -1) {
                        ctx.moveTo(firstTrail.x, firstTrail.y);
                        for (let i = 1; i < spark.trail.length; i++) {
                            const trailPoint = this.rasterizePoint(spark.trail[i].x, spark.trail[i].y, spark.trail[i].z);
                            if (trailPoint.d !== -1) {
                                ctx.lineTo(trailPoint.x, trailPoint.y);
                            }
                        }
                        ctx.stroke();
                    }
                }

                // 绘制火花本体
                ctx.globalAlpha = alpha;
                ctx.fillStyle = spark.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }
}
