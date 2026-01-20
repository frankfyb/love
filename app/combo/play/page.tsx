'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, ChevronLeft, ChevronRight, X, Heart, Film, Share2 } from 'lucide-react';
import { ComboItemData } from '@/types';
import { getToolUI } from '@/config/toolsRegistry';

// 主组件内容
function ComboPlayerContent() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<ComboItemData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef<NodeJS.Timeout | null>(null);

    // 解析 URL 参数中的组合数据
    useEffect(() => {
        try {
            const encodedData = searchParams.get('data');
            if (!encodedData) {
                setError('未找到组合数据');
                setIsLoading(false);
                return;
            }

            const decoded = JSON.parse(decodeURIComponent(encodedData));
            if (!decoded.items || decoded.items.length === 0) {
                setError('组合数据无效');
                setIsLoading(false);
                return;
            }

            setItems(decoded.items);
            setIsLoading(false);
        } catch (e) {
            console.error('Failed to parse combo data', e);
            setError('解析组合数据失败');
            setIsLoading(false);
        }
    }, [searchParams]);

    // 播放控制
    useEffect(() => {
        if (isLoading || error || !isPlaying || items.length === 0) return;

        const currentItem = items[currentIndex];
        const duration = currentItem?.duration || 10;
        const intervalMs = 50;
        const steps = (duration * 1000) / intervalMs;
        let step = 0;

        progressRef.current = setInterval(() => {
            step++;
            setProgress((step / steps) * 100);
        }, intervalMs);

        timerRef.current = setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setProgress(0);
            } else {
                // 循环播放
                setCurrentIndex(0);
                setProgress(0);
            }
        }, duration * 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [isLoading, error, isPlaying, currentIndex, items]);

    // 手动切换
    const goToSlide = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        } else {
            setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        }
        setProgress(0);
    };

    // 分享当前页面
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('链接已复制，快分享给更多人吧！');
        } catch {
            // Fallback
        }
    };

    // Loading 状态
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-pink-200 text-sm">正在加载浪漫故事...</p>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <Heart className="w-16 h-16 text-pink-500/30 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">哎呀，出错了</h2>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:from-pink-600 hover:to-rose-600 transition-all"
                    >
                        回到首页
                    </a>
                </div>
            </div>
        );
    }

    const currentItem = items[currentIndex];
    if (!currentItem) return null;

    // 动态获取工具 UI
    let DisplayUI: React.ComponentType<{ config: any }>;
    try {
        DisplayUI = getToolUI(currentItem.toolKey as any);
    } catch {
        // 如果工具不存在，显示占位符
        DisplayUI = () => (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900/50 to-rose-900/50">
                <div className="text-center">
                    <Film className="w-16 h-16 text-pink-400/50 mx-auto mb-4" />
                    <p className="text-pink-200">作品加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {/* 工具展示 */}
            <div className="absolute inset-0">
                <DisplayUI config={currentItem.config} />
            </div>

            {/* 控制层 */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 顶部控制栏 */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-auto">
                    <div className="flex items-center justify-between text-white max-w-4xl mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                                <Film className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div>
                                <span className="text-xs md:text-sm opacity-80 block">
                                    {currentIndex + 1} / {items.length}
                                </span>
                                <span className="text-sm md:text-base font-medium truncate max-w-[150px] md:max-w-[300px] block">
                                    {currentItem.title}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
                        >
                            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* 进度条 */}
                    <div className="mt-4 flex gap-1.5 max-w-4xl mx-auto">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => { setCurrentIndex(idx); setProgress(0); }}
                                className="flex-1 h-1 md:h-1.5 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors"
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-100"
                                    style={{
                                        width: idx < currentIndex ? '100%' :
                                            idx === currentIndex ? `${progress}%` : '0%'
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
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex items-center justify-center text-white transition-all shadow-lg shadow-pink-500/30"
                        >
                            {isPlaying ? <Pause className="w-7 h-7 md:w-8 md:h-8" /> : <Play className="w-7 h-7 md:w-8 md:h-8 ml-1" />}
                        </button>

                        {/* 移动端：右切换按钮 */}
                        <button
                            onClick={() => goToSlide('next')}
                            className="md:hidden w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/20"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 来源标识 */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-white/40">
                            Made with <Heart className="w-3 h-3 inline text-pink-400" /> by LoveRituals
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 主导出组件 - 使用 Suspense 包装
export default function ComboPlayerPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-pink-200 text-sm">正在加载浪漫故事...</p>
                </div>
            </div>
        }>
            <ComboPlayerContent />
        </Suspense>
    );
}
