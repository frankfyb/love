'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { getToolFullConfig, getToolKeyList } from '@/config/toolsRegistry';
import { useWorks } from '@/hooks/useWorks';
import Modal from '@/components/common/Modal';
import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel';
import { 
  RotateCcw, 
  Share2, 
  BookHeart, 
  Plus, 
  Trash2, 
  Play, 
  X, 
  Check,
  Copy
} from 'lucide-react';

// ================= UI Components =================

const Toast = ({ message, show, onClose }: { message: string, show: boolean, onClose: () => void }) => {
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onCloseRef.current(), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-1/2 translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-pink-100 text-sm">
        <Check className="w-4 h-4 text-pink-400" />
        {message}
      </div>
    </div>
  );
};

export default function ToolPage({ params }: { params: Promise<{ loves: string }> }) {
  const { loves } = (React as any).use(params);
  const toolKey = decodeURIComponent(loves) as any;
  const [isOpen, setIsOpen] = useState(true);
  const tool = useMemo(() => {
    try { return getToolFullConfig(toolKey); } catch { return null; }
  }, [toolKey]);

  // States
  const [config, setConfig] = useState<any>(null); // Initial null to wait for tool load
  const { works: templates, addWork, removeWork } = useWorks(String(toolKey));
  const [showTemplates, setShowTemplates] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Initialize config
  useEffect(() => {
    if (!tool) return;
    setConfig(tool.defaultConfig);
    
    // URL Config
    try {
      const search = new URLSearchParams(window.location.search);
      const encoded = search.get('config');
      if (encoded) {
        const parsed = JSON.parse(decodeURIComponent(encoded));
        if (parsed && typeof parsed === 'object') {
          setConfig(parsed);
          setIsOpen(false); // Auto close panel for immersive experience
          setTimeout(() => showToastMsg('已加载分享的配置，沉浸式体验中...'), 500);
        }
      }
    } catch {}
  }, [tool]);

  const handleConfigChange = (key: keyof any, value: any) => {
    // 对于 Christmas Avatar 工具，我们需要特殊处理 stickers 状态
    if (toolKey === 'christmas-avatar' && key === 'stickers') {
      // 这里可以添加 stickers 状态的处理逻辑
      setConfig((prev: any) => ({ ...prev, [key]: value }));
      return;
    }
    // 避免不必要的状态更新
    setConfig((prev: any) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  };

  const saveCurrentTemplate = () => {
    // Custom prompt could be better, but keeping prompt for simplicity of input
    const name = window.prompt('给这段回忆起个名字吧...', new Date().toLocaleString());
    if (!name) return;
    
    addWork(name, config);
    showToastMsg('已收藏这段回忆');
  };

  const loadTemplate = (t: any) => {
    setConfig(t.data);
    showToastMsg(`已回到 "${t.name}"`);
    setShowTemplates(false);
  };

  const deleteTemplate = (id: string) => {
    if (!confirm('确定要遗忘这段回忆吗？')) return;
    removeWork(id);
  };

  const showToastMsg = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  // Share Logic
  const copyShareLink = async () => {
    const url = `${window.location.origin}/love/${toolKey}?config=${encodeURIComponent(JSON.stringify(config))}`;
    try {
      await navigator.clipboard.writeText(url);
      showToastMsg('分享链接已复制，传递这份浪漫吧');
    } catch {
      window.prompt('复制分享链接', url);
    }
  };

  if (!tool) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">未找到工具：{toolKey}</h1>
          <p className="text-sm text-gray-400 mt-2">请检查 URL 参数 loves 是否为有效的 ToolKey</p>
        </div>
      </main>
    );
  }

  const { DisplayUI, configMetadata, defaultConfig } = tool;
  
  // Guard for initial render
  if (!config) return null; 

  return (
    <main className="relative flex h-screen w-full bg-black font-sans text-slate-100 overflow-hidden">
      {/* Ambient Background Glow (Optional) */ }
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-900/20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Floating Toolbar */ }
      <div className={`fixed top-6 right-6 z-50 flex flex-col gap-4 items-end transition-all duration-700 ease-in-out ${!isOpen ? 'opacity-0 hover:opacity-100 translate-y-[-20px] hover:translate-y-0' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:bg-white/10">
          
          <button 
            onClick={() => setConfig(defaultConfig)}
            className="group relative p-2.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-pink-200 transition-all"
            title="重置初始状态"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-pink-100 bg-black/50 backdrop-blur rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              重置
            </span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button 
            onClick={() => setShowTemplates(true)}
            className="group relative p-2.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-pink-200 transition-all"
            title="珍藏的回忆"
          >
            <BookHeart className="w-5 h-5" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-pink-100 bg-black/50 backdrop-blur rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              回忆
            </span>
          </button>

          <button 
            onClick={copyShareLink}
            className="group relative p-2.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-pink-200 transition-all"
            title="分享这份浪漫"
          >
            <Share2 className="w-5 h-5" />
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-pink-100 bg-black/50 backdrop-blur rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              分享
            </span>
          </button>
        </div>
      </div>

      {/* Templates Modal */ }
      <Modal 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        title="珍藏的瞬间"
        theme="dark"
      >
        <div className="space-y-4">
          <button 
            onClick={saveCurrentTemplate}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-pink-200 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">收藏当前画面</span>
          </button>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                还没有收藏的回忆...
              </div>
            )}
            {templates.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-200 font-medium">{t.name}</span>
                  <span className="text-xs text-gray-500">{new Date(Number(t.id)).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => loadTemplate(t)}
                    className="p-2 rounded-full hover:bg-pink-500/20 text-gray-400 hover:text-pink-300 transition-colors"
                    title="重现"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTemplate(t.id)}
                    className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                    title="遗忘"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Toast Notification */ }
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />

      {/* Main Content */ }
      <div className="absolute inset-0 z-0">
        <DisplayUI config={config} isPanelOpen={isOpen} onConfigChange={handleConfigChange} />
      </div>

      <div 
        className={`absolute top-0 left-0 h-full z-0 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
          {configMetadata ? (
            <GenericConfigPanel 
              config={config} 
              configMetadata={configMetadata} 
              onChange={handleConfigChange} 
              isOpen={isOpen} 
              setIsOpen={setIsOpen} 
            />
          ) : (
            <div className="w-[420px] h-full bg-gray-900 flex items-center justify-center">
              <p className="text-gray-500">该工具暂不支持配置面板</p>
            </div>
          )}
      </div>
    </main>
  );
}