import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  Hand,
  Settings,
  ScreenShare,
  AlertCircle,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { useToast } from "../hooks/use-toast";
import { cn } from "../lib/utils";

// 声网客户端配置
const APP_ID = import.meta.env.VITE_AGORA_APP_ID || '0deed6e0ce284935b09babccaa5eb882';

export default function WebinarRoom() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // 状态管理
  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Agora 客户端和轨道
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  // 获取 Webinar 详情 - 修正为 webinar.getById
  const { data: webinar, isLoading } = trpc.webinar.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  // 获取 RTC Token
  const { data: tokenData } = trpc.agora.getRtcToken.useQuery(
    {
      channelName: `webinar_${id}`,
      uid: 0, // 0 表示由服务器分配 UID
    },
    { enabled: !!id && !isJoined }
  );

  // 离开频道
  const leaveChannel = async () => {
    if (!clientRef.current) return;

    try {
      // 关闭本地轨道
      localVideoTrackRef.current?.close();
      localAudioTrackRef.current?.close();

      // 离开频道
      await clientRef.current.leave();

      setIsJoined(false);
      setIsMicOn(false);
      setIsCameraOn(false);
      setRemoteUsers([]);
    } catch (error: any) {
      console.error("离开频道失败:", error);
    }
  };

  // 初始化 Agora 客户端
  useEffect(() => {
    if (!APP_ID) {
      console.error("未配置 VITE_AGORA_APP_ID");
      return;
    }

    // 创建客户端
    const client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    clientRef.current = client;

    // 监听远程用户加入
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          if (exists) return prev;
          return [...prev, user];
        });
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    // 监听远程用户离开
    client.on("user-unpublished", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    return () => {
      leaveChannel();
    };
  }, []);

  // 加入频道逻辑
  const joinChannel = async () => {
    if (!clientRef.current || !tokenData || isJoined) return;

    try {
      const client = clientRef.current;

      // 加入频道
      await client.join(
        APP_ID,
        `webinar_${id}`,
        tokenData.token,
        null
      );

      setIsJoined(true);
      toast({ title: "已成功加入频道" });
    } catch (error: any) {
      toast({
        title: "加入失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 自动加入
  useEffect(() => {
    if (webinar && tokenData && !isJoined) {
      joinChannel();
    }
  }, [webinar, tokenData, isJoined]);

  // 开启/关闭摄像头
  const toggleCamera = async () => {
    if (isCameraOn) {
      await disableCamera();
    } else {
      await enableCamera();
    }
  };

  const enableCamera = async () => {
    if (!clientRef.current) return;

    try {
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      localVideoTrackRef.current = videoTrack;

      // 播放本地视频
      videoTrack.play("local-video");

      // 发布视频轨道
      await clientRef.current.publish([videoTrack]);

      setIsCameraOn(true);
    } catch (error: any) {
      toast({
        title: "摄像头开启失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disableCamera = async () => {
    if (!localVideoTrackRef.current || !clientRef.current) return;

    try {
      await clientRef.current.unpublish([localVideoTrackRef.current]);
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
      setIsCameraOn(false);
    } catch (error: any) {
      console.error("关闭摄像头失败:", error);
    }
  };

  // 开启/关闭麦克风
  const toggleMicrophone = async () => {
    if (isMicOn) {
      await disableMicrophone();
    } else {
      await enableMicrophone();
    }
  };

  const enableMicrophone = async () => {
    if (!clientRef.current) return;

    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;

      // 发布音频轨道
      await clientRef.current.publish([audioTrack]);

      setIsMicOn(true);
    } catch (error: any) {
      toast({
        title: "麦克风开启失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disableMicrophone = async () => {
    if (!localAudioTrackRef.current || !clientRef.current) return;

    try {
      await clientRef.current.unpublish([localAudioTrackRef.current]);
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
      setIsMicOn(false);
    } catch (error: any) {
      console.error("关闭麦克风失败:", error);
    }
  };

  // 渲染远程用户视频
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        user.videoTrack.play(`remote-video-${user.uid}`);
      }
    });
  }, [remoteUsers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Webinar 不存在</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{webinar.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={webinar.status === "live" ? "default" : "secondary"}>
                {webinar.status === "live" ? "直播中" : webinar.status}
              </Badge>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {remoteUsers.length + 1} 人在线
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/webinars")}>
            离开房间
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Video Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Local Video */}
          <Card className="overflow-hidden relative bg-black aspect-video">
            <div id="local-video" className="w-full h-full" />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-slate-800">
                摄像头已关闭
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
              您 (主持人)
            </div>
          </Card>

          {/* Remote Videos */}
          {remoteUsers.map((user) => (
            <Card key={user.uid} className="overflow-hidden relative bg-black aspect-video">
              <div id={`remote-video-${user.uid}`} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                用户 {user.uid}
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar (Chat Placeholder) */}
        <Card className="w-80 flex flex-col">
          <div className="p-4 border-b font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            聊天室
          </div>
          <div className="flex-1 p-4 text-sm text-muted-foreground italic">
            聊天功能正在对接中...
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="border-t p-6 bg-slate-50/50">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMicOn ? "default" : "destructive"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMicrophone}
          >
            {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>
          <Button
            variant={isCameraOn ? "default" : "destructive"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleCamera}
          >
            {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <ScreenShare className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <Hand className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
            <Settings className="h-6 w-6" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="destructive" className="rounded-full px-8" onClick={() => setLocation("/webinars")}>
            <PhoneOff className="h-4 w-4 mr-2" />
            挂断
          </Button>
        </div>
      </div>
    </div>
  );
}
