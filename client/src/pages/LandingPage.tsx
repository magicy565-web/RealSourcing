import { Link } from 'wouter';
import { useState } from 'react';
import { Product3DShowcase } from '../components/Product3DShowcase';
import { GlassCard } from '../components/GlassCard';
import {
  Video,
  Brain,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Factory,
  Globe,
  Clock,
  DollarSign,
  Users,
  Target,
  Mail,
  Building,
  Award,
  Languages,
} from 'lucide-react';

export default function LandingPage() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const content = {
    zh: {
      nav: {
        features: '功能',
        pricing: '定价',
        cases: '案例',
        about: '关于',
        signin: '登录',
        getStarted: '立即开始',
      },
      hero: {
        title: '告别阿里国际站的红海竞争',
        subtitle: '直连海外真实买家',
        description: 'AI 智能匹配 + 视频实时谈判，让你的工厂订单翻倍',
        cta: '立即注册，免费试用 30 天',
        demo: '观看产品演示',
        stats: [
          { title: '已对接工厂', value: '500+', icon: <Factory size={20} /> },
          { title: '海外买家', value: '2,000+', icon: <Globe size={20} /> },
          { title: '平均成交周期', value: '18 天', icon: <Clock size={20} /> },
        ],
      },
      challenges: {
        title: '传统外贸获客的三大困境',
        items: [
          {
            icon: <DollarSign size={32} />,
            title: '红海竞争，获客成本越来越高',
            description: '阿里国际站上同类工厂数以万计，P4P 广告费用年年上涨，中小工厂难以获得曝光。',
          },
          {
            icon: <Mail size={32} />,
            title: '邮件开发回复率不到 5%',
            description: '海投邮件石沉大海，即使收到回复也需要数周时间，错失商机。',
          },
          {
            icon: <Building size={32} />,
            title: '展会成本高，转化率低',
            description: '广交会、行业展会投入巨大，但真实买家少，转化率不到 10%。',
          },
        ],
      },
      solutions: {
        title: 'RealSourcing 如何帮你突破困境',
        items: [
          {
            icon: <Brain size={32} />,
            title: 'AI 精准推荐海外买家',
            description: '根据你的产品品类、产能、价格区间，AI 自动匹配全球真实采购商，不再被动等待。',
            mockup: '/mockups/ai-matching.png',
          },
          {
            icon: <Video size={32} />,
            title: '面对面视频谈判，建立信任',
            description: '不再是冰冷的邮件往来，通过视频直接展示产品、工厂实力，快速建立信任，提高成交率。',
            mockup: '/mockups/video-negotiation.png',
          },
          {
            icon: <TrendingUp size={32} />,
            title: '全流程透明跟进',
            description: '每个商机状态一目了然，AI 提醒跟进时机，不错过任何一个潜在订单。',
            mockup: '/mockups/order-tracking.png',
          },
        ],
      },
      howItWorks: {
        title: '4 步开启海外订单',
        steps: [
          {
            number: '01',
            title: '注册并完善工厂信息',
            description: '上传产品目录、认证资质、产能信息',
          },
          {
            number: '02',
            title: 'AI 智能匹配买家',
            description: '系统自动推荐匹配度高的海外采购商',
          },
          {
            number: '03',
            title: '发起视频谈判邀请',
            description: '一键发送视频会议邀请，展示产品和工厂',
          },
          {
            number: '04',
            title: '达成交易并跟进订单',
            description: '在线签约、支付、物流跟踪，全流程透明',
          },
        ],
      },
      cases: {
        title: '真实工厂的成功故事',
        items: [
          {
            company: '顾家家居',
            location: '浙江',
            industry: '家具制造',
            results: [
              '3 个月对接 50+ 海外家具采购商',
              '新增订单金额：$2.1M',
              '平均响应时间：从 3 天降至 2 小时',
            ],
            testimonial: '通过 RealSourcing 的视频谈判功能，我们直接向美国买家展示了工厂的生产线和质量管控流程，成交率提升了 40%。不再需要在阿里国际站上和同行打价格战。',
            person: '张经理',
            role: '外贸部总监',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          },
          {
            company: '喜临门',
            location: '浙江',
            industry: '床垫制造',
            results: [
              '通过 AI 匹配，精准对接欧洲高端酒店采购商',
              '单笔订单金额：$800K',
              '成交周期：从 2 个月缩短至 18 天',
            ],
            testimonial: '以前在中国制造网上投放广告，询盘质量很差，大部分是中间商。RealSourcing 推荐的都是真实的终端买家，而且通过视频能直接判断对方的采购实力。',
            person: '李总',
            role: '国际业务部',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          },
        ],
      },
      comparison: {
        title: 'RealSourcing vs 传统 B2B 平台',
        headers: ['功能', 'RealSourcing', '阿里国际站', '中国制造网'],
        rows: [
          ['获客方式', 'AI 主动推荐精准买家', '被动展示，等待询盘', '被动展示，等待询盘'],
          ['沟通方式', '视频面对面谈判', '邮件/聊天工具', '邮件/聊天工具'],
          ['买家质量', '真实终端采购商', '混杂中间商', '混杂中间商'],
          ['成交周期', '平均 18 天', '1-3 个月', '1-3 个月'],
          ['年费', '¥9,999 起', '¥29,800 起', '¥19,800 起'],
          ['抽佣', '成交订单 2%', '无', '无'],
          ['竞争程度', '精准匹配，低竞争', '红海竞争', '中等竞争'],
        ],
      },
      pricing: {
        title: '灵活的定价方案，适合各类工厂',
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
              '专属客户经理',
              'AI 定制化训练',
              '无限买家推荐',
              '7x24 电话支持',
              'API 接口集成',
            ],
          },
        ],
      },
      cta: {
        title: '准备好开启海外订单了吗？',
        subtitle: '加入 500+ 中国工厂，用现代化方式开发海外客户',
        button: '立即注册，免费试用 30 天',
        demo: '预约产品演示',
      },
      footer: {
        product: {
          title: '产品',
          links: ['功能介绍', '定价方案', '成功案例'],
        },
        company: {
          title: '公司',
          links: ['关于我们', '联系我们', '加入我们'],
        },
        resources: {
          title: '资源',
          links: ['帮助中心', 'API 文档', '博客'],
        },
        legal: {
          title: '法律',
          links: ['隐私政策', '服务条款'],
        },
      },
    },
    en: {
      nav: {
        features: 'Features',
        pricing: 'Pricing',
        cases: 'Cases',
        about: 'About',
        signin: 'Sign In',
        getStarted: 'Get Started',
      },
      hero: {
        title: 'Beyond Alibaba:',
        subtitle: 'Connect Directly with Global Buyers',
        description: 'AI-Powered Matching + Live Video Negotiations to Double Your Orders',
        cta: 'Start Free 30-Day Trial',
        demo: 'Watch Product Demo',
        stats: [
          { title: 'Factories', value: '500+', icon: <Factory size={20} /> },
          { title: 'Global Buyers', value: '2,000+', icon: <Globe size={20} /> },
          { title: 'Avg. Deal Cycle', value: '18 Days', icon: <Clock size={20} /> },
        ],
      },
      challenges: {
        title: '3 Major Challenges in Traditional B2B Sourcing',
        items: [
          {
            icon: <DollarSign size={32} />,
            title: 'Fierce Competition, Rising Costs',
            description: 'Tens of thousands of similar factories on Alibaba.com, P4P ad costs increasing yearly, SMEs struggle for visibility.',
          },
          {
            icon: <Mail size={32} />,
            title: 'Email Response Rate Below 5%',
            description: 'Mass emails go unanswered, even replies take weeks, missing opportunities.',
          },
          {
            icon: <Building size={32} />,
            title: 'High Trade Show Costs, Low ROI',
            description: 'Canton Fair and industry expos require massive investment, but real buyers are scarce, conversion below 10%.',
          },
        ],
      },
      solutions: {
        title: 'How RealSourcing Helps You Break Through',
        items: [
          {
            icon: <Brain size={32} />,
            title: 'AI-Powered Buyer Matching',
            description: 'Based on your product category, capacity, and price range, AI automatically matches global real buyers. No more passive waiting.',
            mockup: '/mockups/ai-matching.png',
          },
          {
            icon: <Video size={32} />,
            title: 'Face-to-Face Video Negotiations',
            description: 'No more cold emails. Showcase products and factory capabilities via video, quickly build trust, increase conversion.',
            mockup: '/mockups/video-negotiation.png',
          },
          {
            icon: <TrendingUp size={32} />,
            title: 'End-to-End Transparent Tracking',
            description: 'Every opportunity status at a glance, AI reminds you of follow-up timing, never miss a potential order.',
            mockup: '/mockups/order-tracking.png',
          },
        ],
      },
      howItWorks: {
        title: '4 Steps to Global Orders',
        steps: [
          {
            number: '01',
            title: 'Register & Complete Profile',
            description: 'Upload product catalog, certifications, capacity info',
          },
          {
            number: '02',
            title: 'AI Matches Buyers',
            description: 'System automatically recommends high-match global buyers',
          },
          {
            number: '03',
            title: 'Initiate Video Negotiation',
            description: 'One-click video meeting invite, showcase products and factory',
          },
          {
            number: '04',
            title: 'Close Deal & Track Order',
            description: 'Online contract, payment, logistics tracking, fully transparent',
          },
        ],
      },
      cases: {
        title: 'Real Success Stories from Factories',
        items: [
          {
            company: 'KUKA Home',
            location: 'Zhejiang',
            industry: 'Furniture Manufacturing',
            results: [
              'Connected with 50+ overseas furniture buyers in 3 months',
              'New orders: $2.1M',
              'Avg. response time: From 3 days to 2 hours',
            ],
            testimonial: 'Through RealSourcing\'s video negotiation feature, we directly showcased our production line and quality control to US buyers. Conversion rate increased by 40%. No more price wars on Alibaba.',
            person: 'Manager Zhang',
            role: 'Foreign Trade Director',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          },
          {
            company: 'SLEEMON',
            location: 'Zhejiang',
            industry: 'Mattress Manufacturing',
            results: [
              'Precisely matched with European high-end hotel buyers via AI',
              'Single order: $800K',
              'Deal cycle: From 2 months to 18 days',
            ],
            testimonial: 'Previously on Made-in-China, inquiry quality was poor, mostly middlemen. RealSourcing recommends real end buyers, and video allows us to directly assess their purchasing power.',
            person: 'General Manager Li',
            role: 'International Business Dept.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          },
        ],
      },
      comparison: {
        title: 'RealSourcing vs Traditional B2B Platforms',
        headers: ['Feature', 'RealSourcing', 'Alibaba.com', 'Made-in-China'],
        rows: [
          ['Acquisition', 'AI Proactive Matching', 'Passive Showcase', 'Passive Showcase'],
          ['Communication', 'Video Face-to-Face', 'Email/Chat', 'Email/Chat'],
          ['Buyer Quality', 'Real End Buyers', 'Mixed Middlemen', 'Mixed Middlemen'],
          ['Deal Cycle', 'Avg. 18 Days', '1-3 Months', '1-3 Months'],
          ['Annual Fee', '$1,499+', '$4,499+', '$2,999+'],
          ['Commission', '2% on Deals', 'None', 'None'],
          ['Competition', 'Low (Precise Match)', 'High (Red Ocean)', 'Medium'],
        ],
      },
      pricing: {
        title: 'Flexible Pricing for All Factory Sizes',
        subtitle: 'SaaS Subscription + Commission Hybrid Model',
        plans: [
          {
            name: 'Starter',
            price: '$1,499',
            period: '/year',
            commission: '+ 3% commission',
            description: 'For Small Factories (10-50 employees)',
            features: [
              '10 video negotiations/month',
              'Basic AI matching',
              '5 buyer recommendations/month',
              'Email support',
            ],
          },
          {
            name: 'Professional',
            price: '$4,499',
            period: '/year',
            commission: '+ 2% commission',
            description: 'For Medium Factories (50-200 employees)',
            features: [
              'Unlimited video negotiations',
              'Advanced AI matching',
              '20 buyer recommendations/month',
              'Priority support',
              'Custom brand showcase',
            ],
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            commission: '+ 1.5% commission',
            description: 'For Large Factories/Industrial Parks',
            features: [
              'Dedicated account manager',
              'Custom AI training',
              'Unlimited buyer recommendations',
              '24/7 phone support',
              'API integration',
            ],
          },
        ],
      },
      cta: {
        title: 'Ready to Unlock Global Orders?',
        subtitle: 'Join 500+ Chinese factories using modern methods to acquire overseas clients',
        button: 'Start Free 30-Day Trial',
        demo: 'Schedule a Demo',
      },
      footer: {
        product: {
          title: 'Product',
          links: ['Features', 'Pricing', 'Success Stories'],
        },
        company: {
          title: 'Company',
          links: ['About Us', 'Contact', 'Careers'],
        },
        resources: {
          title: 'Resources',
          links: ['Help Center', 'API Docs', 'Blog'],
        },
        legal: {
          title: 'Legal',
          links: ['Privacy Policy', 'Terms of Service'],
        },
      },
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0a0a0f]/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Factory className="text-purple-400" size={32} />
              <span className="text-2xl font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>RealSourcing</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">{t.nav.features}</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm">{t.nav.pricing}</a>
              <a href="#cases" className="text-gray-300 hover:text-white transition-colors text-sm">{t.nav.cases}</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm">{t.nav.about}</a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors text-sm flex items-center space-x-1"
              >
                <Languages size={16} />
                <span>{lang === 'zh' ? 'EN' : '中'}</span>
              </button>
              <Link href="/signin">
                <a className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm">
                  {t.nav.signin}
                </a>
              </Link>
              <Link href="/signin">
                <a className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 flex items-center space-x-2 text-sm font-medium">
                  <span>{t.nav.getStarted}</span>
                  <ArrowRight size={16} />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-normal mb-6 text-white leading-tight">
            {t.hero.title}
            <br />
            {t.hero.subtitle}
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/signin">
              <a className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-base font-medium transition-all hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center space-x-2">
                <span>{t.hero.cta}</span>
                <ArrowRight size={18} />
              </a>
            </Link>
            <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-xl text-base font-medium transition-all hover:-translate-y-1 flex items-center justify-center space-x-2">
              <Play size={18} />
              <span>{t.hero.demo}</span>
            </button>
          </div>

          {/* 3D Product Showcase */}
          <Product3DShowcase
            imageSrc="/mockups/dashboard.png"
            alt="RealSourcing Dashboard"
            floatingCards={t.hero.stats.map((stat, index) => ({
              title: stat.title,
              value: stat.value,
              icon: stat.icon,
              position: index === 0 ? { top: '15%', left: '5%' } : index === 1 ? { top: '35%', right: '5%' } : { bottom: '15%', left: '8%' },
            }))}
          />
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-32 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-20">
            {t.challenges.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.challenges.items.map((item, index) => (
              <GlassCard key={index}>
                <div className="text-red-400 mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-20">
            {t.solutions.title}
          </h2>
          <div className="space-y-32">
            {t.solutions.items.map((item, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1">
                  <div className="text-purple-400 mb-6">{item.icon}</div>
                  <h3 className="text-3xl font-medium mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{item.description}</p>
                </div>
                <div className="flex-1">
                  <Product3DShowcase
                    imageSrc={item.mockup}
                    alt={item.title}
                    floatingCards={[]}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-20">
            {t.howItWorks.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-purple-500/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-medium mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                {index < t.howItWorks.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-purple-500/30">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-32 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-20">
            {t.cases.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.cases.items.map((item, index) => (
              <GlassCard key={index}>
                <div className="flex items-start space-x-4 mb-6">
                  <img src={item.avatar} alt={item.person} className="w-16 h-16 rounded-full" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{item.company}</h3>
                    <p className="text-sm text-gray-400">{item.location} · {item.industry}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">{lang === 'zh' ? '成果' : 'Results'}:</h4>
                  <ul className="space-y-2">
                    {item.results.map((result, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300 text-sm">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <blockquote className="border-l-2 border-purple-500 pl-4 mb-4">
                  <p className="text-gray-300 text-sm italic leading-relaxed">{item.testimonial}</p>
                </blockquote>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{item.person}</p>
                  <p className="text-gray-400 text-xs">{item.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-32 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-20">
            {t.comparison.title}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {t.comparison.headers.map((header, index) => (
                    <th key={index} className={`px-6 py-4 text-left text-sm font-semibold ${index === 0 ? 'text-gray-400' : index === 1 ? 'text-purple-400' : 'text-gray-500'}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.comparison.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-white/5">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={`px-6 py-4 text-sm ${cellIndex === 0 ? 'font-medium text-white' : cellIndex === 1 ? 'text-purple-300' : 'text-gray-400'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-gray-400 text-center mb-20 leading-relaxed">
            {t.pricing.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.pricing.plans.map((plan, index) => (
              <GlassCard
                key={index}
                className={plan.popular ? 'border-purple-500/50 shadow-[0_0_50px_rgba(139,92,246,0.3)]' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-semibold">
                    {lang === 'zh' ? '最受欢迎' : 'Most Popular'}
                  </div>
                )}
                <h3 className="text-xl font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{plan.name}</h3>
                <p className="text-gray-400 mb-6 text-sm">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-purple-400 text-xs mb-8">{plan.commission}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle size={18} className="text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signin">
                  <a className={`block w-full py-3 rounded-xl text-center font-medium transition-all hover:-translate-y-0.5 text-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)]'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}>
                    {lang === 'zh' ? '立即开始' : 'Get Started'}
                  </a>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center" hover={false}>
            <h2 className="text-4xl md:text-5xl font-normal mb-4">
              {t.cta.title}
            </h2>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin">
                <a className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-base font-medium transition-all hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center space-x-2">
                  <span>{t.cta.button}</span>
                  <ArrowRight size={18} />
                </a>
              </Link>
              <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-xl text-base font-medium transition-all hover:-translate-y-1">
                {t.cta.demo}
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.product.title}</h4>
              <ul className="space-y-2">
                {t.footer.product.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.company.title}</h4>
              <ul className="space-y-2">
                {t.footer.company.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.resources.title}</h4>
              <ul className="space-y-2">
                {t.footer.resources.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.legal.title}</h4>
              <ul className="space-y-2">
                {t.footer.legal.links.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Factory className="text-purple-400" size={24} />
              <span className="text-gray-400 text-sm">© 2026 RealSourcing. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
