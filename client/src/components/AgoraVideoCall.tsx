/**
 * Agora RTC Video Call Component
 * 实时音视频通话组件
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { trpc } from '../../../src/lib/trpc';
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from 'agora-rtc-react';

interface AgoraVideoCallProps {
  channelName: string;
  userId: string | number;
  onCallEnd?: () => void;
}

/**
 * 视频通话内容组件
 */
function VideoCallContent({ channelName, userId, onCallEnd }: AgoraVideoCallProps) {
  const client = useRTCClient();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  // 获取RTC Token
  const { data: tokenData } = trpc.agora.getDualTokens.useQuery({
    channelName,
    uid: userId,
  });

  // 发布本地音视频
  usePublish([localMicrophoneTrack, localCameraTrack] as any);

  // 加入频道
  useEffect(() => {
    if (!client || !tokenData?.rtcToken) return;

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
    if (!localMicrophoneTrack) return;
    await (localMicrophoneTrack as any).setEnabled(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  };

  // 切换摄像头
  const toggleVideo = async () => {
    if (!localCameraTrack) return;
    await (localCameraTrack as any).setEnabled(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  // 挂断电话
  const handleHangUp = async () => {
    if (localMicrophoneTrack) (localMicrophoneTrack as any).close();
    if (localCameraTrack) (localCameraTrack as any).close();
    await client.leave();
    onCallEnd?.();
  };

  if (!isJoined || !tokenData) {
    return <div className="text-center py-8">正在加入频道...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 远程用户视频 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
        {remoteUsers.map(user => (
          <RemoteUserVideo key={user.uid} user={user} />
        ))}
      </div>

      {/* 本地用户视频 */}
      <div className="h-48 bg-gray-900 rounded-lg overflow-hidden">
        <LocalUserVideo />
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          variant={isAudioOn ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
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

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
        你
      </div>
    </div>
  );
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

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
        {user?.uid}
      </div>
    </div>
  );
}

/**
 * Agora视频通话组件包装器
 */
export function AgoraVideoCall(props: AgoraVideoCallProps) {
  return (
    <AgoraRTCProvider {...({} as any)}>
      <VideoCallContent {...props} />
    </AgoraRTCProvider>
  );
}
