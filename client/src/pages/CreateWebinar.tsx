import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Upload, X, Building2, Calendar, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { directus } from "@/lib/directus";
import { createItem, readItems } from "@directus/sdk";
import { toast } from "sonner";

const steps = [
  { id: 1, name: "Basic Info", icon: Calendar, description: "Webinar details and schedule" },
  { id: 2, name: "Invite Factories", icon: Building2, description: "Select factories to participate" },
  { id: 3, name: "Resources", icon: FileText, description: "Upload materials and specifications" },
];

export default function WebinarCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [selectedFactories, setSelectedFactories] = useState<number[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    category: "",
    language: "en",
    specifications: "",
  });

  // Fetch factories from Directus
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const data = await directus.request(
          readItems('factories', {
            limit: 50,
          })
        );
        setFactories(data);
      } catch (error) {
        console.error('Failed to fetch factories:', error);
        // Fallback to mock data
        setFactories([
          { id: 1, name: "Shenzhen Electronics Co.", location: "Shenzhen", category: "Electronics", score: 92 },
          { id: 2, name: "Guangzhou Smart Home Ltd.", location: "Guangzhou", category: "Smart Home", score: 88 },
          { id: 3, name: "Dongguan Manufacturing Group", location: "Dongguan", category: "Consumer Goods", score: 85 },
          { id: 4, name: "Foshan Furniture Works", location: "Foshan", category: "Furniture", score: 79 },
          { id: 5, name: "Ningbo Textile Corp.", location: "Ningbo", category: "Textiles", score: 91 },
          { id: 6, name: "Yiwu Trading Center", location: "Yiwu", category: "General Merchandise", score: 76 },
        ]);
      }
    };

    if (currentStep === 2) {
      fetchFactories();
    }
  }, [currentStep]);

  const toggleFactory = (id: number) => {
    setSelectedFactories((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleFileUpload = () => {
    const fileName = `product-spec-${Date.now()}.pdf`;
    setUploadedFiles((prev) => [...prev, fileName]);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== fileName));
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.title.length > 0;
    if (currentStep === 2) return true;
    return true;
  };

  const handleCreateWebinar = async () => {
    setLoading(true);
    try {
      const scheduledAt = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}`).toISOString()
        : new Date().toISOString();

      const result = await directus.request(
        createItem('webinars', {
          title: formData.title,
          description: formData.description,
          type: 'public',
          status: 'scheduled',
          scheduled_at: scheduledAt,
          agora_channel_name: `webinar-${Math.random().toString(36).substring(7)}`,
        })
      );

      toast.success("Webinar created successfully!");
      setLocation(`/webinars/${result.id}`);
    } catch (error) {
      console.error('Failed to create webinar:', error);
      toast.error("Failed to create webinar. Using demo mode.");
      // Fallback: redirect to webinars list
      setTimeout(() => setLocation("/webinars"), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
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
              Set up a new sourcing webinar in three simple steps
            </p>
          </div>
        </div>

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
                        ? "border-violet-600 bg-violet-600 text-white"
                        : currentStep === step.id
                        ? "border-violet-600 text-violet-400"
                        : "border-[#262626] text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-light",
                        currentStep >= step.id ? "text-white" : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-light">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4",
                      currentStep > step.id ? "bg-violet-600" : "bg-[#262626]"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card className="bg-[#141414] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white">Webinar Details</CardTitle>
              <CardDescription className="font-light">
                Provide the basic information for your sourcing webinar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-light text-muted-foreground">Webinar Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Smart Home Products Showcase Q1 2026"
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-light text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the webinar purpose, target products, and what factories should prepare..."
                  rows={5}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-light text-muted-foreground">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-light text-muted-foreground">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-light text-muted-foreground">Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(v) => setFormData({ ...formData, duration: v })}
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#262626] text-white">
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-light text-muted-foreground">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#262626] text-white">
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="smart-home">Smart Home</SelectItem>
                      <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-light text-muted-foreground">Primary Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(v) => setFormData({ ...formData, language: v })}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626] text-white">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Invite Factories */}
        {currentStep === 2 && (
          <Card className="bg-[#141414] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-lg font-light text-white">Invite Factories</CardTitle>
              <CardDescription className="font-light">
                Select factories to participate in this webinar. {selectedFactories.length} selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Search factories by name or category..." 
                className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
              />
              <div className="space-y-3">
                {factories.map((factory) => {
                  const isSelected = selectedFactories.includes(factory.id);
                  return (
                    <div
                      key={factory.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "border-violet-600 bg-violet-600/10"
                          : "border-[#262626] hover:border-[#404040]"
                      )}
                      onClick={() => toggleFactory(factory.id)}
                    >
                      <Checkbox checked={isSelected} className="border-[#262626]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-light text-white">{factory.name}</p>
                          {factory.score && (
                            <Badge variant="outline" className="text-xs border-[#262626] text-muted-foreground">
                              Score: {factory.score}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-light">
                          {factory.location || 'China'} · {factory.category || 'General'}
                        </p>
                      </div>
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Resources */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white">Upload Resources</CardTitle>
                <CardDescription className="font-light">
                  Add product specifications, catalogs, and other materials for the webinar.
                  Max 5 files, 50 MB each.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-[#262626] rounded-lg p-8 text-center cursor-pointer hover:border-[#404040] transition-colors"
                  onClick={handleFileUpload}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-light text-white">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1 font-light">
                    PDF, DOCX, XLSX, JPG, PNG up to 50MB
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#262626]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-violet-400" />
                          <span className="text-sm font-light text-white">{file}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file)}
                          className="hover:bg-red-500/10 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white">Work Specification</CardTitle>
                <CardDescription className="font-light">
                  Provide detailed instructions for participating factories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter product specifications, quality requirements, target pricing, MOQ expectations, and any other details factories need to know..."
                  rows={8}
                  className="bg-[#0A0A0A] border-[#262626] text-white focus:ring-violet-600 focus:border-violet-600 font-light"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            className="border-[#262626] hover:bg-white/5 font-light"
            onClick={() => {
              if (currentStep === 1) {
                setLocation("/webinars");
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < 3 && (
              <Button 
                variant="outline" 
                onClick={() => setLocation("/webinars")}
                className="border-[#262626] hover:bg-white/5 font-light"
              >
                Save as Draft
              </Button>
            )}
            <Button
              onClick={() => {
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleCreateWebinar();
                }
              }}
              disabled={!canProceed() || loading}
              className="bg-violet-600 hover:bg-violet-700 text-white font-light"
            >
              {currentStep === 3 ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Webinar"}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
