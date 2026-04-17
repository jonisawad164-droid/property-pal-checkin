import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Wind, LogOut, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30 shadow-[var(--shadow-card)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-foreground">OVK</div>
              <div className="text-xs text-muted-foreground hidden sm:block">Besiktningar</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Button asChild variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm">
              <Link to="/">
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Protokoll</span>
              </Link>
            </Button>
            <Button asChild variant={location.pathname === "/inspections/new" ? "secondary" : "ghost"} size="sm">
              <Link to="/inspections/new">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nytt</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logga ut</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};
