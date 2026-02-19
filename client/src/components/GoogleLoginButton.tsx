/**
 * Google 登录按钮组件
 * 提供美观的 Google OAuth 登录入口
 */

import React from 'react';

interface GoogleLoginButtonProps {
  /**
   * 登录成功后的返回 URL
   */
  returnUrl?: string;
  /**
   * 按钮文本
   */
  text?: string;
  /**
   * 按钮样式类名
   */
  className?: string;
  /**
   * 是否为完整宽度
   */
  fullWidth?: boolean;
}

export function GoogleLoginButton({
  returnUrl = '/',
  text = '使用 Google 登录',
  className = '',
  fullWidth = false,
}: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const authUrl = `${baseUrl.replace('/api/trpc', '')}/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
    
    console.log('[GoogleLogin] Redirecting to:', authUrl);
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className={`
        flex items-center justify-center gap-3 px-6 py-3
        bg-white border border-gray-300 rounded-lg
        hover:bg-gray-50 hover:border-gray-400
        transition-all duration-200
        shadow-sm hover:shadow-md
        font-medium text-gray-700
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      type="button"
    >
      {/* Google Logo SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      <span>{text}</span>
    </button>
  );
}

/**
 * Google 登录卡片组件（带分隔线的完整登录表单）
 */
interface GoogleLoginCardProps {
  /**
   * 是否显示传统登录表单
   */
  showTraditionalLogin?: boolean;
  /**
   * 传统登录表单组件
   */
  traditionalLoginForm?: React.ReactNode;
}

export function GoogleLoginCard({
  showTraditionalLogin = true,
  traditionalLoginForm,
}: GoogleLoginCardProps) {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回来</h2>
        <p className="text-gray-600">登录到 RealSourcing</p>
      </div>

      {/* Google 登录按钮 */}
      <GoogleLoginButton fullWidth text="使用 Google 账号登录" />

      {showTraditionalLogin && (
        <>
          {/* 分隔线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或使用邮箱登录</span>
            </div>
          </div>

          {/* 传统登录表单 */}
          {traditionalLoginForm}
        </>
      )}

      {/* 隐私提示 */}
      <p className="mt-6 text-xs text-center text-gray-500">
        登录即表示您同意我们的
        <a href="/terms" className="text-blue-600 hover:underline ml-1">
          服务条款
        </a>
        和
        <a href="/privacy" className="text-blue-600 hover:underline ml-1">
          隐私政策
        </a>
      </p>
    </div>
  );
}
