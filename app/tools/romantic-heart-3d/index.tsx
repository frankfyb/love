'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import gsap from 'gsap';
import { SimplexNoise } from './simplex';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 1. Configuration & Constants
 * ==============================================================================
 */

export const DEFAULT_CONFIG = {
    bgMusicUrl: 'https://sf6-cdn-tos.douyinstatic.com/obj/ies-music/7170534431801838367.mp3',
    enableSound: true,
    texts: [
        "于我而言，你是最好且是唯一❤️",
        "宝贝，永远爱你❤️"
    ],
    heartObjUrl: 'https://assets.codepen.io/127738/heart_2.obj',
    bgValue: '#131124',
    bgConfig: createBgConfigWithOverlay({
        type: 'color',
        value: '#131124',
    }, 0),
};

export const romanticHeart3DConfigMetadata = {
    panelTitle: '3D 爱心配置',
    panelSubtitle: 'Romantic Heart Settings',
    tabs: [
        { id: 'content', label: '内容', icon: null },
        { id: 'background', label: '背景', icon: null },
        { id: 'music', label: '音乐', icon: null },
    ],
    configSchema: {
        texts: {
            category: 'content' as const,
            type: 'list' as const,
            label: '表白文字',
            description: '输入你想说的话，将会逐行显示',
            placeholder: '输入文字...'
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: GLOBAL_BG_PRESETS.getToolPresets('romantic-heart-3d'),
            description: '选择浪漫背景'
        },
        bgMusicUrl: {
            category: 'music' as const,
            type: 'media-picker' as const, // Upgrade to media-picker if available, or stay input but label correctly
            label: '背景音乐',
            description: '选择或输入背景音乐链接',
            mediaType: 'music' as const,
        },
        enableSound: {
            category: 'music' as const,
            type: 'switch' as const,
            label: '启用音效'
        }
    },
    mobileSteps: [
        { id: 1, label: '内容设置', icon: null, fields: ['texts'] },
        { id: 2, label: '背景设置', icon: null, fields: ['bgValue'] },
        { id: 3, label: '音乐设置', icon: null, fields: ['bgMusicUrl' as const, 'enableSound' as const] }
    ]
};

export interface RomanticHeart3DConfig {
    bgMusicUrl: string;
    enableSound: boolean;
    texts: string[];
    heartObjUrl: string;
    bgValue?: string;
    bgConfig?: StandardBgConfig;
}

/**
 * ==============================================================================
 * 2. Main Component
 * ==============================================================================
 */

export default function RomanticHeart3DPage({ config = DEFAULT_CONFIG }: { config?: RomanticHeart3DConfig }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [typedText, setTypedText] = useState<string[]>([]);

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // Audio Control - 背景音乐始终可以播放，enableSound 控制面板显示
    const {
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: true, // 音频功能始终启用
        volume: 0.6,
        autoPlay: config.enableSound !== false, // enableSound 控制是否自动播放
    });

    // Typewriter effect
    useEffect(() => {
        const plainLines = config.texts || DEFAULT_CONFIG.texts;
        const textToType = Array.isArray(plainLines) ? plainLines.join('\n\n') : String(plainLines);

        let timer: NodeJS.Timeout;

        const startTyping = () => {
            let i = 0;
            timer = setInterval(() => {
                if (i < textToType.length) {
                    setTypedText(prev => {
                        return textToType.substring(0, i + 1).split('\n');
                    });
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
    }, []);


    // Three.js Logic
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // SCENE
        const scene = new THREE.Scene();

        // CAMERA
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 1.8;

        // RENDERER
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // renderer.setClearColor(new THREE.Color(config.bgColor)); // Remove opaque clear color

        // CONTROLS
        const controls = new TrackballControls(camera, renderer.domElement);
        controls.noPan = true;
        controls.maxDistance = 3;
        controls.minDistance = 0.7;

        // GROUP
        const group = new THREE.Group();
        scene.add(group);

        // VARIABLES
        let heart: THREE.Mesh | null = null;
        let sampler: MeshSurfaceSampler | null = null;
        let originHeart: number[] | null = null;
        let spikes: SparkPoint[] = [];

        // SIMPLEX & PARTICLES
        const simplex = new (SimplexNoise as any)(); // Our custom class
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

        const pos = new THREE.Vector3();
        const palette = [
            new THREE.Color("#f0a1a8"),
            new THREE.Color("#de1c31"),
            new THREE.Color("#f0a1a8"),
            new THREE.Color("#ff1775"),
        ];

        const beat = { a: 0 };

        // GSAP ANIMATION
        const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: 0.3,
        });
        tl.to(beat, {
            a: 0.5,
            duration: 0.6,
            ease: "power2.in",
        }).to(beat, {
            a: 0.0,
            duration: 0.6,
            ease: "power3.out",
        });

        const maxZ = 0.23;
        const rateZ = 0.5;

        // CLASS
        class SparkPoint {
            color: THREE.Color;
            rand: number;
            pos: THREE.Vector3;
            one: THREE.Vector3 | null;
            two: THREE.Vector3 | null;

            constructor() {
                if (!sampler) throw new Error("Sampler not initialized");
                sampler.sample(pos, undefined, undefined as any); // Type fix attempts
                this.color = palette[Math.floor(Math.random() * palette.length)];
                this.rand = Math.random() * 0.03;
                this.pos = pos.clone();
                this.one = null;
                this.two = null;
            }

            update(a: number) {
                const noise = simplex.noise4D(this.pos.x * 1, this.pos.y * 1, this.pos.z * 1, 0.1) + 1.5;
                const noise2 = simplex.noise4D(this.pos.x * 500, this.pos.y * 500, this.pos.z * 500, 1) + 1;

                this.one = this.pos.clone().multiplyScalar(1.01 + noise * 0.15 * beat.a);
                this.two = this.pos.clone().multiplyScalar(1 + noise2 * 1 * (beat.a + 0.3) - beat.a * 1.2);
            }
        }

        // LOAD OBJ
        new OBJLoader().load(
            config.heartObjUrl || DEFAULT_CONFIG.heartObjUrl,
            (obj: any) => {
                heart = obj.children[0] as THREE.Mesh;
                heart.geometry.rotateX(-Math.PI * 0.5);
                heart.geometry.scale(0.04, 0.04, 0.04);
                heart.geometry.translate(0, -0.4, 0);
                group.add(heart);

                heart.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(config.bgValue && config.bgValue.startsWith('#') ? config.bgValue : '#131124'), // Use configured color if simple hex, else default
                    depthTest: false,
                    transparent: true,
                    opacity: 0.1, // Hide base mesh slightly
                });

                originHeart = Array.from(heart.geometry.attributes.position.array);
                sampler = new MeshSurfaceSampler(heart).build();

                initParticles();
                setLoading(false);

                // Start Loop
                renderer.setAnimationLoop(render);
            },
            undefined,
            (err: any) => {
                console.error('Failed to load Heart OBJ:', err);
                setLoading(false); // Should handle error state
            }
        );

        function initParticles() {
            spikes = [];
            for (let i = 0; i < 10000; i++) {
                spikes.push(new SparkPoint());
            }
        }

        function render(time: number) {
            // time is in ms
            const a = time * 0.001; // Scale down for consistency with original script logic which might expect seconds or frame count?
            // Original script function render(a) uses `a`. It's used in noise4D as `a * 0.0005`.
            // renderer.setAnimationLoop passes time in ms.
            // Original script: `renderer.setAnimationLoop(render)`
            // So `a` IS time in ms.

            const positions: number[] = [];
            const colors: number[] = [];

            spikes.forEach((g) => {
                g.update(a);
                const rand = g.rand;
                const color = g.color;
                if (!g.one || !g.two) return; // safety

                // Only push points within certain Z band (slicing effect)
                if (maxZ * rateZ + rand > g.one.z && g.one.z > -maxZ * rateZ - rand) {
                    positions.push(g.one.x, g.one.y, g.one.z);
                    colors.push(color.r, color.g, color.b);
                }
                if (maxZ * rateZ + rand * 2 > g.one.z && g.one.z > -maxZ * rateZ - rand * 2) {
                    positions.push(g.two.x, g.two.y, g.two.z);
                    colors.push(color.r, color.g, color.b);
                }
            });

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // Beat animation for heart mesh vertices
            if (heart && originHeart) {
                const vs = heart.geometry.attributes.position.array;
                // vs is Float32Array
                for (let i = 0; i < vs.length; i += 3) {
                    const x = originHeart[i];
                    const y = originHeart[i + 1];
                    const z = originHeart[i + 2];

                    const noise = simplex.noise4D(
                        x * 1.5,
                        y * 1.5,
                        z * 1.5,
                        a * 0.0005
                    ) + 1;

                    const factor = (0 + noise * 0.15 * beat.a);
                    // Assuming multiplyScalar logic: v * factor
                    // Original: v.multiplyScalar(0 + noise * 0.15 * beat.a); BUT wait
                    // Vector was created from originHeart.
                    // v = new Vector3(...); v.multiplyScalar(...).
                    // So new pos = origin * factor? No, noise * 0.15 * beat.a is usually close to 0.
                    // let's look closer: `v.multiplyScalar(0 + noise ...)` -> if factor is 0, pos is 0.
                    // The noise usually returns around 1? `+1` at end of noise expression.
                    // Wait, original: `v.multiplyScalar(0 + noise * 0.15 * beat.a)`
                    // If beat.a is 0, it multiplies by 0. The heart would disappear.
                    // Let's re-read original script.
                    // `v.multiplyScalar(0 + noise * 0.15 * beat.a)`
                    // Yes, it seems it collapses the heart if beat.a is 0.
                    // But loop: beat.a goes 0 -> 0.5 -> 0.
                    // This implies the solid heart mesh pulses from 0 scale to some scale?
                    // But in the video/demo, maybe the particles form the heart?
                    // The solid heart (mesh) has opacity 0 or similar? 
                    // Original: `heart.material = new THREE.MeshBasicMaterial({ color: ..., });`
                    // It IS visible unless covered.
                    // BUT `script.js` has `group.add(heart)`.
                    // Actually, checking original script carefully:
                    // The `positions` and `colors` are for `particles`.
                    // `heart` is also updated.

                    // If `multiplyScalar(0 + ...)` is real, then the heart collapses to (0,0,0) when beat.a is 0.
                    // Maybe `1 + ...`?
                    // Original: `v.multiplyScalar(0 + noise * 0.15 * beat.a);`
                    // This looks suspicious. Maybe I misread `0 +`.
                    // Let's check the source view `script.js` line 186.
                    // 186: `v.multiplyScalar(0 + noise * 0.15 * beat.a);`
                    // Yes, it is 0.
                    // This means the background heart (the wireframe or mesh) pulses FROM ZERO?
                    // Maybe it's intended to be invisible when not beating?
                    // Or maybe I should trust the code.
                    // I will trust the code.

                    // Manual multiply
                    (vs as any)[i] = x * factor;
                    (vs as any)[i + 1] = y * factor;
                    (vs as any)[i + 2] = z * factor;
                }
                heart.geometry.attributes.position.needsUpdate = true;
            }

            controls.update();
            renderer.render(scene, camera);
        }

        // Resize
        const onResize = () => {
            if (!containerRef.current) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            renderer.setAnimationLoop(null);
            renderer.dispose();
            tl.kill();
            // Cleanup controls
            controls.dispose();
        };
    }, []); // Only runs once

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full bg-black overflow-hidden">
            {/* 0. Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 1. Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block w-full h-full outline-none z-[1]"
            />

            {/* 2. Loading Layer */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-pink-500 animate-pulse text-xl font-serif">Loading Heart Model...</div>
                </div>
            )}

            {/* 3. Text Layer */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[300px] text-center pointer-events-none z-10">
                {typedText.map((line, idx) => (
                    <div key={idx} className="mb-4">
                        <span
                            className="text-[#f1dadb] font-bold font-serif text-lg md:text-xl tracking-wide drop-shadow-md"
                            style={{ fontFamily: '"Russo One", arial, sans-serif' }}
                        >
                            {line}
                            {idx === typedText.length - 1 && (
                                <span className="animate-pulse text-red-500 ml-1 opacity-100">❤</span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* 4. Controls - 始终显示，让用户可以手动控制音乐 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={true}  // 始终显示控制面板
                position="bottom-right"
                size="sm"
            />

            {/* 5. Custom Snow Layer (Simple CSS) */}
            <SnowEffect />
        </div>
    );
}

// Simple Snow Effect Component - Fixed for SSR hydration
function SnowEffect() {
    const [mounted, setMounted] = useState(false);

    // Only render on client to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate stable random values using useMemo (only calculated once on client)
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
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
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
