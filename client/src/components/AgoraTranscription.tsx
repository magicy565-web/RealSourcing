/**
 * Agora Real-time Transcription & Translation Component
 * 实时转录翻译组件
 */

import { useEffect, useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';
import { Loader2, Play, Square, RotateCcw } from 'lucide-react';
import { trpc } from '../../../src/lib/trpc';

interface AgoraTranscriptionProps {
  channelName: string;
  sourceLanguage?: string;
  targetLanguages?: string[];
  onTranscriptionStart?: (agentId: string) => void;
  onTranscriptionStop?: () => void;
}

/**
 * 实时转录翻译组件
 */
export function AgoraTranscription({
  channelName,
  sourceLanguage = 'zh-CN',
  targetLanguages = ['en-US'],
  onTranscriptionStart,
  onTranscriptionStop,
}: AgoraTranscriptionProps) {
  const [agentId, setAgentId] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Array<{
    id: string;
    text: string;
    language: string;
    timestamp: number;
  }>>([]);

  // 启动转录
  const startMutation = trpc.agora.transcription.start.useMutation();

  // 停止转录
  const stopMutation = trpc.agora.transcription.stop.useMutation();

  // 查询转录状态
  const { data: statusData } = trpc.agora.transcription.query.useQuery(
    { agentId: agentId || '' },
    { enabled: !!agentId && isRunning, refetchInterval: 2000 }
  );

  // 启动实时转录
  const handleStart = async () => {
    try {
      const result = await startMutation.mutateAsync({
        channelName,
        sourceLanguage,
        targetLanguages,
      });
      setAgentId(result.agentId);
      setIsRunning(true);
      onTranscriptionStart?.(result.agentId);
    } catch (error) {
      console.error('Failed to start transcription:', error);
    }
  };

  // 停止实时转录
  const handleStop = async () => {
    if (!agentId) return;
    try {
      await stopMutation.mutateAsync({ agentId });
      setIsRunning(false);
      onTranscriptionStop?.();
    } catch (error) {
      console.error('Failed to stop transcription:', error);
    }
  };

  // 重置
  const handleReset = () => {
    setAgentId(undefined);
    setIsRunning(false);
    setTranscriptions([]);
  };

  // 模拟接收转录数据（实际应通过WebSocket接收）
  useEffect(() => {
    if (!isRunning || !statusData) return;

    // 这里应该通过WebSocket或其他实时通道接收转录数据
    // 示例：
    /*
    const newTranscription = {
      id: `trans-${Date.now()}`,
      text: statusData.text,
      language: sourceLanguage,
      timestamp: Date.now(),
    };
    setTranscriptions(prev => [...prev, newTranscription]);
    */
  }, [statusData, isRunning, sourceLanguage]);

  return (
    <div className="space-y-4">
      {/* 控制按钮 */}
      <div className="flex gap-2">
        <Button
          onClick={handleStart}
          disabled={isRunning || startMutation.isPending}
          className="flex items-center gap-2"
        >
          {startMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Play className="w-4 h-4" />
          启动转录
        </Button>

        <Button
          onClick={handleStop}
          disabled={!isRunning || stopMutation.isPending}
          variant="destructive"
          className="flex items-center gap-2"
        >
          {stopMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Square className="w-4 h-4" />
          停止转录
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </Button>
      </div>

      {/* 状态信息 */}
      {agentId && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agent ID</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{agentId}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">状态</span>
              <Badge variant={isRunning ? 'default' : 'secondary'}>
                {isRunning ? '运行中' : '已停止'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">源语言</span>
              <Badge variant="outline">{sourceLanguage}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">目标语言</span>
              <div className="flex gap-1">
                {targetLanguages.map(lang => (
                  <Badge key={lang} variant="outline">{lang}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 转录结果 */}
      {transcriptions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">转录结果</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transcriptions.map(trans => (
              <div key={trans.id} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                <div className="text-gray-600 text-xs mb-1">
                  {new Date(trans.timestamp).toLocaleTimeString()} - {trans.language}
                </div>
                <div className="text-gray-900">{trans.text}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 功能说明 */}
      <div className="text-sm text-gray-600 space-y-2 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium">功能特性：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>实时语音转文字</li>
          <li>多语言翻译支持</li>
          <li>自动字幕生成</li>
          <li>转录结果存储</li>
        </ul>
      </div>
    </div>
  );
}
