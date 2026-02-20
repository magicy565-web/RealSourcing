import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trpc } from '../lib/trpc';

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
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isFactory: boolean;
  isBuyer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 tRPC 获取当前用户
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // 使用 tRPC 登录
  const loginMutation = trpc.auth.login.useMutation();
  // 使用 tRPC 登出
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data as any);
    }
    if (!meQuery.isLoading) {
      setIsLoading(false);
    }
  }, [meQuery.data, meQuery.isLoading]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.user) {
        setUser(result.user as any);
        return result.user as any;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
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
