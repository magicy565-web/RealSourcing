import { Link, useLocation } from "wouter";
import { GlassCard } from '../components/GlassCard';
import { Factory, Github, Mail, Loader2 } from 'lucide-react';
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Successfully signed in");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
    }
  });

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    loginMutation.mutate({ email, password });
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
          <Link href="/landing">
            <a className="inline-flex items-center space-x-2 mb-4 hover:scale-102 transition-transform">
              <Factory className="text-purple-400" size={40} />
              <span className="text-3xl font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>RealSourcing</span>
            </a>
          </Link>
          <h1 className="text-2xl font-normal mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
        </div>

        {/* Sign In Card */}
        <GlassCard hover={false} className="p-8">
          <div className="space-y-4">
            {/* GitHub OAuth Button */}
            <button
              onClick={handleGitHubLogin}
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
              onClick={handleGoogleLogin}
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

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-white/5 border border-white/10
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    outline-none transition-all
                    placeholder-gray-500
                  "
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-xl text-sm
                    bg-white/5 border border-white/10
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                    outline-none transition-all
                    placeholder-gray-500
                  "
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </a>
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
