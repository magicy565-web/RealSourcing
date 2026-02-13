/**
 * 订阅管理页面
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";
import { DashboardLayout } from "../components/DashboardLayout";

export function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // 获取所有订阅计划
  const { data: plans = [], isLoading: plansLoading } = trpc.subscriptionEnhanced.getPlans.useQuery();
  
  // 获取当前订阅
  const { data: currentSubscription, refetch: refetchSubscription } = trpc.subscriptionEnhanced.getCurrent.useQuery();
  
  // 升级订阅
  const upgradeMutation = trpc.subscriptionEnhanced.upgrade.useMutation({
    onSuccess: () => {
      refetchSubscription();
      setSelectedPlan(null);
      alert("订阅升级成功！");
    },
    onError: (error) => {
      alert(`升级失败：${error.message}`);
    },
  });

  const handleUpgrade = (planId: string) => {
    if (confirm(`确认升级到 ${planId} 套餐吗？`)) {
      upgradeMutation.mutate({ planId, billingCycle });
    }
  };

  if (plansLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">订阅管理</h1>
          <p className="mt-2 text-gray-600">选择适合您的订阅计划</p>
        </div>

        {/* 当前订阅状态 */}
        {currentSubscription && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">当前订阅</h2>
                <p className="text-blue-700 mt-1">
                  {currentSubscription.planId} - {currentSubscription.status === "trial" ? "试用中" : "已激活"}
                </p>
                {currentSubscription.currentPeriodEnd && (
                  <p className="text-sm text-blue-600 mt-1">
                    到期时间：{new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  ¥{parseFloat(currentSubscription.amount || "0").toFixed(2)}
                </p>
                <p className="text-sm text-blue-600">
                  {currentSubscription.billingCycle === "monthly" ? "每月" : "每年"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 计费周期切换 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              按月付费
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              按年付费
              <span className="ml-2 text-xs text-green-600 font-semibold">省20%</span>
            </button>
          </div>
        </div>

        {/* 订阅计划卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isCurrent = currentSubscription?.planId === plan.id;
            const limits = plan.limits as any;

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-6 bg-white shadow-sm hover:shadow-md transition-shadow ${
                  isCurrent
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              >
                {/* 推荐标签 */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      推荐
                    </span>
                  </div>
                )}

                {/* 当前订阅标签 */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      当前套餐
                    </span>
                  </div>
                )}

                {/* 计划名称 */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  )}
                </div>

                {/* 价格 */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ¥{parseFloat(price).toFixed(0)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === "monthly" ? "月" : "年"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-sm text-green-600 mt-1">
                      相当于 ¥{(parseFloat(price) / 12).toFixed(0)}/月
                    </p>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {limits?.webinarCreatedMonthly === -1 ? "无限" : limits?.webinarCreatedMonthly || 0} 场会议/月
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {limits?.productsMax === -1 ? "无限" : limits?.productsMax || 0} 个产品
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {limits?.storageGB === -1 ? "无限" : limits?.storageGB || 0} GB 存储
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {limits?.videoRecordingHours === -1 ? "无限" : limits?.videoRecordingHours || 0} 小时录制
                    </span>
                  </li>
                  {limits?.priorityListing && (
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">优先展示</span>
                    </li>
                  )}
                  {limits?.verifiedBadge && (
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">认证徽章</span>
                    </li>
                  )}
                </ul>

                {/* 操作按钮 */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgradeMutation.isLoading}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : plan.isPopular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCurrent ? "当前套餐" : upgradeMutation.isLoading ? "处理中..." : "立即升级"}
                </button>
              </div>
            );
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>所有套餐均支持随时取消，未使用部分可按比例退款</p>
          <p className="mt-1">如需企业定制方案，请联系客服</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
