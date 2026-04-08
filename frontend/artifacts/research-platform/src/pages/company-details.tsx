import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, ExternalLink, Loader2, RefreshCw, FileText, Check, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import {
  type Company,
  type CompanyUpdate,
  type GenerateCompanyReport200,
  generateCompanyReport,
  getCompanyUpdates,
  listCompanies,
  markCompanyUpdateRead,
  scrapeCompany,
} from "@workspace/api-client-react";

export function CompanyDetailsPage() {
  const [, params] = useRoute("/tracker/:companyId");
  const companyId = params?.companyId;
  const queryClient = useQueryClient();
  const [selectedUpdates, setSelectedUpdates] = useState<Set<number>>(new Set());
  const [lastReport, setLastReport] = useState<GenerateCompanyReport200 | null>(null);

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => listCompanies(),
  });

  const company = companies?.find(c => c.id === Number(companyId));

  const { data: updates, isLoading: updatesLoading } = useQuery({
    queryKey: ["companyUpdates", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const data = await getCompanyUpdates(Number(companyId));
      return data?.updates || [];
    },
    enabled: !!companyId,
    refetchInterval: 8000,
  });

  const markReadMutation = useMutation({
    mutationFn: async ({ updateId }: { updateId: number }) => {
      return markCompanyUpdateRead(Number(companyId), updateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyUpdates", companyId] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) return;
      return generateCompanyReport(Number(companyId), {
        update_ids: Array.from(selectedUpdates)
      });
    },
    onSuccess: (data) => {
      if (data) {
        setLastReport(data);
      }
      queryClient.invalidateQueries({ queryKey: ["companyUpdates", companyId] });
    },
  });

  const scrapeNowMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) return;
      return scrapeCompany(Number(companyId));
    },
    onSuccess: () => {
      alert("Search initiated. New insights will appear in the review feed shortly.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companyUpdates", companyId] });
    },
  });

  if (!companyId) return null;

  const officialUpdates = updates?.filter(u => u.source_type === "official") || [];
  const trustedUpdates = updates?.filter(u => u.source_type === "trusted") || [];

  const renderUpdateCard = (update: CompanyUpdate) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={update.id} 
      className={`p-6 rounded-2xl border transition-colors ${update.is_read ? 'bg-card/40 border-border/40' : 'bg-card border-primary/20 shadow-sm'}`}
    >
      <div className="flex gap-4">
        <div className="pt-1">
            <input 
              type="checkbox" 
              checked={selectedUpdates.has(update.id)}
              onChange={(e) => {
                const newSet = new Set(selectedUpdates);
                if (e.target.checked) newSet.add(update.id);
                else newSet.delete(update.id);
                setSelectedUpdates(newSet);
              }}
              className="w-5 h-5 accent-primary cursor-pointer rounded-sm border-border/50"
            />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border tracking-wide uppercase">
              {update.source_type}
            </span>
            <span className="text-sm text-muted-foreground">
              {update.published_date ? new Date(update.published_date).toLocaleDateString() : "Date unavailable"}
            </span>
            {!update.is_read && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">NEW</span>}
          </div>
          {update.url ? (
            <a href={update.url} target="_blank" rel="noreferrer" className="text-xl font-bold hover:text-primary transition-colors flex items-center gap-2 group leading-snug">
              {update.title}
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <p className="text-xl font-bold leading-snug">{update.title}</p>
          )}
          {update.snippet && <p className="text-base text-muted-foreground mt-3 leading-relaxed">{update.snippet}</p>}
        </div>
        
        {!update.is_read && (
          <div className="shrink-0 pl-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              title="Mark as read"
              onClick={() => markReadMutation.mutate({ updateId: update.id })}
              disabled={markReadMutation.isPending}
            >
              <Check className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link href="/tracker">
          <Button variant="ghost" className="mb-6 -ml-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Trackers
          </Button>
        </Link>

        {company ? (
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-foreground flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  {company.name}
                </h1>
                <p className="text-muted-foreground mt-3 md:text-lg flex items-center gap-2">
                  {company.url && <a href={company.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">{company.url} <ExternalLink className="w-3 h-3" /></a>}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => scrapeNowMutation.mutate()}
                    disabled={scrapeNowMutation.isPending}
                    className="gap-2 bg-card border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all font-semibold"
                  >
                  {scrapeNowMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-primary" />} 
                  Initiate Search
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-4 text-sm bg-card border border-border/60 rounded-xl p-4 shadow-sm">
                <div className="flex-1">
                  <span className="text-muted-foreground mr-2">Last Searched:</span>
                  <span className="font-medium text-foreground">{company.last_scanned_at ? new Date(company.last_scanned_at).toLocaleDateString() : 'Never'}</span>
                </div>
                <div className="w-[1px] h-4 bg-border"></div>
                <div className="flex-1">
                  <span className="text-muted-foreground mr-2">Next Scheduled Search:</span>
                  <span className="font-medium text-foreground">{company.next_scanned_at ? new Date(company.next_scanned_at).toLocaleDateString() : 'Pending'}</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse h-32 bg-card rounded-2xl mb-8"></div>
        )}

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">Update Feed</h2>
          {selectedUpdates.size > 0 && (
            <Button 
                variant="default" 
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform shadow-md"
              >
                {generateReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
                Generate Intelligence Report ({selectedUpdates.size})
            </Button>
          )}
        </div>

        {lastReport && (
          <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
            <p className="font-semibold mb-1">Latest Generated Report</p>
            <p className="text-sm text-muted-foreground mb-3">Session: {lastReport.session_id}</p>
            {typeof lastReport.report?.executive_summary === "string" && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-4">{lastReport.report.executive_summary}</p>
            )}
            {lastReport.pdf_url && (
              <a
                href={lastReport.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Preview / Download PDF
              </a>
            )}
          </div>
        )}

        {updatesLoading ? (
            <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : updates?.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl text-muted-foreground bg-card/20 flex flex-col items-center">
              {!company?.last_scanned_at ? (
                <>
                  <Loader2 className="w-12 h-12 mb-4 text-amber-500/50 animate-spin" />
                  <h3 className="text-xl font-medium mb-2 text-foreground/80">Initial Scan in Progress</h3>
                  <p className="max-w-md">Our intelligence engine is currently indexing deep web sources for {company?.name}. This usually takes a few minutes.</p>
                </>
              ) : (
                <>
                  <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2 text-foreground/80">No updates found</h3>
                  <p className="max-w-md">Click "Initiate Search" above to manually trigger the intelligence scraper, or wait for the scheduled monitoring run.</p>
                </>
              )}
            </div>
        ) : (
            <div className="flex flex-col gap-10">
              {officialUpdates.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary border border-primary/20"><Building2 className="w-4 h-4" /></div>
                    Official Sources
                  </h3>
                  <div className="flex flex-col gap-4">
                    {officialUpdates.map(renderUpdateCard)}
                  </div>
                </div>
              )}

              {trustedUpdates.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-foreground">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground border border-border"><ShieldCheck className="w-4 h-4" /></div>
                    Trusted Industry Sources
                  </h3>
                  <div className="flex flex-col gap-4">
                    {trustedUpdates.map(renderUpdateCard)}
                  </div>
                </div>
              )}
            </div>
        )}
      </div>
    </div>
  );
}
