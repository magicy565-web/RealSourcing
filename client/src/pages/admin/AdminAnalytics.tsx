import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { 
  Users, 
  Calendar,
  Package,
  DollarSign,
  Activity,
  Radio,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // 查询综合数据面板
  const { data: dashboard, isLoading } = trpc.admin.analytics.getDashboard.useQuery({ dateRange });
  
  // 查询用户分析
  const { data: userAnalytics } = trpc.admin.analytics.getUserAnalytics.useQuery();
  
  // 查询会议分析
  const { data: webinarAnalytics } = trpc.admin.analytics.getWebinarAnalytics.useQuery();
  
  // 查询产品分析
  const { data: productAnalytics } = trpc.admin.analytics.getProductAnalytics.useQuery();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive data analysis and insights</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-violet-600 text-white'
                  : 'bg-[#1A1A2E] text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' :
               range === '30d' ? 'Last 30 Days' :
               range === '90d' ? 'Last 90 Days' :
               'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading analytics...</div>
      ) : (
        <>
          {/* Core Metrics */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            <MetricCard
              title="Total Users"
              value={dashboard?.metrics.totalUsers.toLocaleString() || '0'}
              trend="+12.5%"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title="Total Webinars"
              value={dashboard?.metrics.totalWebinars.toLocaleString() || '0'}
              trend="+8.3%"
              icon={<Calendar className="h-5 w-5" />}
              color="blue"
            />
            <MetricCard
              title="Total Products"
              value={dashboard?.metrics.totalProducts.toLocaleString() || '0'}
              trend="+15.7%"
              icon={<Package className="h-5 w-5" />}
              color="purple"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${dashboard?.metrics.totalRevenue.toLocaleString() || '0'}`}
              trend="+23.4%"
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
            />
            <MetricCard
              title="Active Users"
              value={dashboard?.metrics.activeUsers.toLocaleString() || '0'}
              icon={<Activity className="h-5 w-5" />}
              color="orange"
            />
            <MetricCard
              title="Live Webinars"
              value={dashboard?.metrics.liveWebinars.toLocaleString() || '0'}
              icon={<Radio className="h-5 w-5" />}
              color="red"
            />
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                User Growth
              </h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {dashboard?.trends.userGrowth.slice(-30).map((item, index) => {
                  const maxCount = Math.max(...dashboard.trends.userGrowth.map(d => d.count));
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t hover:opacity-80 transition-opacity relative group"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.date}: ${item.count} users`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {item.date}: {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4">Daily new user registrations</p>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Revenue Trend
              </h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {dashboard?.trends.revenueTrend.slice(-30).map((item, index) => {
                  const maxRevenue = Math.max(...dashboard.trends.revenueTrend.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t hover:opacity-80 transition-opacity relative group"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.date}: $${item.revenue}`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {item.date}: ${item.revenue.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4">Daily revenue from completed orders</p>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E] mb-8">
            <h3 className="text-lg font-semibold mb-6">Conversion Funnel</h3>
            <div className="space-y-3">
              {[
                { label: 'Registered', value: dashboard?.funnel.registered || 0, color: 'bg-blue-500' },
                { label: 'Attended Webinar', value: dashboard?.funnel.attended || 0, color: 'bg-purple-500' },
                { label: 'Favorited Products', value: dashboard?.funnel.favorited || 0, color: 'bg-violet-500' },
                { label: 'Sent Inquiry', value: dashboard?.funnel.inquired || 0, color: 'bg-orange-500' },
                { label: 'Placed Order', value: dashboard?.funnel.ordered || 0, color: 'bg-green-500' },
              ].map((step, index) => {
                const maxValue = dashboard?.funnel.registered || 1;
                const percentage = (step.value / maxValue) * 100;
                const conversionRate = index > 0 
                  ? ((step.value / ([
                      dashboard?.funnel.registered,
                      dashboard?.funnel.attended,
                      dashboard?.funnel.favorited,
                      dashboard?.funnel.inquired,
                    ][index - 1] || 1)) * 100).toFixed(1)
                  : '100.0';
                
                return (
                  <div key={step.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{step.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">{conversionRate}%</span>
                        <span className="text-sm font-semibold">{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#0F0F1E] rounded-full h-8 overflow-hidden">
                      <div
                        className={`${step.color} h-full rounded-full flex items-center justify-end px-4 transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-xs font-medium text-white">{percentage.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-3 gap-6">
            {/* User Analytics */}
            <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
              <h3 className="text-lg font-semibold mb-4">User Analytics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">By Role</p>
                  <div className="space-y-2">
                    {userAnalytics?.byRole.map((item) => (
                      <div key={item.role} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.role}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">By Status</p>
                  <div className="space-y-2">
                    {userAnalytics?.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.status}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Webinar Analytics */}
            <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
              <h3 className="text-lg font-semibold mb-4">Webinar Analytics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">By Status</p>
                  <div className="space-y-2">
                    {webinarAnalytics?.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.status}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Averages</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Registrations</span>
                      <span className="text-sm font-semibold">{webinarAnalytics?.avgRegistrations.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Attendance</span>
                      <span className="text-sm font-semibold">{webinarAnalytics?.avgAttendance.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rating</span>
                      <span className="text-sm font-semibold">{webinarAnalytics?.avgRating.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Analytics */}
            <div className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E]">
              <h3 className="text-lg font-semibold mb-4">Product Analytics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">By Status</p>
                  <div className="space-y-2">
                    {productAnalytics?.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.status}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Engagement</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Views</span>
                      <span className="text-sm font-semibold">{productAnalytics?.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Favorites</span>
                      <span className="text-sm font-semibold">{productAnalytics?.totalFavorites.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Inquiries</span>
                      <span className="text-sm font-semibold">{productAnalytics?.totalInquiries.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
