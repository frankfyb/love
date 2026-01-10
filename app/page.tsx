'use client';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { SCENARIOS_DATA, TOOLS_DATA } from '@/constants/mock-data';
import Button from '@/components/common/Button';
import ScenarioCard from '@/components/business/ScenarioCard';
import ToolCard from '@/components/business/ToolCard';
import type { PageKey } from '@/types';

interface HomePageProps {
  navigateTo: (page: PageKey) => void;
}

// 首页组件（需在父组件中传递navigateTo）
const HomePage = ({ navigateTo }: HomePageProps) => (
  <div className="space-y-12 animate-fade-in duration-500">
    {/* Hero Section */}
    <section className="text-center py-10 space-y-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/50 text-rose-500 text-sm font-medium shadow-sm mb-4">
        <Sparkles className="w-4 h-4" /> 让爱更有仪式感
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight leading-tight">
        记录每一个 <span className="text-rose-500 relative inline-block">
          我们的爱情轨迹
          <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-200/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
          </svg>
        </span>
      </h1>
      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
        无论是表白、纪念日还是日常的小确幸，我们为您提供全套的浪漫工具，
        让每一份心意都闪闪发光。
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Button variant="primary" className="px-8 text-lg" onClick={() => navigateTo('love')}>开始创作</Button>
        <Button variant="secondary" className="px-8 text-lg" onClick={() => navigateTo('love')}>浏览灵感</Button>
      </div>
    </section>

    {/* Scenarios */}
    <section>
      <div className="flex justify-between items-end mb-6 px-2">
        <h2 className="text-2xl font-bold text-slate-800">热门场景</h2>
        <button className="text-slate-400 hover:text-rose-500 text-sm flex items-center gap-1 transition-colors" onClick={() => navigateTo('love')}>
          更多场景 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SCENARIOS_DATA.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </section>

    {/* Core Features */}
    <section>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">精选工具</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOOLS_DATA.slice(0, 4).map((tool) => (
          <ToolCard key={tool.id} tool={tool} isHome={true} onClick={() => navigateTo('love')} />
        ))}
      </div>
    </section>
  </div>
);

// 首页入口（Next.js App Router）
export default function Home() {
  const router = useRouter();
  const navigateTo = (page: PageKey) => {
    router.push('/love');
  };
  
  return <HomePage navigateTo={navigateTo} />;
}
