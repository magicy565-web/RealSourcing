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
  const { rotation, containerRef } = useMouseFollow({ intensity: 8, smoothing: 0.15 });

  return (
    <div ref={containerRef} className={`relative w-full max-w-6xl mx-auto py-20 ${className}`}>
      {/* 主产品截图 */}
      <div
        className="
          relative rounded-2xl overflow-hidden
          shadow-[0_20px_60px_rgba(0,0,0,0.4),0_40px_100px_rgba(6,182,212,0.2)]
          transition-all duration-300 ease-out
          hover:shadow-[0_30px_80px_rgba(0,0,0,0.5),0_50px_120px_rgba(6,182,212,0.3)]
          transform-gpu
        "
        style={{
          transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-auto"
          style={{
            filter: 'saturate(1.1) contrast(1.05) brightness(1.05)',
          }}
        />

        {/* 顶部高光 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* 底部反光 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* 边缘光晕 */}
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(6,182,212,0.1)] pointer-events-none" />
      </div>

      {/* 浮动统计卡片 */}
      {floatingCards?.map((card, index) => (
        <div
          key={index}
          className="
            absolute
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-xl p-4 min-w-[160px]
            shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(6,182,212,0.2)]
            transition-all duration-300
            hover:scale-110 hover:bg-white/10
            animate-float
          "
          style={{
            ...card.position,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${4 + index * 0.5}s`,
          }}
        >
          {card.icon && (
            <div className="text-cyan-400 mb-2 text-2xl">{card.icon}</div>
          )}
          <div className="text-sm text-gray-400">{card.title}</div>
          <div className="text-2xl font-bold text-white mt-1">{card.value}</div>
          
          {/* 卡片高光 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
