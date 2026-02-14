import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Video, 
  Users, 
  LineChart, 
  CheckCircle2, 
  Menu, 
  X, 
  Play,
  BarChart3,
  Search,
  MessageSquare,
  Lock,
  Brain,
  TrendingUp,
  DollarSign,
  Mail,
  Building,
  Factory,
  Clock
} from 'lucide-react';
import { Product3DShowcase } from '../components/Product3DShowcase';
import { GlassCard } from '../components/GlassCard';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const content = {
    zh: {
      nav: {
        features: '功能',
        pricing: '定价',
        cases: '案例',
        about: '关于',
        login: '登录',
        getStarted: '立即开始'
      },
      hero: {
        badge: 'AI 驱动的外贸新范式',
        title: '告别阿里国际站的红海竞争',
        subtitle: '直连海外真实买家',
        description: 'AI 智能匹配 + 视频实时谈判，让你的工厂订单翻倍',
        cta: '立即注册，免费试用 30 天',
        demo: '观看产品演示'
      },
      solutions: {
        title: 'RealSourcing 如何帮你突破困境',
        items: [
          {
            title: 'AI 精准推荐海外买家',
            description: '根据你的产品品类、产能、价格区间，AI 自动匹配全球真实采购商，不再被动等待。',
            mockup: '/mockups/factories_3d_art.png',
          },
          {
            title: '面对面视频谈判，建立信任',
            description: '不再是冰冷的邮件往来，通过视频直接展示产品、工厂实力，快速建立信任，提高成交率。',
            mockup: '/mockups/webinars_3d_art.png',
          },
          {
            title: '全流程透明跟进',
            description: '每个商机状态一目了然，AI 提醒跟进时机，不错过任何一个潜在订单。',
            mockup: '/mockups/dashboard_3d_art.png',
          },
        ],
      },
      features: {
        title: '为什么选择 RealSourcing',
        subtitle: '一站式解决外贸获客的所有痛点',
        list: [
          {
            title: 'AI 精准匹配',
            description: '根据你的产品品类、产能、价格区间，AI 自动匹配全球真实采购商。',
            icon: <Search className="w-6 h-6 text-purple-400" />
          },
          {
            title: '视频实时谈判',
            description: '内置实时翻译功能，与买家面对面确认细节，将成交周期从数月缩短至数周。',
            icon: <Video className="w-6 h-6 text-blue-400" />
          },
          {
            title: '买家信用验证',
            description: '获取买家的真实身份、交易历史、信用评分，降低交易风险。',
            icon: <ShieldCheck className="w-6 h-6 text-green-400" />
          },
          {
            title: '透明化定价',
            description: '所有费用清晰透明，按询盘数量或成交订单抽佣，没有隐性收费。',
            icon: <Zap className="w-6 h-6 text-yellow-400" />
          },
          {
            title: '订单全流程跟踪',
            description: '从询盘到成交，实时跟进每个商机的进展，数据可视化管理。',
            icon: <BarChart3 className="w-6 h-6 text-pink-400" />
          },
          {
            title: '安全支付保障',
            description: '集成支付网关，提供担保交易保护，确保资金安全。',
            icon: <Lock className="w-6 h-6 text-indigo-400" />
          }
        ]
      },
      pricing: {
        title: '灵活的定价方案',
        subtitle: 'SaaS 会员 + 成交抽佣混合模式',
        plans: [
          {
            name: '基础版',
            price: '¥9,999',
            period: '/年',
            commission: '+ 3% 抽佣',
            description: '适合小型工厂（10-50 人）',
            features: [
              '10 个视频谈判名额/月',
              'AI 基础匹配',
              '5 个买家推荐/月',
              '邮件支持',
            ],
          },
          {
            name: '专业版',
            price: '¥29,999',
            period: '/年',
            commission: '+ 2% 抽佣',
            description: '适合中型工厂（50-200 人）',
            features: [
              '无限视频谈判',
              'AI 高级匹配',
              '20 个买家推荐/月',
              '优先客服支持',
              '自定义品牌展示',
            ],
            popular: true,
          },
          {
            name: '企业版',
            price: '定制',
            period: '',
            commission: '+ 1.5% 抽佣',
            description: '适合大型工厂/产业园区',
            features: [
              '无限视频谈判',
              'AI 深度定制',
              '无限买家推荐',
              '专属客户经理',
              '私有化部署选项',
            ],
          },
        ],
      }
    },
    en: {
      nav: {
        features: 'Features',
        pricing: 'Pricing',
        cases: 'Cases',
        about: 'About',
        login: 'Login',
        getStarted: 'Get Started'
      },
      hero: {
        badge: 'AI-Powered Sourcing Revolution',
        title: 'Beyond Alibaba Red Ocean',
        subtitle: 'Connect with Real Global Buyers',
        description: 'AI Smart Matching + Live Video Negotiation = Double Your Orders',
        cta: 'Start Free 30-Day Trial',
        demo: 'Watch Demo'
      },
      solutions: {
        title: 'How RealSourcing Breaks Through',
        items: [
          {
            title: 'AI-Powered Buyer Recommendations',
            description: 'Automatically match with real global buyers based on your product category, capacity, and price range.',
            mockup: '/mockups/factories_3d_art.png',
          },
          {
            title: 'Face-to-Face Video Negotiation',
            description: 'No more cold emails. Showcase your products and factory directly via video to build trust and close deals faster.',
            mockup: '/mockups/webinars_3d_art.png',
          },
          {
            title: 'Full Transparency & Tracking',
            description: 'Monitor every opportunity at a glance. AI reminds you when to follow up, so you never miss a potential order.',
            mockup: '/mockups/dashboard_3d_art.png',
          },
        ],
      },
      features: {
        title: 'Why RealSourcing',
        subtitle: 'The all-in-one solution for modern global trade',
        list: [
          {
            title: 'AI Smart Matching',
            description: 'Automatically match with real buyers based on your product category, capacity, and price.',
            icon: <Search className="w-6 h-6 text-purple-400" />
          },
          {
            title: 'Live Video Negotiation',
            description: 'Built-in real-time translation to confirm details face-to-face, cutting cycles from months to weeks.',
            icon: <Video className="w-6 h-6 text-blue-400" />
          },
          {
            title: 'Buyer Verification',
            description: 'Access buyer identity, transaction history, and credit scores to minimize risks.',
            icon: <ShieldCheck className="w-6 h-6 text-green-400" />
          },
          {
            title: 'Transparent Pricing',
            description: 'Clear fees with no hidden costs. Pay per inquiry or commission per successful order.',
            icon: <Zap className="w-6 h-6 text-yellow-400" />
          },
          {
            title: 'Full Order Tracking',
            description: 'Track every opportunity from inquiry to closing with visual data management.',
            icon: <BarChart3 className="w-6 h-6 text-pink-400" />
          },
          {
            title: 'Secure Payment',
            description: 'Integrated payment gateways with escrow protection to ensure fund safety.',
            icon: <Lock className="w-6 h-6 text-indigo-400" />
          }
        ]
      },
      pricing: {
        title: 'Flexible Pricing',
        subtitle: 'SaaS Subscription + Transaction Commission',
        plans: [
          {
            name: 'Starter',
            price: '$1,399',
            period: '/year',
            commission: '+ 3% commission',
            description: 'For small factories (10-50 employees)',
            features: [
              '10 video negotiations/month',
              'Basic AI matching',
              '5 buyer recommendations/month',
              'Email support',
            ],
          },
          {
            name: 'Professional',
            price: '$4,299',
            period: '/year',
            commission: '+ 2% commission',
            description: 'For mid-sized factories (50-200 employees)',
            features: [
              'Unlimited video negotiations',
              'Advanced AI matching',
              '20 buyer recommendations/month',
              'Priority support',
              'Custom branding',
            ],
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            commission: '+ 1.5% commission',
            description: 'For large factories/industrial parks',
            features: [
              'Unlimited video negotiations',
              'Deep AI customization',
              'Unlimited buyer recommendations',
              'Dedicated account manager',
              'Private deployment option',
            ],
          },
        ],
      }
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white selection:bg-purple-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0c10]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              RealSourcing
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 text-sm font-medium text-white/60">
              <a href="#features" className="hover:text-white transition-colors">{t.nav.features}</a>
              <a href="#pricing" className="hover:text-white transition-colors">{t.nav.pricing}</a>
              <a href="#about" className="hover:text-white transition-colors">{t.nav.about}</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'zh' ? 'EN' : '中文'}
              </button>
              <Link href="/signin" className="text-sm font-medium hover:text-white transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/signin" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 group">
                {t.nav.getStarted}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-white/60" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full opacity-50"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full opacity-50"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-purple-400 mb-8 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              {t.hero.badge}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              {t.hero.title} <br />
              <span className="text-white/90">{t.hero.subtitle}</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-white/50 leading-relaxed mb-12">
              {t.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signin" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 group">
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full text-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                {t.hero.demo}
              </button>
            </div>
          </div>

          {/* Main Dashboard Mockup with 3D Effect */}
          <div className="relative">
            <div className="relative w-full max-w-5xl mx-auto">
              <img 
                src="/mockups/dashboard.png" 
                alt="RealSourcing Dashboard" 
                className="w-full rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10"
              />
              
              {/* Floating Stats */}
              <div className="absolute -top-10 -left-10 animate-float hidden lg:block">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Factory className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">已对接工厂</div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="absolute top-1/2 -right-12 -translate-y-1/2 animate-float-delayed hidden lg:block">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">2,000+</div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">海外买家</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <div className="absolute -bottom-10 left-1/4 animate-float hidden lg:block">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-lg font-bold italic">18 Days</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest">平均成交周期</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section with Mockups */}
      <section className="py-32 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">{t.solutions.title}</h2>
          </div>

          <div className="space-y-32">
            {t.solutions.items.map((solution, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
                <div className="flex-1">
                  <h3 className="text-3xl font-serif mb-6">{solution.title}</h3>
                  <p className="text-xl text-white/50 leading-relaxed">{solution.description}</p>
                </div>
                <div className="flex-1">
                  <img 
                    src={solution.mockup} 
                    alt={solution.title}
                    className="w-full rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/10 hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">{t.features.title}</h2>
            <p className="text-xl text-white/50">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.features.list.map((feature, idx) => (
              <GlassCard key={idx} className="p-10 group hover:border-purple-500/30 transition-all duration-500">
                <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-4">{t.pricing.title}</h2>
            <p className="text-xl text-white/50">{t.pricing.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.plans.map((plan, idx) => (
              <GlassCard key={idx} className={`p-10 text-left flex flex-col ${plan.popular ? 'border-purple-500/50 relative overflow-hidden' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500 text-[10px] font-bold rounded-full">最受欢迎</div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-white/40 mb-8">{plan.description}</p>
                <div className="text-4xl font-serif mb-2">{plan.price}<span className="text-lg text-white/40 font-sans">{plan.period}</span></div>
                <div className="text-sm text-white/30 mb-8">{plan.commission}</div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signin" className={`w-full py-4 rounded-xl text-center font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                  立即开启
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-10">准备好开启海外订单了吗？</h2>
          <p className="text-xl text-white/50 mb-12">加入 500+ 领先工厂，用最现代化的方式连接全球买家。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signin" className="px-10 py-5 bg-white text-black rounded-full text-lg font-bold hover:bg-white/90 transition-all">
              立即免费试用
            </Link>
            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
              了解更多
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold tracking-tight">RealSourcing</span>
            </div>
            <div className="flex items-center gap-10 text-sm font-medium text-white/40">
              <a href="#" className="hover:text-white transition-colors">功能</a>
              <a href="#" className="hover:text-white transition-colors">定价</a>
              <a href="#" className="hover:text-white transition-colors">关于</a>
              <a href="#" className="hover:text-white transition-colors">联系</a>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/40 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-xs text-white/20">
            © 2026 RealSourcing AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
