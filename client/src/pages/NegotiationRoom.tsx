import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Video,
  Clock,
  FileText,
  Users,
  MessageSquare,
  Send,
  Circle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Monitor,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const timelineEvents = [
  {
    id: 1,
    time: "10:00 AM",
    type: "system",
    title: "Webinar Started",
    description: "Smart Home Products Showcase has begun",
    icon: Play,
  },
  {
    id: 2,
    time: "10:05 AM",
    type: "factory",
    title: "Shenzhen Electronics Co. joined",
    description: "Factory representative connected to the session",
    icon: Users,
  },
  {
    id: 3,
    time: "10:12 AM",
    type: "presentation",
    title: "Product Line Presentation",
    description: "Smart LED Controller Series - 15 SKUs presented",
    icon: Monitor,
  },
  {
    id: 4,
    time: "10:25 AM",
    type: "pricing",
    title: "Initial Quote Submitted",
    description: "MOQ 500 units @ $4.50/unit, FOB Shenzhen",
    icon: DollarSign,
  },
  {
    id: 5,
    time: "10:32 AM",
    type: "ai_insight",
    title: "AI Price Analysis",
    description: "Market average: $5.20. This quote is 13.5% below market. Recommended counter: $4.20 for MOQ 1000+",
    icon: TrendingUp,
  },
  {
    id: 6,
    time: "10:40 AM",
    type: "negotiation",
    title: "Counter-offer Proposed",
    description: "Buyer proposed $4.20/unit for MOQ 1000, with 2% annual volume discount",
    icon: MessageSquare,
  },
  {
    id: 7,
    time: "10:45 AM",
    type: "ai_alert",
    title: "AI Risk Alert",
    description: "Factory's production capacity may be insufficient for 1000+ MOQ based on historical data. Recommend verifying lead times.",
    icon: AlertTriangle,
  },
  {
    id: 8,
    time: "10:52 AM",
    type: "agreement",
    title: "Terms Agreed",
    description: "$4.35/unit, MOQ 800, 45-day lead time, FOB Shenzhen",
    icon: CheckCircle2,
  },
];

const resources = [
  { id: 1, name: "Product Catalog Q1 2026.pdf", size: "12.4 MB", type: "PDF" },
  { id: 2, name: "Factory Certification ISO9001.pdf", size: "2.1 MB", type: "PDF" },
  { id: 3, name: "Smart LED Controller Specs.xlsx", size: "856 KB", type: "XLSX" },
  { id: 4, name: "Production Line Photos.zip", size: "45.2 MB", type: "ZIP" },
  { id: 5, name: "Quality Test Report.pdf", size: "3.8 MB", type: "PDF" },
];

const chatMessages = [
  { id: 1, sender: "Buyer", message: "Can you confirm the LED lifespan rating?", time: "10:15 AM" },
  { id: 2, sender: "Factory", message: "Yes, rated 50,000 hours with L70 standard.", time: "10:16 AM" },
  { id: 3, sender: "AI Assistant", message: "Industry standard for this category is 30,000-50,000 hours. This rating is at the top of the range.", time: "10:16 AM", isAI: true },
  { id: 4, sender: "Buyer", message: "What about the warranty terms?", time: "10:18 AM" },
  { id: 5, sender: "Factory", message: "2-year warranty, with replacement for defective units within 30 days.", time: "10:19 AM" },
];

export default function NegotiationRoom() {
  const [, setLocation] = useLocation();
  const [chatInput, setChatInput] = useState("");

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      system: "text-muted-foreground",
      factory: "text-blue-400",
      presentation: "text-cyan-400",
      pricing: "text-green-400",
      ai_insight: "text-purple-400",
      negotiation: "text-yellow-400",
      ai_alert: "text-orange-400",
      agreement: "text-emerald-400",
    };
    return colors[type] || "text-muted-foreground";
  };

  const getEventDotColor = (type: string) => {
    const colors: Record<string, string> = {
      system: "bg-muted-foreground",
      factory: "bg-blue-400",
      presentation: "bg-cyan-400",
      pricing: "bg-green-400",
      ai_insight: "bg-purple-400",
      negotiation: "bg-yellow-400",
      ai_alert: "bg-orange-400",
      agreement: "bg-emerald-400",
    };
    return colors[type] || "bg-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/webinars")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Smart Home Products Showcase</h1>
                <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Circle className="h-2 w-2 fill-red-400 mr-1" />
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Started 52 minutes ago · 3 factories · 8 buyers online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause Session
            </Button>
            <Button variant="destructive" size="sm">
              End Webinar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
          {/* Left Panel: Tabs */}
          <div className="col-span-2 flex flex-col min-h-0">
            <Tabs defaultValue="gallery" className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-fit">
                <TabsTrigger value="gallery">
                  <Video className="h-4 w-4 mr-2" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="assets">
                  <FileText className="h-4 w-4 mr-2" />
                  Assets
                </TabsTrigger>
              </TabsList>

              {/* Gallery View */}
              <TabsContent value="gallery" className="flex-1 mt-4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Shenzhen Electronics Co.</CardTitle>
                        <Badge variant="outline" className="text-xs">Presenting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg m-3 mt-0">
                      <div className="text-center">
                        <Video className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Live Stream</p>
                        <p className="text-xs text-muted-foreground mt-1">Factory production line feed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Guangzhou Smart Home Ltd.</CardTitle>
                        <Badge variant="secondary" className="text-xs">Waiting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg m-3 mt-0">
                      <div className="text-center">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Next Presenter</p>
                        <p className="text-xs text-muted-foreground mt-1">Scheduled at 11:00 AM</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">AI Decision Support Panel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Supplier Score</p>
                          <p className="text-2xl font-bold text-green-400">92</p>
                          <p className="text-xs text-muted-foreground">Excellent</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Est. Profit Margin</p>
                          <p className="text-2xl font-bold text-blue-400">34.2%</p>
                          <p className="text-xs text-muted-foreground">Above average</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                          <p className="text-2xl font-bold text-yellow-400">Low</p>
                          <p className="text-xs text-muted-foreground">1 flag detected</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Timeline View */}
              <TabsContent value="timeline" className="flex-1 mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Negotiation Timeline</CardTitle>
                    <CardDescription>
                      Real-time tracking of all negotiation events and AI insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6">
                        {timelineEvents.map((event) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`h-3 w-3 rounded-full ${getEventDotColor(event.type)}`} />
                              <div className="w-0.5 flex-1 bg-border mt-2" />
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <event.icon className={`h-4 w-4 ${getEventColor(event.type)}`} />
                                <span className="text-sm font-medium">{event.title}</span>
                                <span className="text-xs text-muted-foreground ml-auto">{event.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assets View */}
              <TabsContent value="assets" className="flex-1 mt-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Resource Library</CardTitle>
                    <CardDescription>
                      Documents and materials shared during this webinar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{resource.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {resource.size} · {resource.type}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel: Chat */}
          <div className="flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Live Chat</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    11 online
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={msg.isAI ? "pl-4 border-l-2 border-purple-400/50" : ""}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${msg.isAI ? "text-purple-400" : "text-foreground"}`}>
                            {msg.sender}
                          </span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatInput.trim()) {
                          setChatInput("");
                        }
                      }}
                    />
                    <Button size="icon" onClick={() => setChatInput("")}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
