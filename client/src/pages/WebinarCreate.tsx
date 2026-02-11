import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Upload, X, Building2, Calendar, FileText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Basic Info", icon: Calendar, description: "Webinar details and schedule" },
  { id: 2, name: "Invite Factories", icon: Building2, description: "Select factories to participate" },
  { id: 3, name: "Resources", icon: FileText, description: "Upload materials and specifications" },
];

const mockFactories = [
  { id: 1, name: "Shenzhen Electronics Co.", location: "Shenzhen", category: "Electronics", score: 92 },
  { id: 2, name: "Guangzhou Smart Home Ltd.", location: "Guangzhou", category: "Smart Home", score: 88 },
  { id: 3, name: "Dongguan Manufacturing Group", location: "Dongguan", category: "Consumer Goods", score: 85 },
  { id: 4, name: "Foshan Furniture Works", location: "Foshan", category: "Furniture", score: 79 },
  { id: 5, name: "Ningbo Textile Corp.", location: "Ningbo", category: "Textiles", score: 91 },
  { id: 6, name: "Yiwu Trading Center", location: "Yiwu", category: "General Merchandise", score: 76 },
];

export default function WebinarCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [selectedFactories, setSelectedFactories] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    category: "",
    language: "en",
  });

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
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-4",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Webinar Details</CardTitle>
              <CardDescription>
                Provide the basic information for your sourcing webinar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Webinar Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Smart Home Products Showcase Q1 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the webinar purpose, target products, and what factories should prepare..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(v) => setFormData({ ...formData, duration: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Label>Primary Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(v) => setFormData({ ...formData, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Invite Factories</CardTitle>
              <CardDescription>
                Select factories to participate in this webinar. {selectedFactories.length} selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Search factories by name or category..." />
              <div className="space-y-3">
                {mockFactories.map((factory) => {
                  const isSelected = selectedFactories.includes(factory.id);
                  return (
                    <div
                      key={factory.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                      onClick={() => toggleFactory(factory.id)}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{factory.name}</p>
                          <Badge variant="outline" className="text-xs">
                            Score: {factory.score}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {factory.location} · {factory.category}
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
            <Card>
              <CardHeader>
                <CardTitle>Upload Resources</CardTitle>
                <CardDescription>
                  Add product specifications, catalogs, and other materials for the webinar.
                  Max 5 files, 50 MB each.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={handleFileUpload}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, XLSX, JPG, PNG up to 50MB
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Specification</CardTitle>
                <CardDescription>
                  Provide detailed instructions for participating factories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter product specifications, quality requirements, target pricing, MOQ expectations, and any other details factories need to know..."
                  rows={8}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
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
              <Button variant="outline" onClick={() => setLocation("/webinars")}>
                Save as Draft
              </Button>
            )}
            <Button
              onClick={() => {
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setLocation("/webinars");
                }
              }}
              disabled={!canProceed()}
            >
              {currentStep === 3 ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Webinar
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
