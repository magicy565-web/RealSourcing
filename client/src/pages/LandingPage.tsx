import { Link } from 'wouter';
import { Product3DShowcase } from '../components/Product3DShowcase';
import { GlassCard } from '../components/GlassCard';
import {
  Video,
  Brain,
  Shield,
  DollarSign,
  Package,
  Lock,
  CheckCircle,
  ArrowRight,
  Play,
  Factory,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Video size={28} />,
      title: 'Live Video Negotiations',
      description: 'Real-time face-to-face meetings with factory representatives through our integrated video platform.',
    },
    {
      icon: <Brain size={28} />,
      title: 'AI-Powered Analytics',
      description: 'Get instant insights on pricing, quality, and delivery timelines with our advanced AI engine.',
    },
    {
      icon: <Shield size={28} />,
      title: 'Factory Verification',
      description: 'Access verified certifications, compliance records, and authentic reviews from other buyers.',
    },
    {
      icon: <DollarSign size={28} />,
      title: 'Transparent Pricing',
      description: 'Compare quotes side-by-side with AI-generated recommendations for the best value.',
    },
    {
      icon: <Package size={28} />,
      title: 'Order Tracking',
      description: 'Monitor production status and logistics in real-time from order to delivery.',
    },
    {
      icon: <Lock size={28} />,
      title: 'Secure Payments',
      description: 'Integrated payment gateway with escrow protection for safe transactions.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        '10 video sessions',
        'Basic AI insights',
        '5 factory connections',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Most popular choice',
      features: [
        'Unlimited video sessions',
        'Advanced AI analytics',
        '50 factory connections',
        'Priority support',
        'Custom integrations',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Dedicated account manager',
        'Custom AI training',
        'Unlimited everything',
        '24/7 phone support',
        'SLA guarantee',
      ],
    },
  ];

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
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm">Testimonials</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm">About</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <a className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm">
                  Sign In
                </a>
              </Link>
              <Link href="/signin">
                <a className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 flex items-center space-x-2 text-sm font-medium">
                  <span>Get Started</span>
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
            Connect with Verified Factories,
            <br />
            Close Deals Faster
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            RealSourcing combines live video negotiations, AI-powered insights, 
            and transparent factory verification to transform B2B sourcing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/signin">
              <a className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-base font-medium transition-all hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight size={18} />
              </a>
            </Link>
            <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-xl text-base font-medium transition-all hover:-translate-y-1 flex items-center justify-center space-x-2">
              <Play size={18} />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* 3D Product Showcase */}
          <Product3DShowcase
            imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
            alt="RealSourcing Dashboard"
            floatingCards={[
              {
                title: 'Verified',
                value: '500+',
                icon: <Factory size={20} />,
                position: { top: '15%', left: '5%' },
              },
              {
                title: 'Success',
                value: '95%',
                icon: <TrendingUp size={20} />,
                position: { top: '35%', right: '5%' },
              },
              {
                title: 'Close Time',
                value: '3 Days',
                icon: <Clock size={20} />,
                position: { bottom: '15%', left: '8%' },
              },
            ]}
          />
        </div>
      </section>

      {/* Logo Wall */}
      <section className="py-20 px-8 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 mb-10 text-sm">Trusted by Leading Buyers Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-40">
            {['TechCorp', 'GlobalTrade', 'MegaMart', 'InnovateCo', 'SupplyChain Pro', 'BuyerHub'].map((company) => (
              <div key={company} className="text-xl font-semibold text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-4">
            Everything You Need to Source Smarter
          </h2>
          <p className="text-lg text-gray-400 text-center mb-20 leading-relaxed">
            Streamline your procurement process with our comprehensive platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={index}>
                <div className="text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-normal text-center mb-4">
            Transparent Pricing, No Hidden Fees
          </h2>
          <p className="text-lg text-gray-400 text-center mb-20 leading-relaxed">
            Choose the plan that fits your business needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <GlassCard
                key={index}
                className={plan.popular ? 'border-purple-500/50 shadow-[0_0_50px_rgba(139,92,246,0.3)]' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{plan.name}</h3>
                <p className="text-gray-400 mb-6 text-sm">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
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
                    Get Started
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
              Ready to Transform Your Sourcing?
            </h2>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              Join 500+ companies already sourcing smarter with RealSourcing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin">
                <a className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-base font-medium transition-all hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight size={18} />
                </a>
              </Link>
              <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-xl text-base font-medium transition-all hover:-translate-y-1">
                Schedule a Demo
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Factory className="text-purple-400" size={28} />
                <span className="text-lg font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>RealSourcing</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transform your B2B sourcing with AI-powered insights and verified factory connections.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 RealSourcing. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
