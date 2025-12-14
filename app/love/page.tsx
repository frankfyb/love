'use client';
import { useRouter } from 'next/navigation';
import { Search, Heart } from 'lucide-react';
import { useState, useMemo } from 'react';
import ToolCard from '@/components/business/ToolCard';
import { getToolKeyList, getToolFullConfig } from '@/config/toolsRegistry';

/**
 * 本地数据源重构说明：
 * - 移除所有远程 API 请求和相关状态（fetch/加载/错误）
 * - 使用 toolsRegistry 作为唯一数据源构建工具列表
 * - 保持原有 UI 结构与样式（筛选/搜索/卡片网格/面包屑）
 * - 完整的 TypeScript 类型与注释
 */

type Category = { id: string; name: string };
type ToolItem = {
  toolKey: string;
  toolName: string;
  description?: string;
  tag?: string;
  category?: string;
};

export default function ToolsPage() {
  const router = useRouter();
  const [categories] = useState<Category[]>([
    { id: 'festival', name: '节日' },
    { id: 'confession', name: '表白' },
    { id: 'memory', name: '纪念' },
    { id: 'ai', name: 'AI创作' },
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [q, setQ] = useState<string>('');

  // 本地工具列表：基于 toolsRegistry 构建
  const allTools: ToolItem[] = useMemo(() => {
    const categoryMap: Record<string, string> = {
      'christmas-card': 'festival',
      'rain-snow-ripple': 'festival',
      'warm-text-card': 'confession',
    };
    return getToolKeyList().map((toolKey) => {
      const tool = getToolFullConfig(toolKey);
      return {
        toolKey,
        toolName: tool.name,
        description: '',
        tag: '热门',
        category: categoryMap[toolKey] || '',
      };
    });
  }, []);

  // 本地过滤：根据搜索与分类派生结果
  const filteredTools = useMemo(() => {
    return allTools.filter((t) => {
      const matchQ = q ? t.toolName.toLowerCase().includes(q.toLowerCase()) : true;
      const matchCat = activeCategory ? t.category === activeCategory : true;
      return matchQ && matchCat;
    });
  }, [allTools, q, activeCategory]);

  // 已移除远程加载逻辑（useEffect），本页完全由本地数据驱动

  // 计算面包屑导航文本
  const breadcrumbText = useMemo(() => {
    if (!activeCategory) return '首页 > 仪式库';
    const category = categories.find(c => c.id === activeCategory);
    return `首页 > 仪式库 > ${category?.name || ''}`;
  }, [activeCategory, categories]);

  // 搜索（本地过滤，无需请求）
  const handleSearch = () => {};

  // 处理键盘事件：Enter 时触发搜索（保持交互语义）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-8 animate-slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!activeCategory ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'}`}
            aria-label="查看所有分类"
          >全部</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === c.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'}`}
              aria-label={`查看${c.name}分类`}
            >{c.name}</button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索浪漫工具..." 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm" 
            aria-label="搜索工具"
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-rose-500"
            aria-label="搜索"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主工具网格：完全本地数据驱动 */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">没有找到相关工具</div>
          <button 
            onClick={() => {
              setQ('');
              setActiveCategory('');
            }}
            className="text-rose-500 hover:text-rose-600 underline"
          >
            清空筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.toolKey} 
              tool={{ id: iHash(tool.toolKey), title: tool.toolName, desc: tool.description || '', icon: <Heart className="w-6 h-6 text-rose-400"/>, tag: tool.tag || '热门' }} 
              onClick={() => router.push(`/love/${tool.toolKey}`)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center py-8">
        <div className="text-sm text-slate-500">
          {breadcrumbText}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Heart className="w-4 h-4 animate-pulse text-rose-300" />
          加载更多浪漫...
        </div>
      </div>
    </div>
  );
}

function iHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
