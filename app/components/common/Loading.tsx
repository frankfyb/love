import { Heart } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] text-rose-400">
      <Heart className="w-8 h-8 animate-pulse mb-2" />
      <span className="text-sm font-medium animate-bounce">正在准备惊喜...</span>
    </div>
  );
}
