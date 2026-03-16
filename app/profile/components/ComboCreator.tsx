'use client';
import { useState, useEffect, useRef } from 'react';
import {
    Layers, Play, Pause, ChevronLeft, ChevronRight, X, Plus, Trash2,
    GripVertical, Eye, Settings, Sparkles, Clock, Music, Heart, Film,
    ListMusic, ArrowUp, ArrowDown, Save, Share2, Check, Copy, ExternalLink
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { UserWorkItem, ComboData, ComboItemData } from '@/types';
import { getToolUI } from '@/config/toolsRegistry';
import { saveCombo as saveComboToStorage } from '@/services/storage';

interface ComboItem {
    id: string;
    work: UserWorkItem;
    duration: number;
    order: number;
}

interface ComboCreatorProps {
    works: UserWorkItem[];
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

// Toast 组件
const Toast = ({ message, show, onClose }: { message: string; show: boolean; onClose: () => void }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-pink-100 text-sm font-medium">
                <Check className="w-4 h-4 text-pink-400" />
                {message}
            </div>
        </div>
    );
};

export default function ComboCreator({ works, isOpen, onClose, onSaved }: ComboCreatorProps) {
    const [selectedWorks, setSelectedWorks] = useState<ComboItem[]>([]);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [defaultDuration, setDefaultDuration] = useState(10);
    const [activeTab, setActiveTab] = useState<'select' | 'playlist'>('select');

    // 保存和分享相关状态
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [comboName, setComboName] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef<NodeJS.Timeout | null>(null);

    // 显示Toast
    const showToastMsg = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
    };

    // 添加作品到组合
    const addToCombo = (work: UserWorkItem) => {
        if (selectedWorks.find(item => item.work.id === work.id)) {
            setSelectedWorks(prev => prev.filter(item => item.work.id !== work.id));
        } else {
            const newItem: ComboItem = {
                id: `combo-${Date.now()}-${work.id}`,
                work,
                duration: defaultDuration,
                order: selectedWorks.length
            };
            setSelectedWorks(prev => [...prev, newItem]);
        }
    };

    // 从组合移除
    const removeFromCombo = (itemId: string) => {
        setSelectedWorks(prev => prev.filter(item => item.id !== itemId).map((item, idx) => ({ ...item, order: idx })));
    };

    // 更新时长
    const updateDuration = (itemId: string, duration: number) => {
        setSelectedWorks(prev => prev.map(item =>
            item.id === itemId ? { ...item, duration: Math.max(5, Math.min(60, duration)) } : item
        ));
    };

    // 移动顺序
    const moveItem = (itemId: string, direction: 'up' | 'down') => {
        const idx = selectedWorks.findIndex(item => item.id === itemId);
        if (idx === -1) return;

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= selectedWorks.length) return;

        const newList = [...selectedWorks];
        [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];
        setSelectedWorks(newList.map((item, i) => ({ ...item, order: i })));
    };

    // 获取总时长
    const getTotalDuration = () => {
        return selectedWorks.reduce((acc, item) => acc + item.duration, 0);
    };

    // 格式化时长显示
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
    };

    // 构建组合数据
    const buildComboData = (name: string): ComboData => {
        const items: ComboItemData[] = selectedWorks.map(item => ({
            toolKey: item.work.toolKey,
            toolName: item.work.toolName,
            title: item.work.title,
            config: item.work.config,
            duration: item.duration
        }));

        return {
            id: `combo-${Date.now()}`,
            name,
            items,
            createdAt: Date.now(),
            totalDuration: getTotalDuration()
        };
    };

    // 打开保存模态框
    const openSaveModal = () => {
        if (selectedWorks.length === 0) {
            showToastMsg('请先选择作品');
            return;
        }
        setComboName(`浪漫组合 ${new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`);
        setShowSaveModal(true);
    };

    // 确认保存
    const confirmSave = () => {
        if (!comboName.trim()) {
            showToastMsg('请输入组合名称');
            return;
        }

        const combo = buildComboData(comboName.trim());
        saveComboToStorage(combo);
        setShowSaveModal(false);
        setComboName('');
        showToastMsg('💕 组合已保存');
        onSaved?.();
        // 保存成功后关闭组合创作坊
        setTimeout(() => {
            onClose();
        }, 500); // 延迟一点让用户看到保存成功的提示
    };

    // 生成分享链接
    const generateShareLink = () => {
        if (selectedWorks.length === 0) {
            showToastMsg('请先选择作品');
            return;
        }

        const comboData = buildComboData('分享的浪漫组合');
        // 使用 base64 编码组合数据（简化处理）
        const encodedData = encodeURIComponent(JSON.stringify({
            items: comboData.items,
            totalDuration: comboData.totalDuration
        }));
        const url = `${window.location.origin}/combo/play?data=${encodedData}`;
        setShareUrl(url);
        setShowShareModal(true);
    };

    // 复制分享链接
    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showToastMsg('🔗 链接已复制，快分享给 TA 吧');
            setShowShareModal(false);
        } catch {
            // Fallback
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToastMsg('🔗 链接已复制');
            setShowShareModal(false);
        }
    };

    // 开始预览
    const startPreview = () => {
        if (selectedWorks.length === 0) return;
        setIsPreviewMode(true);
        setCurrentPreviewIndex(0);
        setIsPlaying(true);
        setProgress(0);
    };

    // 播放控制
    useEffect(() => {
        if (!isPreviewMode || !isPlaying || selectedWorks.length === 0) return;

        const currentItem = selectedWorks[currentPreviewIndex];
        const duration = currentItem?.duration || 10;
        const intervalMs = 50;
        const steps = (duration * 1000) / intervalMs;
        let step = 0;

        progressRef.current = setInterval(() => {
            step++;
            setProgress((step / steps) * 100);
        }, intervalMs);

        timerRef.current = setTimeout(() => {
            if (currentPreviewIndex < selectedWorks.length - 1) {
                setCurrentPreviewIndex(prev => prev + 1);
                setProgress(0);
            } else {
                setCurrentPreviewIndex(0);
                setProgress(0);
            }
        }, duration * 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [isPreviewMode, isPlaying, currentPreviewIndex, selectedWorks]);

    // 关闭预览
    const closePreview = () => {
        setIsPreviewMode(false);
        setIsPlaying(false);
        setProgress(0);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
    };

    // 手动切换
    const goToSlide = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : selectedWorks.length - 1));
        } else {
            setCurrentPreviewIndex(prev => (prev < selectedWorks.length - 1 ? prev + 1 : 0));
        }
        setProgress(0);
    };

    // 渲染预览界面
    const renderPreview = () => {
        const currentItem = selectedWorks[currentPreviewIndex];
        if (!currentItem) return null;

        const DisplayUI = getToolUI(currentItem.work.toolKey as any);

        return (
            <div className="fixed inset-0 z-[9999] bg-black">
                {/* 工具展示 */}
                <div className="absolute inset-0">
                    <DisplayUI config={currentItem.work.config} />
                </div>

                {/* 控制层 */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* 顶部控制栏 */}
                    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-auto">
                        <div className="flex items-center justify-between text-white max-w-4xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                    <Film className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <span className="text-xs md:text-sm opacity-80 block">
                                        {currentPreviewIndex + 1} / {selectedWorks.length}
                                    </span>
                                    <span className="text-sm md:text-base font-medium truncate max-w-[150px] md:max-w-none block">
                                        {currentItem.work.title}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* 分享按钮 */}
                                <button
                                    onClick={generateShareLink}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
                                >
                                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button
                                    onClick={closePreview}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
                                >
                                    <X className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* 进度条 */}
                        <div className="mt-4 flex gap-1.5 max-w-4xl mx-auto">
                            {selectedWorks.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="flex-1 h-1 md:h-1.5 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm"
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-100"
                                        style={{
                                            width: idx < currentPreviewIndex ? '100%' :
                                                idx === currentPreviewIndex ? `${progress}%` : '0%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 左右切换按钮 - PC端显示 */}
                    <button
                        onClick={() => goToSlide('prev')}
                        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm items-center justify-center text-white transition-all border border-white/20 pointer-events-auto"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                    <button
                        onClick={() => goToSlide('next')}
                        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm items-center justify-center text-white transition-all border border-white/20 pointer-events-auto"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>

                    {/* 底部播放控制 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-auto">
                        <div className="flex items-center justify-center gap-4 md:gap-6">
                            {/* 移动端：左切换按钮 */}
                            <button
                                onClick={() => goToSlide('prev')}
                                className="md:hidden w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* 播放/暂停按钮 */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex items-center justify-center text-white transition-all shadow-lg shadow-pink-500/30"
                            >
                                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                            </button>

                            {/* 移动端：右切换按钮 */}
                            <button
                                onClick={() => goToSlide('next')}
                                className="md:hidden w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 渲染作品选择视图
    const renderSelectView = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {works.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-pink-300/30" />
                    <p className="text-gray-400 text-sm">暂无作品，快去创作吧~</p>
                </div>
            ) : (
                works.map(work => {
                    const isSelected = selectedWorks.some(item => item.work.id === work.id);
                    const selectedIndex = selectedWorks.findIndex(item => item.work.id === work.id);
                    return (
                        <div
                            key={work.id}
                            onClick={() => addToCombo(work)}
                            className={`
                                relative p-4 rounded-2xl cursor-pointer transition-all duration-300
                                ${isSelected
                                    ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-2 border-pink-400/50 shadow-lg shadow-pink-500/10'
                                    : 'bg-white/5 border border-white/10 hover:border-pink-400/30 hover:bg-white/10'
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg'
                                        : 'bg-white/10 text-gray-400'
                                    }
                                `}>
                                    {isSelected ? (
                                        <span className="text-lg font-bold">{selectedIndex + 1}</span>
                                    ) : '🎨'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-100 truncate">{work.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{work.toolName} · {work.date}</p>
                                </div>
                                {isSelected && (
                                    <span className="shrink-0 px-3 py-1 rounded-full bg-pink-500 text-white text-xs font-medium shadow-lg">
                                        已选
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );

    // 渲染播放列表视图
    const renderPlaylistView = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedWorks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <ListMusic className="w-16 h-16 text-pink-300/20 mb-4" />
                    <p className="text-gray-400 text-sm">从作品库选择添加</p>
                    <p className="text-gray-500 text-xs mt-1">打造你的专属浪漫故事</p>
                </div>
            ) : (
                selectedWorks.map((item, idx) => (
                    <div
                        key={item.id}
                        className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-pink-400/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            {/* 序号和排序按钮 */}
                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                                <button
                                    onClick={() => moveItem(item.id, 'up')}
                                    disabled={idx === 0}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs font-bold flex items-center justify-center">
                                    {idx + 1}
                                </span>
                                <button
                                    onClick={() => moveItem(item.id, 'down')}
                                    disabled={idx === selectedWorks.length - 1}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            {/* 作品信息 */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400/20 to-rose-400/20 flex items-center justify-center text-2xl shrink-0">
                                🎬
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-100 truncate text-sm">{item.work.title}</h4>
                                <p className="text-xs text-gray-500">{item.work.toolName}</p>
                            </div>

                            {/* 时长控制和删除 */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1.5 border border-white/10">
                                    <button
                                        onClick={() => updateDuration(item.id, item.duration - 5)}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs text-gray-300 w-10 text-center font-mono">{item.duration}s</span>
                                    <button
                                        onClick={() => updateDuration(item.id, item.duration + 5)}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCombo(item.id)}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (!isOpen && !isPreviewMode) return null;

    return (
        <>
            {/* Toast 通知 */}
            <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />

            {/* 主模态框 */}
            {isOpen && !isPreviewMode && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={onClose} />

                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                        {/* 头部 */}
                        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-pink-900/30 to-rose-900/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">组合创作坊</h2>
                                        <p className="text-sm text-pink-200/60">将多个作品组合成一个浪漫故事</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* 移动端标签切换 */}
                        <div className="md:hidden px-4 py-3 border-b border-white/10 bg-black/20">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('select')}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'select'
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    🎨 作品库
                                </button>
                                <button
                                    onClick={() => setActiveTab('playlist')}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all relative ${activeTab === 'playlist'
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    📋 播放列表
                                    {selectedWorks.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                                            {selectedWorks.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 主体内容 */}
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* 左侧：可选作品列表 */}
                            <div className={`md:w-1/2 md:border-r border-white/10 flex flex-col ${activeTab === 'select' ? 'flex' : 'hidden md:flex'}`}>
                                <div className="hidden md:block px-4 py-3 bg-black/20 border-b border-white/10">
                                    <h3 className="font-medium text-gray-200 text-sm flex items-center gap-2">
                                        <span className="text-lg">🎨</span> 我的作品库
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">点击添加到组合</p>
                                </div>
                                {renderSelectView()}
                            </div>

                            {/* 右侧：已选组合列表 */}
                            <div className={`md:w-1/2 flex flex-col ${activeTab === 'playlist' ? 'flex' : 'hidden md:flex'}`}>
                                <div className="hidden md:flex px-4 py-3 bg-gradient-to-r from-pink-900/20 to-rose-900/20 border-b border-white/10 items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-200 text-sm flex items-center gap-2">
                                            <span className="text-lg">📋</span> 播放列表
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedWorks.length} 个作品 · 总时长 {formatDuration(getTotalDuration())}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/10">
                                        <Clock className="w-4 h-4 text-pink-400" />
                                        <input
                                            type="number"
                                            value={defaultDuration}
                                            onChange={(e) => setDefaultDuration(Number(e.target.value))}
                                            className="w-12 px-1 py-0.5 text-sm bg-transparent text-gray-200 text-center focus:outline-none"
                                            min={5}
                                            max={60}
                                        />
                                        <span className="text-xs text-gray-500">秒/页</span>
                                    </div>
                                </div>
                                {renderPlaylistView()}
                            </div>
                        </div>

                        {/* 底部操作栏 */}
                        <div className="px-6 py-4 border-t border-white/10 bg-black/30">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-400 text-center md:text-left">
                                    {selectedWorks.length > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-pink-400" />
                                            已选择 {selectedWorks.length} 个作品 · {formatDuration(getTotalDuration())}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">选择作品开始创作</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                    {/* 保存按钮 */}
                                    <Button
                                        variant="secondary"
                                        onClick={openSaveModal}
                                        disabled={selectedWorks.length === 0}
                                        className="flex-1 md:flex-none bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-1.5" />
                                        保存
                                    </Button>

                                    {/* 分享按钮 */}
                                    <Button
                                        variant="secondary"
                                        onClick={generateShareLink}
                                        disabled={selectedWorks.length === 0}
                                        className="flex-1 md:flex-none bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                    >
                                        <Share2 className="w-4 h-4 mr-1.5" />
                                        分享
                                    </Button>

                                    {/* 播放按钮 */}
                                    <Button
                                        variant="primary"
                                        onClick={startPreview}
                                        disabled={selectedWorks.length === 0}
                                        className="flex-1 md:flex-none bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-none shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play className="w-4 h-4 mr-1.5" />
                                        播放
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 保存模态框 */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setShowSaveModal(false)} />
                    <div className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                <Save className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">保存组合</h3>
                                <p className="text-sm text-gray-400">给你的浪漫故事起个名字</p>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={comboName}
                            onChange={(e) => setComboName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                            placeholder="例如：我们的甜蜜回忆"
                            autoFocus
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all mb-6"
                        />

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            >
                                取消
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmSave}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-none"
                            >
                                <Check className="w-4 h-4 mr-1.5" />
                                保存
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 分享模态框 */}
            {showShareModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setShowShareModal(false)} />
                    <div className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">分享浪漫故事</h3>
                                <p className="text-sm text-gray-400">将这份心意传递给 TA</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                            <p className="text-xs text-gray-400 mb-2">分享链接</p>
                            <p className="text-sm text-gray-200 break-all font-mono">{shareUrl.slice(0, 80)}...</p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowShareModal(false)}
                                className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            >
                                取消
                            </Button>
                            <Button
                                variant="primary"
                                onClick={copyShareLink}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-none"
                            >
                                <Copy className="w-4 h-4 mr-1.5" />
                                复制链接
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 预览模式 */}
            {isPreviewMode && renderPreview()}
        </>
    );
}
