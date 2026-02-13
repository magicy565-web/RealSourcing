/**
 * WebinarScenarioLabel Component
 * 
 * Displays a badge for webinar scenario with icon and color.
 */

interface WebinarScenarioLabelProps {
  scenario: 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';
  className?: string;
}

const scenarioConfig = {
  general: { label: '常规', icon: '📋', color: 'bg-gray-600' },
  tiktok_dropshipper: { label: 'TikTok', icon: '🎵', color: 'bg-red-600' },
  influencer_selection: { label: '网红选品', icon: '⭐', color: 'bg-orange-600' },
  negotiation: { label: '商务谈判', icon: '💼', color: 'bg-blue-600' },
  small_batch: { label: '小批量', icon: '📦', color: 'bg-green-600' },
  product_launch: { label: '新品发布', icon: '🚀', color: 'bg-purple-600' },
  factory_tour: { label: '工厂开放日', icon: '🏭', color: 'bg-indigo-600' },
  industry_summit: { label: '行业峰会', icon: '🎯', color: 'bg-pink-600' },
};

export function WebinarScenarioLabel({ scenario, className = '' }: WebinarScenarioLabelProps) {
  const config = scenarioConfig[scenario];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color} text-white ${className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
