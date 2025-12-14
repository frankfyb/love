import { useState, useEffect } from 'react';
import { Heart, Sparkles, Gift, User, Search, Bell, Menu, X } from 'lucide-react';
import type { NavItem, PageKey } from '@/types';
interface NavbarProps {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
}

const Navbar = ({ currentPage, setCurrentPage }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 导航项配置
  const navItems: NavItem[] = [
    { id: 'home', label: '首页', icon: Sparkles },
    { id: 'love', label: '仪式库', icon: Gift },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-400 text-white flex items-center justify-center transform rotate-3">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Love<span className="text-rose-500">Rituals</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as PageKey)}
                className={`text-sm font-medium transition-colors hover:text-rose-500 flex items-center gap-1.5 ${currentPage === item.id ? 'text-rose-500' : 'text-slate-500'}`}
              >
                {item.icon && <item.icon className={`w-4 h-4 ${currentPage === item.id ? 'fill-rose-100' : ''}`} />}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-400 hover:text-rose-500 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-rose-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full ring-2 ring-white"></span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-pink-100 p-4 space-y-4 animate-in slide-in-from-top-10">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as PageKey);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${currentPage === item.id ? 'bg-pink-50 text-rose-500' : 'text-slate-600'}`}
              >
                 <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
