import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "../../../src/components/DashboardLayout";
import { Button } from "../../../src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../src/components/ui/card";
import { Badge } from "../../../src/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../src/lib/utils";

interface ReportViewProps {
  params: {
    id?: string;
  };
}

interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, any>;
}

interface Report {
  id: number;
  title: string;
  type: string;
  summary: string;
  sections: ReportSection[];
  recommendations: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

export default function ReportView({ params }: ReportViewProps) {
  const [, setLocation] = useLocation();
  const reportId = params?.id || "1";
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/trpc/report.getById?input=${encodeURIComponent(JSON.stringify({ id: parseInt(reportId) }))}`
      );
      const data = await response.json();
      
      if (data.result?.data) {
        const reportData = data.result.data;
        
        // Parse AI analysis if available
        let parsedReport = reportData;
        if (reportData.aiAnalysis) {
          try {
            const aiData = JSON.parse(reportData.aiAnalysis);
            parsedReport = {
              ...reportData,
              ...aiData,
            };
          } catch (e) {
            console.error("Failed to parse AI analysis:", e);
          }
        }
        
        setReport(parsedReport);
      }
    } catch (error) {
      console.error("Failed to load report:", error);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast.success("Report download started");
    // TODO: Implement PDF download
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard");
    // TODO: Implement share functionality
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto animate-pulse">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <p className="text-sm text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-sm text-white">Report not found</p>
            <Button onClick={() => setLocation("/reports")} variant="outline">
              Back to Reports
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const reportTypeConfig: Record<string, { label: string; color: string; icon: any }> = {
    supplier_evaluation: {
      label: "Supplier Evaluation",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      icon: CheckCircle2,
    },
    profit_analysis: {
      label: "Profit Analysis",
      color: "text-green-400 bg-green-500/10 border-green-500/20",
      icon: TrendingUp,
    },
    negotiation_summary: {
      label: "Negotiation Summary",
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      icon: FileText,
    },
  };

  const config = reportTypeConfig[report.type] || reportTypeConfig.supplier_evaluation;
  const Icon = config.icon;

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/reports")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-light text-white">{report.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-[10px] font-light", config.color)}>
                  <Icon className="h-2.5 w-2.5 mr-1" />
                  {config.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5 inline mr-1" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
                {report.metadata?.fallback && (
                  <Badge variant="outline" className="text-[10px] font-light text-yellow-400 bg-yellow-500/10 border-yellow-500/20">
                    <AlertCircle className="h-2.5 w-2.5 mr-1" />
                    Limited Data
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 text-xs"
            >
              <Share2 className="h-3 w-3 mr-1.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Summary */}
            {report.summary && (
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-sm font-light flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {report.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Sections */}
            {report.sections && report.sections.length > 0 && (
              <div className="space-y-4">
                {report.sections.map((section, index) => (
                  <Card key={index} className="bg-[#0A0A0A] border-[#1A1A1A]">
                    <CardHeader>
                      <CardTitle className="text-sm font-light">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                      {section.data && Object.keys(section.data).length > 0 && (
                        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#111111] border border-[#1A1A1A]">
                          {Object.entries(section.data).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="text-sm font-light text-white">
                                {typeof value === "number" ? value.toLocaleString() : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-sm font-light flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-green-400" />
                        </div>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                          {rec}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            {report.metadata && Object.keys(report.metadata).length > 0 && (
              <Card className="bg-[#0A0A0A] border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="text-sm font-light">Report Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(report.metadata).map(([key, value]) => {
                      // Skip internal fields
                      if (key.startsWith("_")) return null;
                      
                      return (
                        <div key={key}>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <div className="text-sm font-light text-white">
                            {typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : typeof value === "number"
                              ? value.toLocaleString()
                              : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
