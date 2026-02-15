import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import ConversationList from "../components/ConversationList";
import PrivateChat from "../components/PrivateChat";
import { Card, CardContent } from "../components/ui/card";
import { MessageSquare } from "lucide-react";
import { trpc } from "../lib/trpc";

export default function Messages() {
  const { data: user } = trpc.auth.me.useQuery();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "your-agora-app-id";

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">请先登录</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] p-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* 左侧：会话列表 */}
          <div className="col-span-4 h-full">
            <ConversationList
              userId={user.id}
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* 右侧：聊天窗口 */}
          <div className="col-span-8 h-full">
            {selectedConversation ? (
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <PrivateChat
                    currentUserId={user.id.toString()}
                    targetUserId={selectedConversation.targetUserId?.toString() || ""}
                    targetUserName={`User ${selectedConversation.targetUserId}`}
                    appId={AGORA_APP_ID}
                    onClose={() => setSelectedConversation(null)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">选择一个会话开始聊天</p>
                  <p className="text-sm mt-2">从左侧列表中选择联系人或频道</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
