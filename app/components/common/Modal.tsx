import { X, Heart } from 'lucide-react';
import type { ModalProps } from '@/types';

const Modal = ({ isOpen, onClose, title, children, theme = 'light' }: ModalProps) => {
  if (!isOpen) return null;
  
  const isDark = theme === 'dark';
  
  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${isDark ? 'bg-black/60' : 'bg-slate-900/20'} backdrop-blur-sm transition-opacity`}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in duration-300 border ${isDark ? 'bg-zinc-900/90 border-white/10 text-pink-100' : 'bg-white/90 border-white text-slate-700'} backdrop-blur-xl`}>
        <div className={`flex justify-between items-center mb-6 ${isDark ? 'border-b border-white/5 pb-4' : ''}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-pink-100/90' : 'text-slate-700'}`}>
            <Heart className={`w-5 h-5 ${isDark ? 'text-pink-400 fill-pink-400' : 'text-rose-400 fill-rose-400'}`} />
            {title}
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-400'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;