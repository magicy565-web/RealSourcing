import { useState } from 'react';
import VideoSimulator from '../components/VideoSimulator';

/**
 * Webinar 演示模式页面
 * 用于展示预录视频模拟实时会议的效果
 */
export default function WebinarDemo() {
  const [selectedDemo, setSelectedDemo] = useState<'factory' | 'buyer' | 'full' | null>(null);

  // 演示视频配置
  const demoVideos = {
    factory: {
      url: '/demo-videos/factory-presentation.mp4',
      name: '深圳智能科技有限公司',
      role: 'factory' as const,
      description: '工厂产品展示 - 智能家居设备',
    },
    buyer: {
      url: '/demo-videos/buyer-inquiry.mp4',
      name: 'John Smith (美国采购商)',
      role: 'buyer' as const,
      description: '采购商询价 - 智能门锁批量采购',
    },
    full: {
      url: '/demo-videos/full-negotiation.mp4',
      name: '完整谈判演示',
      role: 'factory' as const,
      description: '工厂与买家的完整谈判过程（15分钟）',
    },
  };

  const handleVideoEnd = () => {
    alert('演示视频播放完毕！');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 头部 */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RealSourcing 演示模式</h1>
            <p className="text-gray-400 text-sm mt-1">
              使用预录视频模拟实时 Webinar 效果
            </p>
          </div>
          {selectedDemo && (
            <button
              onClick={() => setSelectedDemo(null)}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              返回选择
            </button>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedDemo ? (
          // 演示选择界面
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(demoVideos).map(([key, video]) => (
              <div
                key={key}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => setSelectedDemo(key as 'factory' | 'buyer' | 'full')}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
                  <svg
                    className="w-20 h-20 text-white/50 group-hover:text-white/80 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded-full flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white text-xs font-bold">DEMO</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{video.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{video.description}</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                    播放演示
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 视频播放界面
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-2">
                {demoVideos[selectedDemo].name}
              </h2>
              <p className="text-gray-400 text-sm">
                {demoVideos[selectedDemo].description}
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <div className="aspect-video">
                <VideoSimulator
                  videoUrl={demoVideos[selectedDemo].url}
                  participantName={demoVideos[selectedDemo].name}
                  participantRole={demoVideos[selectedDemo].role}
                  onVideoEnd={handleVideoEnd}
                />
              </div>
            </div>

            {/* 功能说明 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">演示功能说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">模拟实时效果</h4>
                    <p className="text-gray-400 text-sm">
                      预录视频以"LIVE"标签呈现，模拟真实的实时会议体验
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">AI 实时字幕</h4>
                    <p className="text-gray-400 text-sm">
                      可集成语音转文字功能，实时显示中英文字幕
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">自动记录关键信息</h4>
                    <p className="text-gray-400 text-sm">
                      AI 自动提取价格、数量、交期等采购要素
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">一键生成意向合同</h4>
                    <p className="text-gray-400 text-sm">
                      会议结束后自动生成正式的意向合同草案
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 上传自定义视频 */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">上传您的演示视频</h3>
              <p className="text-gray-400 text-sm mb-4">
                您可以上传工厂产品展示视频或真实的谈判录像，系统会自动将其转换为演示模式。
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  选择视频文件
                </label>
                <span className="text-gray-400 text-sm">
                  支持 MP4, MOV, AVI 格式，最大 500MB
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
