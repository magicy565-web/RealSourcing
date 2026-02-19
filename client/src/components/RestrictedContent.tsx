import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Shield, Lock, LogIn } from "lucide-react";
import { cn } from "../lib/utils";

export type UserRole = "guest" | "buyer" | "verified_buyer";

interface RestrictedContentProps {
  requiredRole: UserRole;
  currentRole: UserRole;
  children: ReactNode;
  blurContent?: boolean;
  showOverlay?: boolean;
  customMessage?: string;
  onAction?: () => void;
}

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  buyer: 1,
  verified_buyer: 2
};

const hasPermission = (requiredRole: UserRole, currentRole: UserRole): boolean => {
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
};

const getRestrictionMessage = (requiredRole: UserRole, currentRole: UserRole) => {
  if (currentRole === "guest") {
    return {
      icon: LogIn,
      title: "Login Required",
      description: "Please login to access this content",
      actionText: "Login / Register"
    };
  }
  
  if (requiredRole === "verified_buyer") {
    return {
      icon: Shield,
      title: "Verified Buyer Only",
      description: "This content is restricted to verified buyers. Apply for verification to access detailed factory data.",
      actionText: "Apply for Verification"
    };
  }
  
  return {
    icon: Lock,
    title: "Access Restricted",
    description: "You don't have permission to view this content",
    actionText: "Learn More"
  };
};

export default function RestrictedContent({
  requiredRole,
  currentRole,
  children,
  blurContent = true,
  showOverlay = true,
  customMessage,
  onAction
}: RestrictedContentProps) {
  const permitted = hasPermission(requiredRole, currentRole);
  
  if (permitted) {
    return <>{children}</>;
  }
  
  const message = getRestrictionMessage(requiredRole, currentRole);
  const Icon = message.icon;
  
  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className={cn(blurContent && "blur-md pointer-events-none select-none")}>
        {children}
      </div>
      
      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{customMessage || message.title}</h3>
              <p className="text-sm text-muted-foreground">{message.description}</p>
            </div>
            {onAction && (
              <Button onClick={onAction} size="lg">
                {message.actionText}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export helper function for use in other components
export { hasPermission };
