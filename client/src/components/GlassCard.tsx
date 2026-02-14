import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div
      className={`
        relative
        bg-white/5 backdrop-blur-xl
        border border-white/10
        rounded-2xl p-8
        shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)]
        transition-all duration-300 ease-out
        ${hover ? 'hover:bg-white/8 hover:scale-102 hover:shadow-[0_30px_80px_rgba(0,0,0,0.4),0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 顶部高光 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {children}
    </div>
  );
}
