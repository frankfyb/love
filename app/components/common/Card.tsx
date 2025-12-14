import type { CardProps } from '@/types';

const Card = ({ children, className = '', hoverEffect = true }: CardProps) => (
  <div className={`bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300' : ''} shadow-sm ${className}`}>
    {children}
  </div>
);

export default Card;