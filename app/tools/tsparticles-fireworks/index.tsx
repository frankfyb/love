'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudioControl } from '@/hooks/useAudioControl';
import AudioControlPanel from '@/components/common/AudioControlPanel';
import { BackgroundRenderer } from '@/components/common/BackgroundRenderer';
import { parseBgValueToConfig, createBgConfigWithOverlay } from '@/utils/background-parser';
import { GLOBAL_BG_PRESETS } from '@/constants/bg-presets';
import type { StandardBgConfig } from '@/types/background';

/**
 * ==============================================================================
 * 梦幻粒子烟花 - 基于 tsParticles 的流畅烟花效果
 * 特点：流畅的粒子动画 + 真实的烟花物理 + 自带声音
 * ==============================================================================
 */

export interface AppConfig {
    titleText: string;
    recipientName: string;
    greetings: string[];
    autoLaunch: boolean;
    density: number; // 烟花发射频率
    soundVolume: number;
    bgConfig?: StandardBgConfig;
    bgValue?: string;
    bgMusicUrl: string;
    enableSound: boolean;
}

export const PRESETS = {
    backgrounds: GLOBAL_BG_PRESETS.getToolPresets('tsparticles-fireworks'),
    music: [
        { label: '新年祝福音乐', value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3' },
        { label: '欢快节日', value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
        { label: '浪漫钢琴', value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3' },
    ],
    greetingTemplates: [
        '✨ 新年快乐 ✨',
        '🧨 万事如意 🧨',
        '❤ 岁岁平安 ❤',
        '💰 恭喜发财 💰',
        '🌸 前程似锦 🌸',
        '平安喜乐',
        '大吉大利',
        '恭贺新春',
        '新春快乐',
    ],
};

export const DEFAULT_CONFIG: AppConfig = {
    titleText: '梦幻粒子烟花夜',
    recipientName: '亲爱的你',
    greetings: PRESETS.greetingTemplates,
    autoLaunch: true,
    density: 50,
    soundVolume: 50,
    bgConfig: createBgConfigWithOverlay({
        type: 'color' as const,
        value: '#000000',
    }, 0),
    bgValue: '#000000',
    bgMusicUrl: PRESETS.music[0].value,
    enableSound: true,
};

// tsParticles 烟花完整配置
const createFireworksConfig = (density: number, soundVolume: number, enableSound: boolean) => ({
    fullScreen: { enable: false },
    detectRetina: true,
    background: {
        color: 'transparent',
    },
    fpsLimit: 120,
    emitters: {
        direction: 'top',
        life: {
            count: 0,
            duration: 0.1,
            delay: 0.1,
        },
        rate: {
            delay: density / 100 * 2 + 0.3, // 0.3 ~ 2.3 秒
            quantity: 1,
        },
        size: {
            width: 100,
            height: 0,
        },
        position: {
            y: 100,
            x: 50,
        },
    },
    particles: {
        number: {
            value: 0,
        },
        destroy: {
            bounds: {
                top: 30,
            },
            mode: 'split',
            split: {
                count: 1,
                factor: {
                    value: 0.333333,
                },
                rate: {
                    value: 100,
                },
                particles: {
                    stroke: {
                        width: 0,
                    },
                    color: {
                        value: [
                            '#ff595e',
                            '#ffca3a',
                            '#8ac926',
                            '#1982c4',
                            '#6a4c93',
                            '#ffffff',
                            '#ff7eb3',
                            '#00ffff',
                        ],
                    },
                    number: {
                        value: 0,
                    },
                    collisions: {
                        enable: false,
                    },
                    destroy: {
                        bounds: {
                            top: 0,
                        },
                    },
                    opacity: {
                        value: {
                            min: 0.1,
                            max: 1,
                        },
                        animation: {
                            enable: true,
                            speed: 0.7,
                            sync: false,
                            startValue: 'max',
                            destroy: 'min',
                        },
                    },
                    shape: {
                        type: 'circle',
                    },
                    size: {
                        value: { min: 2, max: 4 },
                        animation: {
                            enable: false,
                        },
                    },
                    life: {
                        count: 1,
                        duration: {
                            value: {
                                min: 1,
                                max: 2,
                            },
                        },
                    },
                    move: {
                        enable: true,
                        gravity: {
                            enable: true,
                            acceleration: 9,
                            inverse: false,
                        },
                        decay: 0.1,
                        speed: { min: 10, max: 25 },
                        direction: 'outside',
                        random: true,
                        straight: false,
                        outModes: {
                            default: 'destroy',
                            top: 'none',
                        },
                    },
                },
            },
        },
        life: {
            count: 1,
        },
        shape: {
            type: 'line',
        },
        size: {
            value: {
                min: 1,
                max: 50,
            },
            animation: {
                enable: true,
                sync: true,
                speed: 90,
                startValue: 'max',
                destroy: 'min',
            },
        },
        stroke: {
            color: {
                value: '#ffffff',
            },
            width: 1,
        },
        rotate: {
            path: true,
        },
        move: {
            enable: true,
            gravity: {
                acceleration: 15,
                enable: true,
                inverse: true,
                maxSpeed: 100,
            },
            speed: {
                min: 10,
                max: 20,
            },
            outModes: {
                default: 'destroy',
                top: 'none',
            },
            trail: {
                fillColor: 'transparent',
                enable: true,
                length: 10,
            },
        },
    },
    sounds: {
        enable: enableSound,
        events: [
            {
                event: 'particleRemoved',
                filter: (args: any) => args.data.particle.options.move.gravity.inverse,
                audio: [
                    'https://particles.js.org/audio/explosion0.mp3',
                    'https://particles.js.org/audio/explosion1.mp3',
                    'https://particles.js.org/audio/explosion2.mp3',
                ],
            },
        ],
        volume: (soundVolume / 100) * 50,
    },
});

/**
 * 主显示组件
 */
interface DisplayUIProps {
    config: AppConfig;
    isPanelOpen?: boolean;
    onConfigChange?: (key: keyof AppConfig, value: any) => void;
}

export function DisplayUI({ config }: DisplayUIProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesContainerRef = useRef<HTMLDivElement>(null);
    const tsParticlesRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
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
        if (config.bgValue) return parseBgValueToConfig(config.bgValue);
        if (config.bgConfig) return config.bgConfig;
        return DEFAULT_CONFIG.bgConfig!;
    }, [config.bgValue, config.bgConfig]);

    // 获取祝福语列表
    const getGreetingList = useCallback(() => {
        let list: string[] = [];
        if (Array.isArray(config.greetings)) {
            list = config.greetings;
        } else if (typeof config.greetings === 'string') {
            list = (config.greetings as string).split('\n').filter(s => s.trim() !== '');
        }
        return list.length > 0 ? list : PRESETS.greetingTemplates;
    }, [config.greetings]);

    // 加载 tsParticles
    useEffect(() => {
        const loadTsParticles = async () => {
            try {
                // 动态加载 tsParticles 脚本
                if (typeof window !== 'undefined' && !(window as any).tsParticles) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/tsparticles-preset-fireworks@2.12.0/tsparticles.preset.fireworks.bundle.min.js';
                    script.async = true;
                    script.onload = () => {
                        setIsLoaded(true);
                    };
                    document.head.appendChild(script);
                } else {
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load tsParticles:', error);
            }
        };

        loadTsParticles();
    }, []);

    // 初始化粒子效果
    useEffect(() => {
        if (!isLoaded || showWelcome || !particlesContainerRef.current) return;

        const initParticles = async () => {
            try {
                const tsParticles = (window as any).tsParticles;
                if (!tsParticles) return;

                // 清理之前的实例
                if (tsParticlesRef.current) {
                    tsParticlesRef.current.destroy();
                }

                // 使用 fireworks preset 加载
                await tsParticles.load({
                    id: 'tsparticles-container',
                    options: createFireworksConfig(config.density, config.soundVolume, config.enableSound && !isMuted),
                });

                tsParticlesRef.current = tsParticles.domItem(0);
            } catch (error) {
                console.error('Failed to initialize particles:', error);
            }
        };

        initParticles();

        return () => {
            if (tsParticlesRef.current) {
                tsParticlesRef.current.destroy();
                tsParticlesRef.current = null;
            }
        };
    }, [isLoaded, showWelcome, config.density, config.soundVolume, config.enableSound, isMuted]);

    // 祝福语轮播
    useEffect(() => {
        if (!showGreeting) return;
        const greetingList = getGreetingList();
        const interval = setInterval(() => {
            setCurrentGreetingIndex((prev) => (prev + 1) % greetingList.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [showGreeting, getGreetingList]);

    // 开始动画
    const startAnimation = useCallback(() => {
        setShowWelcome(false);
        setTimeout(() => setShowGreeting(true), 2000);
    }, []);

    const greetingList = getGreetingList();

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none">
            {/* 1. 背景层 */}
            <div className="absolute inset-0 z-0">
                <BackgroundRenderer config={effectiveBgConfig} />
            </div>

            {/* 2. tsParticles 容器 */}
            {!showWelcome && (
                <div
                    id="tsparticles-container"
                    ref={particlesContainerRef}
                    className="absolute inset-0 z-10"
                    style={{ background: 'transparent' }}
                />
            )}

            {/* 3. 祝福语显示 */}
            {showGreeting && (
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center px-4">
                    <div className="text-center animate-fade-in">
                        {config.recipientName && (
                            <div
                                className="text-white/90 text-xl md:text-3xl mb-6 font-serif tracking-widest animate-pulse"
                                style={{
                                    textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 2px 10px rgba(0,0,0,0.5)',
                                }}
                            >
                                {config.recipientName}
                            </div>
                        )}
                        <h1
                            key={currentGreetingIndex}
                            className="text-white font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest animate-pulse-slow"
                            style={{
                                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6347)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 40px rgba(255,215,0,0.6)',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                                animation: 'pulse-glow 2s ease-in-out infinite',
                            }}
                        >
                            {greetingList[currentGreetingIndex]}
                        </h1>
                    </div>
                </div>
            )}

            {/* 4. 欢迎界面 */}
            {showWelcome && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
                    <div className="relative text-center px-4">
                        <div className="mb-8">
                            <span className="text-7xl md:text-8xl animate-bounce" style={{
                                animationDuration: '2s',
                                filter: 'drop-shadow(0 0 30px rgba(255,100,100,0.8))'
                            }}>
                                🎆
                            </span>
                        </div>
                        {config.recipientName && (
                            <div
                                className="text-3xl md:text-5xl mb-4 font-serif tracking-widest"
                                style={{
                                    background: 'linear-gradient(to right, #f3ec78, #e77b9a, #af4261)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 30px rgba(243,236,120,0.5)',
                                }}
                            >
                                {config.recipientName}
                            </div>
                        )}
                        <h1 className="text-white/70 text-lg md:text-xl mb-10 tracking-[0.3em] font-light">
                            {config.titleText}
                        </h1>
                        <button
                            onClick={startAnimation}
                            className="relative px-10 py-5 text-white rounded-full text-xl font-semibold overflow-hidden group"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                                boxShadow: '0 0 40px rgba(102,126,234,0.5), 0 0 80px rgba(102,126,234,0.3)',
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="text-2xl">🎇</span>
                                点击开始梦幻烟花
                                <span className="text-2xl">🎇</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                        <p className="mt-8 text-white/50 text-sm">
                            {isLoaded ? '✅ 烟花特效已加载' : '⏳ 正在加载烟花特效...'}
                        </p>
                    </div>
                </div>
            )}

            {/* 5. 音效控制面板 */}
            <AudioControlPanel
                isPlaying={isPlaying}
                isMuted={isMuted}
                onPlayPause={toggleMusic}
                onToggleMute={toggleMute}
                enabled={config.enableSound}
                position="bottom-right"
                size="sm"
            />

            {/* 自定义动画样式 */}
            <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1);
          }
          50% {
            opacity: 0.9;
            filter: drop-shadow(0 4px 20px rgba(255,215,0,0.8)) brightness(1.1);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

// 配置面板元数据
export const tsparticlesFireworksConfigMetadata = {
    panelTitle: '梦幻粒子烟花配置',
    panelSubtitle: 'Dream Particles Fireworks',
    configSchema: {
        recipientName: {
            category: 'content' as const,
            type: 'input' as const,
            label: '送给谁',
            placeholder: '例如：亲爱的小曾'
        },
        titleText: {
            category: 'content' as const,
            type: 'input' as const,
            label: '标题',
            placeholder: '梦幻粒子烟花夜'
        },
        greetings: {
            category: 'content' as const,
            type: 'list' as const,
            label: '祝福语',
            placeholder: '输入祝福语',
            description: '每行一句，循环展示'
        },
        density: {
            category: 'visual' as const,
            type: 'slider' as const,
            label: '烟花密度',
            min: 10,
            max: 100,
            step: 10,
            description: '数值越大，烟花越密集'
        },
        soundVolume: {
            category: 'background' as const,
            type: 'slider' as const,
            label: '烟花音效音量',
            min: 0,
            max: 100,
            step: 10,
        },
        bgValue: {
            category: 'background' as const,
            type: 'media-grid' as const,
            label: '背景场景',
            mediaType: 'background' as const,
            defaultItems: PRESETS.backgrounds,
            description: '选择你喜欢的背景氛围'
        },
        enableSound: {
            category: 'background' as const,
            type: 'switch' as const,
            label: '启用音效'
        },
        bgMusicUrl: {
            category: 'background' as const,
            type: 'media-picker' as const,
            label: '背景音乐',
            mediaType: 'music' as const,
            defaultItems: PRESETS.music
        },
    },
    tabs: [
        { id: 'content' as const, label: '定制', icon: null },
        { id: 'visual' as const, label: '视觉', icon: null },
        { id: 'background' as const, label: '背景', icon: null },
    ],
    mobileSteps: [
        { id: 1, label: '专属定制', icon: null, fields: ['recipientName' as const, 'titleText' as const] },
        { id: 2, label: '祝福语', icon: null, fields: ['greetings' as const] },
        { id: 3, label: '视觉调整', icon: null, fields: ['density' as const] },
        { id: 4, label: '背景音效', icon: null, fields: ['bgValue' as const, 'enableSound' as const, 'bgMusicUrl' as const, 'soundVolume' as const] },
    ],
};

export default function TsParticlesFireworksPage() {
    const [config] = useState<AppConfig>(DEFAULT_CONFIG);
    return <DisplayUI config={config} />;
}
