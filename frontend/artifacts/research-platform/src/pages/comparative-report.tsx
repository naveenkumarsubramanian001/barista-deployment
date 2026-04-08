import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, ArrowLeft, Loader2, Sparkles, Building2, Plus } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getAnalyzeStatus, importCompetitors } from "@workspace/api-client-react";

interface ComparativeReport {
  report_title: string;
  executive_summary: string;
  competitors: {
    name: string;
    domain: string;
    strengths: string[];
    weaknesses: string[];
    pricing_strategy: string;
    key_features: string[];
  }[];
  user_product_positioning: string;
  recommendations: string[];
}

export function ComparativeReportPage() {
  const [matchCompetetor, paramsCompetetor] = useRoute("/competetor-analysis/report/:sessionId");
  const [matchLegacy, paramsLegacy] = useRoute("/analyze/report/:sessionId");
  const sessionId = matchCompetetor ? paramsCompetetor?.sessionId : matchLegacy ? paramsLegacy?.sessionId : undefined;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reportData, isLoading, error } = useQuery<{ report_data: ComparativeReport }>({
    queryKey: ["analyze-status", sessionId],
    queryFn: async () => {
      const data = await getAnalyzeStatus(sessionId || "");
      if (!data.report_data) throw new Error("Report not ready yet or failed");
      return { report_data: data.report_data as unknown as ComparativeReport };
    },
    enabled: !!sessionId,
    refetchInterval: (query) => query.state?.data?.report_data ? false : 3000,
  });

  const handleDownload = () => {
    window.location.href = `${API_BASE}/analyze/download/${sessionId}`;
  };

  const importCompetitorsMutation = useMutation({
    mutationFn: async (competitors: ComparativeReport["competitors"]) => {
      const idemKey = `import-competitors-${crypto.randomUUID()}`;
      return importCompetitors(
        {
          competitors: competitors.map((comp) => ({
            name: comp.name,
            domain: comp.domain,
          })),
        },
        { headers: { "Idempotency-Key": idemKey } }
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Competitors added",
        description: `${data.count} companies are now in your tracker.`,
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Could not add competitors to tracker.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !reportData?.report_data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading intelligence report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <p className="text-destructive mb-4">Failed to load comparative report.</p>
        <Link href="/competetor-analysis">
          <button className="px-4 py-2 border rounded font-medium hover:bg-muted">Go Back</button>
        </Link>
      </div>
    );
  }

  const r = reportData.report_data;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background relative overflow-y-auto w-full">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none z-0" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-6">
          <Link href="/competetor-analysis">
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Competetor Analysis
            </button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground mb-3">
              {r.report_title}
            </h1>
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Generated Intelligence
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="mb-8">
          <button
            onClick={() => importCompetitorsMutation.mutate(r.competitors || [])}
            disabled={importCompetitorsMutation.isPending || !r.competitors?.length}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {importCompetitorsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add All Competitors To Tracker
          </button>
        </div>

        <div className="space-y-8">
          {/* Executive Summary */}
          <section className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Executive Summary</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {r.executive_summary}
            </div>
          </section>

          {/* User Positioning */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Your Market Positioning</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap">
              {r.user_product_positioning}
            </div>
          </section>

          {/* Competitors Grid */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Competitor Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {r.competitors?.map((comp, idx) => (
                <div key={idx} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col shadow-sm">
                  <h3 className="font-bold text-lg mb-1">{comp.name}</h3>
                  <a href={`https://${comp.domain}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mb-6 font-mono">
                    {comp.domain}
                  </a>
                  
                  <div className="space-y-4 flex-1">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Strengths</h4>
                      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                        {comp.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weaknesses</h4>
                      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                        {comp.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {comp.key_features?.map((kf, i) => (
                          <span key={i} className="px-2 py-1 bg-muted text-xs rounded-md text-foreground/70">{kf}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Strategic Recommendations</h2>
            <ul className="space-y-3">
              {r.recommendations?.map((rec, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="mt-0.5">{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
