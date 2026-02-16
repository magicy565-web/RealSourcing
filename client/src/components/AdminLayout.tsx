import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Package, 
  Factory as FactoryIcon, 
  Video, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { colors, borderRadius } from '../lib/design-system';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FactoryIcon, label: 'Factories', path: '/admin/factories' },
  { icon: Video, label: 'Webinars', path: '/admin/webinars' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location === '/admin';
    }
    return location.startsWith(path);
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* 侧边栏 */}
      <aside
        className="w-64 border-r flex flex-col"
        style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.purple[700],
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: colors.purple[700] }}>
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Admin Panel
          </h1>
          <p style={{ color: colors.text.secondary }} className="text-sm mt-1">
            RealSourcing
          </p>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: active ? colors.purple[600] : 'transparent',
                  color: active ? '#FFFFFF' : colors.text.secondary,
                }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 底部用户信息 */}
        <div className="p-4 border-t" style={{ borderColor: colors.purple[700] }}>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: colors.background.card }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: colors.purple[600],
                color: '#FFFFFF',
              }}
            >
              A
            </div>
            <div className="flex-1">
              <p style={{ color: colors.text.primary }} className="font-medium text-sm">
                Admin User
              </p>
              <p style={{ color: colors.text.secondary }} className="text-xs">
                admin@realsourcing.com
              </p>
            </div>
          </div>

          <button
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${colors.purple[500]}`,
              color: colors.purple[500],
            }}
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
