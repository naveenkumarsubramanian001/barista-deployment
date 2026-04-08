import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, BookOpen, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTips, useStartSearch } from "@workspace/api-client-react";

export function HomePage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [showTips, setShowTips] = useState(true);
  
  const { data: tipsData, isLoading: tipsLoading } = useGetTips();
  const { mutate: startSearch, isPending } = useStartSearch({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/session/${data.session_id}`);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;
    startSearch({ data: { query } });
  };

  const handleTipClick = (text: string) => {
    setQuery(text);
    startSearch({ data: { query: text } });
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(217 76% 60% / 1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(217 76% 60% / 1) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(217_76%_60%_/_0.12),transparent)]" />
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-3xl mx-auto mt-[-6vh]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex flex-col items-center text-center space-y-8"
        >
          {/* Logo & Branding */}
          <div className="flex flex-col items-center gap-6 mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 text-primary shadow-2xl shadow-primary/20">
              <Sparkles className="w-10 h-10 animate-pulse-subtle" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground leading-none">
              Barista <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50">AI</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground/70 max-w-md mt-3 leading-relaxed">
              AI-powered competitive intelligence. Research any company, product, or market in seconds.
            </p>
          </div>

          {/* Search */}
          <div className="w-full mt-4">
            <form onSubmit={handleSubmit}>
              <div className="relative bg-card border border-border/60 rounded-2xl shadow-lg flex items-center px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                <Search className="w-5 h-5 text-muted-foreground ml-2 mr-2 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. What are OpenAI's latest product releases?"
                  className="flex-1 h-12 md:h-14 text-base bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50 px-1"
                  disabled={isPending}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as any)}
                />
                <Button
                  type="submit"
                  disabled={!query.trim() || isPending}
                  className="h-10 md:h-12 px-5 md:px-7 rounded-xl font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-0 shrink-0"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting…
                    </>
                  ) : (
                    <>
                      Research
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Tips toggle */}
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showTips ? "Hide" : "Try an example query"}
              </button>
            </div>

            {/* Tips */}
            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap justify-center gap-2">
                    {tipsLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-8 w-48 bg-secondary/60 animate-pulse rounded-full" />
                        ))
                      : tipsData?.tips?.map((tip) => (
                          <button
                            key={tip.id}
                            onClick={() => handleTipClick(tip.text)}
                            disabled={isPending}
                            className="px-4 py-1.5 rounded-full border border-border/50 bg-card/60 hover:bg-card hover:border-primary/30 text-sm text-foreground/75 hover:text-foreground transition-all duration-150 hover:-translate-y-0.5 text-left flex items-center max-w-[280px]"
                          >
                            <span className="truncate">{tip.text}</span>
                            <ArrowRight className="w-3 h-3 ml-1.5 shrink-0 opacity-40" />
                          </button>
                        ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-muted-foreground/40">
          Barista CI · AI-powered competitive intelligence research
        </p>
      </footer>
    </div>
  );
}
