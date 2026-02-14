/**
 * 配额仪表板页面
 */

import { trpc } from "../lib/trpc";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "wouter";

export function QuotaDashboard() {
  const { data: dashboard, isLoading } = trpc.subscriptionEnhanced.getDashboard.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard || !dashboard.subscription) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">您还没有订阅</h2>
            <p className="text-gray-600 mb-6">请先选择一个订阅计划</p>
            <Link
              to="/subscription"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看订阅计划
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { subscription, plan, quotas } = dashboard;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">配额使用情况</h1>
          <p className="mt-2 text-gray-600">查看您的资源使用情况和配额限制</p>
        </div>

        {/* 订阅信息卡片 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{plan?.name || subscription.planId}</h2>
              <p className="mt-1 opacity-90">
                {subscription.status === "trial" ? "试用中" : "已激活"}
              </p>
              {subscription.currentPeriodEnd && (
                <p className="mt-2 text-sm opacity-80">
                  到期时间：{new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <Link
                to="/subscription"
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                管理订阅
              </Link>
            </div>
          </div>
        </div>

        {/* 配额使用情况卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotas.map((quota: any) => {
            const percentage = quota.unlimited ? 0 : Math.min(quota.percentage, 100);
            const isWarning = percentage >= 80 && percentage < 100;
            const isDanger = percentage >= 100;

            return (
              <div key={quota.key} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {/* 配额名称 */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quota.name}</h3>
                  {isDanger && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      已达上限
                    </span>
                  )}
                  {isWarning && !isDanger && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      即将达到
                    </span>
                  )}
                </div>

                {/* 使用量 */}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-3xl font-bold text-gray-900">{quota.current}</span>
                    <span className="text-sm text-gray-500">
                      {quota.unlimited ? "无限制" : `/ ${quota.limit} ${quota.unit}`}
                    </span>
                  </div>
                  {!quota.unlimited && (
                    <p className="text-sm text-gray-600">
                      已使用 {percentage.toFixed(1)}%
                    </p>
                  )}
                </div>

                {/* 进度条 */}
                {!quota.unlimited && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isDanger
                          ? "bg-red-600"
                          : isWarning
                          ? "bg-yellow-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}

                {/* 无限制标签 */}
                {quota.unlimited && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">无限制</span>
                  </div>
                )}

                {/* 升级提示 */}
                {isDanger && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/subscription"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      升级套餐以获取更多配额 →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 使用建议 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 使用建议</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>配额每月1号自动重置（存储空间除外）</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>升级套餐后，新配额立即生效</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>降级套餐在当前周期结束后生效</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>如需临时增加配额，请联系客服</span>
            </li>
          </ul>
        </div>

        {/* 历史使用趋势（占位） */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 使用趋势</h3>
          <div className="text-center py-12 text-gray-500">
            <p>使用趋势图表功能即将上线</p>
            <p className="text-sm mt-2">敬请期待</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
