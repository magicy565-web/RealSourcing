import DashboardLayout from "../components/DashboardLayout";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, MapPin, Star, Building2, ChevronDown, Video } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

// Mock Data
const mockFactories = [
  {
    id: 1,
    name: '深圳科技工厂',
    location: '广东 深圳',
    category: '消费电子',
    rating: 4.9,
    reviews: 234,
    certifications: ['CE', 'ISO9001', 'FCC'],
    established: 2008,
    employees: '500+',
    responseTime: '平均 2h',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    liveWebinars: 2
  },
  {
    id: 2,
    name: '广州服装厂',
    location: '广东 广州',
    category: '服装服饰',
    rating: 4.7,
    reviews: 189,
    certifications: ['ISO9001', 'BSCI'],
    established: 2010,
    employees: '300+',
    responseTime: '平均 3h',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    liveWebinars: 1
  },
  {
    id: 3,
    name: '东莞玩具厂',
    location: '广东 东莞',
    category: '玩具礼品',
    rating: 4.8,
    reviews: 156,
    certifications: ['CE', 'EN71', 'ASTM'],
    established: 2005,
    employees: '400+',
    responseTime: '平均 2h',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=400&fit=crop',
    liveWebinars: 0
  },
  {
    id: 4,
    name: '佛山家居厂',
    location: '广东 佛山',
    category: '家居日用',
    rating: 4.6,
    reviews: 98,
    certifications: ['ISO9001', 'FSC'],
    established: 2012,
    employees: '200+',
    responseTime: '平均 4h',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    liveWebinars: 0
  },
  {
    id: 5,
    name: '上海美妆厂',
    location: '上海',
    category: '美妆护肤',
    rating: 4.9,
    reviews: 267,
    certifications: ['ISO22716', 'GMP', 'FDA'],
    established: 2015,
    employees: '350+',
    responseTime: '平均 1h',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop',
    liveWebinars: 3
  },
  {
    id: 6,
    name: '宁波机械厂',
    location: '浙江 宁波',
    category: '工业设备',
    rating: 4.5,
    reviews: 76,
    certifications: ['CE', 'ISO9001'],
    established: 2003,
    employees: '600+',
    responseTime: '平均 5h',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    liveWebinars: 1
  }
];

export default function Factories() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { value: "all", label: "全部" },
    { value: "electronics", label: "消费电子" },
    { value: "fashion", label: "服装服饰" },
    { value: "toys", label: "玩具礼品" },
    { value: "home", label: "家居日用" },
    { value: "beauty", label: "美妆护肤" },
    { value: "industrial", label: "工业设备" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 border border-purple-500/20 p-12 text-center">
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
              探索全球优质工厂
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              AI 智能匹配，发现最适合您的供应商伙伴
            </p>

            <div className="flex items-center justify-center space-x-12">
              <div className="flex items-center space-x-2">
                <Building2 className="text-purple-400" size={20} />
                <span className="text-white font-semibold">500+ 认证工厂</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-purple-400" size={20} />
                <span className="text-white font-semibold">平均评分 4.8</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="text-purple-400" size={20} />
                <span className="text-white font-semibold">支持 1:1 视频选品</span>
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
              placeholder="搜索工厂名称、产品类别或地区..."
              className="pl-12 pr-4 py-6 rounded-xl bg-[#1a1a1a]/80 border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500"
            />
          </div>

          {/* Category Tabs and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(cat.value)}
                  className={activeCategory === cat.value 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-transparent border-white/20 text-gray-300 hover:bg-white/5'
                  }
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
                评分 <ChevronDown size={16} className="ml-2" />
              </Button>
              <Button variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/5">
                地区 <ChevronDown size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Factory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFactories.map((factory) => (
            <Card 
              key={factory.id} 
              className="bg-[#1a1a1a]/80 border-white/10 hover:border-purple-500/50 transition-all overflow-hidden group cursor-pointer"
              onClick={() => setLocation(`/factories/${factory.id}`)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={factory.image} 
                  alt={factory.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {factory.liveWebinars > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white border-0">
                      🔴 {factory.liveWebinars} 场直播中
                    </Badge>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="text-white text-sm font-semibold">{factory.rating}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Factory Name & Location */}
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {factory.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{factory.location}</span>
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                      {factory.category}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                  <div>
                    <div className="text-white font-semibold">{factory.established}</div>
                    <div>成立年份</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{factory.employees}</div>
                    <div>员工人数</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{factory.reviews}</div>
                    <div>评价数</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-semibold">{factory.responseTime}</div>
                    <div>响应时间</div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex items-center flex-wrap gap-2">
                  {factory.certifications.map((cert) => (
                    <Badge 
                      key={cert} 
                      variant="outline" 
                      className="border-white/20 text-gray-300 text-xs"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/factories/${factory.id}`);
                    }}
                  >
                    查看详情
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Start 1:1 meeting
                    }}
                  >
                    发起会议
                  </Button>
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
