'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { Sketch } from 'react-p5-wrapper';

// 导入配置
import {
    AppConfig,
    DEFAULT_CONFIG,
    PRESETS,
} from './config';

// 重新导出配置供外部使用
export type { AppConfig };
export { DEFAULT_CONFIG, PRESETS };
export { moneySwirlConfigMetadata } from './config';

// 动态导入 ReactP5Wrapper 以避免 SSR 问题
const ReactP5Wrapper = dynamic(
    () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
    { ssr: false }
);

/**
 * ==============================================================================
 * P5 Sketch Logic
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

    let currentConfig: AppConfig = DEFAULT_CONFIG;

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
            this.baseRadius = p5.random(100, 350);
            this.angle = p5.random(p5.TWO_PI);
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
            const speedFactor = p5.map(currentConfig.fallSpeed, 0, 10, 0.5, 2);
            let funnelFactor = p5.map(this.y, -700, 700, 1.4, 0.6);
            let currentOrbitRadius = this.baseRadius * funnelFactor;
            let dynamicSpeed = (currentConfig.orbitSpeed * 0.01) / p5.max(currentOrbitRadius * 0.005, 0.1);
            this.angle += dynamicSpeed;
            let speedMod = p5.map(currentOrbitRadius, 100, 350, 1.5, 0.8);
            this.y += (this.fallSpeed * speedFactor) * speedMod;
            let turbulence = (p5.noise(this.noiseOffset + p5.frameCount * 0.01) - 0.5) * currentConfig.turbulence;
            this.finalRadius = currentOrbitRadius + turbulence;

            if (this.y > 700) {
                this.y = -700;
                this.baseRadius = p5.random(100, 350);
            }

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
                p5.plane(currentConfig.particleSize, currentConfig.particleSize * 0.45);
            } else {
                p5.fill(212, 175, 55);
                p5.box(currentConfig.particleSize / 2);
            }

            p5.pop();
        }
    }

    p5.setup = () => {
        const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
        p5.setAttributes('alpha', true);
    };

    p5.updateWithProps = (props: MySketchProps) => {
        if (props.config) {
            currentConfig = props.config;

            if (currentConfig.centerImage !== lastCenterUrl) {
                lastCenterUrl = currentConfig.centerImage;
                p5.loadImage(currentConfig.centerImage, (img) => { imgCenter = img; });
            }
            if (currentConfig.particleImage !== lastParticleUrl) {
                lastParticleUrl = currentConfig.particleImage;
                p5.loadImage(currentConfig.particleImage, (img) => { imgParticle = img; });
            }

            const diff = currentConfig.particleCount - bills.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) bills.push(new Bill());
            } else if (diff < 0) {
                bills.splice(0, -diff);
            }
        }
    };

    p5.draw = () => {
        p5.clear(0, 0, 0, 0);

        p5.ambientLight(150);
        p5.pointLight(255, 215, 0, 500, -500, 500);
        p5.pointLight(200, 200, 255, -500, 500, 500);

        p5.orbitControl();

        p5.push();
        let floatY = p5.sin(p5.frameCount * 0.02) * 20;
        p5.translate(0, floatY, 0);
        p5.rotateY(p5.frameCount * 0.01);

        if (imgCenter) {
            p5.texture(imgCenter);
            p5.noStroke();
            p5.plane(currentConfig.centerSize, currentConfig.centerSize);
        } else {
            p5.fill(255);
            p5.plane(currentConfig.centerSize, currentConfig.centerSize);
        }
        p5.pop();

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
 * 核心展示组件 (DisplayUI)
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

            {/* 2. P5 Canvas 层 */}
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
