'use client';
import { useRouter } from 'next/navigation';
import { Search, Heart, Calendar, BookMarked, Brain, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const toolsPerPage = 8; // 每页显示的工具数量

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

  // 计算总页数
  const totalPages = Math.ceil(filteredTools.length / toolsPerPage);

  // 当前页的工具列表
  const currentTools = useMemo(() => {
    const startIndex = (currentPage - 1) * toolsPerPage;
    const endIndex = startIndex + toolsPerPage;
    return filteredTools.slice(startIndex, endIndex);
  }, [filteredTools, currentPage]);

  // 重置页码（当筛选条件改变时）
  useMemo(() => {
    setCurrentPage(1);
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
  const handleSearch = () => { };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  // 分页处理函数
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2; // 当前页前后显示的页码数
      const range = [];
      const rangeWithDots = [];

      // 添加第一页
      range.push(1);

      // 计算需要显示的页码范围
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      // 添加最后一页
      if (totalPages > 1) {
        range.push(totalPages);
      }

      // 添加省略号
      let lastPage = 0;
      for (const page of range) {
        if (page - lastPage === 2) {
          // 只差一页，直接添加中间页
          rangeWithDots.push(lastPage + 1);
        } else if (page - lastPage !== 1) {
          // 差多页，添加省略号
          rangeWithDots.push('...');
        }
        rangeWithDots.push(page);
        lastPage = page;
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-full ${currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && goToPage(page)}
            disabled={page === '...'}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm ${page === currentPage
                ? 'bg-rose-500 text-white'
                : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full ${currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-slide-in-from-bottom-4 duration-500 px-4 py-8 max-w-7xl mx-auto">
      {/* 1. 分类筛选栏 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!activeCategory ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'
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
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeCategory === c.id ? 'bg-rose-400 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 hover:bg-pink-50'
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

      {/* 2. 标签筛选栏（移动端优化） */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-1">
          <button
            onClick={() => setActiveTag('')}
            className={`
              shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 snap-start
              ${!activeTag
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-rose-500 border border-slate-200'
              }
            `}
          >
            所有标签
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`
                shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 snap-start whitespace-nowrap
                ${activeTag === tag
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                  : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-rose-500 border border-slate-200'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 移动端滚动提示 */}
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none md:hidden" />
      </div>

      {/* 3. 工具列表 */}
      {currentTools.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentTools.map((tool: ToolMetadata) => {
              // 根据cover类型渲染图标
              const renderIcon = () => {
                if (!tool.cover) {
                  return <Heart className="w-6 h-6 text-rose-400" />;
                }
                // 如果是URL（图片），渲染为图片
                if (tool.cover.startsWith('http')) {
                  return <img src={tool.cover} alt={tool.toolName} className="w-10 h-10 rounded-lg object-cover" />;
                }
                // 否则当作emoji渲染
                return <span className="text-2xl">{tool.cover}</span>;
              };

              return (
                <ToolCard
                  key={tool.id}
                  tool={{
                    id: iHash(tool.id),
                    title: tool.toolName,
                    desc: tool.description || '',
                    icon: renderIcon(),
                    tags: tool.tag,
                  }}
                  onClick={() => router.push(`/love/${tool.id}`)}
                />
              );
            })}
          </div>

          {/* 4. 分页控件 */}
          {renderPagination()}
        </>
      )}

      {/* 5. 面包屑和底部提示 */}
      <div className="flex justify-between items-center py-8">
        <div className="text-sm text-slate-500">
          {breadcrumbText} {filteredTools.length > 0 && `(第 ${currentPage}/${totalPages} 页)`}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Heart className="w-4 h-4 animate-pulse text-rose-300" />
          加载更多浪漫...
        </div>
      </div>
    </div>
  );
}