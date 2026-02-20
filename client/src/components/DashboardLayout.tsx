import { useAuth } from "../_core/hooks/useAuth";
import { getLoginUrl } from "../const";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
// import { trpc } from "../lib/trpc"; // Removed: migrating to RESTful API
import {
  Home,
  Video,
  Building2,
  FileText,
  Settings,
  HelpCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Search,
  Command,
  Flag,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "../lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/home", icon: Home },
  { name: "Webinars", href: "/webinars", icon: Video },
  { name: "Factories", href: "/factories", icon: Building2 },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: FileText },
];

const secondaryNavigation = [
  { name: "Subscription", href: "/subscription-plans", icon: CreditCard },
  { name: "Quota Usage", href: "/quota", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  // const logout = trpc.auth.logout.useMutation(); // Removed: migrating to RESTful API
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Demo mode: Force authenticated state
  const isAuthenticated = true;
  const demoUser = {
    name: "Magic User",
    email: "magic@gmail.com",
    role: "Admin"
  };

  const handleLogout = async () => {
    // TODO: Implement RESTful logout
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Skip redirect in demo mode
  // if (!isAuthenticated) { ... }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-foreground font-sans selection:bg-violet-500/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-[#262626] bg-[#0F0F0F] transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo & Collapse Button */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#262626]">
          {!collapsed && (
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="bg-violet-600 p-1.5 rounded shadow-lg shadow-violet-900/20">
                  <Flag className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-light tracking-tight text-white group-hover:text-violet-400 transition-colors">
                  RealSourcing
                </span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-muted-foreground hover:text-white hover:bg-white/5", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search & Command */}
        <div className="p-3">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-muted-foreground border-[#262626] bg-white/5 hover:bg-white/10 hover:text-white transition-all",
              collapsed && "justify-center px-2"
            )}
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
          >
            <Search className="h-4 w-4" />
            {!collapsed && <span className="ml-2 font-light">Search</span>}
            {!collapsed && (
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[#262626] bg-[#141414] px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start transition-all",
                      isActive 
                        ? "bg-violet-600/10 text-violet-400 border-l-2 border-violet-600 rounded-l-none" 
                        : "text-muted-foreground hover:text-white hover:bg-white/5",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive && "text-violet-400")} />
                    {!collapsed && <span className="ml-3 font-light tracking-tight">{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4 bg-[#262626]" />

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="ml-3 font-light tracking-tight">{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="border-t border-[#262626] p-3 bg-[#0F0F0F]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-white/5",
                  collapsed && "justify-center px-2"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-violet-600 text-white shadow-lg shadow-violet-900/20">
                  <User className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-light text-white leading-none mb-1">{user?.name || demoUser.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-light">
                      {user?.email || demoUser.email}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#141414] border-[#262626] text-white">
              <DropdownMenuLabel className="font-light">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-violet-400 cursor-pointer">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="font-light">Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-light">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0A0A0A]">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
