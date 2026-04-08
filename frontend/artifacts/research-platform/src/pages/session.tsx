import { useEffect, useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Globe,
  CheckSquare2,
  FileText,
  Loader2,
  Info,
  Star,
} from "lucide-react";
import {
  useGetSession,
  useGetWorkflowStatus,
  useGetArticles,
  useGeneratePdf,
  useGetPdfStatus,
  useGetReport,
} from "@workspace/api-client-react";
import type { Article } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { WorkflowProgress } from "@/components/WorkflowProgress";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleReader } from "@/components/ArticleReader";
import { ReportRenderer } from "@/components/ReportRenderer";

export function SessionPage() {
  const [, params] = useRoute("/session/:sessionId");
  const sessionId = params?.sessionId || "";
  const reportRef = useRef<HTMLDivElement>(null);

  // ── 1. Session Info ────────────────────────────────────────────────
  const { data: sessionData } = useGetSession(sessionId, {
    query: { enabled: !!sessionId } as any,
  });

  // ── 2. Workflow Polling ─────────────────────────────────────────────
  const { data: workflowData } = useGetWorkflowStatus(sessionId, {
    query: {
      enabled: !!sessionId,
      refetchInterval: (query: any) => {
        const status = query.state.data?.status;
        return status === "completed" || status === "failed" ? false : 2500;
      },
    } as any,
  });

  // ── 3. Articles (only when workflow completes) ──────────────────────
  const isWorkflowCompleted = workflowData?.status === "completed";
  const isSelectionStage = workflowData?.current_stage === "select";
  const isReportFinished = workflowData?.current_stage === "finished";
  const { data: articlesData, isLoading: articlesLoading } = useGetArticles(sessionId, {
    query: { enabled: isSelectionStage } as any,
  });

  // ── 4. Selection State ──────────────────────────────────────────────
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (articlesData && selectedUrls.size === 0) {
      const defaults = new Set<string>();
      articlesData.official_articles?.slice(0, 3).forEach((a) => defaults.add(a.url));
      articlesData.trusted_articles?.slice(0, 3).forEach((a) => defaults.add(a.url));
      if (defaults.size > 0) setSelectedUrls(defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articlesData]);

  // Auto-selected URLs: top-3 per category
  const autoSelectedUrls = new Set<string>([
    ...(articlesData?.official_articles?.slice(0, 3).map((a) => a.url) ?? []),
    ...(articlesData?.trusted_articles?.slice(0, 3).map((a) => a.url) ?? []),
  ]);

  const toggleSelection = (id: string, url: string) => {
    console.log('[ArticleSelection] Toggle:', { id, url, currently_selected: Array.from(selectedUrls) });
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      console.log('[ArticleSelection] After toggle:', { url, selected: next.has(url), all_selected: Array.from(next) });
      return next;
    });
  };

  // ── 5. Article Reader ───────────────────────────────────────────────
  const [readerArticle, setReaderArticle] = useState<Article | null>(null);

  // ── 6. PDF & Report Generation ─────────────────────────────────────
  const { mutate: generatePdf, isPending: isStartingPdf } = useGeneratePdf();
  const [isPdfPolling, setIsPdfPolling] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { data: pdfData } = useGetPdfStatus(sessionId, {
    query: {
      enabled: isPdfPolling,
      refetchInterval: (query: any) => {
        const s = query.state.data?.status;
        return s === "completed" || s === "failed" ? false : 2500;
      },
    } as any,
  });

  // When PDF status completes → fetch report JSON
  useEffect(() => {
    if (pdfData?.status === "completed") {
      setIsPdfPolling(false);
      setReportReady(true);
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    } else if (pdfData?.status === "failed") {
      setIsPdfPolling(false);
      setGenerationError("Report generation failed. Please try again.");
    }
  }, [pdfData?.status]);

  // Fetch report JSON once ready
  const { data: reportData } = useGetReport(sessionId, {
    query: { enabled: reportReady || isReportFinished } as any,
  });

  useEffect(() => {
    if (isReportFinished && reportData?.report) {
      setReportReady(true);
    }
  }, [isReportFinished, reportData?.report]);

  const isGeneratingReport =
    isStartingPdf || isPdfPolling || pdfData?.status === "generating";

  const handleGenerateReport = () => {
    const selectedArray = Array.from(selectedUrls);
    console.log('[ReportGeneration] Sending selected URLs:', { count: selectedArray.length, urls: selectedArray });
    setGenerationError(null);
    generatePdf(
      { sessionId, data: { selected_article_urls: selectedArray } },
      {
        onSuccess: () => {
          console.log('[ReportGeneration] PDF generation started successfully');
          setIsPdfPolling(true);
        },
        onError: (err: any) => {
          console.error('[ReportGeneration] Error:', err);
          setGenerationError(err?.message ?? "Failed to start report generation.");
        },
      }
    );
  };

  // ── Derived counts ─────────────────────────────────────────────────
  const officialArticles = articlesData?.official_articles ?? [];
  const trustedArticles = articlesData?.trusted_articles ?? [];
  const totalSources = officialArticles.length + trustedArticles.length;
  const currentStage = workflowData?.current_stage;
  const isFinished = currentStage === "finished" || reportReady;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-secondary/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-border/60" />
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <h1 className="text-sm font-semibold truncate text-foreground">
            {sessionData?.query || "Research Session"}
          </h1>
          {isWorkflowCompleted && !reportReady && (
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full border border-border/40 shrink-0">
              {totalSources} sources found
            </span>
          )}
          {reportReady && (
            <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
              Report ready
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-0">
        {/* ══ PHASE 1: Research Progress ═══════════════════════════════ */}
        <AnimatePresence>
          {!isWorkflowCompleted && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WorkflowProgress
                stages={workflowData?.stages ?? []}
                status={workflowData?.status ?? "pending"}
                progressPercentage={workflowData?.progress_percentage ?? 0}
                logs={workflowData?.logs}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PHASE 2: Source Review Panel ═════════════════════════════ */}
        {isSelectionStage && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Review header */}
            <div className="pt-4">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">
                Review Sources
              </h2>
              <p className="text-sm text-muted-foreground">
                Select sources to include in the final report. The top sources are pre-selected — you can adjust as needed.
              </p>
            </div>

            {/* Info banner — auto-selected sources */}
            {autoSelectedUrls.size > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
                <Info className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">
                    {autoSelectedUrls.size} top source{autoSelectedUrls.size !== 1 ? "s" : ""}{" "}
                    auto-selected
                  </span>{" "}
                  based on relevance score. You can deselect any or add more from the candidates below.
                </p>
              </div>
            )}

            {/* Loading state */}
            {articlesLoading && (
              <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm">Loading sources…</span>
              </div>
            )}

            {/* ── Official Sources ────────────────────────────────────── */}
            {officialArticles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-foreground">Official Sources</h3>
                  <span className="text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40 ml-auto">
                    {officialArticles.length} found
                  </span>
                </div>

                {/* Top 3 auto-selected */}
                {officialArticles.slice(0, 3).length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Star className="w-3 h-3 text-amber-400" />
                      Auto-selected (top match)
                    </p>
                    {officialArticles.slice(0, 3).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        isSelected={selectedUrls.has(article.url)}
                        isAutoSelected={true}
                        onToggle={toggleSelection}
                        onClickRead={setReaderArticle}
                      />
                    ))}
                  </div>
                )}

                {/* Remaining candidates */}
                {officialArticles.length > 3 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Additional candidates
                    </p>
                    {officialArticles.slice(3).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        isSelected={selectedUrls.has(article.url)}
                        isAutoSelected={false}
                        onToggle={toggleSelection}
                        onClickRead={setReaderArticle}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Trusted Sources ─────────────────────────────────────── */}
            {trustedArticles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-foreground">Trusted Analysis & News</h3>
                  <span className="text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full border border-border/40 ml-auto">
                    {trustedArticles.length} found
                  </span>
                </div>

                {trustedArticles.slice(0, 3).length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Star className="w-3 h-3 text-amber-400" />
                      Auto-selected (top match)
                    </p>
                    {trustedArticles.slice(0, 3).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        isSelected={selectedUrls.has(article.url)}
                        isAutoSelected={true}
                        onToggle={toggleSelection}
                        onClickRead={setReaderArticle}
                      />
                    ))}
                  </div>
                )}

                {trustedArticles.length > 3 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Additional candidates
                    </p>
                    {trustedArticles.slice(3).map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        isSelected={selectedUrls.has(article.url)}
                        isAutoSelected={false}
                        onToggle={toggleSelection}
                        onClickRead={setReaderArticle}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Empty state */}
            {!articlesLoading && totalSources === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No sources found for this query.</p>
                <p className="text-xs mt-1 opacity-60">Try broadening your query and searching again.</p>
              </div>
            )}

            {/* ── Generate Report CTA ─────────────────────────────────── */}
            {!reportReady && totalSources > 0 && (
              <div className="border-t border-border/40 pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CheckSquare2 className="w-4 h-4 text-primary" />
                      {selectedUrls.size} source{selectedUrls.size !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      These will be used for deep analysis and insight generation.
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={selectedUrls.size === 0 || isGeneratingReport}
                    className="rounded-full px-7 h-11 font-semibold gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Report…
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>

                {generationError && (
                  <p className="mt-3 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20">
                    {generationError}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ══ PHASE 3: Inline Report ════════════════════════════════════ */}
        <AnimatePresence>
          {reportReady && reportData && (
            <motion.div
              key="report"
              ref={reportRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-12 pt-10 border-t border-border/40"
            >
              <ReportRenderer
                report={reportData.report}
                downloadUrl={reportData.pdf_url ?? pdfData?.download_url}
                sessionId={sessionId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Article Reader Panel */}
      <ArticleReader
        article={readerArticle}
        isOpen={!!readerArticle}
        onClose={() => setReaderArticle(null)}
      />
    </div>
  );
}
