'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';
import { P5CanvasInstance, Sketch } from 'react-p5-wrapper';

// 动态导入 ReactP5Wrapper 以避免 SSR 问题
const ReactP5Wrapper = dynamic(
    () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
    { ssr: false }
);

/**
 * ==============================================================================
 * 1. 核心配置定义 (Core Configuration)
 * ==============================================================================
 */

export interface AppConfig {
    // 核心内容
    centerImage: string;
    particleImage: string;

    // 物理参数
    particleCount: number;
    orbitSpeed: number;
    fallSpeed: number;
    turbulence: number;

    // 视觉参数
    centerSize: number;
    particleSize: number;

    // 场景与音效
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: [
        ...GLOBAL_BG_PRESETS.basicColors,
        ...GLOBAL_BG_PRESETS.lightColors,
        { label: '金色大厅', value: 'https://images.unsplash.com/photo-1565514020176-db711bd40902?q=80&w=2600&auto=format&fit=crop', type: 'image' as const },
    ],
    music: [
        { label: 'Jazz Comedy', value: 'https://cdn.pixabay.com/audio/2022/03/25/audio_51d451369f.mp3' },
        { label: 'Happy Swing', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_c36142750e.mp3' },
        { label: 'Cha Ching', value: 'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/audio/kaching.mp3' },
    ],
    images: {
        cat: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1000&auto=format&fit=crop',
        bill: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
        coin: 'https://images.unsplash.com/photo-1621504455581-71fb342b4b45?q=80&w=600&auto=format&fit=crop', // 金币备选
    }
};

export const DEFAULT_CONFIG: AppConfig = {
    centerImage: PRESETS.images.cat,
    particleImage: PRESETS.images.bill,
    particleCount: 200, // 默认不宜过多，以免卡顿
    orbitSpeed: 2.5,
    fallSpeed: 2.5,
    turbulence: 60,
    centerSize: 200,
    particleSize: 80,

    bgValue: '#080808',
    bgConfig: createBgConfigWithOverlay({ type: 'color', value: '#080808' }, 0),
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// 配置元数据
export const moneySwirlConfigMetadata = {
    panelTitle: '招财进宝配置',
    panelSubtitle: 'Prosperity Vortex Generator',
    configSchema: {
        // 1. 场景
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景氛围',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
        enableSound: { category: 'background' as const, type: 'switch' as const, label: '播放音效' },

        // 2. 内容
        centerImage: {
            category: 'content' as const,
            type: 'input' as const,
            label: '中心图像',
            description: '输入图片URL'
        },
        particleImage: {
            category: 'content' as const,
            type: 'input' as const,
            label: '飘落元素',
            description: '输入图片URL'
        },

        // 3. 动态
        particleCount: { category: 'visual' as const, label: '粒子数量', type: 'slider' as const, min: 50, max: 500, step: 10 },
        orbitSpeed: { category: 'visual' as const, label: '旋转速度', type: 'slider' as const, min: 0.5, max: 10, step: 0.5 },
        fallSpeed: { category: 'visual' as const, label: '下落速度', type: 'slider' as const, min: 0.5, max: 10, step: 0.5 },
        turbulence: { category: 'visual' as const, label: '气流扰动', type: 'slider' as const, min: 0, max: 200, step: 10 },
        centerSize: { category: 'visual' as const, label: '中心尺寸', type: 'slider' as const, min: 50, max: 400, step: 10 },
        particleSize: { category: 'visual' as const, label: '粒子尺寸', type: 'slider' as const, min: 20, max: 150, step: 5 },
    },
    tabs: [
        { id: 'content' as const, label: '内容', icon: null },
        { id: 'background' as const, label: '场景', icon: null },
        { id: 'visual' as const, label: '动态', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '内容定制', fields: ['centerImage' as const, 'particleImage' as const] },
        { id: 2, label: '场景氛围', fields: ['bgValue' as const], bgMusicUrl: 'bgMusicUrl' as const },
        { id: 3, label: '动态调整', fields: ['particleCount' as const, 'orbitSpeed' as const, 'fallSpeed' as const] },
    ],
};

/**
 * ==============================================================================
 * 2. P5 Sketch Logic
 * ==============================================================================
 */

interface MySketchProps {
    config: AppConfig;
    [key: string]: any;
}

const sketch: Sketch<MySketchProps> = (p5) => {
    let imgCenter: any;
    let imgParticle: any;
    let bills: Bill[] = [];

    // 缓存当前配置
    let currentConfig: AppConfig = DEFAULT_CONFIG;

    // 资源加载状态
    let lastCenterUrl = '';
    let lastParticleUrl = '';

    class Bill {
        baseRadius: number;
        angle: number;
        y: number;
        fallSpeed: number;
        rot: any;
        rotSpeed: any;
        noiseOffset: number;
        finalRadius: number = 0;

        constructor() {
            // 基础半径：决定它在漩涡的哪一层
            this.baseRadius = p5.random(100, 350);
            this.angle = p5.random(p5.TWO_PI);
            // 分布高度范围
            this.y = p5.random(-700, 700);
            this.fallSpeed = p5.random(currentConfig.fallSpeed * 0.5, currentConfig.fallSpeed * 1.5);

            this.rot = p5.createVector(p5.random(p5.TWO_PI), p5.random(p5.TWO_PI), p5.random(p5.TWO_PI));
            this.rotSpeed = p5.createVector(
                p5.random(-0.08, 0.08),
                p5.random(-0.08, 0.08),
                p5.random(-0.08, 0.08)
            );
            this.noiseOffset = p5.random(10000);
        }

        update() {
            // 动态更新速度
            const speedFactor = p5.map(currentConfig.fallSpeed, 0, 10, 0.5, 2);

            // 1. 漏斗形态计算
            // 顶部宽，底部窄
            let funnelFactor = p5.map(this.y, -700, 700, 1.4, 0.6);
            let currentOrbitRadius = this.baseRadius * funnelFactor;

            // 2. 涡流速度
            let dynamicSpeed = (currentConfig.orbitSpeed * 0.01) / p5.max(currentOrbitRadius * 0.005, 0.1);
            this.angle += dynamicSpeed;

            // 3. 垂直下落
            let speedMod = p5.map(currentOrbitRadius, 100, 350, 1.5, 0.8);
            this.y += (this.fallSpeed * speedFactor) * speedMod;

            // 4. 气流扰动
            let turbulence = (p5.noise(this.noiseOffset + p5.frameCount * 0.01) - 0.5) * currentConfig.turbulence;
            this.finalRadius = currentOrbitRadius + turbulence;

            // 5. 边界循环
            if (this.y > 700) {
                this.y = -700;
                this.baseRadius = p5.random(100, 350);
            }

            // 6. 翻滚更新
            this.rot.add(this.rotSpeed);
        }

        display() {
            p5.push();
            let x = p5.cos(this.angle) * this.finalRadius;
            let z = p5.sin(this.angle) * this.finalRadius;

            p5.translate(x, this.y, z);

            p5.rotateX(this.rot.x);
            p5.rotateY(this.rot.y);
            p5.rotateZ(this.rot.z);

            if (imgParticle) {
                p5.texture(imgParticle);
                // 适当调整比例
                p5.plane(currentConfig.particleSize, currentConfig.particleSize * 0.45);
            } else {
                p5.fill(212, 175, 55); // 金色兜底
                p5.box(currentConfig.particleSize / 2);
            }

            p5.pop();
        }
    }

    p5.setup = () => {
        // 创建画布，WEBGL模式
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
        // 启用透明背景，配合 BackgroundRenderer
        p5.setAttributes('alpha', true);
    };

    p5.updateWithProps = (props: MySketchProps) => {
        if (props.config) {
            currentConfig = props.config;

            // 处理图片加载
            if (currentConfig.centerImage !== lastCenterUrl) {
                lastCenterUrl = currentConfig.centerImage;
                p5.loadImage(currentConfig.centerImage, (img) => { imgCenter = img; });
            }
            if (currentConfig.particleImage !== lastParticleUrl) {
                lastParticleUrl = currentConfig.particleImage;
                p5.loadImage(currentConfig.particleImage, (img) => { imgParticle = img; });
            }

            // 动态调整粒子数量
            const diff = currentConfig.particleCount - bills.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) bills.push(new Bill());
            } else if (diff < 0) {
                bills.splice(0, -diff);
            }
        }
    };

    p5.draw = () => {
        // 关键：透明清空，不覆盖背景
        p5.clear(0, 0, 0, 0);
        // 或者使用的 p5.background(0, 0) 如果 clear 不起作用，但在 WEBGL 下 clear 通常用于透明

        // 灯光
        p5.ambientLight(150);
        p5.pointLight(255, 215, 0, 500, -500, 500); // 金光
        p5.pointLight(200, 200, 255, -500, 500, 500); // 补光

        // 交互控制 (允许用户旋转视角)
        p5.orbitControl();

        // 渲染中心物体
        p5.push();
        let floatY = p5.sin(p5.frameCount * 0.02) * 20;
        p5.translate(0, floatY, 0);
        p5.rotateY(p5.frameCount * 0.01);

        if (imgCenter) {
            p5.texture(imgCenter);
            p5.noStroke();
            p5.plane(currentConfig.centerSize, currentConfig.centerSize);
        } else {
            // 兜底 placeholder
            p5.fill(255);
            p5.plane(currentConfig.centerSize, currentConfig.centerSize);
        }
        p5.pop();

        // 渲染粒子
        p5.noStroke();
        for (let bill of bills) {
            bill.update();
            bill.display();
        }
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
};

/**
 * ==============================================================================
 * 3. 核心展示组件 (DisplayUI)
 * ==============================================================================
 */

export function DisplayUI({ config }: { config: AppConfig }) {
    const {
        isPlaying,
        isMuted,
        handlePlayPause,
        handleToggleMute,
    } = useAudioControl({
        musicUrl: config.bgMusicUrl,
        enabled: config.enableSound,
        volume: 0.5,
    });

    const effectiveBgConfig = useMemo(() => {
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. P5 Canvas 层 (使用 react-p5-wrapper) */}
            <div className="absolute inset-0 z-10">
                <ReactP5Wrapper sketch={sketch} config={config} />
            </div>

            {/* 3. 音效控制 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="bottom-right"
            />
        </div>
    );
}
