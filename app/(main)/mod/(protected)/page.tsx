import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModerationDashboard } from "@/components/moderation-dashboard";
import { ModerationBoardFilter } from "@/components/moderation-board-filter";
import {
  getPendingReports,
  getModeratorAuthorizer,
} from "@/lib/actions/moderation.actions";
import {
  getBoardList,
} from "@/lib/actions/home.actions";
import { Suspense } from "react";

async function ModDashboardWrapper({ 
  page, 
  boardCode 
}: { 
  page: string; 
  boardCode?: string 
}) {
  const currentPage = parseInt(page);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Auth & Permissions
  const user = await getModeratorAuthorizer();

  // Fetch all boards for filtering
  let boards = await getBoardList() as any[];
  if (user.role === "janitor" && user.janitorBoards) {
    boards = boards.filter(b => user.janitorBoards.includes(b.id));
  }
  const selectedBoard = boards.find(b => b.code === boardCode);

  const { reports: pendingReports, total: pendingTotal } = await getPendingReports(limit, offset, selectedBoard?.id);
  const totalPages = Math.ceil(pendingTotal / limit);

  return (
    <>
      {/* Board Filter Section */}
      <section className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <ModerationBoardFilter 
          boards={boards as any} 
          selectedBoardCode={boardCode}
          baseUrl="/mod"
        />
      </section>

      <div className="space-y-4">
        <ModerationDashboard 
          initialPendingReports={pendingReports as any} 
          pendingTotal={pendingTotal}
          currentPage={currentPage}
          totalPages={totalPages}
          userRole={user.role}
        />
      </div>
    </>
  );
}

export default async function ModPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; board?: string }>;
}) {
  const { page = "1", board: boardCode } = await searchParams;

  return (
    <div className="space-y-10">
      <header className="mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Antrian Laporan</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
          Tinjau dan ambil tindakan terhadap laporan dari pengguna
        </p>
      </header>

      <Suspense fallback={<div className="space-y-8 animate-pulse">
        <div className="h-16 bg-muted/5 rounded-xl border" />
        <div className="h-96 bg-muted/5 rounded-xl border" />
      </div>}>
        <ModDashboardWrapper page={page} boardCode={boardCode} />
      </Suspense>
    </div>
  );
}
