import DashboardLayout from "../components/DashboardLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Radio, Calendar, Users, Clock, ArrowRight, ChevronDown } from "lucide-react";
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
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    status: 'upcoming',
    factory: '广州服装厂',
    title: '2025 秋冬新款速干运动服 B2B 选品会',
    time: '明天 14:00',
    registered: 89,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    status: 'upcoming',
    factory: '东莞玩具厂',
    title: '儿童益智玩具出口合规与选品指南',
    time: '后天 10:00',
    registered: 156,
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=400&fit=crop'
  },
  {
    id: 4,
    status: 'past',
    factory: '佛山家居厂',
    title: '智能家居出口欧美市场合规指南',
    time: '2 天前',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  },
  {
    id: 5,
    status: 'live',
    factory: '上海美妆厂',
    title: '天然有机护肤品 OEM 定制选品会',
    participants: 678,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop'
  },
  {
    id: 6,
    status: 'upcoming',
    factory: '宁波机械厂',
    title: '工业零配件出口欧盟 CE 认证专题',
    time: '3 天后',
    registered: 43,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'
  }
];

export default function Webinars() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    if (status === 'live') {
      return <Badge className="bg-red-500 text-white border-0">🔴 LIVE</Badge>;
    } else if (status === 'upcoming') {
      return <Badge className="bg-blue-500 text-white border-0">📅 即将开始</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white border-0">✅ 已结束</Badge>;
    }
  };

  const getActionButton = (webinar: any) => {
    if (webinar.status === 'live') {
      return (
        <Button 
          className="bg-purple-600 hover:bg-purple-500 text-white"
          onClick={() => setLocation(`/webinars/${webinar.id}/live`)}
        >
          立即参与
        </Button>
      );
    } else if (webinar.status === 'upcoming') {
      return (
        <Button 
          className="bg-blue-600 hover:bg-blue-500 text-white"
          onClick={() => setLocation(`/webinars/${webinar.id}`)}
        >
          注册参与
        </Button>
      );
    } else {
      return (
        <Button 
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          onClick={() => setLocation(`/webinars/${webinar.id}`)}
        >
          观看回放
        </Button>
      );
    }
  };

  const filteredWebinars = mockWebinars.filter(w => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return w.status === 'live';
    if (activeFilter === 'upcoming') return w.status === 'upcoming';
    if (activeFilter === 'past') return w.status === 'past';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 border border-purple-500/20 p-12 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4">
              探索精彩 Webinar
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              发现全球优质工厂的最新产品与行业洞察
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-12">
              <div className="flex items-center space-x-2">
                <Radio className="text-purple-400" size={20} />
                <span className="text-white font-semibold">本周 24 场直播</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-purple-400" size={20} />
                <span className="text-white font-semibold">156 家工厂参与</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-purple-400" size={20} />
                <span className="text-white font-semibold">3,200+ 采购商在线</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 Webinar 标题或工厂名称..."
              className="pl-12 pr-4 py-6 rounded-xl bg-[#1a1a1a]/80 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Tabs and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
                className={activeFilter === 'all' 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                }
              >
                全部
              </Button>
              <Button
                variant={activeFilter === 'live' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('live')}
                className={activeFilter === 'live' 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                }
              >
                🔴 直播中 (3)
              </Button>
              <Button
                variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('upcoming')}
                className={activeFilter === 'upcoming' 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                }
              >
                📅 即将开始 (8)
              </Button>
              <Button
                variant={activeFilter === 'past' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('past')}
                className={activeFilter === 'past' 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                }
              >
                ✅ 已结束
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
                消息电子 <ChevronDown size={16} className="ml-2" />
              </Button>
              <Button variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
                最新 <ChevronDown size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Webinar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebinars.map((webinar) => (
            <Card 
              key={webinar.id} 
              className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all overflow-hidden group cursor-pointer"
              onClick={() => setLocation(`/webinars/${webinar.id}`)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={webinar.image} 
                  alt={webinar.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(webinar.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Factory */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">工</span>
                  </div>
                  <span className="text-sm text-gray-400">{webinar.factory}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                  {webinar.title}
                </h3>

                {/* Info */}
                <div className="text-sm text-gray-400">
                  {webinar.status === 'live' && (
                    <span className="text-red-400 font-semibold">🔥 {webinar.participants} 人在线</span>
                  )}
                  {webinar.status === 'upcoming' && (
                    <span>{webinar.time} · 已报名 {webinar.registered} 人</span>
                  )}
                  {webinar.status === 'past' && (
                    <span>{webinar.time} · 回放可用</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  {getActionButton(webinar)}
                  <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center transition-colors">
                    查看详情 <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 pt-8">
          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
            ←
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
            1
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
            2
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
            3
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
            4
          </Button>
          <span className="text-gray-500">...</span>
          <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
            →
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
