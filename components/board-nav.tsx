import Link from "next/link";
import { getBoardList } from "@/lib/actions/home.actions";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { NavControls } from "./nav-controls";
import { NavWrapper } from "./nav-wrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home } from "lucide-react";

import { BoardSwitcher } from "./board-switcher";

export async function BoardNav() {
  const boards = await getBoardList();
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  const { user } = sessionId
    ? await lucia.validateSession(sessionId)
    : { user: null };

  return (
    <NavWrapper>
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
          <span className="text-muted-foreground/50">[</span>
          {/* Home Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="opacity-80 hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Home className="size-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Beranda</TooltipContent>
          </Tooltip>
          <span className="text-muted-foreground/50 flex-shrink-0">/</span>
          
          <BoardSwitcher boards={boards} />
          
          <span className="text-muted-foreground/50 flex-shrink-0">]</span>
        </div>

        <div className="flex items-center gap-1.5 pl-1.5 sm:pl-4 flex-shrink-0">
          <NavControls user={user} />
        </div>
      </div>
    </NavWrapper>
  );
}
