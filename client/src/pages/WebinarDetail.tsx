import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, Calendar, Users, Globe, Share2, Heart,
  Clock, MapPin, Star, Building2, ExternalLink, Link as LinkIcon,
  Facebook, Linkedin, Twitter
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

// Mock Data
const mockWebinarDetail = {
  id: 1,
  title: '2025 TikTok爆款蓝牙耳机新品发布会',
  factory: {
    id: 1,
    name: '深圳科技工厂',
    rating: 4.9,
    category: '消费电子',
    certifications: ['CE', 'ISO9001'],
    description: '进驻企业产品，进实新作进厂，证证、产业红利。',
    avatar: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop'
  },
  status: 'upcoming',
  startTime: '2025-02-20 14:00',
  endTime: '15:30',
  registered: 1234,
  language: '中文 + 英文翻译',
  audience: '采购商、贸易商',
  url: 'https://realsourcing.com/webinar/1',
  description: '本场 Webinar 将展示深圳科技工厂最新的 2025 年 TikTok 爆款蓝牙耳机系列，深度解析产品核心竞争力、市场趋势及选品策略，助力买家抓住下一波流量红利。',
  heroImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&h=600&fit=crop',
  speaker: {
    name: '张伟',
    title: 'CEO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
  products: [
    {
      id: 1,
      name: 'ANC 3.0 降噪耳机',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop'
    },
    {
      id: 2,
      name: '运动蓝牙耳机',
      price: '$38',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop'
    },
    {
      id: 3,
      name: '入耳式耳机',
      price: '$28',
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200&h=200&fit=crop'
    }
  ],
  relatedWebinars: [
    {
      id: 2,
      title: 'AI 驱动的未来趋势',
      time: '2025-02-20 14:00',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: '数据安全与隐私保护',
      time: '2025-02-20 14:00',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: '构建高效团队工作流',
      time: '2025-02-20 14:00',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop'
    }
  ]
};

// Countdown Hook
function useCountdown(targetTime: string) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const target = new Date(targetTime).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }
      
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ hours, minutes });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [targetTime]);
  
  return timeLeft;
}

export default function WebinarDetail() {
  const [, params] = useRoute("/webinars/:id");
  const [, setLocation] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const countdown = useCountdown(mockWebinarDetail.startTime);

  const handleShare = (platform: string) => {
    toast.success(`分享到 ${platform}`);
  };

  const handleRegister = () => {
    toast.success("注册成功！您将收到 Webinar 链接和提醒");
  };

  const handleJoinLive = () => {
    setLocation(`/webinars/${params?.id}/live`);
  };

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-3xl overflow-hidden mb-8">
        {/* Background Image */}
        <img 
          src={mockWebinarDetail.heroImage} 
          alt={mockWebinarDetail.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/webinars')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2" size={20} />
            返回
          </Button>
          
          <div className="text-white text-xl font-semibold">
            {mockWebinarDetail.title}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => handleShare('share')}
              className="text-white hover:bg-white/20"
            >
              <Share2 size={20} className="mr-2" />
              分享
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-white hover:bg-white/20"
            >
              <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
              收藏
            </Button>
          </div>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
          {/* Factory Info Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <span className="text-white text-lg">{mockWebinarDetail.factory.name}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {mockWebinarDetail.title}
            </h2>
            <Badge className="bg-red-500 text-white border-0">
              LIVE
            </Badge>
          </div>
          
          {/* Action Button */}
          <div className="text-right">
            <Button
              size="lg"
              onClick={handleJoinLive}
              className="bg-purple-600 hover:bg-purple-500 text-white text-lg px-8 py-6 rounded-2xl shadow-lg shadow-purple-500/50"
            >
              [立即进入直播间]
            </Button>
            <div className="text-white mt-2">
              {mockWebinarDetail.registered.toLocaleString()} 人在线
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar size={18} className="text-purple-400" />
                <span>{mockWebinarDetail.startTime} - {mockWebinarDetail.endTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users size={18} className="text-green-400" />
                <span className="text-green-400">已报名: {mockWebinarDetail.registered.toLocaleString()} 人</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users size={18} className="text-purple-400" />
                <span>适合人群: {mockWebinarDetail.audience}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Globe size={18} className="text-purple-400" />
                <span>语言: {mockWebinarDetail.language}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-purple-400">
              <LinkIcon size={18} />
              <a href={mockWebinarDetail.url} className="hover:underline">{mockWebinarDetail.url}</a>
            </div>
          </Card>

          {/* Webinar Introduction */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Webinar 介绍</h3>
            <p className="text-gray-300 leading-relaxed">
              {mockWebinarDetail.description}
            </p>
          </Card>

          {/* Products */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">本场展示产品</h3>
            <div className="grid grid-cols-3 gap-4">
              {mockWebinarDetail.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="text-white font-medium mb-1">{product.name}</h4>
                  <div className="text-purple-400 font-semibold mb-3">{product.price}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    询价
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Factory Info */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">工厂介绍</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <div className="text-white font-semibold">{mockWebinarDetail.factory.name}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="text-yellow-400 fill-yellow-400" size={14} />
                  <span className="text-yellow-400">{mockWebinarDetail.factory.rating}</span>
                  <span className="text-gray-400">| {mockWebinarDetail.factory.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              {mockWebinarDetail.factory.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="border-purple-500/30 text-purple-400">
                  {cert}
                </Badge>
              ))}
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {mockWebinarDetail.factory.description}
            </p>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-purple-400 hover:bg-purple-500/10"
                onClick={() => setLocation(`/factories/${mockWebinarDetail.factory.id}`)}
              >
                进入工厂主页 <ExternalLink size={16} className="ml-2" />
              </Button>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              >
                发起 1:1 选品会议
              </Button>
            </div>
          </Card>

          {/* Webinar Info & Registration */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Webinar 信息</h3>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                {mockWebinarDetail.startTime}
              </div>
              <div className="text-orange-400 flex items-center justify-center space-x-2">
                <Clock size={18} />
                <span>距开始 {countdown.hours} 小时 {countdown.minutes} 分</span>
              </div>
              <div className="text-green-400 flex items-center justify-center space-x-2 mt-2">
                <Users size={18} />
                <span>已报名 {mockWebinarDetail.registered.toLocaleString()} 人</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={mockWebinarDetail.speaker.avatar} 
                alt={mockWebinarDetail.speaker.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="text-white">
                <div className="font-semibold">{mockWebinarDetail.speaker.name} · {mockWebinarDetail.speaker.title}</div>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-6 text-lg rounded-xl mb-3"
            >
              [立即注册]
            </Button>
            
            <p className="text-gray-400 text-xs text-center">
              注册后将收到 Webinar 链接和提醒
            </p>
          </Card>

          {/* Share */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">分享此 Webinar</h3>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleShare('Facebook')}
                className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Facebook className="text-white" size={24} />
              </button>
              <button
                onClick={() => handleShare('Twitter')}
                className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Twitter className="text-white" size={24} />
              </button>
              <button
                onClick={() => handleShare('LinkedIn')}
                className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Linkedin className="text-white" size={24} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(mockWebinarDetail.url);
                  toast.success('链接已复制');
                }}
                className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <LinkIcon className="text-white" size={24} />
              </button>
            </div>
          </Card>

          {/* Related Webinars */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">相关 Webinar</h3>
            <div className="space-y-3">
              {mockWebinarDetail.relatedWebinars.map((webinar) => (
                <div
                  key={webinar.id}
                  onClick={() => setLocation(`/webinars/${webinar.id}`)}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-[#0a0a0a]/50 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <img 
                    src={webinar.image} 
                    alt={webinar.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{webinar.title}</div>
                    <div className="text-gray-400 text-xs">{webinar.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
