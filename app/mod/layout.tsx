"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  History, 
  ShieldAlert, 
  ShieldX, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/mod/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Main Nav */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-3 hover:opacity-90 transition-all">
              <div className="flex flex-col items-start leading-none">
                <p className="text-[8px] font-mono text-accent/70 tracking-[0.2em] uppercase mb-0.5">
                  62チャンネル
                </p>
                <span className="font-bold text-xl tracking-tighter">
                  62<span className="text-accent underline decoration-2 decoration-accent/20 underline-offset-2">chan</span>
                  <span className="ml-1 text-[9px] text-muted-foreground font-normal tracking-widest uppercase opacity-50">Staff</span>
                </span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
               <TabLink href="/mod" active={pathname === "/mod"} icon={<ShieldAlert className="h-4 w-4" />}>Antrian</TabLink>
               <TabLink href="/mod/history" active={pathname === "/mod/history"} icon={<History className="h-4 w-4" />}>Riwayat</TabLink>
               <TabLink href="/mod/bans" active={pathname === "/mod/bans"} icon={<ShieldX className="h-4 w-4" />}>Cekal IP</TabLink>
            </nav>
          </div>


        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
}

function TabLink({ href, icon, active, children }: { href: string; icon: React.ReactNode; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button 
        variant={active ? "secondary" : "ghost"} 
        size="sm" 
        className={cn(
            "flex items-center gap-2 transition-all",
            active ? "bg-primary/10 text-primary font-bold shadow-inner" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
        )}
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
}
