import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Calendar, CreditCard, TrendingUp, Users, Package, MessageSquare, AlertCircle } from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function SubscriptionManagement() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  const { data: subscription, isLoading, refetch } = trpc.subscription.current.useQuery();
  const cancelSubscription = trpc.subscription.cancel.useMutation();

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync();
      toast.success("订阅已取消，将在当前计费周期结束时生效");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "取消订阅失败");
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

  if (!subscription?.subscription) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>您还没有订阅</CardTitle>
            <CardDescription>选择一个套餐开始使用 RealSourcing</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/pricing")}>查看套餐</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { subscription: sub, plan, usage } = subscription;
  const daysRemaining = Math.ceil(
    (new Date(sub.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate usage percentages
  const webinarUsagePercent = plan?.limits?.webinarCreatedMonthly === -1
    ? 0
    : ((usage?.webinarCreated || 0) / (plan?.limits?.webinarCreatedMonthly || 1)) * 100;

  const productUsagePercent = plan?.limits?.productsMax === -1
    ? 0
    : ((usage?.productUploaded || 0) / (plan?.limits?.productsMax || 1)) * 100;

  const inquiryUsagePercent = plan?.limits?.inquiriesMonthly === -1
    ? 0
    : ((usage?.inquiryReceived || 0) / (plan?.limits?.inquiriesMonthly || 1)) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">订阅管理</h1>
        <p className="text-muted-foreground">管理您的订阅和查看使用情况</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{plan?.name}</CardTitle>
                  <CardDescription>{plan?.description}</CardDescription>
                </div>
                <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                  {sub.status === "active" ? "活跃" : "已过期"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">计费周期</p>
                  <p className="text-sm text-muted-foreground">
                    {sub.billingCycle === "monthly" ? "月付" : "年付"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">下次续费日期</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(sub.currentPeriodEnd), "PPP", { locale: zhCN })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">剩余天数</p>
                  <p className="text-sm text-muted-foreground">
                    {daysRemaining} 天
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">套餐功能</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan?.features?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => navigate("/pricing")}>升级套餐</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">取消订阅</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确定要取消订阅吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                      取消后，您的订阅将在当前计费周期结束时（{format(new Date(sub.currentPeriodEnd), "PPP", { locale: zhCN })}）停止。
                      您仍可以继续使用服务直到该日期。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription}>
                      确认取消订阅
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>本月使用情况</CardTitle>
              <CardDescription>查看您本月的资源使用情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webinar Created */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Webinar 创建</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage?.webinarCreated || 0} / {plan?.limits?.webinarCreatedMonthly === -1 ? "无限" : plan?.limits?.webinarCreatedMonthly}
                  </span>
                </div>
                <Progress value={webinarUsagePercent} className="h-2" />
              </div>

              {/* Products Uploaded */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">产品上传</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage?.productUploaded || 0} / {plan?.limits?.productsMax === -1 ? "无限" : plan?.limits?.productsMax}
                  </span>
                </div>
                <Progress value={productUsagePercent} className="h-2" />
              </div>

              {/* Inquiries Received */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">询价接收</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage?.inquiryReceived || 0} / {plan?.limits?.inquiriesMonthly === -1 ? "无限" : plan?.limits?.inquiriesMonthly}
                  </span>
                </div>
                <Progress value={inquiryUsagePercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/pricing")}>
                <TrendingUp className="w-4 h-4 mr-2" />
                升级套餐
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/payment/history")}>
                <CreditCard className="w-4 h-4 mr-2" />
                支付历史
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">需要帮助？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                如果您对订阅有任何疑问，请联系我们的客服团队。
              </p>
              <Button variant="outline" className="w-full">
                联系客服
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
