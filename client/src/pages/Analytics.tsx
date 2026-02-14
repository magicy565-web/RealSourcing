import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../_core/trpc";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Users, Video, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Mock data - in production, this would come from the backend
  const inquiryTrendData = [
    { date: "2026-01-15", inquiries: 12, conversions: 3 },
    { date: "2026-01-22", inquiries: 18, conversions: 5 },
    { date: "2026-01-29", inquiries: 15, conversions: 4 },
    { date: "2026-02-05", inquiries: 22, conversions: 7 },
    { date: "2026-02-12", inquiries: 28, conversions: 9 },
  ];

  const buyerSourceData = [
    { name: "美国", value: 35, color: "#8b5cf6" },
    { name: "欧洲", value: 28, color: "#06b6d4" },
    { name: "日本", value: 15, color: "#10b981" },
    { name: "东南亚", value: 12, color: "#f59e0b" },
    { name: "其他", value: 10, color: "#6b7280" },
  ];

  const videoPerformanceData = [
    { month: "10月", sessions: 45, avgDuration: 18 },
    { month: "11月", sessions: 52, avgDuration: 22 },
    { month: "12月", sessions: 48, avgDuration: 20 },
    { month: "1月", sessions: 65, avgDuration: 25 },
    { month: "2月", sessions: 72, avgDuration: 28 },
  ];

  const conversionFunnelData = [
    { stage: "访问", count: 1000, percentage: 100 },
    { stage: "注册", count: 450, percentage: 45 },
    { stage: "询盘", count: 180, percentage: 18 },
    { stage: "视频谈判", count: 90, percentage: 9 },
    { stage: "成交", count: 32, percentage: 3.2 },
  ];

  const handleExportData = (format: "csv" | "excel") => {
    toast.success(`正在导出 ${format.toUpperCase()} 格式数据...`);
    // In production, implement actual export logic
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">数据分析</h1>
            <p className="text-slate-400">深入了解您的业务表现和增长趋势</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">最近 7 天</SelectItem>
                <SelectItem value="30d">最近 30 天</SelectItem>
                <SelectItem value="90d">最近 90 天</SelectItem>
                <SelectItem value="1y">最近 1 年</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => handleExportData("csv")}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">总询盘数</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">95</p>
            <p className="text-sm text-green-400 mt-1">+23% 较上月</p>
          </Card>

          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">转化率</span>
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">32%</p>
            <p className="text-sm text-green-400 mt-1">+5% 较上月</p>
          </Card>

          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">视频会议</span>
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">72</p>
            <p className="text-sm text-green-400 mt-1">+18% 较上月</p>
          </Card>

          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">活跃买家</span>
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">156</p>
            <p className="text-sm text-green-400 mt-1">+12% 较上月</p>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="inquiries">询盘趋势</TabsTrigger>
            <TabsTrigger value="conversion">转化漏斗</TabsTrigger>
            <TabsTrigger value="buyers">买家来源</TabsTrigger>
            <TabsTrigger value="video">视频表现</TabsTrigger>
          </TabsList>

          {/* Inquiry Trend */}
          <TabsContent value="inquiries">
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">询盘与转化趋势</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={inquiryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#94a3b8"
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="询盘数"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="转化数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Conversion Funnel */}
          <TabsContent value="conversion">
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">转化漏斗分析</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionFunnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="stage" type="category" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" name="用户数" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Buyer Source */}
          <TabsContent value="buyers">
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">买家来源分布</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={buyerSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {buyerSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Video Performance */}
          <TabsContent value="video">
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">视频会议表现</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={videoPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="sessions"
                    fill="#8b5cf6"
                    name="会议数量"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="avgDuration"
                    fill="#06b6d4"
                    name="平均时长(分钟)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">💡 AI 洞察与建议</h3>
          <div className="space-y-3 text-slate-300">
            <p>
              • 您的询盘转化率（32%）高于行业平均水平（25%），表现优秀！
            </p>
            <p>
              • 视频会议平均时长增加至 28 分钟，说明买家对您的产品兴趣浓厚。
            </p>
            <p>
              • 美国市场占比最高（35%），建议增加针对美国市场的产品展示。
            </p>
            <p>
              • 建议在询盘高峰期（每周三、四）增加在线时间，提高响应速度。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
