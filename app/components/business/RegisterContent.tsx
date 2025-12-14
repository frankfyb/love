'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';
// 类型定义
type RegisterContentProps = {
  onRegistered: () => void;
  // 从父组件接收的props
  onSendCode?: (email: string) => void;
  email?: string;
  countdown?: number;
};

export default function RegisterContent({ 
  onRegistered, 
  onSendCode: parentSendCode,
  email: parentEmail = '',
  countdown: parentCountdown = 0
}: RegisterContentProps) {
  // 表单状态管理
  const [formState, setFormState] = useState({
    email: parentEmail,
    nickname: '',
    password: '',
    confirmPassword: '',
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
  
  // 合并倒计时（父组件传递的优先级更高）
  const actualCountdown = parentCountdown || countdown;

  // 实时表单验证
  useEffect(() => {
    // 邮箱验证
    validateField('email', formState.email);
    
    // 昵称验证
    validateField('nickname', formState.nickname);
    
    // 密码验证
    validateField('password', formState.password);
    
    // 确认密码验证
    if (formState.confirmPassword) {
      const error = formState.password !== formState.confirmPassword 
        ? '两次密码输入不一致' 
        : '';
      // 这里我们手动设置确认密码的错误，因为validateField不会处理这个字段
    }
    
    // 验证码验证
    validateField('code', formState.code);
  }, [formState, validateField]);

  // 表单字段变更处理
  const handleFormChange = (field: keyof typeof formState, value: string) => {
    // 验证码仅允许数字输入
    if (field === 'code') {
      value = value.replace(/[^0-9]/g, '');
    }
    
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // 清空全局错误提示
    clearGlobalError();
  };

  // 发送验证码
  const handleSendCode = async () => {
    // 如果父组件传递了发送方法，优先使用
    if (parentSendCode) {
      parentSendCode(formState.email);
      return;
    }

    // 使用共享Hook发送验证码
    await sendVerificationCode(formState.email, 'REGISTER');
  };

  // 表单提交
  const handleSubmit = async () => {
    // 1. 必填校验
    if (!formState.email || !formState.nickname || !formState.password || 
        !formState.confirmPassword || !formState.code) {
      setGlobalError('请填写完整的注册信息');
      return;
    }
    
    // 2. 格式校验（已经在useEffect中进行了实时验证）
    if (!validationStatus.emailValid) {
      setGlobalError('请输入有效的邮箱地址');
      return;
    }
    
    if (!validationStatus.nicknameValid) {
      setGlobalError('请输入有效的昵称');
      return;
    }
    
    if (!validationStatus.passwordValid) {
      setGlobalError('请输入符合要求的密码');
      return;
    }
    
    if (formState.password !== formState.confirmPassword) {
      setGlobalError('两次密码输入不一致');
      return;
    }
    
    if (formState.code.length !== 6) {
      setGlobalError('请输入6位数字验证码');
      return;
    }

    // 3. 提交请求
    setLoading(true);
    clearGlobalError();
    
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formState.email, 
          nickname: formState.nickname, 
          password: formState.password, 
          confirmPassword: formState.confirmPassword, 
          code: formState.code 
        }),
      });

      if (!res.ok) throw new Error(`注册请求失败：${res.status}`);
      
      const data = await res.json();
      
      if (data.code === 200 || data.success) {
        // 注册成功回调
        setGlobalError('注册成功，即将跳转到登录页');
        setTimeout(() => {
          onRegistered();
        }, 1500);
      } else {
        setGlobalError(data.msg || '注册失败，请稍后重试');
      }
    } catch (err) {
      console.error('注册错误：', err);
      setGlobalError('网络异常，注册失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取输入框样式
  const getInputClass = (field: keyof typeof fieldErrors) => {
    const hasError = !!fieldErrors[field];
    return `w-full pl-10 pr-4 py-2.5 bg-pink-50/50 border ${
      hasError ? 'border-rose-300' : 'border-pink-100'
    } rounded-xl focus:outline-none focus:ring-2 ${
      hasError ? 'focus:ring-rose-200' : 'focus:ring-rose-200'
    } text-slate-600 placeholder-pink-300 transition-all`;
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* 全局提示 */}
      {(fieldErrors.global) && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          fieldErrors.global?.includes('成功') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-rose-50 border border-rose-200 text-rose-600'
        }`}>
          {fieldErrors.global?.includes('成功') ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{fieldErrors.global}</span>
        </div>
      )}

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
            className={getInputClass('email')}
            aria-label="邮箱地址"
            disabled={loading || sendingCode}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* 昵称输入框 */}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="text"
            placeholder="请输入昵称（2-16个字符）"
            value={formState.nickname}
            onChange={(e) => handleFormChange('nickname', e.target.value)}
            className={getInputClass('nickname')}
            aria-label="昵称"
            disabled={loading}
          />
          {fieldErrors.nickname && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.nickname}
            </p>
          )}
        </div>

        {/* 密码输入框 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="password"
            placeholder="请设置密码（至少8位，含字母和数字）"
            value={formState.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            className={getInputClass('password')}
            aria-label="密码"
            disabled={loading}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.password}
            </p>
          ) : validationStatus.passwordStrength && (
            <div className="mt-1 flex items-center gap-2">
              <div className="text-xs text-slate-500">密码强度：</div>
              <div className={`w-full h-1 rounded-full flex gap-1`}>
                <div 
                  className={`h-full rounded-full ${
                    validationStatus.passwordStrength === 'weak' ? 'bg-red-400' : 
                    validationStatus.passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} 
                  style={{ 
                    width: validationStatus.passwordStrength === 'weak' ? '33%' : 
                           validationStatus.passwordStrength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
              <div className="text-xs">
                {validationStatus.passwordStrength === 'weak' && '弱'}
                {validationStatus.passwordStrength === 'medium' && '中'}
                {validationStatus.passwordStrength === 'strong' && '强'}
              </div>
            </div>
          )}
        </div>

        {/* 确认密码输入框 */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
          <input
            type="password"
            placeholder="请确认密码"
            value={formState.confirmPassword}
            onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
            className={getInputClass('confirmPassword')}
            aria-label="确认密码"
            disabled={loading}
          />
          {formState.confirmPassword && formState.password !== formState.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              两次密码输入不一致
            </p>
          )}
        </div>

        {/* 验证码输入框 */}
        <div className="relative flex gap-2">
          <div className="flex-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
            <input
              type="text"
              placeholder="请输入6位验证码"
              value={formState.code}
              onChange={(e) => handleFormChange('code', e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
              className={getInputClass('code')}
              aria-label="验证码"
              disabled={loading || actualCountdown > 0}
            />
            {fieldErrors.code && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.code}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            className="whitespace-nowrap min-w-[120px]"
            onClick={handleSendCode}
            disabled={sendingCode || actualCountdown > 0 || loading || !formState.email || !validationStatus.emailValid}
            aria-disabled={sendingCode || actualCountdown > 0 || loading}
          >
            {actualCountdown > 0 
              ? `${actualCountdown}s后重新获取` 
              : sendingCode 
                ? '发送中...' 
                : '获取验证码'}
          </Button>
        </div>
      </div>

      {/* 注册按钮 */}
      <Button
        variant="primary"
        className="w-full mt-2 py-2.5"
        onClick={handleSubmit}
        disabled={loading}
        aria-label="完成注册"
      >
        {loading ? '提交中...' : '注册'}
      </Button>

      {/* 注册提示 */}
      <p className="text-xs text-slate-400 text-center mt-2">
        点击注册即表示同意《用户协议》和《隐私政策》
      </p>
    </div>
  );
}