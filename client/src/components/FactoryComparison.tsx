import { X, Star, TrendingUp, CheckCircle2, Calendar, Shield, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface Factory {
  id: number;
  name: string;
  location: string;
  score: number;
  category: string;
  webinars: number;
  orders: number;
  status: string;
  employees: string;
  logo: string;
  images: string[];
  certifications: string[];
  onTimeRate: number;
  yearsActive: number;
  isGoldMember: boolean;
}

interface FactoryComparisonProps {
  factories: Factory[];
  onRemove: (id: number) => void;
  onClose: () => void;
}

export function FactoryComparison({ factories, onRemove, onClose }: FactoryComparisonProps) {
  if (factories.length === 0) return null;

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white";
    if (score >= 80) return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900";
    if (score >= 70) return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    return "bg-gradient-to-br from-gray-500 to-gray-600 text-white";
  };

  const getComparisonColor = (value: number, values: number[]) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (value === max) return "text-emerald-600 font-bold";
    if (value === min) return "text-red-600";
    return "text-muted-foreground";
  };

  const scores = factories.map(f => f.score);
  const orders = factories.map(f => f.orders);
  const onTimeRates = factories.map(f => f.onTimeRate);
  const years = factories.map(f => f.yearsActive);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Factory Comparison</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Compare up to {factories.length} factories side by side
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${factories.length}, minmax(0, 1fr))` }}>
            {factories.map((factory) => (
              <div key={factory.id} className="space-y-4">
                {/* Factory Header */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                    onClick={() => onRemove(factory.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{factory.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{factory.location}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-2xl ring-2 ring-white/20",
                      getScoreBadgeStyle(factory.score)
                    )}>
                      <Star className="h-6 w-6 fill-current" />
                      {factory.score}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {factory.status === "verified" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Verified
                    </Badge>
                  )}
                  {factory.isGoldMember && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      Gold
                    </Badge>
                  )}
                </div>

                {/* Category */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{factory.category}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Metrics */}
          <div className="mt-8 space-y-4">
            {/* Score Comparison */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <Star className="h-4 w-4" />
                Overall Score
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="text-center">
                  <div className={cn("text-2xl font-bold", getComparisonColor(factory.score, scores))}>
                    {factory.score}
                  </div>
                </div>
              ))}
            </div>

            {/* Orders */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4" />
                Total Orders
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="text-center">
                  <div className={cn("text-2xl font-bold", getComparisonColor(factory.orders, orders))}>
                    {factory.orders}
                  </div>
                </div>
              ))}
            </div>

            {/* On-Time Rate */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                On-Time Delivery
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="text-center">
                  <div className={cn("text-2xl font-bold", getComparisonColor(factory.onTimeRate, onTimeRates))}>
                    {factory.onTimeRate}%
                  </div>
                </div>
              ))}
            </div>

            {/* Years Active */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                Years Active
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="text-center">
                  <div className={cn("text-2xl font-bold", getComparisonColor(factory.yearsActive, years))}>
                    {factory.yearsActive}y
                  </div>
                </div>
              ))}
            </div>

            {/* Employees */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4" />
                Employees
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="text-center">
                  <div className="text-lg font-medium">
                    {factory.employees}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${factories.length}, minmax(0, 1fr))` }}>
              <div className="flex items-center gap-2 font-medium">
                <Shield className="h-4 w-4" />
                Certifications
              </div>
              {factories.map((factory) => (
                <div key={factory.id} className="space-y-2">
                  {factory.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="w-full justify-center">
                      {cert}
                    </Badge>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Winner Highlight */}
          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
              <Star className="h-5 w-5 fill-current" />
              Highest Rated Factory
            </div>
            <p className="text-sm">
              <span className="font-bold">{factories.find(f => f.score === Math.max(...scores))?.name}</span>
              {" "}has the highest overall score of {Math.max(...scores)} points.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
