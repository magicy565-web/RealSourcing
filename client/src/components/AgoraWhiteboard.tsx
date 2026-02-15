/**
 * Agora Interactive Whiteboard Component
 * 互动白板组件
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { WhiteWebSdk, Room } from 'white-web-sdk';

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
  const [room, setRoom] = useState<Room | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  // 创建房间
  const createRoomMutation = trpc.agora.whiteboard.createRoom.useMutation();

  // 生成Room Token
  const { data: tokenData } = trpc.agora.whiteboard.generateRoomToken.useQuery(
    { roomUuid: currentRoomUuid || '', role: 'writer' },
    { enabled: !!currentRoomUuid }
  );

  // 初始化SDK
  useEffect(() => {
    if (sdkInitialized) return;

    const initSDK = async () => {
      try {
        const sdk = new WhiteWebSdk({
          appIdentifier: process.env.VITE_AGORA_APP_ID || '',
        });
        setSdkInitialized(true);
      } catch (error) {
        console.error('Failed to initialize WhiteWebSdk:', error);
      }
    };

    initSDK();
  }, [sdkInitialized]);

  // 加入房间
  useEffect(() => {
    if (!currentRoomUuid || !roomToken || !whiteboardRef.current || !sdkInitialized) return;

    const joinRoom = async () => {
      try {
        const sdk = new WhiteWebSdk({
          appIdentifier: process.env.VITE_AGORA_APP_ID || '',
        });

        const joinedRoom = await sdk.joinRoom(
          {
            uuid: currentRoomUuid,
            roomToken: roomToken,
          } as any,
          {
            onPhaseChanged: (phase: any) => {
              console.log('Room phase changed:', phase);
            },
            onRoomStateChanged: (modifyState: any) => {
              console.log('Room state changed:', modifyState);
            },
          } as any
        );

        // 绑定到DOM
        if (whiteboardRef.current) {
          (joinedRoom as any).bindHtmlElement(whiteboardRef.current);
          setRoom(joinedRoom);
        }
      } catch (error) {
        console.error('Failed to join whiteboard room:', error);
      }
    };

    joinRoom();

    return () => {
      if (room) {
        room.disconnect();
        setRoom(null);
      }
    };
  }, [currentRoomUuid, roomToken, sdkInitialized]);

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

  // 清空白板
  const handleClear = () => {
    if (room) {
      (room as any).cleanCurrentScene?.();
    }
  };

  // 撤销
  const handleUndo = () => {
    if (room) {
      (room as any).undo?.();
    }
  };

  // 重做
  const handleRedo = () => {
    if (room) {
      (room as any).redo?.();
    }
  };

  return (
    <div className="space-y-4">
      {!currentRoomUuid ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">没有活跃的白板房间</p>
          <Button onClick={handleCreateRoom} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Plus className="w-4 h-4 mr-2" />
            创建白板房间
          </Button>
        </div>
      ) : (
        <>
          {/* 工具栏 */}
          <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600">
              房间ID: <code className="bg-white px-2 py-1 rounded">{currentRoomUuid}</code>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!room}
              >
                撤销
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!room}
              >
                重做
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!room}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateRoom}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                新建房间
              </Button>
            </div>
          </div>

          {/* 白板容器 */}
          <div
            ref={whiteboardRef}
            className="w-full border rounded-lg bg-white"
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
          <div className="text-sm text-gray-600 space-y-2 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">白板功能：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>✓ 实时协作白板</li>
              <li>✓ 支持多人编辑</li>
              <li>✓ 文档转换支持</li>
              <li>✓ 撤销/重做功能</li>
              <li>✓ 场景管理</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
