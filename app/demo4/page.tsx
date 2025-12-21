'use client';
import React, { useMemo, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // 实际项目中请解开此注释
// import { getToolFullConfig } from '@/config/toolsRegistry'; // 实际项目中请解开此注释
// import { useWorks } from '@/hooks/useWorks'; // 实际项目中请解开此注释
// import Modal from '@/components/common/Modal'; // 实际项目中请解开此注释
// import { GenericConfigPanel } from '@/components/generic/GenericConfigPanel'; // 实际项目中请解开此注释
import { 
  Plus, 
  Trash2, 
  Play, 
  Check,
  ChevronLeft,
  X
} from 'lucide-react';
import { FloatingActionBar } from '@/components/generic/FloatingActionBar';

// ================= MOCK DATA & COMPONENTS FOR PREVIEW (预览用模拟数据) =================

// 1. Mock useRouter
const useRouter = () => {
  return {
    push: (path: string) => console.log(`[Mock Router] Navigate to: ${path}`)
  };
};

// 2. Mock Modal
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// 3. Mock GenericConfigPanel
const GenericConfigPanel = ({ isOpen, setIsOpen }: any) => {
  return (
    <div className="h-full w-[320px] md:w-[420px] bg-gray-900 border-r border-white/10 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">配置面板</h2>
        <button onClick={() => setIsOpen(false)} className="md:hidden p-2 bg-white/10 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-sm text-gray-400 mb-2 block">示例选项 A</label>
          <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
            <div className="h-full w-2/3 bg-pink-500" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-sm text-gray-400 mb-2 block">示例开关 B</label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-pink-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="text-xs text-gray-500">已开启</span>
          </div>
        </div>
      </div>
      <div className="mt-auto text-xs text-gray-600 text-center">
        Mock Config Panel
      </div>
    </div>
  );
};

// 4. Mock Hooks & Logic
const useWorks = (key: string) => {
  const [works, setWorks] = useState<any[]>([
    { id: '1700000000000', name: '初次相遇', data: {} },
    { id: '1700000000001', name: '星空之下', data: {} }
  ]);
  const addWork = (name: string, data: any) => {
    setWorks(prev => [...prev, { id: Date.now().toString(), name, data }]);
  };
  const removeWork = (id: string) => {
    setWorks(prev => prev.filter(w => w.id !== id));
  };
  return { works, addWork, removeWork };
};

const getToolFullConfig = (key: string) => {
  return {
    defaultConfig: { demo: true },
    configMetadata: { demo: { type: 'boolean' } },
    DisplayUI: ({ isPanelOpen }: any) => (
      <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${isPanelOpen ? 'pl-[420px]' : ''}`}>
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full animate-pulse blur-xl opacity-50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">
              Tool Preview
            </h1>
            <p className="text-gray-400 mt-2">内容显示区域</p>
          </div>
        </div>
      </div>
    )
  };
};

// ================= REAL IMPLEMENTATION STARTS HERE =================

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
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-pink-100 text-sm font-medium">
        <Check className="w-4 h-4 text-pink-400" />
        {message}
      </div>
    </div>
  );
};



export default function ToolPage({ params }: { params: Promise<{ loves: string }> }) {
  // Mock param resolution for preview safety
  const [resolvedParams, setResolvedParams] = useState<{ loves: string } | null>(null);

  useEffect(() => {
    // In a real environment, `params` is a promise. In preview, we might need a fallback.
    if (params) {
      params.then(setResolvedParams);
    } else {
      setResolvedParams({ loves: 'preview-tool-id' });
    }
  }, [params]);

  const router = useRouter();
  const toolKey = resolvedParams ? decodeURIComponent(resolvedParams.loves) : 'loading...';
  const [isOpen, setIsOpen] = useState(true);
  
  // Memoize tool config
  const tool = useMemo(() => {
    if (!resolvedParams) return null;
    try { return getToolFullConfig(toolKey); } catch { return null; }
  }, [toolKey, resolvedParams]);

  // States
  const [config, setConfig] = useState<any>(null); 
  const { works: templates, addWork, removeWork } = useWorks(String(toolKey));
  const [showTemplates, setShowTemplates] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Initialize
  useEffect(() => {
    if (!tool) return;
    setConfig(tool.defaultConfig);
    
    // Check URL for shared config
    try {
      const search = new URLSearchParams(window.location.search);
      const encoded = search.get('config');
      if (encoded) {
        const parsed = JSON.parse(decodeURIComponent(encoded));
        if (parsed && typeof parsed === 'object') {
          setConfig(parsed);
          setIsOpen(false); 
          setTimeout(() => showToastMsg('已加载分享的配置，沉浸式体验中...'), 500);
        }
      }
    } catch {}
  }, [tool]);

  const handleConfigChange = (key: keyof any, value: any) => {
    if (toolKey === 'christmas-avatar' && key === 'stickers') {
      setConfig((prev: any) => ({ ...prev, [key]: value }));
      return;
    }
    setConfig((prev: any) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  };

  const saveCurrentTemplate = () => {
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

  const copyShareLink = async () => {
    const url = `${window.location.origin}/love/${toolKey}?config=${encodeURIComponent(JSON.stringify(config))}`;
    try {
      await navigator.clipboard.writeText(url);
      showToastMsg('分享链接已复制，传递这份浪漫吧');
    } catch {
      window.prompt('复制分享链接', url);
    }
  };

  // Navigation Handlers
  const goHome = () => router.push('/');
  const goLibrary = () => router.push('/love');
  const goProfile = () => router.push('/profile');

  // Loading state
  if (!resolvedParams || !config || !tool) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
           <p className="text-gray-400 text-sm">正在加载魔法...</p>
        </div>
      </main>
    );
  }

  const { DisplayUI, configMetadata, defaultConfig } = tool;

  return (
    <main className="relative flex h-screen w-full bg-black font-sans text-slate-100 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-900/20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ================= FLOATING ACTION BAR ================= */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <FloatingActionBar 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onNavigateHome={goHome}
          onNavigateLibrary={goLibrary}
          onNavigateProfile={goProfile}
          onToggleTemplates={() => setShowTemplates(true)}
          onShare={copyShareLink}
          onReset={() => setConfig(defaultConfig)}
        />
      </div>

      {/* ================= Templates Modal ================= */}
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
                <div className="flex flex-col text-left">
                  <span className="text-sm text-gray-200 font-medium">{t.name}</span>
                  <span className="text-xs text-gray-500">{new Date(Number(t.id)).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
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

      {/* Toast Notification */}
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />

      {/* ================= Main Content Area ================= */}
      <div className="absolute inset-0 z-0">
        <DisplayUI config={config} isPanelOpen={isOpen} onConfigChange={handleConfigChange} />
      </div>

      {/* ================= Configuration Side Panel ================= */}
      <div 
        className={`
          absolute top-0 left-0 h-full z-40
          transition-transform duration-500 ease-in-out will-change-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full relative shadow-2xl">
          {configMetadata ? (
            <GenericConfigPanel 
              config={config} 
              configMetadata={configMetadata} 
              onChange={handleConfigChange} 
              isOpen={isOpen} 
              setIsOpen={setIsOpen} 
            />
          ) : (
            <div className="w-[320px] md:w-[420px] h-full bg-gray-900/90 backdrop-blur-md flex items-center justify-center border-r border-white/10">
              <p className="text-gray-500 text-sm">此工具暂无配置项</p>
            </div>
          )}
          
          {/* Mobile Panel Close Handle (Optional visual cue) */}
          <div className="md:hidden absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/5 rounded-r-lg flex items-center justify-center" onClick={() => setIsOpen(false)}>
             <ChevronLeft className="w-4 h-4 text-white/50" />
          </div>
        </div>
      </div>

    </main>
  );
}