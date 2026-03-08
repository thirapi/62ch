import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModActions } from "@/components/mod-actions";
import {
  getPendingReports,
  getResolvedReports,
} from "@/lib/actions/moderation.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logout } from "@/lib/actions/auth.actions";

export const dynamic = "force-dynamic";

export default async function ModPage() {
  const pendingReports = await getPendingReports();
  const resolvedReports = await getResolvedReports();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Panel Moderasi</h1>
          <p className="text-sm text-muted-foreground">
            Tinjau dan kelola konten yang dilaporkan
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/mod/bans">
              <Button variant="secondary" size="sm">
                Manajemen Cekal IP
              </Button>
            </Link>
          </div>
        </header>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Laporan Tertunda{" "}
            <Badge variant="destructive">{pendingReports?.length || 0}</Badge>
          </h2>
          <div className="space-y-4">
            {pendingReports?.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {report.contentType === "thread" ? "Thread" : "Balasan"}{" "}
                        #{report.contentId}
                        <Link 
                          href={`/${report.boardCode || 'all'}/thread/${report.parentThreadId}#p${report.postNumber}`}
                          target="_blank"
                          className="inline-flex items-center ml-2 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span className="text-xs">Lihat</span>
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {report.reportedAt.toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge>{report.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Alasan:</p>
                    <p className="text-sm text-muted-foreground text-balance">
                      {report.reason}
                    </p>
                  </div>
                  <ModActions
                    reportId={report.id}
                    contentType={report.contentType}
                    contentId={report.contentId}
                    ipAddress={report.ipAddress}
                    isLocked={report.isLocked}
                    isPinned={report.isPinned}
                    isBanned={report.isBanned}
                  />
                </CardContent>
              </Card>
            ))}

            {pendingReports?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>Tidak ada laporan tertunda</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Riwayat Penanganan Laporan
          </h2>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Konten</TableHead>
                  <TableHead>Alasan / Laporan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedReports?.slice(0, 15).map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-xs">
                      <div className="flex flex-col">
                        <Link 
                          href={`/${report.boardCode || 'all'}/thread/${report.parentThreadId}#p${report.postNumber}`}
                          target="_blank"
                          className="hover:underline flex flex-col"
                        >
                          <span className="text-primary flex items-center gap-1">
                            {report.contentType === "thread"
                              ? "Thread"
                              : "Balasan"}
                            <ExternalLink className="h-2 w-2" />
                          </span>
                          <span className="text-muted-foreground">
                            #{report.contentId}
                          </span>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] space-y-1">
                        <p className="text-sm font-semibold truncate">
                          {report.reason}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                          "{report.content}"
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          report.status === "resolved"
                            ? "bg-green-500/10 text-green-500 border-green-500/20 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {report.status === "resolved"
                          ? "Diselesaikan"
                          : "Diabaikan"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {report.resolvedAt
                        ? new Date(report.resolvedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {resolvedReports?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground italic"
                    >
                      Belum ada laporan yang diselesaikan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
