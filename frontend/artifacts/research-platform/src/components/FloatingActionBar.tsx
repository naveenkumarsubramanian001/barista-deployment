import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionBarProps {
  selectedCount: number;
  onGeneratePdf: () => void;
  isGenerating: boolean;
  pdfStatus: string | null;
  downloadUrl?: string | null;
}

export function FloatingActionBar({ 
  selectedCount, 
  onGeneratePdf, 
  isGenerating,
  pdfStatus,
  downloadUrl
}: FloatingActionBarProps) {
  if (selectedCount === 0 && !isGenerating && !pdfStatus) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto rounded-full px-6 py-4 flex items-center gap-6 bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {selectedCount} Source{selectedCount !== 1 ? 's' : ''} Selected
            </span>
            <span className="text-xs text-muted-foreground">
              Used for primary deep analysis
            </span>
          </div>

          <div className="w-px h-8 bg-border" />

          {pdfStatus === 'completed' && downloadUrl ? (
            <Button 
              className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-emerald-500 border-0"
              onClick={() => window.open(downloadUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report PDF
            </Button>
          ) : (
            <Button 
              className="rounded-full px-6 shadow-lg shadow-primary/25 border-0 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onGeneratePdf}
              disabled={selectedCount === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
