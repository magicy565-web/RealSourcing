import DashboardLayout from "../components/DashboardLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Video, Building2, FileText, Radio, Calendar, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

// Mock Data
const mockWebinars = [
  {
    id: 1,
    status: 'live',
    factory: '深圳科技工厂',
    title: '2025 TikTok爆款蓝牙耳机新品发布会',
    participants: 1234,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    status: 'upcoming',
    factory: '广州服装厂',
    title: '2025秋冬速干运动服品会',
    time: '明天 14:00',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    status: 'past',
    factory: '东莞玩具厂',
    title: '儿童益智玩具出口合规指南',
    time: '已结束',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop'
  }
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [aiInput, setAiInput] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;
    // TODO: Implement AI chat
    setAiInput("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {getGreeting()}，Magic 👋
          </h1>
          <p className="text-gray-400">
            今天有 3 场 Webinar 等待您参与，AI 已为您推荐 12 家工厂
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Live Webinars */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Radio className="text-red-400" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">2</div>
              <div className="text-sm text-gray-400">场直播中</div>
            </div>
          </Card>

          {/* Upcoming Webinars */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="text-blue-400" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">5</div>
              <div className="text-sm text-gray-400">场即将开始</div>
            </div>
          </Card>

          {/* Partner Factories */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Building2 className="text-purple-400" size={24} />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  +12 本周
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">128</div>
              <div className="text-sm text-gray-400">家已合作工厂</div>
            </div>
          </Card>

          {/* Registered Webinars */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <FileText className="text-cyan-400" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-sm text-gray-400">场已报名 Webinar</div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommended Webinars - Left Column (2/3) */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1a1a1a]/80 border-white/10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="mr-2">✨</span>
                    AI 推荐 Webinar
                  </h2>
                  <button 
                    onClick={() => setLocation('/webinars')}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    查看全部 →
                  </button>
                </div>

                <div className="space-y-4">
                  {mockWebinars.map((webinar) => (
                    <div
                      key={webinar.id}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-[#0a0a0a]/50 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                      onClick={() => setLocation(`/webinars/${webinar.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={webinar.image} 
                          alt={webinar.title}
                          className="w-full h-full object-cover"
                        />
                        {webinar.status === 'live' && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-red-500 text-white border-0 text-xs">
                              LIVE
                            </Badge>
                          </div>
                        )}
                        {webinar.status === 'upcoming' && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-blue-500 text-white border-0 text-xs">
                              UPCOMING
                            </Badge>
                          </div>
                        )}
                        {webinar.status === 'past' && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-gray-500 text-white border-0 text-xs">
                              PAST
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-white">工</span>
                          </div>
                          <span className="text-sm text-gray-400">{webinar.factory}</span>
                        </div>
                        <h3 className="text-white font-medium mb-1 group-hover:text-purple-400 transition-colors truncate">
                          {webinar.title}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {webinar.status === 'live' && (
                            <span className="text-red-400">🔥 {webinar.participants} 人在线</span>
                          )}
                          {webinar.status === 'upcoming' && (
                            <span>{webinar.time}</span>
                          )}
                          {webinar.status === 'past' && (
                            <span>{webinar.time}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        className={
                          webinar.status === 'live'
                            ? "bg-purple-600 hover:bg-purple-500 text-white"
                            : webinar.status === 'upcoming'
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-gray-600 hover:bg-gray-500 text-white"
                        }
                      >
                        {webinar.status === 'live' && '立即参与'}
                        {webinar.status === 'upcoming' && '注册'}
                        {webinar.status === 'past' && '回放'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* AI Assistant - Right Column (1/3) */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1a1a1a]/80 border-white/10 h-full">
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI 采购助理
                </h2>

                {/* Chat Messages */}
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                  {/* AI Message */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="flex-1 bg-[#0a0a0a]/50 rounded-2xl rounded-tl-none p-4 border border-white/5">
                      <p className="text-sm text-gray-300">
                        👋 您好！我是您的AI采购助理，请告诉我您的采购需求，我来帮您精准匹配工厂。
                      </p>
                    </div>
                  </div>

                  {/* User Message Example */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="flex-1 bg-purple-600/20 rounded-2xl rounded-tr-none p-4 border border-purple-500/30">
                      <p className="text-sm text-gray-200">
                        我需要采购蓝牙耳机，预算$50/件，月采购500件
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">M</span>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="flex-1 bg-[#0a0a0a]/50 rounded-2xl rounded-tl-none p-4 border border-white/5">
                      <p className="text-sm text-gray-300 mb-3">
                        好的！我已为您找到 8 家匹配工厂，其中 3 家有即将开始的Webinar...
                      </p>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          查看推荐工厂
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          浏览相关Webinar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full justify-start text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          发起询价
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="relative">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入您的采购需求..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#0a0a0a]/50 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
