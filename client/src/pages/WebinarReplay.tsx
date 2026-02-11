import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Clock,
  FileText,
  Circle,
  Grid3x3,
  Upload,
  Camera,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useRef, useState } from "react";

// Import AI-generated timeline highlights
import timelineHighlights from "@/data/timeline_highlights.json";

export default function WebinarReplay() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [videoUrl] = useState("https://demand-os-discord.oss-cn-hangzhou.aliyuncs.com/YTDown.com_YouTube_Global-Sources-Hong-Kong-Shows-Tour-Autu_Media_ANdT4gGIAas_001_1080p.mp4");

  // Function to jump to specific timestamp in video
  const jumpToTimestamp = (timestamp: string) => {
    if (!videoRef.current) return;
    
    // Parse timestamp format "MM:SS.s" to seconds
    const parts = timestamp.split(':');
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    const totalSeconds = minutes * 60 + seconds;
    
    videoRef.current.currentTime = totalSeconds;
    videoRef.current.play();
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-full flex flex-col max-w-[1600px] mx-auto w-full">
        {/* Header - WorkTrial Style */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/webinars")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-light tracking-tight">Global Sources Hong Kong Show Tour</h1>
                <Badge variant="default" className="bg-gray-500/20 text-gray-400 border-gray-500/30 px-2.5 py-0.5 text-xs font-normal">
                  <Circle className="h-2 w-2 fill-gray-400 mr-1.5" />
                  Offline
                </Badge>
                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-normal">
                  pending
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-orange-500">Overtime</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - WorkTrial Layout */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-fit h-9 bg-transparent border-b border-border rounded-none p-0">
              <TabsTrigger 
                value="gallery" 
                className="text-sm font-normal data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="text-sm font-normal data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
              >
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="assets" 
                className="text-sm font-normal data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                Assets
              </TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="flex-1 mt-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-base font-medium mb-1">Screenshots ({timelineHighlights.length})</h2>
                <p className="text-sm text-muted-foreground">
                  Screenshots will appear here as AI captures key moments from the webinar
                </p>
              </div>
              
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No screenshots yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Screenshots will appear here as the candidate works on their trial
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="flex-1 mt-6 overflow-hidden">
              <div className="h-full grid grid-cols-12 gap-6">
                {/* Video Player */}
                <div className="col-span-8">
                  <Card className="bg-black border-none h-full overflow-hidden">
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      controls
                      src={videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </Card>
                </div>

                {/* Timeline Events */}
                <div className="col-span-4">
                  <Card className="h-full flex flex-col bg-card">
                    <div className="p-4 border-b border-border">
                      <h3 className="text-sm font-medium">No Selection</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click on a block in the timeline below to view details
                      </p>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {timelineHighlights.map((event, index) => (
                          <button
                            key={index}
                            onClick={() => jumpToTimestamp(event.timestamp_start)}
                            className="w-full p-3 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer text-left group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                                {event.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 font-mono">
                                {event.timestamp_start}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                              {event.summary}
                            </p>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="flex-1 mt-6 flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium mb-1">Candidate Deliverables</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload files the candidate produced during the trial
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">0 / 10 assets</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/50">
                <div className="text-center max-w-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload candidate deliverables</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to browse<br />
                    Images up to 50.0 MB · PDFs up to 5.0 MB
                  </p>
                  <Button variant="outline" size="sm">
                    Select files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-6">
                    No assets uploaded yet. Upload files the candidate produced during the trial to have them analyzed in the evaluation report.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
