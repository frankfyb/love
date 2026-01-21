'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { random } from '@/lib/utils/random';
import type { AppConfig } from './config';
import { DEFAULT_CONFIG, romanticFireworksCardConfigMetadata, romanticFireworksConfigMetadata } from './config';
import {
    PI_2, PI_HALF, INVISIBLE,
    COLOR, COLOR_CODES, COLOR_CODES_W_INVIS, COLOR_TUPLES,
    type StarInstance, type SparkInstance, type BurstFlashInstance, type ShellOptions,
    getShellOptions, createParticleCollection, createSparkCollection
} from './ParticleShells';

/**
 * ==============================================================================
 * 浪漫烟花组件 - 高级烟花系统 V2.0
 * 参考: 2024 跨年快乐 烟花带声音
 * 特点:
 *   - 多种烟花类型 (菊花、环形、棕榈、柳树、爆裂等)
 *   - 高级粒子系统 (对象池、颜色分组)
 *   - 天空照明效果
 *   - 爆炸闪光效果
 *   - 丰富的粒子特效 (闪烁、二次颜色、流星等)
 *   - 打字机效果
 *   - 点击发射交互
 * ==============================================================================
 */

const GRAVITY = 0.9;  // Physics constant for particle gravity

interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: unknown) => void;
}

export function DisplayUI({ config, isPanelOpen, onConfigChange }: DisplayUIProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const trailsCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 粒子集合 refs
    const starsRef = useRef<Record<string, StarInstance[]>>(createParticleCollection());
    const sparksRef = useRef<Record<string, SparkInstance[]>>(createSparkCollection());
    const burstFlashesRef = useRef<BurstFlashInstance[]>([]);
    const starPoolRef = useRef<StarInstance[]>([]);
    const sparkPoolRef = useRef<SparkInstance[]>([]);

    // 动画状态
    const autoLaunchTimeRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);
    const currentFrameRef = useRef<number>(0);
    const finaleCountRef = useRef<number>(0);

    // 天空照明状态
    const currentSkyColorRef = useRef({ r: 0, g: 0, b: 0 });
    const targetSkyColorRef = useRef({ r: 0, g: 0, b: 0 });

    const [displayText, setDisplayText] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);

    const {
        isPlaying,
        isMuted,
        handlePlayPause: toggleMusic,
        handleToggleMute: toggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: config.enableSound,
        volume: 0.5,
    });

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) {
            return parseBgValueToConfig(config.bgValue);
        }
        if (config.bgConfig) {
            return config.bgConfig;
        }
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // Star 工厂函数
    const addStar = useCallback((
        x: number, y: number, color: string, angle: number, speed: number, life: number,
        speedOffX = 0, speedOffY = 0
    ): StarInstance => {
        const instance: StarInstance = starPoolRef.current.pop() || {
            visible: true,
            heavy: false,
            x: 0, y: 0, prevX: 0, prevY: 0,
            color: '',
            speedX: 0, speedY: 0,
            life: 0, fullLife: 0,
            spinAngle: 0, spinSpeed: 0.8, spinRadius: 0,
            sparkFreq: 0, sparkSpeed: 1, sparkTimer: 0,
            sparkColor: '', sparkLife: 750, sparkLifeVariation: 0.25,
            strobe: false, strobeFreq: 0,
            secondColor: null, transitionTime: 0, colorChanged: false,
            onDeath: null, updateFrame: 0
        };

        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + speedOffX;
        instance.speedY = Math.cos(angle) * speed + speedOffY;
        instance.life = life;
        instance.fullLife = life;
        instance.spinAngle = Math.random() * PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;
        instance.strobeFreq = 0;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        instance.onDeath = null;
        instance.updateFrame = 0;

        starsRef.current[color].push(instance);
        return instance;
    }, []);

    // Spark 工厂函数
    const addSpark = useCallback((
        x: number, y: number, color: string, angle: number, speed: number, life: number
    ) => {
        const instance: SparkInstance = sparkPoolRef.current.pop() || {
            x: 0, y: 0, prevX: 0, prevY: 0, color: '', speedX: 0, speedY: 0, life: 0
        };

        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;

        sparksRef.current[color].push(instance);
        return instance;
    }, []);

    // 添加爆炸闪光
    const addBurstFlash = useCallback((x: number, y: number, radius: number) => {
        burstFlashesRef.current.push({ x, y, radius });
    }, []);

    // 返回实例到池
    const returnStar = useCallback((instance: StarInstance) => {
        instance.onDeath?.(instance);
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        starPoolRef.current.push(instance);
    }, []);

    const returnSpark = useCallback((instance: SparkInstance) => {
        sparkPoolRef.current.push(instance);
    }, []);

    // 创建球形爆发
    const createBurst = useCallback((
        count: number,
        x: number, y: number,
        particleFactory: (angle: number, speedMult: number) => void,
        startAngle = 0,
        arcLength = PI_2
    ) => {
        const R = 0.5 * Math.sqrt(count / Math.PI);
        const C = 2 * R * Math.PI;
        const C_HALF = C / 2;

        for (let i = 0; i <= C_HALF; i++) {
            const ringAngle = i / C_HALF * PI_HALF;
            const ringSize = Math.cos(ringAngle);
            const partsPerFullRing = C * ringSize;
            const partsPerArc = partsPerFullRing * (arcLength / PI_2);

            const angleInc = PI_2 / partsPerFullRing;
            const angleOffset = Math.random() * angleInc + startAngle;
            const maxRandomAngleOffset = angleInc * 0.33;

            for (let j = 0; j < partsPerArc; j++) {
                const randomAngleOffset = Math.random() * maxRandomAngleOffset;
                const angle = angleInc * j + angleOffset + randomAngleOffset;
                particleFactory(angle, ringSize);
            }
        }
    }, []);

    // 创建弧形粒子
    const createParticleArc = useCallback((
        start: number, arcLength: number, count: number, randomness: number,
        particleFactory: (angle: number) => void
    ) => {
        const angleDelta = arcLength / count;
        const end = start + arcLength - (angleDelta * 0.5);

        if (end > start) {
            for (let angle = start; angle < end; angle += angleDelta) {
                particleFactory(angle + Math.random() * angleDelta * randomness);
            }
        }
    }, []);

    // 爆裂效果
    const crackleEffect = useCallback((star: StarInstance) => {
        const count = config.quality === 3 ? 32 : 16;
        createParticleArc(0, PI_2, count, 1.8, (angle) => {
            addSpark(
                star.x, star.y,
                COLOR.Gold,
                angle,
                Math.pow(Math.random(), 0.45) * 2.4,
                300 + Math.random() * 200
            );
        });
    }, [config.quality, createParticleArc, addSpark]);

    // 烟花爆炸
    const burstShell = useCallback((x: number, y: number, options: ShellOptions) => {
        const speed = options.spreadSize / 96;
        const quality = config.quality;

        let sparkFreq = 0, sparkSpeed = 0, sparkLife = 0, sparkLifeVariation = 0.25;

        // 设置闪烁参数
        if (options.glitter === 'light') {
            sparkFreq = 400; sparkSpeed = 0.3; sparkLife = 300; sparkLifeVariation = 2;
        } else if (options.glitter === 'medium') {
            sparkFreq = 200; sparkSpeed = 0.44; sparkLife = 700; sparkLifeVariation = 2;
        } else if (options.glitter === 'heavy') {
            sparkFreq = 80; sparkSpeed = 0.8; sparkLife = 1400; sparkLifeVariation = 2;
        } else if (options.glitter === 'thick') {
            sparkFreq = 16; sparkSpeed = quality === 3 ? 1.65 : 1.5; sparkLife = 1400; sparkLifeVariation = 3;
        } else if (options.glitter === 'willow') {
            sparkFreq = 120; sparkSpeed = 0.34; sparkLife = 1400; sparkLifeVariation = 3.8;
        }

        sparkFreq = sparkFreq / quality;

        const starFactory = (angle: number, speedMult: number) => {
            const standardInitialSpeed = options.spreadSize / 1800;
            const color = typeof options.color === 'string'
                ? (options.color === 'random' ? COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)] : options.color)
                : (Math.random() < 0.5 ? options.color[0] : options.color[1]);

            const star = addStar(
                x, y,
                color,
                angle,
                speedMult * speed,
                options.starLife + Math.random() * options.starLife * (options.starLifeVariation || 0.125),
                0,
                -standardInitialSpeed
            );

            if (options.secondColor) {
                star.transitionTime = options.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = options.secondColor;
            }

            if (options.strobe) {
                star.transitionTime = options.starLife * (Math.random() * 0.08 + 0.46);
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
                if (options.strobeColor) {
                    star.secondColor = options.strobeColor;
                }
            }

            if (options.crackle) {
                star.onDeath = crackleEffect;
            }

            if (options.glitter) {
                star.sparkFreq = sparkFreq;
                star.sparkSpeed = sparkSpeed;
                star.sparkLife = sparkLife;
                star.sparkLifeVariation = sparkLifeVariation;
                star.sparkColor = options.glitterColor || color;
                star.sparkTimer = Math.random() * star.sparkFreq;
            }
        };

        // 计算星星数量
        let starCount = options.starCount;
        if (!starCount) {
            const density = options.starDensity || 1;
            const scaledSize = options.spreadSize / 54;
            starCount = Math.max(6, scaledSize * scaledSize * density);
        }

        // 创建爆发
        if (options.ring) {
            const ringStartAngle = Math.random() * Math.PI;
            const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

            createParticleArc(0, PI_2, starCount, 0, angle => {
                const color = typeof options.color === 'string' ? options.color : options.color[0];
                const initSpeedX = Math.sin(angle) * speed * ringSquash;
                const initSpeedY = Math.cos(angle) * speed;
                const newSpeed = Math.sqrt(initSpeedX * initSpeedX + initSpeedY * initSpeedY);
                const newAngle = Math.atan2(initSpeedX, initSpeedY) + ringStartAngle;

                const star = addStar(
                    x, y, color, newAngle, newSpeed,
                    options.starLife + Math.random() * options.starLife * (options.starLifeVariation || 0.125)
                );

                if (options.glitter) {
                    star.sparkFreq = sparkFreq;
                    star.sparkSpeed = sparkSpeed;
                    star.sparkLife = sparkLife;
                    star.sparkLifeVariation = sparkLifeVariation;
                    star.sparkColor = options.glitterColor || color;
                    star.sparkTimer = Math.random() * star.sparkFreq;
                }
            });
        } else {
            createBurst(starCount, x, y, starFactory);
        }

        // 添加雄蕊
        if (options.pistil && options.pistilColor) {
            const innerOptions: ShellOptions = {
                shellSize: options.shellSize,
                spreadSize: options.spreadSize * 0.5,
                starLife: options.starLife * 0.6,
                starLifeVariation: options.starLifeVariation,
                starDensity: 1.4,
                color: options.pistilColor,
                glitter: 'light',
                glitterColor: options.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White
            };
            burstShell(x, y, innerOptions);
        }

        // 添加流星
        if (options.streamers) {
            const innerOptions: ShellOptions = {
                shellSize: options.shellSize,
                spreadSize: options.spreadSize * 0.9,
                starLife: options.starLife * 0.8,
                starLifeVariation: options.starLifeVariation,
                starCount: Math.floor(Math.max(6, options.spreadSize / 45)),
                color: COLOR.White,
                glitter: 'streamer'
            };
            burstShell(x, y, innerOptions);
        }

        // 添加爆炸闪光
        addBurstFlash(x, y, options.spreadSize / 4);
    }, [config.quality, addStar, addBurstFlash, crackleEffect, createBurst, createParticleArc]);

    // 发射烟花
    const launchShell = useCallback((targetX?: number, targetY?: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = canvas.width;
        const h = canvas.height;

        const launchX = targetX ?? random(w * 0.2, w * 0.8);
        const launchY = h;
        const burstY = targetY ?? random(h * 0.1, h * 0.4);

        const options = getShellOptions(config.shellType, config.shellSize, config.quality);

        // 创建彗星
        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        const comet = addStar(
            launchX, launchY,
            typeof options.color === 'string' && options.color !== INVISIBLE
                ? options.color
                : COLOR.White,
            Math.PI,
            launchVelocity * 1.0,
            launchVelocity * 400
        );

        comet.heavy = true;
        comet.spinRadius = random(0.32, 0.85);
        comet.sparkFreq = 32 / config.quality;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;

        if (options.glitter === 'willow' || options.fallingLeaves) {
            comet.sparkFreq = 20 / config.quality;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }

        if (options.color === INVISIBLE) {
            comet.sparkColor = COLOR.Gold;
        }

        // 随机让彗星提前"燃尽"
        if (Math.random() > 0.4 && !options.horsetail) {
            comet.secondColor = INVISIBLE;
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
        }

        comet.onDeath = () => {
            burstShell(comet.x, comet.y, options);
        };
    }, [config.shellType, config.shellSize, config.quality, addStar, burstShell]);

    // 点击发射
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        launchShell(x, y);
    }, [launchShell]);

    // 打字机效果
    useEffect(() => {
        const fullText = `${config.recipientName}\n\n${config.greetingText}`;
        let index = 0;

        const timer = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(timer);
                setShowGreeting(true);
            }
        }, 80);

        return () => clearInterval(timer);
    }, [config.recipientName, config.greetingText]);

    // 主渲染循环
    useEffect(() => {
        const canvas = canvasRef.current;
        const trailsCanvas = trailsCanvasRef.current;
        if (!canvas || !trailsCanvas || !containerRef.current) return;

        const ctx = canvas.getContext('2d');
        const trailsCtx = trailsCanvas.getContext('2d');
        if (!ctx || !trailsCtx) return;

        let rafId: number;
        const quality = config.quality;
        const skyLightingLevel = config.skyLighting;

        const resize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            canvas.width = w;
            canvas.height = h;
            trailsCanvas.width = w;
            trailsCanvas.height = h;
        };

        resize();
        window.addEventListener('resize', resize);

        // 天空照明计算
        const colorSky = (speed: number) => {
            const maxSkySaturation = skyLightingLevel * 15;
            const maxStarCount = 500;
            let totalStarCount = 0;

            targetSkyColorRef.current.r = 0;
            targetSkyColorRef.current.g = 0;
            targetSkyColorRef.current.b = 0;

            COLOR_CODES.forEach(color => {
                const tuple = COLOR_TUPLES[color];
                const count = starsRef.current[color].length;
                totalStarCount += count;
                targetSkyColorRef.current.r += tuple.r * count;
                targetSkyColorRef.current.g += tuple.g * count;
                targetSkyColorRef.current.b += tuple.b * count;
            });

            const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
            const maxColorComponent = Math.max(1,
                targetSkyColorRef.current.r,
                targetSkyColorRef.current.g,
                targetSkyColorRef.current.b
            );

            targetSkyColorRef.current.r = targetSkyColorRef.current.r / maxColorComponent * maxSkySaturation * intensity;
            targetSkyColorRef.current.g = targetSkyColorRef.current.g / maxColorComponent * maxSkySaturation * intensity;
            targetSkyColorRef.current.b = targetSkyColorRef.current.b / maxColorComponent * maxSkySaturation * intensity;

            const colorChange = 10;
            currentSkyColorRef.current.r += (targetSkyColorRef.current.r - currentSkyColorRef.current.r) / colorChange * speed;
            currentSkyColorRef.current.g += (targetSkyColorRef.current.g - currentSkyColorRef.current.g) / colorChange * speed;
            currentSkyColorRef.current.b += (targetSkyColorRef.current.b - currentSkyColorRef.current.b) / colorChange * speed;

            return `rgb(${currentSkyColorRef.current.r | 0}, ${currentSkyColorRef.current.g | 0}, ${currentSkyColorRef.current.b | 0})`;
        };

        const loop = (timestamp: number) => {
            const frameTime = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;
            const timeStep = Math.min(frameTime, 32);
            const speed = timeStep / 16;

            currentFrameRef.current++;

            const width = canvas.width;
            const height = canvas.height;

            // 自动发射
            if (config.autoLaunch) {
                autoLaunchTimeRef.current -= timeStep;
                if (autoLaunchTimeRef.current <= 0) {
                    launchShell();
                    if (config.finaleMode) {
                        finaleCountRef.current++;
                        if (finaleCountRef.current < 32) {
                            autoLaunchTimeRef.current = 170;
                        } else {
                            finaleCountRef.current = 0;
                            autoLaunchTimeRef.current = random(4000, 6000);
                        }
                    } else {
                        autoLaunchTimeRef.current = random(800, 2000);
                    }
                }
            }

            // 物理参数
            const starDrag = 1 - (1 - 0.98) * speed;
            const starDragHeavy = 1 - (1 - 0.992) * speed;
            const sparkDrag = 1 - (1 - 0.9) * speed;
            const gAcc = timeStep / 1000 * GRAVITY;

            // 更新粒子
            COLOR_CODES_W_INVIS.forEach(color => {
                // 更新星星
                const stars = starsRef.current[color];
                for (let i = stars.length - 1; i >= 0; i--) {
                    const star = stars[i];

                    if (star.updateFrame === currentFrameRef.current) continue;
                    star.updateFrame = currentFrameRef.current;

                    star.life -= timeStep;

                    if (star.life <= 0) {
                        stars.splice(i, 1);
                        returnStar(star);
                    } else {
                        const burnRate = Math.pow(star.life / star.fullLife, 0.5);
                        const burnRateInverse = 1 - burnRate;

                        star.prevX = star.x;
                        star.prevY = star.y;
                        star.x += star.speedX * speed;
                        star.y += star.speedY * speed;

                        if (!star.heavy) {
                            star.speedX *= starDrag;
                            star.speedY *= starDrag;
                        } else {
                            star.speedX *= starDragHeavy;
                            star.speedY *= starDragHeavy;
                        }
                        star.speedY += gAcc;

                        if (star.spinRadius) {
                            star.spinAngle += star.spinSpeed * speed;
                            star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                            star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                        }

                        // 生成火花
                        if (star.sparkFreq) {
                            star.sparkTimer -= timeStep;
                            while (star.sparkTimer < 0) {
                                star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                                addSpark(
                                    star.x, star.y,
                                    star.sparkColor,
                                    Math.random() * PI_2,
                                    Math.random() * star.sparkSpeed * burnRate,
                                    star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife
                                );
                            }
                        }

                        // 颜色过渡
                        if (star.life < star.transitionTime) {
                            if (star.secondColor && !star.colorChanged) {
                                star.colorChanged = true;
                                const oldColor = star.color;
                                star.color = star.secondColor;
                                stars.splice(i, 1);
                                starsRef.current[star.secondColor].push(star);
                                if (star.secondColor === INVISIBLE) {
                                    star.sparkFreq = 0;
                                }
                            }

                            if (star.strobe) {
                                star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
                            }
                        }
                    }
                }

                // 更新火花
                const sparks = sparksRef.current[color];
                for (let i = sparks.length - 1; i >= 0; i--) {
                    const spark = sparks[i];
                    spark.life -= timeStep;

                    if (spark.life <= 0) {
                        sparks.splice(i, 1);
                        returnSpark(spark);
                    } else {
                        spark.prevX = spark.x;
                        spark.prevY = spark.y;
                        spark.x += spark.speedX * speed;
                        spark.y += spark.speedY * speed;
                        spark.speedX *= sparkDrag;
                        spark.speedY *= sparkDrag;
                        spark.speedY += gAcc;
                    }
                }
            });

            // 渲染
            // 天空照明
            if (skyLightingLevel > 0) {
                const skyColor = colorSky(speed);
                trailsCanvas.style.backgroundColor = skyColor;
            }

            // 拖尾画布
            trailsCtx.globalCompositeOperation = 'source-over';
            trailsCtx.fillStyle = `rgba(0, 0, 0, 0.175)`;
            trailsCtx.fillRect(0, 0, width, height);

            // 主画布清除
            ctx.clearRect(0, 0, width, height);

            // 绘制爆炸闪光
            while (burstFlashesRef.current.length) {
                const bf = burstFlashesRef.current.pop()!;
                const gradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
                gradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
                gradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
                gradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
                trailsCtx.fillStyle = gradient;
                trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
            }

            trailsCtx.globalCompositeOperation = 'lighten';

            // 绘制星星
            const starDrawWidth = quality === 3 ? 3 : 2;
            trailsCtx.lineWidth = starDrawWidth;
            trailsCtx.lineCap = quality === 1 ? 'square' : 'round';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();

            COLOR_CODES.forEach(color => {
                const stars = starsRef.current[color];
                trailsCtx.strokeStyle = color;
                trailsCtx.beginPath();
                stars.forEach(star => {
                    if (star.visible) {
                        trailsCtx.moveTo(star.x, star.y);
                        trailsCtx.lineTo(star.prevX, star.prevY);
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
                    }
                });
                trailsCtx.stroke();
            });
            ctx.stroke();

            // 绘制火花
            const sparkDrawWidth = quality === 3 ? 0.75 : 1;
            trailsCtx.lineWidth = sparkDrawWidth;
            trailsCtx.lineCap = 'butt';

            COLOR_CODES.forEach(color => {
                const sparks = sparksRef.current[color];
                trailsCtx.strokeStyle = color;
                trailsCtx.beginPath();
                sparks.forEach(spark => {
                    trailsCtx.moveTo(spark.x, spark.y);
                    trailsCtx.lineTo(spark.prevX, spark.prevY);
                });
                trailsCtx.stroke();
            });

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [config.autoLaunch, config.finaleMode, config.skyLighting, config.quality, launchShell, addSpark, returnStar, returnSpark]);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 拖尾Canvas */}
            <canvas
                ref={trailsCanvasRef}
                className="absolute inset-0 z-10 block"
                style={{ width: '100%', height: '100%', mixBlendMode: 'lighten' }}
            />

            {/* 主烟花Canvas */}
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                className="absolute inset-0 z-20 block cursor-crosshair"
                style={{ width: '100%', height: '100%', mixBlendMode: 'lighten' }}
            />

            {/* 文字层 */}
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-8">
                <div className="text-center max-w-2xl">
                    {/* 标题 */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-pulse">
                        {config.titleText}
                    </h1>

                    {/* 打字机效果文字 */}
                    <div className="text-white/90 text-lg md:text-xl whitespace-pre-line leading-relaxed font-serif tracking-wide drop-shadow-lg">
                        {displayText}
                        <span className="animate-pulse text-yellow-400">|</span>
                    </div>
                </div>
            </div>

            {/* 点击提示 */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                <div className="text-white/60 text-sm animate-bounce">
                    ✨ 点击屏幕任意位置发射烟花 ✨
                </div>
            </div>

            {/* 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />
        </div>
    );
}

export default function RomanticFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}

export { DEFAULT_CONFIG, romanticFireworksCardConfigMetadata, romanticFireworksConfigMetadata };
