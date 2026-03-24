import Link from "next/link";
import { Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllBoards, deleteBoard } from "@/lib/actions/board.actions";

export default async function BoardsPage() {
  const boards = await getAllBoards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header className="mb-0">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Board</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
            Kelola daftar board yang tersedia di situs aktif
          </p>
        </header>
        <Link href="/mod/boards/new">
          <Button className="flex items-center gap-2 rounded-full px-5 shadow-none h-9">
            <Plus className="h-4 w-4" />
            Board Baru
          </Button>
        </Link>
      </div>

      <Card className="rounded-xl border shadow-sm overflow-hidden p-0 gap-0">
        <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Daftar Board Terdaftar</span>
            <span className="text-[10px] text-muted-foreground opacity-60">({boards.length} total)</span>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] h-10">Kode</TableHead>
                <TableHead className="h-10">Nama</TableHead>
                <TableHead className="h-10">Deskripsi</TableHead>
                <TableHead className="text-right h-10 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boards.map((board) => (
                <TableRow key={board.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-primary/80">
                    /{board.code}/
                  </TableCell>
                  <TableCell>{board.name}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {board.description || "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/mod/boards/${board.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Settings className="h-4 w-4 opacity-60" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    {/* Delete functionality would ideally have a confirmation dialog */}
                    {/* For now, keeping it simple as per user request to have CRUD working */}
                  </TableCell>
                </TableRow>
              ))}
              {boards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Belum ada board yang terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
