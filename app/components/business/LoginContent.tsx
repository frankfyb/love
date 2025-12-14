'use client';

import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import RegisterContent from '@/components/business/RegisterContent';
import ResetPasswordContent from '@/components/business/ResetPasswordContent';
// 类型定义
type LoginTab = 'login' | 'register' | 'reset';
type LoginMode = 'password' | 'code';
type LoginContentProps = {
  onLogin: () => void;
};

export default function LoginContent({ onLogin }: LoginContentProps) {
  // 状态管理
  const [activeTab, setActiveTab] = useState<LoginTab>('login');
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    code: '',
  });
  
  // 使用共享Hook
  const {
    countdown,
    sendingCode,
    loading,
    fieldErrors,
    validationStatus,
    sendVerificationCode,
    validateField,
    setGlobalError,
    clearGlobalError,
    setLoading,
  } = useAuthForm();
  
  const router = useRouter();

  // 表单值变更处理
  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // 输入时清空错误提示
    if (field !== 'code' && value) {
      validateField(field, value);
    }
    
    // 输入时清空全局错误
    if (fieldErrors.global) {
      clearGlobalError();
    }
  };

  // 发送验证码
  const handleSendCode = async (type: VerificationCodeType = 'LOGIN') => {
    const { email } = formState;
    const success = await sendVerificationCode(email, type);
    
    // 如果是开发环境且发送成功，自动填充验证码
    if (success && process.env.NODE_ENV !== 'production') {
      // 这里不需要做任何事情，因为验证码会在sendVerificationCode中自动处理
    }
  };

  // 登录处理
  const handleLogin = async () => {
    const { email, password, code } = formState;
    
    // 通用校验
    if (!email) {
      setGlobalError('请输入邮箱地址');
      return;
    }
    
    if (!validationStatus.emailValid) {
      setGlobalError('请输入有效的邮箱格式');
      return;
    }

    setLoading(true);
    clearGlobalError();
    
    try {
      // 获取CSRF Token
      const csrfToken = await getCsrfToken();
      let result;
      
      if (loginMode === 'password') {
        // 密码登录校验
        if (!password) {
          setGlobalError('请输入密码');
          setLoading(false);
          return;
        }
        
        result = await signIn('email-password', {
          email,
          password,
          redirect: false,
          csrfToken,
          callbackUrl: window.location.origin,
        });
      } else {
        // 验证码登录校验
        if (!code) {
          setGlobalError('请输入6位验证码');
          setLoading(false);
          return;
        }
        if (code.length !== 6 || isNaN(Number(code))) {
          setGlobalError('请输入有效的6位数字验证码');
          setLoading(false);
          return;
        }
        
        result = await signIn('email-code', {
          email,
          code,
          redirect: false,
          csrfToken,
          callbackUrl: window.location.origin,
        });
      }

      // 登录结果处理
      if (result?.error) {
        // 友好化错误提示
        const friendlyError = result.error.includes('验证码') 
          ? '验证码已过期或无效，请重新获取'
          : result.error.includes('密码')
            ? '密码错误，请检查后重试'
            : result.error.includes('未注册')
              ? '该邮箱尚未注册，请先注册'
              : result.error;
        
        setGlobalError(friendlyError);
      } else if (result?.ok) {
        // 登录成功回调
        onLogin();
        // 可选：刷新页面或跳转首页
        router.refresh();
      }
    } catch (err) {
      console.error('登录错误：', err);
      setGlobalError('登录失败，请检查网络或重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换标签时重置状态
  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    clearGlobalError();
    
    // 切换到登录标签时重置登录模式
    if (tab === 'login') {
      setLoginMode('password');
    }
    
    // 重置表单（可选）
    setFormState({
      email: formState.email, // 保留邮箱
      password: '',
      code: '',
    });
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* 错误提示组件 */}
      {fieldErrors.global && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{fieldErrors.global}</span>
        </div>
      )}

      {/* 标签切换栏 */}
      <div className="flex gap-4 mb-6 border-b border-pink-100">
        {[
          { key: 'login', label: '登录' },
          { key: 'register', label: '注册' },
          { key: 'reset', label: '重置密码' }
        ].map((item) => (
          <button
            key={item.key}
            className={`pb-2 font-medium transition-colors ${
              activeTab === item.key 
                ? 'border-b-2 border-rose-400 text-rose-500' 
                : 'text-slate-400 hover:text-rose-400'
            }`}
            onClick={() => handleTabChange(item.key as LoginTab)}
            aria-selected={activeTab === item.key}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 登录表单 */}
      {activeTab === 'login' && (
        <div className="space-y-4">
          {/* 登录模式切换 */}
          <div className="flex gap-2 text-sm">
            <button
              className={`px-3 py-1 rounded transition-colors ${
                loginMode === 'password' 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-pink-50 text-slate-500 hover:bg-pink-100'
              }`}
              onClick={() => setLoginMode('password')}
              aria-label="邮箱密码登录"
            >
              邮箱密码
            </button>
            <button
              className={`px-3 py-1 rounded transition-colors ${
                loginMode === 'code' 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-pink-50 text-slate-500 hover:bg-pink-100'
              }`}
              onClick={() => setLoginMode('code')}
              aria-label="邮箱验证码登录"
            >
              邮箱验证码
            </button>
          </div>

          {/* 表单输入区域 */}
          <div className="space-y-3">
            {/* 邮箱输入框 */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
              <input
                type="email"
                placeholder="请输入邮箱地址"
                value={formState.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent
                         text-slate-600 placeholder-pink-300 transition-all"
                aria-label="邮箱地址"
                disabled={loading}
              />
            </div>

            {/* 密码/验证码输入框 */}
            {loginMode === 'password' ? (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
                <input
                  type="password"
                  placeholder="请输入密码（8-20位，含字母+数字）"
                  value={formState.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent
                           text-slate-600 placeholder-pink-300 transition-all"
                  aria-label="密码"
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
                  <input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={formState.code}
                    onChange={(e) => handleFormChange('code', e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border border-pink-100 rounded-xl 
                             focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-transparent
                             text-slate-600 placeholder-pink-300 transition-all"
                    aria-label="验证码"
                    disabled={loading}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="whitespace-nowrap min-w-[120px]"
                  onClick={() => handleSendCode('LOGIN')}
                  disabled={sendingCode || countdown > 0 || loading || !formState.email || !validationStatus.emailValid}
                  aria-disabled={sendingCode || countdown > 0 || loading}
                >
                  {countdown > 0 
                    ? `${countdown}s后重新获取` 
                    : sendingCode 
                      ? '发送中...' 
                      : '获取验证码'}
                </Button>
              </div>
            )}
          </div>

          {/* 登录按钮 */}
          <Button 
            variant="primary" 
            className="w-full mt-4 py-2.5" 
            onClick={handleLogin}
            disabled={loading}
            aria-label="登录"
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </div>
      )}

      {/* 注册内容 */}
      {activeTab === 'register' && (
        <div className="mt-4">
          <RegisterContent 
            onRegistered={onLogin} 
            onSendCode={(email: string) => {
              setFormState(prev => ({ ...prev, email }));
              handleSendCode('REGISTER');
            }}
            email={formState.email}
            countdown={countdown}
          />
        </div>
      )}

      {/* 重置密码内容 */}
      {activeTab === 'reset' && (
        <div className="mt-4">
          <ResetPasswordContent 
            onReset={onLogin}
            onSendCode={(email: string) => {
              setFormState(prev => ({ ...prev, email }));
              handleSendCode('RESET');
            }}
            email={formState.email}
            countdown={countdown}
          />
        </div>
      )}
    </div>
  );
}