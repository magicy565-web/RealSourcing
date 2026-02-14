import { useState, useEffect, useRef } from 'react';

interface MouseFollowOptions {
  intensity?: number;
  smoothing?: number;
}

interface Rotation {
  x: number;
  y: number;
}

export function useMouseFollow(options: MouseFollowOptions = {}) {
  const { intensity = 10, smoothing = 0.1 } = options;
  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState<Rotation>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // 平滑过渡动画
  useEffect(() => {
    const animate = () => {
      setRotation((prev) => ({
        x: prev.x + (targetRotation.x - prev.x) * smoothing,
        y: prev.y + (targetRotation.y - prev.y) * smoothing,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetRotation, smoothing]);

  // 鼠标移动监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateY = ((e.clientX - centerX) / rect.width) * intensity;
      const rotateX = -((e.clientY - centerY) / rect.height) * intensity;

      setTargetRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
      setTargetRotation({ x: 0, y: 0 });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return { rotation, containerRef };
}
