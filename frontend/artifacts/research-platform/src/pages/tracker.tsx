import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  type Company,
  type Notification,
  createCompany,
  getNotifications,
  listCompanies,
  markNotificationRead,
} from "@workspace/api-client-react";

export function TrackerPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyUrl, setNewCompanyUrl] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => listCompanies(),
  });

  const addCompanyMutation = useMutation({
    mutationFn: (newCompany: { name: string; url?: string }) => createCompany(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setNewCompanyName("");
      setNewCompanyUrl("");
    },
  });

  const { data: notificationsData } = useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ limit: 5 }) as Promise<{ notifications: Notification[]; unread_count: number }>,
    refetchInterval: 10000,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    addCompanyMutation.mutate({ name: newCompanyName, url: newCompanyUrl || undefined });
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground overflow-hidden w-full">
      {/* Background styling elements */}
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
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsl(217_76%_60%_/_0.12),transparent)] pointer-events-none" />

      {/* ContentWrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col flex-1">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Tracker</span>
          </h1>
        </div>
        
        <form onSubmit={handleAddCompany} className="flex gap-3 bg-card border border-border/50 p-2 rounded-xl shadow-sm items-center">
            <input 
              type="text" 
              placeholder="Company Name" 
              className="bg-transparent border-none text-sm outline-none px-2 w-32"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              disabled={addCompanyMutation.isPending}
            />
            <div className="w-[1px] h-6 bg-border/50"></div>
            <input 
              type="text" 
              placeholder="Website URL (optional)" 
              className="bg-transparent border-none text-sm outline-none px-2 w-40"
              value={newCompanyUrl}
              onChange={e => setNewCompanyUrl(e.target.value)}
              disabled={addCompanyMutation.isPending}
            />
            <Button size="sm" type="submit" disabled={!newCompanyName.trim() || addCompanyMutation.isPending} className="rounded-lg gap-2">
              {addCompanyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
            </Button>
        </form>
      </header>

      <main className="relative z-10 w-full mb-12">
          {(notificationsData?.notifications?.length ?? 0) > 0 && (
            <div className="mb-6 p-4 rounded-xl border border-border/60 bg-card/70">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Recent Notifications</p>
                {(notificationsData?.unread_count ?? 0) > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {notificationsData?.unread_count} unread
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {notificationsData?.notifications?.slice(0, 3).map((n) => (
                  <div key={n.id} className={`text-sm flex items-start justify-between gap-3 ${n.is_read ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                    <div>
                      <span className={`font-medium ${n.is_read ? "text-foreground/70" : "text-foreground"}`}>{n.title}</span> - {n.message}
                    </div>
                    {!n.is_read && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => markNotificationReadMutation.mutate(n.id)}
                        disabled={markNotificationReadMutation.isPending}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : companies?.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-border/60 rounded-xl text-muted-foreground bg-card/30">
              No companies tracked yet. Add one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies?.map(company => (
                <motion.div
                  key={company.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation(`/tracker/${company.id}`)}
                  className="flex flex-col h-full text-left p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 shadow-sm relative overflow-hidden group cursor-pointer"
                >
                  <motion.div 
                    className="contents"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-foreground">{company.name}</h3>
                          {company.url && <p className="text-sm text-muted-foreground line-clamp-1">{company.url}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-border/50 gap-2">
                      <div className="text-sm text-muted-foreground">
                        {!company.last_scanned_at ? (
                          <span className="flex items-center gap-1.5 font-medium text-amber-500/80">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Discovering...
                          </span>
                        ) : company.unread_count === 0 ? "All caught up" : (
                           <span className="text-primary font-semibold block animate-pulse-subtle">{company.unread_count} New Updates</span>
                        )}
                      </div>
                      <div className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                        View Feed →
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
