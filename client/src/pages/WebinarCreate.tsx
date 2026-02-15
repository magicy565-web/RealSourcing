import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, ArrowRight, Check, Upload, X, Building2, Calendar, FileText, Clock, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "../lib/utils";
import { trpc } from "../lib/trpc";
import { useToast } from "../hooks/use-toast";

const steps = [
  { id: 1, name: "Basic Info", icon: Calendar, description: "Webinar details and schedule" },
  { id: 2, name: "Time & Duration", icon: Clock, description: "Set time and duration limits" },
  { id: 3, name: "Advanced Settings", icon: FileText, description: "Recording, language, and more" },
];

export default function WebinarCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    coverImage: "",
    scheduledAt: "",
    scheduledTime: "",
    duration: 30,
    maxParticipants: 100,
    language: "zh",
    recordingEnabled: true,
    requireApproval: false,
    tags: [] as string[],
  });

  // 获取用户的时长限制
  const { data: durationLimit, isLoading: loadingLimit } = trpc.webinarEnhanced.getDurationLimit.useQuery();
  
  // 创建 Webinar mutation
  const createWebinar = trpc.webinarEnhanced.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "创建成功",
        description: `Webinar "${formData.title}" 已创建`,
      });
      setLocation(`/webinars/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (value: number) => {
    if (durationLimit && value > durationLimit.maxDuration) {
      toast({
        title: "时长超限",
        description: `您的套餐最多支持 ${durationLimit.maxDuration} 分钟`,
        variant: "destructive",
      });
      return;
    }
    handleInputChange("duration", value);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.title.length > 0 && formData.description.length > 0;
    }
    if (currentStep === 2) {
      return formData.scheduledAt.length > 0 && formData.scheduledTime.length > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const scheduledDateTime = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`);
      
      await createWebinar.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        coverImage: formData.coverImage || undefined,
        scheduledAt: scheduledDateTime.toISOString(),
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        language: formData.language,
        recordingEnabled: formData.recordingEnabled,
        requireApproval: formData.requireApproval,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        type: "webinar",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/webinars")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Webinar</h1>
            <p className="text-muted-foreground mt-1">
              Set up a new sourcing webinar in three simple steps
            </p>
          </div>
        </div>

        {/* Duration Limit Alert */}
        {durationLimit && (
          <Alert className="mb-6">
            <Zap className="h-4 w-4" />
            <AlertTitle>当前套餐限制</AlertTitle>
            <AlertDescription>
              您的 <Badge variant="outline">{durationLimit.planName}</Badge> 套餐最多支持 <strong>{durationLimit.maxDuration} 分钟</strong> 的 Webinar。
              {durationLimit.maxDuration < 120 && (
                <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setLocation("/settings/plan")}>
                  升级套餐 →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <Separator
                    className={cn(
                      "mx-4 flex-1",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Webinar Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 2024 Spring Product Launch"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your webinar, what products you'll showcase, and what buyers can expect..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                        <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      placeholder="https://..."
                      value={formData.coverImage}
                      onChange={(e) => handleInputChange("coverImage", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Time & Duration */}
            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Scheduled Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Scheduled Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (minutes) *
                    {durationLimit && (
                      <span className="text-muted-foreground ml-2">
                        Max: {durationLimit.maxDuration} minutes
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => handleDurationChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      {durationLimit && durationLimit.maxDuration >= 45 && (
                        <SelectItem value="45">45 minutes</SelectItem>
                      )}
                      {durationLimit && durationLimit.maxDuration >= 60 && (
                        <SelectItem value="60">60 minutes</SelectItem>
                      )}
                      {durationLimit && durationLimit.maxDuration >= 90 && (
                        <SelectItem value="90">90 minutes</SelectItem>
                      )}
                      {durationLimit && durationLimit.maxDuration >= 120 && (
                        <SelectItem value="120">120 minutes</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {durationLimit && formData.duration >= durationLimit.maxDuration && durationLimit.maxDuration < 120 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>需要更长时长？</AlertTitle>
                      <AlertDescription>
                        升级到更高套餐可获得最多 120 分钟的 Webinar 时长。
                        <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setLocation("/settings/plan")}>
                          查看套餐 →
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maximum Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* Step 3: Advanced Settings */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => handleInputChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                      <SelectItem value="ko">한국어 (Korean)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recording"
                      checked={formData.recordingEnabled}
                      onCheckedChange={(checked) => handleInputChange("recordingEnabled", checked)}
                    />
                    <Label htmlFor="recording" className="cursor-pointer">
                      Enable recording (recommended)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approval"
                      checked={formData.requireApproval}
                      onCheckedChange={(checked) => handleInputChange("requireApproval", checked)}
                    />
                    <Label htmlFor="approval" className="cursor-pointer">
                      Require approval for participants
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., electronics, LED, wholesale"
                    value={formData.tags.join(", ")}
                    onChange={(e) => handleInputChange("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={nextStep}
            disabled={!canProceed() || createWebinar.isPending}
          >
            {currentStep === steps.length ? (
              createWebinar.isPending ? "Creating..." : "Create Webinar"
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
