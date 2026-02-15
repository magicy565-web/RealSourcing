import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  FileText, Download, Eye, Calendar, Zap, TrendingUp,
  BarChart3, Users, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Reports() {
  const [, setLocation] = useLocation();
  const reports = [
    {
      id: 1,
      title: "Smart Home Products Webinar — Supplier Evaluation",
      type: "supplier_evaluation",
      typeLabel: "Supplier Evaluation",
      date: "2026-02-10",
      status: "completed",
      factories: 3,
      icon: Users,
      color: "text-blue-400",
    },
    {
      id: 2,
      title: "Q1 2026 Profit Analysis Report",
      type: "profit_analysis",
      typeLabel: "Profit Analysis",
      date: "2026-02-08",
      status: "completed",
      factories: 12,
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      id: 3,
      title: "Sustainable Packaging — Negotiation Summary",
      type: "negotiation_summary",
      typeLabel: "Negotiation Summary",
      date: "2026-02-05",
      status: "completed",
      factories: 5,
      icon: BarChart3,
      color: "text-purple-400",
    },
    {
      id: 4,
      title: "LED Lighting Supplier Deep Dive",
      type: "supplier_evaluation",
      typeLabel: "Supplier Evaluation",
      date: "2026-02-03",
      status: "generating",
      factories: 4,
      icon: Users,
      color: "text-blue-400",
    },
  ];

  const filterReports = (type: string) => {
    if (type === "all") return reports;
    return reports.filter((r) => r.type === type);
  };

  const getStatusBadge = (status: string) => {
    if (status === "generating") {
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-normal">
          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          Generating
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 font-normal">
        Completed
      </Badge>
    );
  };

  const renderReportList = (items: typeof reports) => {
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Reports will be automatically generated after webinars are completed.
              Start your first webinar to see AI-powered insights here.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {items.map((report) => (
          <Card key={report.id} className="hover:border-muted-foreground/30 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center`}>
                      <report.icon className={`h-4 w-4 ${report.color}`} />
                    </div>
                    <CardTitle className="text-xl">{report.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                    </span>
                    <span>·</span>
                    <span>{report.factories} factories analyzed</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {report.id === 1 && (
                    <Badge className="bg-green-500 text-white border-none text-[10px] h-5">
                      Recommended
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] h-5">{report.typeLabel}</Badge>
                  {getStatusBadge(report.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {report.status === "completed" ? (
                  <>
                    <Button size="sm" variant="default" onClick={() => setLocation(`/webinars/${report.id === 1 ? 5 : report.id}/replay`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Replay Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast("Feature coming soon")}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing supplier data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-2">
              AI-generated supplier evaluations, profit analysis, and negotiation summaries
            </p>
          </div>
          <Button variant="outline" onClick={() => toast("Feature coming soon")}>
            <Zap className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
            <TabsTrigger value="supplier_evaluation">
              Supplier Evaluation ({filterReports("supplier_evaluation").length})
            </TabsTrigger>
            <TabsTrigger value="profit_analysis">
              Profit Analysis ({filterReports("profit_analysis").length})
            </TabsTrigger>
            <TabsTrigger value="negotiation_summary">
              Negotiation Summary ({filterReports("negotiation_summary").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderReportList(reports)}</TabsContent>
          <TabsContent value="supplier_evaluation">{renderReportList(filterReports("supplier_evaluation"))}</TabsContent>
          <TabsContent value="profit_analysis">{renderReportList(filterReports("profit_analysis"))}</TabsContent>
          <TabsContent value="negotiation_summary">{renderReportList(filterReports("negotiation_summary"))}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
