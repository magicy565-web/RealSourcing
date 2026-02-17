import { Link, useLocation } from "wouter";
import { GlassCard } from '../components/GlassCard';
import { Factory, Github, Loader2, User, Mail, Lock, Building2 } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "factory" | "user">("buyer");
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignup = () => {
    toast.info("GitHub注册功能即将推出");
  };

  const handleGoogleSignup = () => {
    toast.info("Google注册功能即将推出");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.cnsubscribe.xyz/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (response.ok) {
        toast.success("注册成功！请使用您的账号登录。");
        setLocation("/login");
      } else {
        const error = await response.json();
        toast.error(error.message || "注册失败，请稍后重试");
      }
    } catch (error) {
      toast.error("注册失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white flex items-center justify-center px-4">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center space-x-2 mb-4 hover:scale-102 transition-transform">
              <Factory className="text-purple-400" size={40} />
              <span className="text-3xl font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>RealSourcing</span>
            </a>
          </Link>
          <h1 className="text-2xl font-normal mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Join RealSourcing to start sourcing</p>
        </div>

        {/* Sign Up Card */}
        <GlassCard hover={false} className="p-8">
          <div className="space-y-4">
            {/* GitHub OAuth Button */}
            <button
              onClick={handleGitHubSignup}
              className="
                w-full flex items-center justify-center space-x-3
                px-6 py-4 rounded-xl
                bg-[#24292e] hover:bg-[#1a1e22]
                border border-white/10
                transition-all duration-300
                hover:scale-102 hover:shadow-[0_0_30px_rgba(36,41,46,0.5)] hover:-translate-y-0.5
                group
              "
            >
              <Github size={22} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-sm">Continue with GitHub</span>
            </button>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignup}
              className="
                w-full flex items-center justify-center space-x-3
                px-6 py-4 rounded-xl
                bg-white hover:bg-gray-100
                border border-gray-200
                text-gray-800
                transition-all duration-300
                hover:scale-102 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5
                group
              "
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
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
              <span className="font-medium text-sm">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#1a1a2e]/50 text-gray-400">OR</span>
              </div>
            </div>

            {/* Email Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="
                      w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-white/5 border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition-all
                      placeholder-gray-500
                    "
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-white/5 border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition-all
                      placeholder-gray-500
                    "
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-white/5 border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition-all
                      placeholder-gray-500
                    "
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-medium text-gray-300 mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "buyer" | "factory" | "user")}
                    className="
                      w-full pl-10 pr-4 py-3 rounded-xl text-sm
                      bg-white/5 border border-white/10
                      focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      outline-none transition-all
                      text-white
                      appearance-none
                      cursor-pointer
                    "
                  >
                    <option value="buyer" className="bg-[#1a1a2e] text-white">Buyer</option>
                    <option value="factory" className="bg-[#1a1a2e] text-white">Factory</option>
                    <option value="user" className="bg-[#1a1a2e] text-white">User</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full py-3 rounded-xl text-sm font-medium
                  bg-gradient-to-r from-purple-500 to-cyan-500
                  transition-all duration-300
                  hover:scale-102 hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-xs text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Sign in
                </a>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
