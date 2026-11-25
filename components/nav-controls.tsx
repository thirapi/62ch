"use client";

import Link from "next/link";
import { Lock, Gavel, RefreshCw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useThreadWatcher } from "./thread-watcher-provider";
import { SettingsModal } from "./settings-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState, useTransition } from "react";

interface NavControlsProps {
  user: any;
}

export function NavControls({ user }: NavControlsProps) {
  const { toggleWatcher, watchedThreads } = useThreadWatcher();
  // The watcher list comes from localStorage; only show the badge after hydration
  // so server HTML and the first client render always match.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
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
          >
            <Eye className="size-3.5" />
            {hydrated && watchedThreads.some(t => t.currentReplyCount > t.lastReadReplyCount) && (
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

      <SettingsModal user={user} />
      <span className="text-muted-foreground/50">]</span>
    </div>
  );
}
