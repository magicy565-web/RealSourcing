import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../_core/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Loader2, CreditCard, Smartphone } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { toast } from "sonner";

export default function PaymentCheckout() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const planId = searchParams.get("planId") || "basic";
  const billingCycle = (searchParams.get("billingCycle") || "yearly") as "monthly" | "yearly";

  const [paymentMethod, setPaymentMethod] = useState<"alipay" | "wechatpay">("alipay");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch plan details
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["subscription", "plan", planId],
    queryFn: async () => {
      const result = await trpc.subscription.getPlan.query({ planId });
      return result;
    },
  });

  // Create payment order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: { planId: string; billingCycle: "monthly" | "yearly"; paymentMethod: string }) => {
      return await trpc.payment.createOrder.mutate(data);
    },
    onSuccess: async (data: any) => {
      toast.success("订单创建成功！");
      
      // In production, redirect to payment gateway
      // For now, simulate payment
      if (data.orderNo) {
        // Simulate payment processing
        setIsProcessing(true);
        setTimeout(async () => {
          try {
            await trpc.payment.simulatePayment.mutate({ orderNo: data.orderNo });
            toast.success("支付成功！");
            setLocation("/payment/success?orderNo=" + data.orderNo);
          } catch (error: any) {
            toast.error("支付失败：" + error.message);
            setLocation("/payment/failed");
          } finally {
            setIsProcessing(false);
          }
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "创建订单失败");
    },
  });

  const handlePayment = () => {
    createOrderMutation.mutate({
      planId,
      billingCycle,
      paymentMethod,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">订阅计划未找到</h2>
          <Button onClick={() => setLocation("/subscription/plans")}>
            返回选择计划
          </Button>
        </div>
      </div>
    );
  }

  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">完成支付</h1>
          <p className="text-slate-400">请选择支付方式并完成付款</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">订单摘要</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">订阅计划</span>
                <span className="text-white font-medium">{plan.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">计费周期</span>
                <span className="text-white font-medium">
                  {billingCycle === "yearly" ? "年付" : "月付"}
                </span>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="text-slate-400">应付金额</span>
                  <span className="text-white font-bold">
                    {formatPrice(Number(price))}
                  </span>
                </div>
              </div>

              {billingCycle === "yearly" && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">
                    年付优惠：相比月付节省 17%
                  </p>
                </div>
              )}
            </div>

            {/* Plan Features */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">包含功能</h3>
              <ul className="space-y-2">
                {(plan.features || []).slice(0, 5).map((feature: string, index: number) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">支付方式</h2>

            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="space-y-3">
                {/* Alipay */}
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "alipay"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setPaymentMethod("alipay")}
                >
                  <RadioGroupItem value="alipay" id="alipay" />
                  <Label htmlFor="alipay" className="flex items-center cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                    <span className="text-white font-medium">支付宝</span>
                  </Label>
                </div>

                {/* WeChat Pay */}
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "wechatpay"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setPaymentMethod("wechatpay")}
                >
                  <RadioGroupItem value="wechatpay" id="wechatpay" />
                  <Label htmlFor="wechatpay" className="flex items-center cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5 mr-2 text-green-400" />
                    <span className="text-white font-medium">微信支付</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={createOrderMutation.isPending || isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {createOrderMutation.isPending || isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                `支付 ${formatPrice(Number(price))}`
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-400 text-center">
                🔒 支付信息经过加密处理，确保您的资金安全
              </p>
            </div>

            {/* Terms */}
            <p className="text-xs text-slate-500 text-center mt-4">
              点击支付即表示您同意我们的
              <a href="/terms" className="text-purple-400 hover:text-purple-300 mx-1">
                服务条款
              </a>
              和
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 mx-1">
                隐私政策
              </a>
            </p>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/subscription/plans")}
            className="text-slate-400 hover:text-white"
          >
            ← 返回选择计划
          </Button>
        </div>
      </div>
    </div>
  );
}
