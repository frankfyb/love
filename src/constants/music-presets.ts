/**
 * 全局音乐预设库
 * 所有工具共享的背景音乐预设
 */

export interface MusicPresetItem {
    label: string;
    value: string;
    category?: string;
    description?: string;
}

// ============================================================================
// 分类音乐预设
// ============================================================================

/**
 * 浪漫主题音乐
 */
export const ROMANTIC_MUSIC: MusicPresetItem[] = [
    {
        label: '💕 浪漫星空',
        value: 'https://cdn.pixabay.com/audio/2022/10/25/audio_55a299103f.mp3',
        category: 'romantic',
        description: '轻柔浪漫的钢琴曲'
    },
    {
        label: '💗 甜蜜时光',
        value: 'https://cdn.pixabay.com/audio/2023/06/15/audio_c6a2d98b88.mp3',
        category: 'romantic',
        description: '温馨甜美的旋律'
    },
    {
        label: '🌙 梦幻夜曲',
        value: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
        category: 'romantic',
        description: '梦幻般的夜晚氛围'
    },
];

/**
 * 节日主题音乐
 */
export const FESTIVE_MUSIC: MusicPresetItem[] = [
    {
        label: '🎉 新年喜庆',
        value: 'https://cdn.pixabay.com/audio/2022/12/22/audio_fb4198257e.mp3',
        category: 'festive',
        description: '欢快的节日氛围'
    },
    {
        label: '🎄 圣诞欢歌',
        value: 'https://cdn.pixabay.com/audio/2022/12/20/audio_6d0d1c6e5c.mp3',
        category: 'festive',
        description: '温馨的圣诞氛围'
    },
    {
        label: '🎊 庆典时刻',
        value: 'https://cdn.pixabay.com/audio/2022/11/22/audio_b9f3c0bf6f.mp3',
        category: 'festive',
        description: '盛大的庆典感'
    },
];

/**
 * 轻音乐
 */
export const LIGHT_MUSIC: MusicPresetItem[] = [
    {
        label: '🎹 轻柔钢琴',
        value: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe42c21.mp3',
        category: 'light',
        description: '舒缓的钢琴演奏'
    },
    {
        label: '🌸 春日暖阳',
        value: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1348194d50.mp3',
        category: 'light',
        description: '温暖明亮的曲调'
    },
];

/**
 * 史诗/壮观主题音乐
 */
export const EPIC_MUSIC: MusicPresetItem[] = [
    {
        label: '🌟 星辰大海',
        value: 'https://cdn.pixabay.com/audio/2022/04/27/audio_10fe1c765e.mp3',
        category: 'epic',
        description: '壮观的太空感'
    },
    {
        label: '✨ 璀璨时刻',
        value: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5e3e9b2db5.mp3',
        category: 'epic',
        description: '激动人心的时刻'
    },
];

// ============================================================================
// 全局音乐预设管理
// ============================================================================

export const GLOBAL_MUSIC_PRESETS = {
    romantic: ROMANTIC_MUSIC,
    festive: FESTIVE_MUSIC,
    light: LIGHT_MUSIC,
    epic: EPIC_MUSIC,

    /**
     * 获取所有音乐预设
     */
    getAll(): MusicPresetItem[] {
        return [
            ...ROMANTIC_MUSIC,
            ...FESTIVE_MUSIC,
            ...LIGHT_MUSIC,
            ...EPIC_MUSIC,
        ];
    },

    /**
     * 按类别获取音乐预设
     */
    getByCategory(category: 'romantic' | 'festive' | 'light' | 'epic'): MusicPresetItem[] {
        return this[category] || [];
    },

    /**
     * 获取工具专属音乐预设
     * @param toolKey - 工具标识
     */
    getToolPresets(toolKey: string): MusicPresetItem[] {
        // 工具到音乐类别的映射
        const toolMusicMapping: Record<string, ('romantic' | 'festive' | 'light' | 'epic')[]> = {
            // 烟花类工具

            'custom-fireworks': ['romantic', 'festive'],








            // 爱心类工具
            'romantic-hearts': ['romantic', 'light'],

            'reasons-to-love': ['romantic', 'light'],

            // 节日类工具




            // 其他工具
            'warm-text-card': ['romantic', 'light'],
            'galaxy-weaver': ['romantic', 'epic'],

            'love-clock-diy': ['romantic', 'light'],
            'couples-agreement': ['romantic'],



            'rain-snow-ripple': ['light', 'romantic'],
        };

        const categories = toolMusicMapping[toolKey] || ['romantic'];
        const presets: MusicPresetItem[] = [];

        categories.forEach(category => {
            presets.push(...this.getByCategory(category));
        });

        // 去重
        const seen = new Set<string>();
        return presets.filter(item => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
        });
    },

    /**
     * 获取默认音乐URL
     * @param toolKey - 工具标识
     */
    getDefaultMusic(toolKey: string): string {
        const presets = this.getToolPresets(toolKey);
        return presets[0]?.value || ROMANTIC_MUSIC[0].value;
    },
};

export default GLOBAL_MUSIC_PRESETS;
