/**
 * Agora RTC Video Call Component
 * 实时音视频通话组件
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// 注意：需要安装 agora-rtc-react 包
// import AgoraRTC, { AgoraRTCProvider, useRTCClient, useLocalMicrophoneTrack, useLocalCameraTrack, usePublish, useRemoteUsers } from 'agora-rtc-react';
// 临时使用占位符
const AgoraRTCProvider = ({ children }: any) => <>{children}</> as any;
const useRTCClient = () => ({ join: async () => {}, leave: async () => {} } as any);
const useLocalMicrophoneTrack = () => ({ localMicrophoneTrack: { setEnabled: async () => {}, close: () => {} } as any });
const useLocalCameraTrack = () => ({ localCameraTrack: { setEnabled: async () => {}, close: () => {}, play: () => {}, stop: () => {} } as any });
const usePublish = () => {};
const useRemoteUsers = () => [] as any[];

interface AgoraVideoCallProps {
  channelName: string;
  userId: string | number;
  onCallEnd?: () => void;
}

/**
 * 视频通话内容组件
 */
function VideoCallContent({ channelName, userId, onCallEnd }: AgoraVideoCallProps) {
  const client = useRTCClient() as any;
  const { localMicrophoneTrack } = useLocalMicrophoneTrack() as any;
  const { localCameraTrack } = useLocalCameraTrack() as any;
  const remoteUsers = useRemoteUsers() as any[];
  
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  // 获取RTC Token
  const { data: tokenData } = trpc.agora.getDualTokens.useQuery({
    channelName,
    uid: userId,
  });

  // 发布本地音视频
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // 加入频道
  useEffect(() => {
    if (!client || !tokenData?.token) return;

    const joinChannel = async () => {
      try {
      await (client as any).join({
        appid: tokenData.appId || process.env.VITE_AGORA_APP_ID!,
        channel: channelName,
        token: tokenData.rtcToken,
        uid: typeof userId === 'number' ? userId : parseInt(userId),
      });
        setIsJoined(true);
      } catch (error) {
        console.error('Failed to join channel:', error);
      }
    };

    joinChannel();

    return () => {
      (client as any).leave();
      setIsJoined(false);
    };
  }, [client, tokenData, channelName, userId]);

  // 切换麦克风
  const toggleAudio = async () => {
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  // 切换摄像头
  const toggleVideo = async () => {
    if (localCameraTrack) {
      await localCameraTrack.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  // 挂断电话
  const handleHangUp = async () => {
    if (localMicrophoneTrack) localMicrophoneTrack.close();
    if (localCameraTrack) localCameraTrack.close();
    await client?.leave();
    onCallEnd?.();
  };

  if (!isJoined || !tokenData) {
    return <div className="text-center py-8">正在加入频道...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 远程用户视频 */}
      <div className="grid grid-cols-2 gap-4">
        {remoteUsers.map((user) => (
          <div key={user.uid} className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <RemoteUserVideo user={user} />
          </div>
        ))}
      </div>

      {/* 本地视频预览 */}
      <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <LocalUserVideo />
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          variant={isAudioOn ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          variant={isVideoOn ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleHangUp}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

/**
 * 本地用户视频
 */
function LocalUserVideo() {
  const videoRef = useRef<HTMLDivElement>(null);
  const { localCameraTrack } = useLocalCameraTrack();

  useEffect(() => {
    if (videoRef.current && localCameraTrack) {
      (localCameraTrack as any).play(videoRef.current);
      return () => {
        (localCameraTrack as any).stop();
      };
    }
  }, [localCameraTrack]);

  return <div ref={videoRef} className="w-full h-full" />;
}

/**
 * 远程用户视频
 */
function RemoteUserVideo({ user }: { user: any }) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && user?.videoTrack) {
      (user.videoTrack as any).play(videoRef.current);
      return () => {
        (user.videoTrack as any).stop();
      };
    }
  }, [user]);

  return <div ref={videoRef} className="w-full h-full" />;
}

/**
 * 主组件 - 带Provider包装
 */
export function AgoraVideoCall(props: AgoraVideoCallProps) {
  const client = useRTCClient();

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallContent {...props} />
    </AgoraRTCProvider>
  );
}
