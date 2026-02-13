import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess() {
  const [location, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  // Get order number from URL query params
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const orderNo = searchParams.get("orderNo");

  useEffect(() => {
    // Auto redirect to subscription management after 5 seconds
    const timer = setTimeout(() => {
      navigate("/subscription");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">支付成功！</CardTitle>
          <CardDescription>
            感谢您订阅 RealSourcing，您的订阅已激活
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {orderNo && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">订单号</p>
              <p className="font-mono text-sm">{orderNo}</p>
            </div>
          )}

          <div className="text-left space-y-2">
            <h3 className="font-semibold">接下来您可以：</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>查看订阅详情和使用情况</li>
              <li>创建 Webinar 开始与买家沟通</li>
              <li>上传产品展示您的工厂实力</li>
              <li>接收买家询价并快速响应</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            页面将在 5 秒后自动跳转到订阅管理页面...
          </p>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          <Button onClick={() => navigate("/subscription")}>
            查看订阅
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
