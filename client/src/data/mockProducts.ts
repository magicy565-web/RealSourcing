import { EnhancedProduct } from '../components/EnhancedProductCard';

export const mockProducts: EnhancedProduct[] = [
  {
    id: 1,
    name: "DRDENT Purple Teeth Whitening Strips - 7 Sessions",
    description: "Safe for Enamel - Non Sensitive Teeth Whitening - Peroxide-Free Formula",
    price: 15.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800",
    category: "Beauty & Personal Care",
    supplier: {
      name: "DR DENT Official",
      logo: "https://ui-avatars.com/api/?name=DR+DENT&background=8B5CF6&color=fff",
      country: "🇺🇸 United States",
      rating: 4.8
    },
    tiktokMetrics: {
      views: 15200000,
      likes: 1850000,
      shares: 125000,
      comments: 48500,
      salesVolume: 330500,
      conversionRate: 12.5,
      trendingScore: 95
    },
    salesData: {
      dailySales: 7700,
      totalSales: 330500,
      gmv: 124600,
      totalGmv: 6000000,
      growthRate: -19.22
    },
    moq: 100,
    commission: 15,
    launchDate: "2024-08-15",
    tags: ["Viral", "BeautyTok", "TeethWhitening"]
  },
  {
    id: 2,
    name: "OEAK Women Jelly Bras Wirefree Full Coverage Comfortable Wireless Padded Bra",
    description: "No Underwire Everyday Bras - Soft and Breathable",
    price: 19.99,
    originalPrice: 35.99,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
    category: "Womenswear & Underwear",
    supplier: {
      name: "OEAK Apparel",
      logo: "https://ui-avatars.com/api/?name=OEAK&background=EC4899&color=fff",
      country: "🇺🇸 United States",
      rating: 4.6
    },
    tiktokMetrics: {
      views: 22500000,
      likes: 2100000,
      shares: 180000,
      comments: 92000,
      salesVolume: 747300,
      conversionRate: 10.8,
      trendingScore: 92
    },
    salesData: {
      dailySales: 4900,
      totalSales: 747300,
      gmv: 99200,
      totalGmv: 6200000,
      growthRate: 26.74
    },
    moq: 50,
    commission: 10,
    launchDate: "2024-06-20",
    tags: ["Fashion", "Comfort", "Bestseller"]
  },
  {
    id: 3,
    name: "Loaded Tea Single Packet - 32oz Caffeinated Flavored Hydration Powder Mix",
    description: "Made in USA - Easy to Mix - Energy Boost",
    price: 2.25,
    originalPrice: 3.99,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
    category: "Health & Wellness",
    supplier: {
      name: "Caffeine, Candles & Chaos",
      logo: "https://ui-avatars.com/api/?name=CCC&background=F59E0B&color=fff",
      country: "🇺🇸 United States",
      rating: 4.9
    },
    tiktokMetrics: {
      views: 45000000,
      likes: 5200000,
      shares: 420000,
      comments: 185000,
      salesVolume: 3400000,
      conversionRate: 14.2,
      trendingScore: 98
    },
    salesData: {
      dailySales: 3500,
      totalSales: 3400000,
      gmv: 7900,
      totalGmv: 2100000,
      growthRate: 51.38
    },
    moq: 500,
    commission: 14,
    launchDate: "2024-03-10",
    tags: ["Energy", "Hydration", "Viral"]
  },
  {
    id: 4,
    name: "Toplux Magnesium Complex 8 Essential Magnesium Supplement 1000mg",
    description: "Premium Quality - Supports Muscle & Nerve Function",
    price: 14.97,
    originalPrice: 24.97,
    image: "https://images.unsplash.com/photo-1550572017-4a6c5d6e04d6?w=800",
    category: "Health",
    supplier: {
      name: "Toplux Nutrition",
      logo: "https://ui-avatars.com/api/?name=Toplux&background=10B981&color=fff",
      country: "🇺🇸 United States",
      rating: 4.7
    },
    tiktokMetrics: {
      views: 38000000,
      likes: 3800000,
      shares: 280000,
      comments: 125000,
      salesVolume: 1600000,
      conversionRate: 11.5,
      trendingScore: 88
    },
    salesData: {
      dailySales: 3500,
      totalSales: 1600000,
      gmv: 53100,
      totalGmv: 24100000,
      growthRate: -3.66
    },
    moq: 200,
    commission: 30,
    launchDate: "2024-05-01",
    tags: ["Health", "Supplement", "Wellness"]
  },
  {
    id: 5,
    name: "NeoCell Collagen Bio-Peptides Powder 20oz - Grassfed Protein Supplement",
    description: "Advanced with 18 Essential Amino Acids - Anti-Aging",
    price: 29.99,
    originalPrice: 44.99,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
    category: "Beauty Supplement",
    supplier: {
      name: "NeoCell Collagen",
      logo: "https://ui-avatars.com/api/?name=NeoCell&background=3B82F6&color=fff",
      country: "🇺🇸 United States",
      rating: 4.8
    },
    tiktokMetrics: {
      views: 28000000,
      likes: 2900000,
      shares: 195000,
      comments: 98000,
      salesVolume: 512800,
      conversionRate: 13.2,
      trendingScore: 85
    },
    salesData: {
      dailySales: 3100,
      totalSales: 512800,
      gmv: 93400,
      totalGmv: 12200000,
      growthRate: 2.0
    },
    moq: 100,
    commission: 23,
    launchDate: "2024-04-15",
    tags: ["Collagen", "AntiAging", "Beauty"]
  },
  {
    id: 6,
    name: "GOPURE Neck Cream Tighten & Lift Firming Cream for Crepey Skin",
    description: "Advanced Formula - Visible Results in 4 Weeks",
    price: 20.57,
    originalPrice: 39.99,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
    category: "Skincare",
    supplier: {
      name: "Gopure Beauty",
      logo: "https://ui-avatars.com/api/?name=Gopure&background=EF4444&color=fff",
      country: "🇺🇸 United States",
      rating: 4.5
    },
    tiktokMetrics: {
      views: 32000000,
      likes: 3200000,
      shares: 210000,
      comments: 105000,
      salesVolume: 1100000,
      conversionRate: 10.5,
      trendingScore: 90
    },
    salesData: {
      dailySales: 2900,
      totalSales: 1100000,
      gmv: 61500,
      totalGmv: 24900000,
      growthRate: 51.14
    },
    moq: 150,
    commission: 20,
    launchDate: "2024-07-01",
    tags: ["Skincare", "AntiAging", "NeckCare"]
  },
  {
    id: 7,
    name: "MISSHA M Perfect Cover BB Cream SPF 42 PA+++ (50ml)",
    description: "Korean Beauty - Flawless Coverage - Sun Protection",
    price: 12.89,
    originalPrice: 22.00,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800",
    category: "Beauty & Personal Care",
    supplier: {
      name: "MISSHA Official",
      logo: "https://ui-avatars.com/api/?name=MISSHA&background=EC4899&color=fff",
      country: "🇰🇷 South Korea",
      rating: 4.9
    },
    tiktokMetrics: {
      views: 25000000,
      likes: 2400000,
      shares: 165000,
      comments: 82000,
      salesVolume: 888500,
      conversionRate: 9.8,
      trendingScore: 82
    },
    salesData: {
      dailySales: 2900,
      totalSales: 888500,
      gmv: 37300,
      totalGmv: 8300000,
      growthRate: -8.51
    },
    moq: 100,
    commission: 10,
    launchDate: "2024-02-20",
    tags: ["KBeauty", "BBCream", "SPF"]
  },
  {
    id: 8,
    name: "1080P Wireless Video Doorbell Camera - Smart AI Human Detection",
    description: "FHD Live View - Cloud Storage - Night Vision - Two Way Audio",
    price: 13.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    category: "Smart Home",
    supplier: {
      name: "HotFun Tech",
      logo: "https://ui-avatars.com/api/?name=HotFun&background=6366F1&color=fff",
      country: "🇨🇳 China",
      rating: 4.4
    },
    tiktokMetrics: {
      views: 18000000,
      likes: 1500000,
      shares: 95000,
      comments: 52000,
      salesVolume: 27800,
      conversionRate: 15.8,
      trendingScore: 78
    },
    salesData: {
      dailySales: 2300,
      totalSales: 27800,
      gmv: 33900,
      totalGmv: 255100,
      growthRate: 42.16
    },
    moq: 50,
    commission: 10,
    launchDate: "2024-09-05",
    tags: ["SmartHome", "Security", "Tech"]
  },
  {
    id: 9,
    name: "Ice Roller for Face & Eye - Skin Care Massager Tool",
    description: "Reduces Puffiness - Tightens Pores - Cooling Relief",
    price: 8.99,
    originalPrice: 16.99,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800",
    category: "Beauty Tools",
    supplier: {
      name: "Beauty Essentials",
      logo: "https://ui-avatars.com/api/?name=BE&background=F472B6&color=fff",
      country: "🇺🇸 United States",
      rating: 4.6
    },
    tiktokMetrics: {
      views: 42000000,
      likes: 4500000,
      shares: 350000,
      comments: 165000,
      salesVolume: 1250000,
      conversionRate: 11.2,
      trendingScore: 94
    },
    salesData: {
      dailySales: 5200,
      totalSales: 1250000,
      gmv: 46800,
      totalGmv: 11200000,
      growthRate: 38.5
    },
    moq: 200,
    commission: 18,
    launchDate: "2024-06-10",
    tags: ["BeautyTool", "Skincare", "Viral"]
  },
  {
    id: 10,
    name: "Portable Blender for Shakes and Smoothies - USB Rechargeable",
    description: "Mini Personal Size - 6 Blades - BPA Free - 380ml",
    price: 16.99,
    originalPrice: 32.99,
    image: "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800",
    category: "Kitchen & Dining",
    supplier: {
      name: "Kitchen Innovations",
      logo: "https://ui-avatars.com/api/?name=KI&background=14B8A6&color=fff",
      country: "🇨🇳 China",
      rating: 4.7
    },
    tiktokMetrics: {
      views: 35000000,
      likes: 3200000,
      shares: 245000,
      comments: 118000,
      salesVolume: 890000,
      conversionRate: 13.5,
      trendingScore: 87
    },
    salesData: {
      dailySales: 4100,
      totalSales: 890000,
      gmv: 69700,
      totalGmv: 15100000,
      growthRate: 22.8
    },
    moq: 100,
    commission: 25,
    launchDate: "2024-05-20",
    tags: ["Kitchen", "Healthy", "Portable"]
  },
  {
    id: 11,
    name: "LED Strip Lights 50ft - RGB Color Changing with Remote Control",
    description: "Music Sync - App Control - DIY Mode - Room Decor",
    price: 18.99,
    originalPrice: 39.99,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    category: "Home Decor",
    supplier: {
      name: "Lumina Lights",
      logo: "https://ui-avatars.com/api/?name=Lumina&background=A855F7&color=fff",
      country: "🇨🇳 China",
      rating: 4.5
    },
    tiktokMetrics: {
      views: 52000000,
      likes: 5800000,
      shares: 480000,
      comments: 225000,
      salesVolume: 1850000,
      conversionRate: 12.8,
      trendingScore: 96
    },
    salesData: {
      dailySales: 6200,
      totalSales: 1850000,
      gmv: 117800,
      totalGmv: 35100000,
      growthRate: 45.2
    },
    moq: 100,
    commission: 22,
    launchDate: "2024-04-01",
    tags: ["LEDLights", "RoomDecor", "Viral"]
  },
  {
    id: 12,
    name: "Silicone Body Scrubber - Exfoliating Shower Brush",
    description: "Deep Cleansing - Massage - Improves Circulation",
    price: 6.99,
    originalPrice: 12.99,
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800",
    category: "Bath & Body",
    supplier: {
      name: "Pure Body Care",
      logo: "https://ui-avatars.com/api/?name=PBC&background=06B6D4&color=fff",
      country: "🇺🇸 United States",
      rating: 4.8
    },
    tiktokMetrics: {
      views: 38000000,
      likes: 3900000,
      shares: 295000,
      comments: 142000,
      salesVolume: 1420000,
      conversionRate: 10.5,
      trendingScore: 91
    },
    salesData: {
      dailySales: 5800,
      totalSales: 1420000,
      gmv: 40500,
      totalGmv: 9900000,
      growthRate: 31.5
    },
    moq: 300,
    commission: 16,
    launchDate: "2024-07-15",
    tags: ["Bath", "Exfoliating", "SelfCare"]
  }
];
