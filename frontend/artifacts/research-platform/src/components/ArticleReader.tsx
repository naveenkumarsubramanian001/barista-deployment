import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Article } from "@workspace/api-client-react";
import { useGetArticleContent } from "@workspace/api-client-react";
import {
  Loader2,
  ExternalLink,
  ShieldCheck,
  Globe,
  X,
  FileWarning,
  BookOpen,
} from "lucide-react";

interface ArticleReaderProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleReader({ article, isOpen, onClose }: ArticleReaderProps) {
  const { data, isLoading, isError } = useGetArticleContent(
    { url: article?.url || "" },
    {
      query: {
        enabled: isOpen && !!article?.url,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      } as any,
    }
  );

  const isOfficial = article?.category === "official";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-card border-l border-border/50 shadow-2xl"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border/50 px-5 py-4">
          <SheetHeader className="space-y-2 text-left pr-8">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border gap-1",
                  isOfficial
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-sky-500/10 text-sky-400 border-sky-500/20",
                ].join(" ")}
              >
                {isOfficial ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                {isOfficial ? "Official Source" : "Trusted Source"}
              </span>
              {article?.domain && (
                <span className="text-xs text-muted-foreground">{article.domain}</span>
              )}
            </div>

            <SheetTitle className="text-base font-display font-bold text-foreground leading-snug line-clamp-3">
              {article?.title}
            </SheetTitle>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs rounded-full border-border/50 hover:border-primary/30 gap-1.5"
                onClick={() => window.open(article?.url, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-3 h-3" />
                Open Original
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3"
              >
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm">Extracting article content…</p>
              </motion.div>
            ) : isError || (data && !data.can_embed && data.error) ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-16 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <FileWarning className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Content extraction failed
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                    {data?.error ||
                      "This source may be behind a paywall or restrict automated access."}
                  </p>
                </div>
                {article?.snippet && (
                  <div className="w-full mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      Snippet preview
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {article.snippet}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => window.open(article?.url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Read on original site
                </Button>
              </motion.div>
            ) : data?.content ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="prose prose-sm prose-invert max-w-none leading-relaxed text-foreground/85"
              >
                <div className="whitespace-pre-wrap text-sm leading-7 font-sans">
                  {data.content}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-16 text-center"
              >
                <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No readable content found for this source.
                </p>
                {article?.snippet && (
                  <div className="w-full mt-2 p-4 rounded-xl bg-secondary/50 border border-border/50 text-left">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Snippet
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {article.snippet}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
