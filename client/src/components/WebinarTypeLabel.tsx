/**
 * WebinarTypeLabel Component
 * 
 * Displays a badge for webinar type with icon and color.
 */

interface WebinarTypeLabelProps {
  type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
  className?: string;
}

const typeConfig = {
  one_on_one: { label: '1对1', icon: '💬', color: 'bg-blue-600' },
  small_group: { label: '小组', icon: '👥', color: 'bg-violet-600' },
  medium: { label: '中型', icon: '🎯', color: 'bg-purple-600' },
  large: { label: '大型', icon: '🎪', color: 'bg-pink-600' },
  extra_large: { label: '超大型', icon: '🏟️', color: 'bg-red-600' },
};

export function WebinarTypeLabel({ type, className = '' }: WebinarTypeLabelProps) {
  const config = typeConfig[type];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color} text-white ${className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
