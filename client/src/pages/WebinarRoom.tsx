import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Button } from "../../../src/components/ui/button";
import { Card, CardContent } from "../../../src/components/ui/card";
import { Badge } from "../../../src/components/ui/badge";
import { Separator } from "../../../src/components/ui/separator";
import { Alert, AlertDescription } from "../../../src/components/ui/alert";
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
import { trpc } from "../../../src/lib/trpc";
import { useToast } from "../../../src/hooks/use-toast";
import { cn } from "../../../src/lib/utils";

// 声网客户端配置
const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

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

  // 获取 Webinar 详情
  const { data: webinar, isLoading } = trpc.webinarEnhanced.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  // 获取 RTC Token
  const { data: tokenData } = trpc.agora.getRtcToken.useQuery(
    {
      channelName: `webinar_${id}`,
      uid: 0, // 0 表示由服务器分配 UID
      role: isHost ? "publisher" : "audience",
    },
    { enabled: !!id && isJoined }
  );

  // 开始 Webinar
  const startWebinar = trpc.webinarEnhanced.start.useMutation({
    onSuccess: () => {
      toast({ title: "Webinar 已开始" });
    },
  });

  // 结束 Webinar
  const endWebinar = trpc.webinarEnhanced.end.useMutation({
    onSuccess: () => {
      toast({ title: "Webinar 已结束" });
      leaveChannel();
      setLocation("/webinars");
    },
  });

  // 初始化 Agora 客户端
  useEffect(() => {
    if (!APP_ID) {
      toast({
        title: "配置错误",
        description: "未配置 VITE_AGORA_APP_ID",
        variant: "destructive",
      });
      return;
    }

    // 创建客户端（互动直播模式）
    const client = AgoraRTC.createClient({
      mode: "live", // 互动直播模式
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

  // 加入频道
  const joinChannel = async () => {
    if (!clientRef.current || !tokenData) return;

    try {
      const client = clientRef.current;

      // 设置用户角色
      await client.setClientRole(isHost ? "host" : "audience");

      // 加入频道
      await client.join(
        APP_ID,
        `webinar_${id}`,
        tokenData.token,
        tokenData.uid
      );

      setIsJoined(true);

      // 如果是主播，自动开启摄像头和麦克风
      if (isHost) {
        await enableCamera();
        await enableMicrophone();
      }

      toast({ title: "已加入 Webinar" });

      // 如果是主播且 Webinar 未开始，自动开始
      if (isHost && webinar?.status === "scheduled") {
        startWebinar.mutate({ id: parseInt(id!) });
      }
    } catch (error: any) {
      toast({
        title: "加入失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  // 举手
  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "已放下手" : "已举手",
      description: isHandRaised
        ? "您已取消举手"
        : "主持人会看到您的举手请求",
    });
  };

  // 结束 Webinar
  const handleEndWebinar = () => {
    if (confirm("确定要结束这场 Webinar 吗？")) {
      endWebinar.mutate({ id: parseInt(id!) });
    }
  };

  // 自动加入频道
  useEffect(() => {
    if (webinar && tokenData && !isJoined) {
      // 判断是否为主播（工厂创建者）
      const isCreator = webinar.factoryId === webinar.factoryId; // TODO: 从用户信息判断
      setIsHost(isCreator);
      joinChannel();
    }
  }, [webinar, tokenData, isJoined]);

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
              <span className="text-sm text-muted-foreground">
                {isHost ? "主播" : "观众"}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {remoteUsers.length + 1} 人在线
              </span>
            </div>
          </div>

          {isHost && (
            <Button variant="destructive" onClick={handleEndWebinar}>
              <PhoneOff className="h-4 w-4 mr-2" />
              结束 Webinar
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video (Host) */}
            {isHost && (
              <Card className="relative overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div
                    id="local-video"
                    className={cn(
                      "w-full h-full bg-muted flex items-center justify-center",
                      !isCameraOn && "bg-slate-800"
                    )}
                  >
                    {!isCameraOn && (
                      <div className="text-center text-white">
                        <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">摄像头已关闭</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    您（主播）
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Remote Videos */}
            {remoteUsers.map((user) => (
              <Card key={user.uid} className="relative overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div
                    id={`remote-video-${user.uid}`}
                    className="w-full h-full bg-muted"
                  ></div>
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    用户 {user.uid}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {remoteUsers.length === 0 && !isHost && (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>等待主播加入...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar - Chat */}
        <div className="w-80 border-l flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              聊天室
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-sm text-muted-foreground text-center">
              聊天功能开发中...
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="border-t px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone */}
          {isHost && (
            <Button
              size="lg"
              variant={isMicOn ? "default" : "outline"}
              onClick={toggleMicrophone}
              className="rounded-full w-14 h-14"
            >
              {isMicOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Camera */}
          {isHost && (
            <Button
              size="lg"
              variant={isCameraOn ? "default" : "outline"}
              onClick={toggleCamera}
              className="rounded-full w-14 h-14"
            >
              {isCameraOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Raise Hand (Audience) */}
          {!isHost && (
            <Button
              size="lg"
              variant={isHandRaised ? "default" : "outline"}
              onClick={toggleHandRaise}
              className="rounded-full w-14 h-14"
            >
              <Hand className="h-5 w-5" />
            </Button>
          )}

          {/* Screen Share */}
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14"
            disabled
          >
            <ScreenShare className="h-5 w-5" />
          </Button>

          {/* Settings */}
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14"
            disabled
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Leave */}
          <Button
            size="lg"
            variant="destructive"
            onClick={() => {
              leaveChannel();
              setLocation("/webinars");
            }}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
