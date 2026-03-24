"use client";

import Link from "next/link";
import {
  Home,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Lock,
  Anchor,
  User,
  LogOut,
  Gavel,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useNav } from "./nav-provider";
import { useRouter } from "next/navigation";
import { useThreadWatcher } from "./thread-watcher-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, useTransition } from "react";
import { logout } from "@/lib/actions/auth.actions";

interface NavControlsProps {
  user: any;
}

export function NavControls({ user }: NavControlsProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { 
    position, 
    togglePosition, 
    defaultBoardView, 
    toggleDefaultBoardView,
    autoPlayGif,
    toggleAutoPlayGif
  } = useNav();
  const { toggleWatcher, watchedThreads } = useThreadWatcher();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-6 w-20" />;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground/50">[</span>
      
      {/* Refresh Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleRefresh}
            className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
            title="Segarkan halaman (Refresh)"
          >
            <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Segarkan halaman</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50">/</span>
      
      {/* Thread Watcher Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleWatcher}
            className="relative opacity-80 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
            title="Thread Watcher"
          >
            <Eye className="size-3.5" />
            {watchedThreads.some(t => t.currentReplyCount > t.lastReadReplyCount) && (
              <span className={cn(
                "absolute -top-1 -right-1 size-2 rounded-full border border-background",
                watchedThreads.some(t => t.hasNewReplyToMe) ? "bg-red-500" : "bg-primary"
              )} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Utas yang diikuti</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50">/</span>

      {/* Rules Link */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/rules"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <Gavel className="size-3.5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">Peraturan</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50">/</span>

      {/* Admin/Mod Link if user exists */}
      {user && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/mod"
                className="text-accent opacity-80 hover:opacity-100 transition-opacity font-bold"
              >
                <Lock className="size-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Panel Mod</TooltipContent>
          </Tooltip>
          <span className="text-muted-foreground/50">/</span>
        </>
      )}

      {/* Settings Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <Settings className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 text-[11px] font-mono">
          <DropdownMenuLabel className="flex items-center gap-2 h-[26px] py-0 opacity-80">
            <Settings className="size-3.5" />
            Pengaturan
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={togglePosition}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer h-[26px] py-0"
          >
            <span>Navigasi Melayang</span>
            <span className="ml-auto opacity-50 font-bold">
              {position === "sticky" ? "✔" : "✘"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={toggleDefaultBoardView}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer h-[26px] py-0"
          >
            <span>Katalog sebagai Default</span>
            <span className="ml-auto opacity-50 font-bold">
              {defaultBoardView === "catalog" ? "✔" : "✘"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={toggleAutoPlayGif}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer h-[26px] py-0"
          >
            <span>Putar GIF Otomatis</span>
            <span className="ml-auto opacity-50 font-bold">
              {autoPlayGif ? "✔" : "✘"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer h-[26px] py-0"
          >
            <span>Mode {resolvedTheme === "dark" ? "Terang" : "Gelap"}</span>
          </DropdownMenuItem>

          {user && (
            <>
              <DropdownMenuSeparator />
              <form action={logout}>
                <button type="submit" className="w-full text-left">
                  <DropdownMenuItem className="cursor-pointer h-[26px] py-0 text-destructive focus:text-destructive">
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-muted-foreground/50">]</span>
    </div>
  );
}
