import { useEffect } from "react";
import { Badge } from "../components/ui/badge";
// import { trpc } from "../lib/trpc";

interface UnreadBadgeProps {
  userId: number;
  className?: string;
}

export default function UnreadBadge({ userId, className }: UnreadBadgeProps) {
  const { data: unreadData, refetch } = trpc.rtm.getUnreadCount.useQuery({ userId });

  // 每 5 秒刷新一次未读数
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const unreadCount = unreadData?.count || 0;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className={`absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs font-bold rounded-full ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}
