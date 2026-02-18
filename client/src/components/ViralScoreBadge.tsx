/**
 * ViralScoreBadge 组件
 * 
 * 显示产品爆款评分的徽章
 * 根据评分等级显示不同的颜色和图标
 */

import { cn } from "../lib/utils";

interface ViralScoreBadgeProps {
  score: number;
  level: 'extreme' | 'high' | 'medium' | 'low';
  className?: string;
  showLabel?: boolean;
}

const levelConfig = {
  extreme: {
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    textColor: 'text-white',
    icon: '🔥',
    label: '极高潜力',
  },
  high: {
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    textColor: 'text-white',
    icon: '🚀',
    label: '高潜力',
  },
  medium: {
    color: 'bg-gradient-to-r from-orange-400 to-yellow-400',
    textColor: 'text-white',
    icon: '💡',
    label: '中等潜力',
  },
  low: {
    color: 'bg-gradient-to-r from-gray-400 to-gray-500',
    textColor: 'text-white',
    icon: '🤔',
    label: '低潜力',
  },
};

export function ViralScoreBadge({ 
  score, 
  level, 
  className,
  showLabel = false 
}: ViralScoreBadgeProps) {
  const config = levelConfig[level] || levelConfig.low;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
        config.color,
        config.textColor,
        className
      )}
      title={`爆款评分: ${score}/100 (${config.label})`}
    >
      <span className="text-base">{config.icon}</span>
      <span>{score}</span>
      {showLabel && (
        <span className="text-xs opacity-90">/ 100</span>
      )}
    </div>
  );
}

/**
 * ViralScoreBadgeCompact 组件
 * 紧凑版本，适合在列表中使用
 */
export function ViralScoreBadgeCompact({ 
  score, 
  level, 
  className 
}: ViralScoreBadgeProps) {
  const config = levelConfig[level] || levelConfig.low;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        config.color,
        config.textColor,
        className
      )}
      title={`爆款评分: ${score}/100 (${config.label})`}
    >
      <span>{config.icon}</span>
      <span>{score}</span>
    </div>
  );
}
