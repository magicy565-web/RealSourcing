import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../_core/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SubscriptionPlans() {
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: async () => {
      const result = await trpc.subscription.plans.query();
      return result;
    },
  });

  // Fetch current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: async () => {
      const result = await trpc.subscription.current.query();
      return result;
    },
  });

  // Create free trial mutation
  const createTrialMutation = useMutation({
    mutationFn: async () => {
      return await trpc.subscription.createFreeTrial.mutate();
    },
    onSuccess: () => {
      toast.success("免费试用已开通！");
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "开通失败，请重试");
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (planId === "free_trial") {
      createTrialMutation.mutate();
    } else {
      // Navigate to payment page
      setLocation(`/payment/checkout?planId=${planId}&billingCycle=${billingCycle}`);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free_trial":
        return <Sparkles className="w-6 h-6" />;
      case "basic":
        return <Zap className="w-6 h-6" />;
      case "professional":
        return <Crown className="w-6 h-6" />;
      case "enterprise":
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const activePlans = plans?.filter((p: any) => p.isActive) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            选择适合您的订阅计划
          </h1>
          <p className="text-slate-400 text-lg">
            灵活的定价方案，满足不同规模工厂的需求
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg bg-slate-800/50 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              年付
              <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                省 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
            <p className="text-blue-400">
              当前订阅：<strong>{currentSubscription.plan?.name}</strong> | 
              到期时间：{new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activePlans.map((plan: any) => {
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const isPopular = plan.id === "professional";
            const isCurrent = currentSubscription?.subscription?.planId === plan.id;
            const features = plan.features || [];
            const limits = plan.limits || {};

            return (
              <Card
                key={plan.id}
                className={`relative p-8 bg-slate-800/50 backdrop-blur-sm border ${
                  isPopular
                    ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                    : "border-slate-700/50"
                }`}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0">
                    最受欢迎
                  </Badge>
                )}

                {/* Plan Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                    {getPlanIcon(plan.id)}
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p className="text-slate-400 text-center mb-6 text-sm">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="text-center mb-6">
                  {plan.id === "enterprise" ? (
                    <div className="text-3xl font-bold text-white">定制报价</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-white">
                        {formatPrice(Number(price))}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        / {billingCycle === "yearly" ? "年" : "月"}
                      </div>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-xs text-slate-400 space-y-2">
                    {limits.webinarCreatedMonthly !== undefined && (
                      <div className="flex justify-between">
                        <span>视频谈判名额</span>
                        <span className="text-white font-medium">
                          {limits.webinarCreatedMonthly === -1
                            ? "无限"
                            : `${limits.webinarCreatedMonthly}/月`}
                        </span>
                      </div>
                    )}
                    {limits.productsMax !== undefined && (
                      <div className="flex justify-between">
                        <span>产品数量</span>
                        <span className="text-white font-medium">
                          {limits.productsMax === -1 ? "无限" : limits.productsMax}
                        </span>
                      </div>
                    )}
                    {limits.inquiriesMonthly !== undefined && (
                      <div className="flex justify-between">
                        <span>买家推荐</span>
                        <span className="text-white font-medium">
                          {limits.inquiriesMonthly === -1
                            ? "无限"
                            : `${limits.inquiriesMonthly}/月`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent || createTrialMutation.isPending}
                  className={`w-full ${
                    isPopular
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {isCurrent
                    ? "当前计划"
                    : plan.id === "free_trial"
                    ? "立即试用"
                    : plan.id === "enterprise"
                    ? "联系销售"
                    : "立即开启"}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-slate-400">
            需要帮助选择合适的计划？
            <a href="/contact" className="text-purple-400 hover:text-purple-300 ml-2">
              联系我们
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
