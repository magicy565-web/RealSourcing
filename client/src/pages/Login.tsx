import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    toast.info("Google登录功能即将推出");
  };

  const handleLinkedInLogin = () => {
    toast.info("LinkedIn登录功能即将推出");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      toast.success("登录成功！");
      if (user?.role === 'admin') {
        setLocation("/admin");
      } else {
        setLocation("/home");
      }
    } catch (error: any) {
      toast.error(error.message || "登录失败，请检查邮箱和密码");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0a0a0f] flex">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Left Side - Brand Area */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 text-white">
        {/* Logo */}
        <Link href="/">
          <a className="inline-flex items-center space-x-3 mb-12 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-xl shadow-purple-500/60 border border-purple-400/20">
              <span className="text-2xl font-bold tracking-tight">R</span>
            </div>
            <span className="text-2xl font-semibold">RealSourcing</span>
          </a>
        </Link>

        {/* Main Heading */}
        <h1 className="text-5xl font-bold leading-tight mb-8">
          连接真实工厂<br />
          开启高效采购新时代
        </h1>

        {/* Value Points */}
        <div className="space-y-6 mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg text-gray-200">AI 智能匹配，精准推荐优质工厂</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg text-gray-200">1:1 私密视频选品会议</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg text-gray-200">真实工厂直连，杜绝中间商</p>
            </div>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <p className="text-gray-300 italic mb-4">
            "RealSourcing 让我的采购效率提升了 3 倍"
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-semibold">AW</span>
            </div>
            <div>
              <p className="font-semibold text-white">Alice Wang</p>
              <p className="text-sm text-gray-400">TikTok 采购总监</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">欢迎回来</h2>
              <p className="text-gray-400">登录您的 RealSourcing 账号</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full pl-12 pr-4 py-3.5 rounded-xl text-white
                      bg-[#0a0a0a] border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]
                      outline-none transition-all
                      placeholder-gray-500
                    "
                    placeholder="邮箱地址"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full pl-12 pr-12 py-3.5 rounded-xl text-white
                      bg-[#0a0a0a] border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]
                      outline-none transition-all
                      placeholder-gray-500
                    "
                    placeholder="密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-sm text-gray-400">记住我</span>
                </label>
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  忘记密码？
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-4 rounded-xl text-base font-semibold text-white
                  bg-gradient-to-r from-purple-600 to-purple-500
                  hover:from-purple-500 hover:to-purple-400
                  shadow-lg shadow-purple-500/50
                  transition-all duration-300
                  hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1a1a] text-gray-400">或</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="
                  w-full flex items-center justify-center space-x-3
                  px-6 py-3.5 rounded-xl
                  bg-[#0a0a0a] border border-white/20
                  hover:bg-[#1a1a1a] hover:border-white/30
                  transition-all duration-300
                  group
                "
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-white">使用 Google 登录</span>
              </button>

              <button
                onClick={handleLinkedInLogin}
                className="
                  w-full flex items-center justify-center space-x-3
                  px-6 py-3.5 rounded-xl
                  bg-[#0a0a0a] border border-white/20
                  hover:bg-[#1a1a1a] hover:border-white/30
                  transition-all duration-300
                  group
                "
              >
                <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-medium text-white">使用 LinkedIn 登录</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <span className="text-gray-400">还没有账号？</span>{" "}
              <Link href="/register">
                <a className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                  立即注册 →
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
