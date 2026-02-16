import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

interface AIAnalysisCardProps {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations?: string[];
}

export default function AIAnalysisCard({ summary, strengths, risks, recommendations }: AIAnalysisCardProps) {
  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-400" />
          AI Supplier Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automated intelligence report based on historical data and market analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <h4 className="font-semibold text-green-400">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h4 className="font-semibold text-yellow-400">Risk Factors</h4>
          </div>
          <ul className="space-y-2">
            {risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-400 mt-1">•</span>
                <span className="text-muted-foreground">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-blue-400" />
              <h4 className="font-semibold text-blue-400">Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
