'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { UnifiedHeartsConfig, DEFAULT_CONFIG, HEART_3D_CONSTANTS } from './config';

/**
 * ==============================================================================
 * 3D 爱心模式渲染器（独立模块用于懒加载）
 * ==============================================================================
 */

// 动态导入 Three.js 相关模块
let THREE: any = null;
let TrackballControls: any = null;
let OBJLoader: any = null;
let MeshSurfaceSampler: any = null;
let gsap: any = null;
let SimplexNoise: any = null;

interface Heart3DModeProps {
    config: UnifiedHeartsConfig;
}

export default function Heart3DMode({ config }: Heart3DModeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typedText, setTypedText] = useState<string[]>([]);

    // 打字机效果
    useEffect(() => {
        const plainLines = config.texts3D || DEFAULT_CONFIG.texts3D;
        const textToType = Array.isArray(plainLines) ? plainLines.join('\n\n') : String(plainLines);

        let timer: NodeJS.Timeout;
        let i = 0;

        const startTyping = () => {
            timer = setInterval(() => {
                if (i < textToType.length) {
                    setTypedText(textToType.substring(0, i + 1).split('\n'));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 150);
        };

        const delay = setTimeout(startTyping, 1000);

        return () => {
            clearTimeout(delay);
            clearInterval(timer);
        };
    }, [config.texts3D]);

    // 初始化 Three.js 引擎
    useEffect(() => {
        const initEngine = async () => {
            if (!canvasRef.current) return;

            try {
                // 动态导入
                const threeModule = await import('three');
                THREE = threeModule;

                const controlsModule = await import('three/examples/jsm/controls/TrackballControls.js');
                TrackballControls = controlsModule.TrackballControls;

                const loaderModule = await import('three/examples/jsm/loaders/OBJLoader.js');
                OBJLoader = loaderModule.OBJLoader;

                const samplerModule = await import('three/examples/jsm/math/MeshSurfaceSampler.js');
                MeshSurfaceSampler = samplerModule.MeshSurfaceSampler;

                const gsapModule = await import('gsap');
                gsap = gsapModule.gsap;

                // 简化的噪声函数
                class SimpleNoise {
                    noise4D(x: number, y: number, z: number, w: number): number {
                        return Math.sin(x * 10 + w) * Math.cos(y * 10 + w) * Math.sin(z * 10 + w);
                    }
                }

                const canvas = canvasRef.current;
                const width = window.innerWidth;
                const height = window.innerHeight;

                // 场景
                const scene = new THREE.Scene();

                // 相机
                const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                camera.position.z = HEART_3D_CONSTANTS.CAMERA_Z;

                // 渲染器
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                });
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                // 控制器
                const controls = new TrackballControls(camera, renderer.domElement);
                controls.noPan = true;
                controls.maxDistance = HEART_3D_CONSTANTS.MAX_DISTANCE;
                controls.minDistance = HEART_3D_CONSTANTS.MIN_DISTANCE;

                // 组
                const group = new THREE.Group();
                scene.add(group);

                // 噪声
                const simplex = new SimpleNoise();

                // 粒子几何体
                const geometry = new THREE.BufferGeometry();
                const material = new THREE.PointsMaterial({
                    vertexColors: true,
                    size: 0.009,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    opacity: 0.8,
                });
                const particles = new THREE.Points(geometry, material);
                group.add(particles);

                // 调色板
                const palette = HEART_3D_CONSTANTS.PALETTE_COLORS.map((c: string) => new THREE.Color(c));

                // 心跳动画
                const beat = { a: 0 };
                const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
                timeline
                    .to(beat, { a: 0.5, duration: 0.6, ease: "power2.in" })
                    .to(beat, { a: 0.0, duration: 0.6, ease: "power3.out" });

                // 粒子数据
                let spikes: any[] = [];
                let heart: THREE.Mesh | null = null;
                let originHeart: number[] | null = null;
                let sampler: any = null;

                // 加载心形模型
                const loader = new OBJLoader();
                loader.load(
                    config.heartObjUrl || DEFAULT_CONFIG.heartObjUrl,
                    (obj: any) => {
                        heart = obj.children[0] as THREE.Mesh;
                        heart.geometry.rotateX(-Math.PI * 0.5);
                        heart.geometry.scale(0.04, 0.04, 0.04);
                        heart.geometry.translate(0, -0.4, 0);
                        group.add(heart);

                        heart.material = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(config.bgValue?.startsWith('#') ? config.bgValue : '#131124'),
                            depthTest: false,
                            transparent: true,
                            opacity: 0.1,
                        });

                        originHeart = Array.from(heart.geometry.attributes.position.array);
                        sampler = new MeshSurfaceSampler(heart).build();

                        // 初始化粒子
                        const pos = new THREE.Vector3();
                        for (let i = 0; i < HEART_3D_CONSTANTS.PARTICLE_COUNT; i++) {
                            sampler.sample(pos, undefined, undefined);
                            spikes.push({
                                color: palette[Math.floor(Math.random() * palette.length)],
                                rand: Math.random() * 0.03,
                                pos: pos.clone(),
                                one: null,
                                two: null,
                            });
                        }

                        setLoading(false);
                    },
                    undefined,
                    (err: any) => {
                        console.error('Failed to load heart model:', err);
                        setError('加载模型失败');
                        setLoading(false);
                    }
                );

                // 渲染循环
                let animationId: number;
                const render = (time: number) => {
                    const a = time * 0.001;
                    const positions: number[] = [];
                    const colors: number[] = [];
                    const { MAX_Z, RATE_Z } = HEART_3D_CONSTANTS;

                    spikes.forEach((g) => {
                        const noise = simplex.noise4D(g.pos.x, g.pos.y, g.pos.z, 0.1) + 1.5;
                        const noise2 = simplex.noise4D(g.pos.x * 500, g.pos.y * 500, g.pos.z * 500, 1) + 1;

                        g.one = g.pos.clone().multiplyScalar(1.01 + noise * 0.15 * beat.a);
                        g.two = g.pos.clone().multiplyScalar(1 + noise2 * 1 * (beat.a + 0.3) - beat.a * 1.2);

                        const rand = g.rand;
                        if (g.one && MAX_Z * RATE_Z + rand > g.one.z && g.one.z > -MAX_Z * RATE_Z - rand) {
                            positions.push(g.one.x, g.one.y, g.one.z);
                            colors.push(g.color.r, g.color.g, g.color.b);
                        }
                        if (g.two && MAX_Z * RATE_Z + rand * 2 > g.one.z && g.one.z > -MAX_Z * RATE_Z - rand * 2) {
                            positions.push(g.two.x, g.two.y, g.two.z);
                            colors.push(g.color.r, g.color.g, g.color.b);
                        }
                    });

                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                    // 心跳变形
                    if (heart && originHeart) {
                        const vs = heart.geometry.attributes.position.array;
                        for (let i = 0; i < vs.length; i += 3) {
                            const x = originHeart[i];
                            const y = originHeart[i + 1];
                            const z = originHeart[i + 2];
                            const noise = simplex.noise4D(x * 1.5, y * 1.5, z * 1.5, a * 0.0005) + 1;
                            const factor = noise * 0.15 * beat.a;
                            (vs as any)[i] = x * factor;
                            (vs as any)[i + 1] = y * factor;
                            (vs as any)[i + 2] = z * factor;
                        }
                        heart.geometry.attributes.position.needsUpdate = true;
                    }

                    controls.update();
                    renderer.render(scene, camera);
                    animationId = requestAnimationFrame(render);
                };

                animationId = requestAnimationFrame(render);

                // resize
                const handleResize = () => {
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h);
                };
                window.addEventListener('resize', handleResize);

                engineRef.current = {
                    dispose: () => {
                        cancelAnimationFrame(animationId);
                        window.removeEventListener('resize', handleResize);
                        renderer.dispose();
                        timeline.kill();
                        controls.dispose();
                        geometry.dispose();
                        material.dispose();
                    }
                };

            } catch (err) {
                console.error('Failed to init 3D engine:', err);
                setError('初始化3D引擎失败');
                setLoading(false);
            }
        };

        initEngine();

        return () => {
            engineRef.current?.dispose();
            engineRef.current = null;
        };
    }, [config.heartObjUrl, config.bgValue]);

    return (
        <>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block w-full h-full outline-none z-10"
            />

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-pink-500 animate-pulse text-xl font-serif">
                        Loading Heart Model...
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-red-500 text-xl">{error}</div>
                </div>
            )}

            {/* Text */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[300px] text-center pointer-events-none z-20">
                {typedText.map((line, idx) => (
                    <div key={idx} className="mb-4">
                        <span
                            className="text-[#f1dadb] font-bold font-serif text-lg md:text-xl tracking-wide drop-shadow-md"
                            style={{ fontFamily: '"Russo One", arial, sans-serif' }}
                        >
                            {line}
                            {idx === typedText.length - 1 && (
                                <span className="animate-pulse text-red-500 ml-1">❤</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* Snow Effect */}
            <SnowEffect />
        </>
    );
}

// 雪花效果
function SnowEffect() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const snowflakes = useMemo(() => {
        if (typeof window === 'undefined') return [];
        return [...Array(30)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            width: Math.random() * 3 + 2,
            height: Math.random() * 3 + 2,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
        }));
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-5">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute bg-white rounded-full opacity-60"
                    style={{
                        left: `${flake.left}%`,
                        top: `-10px`,
                        width: `${flake.width}px`,
                        height: `${flake.height}px`,
                        animationName: 'snow-fall',
                        animationDuration: `${flake.duration}s`,
                        animationDelay: `${flake.delay}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        filter: 'blur(1px)'
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes snow-fall {
                    0% { transform: translateY(-10px) translateX(0px); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
