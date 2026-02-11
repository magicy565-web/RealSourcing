import DashboardLayout from "@/components/DashboardLayout";
import VideoTimeline from "@/components/VideoTimeline";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  FileText,
  Circle,
  Grid3x3,
  Upload,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

// Import AI-generated timeline highlights
import timelineHighlights from "@/data/timeline_highlights.json";

const VIDEO_URL =
  "https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/YTDown.com_YouTube_Global-Sources-Hong-Kong-Shows-Tour-Autu_Media_ANdT4gGIAas_001_1080p.mp4";

export default function WebinarReplay() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* ═══════════════════ HEADER ═══════════════════ */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/reports")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-medium tracking-tight">
                  Global Sources Hong Kong Show Tour
                </h1>
                <Badge
                  variant="default"
                  className="bg-gray-500/20 text-gray-400 border-gray-500/30 px-2 py-0 text-[10px] font-normal"
                >
                  <Circle className="h-1.5 w-1.5 fill-gray-400 mr-1" />
                  Recorded
                </Badge>
                <Badge
                  variant="outline"
                  className="px-2 py-0 text-[10px] font-normal text-orange-400 border-orange-400/30"
                >
                  33:00
                </Badge>
              </div>
            </div>
          </div>

          {/* Tab Navigation in header */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-shrink-0"
          >
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="timeline" className="text-xs h-7 px-3 gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="gallery" className="text-xs h-7 px-3 gap-1.5">
                <Grid3x3 className="h-3.5 w-3.5" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="assets" className="text-xs h-7 px-3 gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Assets
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ═══════════════════ CONTENT ═══════════════════ */}
        <div className="flex-1 min-h-0">
          {/* Timeline Tab — Full-bleed video editor layout */}
          {activeTab === "timeline" && (
            <div className="h-full">
              <VideoTimeline
                videoUrl={VIDEO_URL}
                highlights={timelineHighlights}
                totalDuration={1978}
                thumbnailCount={198}
              />
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-base font-medium mb-1">
                  AI Screenshots ({timelineHighlights.length})
                </h2>
                <p className="text-sm text-muted-foreground">
                  Key moments automatically captured by AI during the webinar
                </p>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min overflow-auto">
                {timelineHighlights.map((hl, idx) => (
                  <button
                    key={hl.id}
                    onClick={() => {
                      setActiveTab("timeline");
                      // Small delay to let tab switch, then the timeline will handle seeking
                    }}
                    className="group relative rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg"
                  >
                    <div className="aspect-video bg-muted">
                      <img
                        src={hl.thumbnail}
                        alt={hl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">
                        {hl.title}
                      </p>
                      <p className="text-[10px] text-white/60 font-mono mt-1">
                        {hl.timestamp_start}
                      </p>
                    </div>
                    <div
                      className="absolute top-2 left-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: hl.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === "assets" && (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium mb-1">
                    Sourcing Assets
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload contracts, certificates, and supplier documents
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">0 / 10 assets</p>
              </div>
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/50">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Upload sourcing assets
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to browse
                    <br />
                    Images up to 50.0 MB · PDFs up to 5.0 MB
                  </p>
                  <Button variant="outline" size="sm">
                    Select files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-6">
                    No assets uploaded yet. Upload contracts, certificates, or
                    supplier documents to have them analyzed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
