'use client';
import React, { useState } from 'react';
import { Share2, Copy, CheckCircle, ExternalLink, X, Heart } from 'lucide-react';
import Modal from '@/components/common/Modal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
  isSaving: boolean;
  onGenerate: () => void;
  error?: string;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  shareLink, 
  isSaving, 
  onGenerate,
  error 
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="分享这份浪漫">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
          </div>
          <p className="text-slate-600">
            生成一个专属链接，将这份精心准备的惊喜<br/>分享给特别的 TA
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        {!shareLink ? (
          <button
            onClick={onGenerate}
            disabled={isSaving}
            className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在生成...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                生成分享链接
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative group">
              <input
                readOnly
                value={shareLink}
                className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
              <button
                onClick={handleCopy}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  copied 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-rose-500 hover:border-rose-200'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    复制
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                预览效果
              </a>
              <button
                onClick={() => {
                  onGenerate(); // 重新生成
                  setCopied(false);
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-medium hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all text-sm"
              >
                更新配置
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-400">
              链接有效期为 24 小时，请及时分享
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
