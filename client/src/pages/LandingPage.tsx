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
      icon: <Video size={32} />,
      title: 'Live Video Negotiations',
      description: 'Real-time face-to-face meetings with factory representatives through our integrated video platform.',
    },
    {
      icon: <Brain size={32} />,
      title: 'AI-Powered Analytics',
      description: 'Get instant insights on pricing, quality, and delivery timelines with our advanced AI engine.',
    },
    {
      icon: <Shield size={32} />,
      title: 'Factory Verification',
      description: 'Access verified certifications, compliance records, and authentic reviews from other buyers.',
    },
    {
      icon: <DollarSign size={32} />,
      title: 'Transparent Pricing',
      description: 'Compare quotes side-by-side with AI-generated recommendations for the best value.',
    },
    {
      icon: <Package size={32} />,
      title: 'Order Tracking',
      description: 'Monitor production status and logistics in real-time from order to delivery.',
    },
    {
      icon: <Lock size={32} />,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/50 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Factory className="text-cyan-400" size={32} />
              <span className="text-2xl font-bold">RealSourcing</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <a className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                  Sign In
                </a>
              </Link>
              <Link href="/signin">
                <a className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-all hover:scale-105 flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Connect with Verified Factories,
            <br />
            Close Deals Faster
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            RealSourcing combines live video negotiations, AI-powered insights, 
            and transparent factory verification to transform B2B sourcing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signin">
              <a className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-lg font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <span>Start Free Trial</span>
                <ArrowRight size={20} />
              </a>
            </Link>
            <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-lg text-lg font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2">
              <Play size={20} />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* 3D Product Showcase */}
          <Product3DShowcase
            imageSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop"
            alt="RealSourcing Dashboard"
            floatingCards={[
              {
                title: 'Verified Factories',
                value: '500+',
                icon: <Factory size={24} />,
                position: { top: '20%', left: '5%' },
              },
              {
                title: 'Faster Negotiation',
                value: '95%',
                icon: <TrendingUp size={24} />,
                position: { top: '40%', right: '5%' },
              },
              {
                title: 'Avg. Close Time',
                value: '3 Days',
                icon: <Clock size={24} />,
                position: { bottom: '20%', left: '10%' },
              },
            ]}
          />
        </div>
      </section>

      {/* Logo Wall */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="container mx-auto">
          <p className="text-center text-gray-400 mb-8">Trusted by Leading Buyers Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['TechCorp', 'GlobalTrade', 'MegaMart', 'InnovateCo', 'SupplyChain Pro', 'BuyerHub'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-600">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Everything You Need to Source Smarter
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Streamline your procurement process with our comprehensive platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index}>
                <div className="text-cyan-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Transparent Pricing, No Hidden Fees
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Choose the plan that fits your business needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <GlassCard
                key={index}
                className={plan.popular ? 'border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)]' : ''}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle size={20} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signin">
                  <a className={`block w-full py-3 rounded-lg text-center font-semibold transition-all hover:scale-105 ${
                    plan.popular
                      ? 'bg-cyan-500 hover:bg-cyan-600'
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
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <GlassCard className="text-center max-w-4xl mx-auto" hover={false}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Transform Your Sourcing?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join 500+ companies already sourcing smarter with RealSourcing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin">
                <a className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-lg font-semibold transition-all hover:scale-105 flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight size={20} />
                </a>
              </Link>
              <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 rounded-lg text-lg font-semibold transition-all hover:scale-105">
                Schedule a Demo
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Factory className="text-cyan-400" size={28} />
                <span className="text-xl font-bold">RealSourcing</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transform your B2B sourcing with AI-powered insights and verified factory connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
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
