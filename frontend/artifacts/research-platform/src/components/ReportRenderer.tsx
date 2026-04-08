import { motion } from "framer-motion";
import {
  Download,
  BookOpen,
  ShieldCheck,
  Globe,
  Link2,
  ChevronRight,
  Quote,
  Lightbulb,
  BarChart3,
  GitCompareArrows,
  Printer,
  Share2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface Insight {
  title: string;
  brief_summary: string;
  citation_id?: number;
}

interface KeyFinding {
  finding_title: string;
  finding_summary: string;
  source_ids?: number[];
}

interface Reference {
  title: string;
  url: string;
  domain?: string;
  published_date?: string;
  source_type?: string;
}

interface Report {
  report_title?: string;
  executive_summary?: string;
  key_findings?: KeyFinding[];
  official_insights?: Insight[];
  trusted_insights?: Insight[];
  cross_source_analysis?: string;
  references?: Reference[];
  contradiction_metadata?: {
    has_contradictions?: boolean;
    contradiction_count?: number;
    consistency_summary?: string;
    contradictions?: string[];
  };
}

interface ReportRendererProps {
  report: Report;
  downloadUrl?: string | null;
  sessionId: string;
}

// ─── Citation Renderer ────────────────────────────────────────────
function renderTextWithCitations(text: string, onCitationClick: (id: number) => void) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const id = parseInt(match[1], 10);
      return (
        <button
          key={i}
          onClick={() => onCitationClick(id)}
          className="inline-flex items-center justify-center text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded px-1 py-0 mx-0.5 transition-colors cursor-pointer align-baseline leading-none"
          title={`Jump to reference [${id}]`}
        >
          {id}
        </button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ReportRenderer({ report, downloadUrl, sessionId }: ReportRendererProps) {
  const refsRef = useRef<HTMLDivElement>(null);
  const {
    report_title = "Competitive Intelligence Report",
    executive_summary = "",
    key_findings = [],
    official_insights = [],
    trusted_insights = [],
    cross_source_analysis = "",
    references = [],
    contradiction_metadata,
  } = report;

  const scrollToRef = (citationId: number) => {
    const el = document.getElementById(`ref-${citationId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary/50");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary/50"), 2000);
    }
  };

  const contradictionSummary = contradiction_metadata?.consistency_summary ?? "";
  const contradictions = contradiction_metadata?.contradictions ?? [];
  const contradictionCount = contradiction_metadata?.contradiction_count ?? contradictions.length;
  const hasContradictions = contradiction_metadata?.has_contradictions ?? contradictions.length > 0;

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `CI_Report_${sessionId}.pdf`;
      a.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto print:max-w-none"
      id="report-section"
    >
      {/* Report header */}
      <div className="border-b border-border/50 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Research Report
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
          {report_title}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {key_findings.length > 0 && <>{key_findings.length} key finding{key_findings.length !== 1 ? "s" : ""} · </>}
          {official_insights.length} official insight{official_insights.length !== 1 ? "s" : ""} ·{" "}
          {trusted_insights.length} trusted insight{trusted_insights.length !== 1 ? "s" : ""} ·{" "}
          {references.length} source{references.length !== 1 ? "s" : ""}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-full gap-1.5 h-8 text-xs border-border/50"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="rounded-full gap-1.5 h-8 text-xs border-border/50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* ─── Executive Summary ──────────────────────────────────────── */}
      {executive_summary && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Executive Summary
            </h3>
          </div>
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed space-y-4 pl-1">
            {executive_summary.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm leading-7">
                {renderTextWithCitations(paragraph, scrollToRef)}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ─── Key Findings ───────────────────────────────────────────── */}
      {key_findings.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Key Findings
            </h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/50">
              {key_findings.length} finding{key_findings.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-4">
            {key_findings.map((finding, i) => (
              <KeyFindingCard
                key={i}
                index={i + 1}
                finding={finding}
                onCitationClick={scrollToRef}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Official Insights ──────────────────────────────────────── */}
      {official_insights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Official Source Insights
            </h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/50">
              {official_insights.length} insight{official_insights.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-4">
            {official_insights.map((insight, i) => (
              <InsightCard
                key={i}
                index={i + 1}
                insight={insight}
                references={references}
                category="official"
                onCitationClick={scrollToRef}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Trusted Insights ───────────────────────────────────────── */}
      {trusted_insights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Trusted Source Insights
            </h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/50">
              {trusted_insights.length} insight{trusted_insights.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-4">
            {trusted_insights.map((insight, i) => (
              <InsightCard
                key={i}
                index={i + 1}
                insight={insight}
                references={references}
                category="trusted"
                onCitationClick={scrollToRef}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Cross-Source Analysis ───────────────────────────────────── */}
      {cross_source_analysis && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <GitCompareArrows className="w-4 h-4 text-violet-400" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Cross-Source Analysis
            </h3>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
            <div className="space-y-4">
              {cross_source_analysis.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-sm text-foreground/80 leading-7">
                  {renderTextWithCitations(paragraph, scrollToRef)}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── References ─────────────────────────────────────────────── */}
      {references.length > 0 && (
        <section className="mb-10" ref={refsRef}>
          <div className="flex items-center gap-2 mb-5">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-display font-semibold text-foreground">
              Sources & References
            </h3>
          </div>
          <div className="space-y-2">
            {references.map((ref, i) => (
              <a
                key={i}
                id={`ref-${i + 1}`}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
              >
                <span className="shrink-0 text-xs font-mono text-muted-foreground/50 mt-0.5 w-6 text-right">
                  [{i + 1}]
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {ref.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{ref.url}</p>
                  {(ref.domain || ref.published_date) && (
                    <p className="text-xs text-muted-foreground/50 mt-0.5">
                      {ref.domain && <span>{ref.domain}</span>}
                      {ref.domain && ref.published_date && <span> · </span>}
                      {ref.published_date && <span>{ref.published_date}</span>}
                    </p>
                  )}
                </div>
                <ChevronRight className="shrink-0 w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors mt-0.5" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contradiction Analysis */}
      {(contradictionSummary || contradictions.length > 0) && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            {hasContradictions ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <h3 className="text-base font-display font-semibold text-foreground">
              Contradiction Analysis
            </h3>
            <span
              className={[
                "ml-auto text-xs px-2.5 py-0.5 rounded-full border",
                hasContradictions
                  ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
                  : "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
              ].join(" ")}
            >
              {contradictionCount} flagged
            </span>
          </div>

          {contradictionSummary && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {contradictionSummary}
            </p>
          )}

          {contradictions.length > 0 ? (
            <ul className="space-y-2">
              {contradictions.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-foreground/85 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-300/90 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
              No high-signal contradictions detected between official and trusted sources.
            </p>
          )}
        </section>
      )}

      {/* Download Button */}
      <div className="border-t border-border/50 pt-6 flex justify-center print:hidden">
        <Button
          onClick={handleDownload}
          disabled={!downloadUrl}
          className="rounded-full px-8 h-12 font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Download className="w-4 h-4" />
          Download Full Report (PDF)
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Key Finding Card ────────────────────────────────────────────────────────

interface KeyFindingCardProps {
  index: number;
  finding: KeyFinding;
  onCitationClick: (id: number) => void;
}

function KeyFindingCard({ index, finding, onCitationClick }: KeyFindingCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] overflow-hidden transition-colors hover:border-amber-500/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold mt-0.5">
          {index}
        </span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {finding.finding_title}
          </h4>
          {finding.source_ids && finding.source_ids.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-muted-foreground/60">Sources:</span>
              {finding.source_ids.map((sid) => (
                <button
                  key={sid}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCitationClick(sid);
                  }}
                  className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded px-1 py-0 transition-colors"
                >
                  [{sid}]
                </button>
              ))}
            </div>
          )}
        </div>
        <BarChart3 className="w-4 h-4 text-amber-400/50 shrink-0 mt-1" />
      </button>

      {expanded && finding.finding_summary && (
        <div className="px-4 pb-4 pl-14">
          <p className="text-sm text-foreground/75 leading-relaxed">
            {renderTextWithCitations(finding.finding_summary, onCitationClick)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Insight Card ────────────────────────────────────────────────────────────

interface InsightCardProps {
  index: number;
  insight: Insight;
  references: Reference[];
  category: "official" | "trusted";
  onCitationClick: (id: number) => void;
}

function InsightCard({ index, insight, references, category, onCitationClick }: InsightCardProps) {
  const ref =
    insight.citation_id !== undefined && insight.citation_id >= 1 && insight.citation_id <= references.length
      ? references[insight.citation_id - 1]
      : null;

  const isOfficial = category === "official";

  return (
    <div className="p-4 rounded-xl border border-border/50 bg-card/60 hover:border-border transition-colors duration-150">
      {/* Insight header */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className={[
            "shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold",
            isOfficial
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-sky-500/15 text-sky-400",
          ].join(" ")}
        >
          {index}
        </span>
        <h4 className="text-sm font-semibold text-foreground leading-snug">
          {insight.title}
        </h4>
      </div>

      {/* Summary */}
      {insight.brief_summary && (
        <div className="flex gap-3 mb-3 ml-9">
          <Quote className="shrink-0 w-3.5 h-3.5 text-muted-foreground/30 mt-0.5" />
          <p className="text-sm text-foreground/75 leading-relaxed">
            {renderTextWithCitations(insight.brief_summary, onCitationClick)}
          </p>
        </div>
      )}

      {/* Citation */}
      {ref && (
        <div className="ml-9 flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50">Source:</span>
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/70 hover:text-primary underline underline-offset-2 transition-colors line-clamp-1 flex-1 min-w-0"
          >
            {ref.title || ref.url}
          </a>
          {ref.published_date && (
            <span className="text-xs text-muted-foreground/40 shrink-0">{ref.published_date}</span>
          )}
        </div>
      )}
    </div>
  );
}
