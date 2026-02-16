import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'factory' | 'buyer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  factory_id?: number; // 如果是工厂角色，关联工厂 ID
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isFactory: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock 用户数据（用于开发测试）
const MOCK_USERS: Record<string, User> = {
  'admin@realsourcing.com': {
    id: '1',
    email: 'admin@realsourcing.com',
    name: 'Admin User',
    role: 'admin',
  },
  'factory@shenzhen.com': {
    id: '2',
    email: 'factory@shenzhen.com',
    name: 'Shenzhen Electronics',
    role: 'factory',
    factory_id: 1,
  },
  'buyer@tiktok.com': {
    id: '3',
    email: 'buyer@tiktok.com',
    name: 'TikTok Buyer',
    role: 'buyer',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 恢复用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: 实际的登录 API 调用
    // 这里使用 Mock 数据进行演示
    
    const mockUser = MOCK_USERS[email];
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isFactory: user?.role === 'factory',
    isBuyer: user?.role === 'buyer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
