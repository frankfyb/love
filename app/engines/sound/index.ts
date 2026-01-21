/**
 * 音效引擎统一导出入口
 */

export {
    SoundManager,
    getGlobalSoundManager,
    resetGlobalSoundManager,
    AUDIO_SOURCES,
} from './SoundManager';

export type {
    SoundCategory,
    SoundManagerConfig,
    AudioPoolItem,
} from './SoundManager';
