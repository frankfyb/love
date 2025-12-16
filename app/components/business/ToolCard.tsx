import { ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { ReactNode } from 'react';

interface ToolCardTool {
  id: number | string;
  title: string;
  desc: string;
  icon: ReactNode;
  tag?: string | string[];
  tags?: string[];
}

interface ToolCardProps {
  tool: ToolCardTool;
  isHome?: boolean;
  onClick?: () => void;
}

const ToolCard = ({ tool, isHome = false, onClick }: ToolCardProps) => {
  const tags = Array.isArray(tool.tags)
    ? tool.tags
    : Array.isArray(tool.tag)
    ? tool.tag
    : tool.tag
    ? [tool.tag]
    : [];
  const primaryTag = tags[0];

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
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag, index) => (
              <Badge key={index} colorClass="bg-rose-50 text-rose-500">{tag}</Badge>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card key={tool.id} className="group cursor-pointer flex flex-col h-full" onClick={onClick}>
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-2xl bg-pink-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300 flex-shrink-0">
          {tool.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-700 mb-2 leading-tight truncate">{tool.title}</h3>
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag, index) => (
              <Badge key={index} colorClass="bg-yellow-50 text-yellow-600">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">{tool.desc}</p>
      
      <div className="mt-auto">
        <Button variant="secondary" className="w-full text-sm py-2" onClick={onClick}>立即制作</Button>
      </div>
    </Card>
  );
};

export default ToolCard;
