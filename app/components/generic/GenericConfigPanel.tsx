'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Settings2, ChevronDown, ChevronUp, ChevronLeft, 
  Upload, Type, Palette, Sparkles, Image as ImageIcon, 
  Menu, X, Gift, Wind, Box, Smartphone, LayoutTemplate
} from 'lucide-react';

// ============================================================================
// 1. 类型导入
// ============================================================================
import type { GenericControlType, CategoryType, GenericConfigItemMetadata, ToolConfigMetadata } from '@/types/genericConfig';

// ============================================================================
// 2. 高颜值玻璃态组件库 (Glassmorphism Components)
// ============================================================================

const Label = ({ children, description }: { children: React.ReactNode, description?: string }) => (
  <div className="mb-2">
    <div className="flex items-center justify-between">
       <label className="block text-xs font-bold text-gray-700 dark:text-gray-100 tracking-wide">{children}</label>
    </div>
    {description && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-light">{description}</p>}
  </div>
);

// 玻璃态基础容器
const BaseControl = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`
    w-full 
    bg-white/40 dark:bg-black/20 
    backdrop-blur-md 
    border border-white/50 dark:border-white/10 
    rounded-xl 
    shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] 
    transition-all duration-300
    hover:bg-white/60 dark:hover:bg-white/10
    hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)]
    hover:border-pink-200/50 dark:hover:border-pink-500/30
    group
    focus-within:ring-2 focus-within:ring-pink-300/50 focus-within:border-pink-300
    focus-within:bg-white/70 dark:focus-within:bg-black/40
    ${className}
  `}>
    {children}
  </div>
);

const InputControl = ({ value, onChange, placeholder }: any) => (
  <BaseControl className="px-3 py-2.5">
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
    />
  </BaseControl>
);

const TextareaControl = ({ value, onChange, placeholder }: any) => (
  <BaseControl className="px-3 py-2.5">
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent focus:outline-none text-sm resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
    />
  </BaseControl>
);

// 玻璃态下拉框
const CustomSelectControl = ({ value, onChange, options }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find((opt: any) => opt.value === value) || options?.[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2.5 
          bg-white/40 dark:bg-black/20 backdrop-blur-md
          border border-white/50 dark:border-white/10
          rounded-xl text-sm flex items-center justify-between 
          hover:bg-white/60 dark:hover:bg-white/10 transition-all 
          focus:outline-none focus:ring-2 focus:ring-pink-300/50
          shadow-sm text-gray-700 dark:text-gray-200
        `}
      >
        <div className="flex items-center gap-2.5">
          {selectedOption?.icon && <span className="opacity-80 text-pink-500">{selectedOption.icon}</span>}
          <span className="font-medium">{selectedOption?.label || value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fadeIn origin-top p-1">
          {options?.map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`
                w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 rounded-lg transition-all
                ${value === opt.value 
                  ? 'bg-pink-500/10 text-pink-600 dark:text-pink-300 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'}
              `}
            >
              {opt.icon && <span className={`opacity-80 scale-90 ${value === opt.value ? 'text-pink-500' : 'text-gray-400'}`}>{opt.icon}</span>}
              {opt.label}
              {value === opt.value && <X className="w-3.5 h-3.5 ml-auto text-pink-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 玻璃态列表生成器
const ListBuilderControl = ({ value, onChange, placeholder }: any) => {
  const [inputValue, setInputValue] = useState('');
  const items = value ? value.split(',').filter((i: string) => i.trim() !== '') : [];

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newItems = [...items, inputValue.trim()];
    onChange(newItems.join(','));
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems.join(','));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <BaseControl className="flex-1 px-3 py-2 hover:bg-white/60">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={placeholder}
            className="w-full bg-transparent focus:outline-none text-sm"
          />
        </BaseControl>
        <button 
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-3.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/40 dark:border-white/5 min-h-[80px]">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
            <Box className="w-3 h-3"/> 已添加 ({items.length})
          </span>
          <span className="text-[10px] text-gray-400 bg-white/40 px-2 py-0.5 rounded-full">逗号分隔</span>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400 italic">暂无内容，请添加</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, idx: number) => (
              <div 
                key={`${item}-${idx}`} 
                className="group flex items-center gap-1.5 bg-white/70 dark:bg-gray-800/80 border border-white/50 dark:border-white/10 px-3 py-1 rounded-full text-xs shadow-sm hover:shadow-md hover:border-pink-200 transition-all animate-fadeIn"
              >
                <span className="text-gray-700 dark:text-gray-200 max-w-[150px] truncate font-medium">{item}</span>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SwitchControl = ({ value, onChange }: any) => (
  <button
    onClick={() => onChange(!value)}
    className={`
      relative w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 
      ${value ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]' : 'bg-gray-200 dark:bg-gray-700'}
    `}
  >
    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SliderControl = ({ value, onChange, min, max, step }: any) => (
  <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2.5 rounded-xl border border-white/40 dark:border-white/5">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
    />
    <span className="text-xs font-mono w-10 text-center bg-white/50 dark:bg-black/30 rounded px-1 py-0.5 text-gray-600 dark:text-gray-300 font-medium">{value}</span>
  </div>
);

const RadioGroupControl = ({ value, onChange, options }: any) => (
  <div className="flex bg-white/30 dark:bg-black/20 p-1.5 rounded-xl border border-white/40 dark:border-white/5 gap-1">
    {options?.map((opt: any) => {
      const isActive = String(value) === String(opt.value);
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-300
            ${isActive 
              ? 'bg-white/90 dark:bg-gray-700 text-pink-600 dark:text-pink-300 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'}
          `}
        >
          {opt.label}
        </button>
      )
    })}
  </div>
);

const ColorControl = ({ value, onChange }: any) => (
  <div className="flex items-center gap-3 border border-white/50 dark:border-white/10 p-2.5 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-md">
    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-md cursor-pointer group">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
      />
    </div>
    <div className="flex flex-col">
       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Color</span>
       <span className="text-xs text-gray-600 dark:text-gray-300 font-mono font-medium">{value}</span>
    </div>
  </div>
);

const StickerGridControl = ({ value, onChange, options }: any) => (
  <div className="grid grid-cols-4 gap-2.5">
    {options.map((opt: any) => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-300
            ${isActive 
              ? 'bg-pink-50/80 border-pink-400 ring-2 ring-pink-200 dark:bg-pink-900/30' 
              : 'bg-white/40 border-white/60 hover:border-pink-300 hover:bg-white/60 dark:bg-white/5 dark:border-white/10'}
          `}
        >
          <div className={`transition-transform duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-gray-400 grayscale'}`}>{opt.icon}</div>
          <span className={`text-[9px] font-medium ${isActive ? 'text-pink-600' : 'text-gray-500'}`}>{opt.label}</span>
        </button>
      );
    })}
  </div>
);

const MultiSelectControl = ({ value, onChange, options }: any) => {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (val: string) => selected.includes(val) ? onChange(selected.filter((v: string) => v !== val)) : onChange([...selected, val]);
  
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt: any) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300
              ${isActive 
                ? 'bg-pink-50 border-pink-300 text-pink-600 shadow-[0_0_8px_rgba(236,72,153,0.2)] dark:bg-pink-900/30 dark:border-pink-500/50 dark:text-pink-300' 
                : 'bg-white/40 border-white/60 text-gray-600 hover:bg-white/70 hover:border-pink-200 dark:bg-white/5 dark:border-white/10'}
            `}
          >
            {isActive && <X className="w-3 h-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const FileControl = ({ label }: any) => (
  <button className="w-full flex items-center justify-center gap-2 px-3 py-5 border-dashed border-2 border-white/60 dark:border-white/20 rounded-xl text-gray-500 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50/30 transition-all text-xs group bg-white/20 backdrop-blur-sm">
    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
    <span className="font-medium">点击上传 {label}</span>
  </button>
);

// ============================================================================
// 3. 字段渲染器
// ============================================================================
const FieldRenderer = <T,>({ 
  itemKey, configValue, allConfig, metadata, onChange 
}: { 
  itemKey: keyof T; configValue: any; allConfig: T; metadata: GenericConfigItemMetadata<T>; onChange: (key: keyof T, val: any) => void 
}) => {
  if (metadata.condition && !metadata.condition(allConfig)) return null;

  const commonProps = { value: configValue, onChange: (val: any) => onChange(itemKey, val), ...metadata };
  let Control;
  switch (metadata.type) {
    case 'input': Control = InputControl; break;
    case 'textarea': Control = TextareaControl; break;
    case 'select': Control = CustomSelectControl; break;
    case 'list': Control = ListBuilderControl; break;
    case 'radio': Control = RadioGroupControl; break;
    case 'switch': Control = SwitchControl; break;
    case 'slider': Control = SliderControl; break;
    case 'color': Control = ColorControl; break;
    case 'sticker-grid': Control = StickerGridControl; break;
    case 'multi-select': Control = MultiSelectControl; break;
    case 'file': Control = FileControl; break;
    default: Control = InputControl;
  }

  return (
    <div className="mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <Label description={metadata.description}>{metadata.label}</Label>
        {metadata.type === 'switch' && (
           // @ts-ignore
           <Control {...commonProps} />
        )}
      </div>
      {metadata.type !== 'switch' && (
         // @ts-ignore
         <Control {...commonProps} />
      )}
    </div>
  );
};

// ============================================================================
// 4. 通用配置面板组件
// ============================================================================
interface GenericConfigPanelProps<T> {
  config: T;
  configMetadata: ToolConfigMetadata<T>;
  onChange: (key: keyof T, val: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function GenericConfigPanel<T>({
  config,
  configMetadata,
  onChange,
  isOpen,
  setIsOpen
}: GenericConfigPanelProps<T>) {
  const [activeTab, setActiveTab] = useState<CategoryType>(configMetadata.tabs[0]?.id || 'base');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);
  const [mobileExpanded, setMobileExpanded] = useState(true);

  // 移动端检测
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端步骤定义
  const mobileSteps = configMetadata.mobileSteps || [
    { id: 1, label: '基础', icon: <Settings2 className="w-4 h-4"/>, fields: [] },
    { id: 2, label: '样式', icon: <Palette className="w-4 h-4"/>, fields: [] },
    { id: 3, label: '特效', icon: <Sparkles className="w-4 h-4"/>, fields: [] },
  ];

  const activeFields = useMemo(() => 
    Object.keys(configMetadata.configSchema).filter(k => configMetadata.configSchema[k as keyof T].category === activeTab), 
  [activeTab, configMetadata]);

  // --- 移动端渲染逻辑 ---
  if (isMobile) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${!isOpen ? 'pointer-events-none' : ''}`}>
        <div className={`
          w-[95%] max-w-md 
          bg-white/70 dark:bg-gray-900/80 backdrop-blur-3xl
          border border-white/40 dark:border-white/10 
          shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl overflow-hidden
          transition-all duration-500
          ${mobileExpanded ? 'translate-y-0 opacity-100 mb-0' : 'translate-y-[88%] opacity-90 mb-0'}
        `}>
          
          {/* Mobile Header / Toggle */}
          <div 
            className="h-14 flex items-center justify-between px-5 border-b border-white/30 dark:border-white/5 cursor-pointer bg-white/40 dark:bg-white/5 active:bg-white/60"
            onClick={() => setMobileExpanded(!mobileExpanded)}
          >
            <div className="flex items-center gap-3">
               <span className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-500"><Smartphone className="w-4 h-4" /></span>
               <span className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {mobileExpanded ? '快速配置' : '展开配置'}
               </span>
            </div>
            <div className="bg-white/50 dark:bg-white/10 p-1.5 rounded-full">
              {mobileExpanded ? <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300"/> : <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            </div>
          </div>

          {/* Mobile Steps Nav */}
          {mobileExpanded && (
            <div className="flex justify-around p-3 bg-white/20 dark:bg-white/5 border-b border-white/20 dark:border-white/5">
              {mobileSteps.map((step) => {
                const isActive = mobileStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setMobileStep(step.id)}
                    className={`
                      flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 relative
                      ${isActive ? 'bg-white shadow-sm text-pink-500 scale-105' : 'text-gray-400 hover:text-gray-600'}
                    `}
                  >
                    <div className={isActive ? 'text-pink-500' : 'text-gray-400'}>{step.icon}</div>
                    <span className="text-[10px] font-bold">{step.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Content Area */}
          {mobileExpanded && (
            <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {mobileSteps.find(s => s.id === mobileStep)?.fields.map(key => (
                 <FieldRenderer<T>
                    key={key as string}
                    itemKey={key}
                    metadata={configMetadata.configSchema[key]}
                    configValue={config[key]}
                    allConfig={config}
                    onChange={onChange}
                  />
              ))}
              
              <div className="mt-4 flex gap-3">
                 <button 
                   onClick={() => setMobileStep(prev => Math.max(1, prev - 1))}
                   disabled={mobileStep === 1}
                   className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-500 disabled:opacity-50"
                 >
                   上一步
                 </button>
                 <button 
                   onClick={() => setMobileStep(prev => Math.min(mobileSteps.length, prev + 1))}
                   disabled={mobileStep === mobileSteps.length}
                   className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-500/30 disabled:opacity-50"
                 >
                   下一步
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- PC 端渲染逻辑 ---
  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="fixed top-6 left-6 z-50 p-3.5 bg-white/70 backdrop-blur-md shadow-lg rounded-full hover:scale-110 hover:rotate-90 transition-all duration-500 border border-white/50 group"
        >
          <Menu className="w-6 h-6 text-gray-700 group-hover:text-pink-500" />
        </button>
      )}

      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-[420px] 
          bg-gradient-to-b from-white/80 via-white/60 to-white/40 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/50
          backdrop-blur-3xl 
          border-r border-white/40 dark:border-white/10 
          shadow-[20px_0_40px_-10px_rgba(0,0,0,0.1)]
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header - 玻璃态标题栏 */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/30 dark:border-white/5 shrink-0 bg-white/10 dark:bg-white/5">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              {configMetadata.panelTitle || '配置工坊'}
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 tracking-wider uppercase opacity-70">
              {configMetadata.panelSubtitle || 'Design Your Romance'}
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/40 rounded-full transition-colors group border border-transparent hover:border-white/40">
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
          </button>
        </div>

        {/* Tab Navigation - 悬浮胶囊式 */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-white/40 backdrop-blur-sm">
            {configMetadata.tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CategoryType)}
                  className={`
                    flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 relative
                    ${isActive ? 'bg-white shadow-md text-pink-500 scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'}
                  `}
                >
                  <div className={`${isActive ? 'text-pink-500' : 'text-gray-400'} transition-colors`}>{tab.icon || <LayoutTemplate className="w-4 h-4"/>}</div>
                  <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
                  {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-pink-500 rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content - 隐形滚动条 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32 space-y-2">
          {activeFields.map(key => (
            <FieldRenderer<T>
              key={key as string}
              itemKey={key as keyof T}
              metadata={configMetadata.configSchema[key as keyof T]}
              configValue={config[key as keyof T]}
              allConfig={config}
              onChange={onChange}
            />
          ))}
          <div className="h-12" />
        </div>

        {/* Footer - 悬浮按钮 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 via-white/60 to-transparent dark:from-black/90 pointer-events-none">
          <button className="pointer-events-auto w-full py-3.5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-sm flex items-center justify-center gap-2 group border border-white/20 backdrop-blur-xl">
             <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
             生成预览 / 导出
          </button>
        </div>
      </div>
    </>
  );
}