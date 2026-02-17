import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'green' | 'blue' | 'red' | 'orange' | 'purple';
}

const colorClasses = {
  default: 'bg-[#1A1A2E] border-[#2A2A3E]',
  green: 'bg-green-500/10 border-green-500/30',
  blue: 'bg-blue-500/10 border-blue-500/30',
  red: 'bg-red-500/10 border-red-500/30',
  orange: 'bg-orange-500/10 border-orange-500/30',
  purple: 'bg-purple-500/10 border-purple-500/30',
};

const iconColorClasses = {
  default: 'text-gray-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  orange: 'text-orange-400',
  purple: 'text-purple-400',
};

export function MetricCard({ title, value, trend, icon, color = 'default' }: MetricCardProps) {
  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{title}</p>
        {icon && <div className={iconColorClasses[color]}>{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className={`text-xs ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
