import { useState, useRef, useEffect } from "react";
import { cn } from "../../../src/lib/utils";
import { Send, Paperclip, Smile, X, Loader2 } from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import ChatMessage, { type Message } from "./ChatMessage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  className?: string;
  onSendMessage?: (content: string) => void;
  initialMessages?: Message[];
  placeholder?: string;
  showSmartReplies?: boolean;
  smartReplies?: string[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatWindow({
  className,
  onSendMessage,
  initialMessages = [],
  placeholder = "Type a message or AI command...",
  showSmartReplies = true,
  smartReplies = [],
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [quotedMessage, setQuotedMessage] = useState<Message | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      status: "sending",
      quotedMessage: quotedMessage
        ? {
            id: quotedMessage.id,
            content: quotedMessage.content,
            sender: quotedMessage.role === "ai" ? "AI Assistant" : "You",
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setQuotedMessage(null);
    setIsSending(true);

    // Simulate sending delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      setIsSending(false);

      // Trigger AI response
      simulateAIResponse(newMessage.content);
    }, 500);

    // Call parent callback
    onSendMessage?.(inputValue.trim());
  };

  // Simulate AI typing and response
  const simulateAIResponse = (userMessage: string) => {
    setIsAITyping(true);

    // Simulate thinking time
    setTimeout(() => {
      setIsAITyping(false);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: generateAIResponse(userMessage),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Mark user message as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.role === "user" && msg.status === "sent"
            ? { ...msg, status: "read" }
            : msg
        )
      );
    }, 1500);
  };

  // Simple AI response generator (replace with actual API call)
  const generateAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      return "Based on the current negotiation, the supplier has offered a unit price of $12.50 for orders above 1,000 units. Would you like me to analyze if this aligns with market rates?";
    }

    if (lowerMsg.includes("moq") || lowerMsg.includes("minimum")) {
      return "The supplier's MOQ is 500 units. This is competitive for this product category. I can help draft a counter-proposal if needed.";
    }

    if (lowerMsg.includes("quality") || lowerMsg.includes("certification")) {
      return "The factory holds ISO 9001:2015 and BSCI certifications. I've verified these credentials and they appear valid. Would you like me to request additional quality reports?";
    }

    if (lowerMsg.includes("delivery") || lowerMsg.includes("lead time")) {
      return "Standard lead time is 30-45 days after order confirmation. For urgent orders, they can offer a 20-day express option with a 15% surcharge.";
    }

    return "I'm analyzing your request. Based on the current session context, I recommend focusing on payment terms and quality assurance next. Would you like me to suggest specific questions?";
  };

  // Handle quote message
  const handleQuote = (message: Message) => {
    setQuotedMessage(message);
    inputRef.current?.focus();
  };

  // Handle smart reply click
  const handleSmartReply = (reply: string) => {
    setInputValue(reply);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#0F0F0F]", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">AI Assistant Ready</h3>
              <p className="text-xs text-muted-foreground font-light max-w-xs">
                Ask me anything about pricing, quality, lead times, or negotiation strategies.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onQuote={handleQuote}
                showAvatar={true}
              />
            ))}

            {/* AI Typing Indicator */}
            {isAITyping && (
              <ChatMessage
                message={{
                  id: "typing",
                  role: "ai",
                  content: "",
                  timestamp: new Date(),
                }}
                isTyping={true}
                showAvatar={true}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Smart Replies */}
      {showSmartReplies && smartReplies.length > 0 && !isAITyping && (
        <div className="px-4 py-2 border-t border-[#262626]/50 bg-[#0A0A0A]/50">
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide flex-shrink-0">
              Suggested:
            </span>
            {smartReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSmartReply(reply)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626] text-xs text-white hover:bg-[#1A1A1A] hover:border-violet-500/30 transition-all"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[#262626] bg-[#141414]">
        {/* Quoted Message Preview */}
        {quotedMessage && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#262626] flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-violet-400 uppercase tracking-wide mb-0.5">
                Replying to {quotedMessage.role === "ai" ? "AI Assistant" : "You"}
              </div>
              <p className="text-xs text-white/60 truncate">{quotedMessage.content}</p>
            </div>
            <button
              onClick={() => setQuotedMessage(null)}
              className="flex-shrink-0 ml-2 p-1 hover:bg-white/5 rounded transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-white hover:bg-white/5"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 pr-10 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm font-light text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              disabled={isSending}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 rounded transition-colors"
              title="Add emoji"
            >
              <Smile className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="h-9 w-9 flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/20 disabled:text-violet-400/40 transition-all"
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Hint Text */}
        <div className="mt-2 text-[10px] text-muted-foreground font-light">
          Press <kbd className="px-1 py-0.5 rounded bg-[#0A0A0A] border border-[#262626]">Enter</kbd> to send,{" "}
          <kbd className="px-1 py-0.5 rounded bg-[#0A0A0A] border border-[#262626]">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}

// Missing Sparkles icon
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
