import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Calendar, Clock, Globe, Users, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { mockStore } from "@/lib/mock-data";
import { toast } from "sonner";

export default function WebinarCreate() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    category: "",
    language: "en",
    type: "public",
    max_participants: "50",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      const newWebinar = mockStore.createWebinar({
        title: formData.title,
        description: formData.description,
        type: formData.type as 'public' | 'private',
        status: 'scheduled',
        scheduled_at: scheduledAt,
        duration: parseInt(formData.duration),
        category: formData.category,
        language: formData.language,
        max_participants: parseInt(formData.max_participants),
      });

      toast.success("Webinar created successfully!");
      setLocation(`/webinars/${newWebinar.id}`);
    } catch (error) {
      console.error("Failed to create webinar:", error);
      toast.error("Failed to create webinar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/webinars")}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white">Create Webinar</h1>
              <p className="text-muted-foreground mt-1 font-light text-sm">
                Set up a new online sourcing exhibition
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light text-white">Basic Information</CardTitle>
                    <CardDescription className="font-light">Define your webinar's core details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-light text-muted-foreground">
                    Webinar Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Smart Home Products Showcase Q1 2026"
                    className={cn(
                      "bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light h-11",
                      errors.title && "border-red-500/50"
                    )}
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                  />
                  {errors.title && <p className="text-xs text-red-400 font-light">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-light text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the webinar purpose, featured products, and what participants can expect..."
                    rows={4}
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light text-white">Schedule</CardTitle>
                    <CardDescription className="font-light">Set the date, time, and duration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">
                      Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="date"
                      className={cn(
                        "bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 font-light h-11",
                        errors.date && "border-red-500/50"
                      )}
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        if (errors.date) setErrors({ ...errors, date: "" });
                      }}
                    />
                    {errors.date && <p className="text-xs text-red-400 font-light">{errors.date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">
                      Time <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="time"
                      className={cn(
                        "bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 font-light h-11",
                        errors.time && "border-red-500/50"
                      )}
                      value={formData.time}
                      onChange={(e) => {
                        setFormData({ ...formData, time: e.target.value });
                        if (errors.time) setErrors({ ...errors, time: "" });
                      }}
                    />
                    {errors.time && <p className="text-xs text-red-400 font-light">{errors.time}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(v) => setFormData({ ...formData, duration: v })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#262626] text-white">
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-light text-white">Settings</CardTitle>
                    <CardDescription className="font-light">Configure visibility and capacity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">
                      Category <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => {
                        setFormData({ ...formData, category: v });
                        if (errors.category) setErrors({ ...errors, category: "" });
                      }}
                    >
                      <SelectTrigger className={cn(
                        "bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 h-11",
                        errors.category && "border-red-500/50"
                      )}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#262626] text-white">
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="smart-home">Smart Home</SelectItem>
                        <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                        <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="automotive">Automotive Parts</SelectItem>
                        <SelectItem value="packaging">Packaging</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-red-400 font-light">{errors.category}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(v) => setFormData({ ...formData, language: v })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#262626] text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">Chinese (中文)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">Visibility</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#262626] text-white">
                        <SelectItem value="public">Public — Open to all</SelectItem>
                        <SelectItem value="private">Private — Invite only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light text-muted-foreground">Max Participants</Label>
                    <Select
                      value={formData.max_participants}
                      onValueChange={(v) => setFormData({ ...formData, max_participants: v })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#262626] text-white">
                        <SelectItem value="20">20 participants</SelectItem>
                        <SelectItem value="50">50 participants</SelectItem>
                        <SelectItem value="100">100 participants</SelectItem>
                        <SelectItem value="200">200 participants</SelectItem>
                        <SelectItem value="500">500 participants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {formData.title && (
              <Card className="bg-gradient-to-br from-violet-600/5 to-blue-600/5 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="text-sm font-light text-muted-foreground uppercase tracking-wider">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="text-xl font-light text-white">{formData.title}</h3>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground font-light line-clamp-2">{formData.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {formData.date && formData.time && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formData.date} {formData.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formData.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Max {formData.max_participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {formData.language === "en" ? "English" : formData.language === "zh" ? "中文" : formData.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">
                        {formData.category || "No category"}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#262626] text-muted-foreground">
                        {formData.type === "public" ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <Button
                variant="outline"
                onClick={() => setLocation("/webinars")}
                className="border-[#262626] hover:bg-white/5 font-light"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white font-light px-8"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Webinar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
