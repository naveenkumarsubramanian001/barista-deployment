import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Building2, FileText, Sparkles, Menu, X } from "lucide-react";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSearchActive = location === "/" || location.startsWith("/session");
  const isTrackerActive = location.startsWith("/tracker");
  const isAnalyzeActive = location.startsWith("/analyze") || location.startsWith("/competetor-analysis");

  const navItems = [
    { href: "/", label: "Search Competitor", icon: Search, active: isSearchActive },
  ];

  const monitorItems = [
    { href: "/tracker", label: "Track Companies", icon: Building2, active: isTrackerActive },
    { href: "/competetor-analysis", label: "Competetor Analysis", icon: FileText, active: isAnalyzeActive },
  ];

  const NavContent = () => (
    <>
      {/* Logo Area */}
      <div className="p-4 flex items-center gap-3 border-b border-border/40">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-display font-bold uppercase tracking-widest text-sm text-foreground">Barista</span>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden ml-auto p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href}>
            <button
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          </Link>
        ))}

        <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Monitoring
        </div>

        {monitorItems.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href}>
            <button
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground/40 text-center">
          Barista CI · v1.0
        </p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border/50 shadow-lg text-foreground hover:bg-secondary/60 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border/50 flex-col shrink-0 z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <NavContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative h-full overflow-y-auto">
        {/* Subtle global gradient background */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0" />
        {children}
      </main>
    </div>
  );
}
