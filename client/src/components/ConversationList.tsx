import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Pin, BellOff, MoreVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  userId: number;
  onSelectConversation: (conversation: any) => void;
  selectedConversationId?: number;
}

export default function ConversationList({
  userId,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: conversations, isLoading, refetch } = trpc.rtm.getConversations.useQuery({ userId });
  const togglePinMutation = trpc.rtm.togglePin.useMutation();
  const toggleMuteMutation = trpc.rtm.toggleMute.useMutation();

  // 自动刷新会话列表（每 5 秒）
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleTogglePin = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinMutation.mutateAsync({ conversationId });
    refetch();
  };

  const handleToggleMute = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleMuteMutation.mutateAsync({ conversationId });
    refetch();
  };

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;
    const targetName = conv.targetUserId ? `User ${conv.targetUserId}` : conv.channelName;
    return targetName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          消息
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {!filteredConversations || filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">暂无会话</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const displayName = conversation.targetUserId 
                ? `User ${conversation.targetUserId}` 
                : conversation.channelName;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate flex items-center gap-2">
                        {displayName}
                        {conversation.isPinned === 1 && (
                          <Pin className="w-3 h-3 text-primary" />
                        )}
                        {conversation.isMuted === 1 && (
                          <BellOff className="w-3 h-3 text-muted-foreground" />
                        )}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessageAt 
                          ? new Date(conversation.lastMessageAt).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessageContent || "暂无消息"}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleTogglePin(conversation.id, e)}
                    >
                      <Pin className={cn("w-3 h-3", conversation.isPinned === 1 && "fill-current")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleToggleMute(conversation.id, e)}
                    >
                      <BellOff className={cn("w-3 h-3", conversation.isMuted === 1 && "fill-current")} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
