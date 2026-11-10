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
    toggleAutoPlayGif,
    autoUpdateThread,
    toggleAutoUpdateThread,
    hoverPreview,
    toggleHoverPreview,
  } = useNav();
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

      {/* Rules Link - Hidden on mobile, moved to dropdown */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/rules"
            className="opacity-80 hover:opacity-100 transition-opacity hidden sm:inline"
          >
            <Gavel className="size-3.5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">Peraturan</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground/50 hidden sm:inline">/</span>

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
        <DropdownMenuContent align="end" className="w-56 text-[11px] font-mono">
          <DropdownMenuLabel className="flex items-center gap-2 h-[26px] py-0 opacity-80">
            <Settings className="size-3.5" />
            Pengaturan
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className="cursor-pointer h-[26px] py-0 sm:hidden focus:text-accent">
            <Link href="/rules" className="flex items-center gap-2 w-full">
              <Gavel className="size-3.5" />
              <span>Peraturan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="sm:hidden" />

          <DropdownMenuSeparator />

          <SettingsGroupLabel>Tampilan</SettingsGroupLabel>
          <SettingToggle
            label="Mode Gelap"
            hint="Ganti tema terang/gelap"
            checked={resolvedTheme === "dark"}
            onToggle={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          />
          <SettingToggle
            label="Nav Tetap"
            hint="Bar navigasi tetap terlihat saat menggulir"
            checked={position === "sticky"}
            onToggle={togglePosition}
          />
          <SettingToggle
            label="Autoplay GIF"
            hint="Putar GIF otomatis di thumbnail"
            checked={autoPlayGif}
            onToggle={toggleAutoPlayGif}
          />
          <SettingToggle
            label="Pratinjau Hover"
            hint="Tampilkan gambar penuh saat kursor di atas thumbnail"
            checked={hoverPreview}
            onToggle={toggleHoverPreview}
            className="hidden sm:flex"
          />

          <DropdownMenuSeparator />
          <SettingsGroupLabel>Board &amp; Thread</SettingsGroupLabel>
          <SettingToggle
            label="Buka Katalog"
            hint="Board dibuka dalam tampilan katalog"
            checked={defaultBoardView === "catalog"}
            onToggle={toggleDefaultBoardView}
          />
          <SettingToggle
            label="Auto-update"
            hint="Muat balasan baru di thread secara otomatis"
            checked={autoUpdateThread}
            onToggle={toggleAutoUpdateThread}
          />

          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
                <span className="text-[10px] text-accent">
                  {user.role}
                </span>
                <span className="font-normal opacity-60">
                  {user.email}
                </span>
              </DropdownMenuLabel>
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

function SettingsGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuLabel className="px-2 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </DropdownMenuLabel>
  );
}

function SettingToggle({
  label,
  hint,
  checked,
  onToggle,
  className,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <DropdownMenuItem
      onClick={onToggle}
      onSelect={(e) => e.preventDefault()}
      className={cn("cursor-pointer h-[26px] py-0", className)}
      title={hint}
      role="menuitemcheckbox"
      aria-checked={checked}
    >
      <span>{label}</span>
      <span className={cn("ml-auto font-bold", checked ? "text-accent" : "opacity-40")}>
        {checked ? "✔" : "✘"}
      </span>
    </DropdownMenuItem>
  );
}
