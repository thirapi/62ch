import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ModerationDashboard } from "@/components/moderation-dashboard";
import { ModerationBoardFilter } from "@/components/moderation-board-filter";
import {
  getPendingReports,
  getModeratorAuthorizer,
} from "@/lib/actions/moderation.actions";
import {
  getBoardList,
} from "@/lib/actions/home.actions";

export const dynamic = "force-dynamic";

export default async function ModPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; board?: string }>;
}) {
  // Security Check: Redirect to login if user is not authorized
  try {
    await getModeratorAuthorizer();
  } catch (error) {
    redirect("/mod/login");
  }

  const { page = "1", board: boardCode } = await searchParams;
  const currentPage = parseInt(page);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Fetch all boards for filtering
  const boards = await getBoardList();
  const selectedBoard = (boards as any[]).find(b => b.code === boardCode);

  const { reports: pendingReports, total: pendingTotal } = await getPendingReports(limit, offset, selectedBoard?.id);

  const totalPages = Math.ceil(pendingTotal / limit);

  return (
    <div className="space-y-10">
      <header className="mb-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Antrian Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Tinjau dan tindak lanjuti laporan konten yang masuk secara real-time
          </p>
        </div>
      </header>

      {/* Board Filter Section */}
      <section className="bg-card/30 p-4 rounded-xl border border-dashed border-muted-foreground/20">
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
        />
      </div>
    </div>
  );
}
