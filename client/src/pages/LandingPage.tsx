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
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Zap
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
        tag: "AI 智能匹配 + 视频实时谈判",
        title: '告别阿里国际站的红海竞争',
        subtitle: '直连海外真实买家',
        description: '不再是被动等待询盘。通过 AI 精准匹配全球采购商，用视频直播和 1 对 1 谈判直接锁定订单，让你的工厂业绩翻倍。',
        cta: '立即注册，免费试用 30 天',
        demo: '观看产品演示',
        stats: {
          factories: "已对接工厂",
          buyers: "海外买家",
          meetings: "视频谈判"
        }
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
            image: '/screenshots/factories_full.webp',
          },
          {
            icon: <Video size={32} />,
            title: '视频 Webinar 实时获客',
            description: '举办在线新品发布会或行业研讨会，一次性吸引数百名买家，实时互动建立信任。',
            image: '/screenshots/webinars_full.webp',
          },
          {
            icon: <TrendingUp size={32} />,
            title: '1 对 1 视频深度谈判',
            description: '内置实时翻译功能，与买家面对面确认细节，将成交周期从数月缩短至数周。',
            image: '/screenshots/real_dashboard_full.webp',
          },
        ],
      },
      cases: {
        title: '真实工厂的成功故事',
        items: [
          {
            company: '顾家家居 (KUKA)',
            quote: 'RealSourcing 的视频谈判功能帮我们解决了跨国沟通的信任难题，3 个月内我们成功对接了 50 多位高质量海外买家。',
            stat: '订单转化率提升 45%'
          },
          {
            company: '喜临门 (Sleemon)',
            quote: '不再需要漫长的邮件等待，AI 匹配非常精准。我们通过一场 Webinar 就拿到了 5 个欧洲客户的意向订单。',
            stat: '获客成本降低 60%'
          }
        ],
      },
      pricing: {
        title: '灵活的定价方案，适合各类工厂',
        subtitle: 'SaaS 会员 + 成交抽佣混合模式',
        plans: [
          {
            name: '标准版',
            price: '¥9,999',
            period: '/年',
            features: ["AI 智能匹配 (50次/月)", "基础视频谈判室", "标准询盘管理", "5GB 存储空间"]
          },
          {
            name: '专业版',
            price: '¥29,800',
            period: '/年',
            features: ["无限 AI 智能匹配", "高清视频 Webinar (不限次)", "高级商机管理系统", "成交订单抽佣 1.5%", "优先技术支持"],
            popular: true
          },
          {
            name: '企业版',
            price: '定制',
            period: '',
            features: ["私有化部署选项", "产业园区专属方案", "深度定制化 AI 模型", "成交订单抽佣 1.0%", "专属大客户经理"]
          }
        ],
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
        tag: "AI Matching + Video Negotiation",
        title: 'Beyond Alibaba Red Ocean',
        subtitle: 'Connect Directly with Global Buyers',
        description: 'Stop waiting for inquiries. Use AI to match with global buyers precisely, and lock in orders through live webinars and 1-on-1 video negotiations.',
        cta: 'Start Free 30-Day Trial',
        demo: 'Watch Product Demo',
        stats: {
          factories: "Factories",
          buyers: "Global Buyers",
          meetings: "Video Meetings"
        }
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
            title: 'AI Precision Matching',
            description: 'Proactively recommends the most compatible buyers based on your capacity and category.',
            image: '/screenshots/factories_full.webp',
          },
          {
            icon: <Video size={32} />,
            title: 'Video Webinar Acquisition',
            description: 'Host online product launches or seminars to attract hundreds of buyers at once with real-time interaction.',
            image: '/screenshots/webinars_full.webp',
          },
          {
            icon: <TrendingUp size={32} />,
            title: '1-on-1 Deep Negotiation',
            description: 'Built-in real-time translation. Confirm details face-to-face and shorten closing cycles from months to weeks.',
            image: '/screenshots/real_dashboard_full.webp',
          },
        ],
      },
      cases: {
        title: 'Success Stories',
        items: [
          {
            company: 'KUKA Home',
            quote: 'RealSourcing\'s video negotiation solved our trust issues. We connected with 50+ high-quality buyers in 3 months.',
            stat: '+45% Conversion Rate'
          },
          {
            company: 'Sleemon',
            quote: 'No more waiting for emails. AI matching is incredibly precise. We got 5 European orders from just one webinar.',
            stat: '-60% Acquisition Cost'
          }
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
            features: ["AI Matching (50/mo)", "Basic Video Rooms", "Standard CRM", "5GB Storage"]
          },
          {
            name: 'Professional',
            price: '$4,299',
            period: '/year',
            features: ["Unlimited AI Matching", "HD Video Webinars", "Advanced Pipeline Management", "1.5% Commission", "Priority Support"],
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            features: ["Private Deployment", "Industrial Park Solutions", "Custom AI Models", "1.0% Commission", "Dedicated Account Manager"]
          },
        ],
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
    <div className="min-h-screen bg-[#0A0C10] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight">RealSourcing</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t.nav.pricing}</a>
            <a href="#cases" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t.nav.cases}</a>
            <a href="#about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t.nav.about}</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <Link href="/signin" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{t.nav.signin}</Link>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
              {t.nav.getStarted}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" fill="currentColor" />
            {t.hero.tag}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-[1.1] tracking-tight">
            {t.hero.title} <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {t.hero.subtitle}
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-10 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3">
              {t.hero.cta}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3">
              <Play className="w-5 h-5 fill-white" />
              {t.hero.demo}
            </button>
          </div>

          {/* Main Product Showcase */}
          <div className="relative max-w-5xl mx-auto">
            <Product3DShowcase image="/screenshots/real_dashboard_full.webp" />
            
            {/* Floating Stats */}
            <div className="absolute -top-12 -left-12 hidden lg:block animate-float">
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t.hero.stats.factories}</div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="absolute -bottom-12 -right-12 hidden lg:block animate-float" style={{ animationDelay: '-2s' }}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold">2,000+</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t.hero.stats.buyers}</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-32 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-20">{t.challenges.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.challenges.items.map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-500">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <X className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions / Features with Real Screenshots */}
      <section id="features" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-24">{t.solutions.title}</h2>
          
          <div className="space-y-40">
            {t.solutions.items.map((item, i) => (
              <div key={i} className={`flex flex-col lg:flex-row items-center gap-20 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    {i === 0 ? <Zap className="w-8 h-8 text-blue-400" /> : i === 1 ? <Video className="w-8 h-8 text-blue-400" /> : <TrendingUp className="w-8 h-8 text-blue-400" />}
                  </div>
                  <h3 className="text-4xl font-serif">{item.title}</h3>
                  <p className="text-xl text-gray-400 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="relative rounded-[2rem] border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="cases" className="py-32 bg-blue-600/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-20">{t.cases.title}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {t.cases.items.map((item, i) => (
              <GlassCard key={i} className="p-10 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="w-32 h-32" />
                </div>
                <div className="text-blue-400 font-bold mb-4 tracking-widest uppercase text-sm">{item.company}</div>
                <p className="text-2xl font-serif mb-8 leading-relaxed italic">"{item.quote}"</p>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                  <BarChart3 className="w-6 h-6" />
                  {item.stat}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-20">{t.pricing.title}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.pricing.plans.map((item, i) => (
              <div key={i} className={`relative p-10 rounded-[2.5rem] border ${item.popular ? 'bg-blue-600/10 border-blue-500/30 shadow-2xl shadow-blue-500/10' : 'bg-white/[0.02] border-white/10'} flex flex-col`}>
                {item.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">{item.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{item.price}</span>
                    <span className="text-gray-400">{item.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-400 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-2xl font-bold transition-all ${item.popular ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                  {lang === 'zh' ? '立即开启' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 blur-[150px] rounded-full -translate-y-1/2" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-tight">
            {lang === 'zh' ? '准备好开启海外订单了吗？' : 'Ready to Grow Your Export Business?'}
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light">
            {lang === 'zh' ? '加入 500+ 领先工厂，用最现代化的方式连接全球买家。' : 'Join 500+ leading factories and connect with global buyers the modern way.'}
          </p>
          <button className="bg-white text-black hover:bg-gray-200 px-12 py-5 rounded-full text-xl font-bold transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto group">
            {lang === 'zh' ? '立即免费试用' : 'Start Your Free Trial'}
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold">RealSourcing</span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              {lang === 'zh' ? 'RealSourcing 是全球领先的 AI 驱动型外贸获客平台，通过视频谈判和智能匹配，帮助中国工厂高效对接全球买家。' : 'RealSourcing is the world\'s leading AI-powered export acquisition platform, helping factories connect with global buyers through video negotiation and smart matching.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t.footer.product.title}</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {t.footer.product.links.map((link, i) => (
                <li key={i}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">{t.footer.company.title}</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {t.footer.company.links.map((link, i) => (
                <li key={i}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs uppercase tracking-widest">
          <div>© 2026 RealSourcing. All rights reserved.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
