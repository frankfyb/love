import { ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { Tool } from '@/constants/mock-data';

interface ToolCardProps {
  tool: Tool;
  isHome?: boolean;
  onClick?: () => void;
}

const ToolCard = ({ tool, isHome = false, onClick }: ToolCardProps) => {
  if (isHome) {
    return (
      <Card key={tool.id} className="flex flex-col items-start gap-4 h-full cursor-pointer" onClick={onClick}>
        <div className="p-3 rounded-2xl bg-gradient-to-br from-white to-pink-50 shadow-inner">
          {tool.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">{tool.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
        </div>
        <div className="mt-auto pt-4 w-full flex justify-between items-center">
          <Badge colorClass="bg-rose-50 text-rose-500">{tool.tag}</Badge>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card key={tool.id} className="group cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-pink-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
          {tool.icon}
        </div>
        <Badge colorClass="bg-yellow-50 text-yellow-600">{tool.tag}</Badge>
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{tool.title}</h3>
      <p className="text-sm text-slate-500 mb-6">{tool.desc}</p>
      <Button variant="secondary" className="w-full text-sm py-2" onClick={onClick}>立即制作</Button>
    </Card>
  );
};

export default ToolCard;
