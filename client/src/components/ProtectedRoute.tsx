import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { colors } from '../lib/design-system';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // 加载中显示 loading
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background.primary }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.purple[600], borderTopColor: 'transparent' }}
          />
          <p style={{ color: colors.text.secondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  // 需要登录但未登录
  if (requireAuth && !user) {
    return <Redirect to="/login" />;
  }

  // 检查角色权限
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background.primary }}
      >
        <div
          className="max-w-md w-full p-8 rounded-lg text-center"
          style={{
            backgroundColor: colors.background.card,
            border: `1px solid ${colors.purple[700]}`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.accent.red + '20' }}
          >
            <span className="text-4xl">🚫</span>
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            Access Denied
          </h2>
          <p style={{ color: colors.text.secondary }} className="mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: colors.purple[600],
              color: '#FFFFFF',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
