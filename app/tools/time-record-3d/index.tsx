'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig } from '@/utils/background-parser';
import { Sketch } from 'react-p5-wrapper';
import { AppConfig, DEFAULT_CONFIG } from './config';

// Re-export config for registry
export { timeRecordConfigMetadata, DEFAULT_CONFIG, PRESETS } from './config';
export type { AppConfig } from './config';

const ReactP5Wrapper = dynamic(
    () => import('react-p5-wrapper').then((mod) => mod.ReactP5Wrapper),
    { ssr: false }
);

interface MySketchProps {
    config: AppConfig;
    [key: string]: any;
}

const sketch: Sketch<MySketchProps> = (p5) => {
    let currentConfig: AppConfig = DEFAULT_CONFIG;
    let eventNodes: EventNode[] = [];
    let particles: Particle[] = [];
    let textTextures: Map<string, any> = new Map();
    let imageCache: Map<string, any> = new Map();

    // Camera State
    let targetCamPos: any;
    let currentCamPos: any;
    let targetCamLookAt: any;
    let currentCamLookAt: any;
    let cam: any;

    // Smooth transition
    let isTransitioning = false;
    let transitionProgress = 0;

    // User interaction
    let selectedNodeIndex = -1;

    // Fonts
    let globalFont: string = 'Inter, sans-serif';

    class Particle {
        pos: any;
        vel: any;
        life: number;
        maxLife: number;
        color: any;
        size: number;
        offset: number;

        constructor() {
            this.maxLife = p5.random(100, 300);
            this.size = p5.random(2, 6);
            this.offset = p5.random(100);
            this.pos = p5.createVector(p5.random(-300, 300), p5.random(-300, 300), p5.random(-300, 300));
            this.vel = p5.createVector(p5.random(-0.5, 0.5), p5.random(-0.5, 0.5), p5.random(-0.5, 0.5));
            this.life = this.maxLife;
            const c = p5.color(currentConfig.particleColor || '#f472b6');
            c.setAlpha(p5.random(50, 150));
            this.color = c;
        }

        reset() {
            // Spawn around the helix area
            const r = currentConfig.helixRadius * p5.random(0.5, 2.0);
            const theta = p5.random(p5.TWO_PI);
            const h = (eventNodes.length * currentConfig.helixSpacing) || 1000;
            const y = p5.random(-h / 2 - 200, h / 2 + 200);

            this.pos = p5.createVector(r * p5.cos(theta), y, r * p5.sin(theta));
            this.vel = p5.createVector(0, p5.random(-0.2, -0.5), 0); // Float up gently
            this.maxLife = p5.random(200, 400);
            this.life = this.maxLife;
            this.size = p5.random(2, 6);

            // Soft color from config
            const c = p5.color(currentConfig.particleColor || '#f472b6');
            c.setAlpha(p5.random(50, 150));
            this.color = c;
        }

        update() {
            this.pos.add(this.vel);
            // Wiggle
            this.pos.x += p5.sin(p5.frameCount * 0.01 + this.offset) * 0.2;
            this.pos.z += p5.cos(p5.frameCount * 0.01 + this.offset) * 0.2;

            this.life -= 1;
            if (this.life < 0) this.reset();
        }

        display() {
            p5.push();
            p5.translate(this.pos.x, this.pos.y, this.pos.z);
            p5.noStroke();
            // Pulse opacity
            const alpha = p5.map(p5.sin(p5.frameCount * 0.05 + this.offset), -1, 1, 50, 200) * (this.life / this.maxLife);
            this.color.setAlpha(alpha);
            p5.fill(this.color);
            p5.sphere(this.size);
            p5.pop();
        }
    }

    class EventNode {
        idx: number;
        date: string;
        location: string;
        content: string;
        imageUrl: string;
        p5Image: any;
        pos: any;

        // Visuals
        isHovered: boolean = false;
        isSelected: boolean = false;

        constructor(idx: number, data: string) {
            this.idx = idx;
            if (typeof data === 'string') {
                const parts = data.split('|').map(s => s.trim());
                this.date = parts[0] || '';
                this.location = parts[1] || '';
                this.content = parts[2] || '';
                this.imageUrl = parts[3] || '';
            } else {
                this.date = '2025';
                this.location = 'Unknown';
                this.content = '';
                this.imageUrl = '';
            }
            this.pos = p5.createVector(0, 0, 0);
            this.updatePos();

            if (this.imageUrl) {
                if (imageCache.has(this.imageUrl)) {
                    this.p5Image = imageCache.get(this.imageUrl);
                } else {
                    p5.loadImage(this.imageUrl, (img: any) => {
                        this.p5Image = img;
                        imageCache.set(this.imageUrl, img);
                    });
                }
            }
        }

        updatePos() {
            const spacing = currentConfig.helixSpacing || 120;
            const radius = currentConfig.helixRadius || 180;
            const angleStep = p5.TWO_PI / 4; // 90 degrees separation
            const angle = this.idx * angleStep;
            // Center the helix vertically
            const totalHeight = (eventNodes.length - 1) * spacing;
            const y = this.idx * spacing - totalHeight / 2;

            this.pos.x = radius * p5.cos(angle);
            this.pos.z = radius * p5.sin(angle);
            this.pos.y = y;
        }

        display() {
            const { x, y, z } = this.pos;

            // Check hover (raycasting approximation or simpler)
            // In 3D without raycaster, we can check screen distance if projected
            // But let's rely on global interaction handler to set isSelected.

            p5.push();
            p5.translate(x, y, z);

            // 1. Draw Connection Line to Axis (Soft gentle line)
            p5.stroke(255, 100);
            p5.strokeWeight(1);
            p5.line(0, 0, 0, -x * 0.8, 0, -z * 0.8); // Not all the way to center

            // 2. Draw Node Marker (Small sphere on the track)
            p5.noStroke();
            p5.fill(currentConfig.trackColorStart);
            p5.sphere(6);

            // 3. Draw Card
            // Face camera: We need to rotate to face the camera position
            // But for style, let's have them face "outward" from helix center + slight tilt up
            const angle = p5.atan2(z, x);
            p5.rotateY(-angle - p5.HALF_PI); // Face outward
            p5.rotateY(p5.PI); // Correct orientation

            // Card Container
            const cardW = 180;
            const cardH = 220;
            const isSelected = (selectedNodeIndex === this.idx);

            // Scale up on selection
            const scale = isSelected ? 1.2 : 1.0;
            p5.scale(scale);

            // Shadow
            p5.push();
            p5.translate(5, 5, -2);
            p5.fill(0, 20);
            p5.plane(cardW, cardH);
            p5.pop();

            // Card Background
            p5.noStroke();
            p5.fill(currentConfig.cardColor || '#fff');

            // Draw rounded rect using simple plane for now (p5 webgl doesn't have rect with radius natively easily)
            // We can use a texture for the card base or just a plane.
            // Let's use plane.
            p5.plane(cardW, cardH);

            // Content on Card
            p5.push();
            p5.translate(0, 0, 1); // Move slightly forward

            // Image Area
            const imgH = 120;
            const imgW = 160;
            p5.push();
            p5.translate(0, -cardH / 2 + imgH / 2 + 10, 1);
            if (this.p5Image) {
                p5.texture(this.p5Image);
                // Cover fit
                let aspect = this.p5Image.width / this.p5Image.height;
                let drawW = imgW;
                let drawH = imgW / aspect;
                if (drawH < imgH) {
                    drawH = imgH;
                    drawW = imgH * aspect;
                }
                // We should actually crop, but textureMode(NORMAL) is complex here.
                // Just fit width
                p5.plane(imgW, imgH);
            } else {
                p5.fill(240); // Placeholder grey
                p5.plane(imgW, imgH);
                p5.fill(150);
                p5.textSize(12);
                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.text("No Image", 0, 0);
            }
            p5.pop();

            // Text Info
            const tex = this.getTexture();
            if (tex) {
                p5.push();
                p5.translate(0, 30, 2);
                p5.texture(tex);
                p5.plane(160, 80);
                p5.pop();
            }

            p5.pop(); // End Content

            p5.pop(); // End transform
        }

        getTexture() {
            const key = `${this.date}-${this.location}-${this.content}-${currentConfig.textColor}`;
            if (textTextures.has(key)) return textTextures.get(key);

            const pg = p5.createGraphics(320, 160);
            // pg.background(255, 0, 0, 100); // Debug
            pg.fill(currentConfig.textColor || '#475569');
            pg.textAlign(p5.CENTER, p5.TOP);

            // Date
            pg.textSize(24);
            pg.textStyle(p5.BOLD);
            pg.text(this.date, pg.width / 2, 10);

            // Location
            pg.textSize(18);
            pg.textStyle(p5.NORMAL);
            pg.fill(currentConfig.trackColorEnd || '#93c5fd'); // Accent color
            pg.text(`📍 ${this.location}`, pg.width / 2, 45);

            // Content
            pg.fill(currentConfig.textColor || '#475569');
            pg.textSize(22);
            pg.textLeading(30);
            pg.rectMode(p5.CENTER);
            pg.text(this.content, pg.width / 2, 80, 280, 80); // Text wrap box

            textTextures.set(key, pg);
            return pg;
        }
    }

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
        p5.setAttributes('alpha', true);

        cam = p5.createCamera();

        // Initial particles
        for (let i = 0; i < 50; i++) particles.push(new Particle());

        currentCamPos = p5.createVector(0, 0, 800);
        currentCamLookAt = p5.createVector(0, 0, 0);
        targetCamPos = currentCamPos.copy();
        targetCamLookAt = currentCamLookAt.copy();
    };

    p5.updateWithProps = (props: MySketchProps) => {
        if (props.config) {
            const oldConfig = currentConfig;
            currentConfig = props.config;

            // Rebuild nodes if events changed
            // Simple check by length or string content
            const events = currentConfig.events || [];
            const needsRebuild = events.length !== eventNodes.length || events.some((e: any, i: number) => {
                let str = (typeof e === 'string') ? e : `${e.date}|${e.location}`;
                let oldStr = eventNodes[i] ? `${eventNodes[i].date}|${eventNodes[i].location}|${eventNodes[i].content}|${eventNodes[i].imageUrl}` : '';
                // Loose check, or just rebuild always to be safe and simple
                return true;
            });

            if (needsRebuild) {
                eventNodes = events.map((e: any, i: number) => {
                    let str = '';
                    if (typeof e === 'string') str = e;
                    else str = `${e.date} | ${e.location} | ${e.content} | ${e.image || ''}`;
                    return new EventNode(i, str);
                });
            } else {
                // Update positions only if radius/spacing changed
                eventNodes.forEach(node => node.updatePos());
            }

            // Update font color cache
            if (oldConfig.textColor !== currentConfig.textColor) {
                textTextures.clear();
            }
        }
    };

    p5.draw = () => {
        p5.clear(0, 0, 0, 0);

        // Lights - Soft and warm
        p5.ambientLight(200);
        p5.pointLight(255, 240, 220, 0, -500, 500);
        p5.pointLight(200, 220, 255, 0, 500, -500);

        // --- Camera Logic ---
        if (selectedNodeIndex !== -1 && eventNodes[selectedNodeIndex]) {
            const targetNode = eventNodes[selectedNodeIndex];

            // Position camera "in front" of the card
            // Node is at targetNode.pos
            // Card faces outward from center (0,y,0) -> pos

            // Calculate a point slightly in front of the card
            const nodePos = targetNode.pos;
            const dist = 500; // Zoom distance

            // Direction from axis
            const dir = p5.createVector(nodePos.x, 0, nodePos.z).normalize();

            targetCamPos = p5.createVector(
                nodePos.x + dir.x * dist,
                nodePos.y + 50, // Slightly above
                nodePos.z + dir.z * dist
            );
            targetCamLookAt = nodePos.copy();

        } else {
            // Overview mode - rotating slowly
            const rotSpeed = 0.002;
            const radius = 800; // Farther out
            const x = radius * p5.sin(p5.frameCount * rotSpeed);
            const z = radius * p5.cos(p5.frameCount * rotSpeed);
            targetCamPos = p5.createVector(x, 0, z); // Look at center
            targetCamLookAt = p5.createVector(0, 0, 0);
        }

        // Smooth Lerp Camera
        currentCamPos.lerp(targetCamPos, 0.05);
        currentCamLookAt.lerp(targetCamLookAt, 0.05);
        cam.setPosition(currentCamPos.x, currentCamPos.y, currentCamPos.z);
        cam.lookAt(currentCamLookAt.x, currentCamLookAt.y, currentCamLookAt.z);

        // --- Draw Scene ---

        // 1. Draw Helix Track (Gradient Curve)
        drawHelixTrack();

        // 2. Draw Nodes
        for (let node of eventNodes) {
            node.display();
        }

        // 3. Draw Particles (Ambient)
        // Add new particles occasionally
        if (p5.frameCount % 10 === 0 && particles.length < 100) {
            particles.push(new Particle());
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.display();
        }
    };

    function drawHelixTrack() {
        if (eventNodes.length < 2) return;

        p5.noFill();
        p5.strokeWeight(4);

        const spacing = currentConfig.helixSpacing || 100;
        const radius = currentConfig.helixRadius || 200;
        const totalH = eventNodes.length * spacing;
        const startY = -(totalH / 2) - 100;
        const endY = (totalH / 2) + 100;

        // Draw segment by segment for gradient
        const steps = 200;
        const colorStart = p5.color(currentConfig.trackColorStart);
        const colorEnd = p5.color(currentConfig.trackColorEnd);

        p5.beginShape();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const y = p5.lerp(startY, endY, t);

            // Angle maps to Y
            // Twist factor
            const angle = (y / spacing) * (p5.TWO_PI / 4);

            const x = radius * p5.cos(angle);
            const z = radius * p5.sin(angle);

            // Gradient stroke is hard in beginShape without shaders/texture
            // But we can just draw small line segments
            const c = p5.lerpColor(colorStart, colorEnd, t);
            p5.stroke(c);
            p5.vertex(x, y, z);

            // If we really want gradient, we must break shape or use shader.
            // Breaking shape is expensive for performance? 200 lines is fine.
        }
        p5.endShape();

        // Let's redo with separate lines for gradient
        for (let i = 0; i < steps; i++) {
            const t1 = i / steps;
            const t2 = (i + 1) / steps;
            const y1 = p5.lerp(startY, endY, t1);
            const y2 = p5.lerp(startY, endY, t2);

            const angle1 = (y1 / spacing) * (p5.TWO_PI / 4);
            const angle2 = (y2 / spacing) * (p5.TWO_PI / 4);

            const x1 = radius * p5.cos(angle1);
            const z1 = radius * p5.sin(angle1);
            const x2 = radius * p5.cos(angle2);
            const z2 = radius * p5.sin(angle2);

            const c = p5.lerpColor(colorStart, colorEnd, t1);
            p5.stroke(c);
            p5.line(x1, y1, z1, x2, y2, z2);
        }
    }

    p5.mouseClicked = () => {
        // Simple hit detection
        // Raycasting is best, but since nodes are large, we can iterate and check screen pos
        let closestNode = -1;
        let closestDist = 1000; // Threshold

        // Project nodes to screen
        for (let i = 0; i < eventNodes.length; i++) {
            const node = eventNodes[i];
            // Manually project?
            // screenPosition is available in WEBGL mode in newer p5, but sometimes buggy.
            // Let's try screenPosition if available

            // NOTE: p5 types might not have screenPosition defined in TS definition, need cast
            if ((p5 as any).screenPosition) {
                const screenPos = (p5 as any).screenPosition(node.pos.x, node.pos.y, node.pos.z);
                // screenPos is (-width/2, width/2). Mouse is (0, width).
                const sx = screenPos.x + p5.width / 2;
                const sy = screenPos.y + p5.height / 2;

                const d = p5.dist(p5.mouseX, p5.mouseY, sx, sy);
                if (d < 100) { // Hit radius
                    if (d < closestDist) {
                        closestDist = d;
                        closestNode = i;
                    }
                }
            }
        }

        if (closestNode !== -1) {
            if (selectedNodeIndex === closestNode) {
                // Deselect
                selectedNodeIndex = -1;
            } else {
                selectedNodeIndex = closestNode;
            }
        } else {
            // Click empty space -> deselect
            selectedNodeIndex = -1;
        }
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
};

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
        <div className="fixed inset-0 w-full h-full overflow-hidden font-sans select-none">
            <div className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000">
                <BackgroundRenderer config={effectiveBgConfig} />
                {/* Overlay gradient for haze */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent pointer-events-none mix-blend-soft-light" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-white/10 pointer-events-none" />
            </div>

            <div className="absolute inset-0 z-10 cursor-pointer">
                <ReactP5Wrapper sketch={sketch} config={config} />
            </div>

            {/* Title Overlay - Minimalist */}
            <div className="absolute top-10 left-0 right-0 z-20 pointer-events-none text-center animate-fade-in-down">
                <h1 className="text-2xl md:text-4xl text-slate-700 tracking-[0.2em] font-light drop-shadow-sm font-serif">
                    {config.title}
                </h1>
                <p className="mt-2 text-md md:text-lg text-slate-500 font-light tracking-widest uppercase">
                    {config.coupleName}
                </p>
            </div>

            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={handlePlayPause}
                onToggleMute={handleToggleMute}
                enabled={config.enableSound}
                position="bottom-right"
            />

            <style jsx global>{`
              @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-20px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-down {
                animation: fade-in-down 1.5s ease-out forwards;
              }
            `}</style>
        </div>
    );
}

export default function TimeRecordPage() {
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
