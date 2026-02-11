import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, TrendingUp, MoreHorizontal, Plus, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Factories() {
  const [, setLocation] = useLocation();

  const factories = [
    {
      id: 1,
      name: "Shenzhen Electronics Co.",
      location: "Shenzhen, Guangdong, China",
      score: 92,
      category: "Electronics & Smart Home",
      webinars: 5,
      orders: 12,
      status: "verified",
      employees: "200-500",
    },
    {
      id: 2,
      name: "Guangzhou Smart Home Ltd.",
      location: "Guangzhou, Guangdong, China",
      score: 88,
      category: "Smart Home & IoT",
      webinars: 3,
      orders: 8,
      status: "verified",
      employees: "100-200",
    },
    {
      id: 3,
      name: "Dongguan Manufacturing Group",
      location: "Dongguan, Guangdong, China",
      score: 85,
      category: "Consumer Goods",
      webinars: 7,
      orders: 15,
      status: "pending",
      employees: "500-1000",
    },
    {
      id: 4,
      name: "Yiwu Trading Co.",
      location: "Yiwu, Zhejiang, China",
      score: 78,
      category: "General Merchandise",
      webinars: 2,
      orders: 5,
      status: "verified",
      employees: "50-100",
    },
    {
      id: 5,
      name: "Foshan Furniture Factory",
      location: "Foshan, Guangdong, China",
      score: 91,
      category: "Home & Furniture",
      webinars: 4,
      orders: 10,
      status: "suspended",
      employees: "300-500",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterFactories = (status: string) => {
    if (status === "all") return factories;
    return factories.filter((f) => f.status === status);
  };

  const renderFactoryList = (items: typeof factories) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No factories found</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {items.map((factory) => (
          <Card key={factory.id} className="hover:border-muted-foreground/30 transition-colors cursor-pointer"
            onClick={() => setLocation(`/factories/${factory.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {factory.name}
                    </CardTitle>
                    {getStatusBadge(factory.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {factory.location}
                    </span>
                    <span>·</span>
                    <span>{factory.category}</span>
                    <span>·</span>
                    <span>{factory.employees} employees</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/factories/${factory.id}`); }}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                      Invite to Webinar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast("Feature coming soon"); }}>
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${getScoreColor(factory.score)}`} />
                  <span className={`text-lg font-semibold ${getScoreColor(factory.score)}`}>
                    {factory.score}
                  </span>
                  <span className="text-sm text-muted-foreground">Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{factory.webinars}</span>
                    <span className="text-muted-foreground"> webinars</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <span className="font-medium">{factory.orders}</span>
                    <span className="text-muted-foreground"> orders completed</span>
                  </span>
                </div>
                <Button size="sm" variant="outline" className="ml-auto" onClick={(e) => { e.stopPropagation(); setLocation(`/factories/${factory.id}`); }}>
                  View Details
                </Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Factories</h1>
            <p className="text-muted-foreground mt-2">
              Manage your factory network and supplier relationships
            </p>
          </div>
          <Button onClick={() => toast("Feature coming soon")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Factory
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search factories by name, location, or category..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({factories.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({filterFactories("verified").length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterFactories("pending").length})</TabsTrigger>
            <TabsTrigger value="suspended">Suspended ({filterFactories("suspended").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderFactoryList(factories)}</TabsContent>
          <TabsContent value="verified">{renderFactoryList(filterFactories("verified"))}</TabsContent>
          <TabsContent value="pending">{renderFactoryList(filterFactories("pending"))}</TabsContent>
          <TabsContent value="suspended">{renderFactoryList(filterFactories("suspended"))}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
