import { Check, Globe, ShieldCheck, BookOpen, Star } from "lucide-react";
import type { Article } from "@workspace/api-client-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  isAutoSelected?: boolean;
  onToggle: (id: string, url: string) => void;
  onClickRead: (article: Article) => void;
}

export function ArticleCard({
  article,
  isSelected,
  isAutoSelected = false,
  onToggle,
  onClickRead,
}: ArticleCardProps) {
  const isOfficial = article.category === "official";
  const scorePercent = Math.round(Math.min(article.score, 1) * 100);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
        isSelected
          ? "border-primary/40 bg-primary/[0.04]"
          : "border-border/50 hover:border-border bg-card/60 hover:bg-card/80"
      )}
    >
      {/* Auto-selected indicator */}
      {isAutoSelected && (
        <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(article.id, article.url);
        }}
        className={cn(
          "shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-all duration-200",
          isSelected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border/60 bg-background hover:border-primary/40"
        )}
        aria-label={isSelected ? "Deselect source" : "Select source"}
      >
        <Check
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
          strokeWidth={2.5}
        />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
              isOfficial
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-sky-500/10 text-sky-400 border-sky-500/20"
            )}
          >
            {isOfficial ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            {isOfficial ? "Official" : "Trusted"}
          </span>

          {isAutoSelected && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-3 h-3" />
              Auto-selected
            </span>
          )}

          {scorePercent > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground ml-auto">
              {scorePercent}% match
            </span>
          )}
        </div>

        {/* Title */}
        <button
          onClick={() => onClickRead(article)}
          className="text-left w-full"
        >
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1.5">
            {article.title}
          </h3>
        </button>

        {/* Snippet */}
        {article.snippet && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
            {article.snippet}
          </p>
        )}

        <p className="text-[11px] text-muted-foreground/70 truncate mb-2">
          Citation: {article.url}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <img
              src={`https://www.google.com/s2/favicons?domain=${article.domain}&sz=32`}
              alt=""
              className="w-3.5 h-3.5 rounded-sm object-contain bg-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-3.5 h-3.5 rounded bg-secondary/80 flex flex-col items-center justify-center text-[8px] uppercase font-bold text-foreground/70">
              {article.domain.charAt(0)}
            </div>
            <span className="truncate max-w-[140px]">{article.domain}</span>
          </div>

          <div className="flex items-center gap-3">
            {article.published_date && (
              <span className="text-xs text-muted-foreground/60 shrink-0">
                {new Date(article.published_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) !== "Invalid Date" ? new Date(article.published_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : article.published_date}
              </span>
            )}
            <button
              onClick={() => onClickRead(article)}
              className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
