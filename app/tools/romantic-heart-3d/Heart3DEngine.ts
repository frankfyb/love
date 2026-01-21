/**
 * ==============================================================================
 * romantic-heart-3d 3D 引擎模块
 * Three.js 粒子心形渲染系统
 * ==============================================================================
 */

import * as THREE from 'three';
// @ts-ignore
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import gsap from 'gsap';
import { SimplexNoise } from './simplex';
import { HEART_3D_CONSTANTS } from './config';

// ============================================================================
// SparkPoint 类 - 闪烁粒子点
// ============================================================================

export class SparkPoint {
    color: THREE.Color;
    rand: number;
    pos: THREE.Vector3;
    one: THREE.Vector3 | null;
    two: THREE.Vector3 | null;

    private sampler: MeshSurfaceSampler;
    private simplex: any;
    private beat: { a: number };

    constructor(
        sampler: MeshSurfaceSampler,
        pos: THREE.Vector3,
        palette: THREE.Color[],
        simplex: any,
        beat: { a: number }
    ) {
        this.sampler = sampler;
        this.simplex = simplex;
        this.beat = beat;

        sampler.sample(pos, undefined, undefined as any);
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.rand = Math.random() * 0.03;
        this.pos = pos.clone();
        this.one = null;
        this.two = null;
    }

    update(a: number) {
        const noise = this.simplex.noise4D(this.pos.x * 1, this.pos.y * 1, this.pos.z * 1, 0.1) + 1.5;
        const noise2 = this.simplex.noise4D(this.pos.x * 500, this.pos.y * 500, this.pos.z * 500, 1) + 1;

        this.one = this.pos.clone().multiplyScalar(1.01 + noise * 0.15 * this.beat.a);
        this.two = this.pos.clone().multiplyScalar(1 + noise2 * 1 * (this.beat.a + 0.3) - this.beat.a * 1.2);
    }
}

// ============================================================================
// Heart3DEngine 类 - 3D 爱心渲染引擎
// ============================================================================

export interface Heart3DEngineOptions {
    canvas: HTMLCanvasElement;
    heartObjUrl: string;
    bgColor?: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

export class Heart3DEngine {
    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: TrackballControls;
    private group: THREE.Group;

    private heart: THREE.Mesh | null = null;
    private sampler: MeshSurfaceSampler | null = null;
    private originHeart: number[] | null = null;
    private spikes: SparkPoint[] = [];

    private simplex: any;
    private geometry: THREE.BufferGeometry;
    private particles: THREE.Points;
    private beat: { a: number } = { a: 0 };
    private timeline: gsap.core.Timeline;
    private palette: THREE.Color[];

    private pos: THREE.Vector3 = new THREE.Vector3();
    private isDisposed: boolean = false;

    constructor(options: Heart3DEngineOptions) {
        this.canvas = options.canvas;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 初始化场景
        this.scene = new THREE.Scene();

        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = HEART_3D_CONSTANTS.CAMERA_Z;

        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 初始化控制器
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.noPan = true;
        this.controls.maxDistance = HEART_3D_CONSTANTS.MAX_DISTANCE;
        this.controls.minDistance = HEART_3D_CONSTANTS.MIN_DISTANCE;

        // 初始化组
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // 初始化噪声
        this.simplex = new (SimplexNoise as any)();

        // 初始化粒子系统
        this.geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.009,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
        });
        this.particles = new THREE.Points(this.geometry, material);
        this.group.add(this.particles);

        // 初始化调色板
        this.palette = HEART_3D_CONSTANTS.PALETTE_COLORS.map(c => new THREE.Color(c));

        // 初始化心跳动画
        this.timeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 0.3,
        });
        this.timeline.to(this.beat, {
            a: 0.5,
            duration: 0.6,
            ease: "power2.in",
        }).to(this.beat, {
            a: 0.0,
            duration: 0.6,
            ease: "power3.out",
        });

        // 加载OBJ模型
        this.loadHeartModel(options.heartObjUrl, options.bgColor, options.onLoad, options.onError);

        // 绑定resize
        window.addEventListener('resize', this.handleResize);
    }

    private loadHeartModel(
        url: string,
        bgColor?: string,
        onLoad?: () => void,
        onError?: (error: Error) => void
    ) {
        new OBJLoader().load(
            url,
            (obj: any) => {
                this.heart = obj.children[0] as THREE.Mesh;
                this.heart.geometry.rotateX(-Math.PI * 0.5);
                this.heart.geometry.scale(0.04, 0.04, 0.04);
                this.heart.geometry.translate(0, -0.4, 0);
                this.group.add(this.heart);

                this.heart.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(bgColor?.startsWith('#') ? bgColor : '#131124'),
                    depthTest: false,
                    transparent: true,
                    opacity: 0.1,
                });

                this.originHeart = Array.from(this.heart.geometry.attributes.position.array);
                this.sampler = new MeshSurfaceSampler(this.heart).build();

                this.initParticles();
                this.renderer.setAnimationLoop(this.render);

                if (onLoad) onLoad();
            },
            undefined,
            (err: any) => {
                console.error('Failed to load Heart OBJ:', err);
                if (onError) onError(err);
            }
        );
    }

    private initParticles() {
        this.spikes = [];
        for (let i = 0; i < HEART_3D_CONSTANTS.PARTICLE_COUNT; i++) {
            if (this.sampler) {
                this.spikes.push(new SparkPoint(
                    this.sampler,
                    this.pos,
                    this.palette,
                    this.simplex,
                    this.beat
                ));
            }
        }
    }

    private render = (time: number) => {
        if (this.isDisposed) return;

        const a = time * 0.001;
        const positions: number[] = [];
        const colors: number[] = [];
        const { MAX_Z, RATE_Z } = HEART_3D_CONSTANTS;

        this.spikes.forEach((g) => {
            g.update(a);
            const rand = g.rand;
            const color = g.color;
            if (!g.one || !g.two) return;

            if (MAX_Z * RATE_Z + rand > g.one.z && g.one.z > -MAX_Z * RATE_Z - rand) {
                positions.push(g.one.x, g.one.y, g.one.z);
                colors.push(color.r, color.g, color.b);
            }
            if (MAX_Z * RATE_Z + rand * 2 > g.one.z && g.one.z > -MAX_Z * RATE_Z - rand * 2) {
                positions.push(g.two.x, g.two.y, g.two.z);
                colors.push(color.r, color.g, color.b);
            }
        });

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // 心跳动画
        if (this.heart && this.originHeart) {
            const vs = this.heart.geometry.attributes.position.array;
            for (let i = 0; i < vs.length; i += 3) {
                const x = this.originHeart[i];
                const y = this.originHeart[i + 1];
                const z = this.originHeart[i + 2];

                const noise = this.simplex.noise4D(
                    x * 1.5,
                    y * 1.5,
                    z * 1.5,
                    a * 0.0005
                ) + 1;

                const factor = (0 + noise * 0.15 * this.beat.a);
                (vs as any)[i] = x * factor;
                (vs as any)[i + 1] = y * factor;
                (vs as any)[i + 2] = z * factor;
            }
            this.heart.geometry.attributes.position.needsUpdate = true;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };

    private handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    };

    dispose() {
        this.isDisposed = true;
        window.removeEventListener('resize', this.handleResize);
        this.renderer.setAnimationLoop(null);
        this.renderer.dispose();
        this.timeline.kill();
        this.controls.dispose();
        this.geometry.dispose();
        (this.particles.material as THREE.Material).dispose();
    }
}
