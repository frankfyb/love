/**
 * ==============================================================================
 * birthday-wish 效果层组件
 * 包含：FloatingHeartsLayer、SparklesLayer
 * ==============================================================================
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// ============================================================================
// FloatingHeart 类型
// ============================================================================

interface FloatingHeart {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    speed: number;
    swaySpeed: number;
    color: string;
}

// ============================================================================
// FloatingHeartsLayer 组件 - 飘落爱心
// ============================================================================

interface FloatingHeartsLayerProps {
    enabled: boolean;
    color: string;
}

export function FloatingHeartsLayer({ enabled, color }: FloatingHeartsLayerProps) {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const heartId = useRef(0);

    const heartColors = useMemo(() => [
        color,
        '#ff69b4',
        '#ff1493',
        '#ffb6c1',
        '#ffc0cb',
        '#ff6b9d',
    ], [color]);

    useEffect(() => {
        if (!enabled) {
            setHearts([]);
            return;
        }

        const createHeart = (): FloatingHeart => ({
            id: heartId.current++,
            x: Math.random() * 100,
            y: -10,
            size: Math.random() * 14 + 10,
            opacity: Math.random() * 0.5 + 0.3,
            rotation: Math.random() * 360,
            speed: Math.random() * 0.6 + 0.2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            color: heartColors[Math.floor(Math.random() * heartColors.length)],
        });

        const initialHearts = Array.from({ length: 6 }, createHeart).map((h) => ({
            ...h,
            y: Math.random() * 100,
        }));
        setHearts(initialHearts);

        let time = 0;
        const animate = () => {
            time += 1;

            setHearts(prev => {
                let newHearts = prev
                    .map(heart => ({
                        ...heart,
                        y: heart.y + heart.speed,
                        x: heart.x + Math.sin(time * heart.swaySpeed) * 0.25,
                        rotation: heart.rotation + 0.4,
                    }))
                    .filter(heart => heart.y < 110);

                if (Math.random() < 0.025 && newHearts.length < 12) {
                    newHearts = [...newHearts, createHeart()];
                }

                return newHearts;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [heartColors, enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="absolute"
                    style={{
                        left: `${heart.x}%`,
                        top: `${heart.y}%`,
                        fontSize: `${heart.size}px`,
                        opacity: heart.opacity,
                        transform: `rotate(${heart.rotation}deg)`,
                        color: heart.color,
                        textShadow: `0 0 10px ${heart.color}`,
                    }}
                >
                    ❤
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// SparklesLayer 组件 - 星光闪烁
// ============================================================================

interface SparklesLayerProps {
    enabled: boolean;
}

export function SparklesLayer({ enabled }: SparklesLayerProps) {
    const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

    useEffect(() => {
        if (!enabled) {
            setSparkles([]);
            return;
        }

        const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 50;
        const newSparkles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 3,
        }));
        setSparkles(newSparkles);
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-5">
            {sparkles.map(sparkle => (
                <div
                    key={sparkle.id}
                    className="absolute"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        fontSize: `${sparkle.size + 8}px`,
                        animation: `sparkle-twinkle 2s ease-in-out ${sparkle.delay}s infinite`,
                        opacity: 0.7,
                    }}
                >
                    ✨
                </div>
            ))}
        </div>
    );
}
