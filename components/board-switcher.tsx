"use client";

import Link from "next/link";
import { ChevronDown, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BoardSwitcherProps {
  boards: any[];
}

export function BoardSwitcher({ boards }: BoardSwitcherProps) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      {/* Mobile/Compact View: Dropdown */}
      <div className="flex sm:hidden items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1 hover:bg-accent/10 rounded-md transition-colors text-accent font-bold cursor-pointer">
              <LayoutGrid className="size-3.5" />
              <span>Daftar Boards</span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="overflow-y-auto font-mono text-[11px]"
          >
            {boards.map((board) => (
              <Link key={board.code} href={`/${board.code}`}>
                <DropdownMenuItem className="cursor-pointer py-2">
                  <span className="font-bold text-accent mr-2">
                    /{board.code}/
                  </span>
                  <span className="opacity-80">{board.name}</span>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop/Wide View: Inline List */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0">
        {boards.map((board, index) => (
          <span key={board.code} className="flex items-center">
            <Link
              href={`/${board.code}`}
              className="px-0.5 hover:underline text-accent font-bold"
              title={board.name}
            >
              {board.code}
            </Link>
            {index < boards.length - 1 && (
              <span className="mx-0.5 text-muted-foreground/30">/</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
