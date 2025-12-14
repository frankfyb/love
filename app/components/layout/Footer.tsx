import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="bg-white/50 border-t border-pink-100/50 py-8">
    <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
      <div className="flex justify-center items-center gap-2 mb-2">
        Made with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for Lovers
      </div>
      <p>© 2023 LoveRituals. 所有的浪漫都值得被记录。</p>
    </div>
  </footer>
);

export default Footer;