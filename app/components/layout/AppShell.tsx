'use client';
import { useState, useEffect } from 'react';
import type { PageKey } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Modal from '@/components/common/Modal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [isImmersive, setIsImmersive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const seg = (pathname?.replace('/', '') || '') as PageKey | '';
    setCurrentPage((seg || 'home') as PageKey);

    // Check immersive mode: /love/[toolKey] - all tool pages should be immersive
    const checkImmersive = () => {
      // 修改判断条件：只要是 /love/ 开头的路径（但不是 /love 本身）就进入沉浸式模式
      if (pathname?.startsWith('/love/') && pathname !== '/love') {
        setIsImmersive(true);
        return;
      }
      setIsImmersive(false);
    };

    checkImmersive();
    // Listen to URL changes (popstate) just in case, though pathname change usually triggers rerender
    window.addEventListener('popstate', checkImmersive);
    return () => window.removeEventListener('popstate', checkImmersive);
  }, [pathname]);

  if (isImmersive) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={(p) => {
          setCurrentPage(p);
          router.push(`/${p === 'home' ? '' : p}`);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 min-h-[calc(100vh-60px)]">
        {children}
      </main>

      <footer className="bg-white/50 border-t border-pink-100/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <div className="flex justify-center items-center gap-2 mb-2">
            Made with <span className="text-rose-400">❤</span> for Lovers
          </div>
          <p>© 2025 LoveRituals. 所有的浪漫都值得被记录。</p>
        </div>
      </footer>

      {/* <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="欢迎回来">
        <LoginContent onLogin={() => setIsLoginOpen(false)} />
      </Modal> */}
    </div>
  );
}