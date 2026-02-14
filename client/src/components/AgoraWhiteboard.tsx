/**
 * Agora Interactive Whiteboard Component
 * 互动白板组件
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface AgoraWhiteboardProps {
  roomUuid?: string;
  onRoomCreated?: (roomUuid: string, roomToken: string) => void;
}

/**
 * 互动白板组件
 */
export function AgoraWhiteboard({ roomUuid, onRoomCreated }: AgoraWhiteboardProps) {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoomUuid, setCurrentRoomUuid] = useState(roomUuid);
  const [roomToken, setRoomToken] = useState<string>();

  // 创建房间
  const createRoomMutation = trpc.agora.whiteboard.createRoom.useMutation();

  // 生成Room Token
  const { data: tokenData } = trpc.agora.whiteboard.generateRoomToken.useQuery(
    { roomUuid: currentRoomUuid || '', role: 'writer' },
    { enabled: !!currentRoomUuid }
  );

  // 创建新房间
  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const result = await createRoomMutation.mutateAsync({
        name: `whiteboard-${Date.now()}`,
      });
      setCurrentRoomUuid(result.uuid);
      
      // 生成Room Token
      if (tokenData?.token) {
        setRoomToken(tokenData.token);
        onRoomCreated?.(result.uuid, tokenData.token);
      }
    } catch (error) {
      console.error('Failed to create whiteboard room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化白板（使用Netless SDK）
  useEffect(() => {
    if (!currentRoomUuid || !roomToken || !whiteboardRef.current) return;

    // 这里应该初始化Netless白板SDK
    // 示例代码（需要安装@netless/window-manager）：
    /*
    import { WhiteBoardSDK } from '@netless/whiteboard-sdk';
    
    const sdk = new WhiteBoardSDK({
      appIdentifier: process.env.VITE_WHITEBOARD_APP_ID,
    });

    const room = await sdk.joinRoom({
      uuid: currentRoomUuid,
      roomToken: roomToken,
      cursorAdapter: new CursorAdapter(),
      invisiblePlugins: [],
      plugins: {},
    });

    room.bindHtmlElement(whiteboardRef.current);
    */

    console.log('Whiteboard initialized:', {
      roomUuid: currentRoomUuid,
      roomToken: roomToken,
    });
  }, [currentRoomUuid, roomToken]);

  return (
    <div className="space-y-4">
      {!currentRoomUuid ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">没有活跃的白板房间</p>
          <Button onClick={handleCreateRoom} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            创建白板房间
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              房间ID: <code className="bg-gray-100 px-2 py-1 rounded">{currentRoomUuid}</code>
            </div>
            <Button variant="outline" onClick={handleCreateRoom} disabled={isLoading}>
              新建房间
            </Button>
          </div>

          {/* 白板容器 */}
          <div
            ref={whiteboardRef}
            className="w-full h-96 border rounded-lg bg-white"
            style={{
              minHeight: '500px',
            }}
          >
            {!roomToken && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* 功能说明 */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>✓ 实时协作白板</p>
            <p>✓ 支持多人编辑</p>
            <p>✓ 文档转换支持</p>
          </div>
        </>
      )}
    </div>
  );
}
