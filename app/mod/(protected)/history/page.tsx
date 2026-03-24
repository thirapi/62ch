import Link from "next/link";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModerationBoardFilter } from "@/components/moderation-board-filter";
import { 
  getResolvedReports,
  getModeratorAuthorizer,
} from "@/lib/actions/moderation.actions";
import {
  getBoardList,
} from "@/lib/actions/home.actions";
import { cn } from "@/lib/utils";
import { HistoryDetailDialog } from "@/components/history-detail-dialog";

export const dynamic = "force-dynamic";

export default async function ModHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; board?: string }>;
}) {


  const { page = "1", board: boardCode } = await searchParams;
  const currentPage = parseInt(page);
  const limit = 50;
  const offset = (currentPage - 1) * limit;

  // Fetch boards for filter
  const boards = await getBoardList();
  const selectedBoard = (boards as any[]).find(b => b.code === boardCode);

  const { reports, total } = await getResolvedReports(limit, offset, selectedBoard?.id);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-10">
      <header className="mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Penanganan</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
          Daftar laporan yang telah ditindaklanjuti secara permanen
        </p>
      </header>

      {/* Board Filter Section */}
      <section className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <ModerationBoardFilter 
          boards={boards as any} 
          selectedBoardCode={boardCode}
          baseUrl="/mod/history"
        />
      </section>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[150px]">Konten</TableHead>
              <TableHead>Alasan / Isi Laporan</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead className="w-[60px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report: any) => (
              <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                       <Badge variant="outline" className="text-[10px] font-medium px-1.5 h-4 rounded-full border-muted-foreground/20">
                         {report.contentType === "thread" ? "Thread" : "Reply"}
                       </Badge>
                       {report.boardCode && <Badge variant="secondary" className="text-[10px] h-4 border-none bg-primary/10 text-primary px-1.5 rounded-full">/{report.boardCode}/</Badge>}
                    </div>
                    <Link 
                       href={`/${report.boardCode || 'all'}/thread/${report.parentThreadId}#p${report.postNumber}`}
                      target="_blank"
                      className="hover:underline flex items-center gap-1 text-muted-foreground group"
                    >
                      <span className="group-hover:text-primary">#{report.contentId}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[400px] py-1 space-y-0.5">
                    <p className="text-sm font-semibold truncate leading-tight" title={report.reason}>
                      {report.reason}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 italic opacity-60 leading-normal" title={report.content}>
                      "{report.content}"
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-medium border-none px-2 rounded-full",
                      report.status === "resolved" 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {report.status === "resolved" ? "Disetujui" : "Diabaikan"}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">
                  {report.resolvedAt
                    ? new Date(report.resolvedAt).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <HistoryDetailDialog report={report} />
                </TableCell>
              </TableRow>
            ))}
            {total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
                    <CheckCircle className="h-10 w-10 mb-2" />
                    <p className="text-lg font-semibold">Belum ada riwayat</p>
                    <p className="text-sm">Silakan selesaikan beberapa laporan terlebih dahulu</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 py-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage <= 1}
            asChild={currentPage > 1}
          >
             {currentPage > 1 ? (
               <Link href={`/mod/history?page=${currentPage - 1}${boardCode ? `&board=${boardCode}` : ''}`}>
                 Sebelumnya
               </Link>
             ) : (
               <span>Sebelumnya</span>
             )}
          </Button>
          <span className="text-xs font-mono text-muted-foreground">{currentPage} / {totalPages}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage >= totalPages}
            asChild={currentPage < totalPages}
          >
             {currentPage < totalPages ? (
               <Link href={`/mod/history?page=${currentPage + 1}${boardCode ? `&board=${boardCode}` : ''}`}>
                 Selanjutnya
               </Link>
             ) : (
               <span>Selanjutnya</span>
             )}
          </Button>
        </div>
      )}
    </div>
  );
}
