import { useState } from "react";
import { Button } from "../../../src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../src/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import PrivateChat from "./PrivateChat";

interface QuickChatButtonProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  appId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function QuickChatButton({
  currentUserId,
  targetUserId,
  targetUserName,
  appId,
  variant = "outline",
  size = "sm",
}: QuickChatButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">私聊</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl h-[600px] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>与 {targetUserName} 私聊</DialogTitle>
          </DialogHeader>
          <PrivateChat
            currentUserId={currentUserId}
            targetUserId={targetUserId}
            targetUserName={targetUserName}
            appId={appId}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
