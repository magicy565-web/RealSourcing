import { ReactNode } from 'react';
import { useMouseFollow } from '../hooks/useMouseFollow';

interface FloatingCard {
  title: string;
  value: string | number;
  icon?: ReactNode;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

interface Product3DShowcaseProps {
  imageSrc: string;
  alt: string;
  floatingCards?: FloatingCard[];
  className?: string;
}

export function Product3DShowcase({
  imageSrc,
  alt,
  floatingCards,
  className = '',
}: Product3DShowcaseProps) {
  const { rotation, containerRef } = useMouseFollow({ intensity: 5, smoothing: 0.08 });

  return (
    <div ref={containerRef} className={`relative w-full max-w-5xl mx-auto py-24 ${className}`}>
      {/* 主产品截图 */}
      <div
        className="
          relative rounded-2xl overflow-hidden
          shadow-[0_40px_80px_rgba(0,0,0,0.25),0_60px_120px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]
          transition-all duration-500 ease-out
          hover:shadow-[0_50px_100px_rgba(0,0,0,0.3),0_70px_140px_rgba(139,92,246,0.2)]
          transform-gpu
        "
        style={{
          transform: `perspective(1500px) rotateX(${rotation.x * 0.6}deg) rotateY(${rotation.y * 0.4}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-auto"
          style={{
            filter: 'saturate(1.15) contrast(1.08) brightness(1.05)',
          }}
        />

        {/* 顶部高光 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* 底部反光 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

        {/* 边缘光晕 */}
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(139,92,246,0.1)] pointer-events-none" />
        
        {/* 镜面反射效果 */}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.05))',
            transform: 'scaleY(-1)',
            opacity: 0.2,
          }}
        />
      </div>

      {/* 浮动统计卡片 */}
      {floatingCards?.map((card, index) => (
        <div
          key={index}
          className="
            absolute
            bg-[#1a1a2e]/80 backdrop-blur-xl
            border border-white/10
            rounded-lg px-4 py-3
            shadow-[0_10px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(139,92,246,0.2)]
            transition-all duration-300
            hover:scale-105 hover:bg-[#1a1a2e]/90
            animate-float
          "
          style={{
            ...card.position,
            animationDelay: `${index * 1}s`,
            animationDuration: `${5 + index * 0.5}s`,
            minWidth: '120px',
          }}
        >
          <div className="flex items-center space-x-2">
            {card.icon && (
              <div className="text-purple-400">{card.icon}</div>
            )}
            <div>
              <div className="text-xs text-gray-400">{card.title}</div>
              <div className="text-xl font-semibold text-white">{card.value}</div>
            </div>
          </div>
          
          {/* 卡片高光 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
