'use client';
import React from 'react';
import Button from '@/components/common/Button';

export default function ShareContent() {
  const share = async () => {
    try {
      const text = '和我一起体验 Loverituals 的浪漫仪式吧～';
      if (navigator.share) {
        await navigator.share({ title: 'Loverituals', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('分享文案已复制到剪贴板');
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">将这份浪漫分享给你的 TA：</p>
      <div className="flex gap-2">
        <Button variant="primary" onClick={share}>直接分享</Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(location.href)}>复制当前链接</Button>
      </div>
    </div>
  );
}
