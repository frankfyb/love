import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // 需创建全局样式文件（Tailwind入口）
import AppShell from '@/components/layout/AppShell';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LoveRituals - 让爱更有仪式感',
  description: '浪漫仪式感多工具分享平台，记录每一个心动瞬间',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning className={`min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 font-sans text-slate-700 selection:bg-rose-200 selection:text-rose-700 ${inter.className}`}>
          <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
