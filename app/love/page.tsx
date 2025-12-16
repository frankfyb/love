'use client';
import { useRouter } from 'next/navigation';
import { Search, Heart, Calendar, BookMarked, Brain } from 'lucide-react';
import { useState, useMemo } from 'react';
import ToolCard from '@/components/business/ToolCard';
import {
  CATEGORIES,
  getToolsByCategoryId,
  searchTools,
  getCategoryById,
  getAllUniqueTags,
  Category,
  ToolMetadata,
  ToolTag,
} from '@/config/toolsconfig';

// 图标映射
const IconMap = {
  Calendar,
  Heart,
  BookMarked,
  Brain,
};

export default function ToolsPage() {
  const router = useRouter();
  const [categories] = useState<Category[]>(CATEGORIES.sort((a, b) => a.sort - b.sort));
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [activeTag, setActiveTag] = useState<ToolTag | ''>(''); // 新增标签筛选

  // 所有唯一标签（用于标签筛选栏）
  const allTags = useMemo(() => getAllUniqueTags(), []);

  // 筛选后的工具列表（兼容分类+搜索+标签筛选）
  const filteredTools = useMemo(() => {
    // 1. 基础筛选（搜索+分类）
    let tools = q ? searchTools(q) : getToolsByCategoryId(activeCategory);
    
    // 2. 标签筛选（数组匹配）
    if (activeTag) {
      tools = tools.filter(tool => tool.tag?.includes(activeTag));
    }
    
    return tools;
  }, [q, activeCategory, activeTag]);

  // 面包屑文本
  const breadcrumbText = useMemo(() => {
    if (!activeCategory) return '首页 > 仪式库';
    const category = getCategoryById(activeCategory);
    return `首页 > 仪式库 > ${category?.name || ''}`;
  }, [activeCategory]);

  // 工具卡片ID生成
  const iHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  // 搜索/键盘事件
  const handleSearch = () => {};
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-8 animate-slide-in-from-bottom-4 duration-500 px-4 py-8 max-w-7xl mx-auto">
      {/* 1. 分类筛选栏 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              !activeCategory ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'
            }`}
          >
            全部
          </button>
          {categories.map((c) => {
            const Icon = IconMap[c.icon as keyof typeof IconMap] || Heart;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === c.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* 搜索框 */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索浪漫工具/标签..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-rose-500"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 标签筛选栏（新增，利用数组标签） */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTag('')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            !activeTag ? 'bg-pink-100 text-rose-500' : 'bg-white text-slate-500 hover:bg-pink-50'
          }`}
        >
          所有标签
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              activeTag === tag ? 'bg-pink-100 text-rose-500' : 'bg-white text-slate-500 hover:bg-pink-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 3. 工具列表 */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">没有找到相关工具</div>
          <button
            onClick={() => {
              setQ('');
              setActiveCategory('');
              setActiveTag('');
            }}
            className="text-rose-500 hover:text-rose-600 underline"
          >
            清空所有筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool: ToolMetadata) => {
            return (
              <ToolCard
                key={tool.id}
                tool={{
                  id: iHash(tool.id),
                  title: tool.toolName,
                  desc: tool.description || '',
                  icon: <Heart className="w-6 h-6 text-rose-400" />,
                  tags: tool.tag, // 传递完整标签数组给Card组件（可选）
                }}
                onClick={() => router.push(`/love/${tool.id}`)}
              />
            );
          })}
        </div>
      )}

      {/* 4. 面包屑和底部提示 */}
      <div className="flex justify-between items-center py-8">
        <div className="text-sm text-slate-500">{breadcrumbText}</div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Heart className="w-4 h-4 animate-pulse text-rose-300" />
          加载更多浪漫...
        </div>
      </div>
    </div>
  );
}