import { useState, useEffect, useRef } from 'react';
import {
  initRTMClient,
  loginRTM,
  sendPrivateMessage,
  addRTMEventListeners,
  destroyRTMClient,
  type RTMMessage,
} from '../lib/rtm';
import { trpc } from '../lib/trpc';

interface PrivateChatProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  appId: string;
  onClose?: () => void;
}

export default function PrivateChat({
  currentUserId,
  targetUserId,
  targetUserName,
  appId,
  onClose,
}: PrivateChatProps) {
  const [messages, setMessages] = useState<RTMMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const saveMessageMutation = trpc.rtm.saveMessage.useMutation();
  const markAsReadMutation = trpc.rtm.markAsRead.useMutation();
  
  // 加载历史消息
  const { data: historyMessages } = trpc.rtm.getPrivateMessages.useQuery({
    userId1: parseInt(currentUserId),
    userId2: parseInt(targetUserId),
    limit: 50,
  }, {
    enabled: !!currentUserId && !!targetUserId,
  });

  // 初始化 RTM 客户端
  useEffect(() => {
    const initRTM = async () => {
      try {
        setIsLoading(true);
        
        // 初始化客户端
        await initRTMClient(appId, currentUserId);
        
        // 登录
        await loginRTM();
        
        // 添加事件监听器
        addRTMEventListeners({
          onMessageReceived: (message) => {
            // 只接收来自目标用户的消息
            if (message.senderId === targetUserId) {
              setMessages((prev) => [...prev, message]);
            }
          },
          onConnectionStateChanged: (state, reason) => {
            console.log('RTM connection state changed:', state, reason);
            setIsConnected(state === 'CONNECTED');
          },
        });

        setIsConnected(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize RTM:', error);
        setIsLoading(false);
      }
    };

    initRTM();

    // 清理函数
    return () => {
      destroyRTMClient();
    };
  }, [appId, currentUserId, targetUserId]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载历史消息到状态
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const formattedMessages: RTMMessage[] = historyMessages.map((msg: any) => ({
        text: msg.content,
        senderId: msg.senderId.toString(),
        timestamp: new Date(msg.createdAt).getTime(),
        messageType: 'text',
      }));
      setMessages(formattedMessages);
    }
  }, [historyMessages]);

  // 标记消息为已读
  useEffect(() => {
    if (currentUserId && targetUserId) {
      markAsReadMutation.mutate({
        userId: parseInt(currentUserId),
        senderId: parseInt(targetUserId),
      });
    }
  }, [currentUserId, targetUserId]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      // 发送消息
      await sendPrivateMessage(targetUserId, inputMessage);

      // 添加到本地消息列表
      const newMessage: RTMMessage = {
        text: inputMessage,
        senderId: currentUserId,
        timestamp: Date.now(),
        messageType: 'text',
      };
      setMessages((prev) => [...prev, newMessage]);
      
      // 保存到数据库
      await saveMessageMutation.mutateAsync({
        senderId: parseInt(currentUserId),
        receiverId: parseInt(targetUserId),
        messageType: 'private',
        contentType: 'text',
        content: inputMessage,
      });

      // 清空输入框
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请重试');
    }
  };

  // 按 Enter 发送消息
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>正在连接聊天服务...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-sm font-bold">{targetUserName[0]}</span>
          </div>
          <div>
            <h3 className="font-semibold">{targetUserName}</h3>
            <p className="text-xs text-gray-400">
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  在线
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                  离线
                </span>
              )}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>还没有消息，开始聊天吧！</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            disabled={!isConnected}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-400 mt-2">连接已断开，请刷新页面重试</p>
        )}
      </div>
    </div>
  );
}
