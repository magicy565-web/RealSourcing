import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, MapPin, Star, Building2, Heart, Share2, MoreVertical,
  Phone, Mail, Clock, Users, Calendar, Award, ExternalLink, Video
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

// Mock Data
const mockFactoryDetail = {
  id: 1,
  name: 'Shenzhen Tech Factory',
  location: 'Guangdong Shenzhen',
  category: 'Consumer Electronics',
  rating: 4.9,
  reviews: 234,
  established: 2008,
  employees: '500+',
  responseTime: '平均 2h',
  certifications: ['CE', 'ISO9001', 'FCC', 'RoHS'],
  heroImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=600&fit=crop',
  logo: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=100&h=100&fit=crop',
  phone: '+86 123 456 7890',
  email: 'contact@techfactory.com',
  about: 'Shenzhen Tech Factory is a leading manufacturer specializing in high-quality consumer electronics, dedicated to innovation and reliability in every product we deliver. We combine advanced technology with precision engineering.',
  products: [
    {
      id: 1,
      name: 'ANC 3.0 Headphones',
      priceRange: '$40-50',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      priceRange: '$55-70',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'True Wireless Earbuds',
      priceRange: '$30-45',
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Fast Wireless Charger',
      priceRange: '$20-35',
      image: 'https://images.unsplash.com/photo-1591290619762-d2c2e7c1e7b7?w=300&h=300&fit=crop'
    }
  ],
  productionCapacity: [
    { label: '5M Units/Year', icon: '📦' },
    { label: 'Injection Molding', icon: '🏭' },
    { label: '15-30 Days Lead Time', icon: '⏱️' }
  ],
  latestWebinars: [
    {
      id: 1,
      title: '2025 Launch',
      time: 'Tomorrow 14:00',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=150&fit=crop'
    },
    {
      id: 2,
      title: 'New Features Demo',
      time: 'Friday 10:00',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=150&fit=crop'
    }
  ]
};

export default function FactoryDetail() {
  const [, params] = useRoute("/factories/:id");
  const [, setLocation] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleStartMeeting = () => {
    toast.success("正在启动 1:1 视频选品会议...");
  };

  const handleSendInquiry = () => {
    toast.success("询价表单已发送");
  };

  const handleFollow = () => {
    toast.success("已关注该工厂");
  };

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-3xl overflow-hidden mb-8">
        {/* Background Image */}
        <img 
          src={mockFactoryDetail.heroImage} 
          alt={mockFactoryDetail.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/factories')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </Button>
          
          <div className="text-white text-xl font-semibold">
            {mockFactoryDetail.name}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-white hover:bg-white/20"
            >
              <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
              Favorite
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Share2 size={20} />
              Share
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <MoreVertical size={20} />
              More
            </Button>
          </div>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
          {/* Factory Info Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building2 className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {mockFactoryDetail.name}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>{mockFactoryDetail.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 size={14} />
                    <span>{mockFactoryDetail.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="text-yellow-400">{mockFactoryDetail.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-3">Certifications</div>
            <div className="flex items-center flex-wrap gap-2">
              {mockFactoryDetail.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="border-purple-500/30 text-purple-400">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={handleStartMeeting}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-lg px-8 py-6 rounded-2xl shadow-lg shadow-purple-500/50"
            >
              <Video className="mr-2" size={20} />
              [Start 1:1 Meeting]
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation(`/webinars?factory=${params?.id}`)}
              className="w-full border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 text-lg px-8 py-6 rounded-2xl"
            >
              [Browse Webinars]
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Sidebar - Factory Stats (20%) */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="text-yellow-400 fill-yellow-400" size={32} />
                <span className="text-4xl font-bold text-yellow-400">{mockFactoryDetail.rating}</span>
                <span className="text-gray-400 text-xl">/ 5.0</span>
              </div>
              <a href="#reviews" className="text-purple-400 hover:underline">
                {mockFactoryDetail.reviews} Reviews
              </a>
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div>
                <div className="text-gray-400">Est. {mockFactoryDetail.established}</div>
              </div>
              <div>
                <div className="text-white font-semibold">{mockFactoryDetail.employees}</div>
                <div className="text-gray-400">Employees</div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 mb-6">
              {mockFactoryDetail.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="border-purple-500/30 text-purple-400">
                  {cert}
                </Badge>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-green-400 mb-6">
              <Clock size={16} />
              <span className="text-sm">{mockFactoryDetail.responseTime}</span>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleStartMeeting}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              >
                Start Meeting
              </Button>
              <Button
                onClick={handleSendInquiry}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                Send Inquiry
              </Button>
              <Button
                onClick={handleFollow}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5"
              >
                Follow
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* About Us */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">About Us</h3>
            <p className="text-gray-300 leading-relaxed">
              {mockFactoryDetail.about}
            </p>
          </Card>

          {/* Main Products */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Main Products</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-transparent border-b border-white/10">
                <TabsTrigger value="all" className="data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400">
                  All
                </TabsTrigger>
                <TabsTrigger value="electronics" className="data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400">
                  Consumer Electronics
                </TabsTrigger>
                <TabsTrigger value="accessories" className="data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400">
                  Accessories
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              {mockFactoryDetail.products.map((product) => (
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
                  <div className="text-purple-400 font-semibold mb-2">{product.priceRange}</div>
                  <a href="#" className="text-purple-400 text-sm hover:underline">
                    View Details <ExternalLink size={12} className="inline ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </Card>

          {/* Production Capacity */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Production Capacity</h3>
            <div className="grid grid-cols-3 gap-4">
              {mockFactoryDetail.productionCapacity.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a]/50 border border-purple-500/20 rounded-xl p-6 text-center"
                >
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <div className="text-white font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Contact & Webinars (20%) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <div className="text-white font-semibold">{mockFactoryDetail.name}</div>
                <div className="text-gray-400 text-sm">{mockFactoryDetail.location}</div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone size={16} className="text-purple-400" />
                <span>Phone: {mockFactoryDetail.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail size={16} className="text-purple-400" />
                <span>Email: {mockFactoryDetail.email}</span>
              </div>
            </div>
          </Card>

          {/* Latest Webinar */}
          <Card className="bg-[#1a1a1a]/80 border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Latest Webinar</h3>
            <div className="space-y-3">
              {mockFactoryDetail.latestWebinars.map((webinar) => (
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
