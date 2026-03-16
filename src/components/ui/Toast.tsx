"use client";
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';
type ToastTheme = 'light' | 'dark';

interface ToastProps {
  message: string;
  type: ToastType;
  theme?: ToastTheme;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, theme = 'light', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // 等待动画结束
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // 浅色主题样式
  const lightStyles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  // 深色主题样式（工具详情页使用）
  const darkStyles = {
    success: 'bg-white/10 backdrop-blur-xl border border-white/20 text-pink-100',
    error: 'bg-red-900/50 backdrop-blur-xl border border-red-500/30 text-red-200',
    info: 'bg-white/10 backdrop-blur-xl border border-white/20 text-pink-100',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const isDark = theme === 'dark';
  const typeStyle = isDark ? darkStyles[type] : lightStyles[type];
  const positionStyle = isDark
    ? 'fixed top-20 left-1/2 -translate-x-1/2 z-[100]'
    : 'fixed top-4 right-4 z-50';
  const containerStyle = isDark
    ? `px-6 py-3 rounded-full shadow-2xl text-sm font-medium`
    : `w-80 p-4 rounded-lg shadow-lg text-sm`;

  // 只在客户端挂载后渲染 Portal
  if (!mounted) return null;

  return createPortal(
    <div
      className={`${positionStyle} transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0'}`}
    >
      <div className={`flex items-center gap-2 ${containerStyle} ${typeStyle}`}>
        <span className={isDark ? 'text-base' : 'text-xl mr-2'}>{icons[type]}</span>
        <p>{message}</p>
      </div>
    </div>,
    document.body
  );
};

// Toast 上下文
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  /** 设置全局 Toast 主题（dark 用于沉浸式工具页面） */
  setTheme: (theme: ToastTheme) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType; duration?: number }>
  >([]);
  const [theme, setTheme] = useState<ToastTheme>('light');

  const showToast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const id = Math.random().toString(36).substring(2, 10);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const contextValue = useMemo(() => ({ showToast, setTheme }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          theme={theme}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

// 自定义 Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 必须在 ToastProvider 中使用');
  return context;
};
