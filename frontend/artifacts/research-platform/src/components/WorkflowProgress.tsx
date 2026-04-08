import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Brain,
  Search,
  Filter,
  FileText,
  Globe,
  Telescope,
} from "lucide-react";
import type { WorkflowStage } from "@workspace/api-client-react";

interface WorkflowProgressProps {
  stages: WorkflowStage[];
  status: string;
  progressPercentage: number;
  logs?: string[];
}

const STEP_ICONS = [Brain, Telescope, Globe, Filter, Search, FileText];

const STEP_DESCRIPTIONS: Record<string, string> = {
  understand: "Parsing your query to identify intent, entities, and context.",
  identify: "Detecting the company, product, or technology domain to focus research.",
  collect: "Scanning official and trusted sources for relevant content.",
  filter: "Evaluating, ranking, and de-duplicating source candidates.",
  analyze: "Deep-reading top sources and extracting structured insights.",
  prepare: "Organising citations and preparing results for your review.",
};

export function WorkflowProgress({ stages, status, progressPercentage }: WorkflowProgressProps) {
  const isComplete = status === "completed";

  // Generate synthetic intermediate steps even before backend stages arrive
  const displayStages =
    stages && stages.length > 0
      ? stages
      : [
          { id: "understand", label: "Understanding your query", status: "running" },
          { id: "identify", label: "Identifying topic & domain", status: "pending" },
          { id: "collect", label: "Collecting source candidates", status: "pending" },
          { id: "filter", label: "Filtering & ranking content", status: "pending" },
          { id: "analyze", label: "Analyzing selected documents", status: "pending" },
          { id: "prepare", label: "Preparing results for review", status: "pending" },
        ] as WorkflowStage[];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            {isComplete ? "Research Complete" : "Researching"}
          </span>
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          {isComplete ? "Sources ready for review" : "Gathering intelligence…"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          {isComplete
            ? "Scroll down to review and select the sources for your report."
            : "Our AI agents are analysing the web to find the most relevant sources."}
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="mb-8 px-1">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {displayStages.map((stage, idx) => {
            const Icon = STEP_ICONS[idx % STEP_ICONS.length];
            const isRunning = stage.status === "running";
            const isDone = stage.status === "completed";
            const desc = STEP_DESCRIPTIONS[stage.id] ?? "";

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                className={[
                  "flex items-start gap-4 p-4 rounded-xl border transition-all duration-500",
                  isDone
                    ? "border-border/50 bg-card/40"
                    : isRunning
                    ? "border-primary/30 bg-primary/[0.05] glow-border"
                    : "border-border/30 bg-card/20 opacity-50",
                ].join(" ")}
              >
                {/* Status icon */}
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : isRunning ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-border" />
                  )}
                </div>

                {/* Step icon + text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={[
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                      isDone
                        ? "bg-primary/10 text-primary"
                        : isRunning
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary/50 text-muted-foreground",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={[
                        "text-sm font-semibold leading-snug",
                        isDone
                          ? "text-foreground/70"
                          : isRunning
                          ? "text-foreground"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {stage.label}
                    </p>
                    {(isRunning || isDone) && desc && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-muted-foreground mt-1 leading-relaxed"
                      >
                        {desc}
                      </motion.p>
                    )}
                    {isRunning && (
                      <div className="flex gap-1 mt-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-primary/60"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
