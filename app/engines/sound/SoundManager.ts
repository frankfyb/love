/**
 * 统一音效管理器
 * 所有工具共享的音效播放和管理系统
 */

// ============================================================================
// 类型定义
// ============================================================================

export type SoundCategory = 'burst' | 'lift' | 'crackle' | 'pop' | 'swoosh' | 'chime';

export interface SoundManagerConfig {
    enabled?: boolean;
    masterVolume?: number;
    poolSizes?: Partial<Record<SoundCategory, number>>;
}

export interface AudioPoolItem {
    audio: HTMLAudioElement;
    inUse: boolean;
}

// ============================================================================
// 音效源常量
// ============================================================================

export const AUDIO_SOURCES: Record<SoundCategory, string[]> = {
    burst: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst2.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/burst-sm-1.mp3',
    ],
    lift: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/lift1.mp3',
    ],
    crackle: [
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle1.mp3',
        'https://objectstorageapi.sg-members-1.clawcloudrun.com/cfd6671w-love/love/fireworks/audio/crackle-sm-1.mp3',
    ],
    pop: [],
    swoosh: [],
    chime: [],
};

// 默认音量配置
const DEFAULT_VOLUMES: Record<SoundCategory, { min: number; max: number }> = {
    burst: { min: 0.2, max: 0.4 },
    lift: { min: 0.1, max: 0.2 },
    crackle: { min: 0.15, max: 0.3 },
    pop: { min: 0.2, max: 0.3 },
    swoosh: { min: 0.15, max: 0.25 },
    chime: { min: 0.2, max: 0.4 },
};

// 默认池大小
const DEFAULT_POOL_SIZES: Record<SoundCategory, number> = {
    burst: 8,
    lift: 4,
    crackle: 6,
    pop: 4,
    swoosh: 4,
    chime: 2,
};

// ============================================================================
// 音效管理器类
// ============================================================================

export class SoundManager {
    private pools: Map<SoundCategory, AudioPoolItem[]> = new Map();
    private cursors: Map<SoundCategory, number> = new Map();
    private enabled: boolean = true;
    private masterVolume: number = 1;
    private initialized: boolean = false;

    constructor(config: SoundManagerConfig = {}) {
        this.enabled = config.enabled ?? true;
        this.masterVolume = config.masterVolume ?? 1;

        // 延迟初始化（仅在浏览器环境）
        if (typeof window !== 'undefined') {
            this.initialize(config.poolSizes);
        }
    }

    /**
     * 初始化音频池
     */
    private initialize(poolSizes?: Partial<Record<SoundCategory, number>>): void {
        if (this.initialized) return;

        const categories: SoundCategory[] = ['burst', 'lift', 'crackle', 'pop', 'swoosh', 'chime'];

        categories.forEach(category => {
            const sources = AUDIO_SOURCES[category];
            if (sources.length === 0) return;

            const poolSize = poolSizes?.[category] ?? DEFAULT_POOL_SIZES[category];
            const pool: AudioPoolItem[] = [];

            for (let i = 0; i < poolSize; i++) {
                const audio = new Audio(sources[i % sources.length]);
                audio.preload = 'auto';
                audio.volume = DEFAULT_VOLUMES[category].max * this.masterVolume;
                pool.push({ audio, inUse: false });
            }

            this.pools.set(category, pool);
            this.cursors.set(category, 0);
        });

        this.initialized = true;
    }

    /**
     * 播放音效
     * @param category - 音效类别
     * @param options - 可选配置
     */
    play(
        category: SoundCategory,
        options?: { volume?: number; playbackRate?: number }
    ): void {
        if (!this.enabled || typeof window === 'undefined') return;

        const pool = this.pools.get(category);
        if (!pool || pool.length === 0) return;

        const cursor = this.cursors.get(category) ?? 0;
        const item = pool[cursor];

        if (item) {
            const volumeRange = DEFAULT_VOLUMES[category];
            const randomVolume = volumeRange.min + Math.random() * (volumeRange.max - volumeRange.min);

            item.audio.volume = (options?.volume ?? randomVolume) * this.masterVolume;
            if (options?.playbackRate) {
                item.audio.playbackRate = options.playbackRate;
            }
            item.audio.currentTime = 0;
            item.audio.play().catch(() => {
                // 忽略自动播放限制错误
            });
        }

        this.cursors.set(category, (cursor + 1) % pool.length);
    }

    /**
     * 播放爆炸音效（便捷方法）
     */
    playBurst(volume?: number): void {
        this.play('burst', { volume });
    }

    /**
     * 播放升空音效（便捷方法）
     */
    playLift(volume?: number): void {
        this.play('lift', { volume });
    }

    /**
     * 播放爆裂音效（便捷方法）
     */
    playCrackle(volume?: number): void {
        this.play('crackle', { volume });
    }

    /**
     * 设置启用/禁用
     */
    setEnabled(enable: boolean): void {
        this.enabled = enable;
    }

    /**
     * 获取启用状态
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 设置主音量
     * @param volume - 音量 0-1
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        // 更新所有音频的音量
        this.pools.forEach((pool, category) => {
            const volumeRange = DEFAULT_VOLUMES[category];
            pool.forEach(item => {
                item.audio.volume = volumeRange.max * this.masterVolume;
            });
        });
    }

    /**
     * 预加载所有音效
     */
    preloadAll(): Promise<void[]> {
        const promises: Promise<void>[] = [];

        this.pools.forEach(pool => {
            pool.forEach(item => {
                promises.push(
                    new Promise<void>((resolve) => {
                        if (item.audio.readyState >= 3) {
                            resolve();
                        } else {
                            item.audio.addEventListener('canplaythrough', () => resolve(), { once: true });
                            item.audio.load();
                        }
                    })
                );
            });
        });

        return Promise.all(promises);
    }

    /**
     * 停止所有正在播放的音效
     */
    stopAll(): void {
        this.pools.forEach(pool => {
            pool.forEach(item => {
                item.audio.pause();
                item.audio.currentTime = 0;
            });
        });
    }

    /**
     * 释放资源
     */
    dispose(): void {
        this.stopAll();
        this.pools.forEach(pool => {
            pool.forEach(item => {
                item.audio.src = '';
            });
        });
        this.pools.clear();
        this.cursors.clear();
        this.initialized = false;
    }
}

// ============================================================================
// 单例实例（可选使用）
// ============================================================================

let globalSoundManager: SoundManager | null = null;

/**
 * 获取全局音效管理器实例
 */
export function getGlobalSoundManager(config?: SoundManagerConfig): SoundManager {
    if (!globalSoundManager) {
        globalSoundManager = new SoundManager(config);
    }
    return globalSoundManager;
}

/**
 * 重置全局音效管理器
 */
export function resetGlobalSoundManager(): void {
    if (globalSoundManager) {
        globalSoundManager.dispose();
        globalSoundManager = null;
    }
}
