"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  History, 
  ShieldAlert, 
  ShieldX, 
  Settings,
  UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModHeader({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/mod/login";

  if (isLoginPage) return null;

  return (
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
              <TabLink href="/mod" active={pathname === "/mod"} icon={<ShieldAlert className="h-4 w-4" />}>Laporan</TabLink>
              {role !== "janitor" && (
                <>
                  <TabLink href="/mod/boards" active={pathname.startsWith("/mod/boards")} icon={<Settings className="h-4 w-4" />}>Board</TabLink>
                  <TabLink href="/mod/categories" active={pathname.startsWith("/mod/categories")} icon={<Settings className="h-4 w-4" />}>Kategori</TabLink>
                </>
              )}
              <TabLink href="/mod/history" active={pathname === "/mod/history"} icon={<History className="h-4 w-4" />}>Riwayat</TabLink>
              <TabLink href="/mod/bans" active={pathname === "/mod/bans"} icon={<ShieldX className="h-4 w-4" />}>Blokir IP</TabLink>
              {role === "admin" && (
                <TabLink href="/mod/janitors" active={pathname.startsWith("/mod/janitors")} icon={<UserCog className="h-4 w-4" />}>Janitor</TabLink>
              )}
          </nav>
        </div>
      </div>
    </header>
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
