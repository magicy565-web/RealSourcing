import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock, AlertCircle, User, Sparkles, Quote, Copy, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
  quotedMessage?: {
    id: string;
    content: string;
    sender: string;
  };
  attachments?: {
    type: "image" | "file" | "product";
    url: string;
    name: string;
  }[];
}

interface ChatMessageProps {
  message: Message;
  onQuote?: (message: Message) => void;
  showAvatar?: boolean;
  isTyping?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatMessage({
  message,
  onQuote,
  showAvatar = true,
  isTyping = false,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isAI = message.role === "ai";
  const isSystem = message.role === "system";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // System messages (centered, subtle)
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626] text-xs text-muted-foreground font-light">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={cn(
            "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
            isUser
              ? "bg-gradient-to-br from-violet-500 to-purple-600"
              : "bg-gradient-to-br from-gray-700 to-gray-800 border border-[#262626]"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Sparkles className="h-4 w-4 text-violet-300" />
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[70%]", isUser ? "items-end" : "items-start")}>
        {/* Quoted Message */}
        {message.quotedMessage && (
          <div
            className={cn(
              "mb-1.5 px-3 py-1.5 rounded-lg border-l-2 text-xs bg-[#0A0A0A]/50",
              isUser ? "border-violet-500" : "border-gray-600"
            )}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Quote className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">{message.quotedMessage.sender}</span>
            </div>
            <p className="text-white/60 line-clamp-2">{message.quotedMessage.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-4 py-2.5 rounded-2xl transition-all",
            isUser
              ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/20"
              : "bg-[#141414] text-white border border-[#262626] shadow-md",
            isTyping && "animate-pulse"
          )}
        >
          {/* Typing Indicator */}
          {isTyping ? (
            <div className="flex items-center gap-1 py-1">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <>
              {/* Message Content */}
              <p className="text-sm leading-relaxed font-light whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg overflow-hidden border",
                        isUser ? "border-white/20" : "border-[#262626]"
                      )}
                    >
                      {attachment.type === "image" ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full max-w-xs rounded-lg"
                        />
                      ) : attachment.type === "product" ? (
                        <div className="p-3 bg-black/20 flex items-center gap-3">
                          <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-xs font-medium">{attachment.name}</div>
                            <div className="text-[10px] text-white/60">Product Card</div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-black/20 flex items-center gap-2 text-xs">
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tail (speech bubble pointer) */}
          {!isTyping && (
            <div
              className={cn(
                "absolute top-3 w-0 h-0",
                isUser
                  ? "-right-1 border-l-8 border-l-purple-700 border-t-8 border-t-transparent border-b-8 border-b-transparent"
                  : "-left-1 border-r-8 border-r-[#141414] border-t-8 border-t-transparent border-b-8 border-b-transparent"
              )}
            />
          )}
        </div>

        {/* Metadata Row */}
        {!isTyping && (
          <div
            className={cn(
              "flex items-center gap-2 mt-1 px-1",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Timestamp */}
            <span className="text-[10px] text-muted-foreground font-light">
              {message.timestamp.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* Status Indicator (for user messages) */}
            {isUser && message.status && (
              <div className="flex items-center">
                {message.status === "sending" && <Clock className="h-3 w-3 text-muted-foreground" />}
                {message.status === "sent" && <Check className="h-3 w-3 text-muted-foreground" />}
                {message.status === "delivered" && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                {message.status === "read" && <CheckCheck className="h-3 w-3 text-violet-400" />}
                {message.status === "failed" && <AlertCircle className="h-3 w-3 text-red-400" />}
              </div>
            )}

            {/* Action Buttons (visible on hover) */}
            {showActions && (
              <div
                className={cn(
                  "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-white/5"
                  onClick={handleCopy}
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
                {onQuote && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5"
                    onClick={() => onQuote(message)}
                    title="Quote message"
                  >
                    <Quote className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-white/5"
                  title="More options"
                >
                  <MoreVertical className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Missing icons (add to imports if needed)
function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
