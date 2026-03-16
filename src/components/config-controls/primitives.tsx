'use client';

import React from 'react';

/**
 * 标签组件（显示字段名称 + 可选描述）
 */
export const Label = ({ children, description }: { children: React.ReactNode, description?: string }) => (
    <div className="mb-2">
        <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-100 tracking-wide">{children}</label>
        </div>
        {description && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-light">{description}</p>}
    </div>
);

/**
 * 玻璃态基础容器（所有控件的样式基座）
 */
export const BaseControl = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
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
