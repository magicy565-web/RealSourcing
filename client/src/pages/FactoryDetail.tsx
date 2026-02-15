import DashboardLayout from "../../../src/components/DashboardLayout";
import { Button } from "../../../src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../src/components/ui/card";
import { Badge } from "../../../src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../src/components/ui/tabs";
import { Progress } from "../../../src/components/ui/progress";
import { Separator } from "../../../src/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Shield,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { mockStore } from "../../../src/lib/mock-data";
import { useEffect, useState } from "react";
import { cn } from "../../../src/lib/utils";

const defaultFactoryData = {
  id: 1,
  name: "Shenzhen Electronics Co.",
  location: "Shenzhen, Guangdong, China",
  category: "Electronics & Smart Home",
  score: 92,
  status: "verified",
  established: "2015",
  employees: "200-500",
  annualRevenue: "$5M - $10M",
  website: "www.szelectronics.cn",
  phone: "+86 755 8888 9999",
  email: "sales@szelectronics.cn",
  certifications: ["ISO 9001", "ISO 14001", "CE", "FCC", "RoHS"],
  specialties: ["LED Controllers", "Smart Switches", "IoT Sensors", "Power Adapters"],
  scoreBreakdown: {
    quality: 95,
    delivery: 90,
    communication: 88,
    pricing: 93,
    compliance: 91,
  },
  webinarHistory: [
    { id: 1, title: "Smart Home Products Showcase", date: "2026-02-10", status: "live", role: "Presenter" },
    { id: 2, title: "IoT Devices Q4 2025", date: "2025-12-15", status: "completed", role: "Presenter" },
    { id: 3, title: "LED Lighting Solutions", date: "2025-10-20", status: "completed", role: "Participant" },
  ],
  orders: [
    { id: 1, product: "Smart LED Controller v3", quantity: 2000, value: "$9,000", date: "2026-01-15", status: "shipped" },
    { id: 2, product: "WiFi Smart Switch", quantity: 5000, value: "$17,500", date: "2025-11-20", status: "delivered" },
    { id: 3, product: "IoT Temperature Sensor", quantity: 3000, value: "$6,000", date: "2025-09-10", status: "delivered" },
  ],
  aiSummary: "Shenzhen Electronics Co. is a highly reliable supplier with consistent quality metrics across 15+ orders. Their LED controller line shows strong innovation with 3 new SKUs in the past quarter. Production capacity is currently at 70% utilization, suggesting room for larger orders. Key strength: competitive pricing with above-average quality. Risk factor: single-source dependency on Broadcom chips for IoT products.",
};

export default function FactoryDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/factories/:id");
  const [factoryData, setFactoryData] = useState(defaultFactoryData);

  useEffect(() => {
    if (params?.id) {
      const factory = mockStore.getFactoryById(parseInt(params.id));
      if (factory) {
        setFactoryData({
          ...defaultFactoryData,
          id: factory.id,
          name: factory.name,
          location: factory.location,
          category: factory.category,
          score: factory.score,
          logo: factory.logo,
          phone: factory.contact_phone,
          email: factory.contact_email,
          employees: `${factory.employee_count}`,
          established: factory.year_established.toString(),
          certifications: factory.certifications.split(", "),
        });
      }
    }
  }, [params?.id]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "[&>div]:bg-green-400";
    if (score >= 80) return "[&>div]:bg-blue-400";
    if (score >= 70) return "[&>div]:bg-yellow-400";
    return "[&>div]:bg-red-400";
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/factories")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4 flex-1">
            {/* Company Logo */}
            {factoryData.logo ? (
              <img
                src={factoryData.logo}
                alt={factoryData.name}
                className="w-20 h-20 rounded-xl object-cover border border-[#262626] flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-orange-500/10 flex items-center justify-center border border-[#262626] flex-shrink-0">
                <Building2 className="h-9 w-9 text-orange-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight truncate">{factoryData.name}</h1>
                <Badge variant="default">Verified</Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {factoryData.location}
              </span>
              <span>·</span>
              <span>{factoryData.category}</span>
              <span>·</span>
              <span>Est. {factoryData.established}</span>
              </div>
            </div>
          </div>
          <Button>Invite to Webinar</Button>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(factoryData.score)}`} />
                <p className={`text-3xl font-bold ${getScoreColor(factoryData.score)}`}>
                  {factoryData.score}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <p className="text-3xl font-bold">{factoryData.webinarHistory.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Webinars</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <p className="text-3xl font-bold">{factoryData.orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                <p className="text-3xl font-bold">{factoryData.certifications.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Certifications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Score Breakdown</TabsTrigger>
            <TabsTrigger value="history">Webinar History</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Employees
                    </span>
                    <span className="text-sm font-medium">{factoryData.employees}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Annual Revenue
                    </span>
                    <span className="text-sm font-medium">{factoryData.annualRevenue}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Website
                    </span>
                    <span className="text-sm font-medium">{factoryData.website}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </span>
                    <span className="text-sm font-medium">{factoryData.phone}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </span>
                    <span className="text-sm font-medium">{factoryData.email}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certifications & Specialties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {factoryData.certifications.map((cert) => (
                        <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Product Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {factoryData.specialties.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Score Breakdown */}
          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score Breakdown</CardTitle>
                <CardDescription>
                  Detailed scoring across key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(factoryData.scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className={`text-sm font-bold ${getScoreColor(value)}`}>{value}</span>
                    </div>
                    <Progress value={value} className={`h-2 ${getProgressColor(value)}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webinar History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Webinar Participation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {factoryData.webinarHistory.map((webinar) => (
                    <div
                      key={webinar.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{webinar.title}</p>
                          <p className="text-xs text-muted-foreground">{webinar.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{webinar.role}</Badge>
                        <Badge
                          variant={webinar.status === "live" ? "default" : "secondary"}
                        >
                          {webinar.status.charAt(0).toUpperCase() + webinar.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order History */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {factoryData.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium">{order.product}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.quantity} units · {order.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{order.value}</span>
                        <Badge
                          variant={order.status === "shipped" ? "default" : "secondary"}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  AI Supplier Analysis
                </CardTitle>
                <CardDescription>
                  Automated intelligence report based on historical data and market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border border-purple-400/20">
                  <p className="text-sm leading-relaxed">{factoryData.aiSummary}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg border border-green-400/20 bg-green-400/5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Strengths</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Competitive pricing with above-average quality</li>
                      <li>• Strong innovation in LED controller line</li>
                      <li>• 70% capacity utilization (room for growth)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border border-orange-400/20 bg-orange-400/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-400">Risk Factors</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Single-source chip dependency (Broadcom)</li>
                      <li>• Limited international shipping experience</li>
                      <li>• No UL certification for US market</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
