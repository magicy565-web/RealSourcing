import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Calendar, Clock, Users, Globe, Video, Circle,
  UserPlus, Building2, CheckCircle, XCircle, AlertCircle,
  Play, MapPin, Shield, Star, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockStore, type MockWebinar, type MockRegistration, getAvatarByRole } from "@/lib/mock-data";
import DecisionMatrix from "@/components/tactical/DecisionMatrix";

interface WebinarDetailProps {
  params: {
    id?: string;
  };
}

export default function WebinarDetail({ params }: WebinarDetailProps) {
  const [, setLocation] = useLocation();
  const webinarId = parseInt(params?.id || "0");
  const [webinar, setWebinar] = useState<MockWebinar | null>(null);
  const [registrations, setRegistrations] = useState<MockRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegDialog, setShowRegDialog] = useState(false);
  const [regForm, setRegForm] = useState({
    user_name: "",
    user_email: "",
    company_name: "",
    role: "buyer" as "factory" | "buyer",
    notes: "",
  });

  useEffect(() => {
    const w = mockStore.getWebinarById(webinarId);
    setWebinar(w || null);
    setRegistrations(mockStore.getRegistrations(webinarId));
    setLoading(false);
  }, [webinarId]);

  const handleRegister = () => {
    if (!regForm.user_name || !regForm.user_email || !regForm.company_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    mockStore.createRegistration({
      webinar_id: webinarId,
      ...regForm,
    });
    setRegistrations(mockStore.getRegistrations(webinarId));
    setShowRegDialog(false);
    setRegForm({ user_name: "", user_email: "", company_name: "", role: "buyer", notes: "" });
    toast.success("Registration submitted! Awaiting admin approval.");
  };

  const handleApprove = (regId: number) => {
    mockStore.updateRegistrationStatus(regId, "approved");
    setRegistrations(mockStore.getRegistrations(webinarId));
    toast.success("Registration approved");
  };

  const handleReject = (regId: number) => {
    mockStore.updateRegistrationStatus(regId, "rejected");
    setRegistrations(mockStore.getRegistrations(webinarId));
    toast.success("Registration rejected");
  };

  const handleStatusChange = (newStatus: MockWebinar['status']) => {
    if (webinar) {
      const updated = mockStore.updateWebinar(webinar.id, { status: newStatus });
      if (updated) {
        setWebinar(updated);
        toast.success(`Webinar status changed to ${newStatus}`);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!webinar) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground font-light">Webinar not found</p>
            <Button variant="outline" onClick={() => setLocation("/webinars")} className="border-[#262626]">
              Back to Webinars
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const approvedCount = registrations.filter(r => r.status === "approved").length;
  const pendingCount = registrations.filter(r => r.status === "pending").length;
  const factoryCount = registrations.filter(r => r.role === "factory" && r.status === "approved").length;
  const buyerCount = registrations.filter(r => r.role === "buyer" && r.status === "approved").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      live: "bg-red-500/10 text-red-400 border-red-500/20",
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      completed: "bg-green-500/10 text-green-400 border-green-500/20",
      cancelled: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
    return colors[status] || colors.draft;
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/webinars")}
                className="text-muted-foreground hover:text-white hover:bg-white/5 mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-light tracking-tight text-white">{webinar.title}</h1>
                  <Badge className={cn("text-xs", getStatusColor(webinar.status))}>
                    {webinar.status === "live" && <Circle className="h-2 w-2 fill-current mr-1 animate-pulse" />}
                    {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-light max-w-2xl leading-relaxed">
                  {webinar.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {webinar.status === "scheduled" && (
                <Button
                  onClick={() => handleStatusChange("live")}
                  className="bg-red-600 hover:bg-red-700 text-white font-light"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Go Live
                </Button>
              )}
              {webinar.status === "live" && (
                <>
                  <DecisionMatrix />
                  <Button
                    onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-light"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Enter Room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("completed")}
                    className="border-[#262626] hover:bg-white/5 font-light"
                  >
                    End Webinar
                  </Button>
                </>
              )}
              {webinar.status === "completed" && (
                <>
                  <DecisionMatrix />
                  <Button
                    onClick={() => setLocation(`/webinars/${webinar.id}/replay`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-light"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    View Replay & Highlights
                  </Button>
                </>
              )}
              {webinar.status === "draft" && (
                <Button
                  onClick={() => handleStatusChange("scheduled")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-light"
                >
                  Publish
                </Button>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Date</div>
                  <div className="text-sm font-light text-white">
                    {new Date(webinar.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Duration</div>
                  <div className="text-sm font-light text-white">{webinar.duration} min</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Participants</div>
                  <div className="text-sm font-light text-white">{approvedCount} / {webinar.max_participants}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Factories</div>
                  <div className="text-sm font-light text-white">{factoryCount}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#262626]">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-light uppercase tracking-wider">Buyers</div>
                  <div className="text-sm font-light text-white">{buyerCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Registrations */}
            <div className="col-span-2 space-y-6">
              {/* Registration Header */}
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg font-light text-white">Registrations</CardTitle>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      {approvedCount} approved · {pendingCount} pending review
                    </p>
                  </div>
                  <Dialog open={showRegDialog} onOpenChange={setShowRegDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-violet-600 hover:bg-violet-700 text-white font-light">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#141414] border-[#262626] text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-light text-xl">Register for Webinar</DialogTitle>
                        <DialogDescription className="font-light">
                          Submit your registration for "{webinar.title}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-light text-muted-foreground">Full Name *</Label>
                          <Input
                            placeholder="Your full name"
                            className="bg-[#0A0A0A] border-[#262626] text-white font-light"
                            value={regForm.user_name}
                            onChange={(e) => setRegForm({ ...regForm, user_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-light text-muted-foreground">Email *</Label>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="bg-[#0A0A0A] border-[#262626] text-white font-light"
                            value={regForm.user_email}
                            onChange={(e) => setRegForm({ ...regForm, user_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-light text-muted-foreground">Company Name *</Label>
                          <Input
                            placeholder="Your company name"
                            className="bg-[#0A0A0A] border-[#262626] text-white font-light"
                            value={regForm.company_name}
                            onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-light text-muted-foreground">I am a *</Label>
                          <Select
                            value={regForm.role}
                            onValueChange={(v) => setRegForm({ ...regForm, role: v as "factory" | "buyer" })}
                          >
                            <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#141414] border-[#262626] text-white">
                              <SelectItem value="buyer">Overseas Buyer / Importer</SelectItem>
                              <SelectItem value="factory">Factory / Manufacturer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-light text-muted-foreground">Notes (Optional)</Label>
                          <Textarea
                            placeholder="Any specific interests or requirements..."
                            className="bg-[#0A0A0A] border-[#262626] text-white font-light"
                            rows={3}
                            value={regForm.notes}
                            onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRegDialog(false)} className="border-[#262626] font-light">
                          Cancel
                        </Button>
                        <Button onClick={handleRegister} className="bg-violet-600 hover:bg-violet-700 text-white font-light">
                          Submit Registration
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-light">No registrations yet</p>
                      <p className="text-xs text-muted-foreground/60 font-light mt-1">Be the first to register for this webinar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registrations.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-[#262626] hover:border-[#404040] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={getAvatarByRole(reg.role, reg.user_name)}
                              alt={reg.user_name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-light text-white">{reg.user_name}</p>
                                <Badge variant="outline" className="text-[10px] border-[#262626] text-muted-foreground">
                                  {reg.role === "factory" ? "Factory" : "Buyer"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-light">{reg.company_name} · {reg.user_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {reg.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApprove(reg.id)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReject(reg.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Badge className={cn(
                                "text-xs",
                                reg.status === "approved"
                                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              )}>
                                {reg.status === "approved" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Webinar Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-sm font-light text-white uppercase tracking-wider">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Date & Time</p>
                      <p className="text-sm text-white font-light">{formatDate(webinar.scheduled_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Duration</p>
                      <p className="text-sm text-white font-light">{webinar.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Language</p>
                      <p className="text-sm text-white font-light">{webinar.language === "en" ? "English" : webinar.language === "zh" ? "中文" : webinar.language}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Type</p>
                      <p className="text-sm text-white font-light">{webinar.type === "public" ? "Public Event" : "Private / Invite Only"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-light">Channel</p>
                      <p className="text-xs text-white font-mono">{webinar.agora_channel_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card className="bg-[#141414] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-sm font-light text-white uppercase tracking-wider">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-400 text-sm font-light">
                    {webinar.category || "General"}
                  </Badge>
                </CardContent>
              </Card>

              {/* Agora Room Info */}
              {webinar.status === "live" && (
                <Card className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border-violet-500/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto animate-pulse">
                      <Video className="h-8 w-8 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-light text-lg">Webinar is Live!</p>
                      <p className="text-muted-foreground font-light text-sm mt-1">
                        {approvedCount} participants are in the room
                      </p>
                    </div>
                    <Button
                      onClick={() => setLocation(`/webinars/${webinar.id}/room`)}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-light"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
