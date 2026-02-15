import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../src/components/ui/table";
import { Badge } from "../../../../src/components/ui/badge";
import { Button } from "../../../../src/components/ui/button";
import { Check, X, Bot, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../../../../src/lib/utils";

interface FactoryComparison {
  id: number;
  name: string;
  location: string;
  recommended: boolean;
  data: {
    price: string;
    moq: string;
    leadTime: string;
    paymentTerms: string;
    qualityCertified: boolean;
    sustainablePractices: boolean;
  };
  aiHighlight: string;
}

const mockData: {
  factories: FactoryComparison[];
  aiConclusion: string;
} = {
  factories: [
    {
      id: 1,
      name: "Ningbo AutoParts Co.",
      location: "Ningbo, Zhejiang",
      recommended: true,
      data: {
        price: "$12.50/unit",
        moq: "500 units",
        leadTime: "25 days",
        paymentTerms: "30% deposit, 70% before shipment",
        qualityCertified: true,
        sustainablePractices: true,
      },
      aiHighlight: "Best balance of price and quality. ISO certified.",
    },
    {
      id: 2,
      name: "Shaoxing Gear Manufacturing",
      location: "Shaoxing, Zhejiang",
      recommended: false,
      data: {
        price: "$11.80/unit",
        moq: "1000 units",
        leadTime: "35 days",
        paymentTerms: "50% deposit, 50% on delivery",
        qualityCertified: true,
        sustainablePractices: false,
      },
      aiHighlight: "Lower price, but higher MOQ and longer lead time.",
    },
  ],
  aiConclusion:
    "Based on comprehensive analysis of pricing, quality certifications, lead times, and payment flexibility, Ningbo AutoParts Co. offers the optimal value proposition. Their competitive pricing combined with faster delivery (25 days vs 35 days) and lower MOQ (500 vs 1000 units) makes them the recommended partner for this project. Additionally, their commitment to sustainable practices aligns with ESG requirements.",
};

const loadingMessages = [
  "Analyzing pricing strategies...",
  "Comparing lead times...",
  "Evaluating payment terms...",
  "Cross-referencing quality certifications...",
  "Generating recommendations...",
];

type DialogState = "idle" | "generating" | "complete";

export default function DecisionMatrix() {
  const [state, setState] = useState<DialogState>("idle");
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state === "generating") {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 400);

      const timeout = setTimeout(() => {
        setState("complete");
        clearInterval(interval);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [state]);

  const handleGenerate = () => {
    setState("generating");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when dialog closes
      setTimeout(() => {
        setState("idle");
        setLoadingMessage(loadingMessages[0]);
      }, 200);
    }
  };

  const renderBooleanCell = (value: boolean) => {
    return value ? (
      <Check className="w-4 h-4 text-emerald-400" />
    ) : (
      <X className="w-4 h-4 text-rose-400" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative group",
            "border-cyan-500/30 text-cyan-300 hover:text-cyan-200",
            "hover:border-cyan-400/50 hover:bg-cyan-950/30",
            "hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]",
            "transition-all duration-300"
          )}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          GENERATE DECISION MATRIX
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Decision Matrix
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Comprehensive supplier comparison and recommendation
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {state === "idle" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-400" />
              </div>
              <p className="text-slate-300 text-lg font-medium">
                Ready to generate supplier comparison
              </p>
              <p className="text-slate-500 text-sm max-w-md text-center">
                Our AI will analyze pricing, lead times, quality certifications, and
                more to provide you with data-driven recommendations.
              </p>
              <Button
                onClick={handleGenerate}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}

          {state === "generating" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 bg-cyan-400/20 rounded-full animate-ping" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-cyan-300 text-lg font-medium animate-pulse">
                  {loadingMessage}
                </p>
                <p className="text-slate-500 text-sm">
                  Processing supplier data...
                </p>
              </div>
            </div>
          )}

          {state === "complete" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Comparison Table */}
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 font-semibold">
                        Criteria
                      </TableHead>
                      {mockData.factories.map((factory) => (
                        <TableHead
                          key={factory.id}
                          className="text-center text-slate-300"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">{factory.name}</div>
                            <div className="text-xs text-slate-400 font-normal">
                              {factory.location}
                            </div>
                            {factory.recommended && (
                              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mt-1">
                                RECOMMENDED
                              </Badge>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Unit Price
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell
                          key={factory.id}
                          className="text-center text-slate-200"
                        >
                          {factory.data.price}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Minimum Order Qty
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell
                          key={factory.id}
                          className="text-center text-slate-200"
                        >
                          {factory.data.moq}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Lead Time
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell
                          key={factory.id}
                          className="text-center text-slate-200"
                        >
                          {factory.data.leadTime}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Payment Terms
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell
                          key={factory.id}
                          className="text-center text-slate-200 text-sm"
                        >
                          {factory.data.paymentTerms}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Quality Certified
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell key={factory.id} className="text-center">
                          {renderBooleanCell(factory.data.qualityCertified)}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow className="hover:bg-slate-800/30">
                      <TableCell className="font-medium text-slate-300">
                        Sustainable Practices
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell key={factory.id} className="text-center">
                          {renderBooleanCell(factory.data.sustainablePractices)}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* AI Highlight Row */}
                    <TableRow className="bg-cyan-950/30 border-t-2 border-cyan-500/30 hover:bg-cyan-950/40">
                      <TableCell className="font-semibold text-cyan-300">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          AI Highlight
                        </div>
                      </TableCell>
                      {mockData.factories.map((factory) => (
                        <TableCell
                          key={factory.id}
                          className="text-center text-cyan-200 text-sm italic"
                        >
                          {factory.aiHighlight}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* AI Conclusion Section */}
              <div className="border border-cyan-500/30 rounded-lg bg-gradient-to-br from-cyan-950/30 to-blue-950/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      AI Recommendation
                      <Badge
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-400 text-xs"
                      >
                        Confidence: 94%
                      </Badge>
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {mockData.aiConclusion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setState("idle")}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Regenerate
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
