'use client';
import React from 'react';
import {
  Home,
  LayoutGrid,
  User,
  Settings2,
  BookHeart,
  FolderHeart,
  Copy,
  RotateCcw,
  Share2,
  LucideIcon
} from 'lucide-react';

// ================= Types =================

interface ActionBarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNavigateHome: () => void;
  onNavigateLibrary: () => void;
  onNavigateProfile: () => void;
  onToggleTemplates: () => void;
  onViewTemplates?: () => void;  // 新增：查看已收藏的模板
  onShare: () => void;
  onReset: () => void;
  variant?: 'desktop' | 'mobile' | 'both'; // 'both' = responsive
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  danger?: boolean;
  size?: 'sm' | 'md';
}

// ================= ActionButton Component =================

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  danger = false,
  size = 'md'
}) => {
  const sizeClass = size === 'sm' ? 'p-2.5' : 'p-3';
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6';

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center justify-center ${sizeClass} rounded-full transition-all duration-300 pointer-events-auto
        ${isActive
          ? 'bg-pink-500/20 text-pink-200 ring-1 ring-pink-500/50'
          : 'hover:bg-white/10 text-gray-400 hover:text-pink-100'
        }
        ${danger ? 'hover:text-red-300 hover:bg-red-500/20' : ''}
      `}
      title={label}
    >
      <Icon className={`${iconSize} transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />

      {/* Floating Label - Adaptive Positioning */}
      <span
        className={`
          absolute px-2 py-1 text-xs font-medium text-white bg-black/60 backdrop-blur-md rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap
          
          /* Mobile: Label above button */
          bottom-full mb-2 left-1/2 -translate-x-1/2
          
          /* Desktop: Label to the left of button */
          md:bottom-auto md:mb-0 md:right-full md:mr-3 md:top-1/2 md:-translate-y-1/2 md:left-auto md:translate-x-0
        `}
      >
        {label}
      </span>
    </button>
  );
};

// ================= Desktop Vertical Bar =================

const DesktopBar: React.FC<ActionBarProps> = ({
  isOpen,
  setIsOpen,
  onNavigateHome,
  onNavigateLibrary,
  onNavigateProfile,
  onToggleTemplates,
  onViewTemplates,
  onShare,
  onReset
}) => {
  return (
    <div
      className={`
        fixed right-6 top-1/2 -translate-y-1/2 z-50
        flex flex-col items-center gap-2 p-3
        bg-gray-700/90 backdrop-blur-xl border border-white/10 shadow-2xl
        rounded-full transition-all duration-500 ease-out
        hidden md:flex pointer-events-auto
      `}
    >
      {/* Home */}
      <ActionButton icon={Home} label="首页" onClick={onNavigateHome} />

      {/* Grid - Library */}
      <ActionButton icon={LayoutGrid} label="仪式库" onClick={onNavigateLibrary} />

      {/* User - Profile */}
      <ActionButton icon={User} label="我的" onClick={onNavigateProfile} />

      {/* Divider */}
      <div className="w-6 h-px bg-white/10 my-1" />

      {/* Settings */}
      <ActionButton
        icon={Settings2}
        label={isOpen ? '收起配置' : '展开配置'}
        onClick={() => setIsOpen(!isOpen)}
        isActive={isOpen}
      />

      {/* Heart - Save Memory */}
      <ActionButton icon={BookHeart} label="收藏当前" onClick={onToggleTemplates} />

      {/* View Saved Memories */}
      {onViewTemplates && (
        <ActionButton icon={FolderHeart} label="查看收藏" onClick={onViewTemplates} />
      )}

      {/* Copy - Share */}
      <ActionButton icon={Copy} label="分享瞬间" onClick={onShare} />

      {/* Refresh - Reset */}
      <ActionButton icon={RotateCcw} label="重置" onClick={onReset} />
    </div>
  );
};

// ================= Mobile Horizontal Bar =================

const MobileBar: React.FC<ActionBarProps> = ({
  isOpen,
  setIsOpen,
  onNavigateHome,
  onNavigateLibrary,
  onNavigateProfile,
  onToggleTemplates,
  onViewTemplates,
  onShare,
  onReset
}) => {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex flex-row items-center gap-2 p-2
        bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl
        rounded-full transition-all duration-500 ease-out
        md:hidden pointer-events-auto
      `}
    >
      {/* Navigation Group */}
      <div className="flex flex-row gap-1">
        <ActionButton icon={Home} label="首页" onClick={onNavigateHome} size="sm" />
        <ActionButton icon={LayoutGrid} label="仪式库" onClick={onNavigateLibrary} size="sm" />
        <ActionButton icon={User} label="我的" onClick={onNavigateProfile} size="sm" />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

      {/* Tool Actions Group */}
      <div className="flex flex-row gap-1">
        <ActionButton
          icon={Settings2}
          label={isOpen ? '收起配置' : '展开配置'}
          onClick={() => setIsOpen(!isOpen)}
          isActive={isOpen}
          size="sm"
        />
        <ActionButton icon={BookHeart} label="收藏" onClick={onToggleTemplates} size="sm" />
        {onViewTemplates && (
          <ActionButton icon={FolderHeart} label="收藏夹" onClick={onViewTemplates} size="sm" />
        )}
        <ActionButton icon={Share2} label="分享瞬间" onClick={onShare} size="sm" />
        <ActionButton icon={RotateCcw} label="重置" onClick={onReset} size="sm" />
      </div>
    </div>
  );
};

// ================= Main Component =================

export const FloatingActionBar: React.FC<ActionBarProps> = (props) => {
  const { variant = 'both' } = props;

  return (
    <>
      {(variant === 'desktop' || variant === 'both') && <DesktopBar {...props} />}
      {(variant === 'mobile' || variant === 'both') && <MobileBar {...props} />}
    </>
  );
};

export default FloatingActionBar;
