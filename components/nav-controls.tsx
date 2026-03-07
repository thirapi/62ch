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
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNav } from "./nav-provider";
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
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions/auth.actions";

interface NavControlsProps {
  user: any;
}

export function NavControls({ user }: NavControlsProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { position, togglePosition } = useNav();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-6 w-20" />;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground/50">[</span>
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
          <DropdownMenuLabel className="flex items-center gap-2 py-2 opacity-80">
            <Settings className="size-3.5" />
            Pengaturan
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={togglePosition}
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer py-2"
          >
            <span>Navigasi Melayang</span>
            <span className="ml-auto opacity-50 font-bold">
              {position === "sticky" ? "✔" : "✘"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer py-2"
          >
            <span>Mode {resolvedTheme === "dark" ? "Terang" : "Gelap"}</span>
          </DropdownMenuItem>

          {user && (
            <>
              <DropdownMenuSeparator />
              <form action={logout}>
                <button type="submit" className="w-full text-left">
                  <DropdownMenuItem className="cursor-pointer py-2 text-destructive focus:text-destructive">
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
