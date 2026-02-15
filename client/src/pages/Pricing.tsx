import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Check, Sparkles } from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  const { data: plans, isLoading } = trpc.subscription.plans.useQuery();
  const createOrder = trpc.payment.createOrder.useMutation();

  const handleSubscribe = async (planId: string) => {
    if (planId === "free_trial") {
      // Navigate to signup or activate free trial
      toast.info("免费试用功能即将推出");
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        planId,
        billingCycle,
        paymentMethod: "alipay", // Default to Alipay
      });

      // Redirect to payment URL
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error("生成支付链接失败，请稍后重试");
      }
    } catch (error: any) {
      toast.error(error.message || "创建订单失败");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">选择适合您的套餐</h1>
        <p className="text-xl text-muted-foreground mb-8">
          灵活的定价方案，满足不同规模工厂的需求
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="billing-cycle" className={billingCycle === "monthly" ? "font-semibold" : ""}>
            月付
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label htmlFor="billing-cycle" className={billingCycle === "yearly" ? "font-semibold" : ""}>
            年付
            <Badge variant="secondary" className="ml-2">
              节省 16.7%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans?.map((plan) => {
          const price = billingCycle === "monthly" ? parseFloat(plan.priceMonthly) : parseFloat(plan.priceYearly);
          const monthlyPrice = billingCycle === "yearly" ? price / 12 : price;
          const isRecommended = plan.id === "professional";

          return (
            <Card
              key={plan.id}
              className={`relative ${isRecommended ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1 inline" />
                    推荐
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-12">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">¥{monthlyPrice.toFixed(0)}</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                  {billingCycle === "yearly" && price > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      年付 ¥{price.toFixed(0)}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {plan.features?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isRecommended ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={createOrder.isPending}
                >
                  {plan.id === "free_trial" ? "开始试用" : "立即订阅"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Comparison Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">与竞争对手对比</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alibaba.com</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">¥29,800 - ¥69,800</p>
                <p className="text-sm text-muted-foreground">每年</p>
                <p className="text-sm mt-4">充斥中间商，询盘质量差</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canton Fair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">¥50,000 - ¥200,000</p>
                <p className="text-sm text-muted-foreground">每次展会</p>
                <p className="text-sm mt-4">成本极高，一年仅 2 次</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-primary">RealSourcing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">¥299 - ¥2,999</p>
                <p className="text-sm text-muted-foreground">每月</p>
                <p className="text-sm mt-4 font-semibold text-primary">
                  实时视频，私密化，成本低
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">常见问题</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Q: 买家需要付费吗？</h3>
            <p className="text-muted-foreground">
              A: 不需要。海外采购商完全免费使用 RealSourcing，无隐藏费用。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Q: 可以随时取消订阅吗？</h3>
            <p className="text-muted-foreground">
              A: 可以。您可以随时取消订阅，取消后将在当前计费周期结束时生效。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Q: 支持哪些支付方式？</h3>
            <p className="text-muted-foreground">
              A: 我们支持支付宝、微信支付等国内主流支付方式。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Q: 可以升级或降级套餐吗？</h3>
            <p className="text-muted-foreground">
              A: 可以。您可以随时升级或降级套餐，费用将按比例调整。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
