/**
 * 音效功能集成指南
 * ============================================================================
 * 
 * 本指南说明如何在其他工具中快速集成音效播放、暂停和静音功能。
 * 
 * ============================================================================
 * 快速开始 (3 步集成)
 * ============================================================================
 * 
 * 步骤 1: 在工具配置中添加音效相关字段
 * -----------------------------------
 * enableSound: false           // 启用音效开关
 * bgMusicUrl: 'https://...'   // 音乐 URL
 * volume: 0.5                 // 音量 (0-1)
 * 
 * 步骤 2: 在配置元数据中定义音效控制项
 * ------------------------------------
 * configSchema: {
 *   bgMusicUrl: { category: 'audio', type: 'media-picker', label: '背景音乐' },
 *   enableSound: { category: 'audio', type: 'switch', label: '启用音效' },
 *   volume: { type: 'slider', min: 0, max: 1, step: 0.1, category: 'audio' },
 * }
 * 
 * 步骤 3: 在展示组件中使用 Hook 和组件
 * ------------------------------------
 * import { useAudioControl } from '@/hooks/useAudioControl';
 * import AudioControlPanel from '@/components/common/AudioControlPanel';
 * 
 * 在 DisplayUI 组件中:
 * const { isPlaying, isMuted, handlePlayPause, handleToggleMute } =
 *   useAudioControl({
 *     musicUrl: config.bgMusicUrl,
 *     enabled: config.enableSound,
 *     volume: config.volume,
 *   });
 * 
 * 在 JSX 中添加:
 * <AudioControlPanel
 *   isPlaying={isPlaying}
 *   isMuted={isMuted}
 *   onPlayPause={handlePlayPause}
 *   onToggleMute={handleToggleMute}
 *   enabled={config.enableSound}
 *   position="bottom-right"
 *   size="sm"
 * />
 * 
 * ============================================================================
 * Hook: useAudioControl 详细说明
 * ============================================================================
 * 
 * 用途: 管理音频播放、暂停和静音状态
 * 
 * 参数:
 *   - musicUrl (string): 音乐文件 URL，支持 mp3/ogg 等格式
 *   - enabled (boolean): 是否启用音效（true时自动播放）
 *   - volume (number): 音量大小（0-1，内部自动乘以 0.5）
 * 
 * 返回值:
 *   - audioRef: HTMLAudioElement 引用（如需直接访问音频）
 *   - isPlaying: 当前是否正在播放
 *   - isMuted: 当前是否已静音
 *   - handlePlayPause(): 切换播放/暂停
 *   - handleToggleMute(): 切换静音状态
 * 
 * 特性:
 *   - 自动循环播放
 *   - 启用时自动播放，禁用时自动暂停
 *   - 音量和静音独立控制
 *   - 音乐URL变更时自动切换
 *   - 浏览器兼容性处理（播放受限时的 catch 处理）
 * 
 * ============================================================================
 * 组件: AudioControlPanel 详细说明
 * ============================================================================
 * 
 * 用途: 渲染音效控制按钮（播放/暂停、静音）
 * 
 * Props:
 *   - isPlaying (boolean): 当前播放状态
 *   - isMuted (boolean): 当前静音状态
 *   - onPlayPause (function): 播放/暂停回调
 *   - onToggleMute (function): 静音切换回调
 *   - enabled (boolean): 是否显示面板（false 时不渲染）
 *   - position? (string): 按钮位置
 *       'bottom-right' (默认)
 *       'bottom-center'
 *       'top-right'
 *       'top-left'
 *   - size? (string): 按钮大小
 *       'sm' (默认) - p-2.5, w-10 h-10
 *       'md'        - p-3, w-12 h-12
 *       'lg'        - p-4, w-14 h-14
 * 
 * 设计特性:
 *   - 玻璃态设计（半透明 + 模糊）
 *   - 平滑过渡动画
 *   - 响应式尺寸调整
 *   - 可访问性支持（aria-label）
 *   - 沉浸式体验（最小化 UI）
 * 
 * ============================================================================
 * 配置预设示例
 * ============================================================================
 * 
 * 推荐的音乐预设库结构:
 * 
 * export const PRESETS = {
 *   music: [
 *     { label: '新年倒计时', value: 'https://...' },
 *     { label: '欢快歌曲', value: 'https://...' },
 *     { label: '宁静音乐', value: 'https://...' },
 *   ],
 * };
 * 
 * ============================================================================
 * 最佳实践
 * ============================================================================
 * 
 * 音量控制:
 *   - 默认音量设为 0.5，避免过响
 *   - Hook 内部自动乘以 0.5，确保平衡
 * 
 * 用户体验:
 *   - 始终提供暂停/播放和静音选项
 *   - 使用沉浸式设计，不打破用户专注
 * 
 * 性能优化:
 *   - 音频元素在 Hook 中创建，不额外占用 DOM
 *   - 仅在 enabled 为 true 时渲染 UI
 * 
 * 可访问性:
 *   - 使用 aria-label 标注按钮
 *   - 提供 title 提示文本
 *   - 确保键盘可访问
 * 
 * ============================================================================
 * 文件位置
 * ============================================================================
 * 
 * Hook 文件: app/hooks/useAudioControl.ts
 * 组件文件: app/components/common/AudioControlPanel.tsx
 * 
 * ============================================================================
 */

export {};
