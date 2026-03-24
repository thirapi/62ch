"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  UserCog,
  Shield,
  LayoutGrid,
  X,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createJanitor,
  assignBoard,
  unassignBoard,
  deleteJanitor,
} from "@/lib/actions/janitor.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Janitor {
  id: string;
  email: string;
  assignedBoardIds: number[];
}

interface Board {
  id: number;
  code: string;
  name: string;
}

export function JanitorManager({
  initialJanitors,
  allBoards,
}: {
  initialJanitors: Janitor[];
  allBoards: Board[];
}) {
  const [janitors, setJanitors] = useState<Janitor[]>(initialJanitors);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    const email = formData.get("email") as string;

    startTransition(async () => {
      const res = await createJanitor(formData);
      if (res.success) {
        setIsOpen(false);
        toast.success(`Janitor ${email} berhasil dibuat`);
        // Refresh is handled by revalidatePath, but we could optimistic UI if needed
      } else {
        toast.error(res.error || "Gagal membuat janitor");
      }
    });
  }

  async function handleToggleAssignment(
    userId: string,
    boardId: number,
    currentlyAssigned: boolean,
  ) {
    startTransition(async () => {
      const res = currentlyAssigned
        ? await unassignBoard(userId, boardId)
        : await assignBoard(userId, boardId);

      if (res.success) {
        toast.success("Penugasan diperbarui");
      } else {
        toast.error(res.error || "Gagal memperbarui penugasan");
      }
    });
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus janitor ini? Akun ini akan dihapus permanen.",
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteJanitor(id);
      if (res.success) {
        toast.success("Janitor berhasil dihapus");
      } else {
        toast.error(res.error || "Gagal menghapus janitor");
      }
    });
  }

  return (
    <>
      <Card className="rounded-xl border shadow-sm overflow-hidden p-0 gap-0">
        <div className="flex items-center justify-between py-3 px-4 border-b bg-muted/5">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-sm font-semibold tracking-tight">
                Daftar Janitor Aktif
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 opacity-60">
                ({initialJanitors.length} akun)
              </span>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-5 shadow-none h-9 gap-2">
                <Plus className="h-4 w-4" />
                Janitor Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0 rounded-2xl">
              <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/5">
                <span className="text-sm font-semibold tracking-tight">
                  Buat Janitor Baru
                </span>
              </div>
              <form action={handleCreate}>
                <div className="p-6 space-y-4">
                  <p className="text-[11px] text-muted-foreground leading-relaxed -mt-2 mb-2">
                    Daftarkan akun moderator tingkat board. Mereka hanya dapat
                    mengelola board yang ditugaskan secara spesifik.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email Pengguna
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jannie@example.com"
                        className="bg-muted/10 border-border/50 h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="password"
                        className="text-xs font-semibold"
                      >
                        Password Akun
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="janitor123"
                        className="bg-muted/10 border-border/50 h-9"
                      />
                      <p className="text-[10px] text-muted-foreground italic">
                        * Kosongkan jika ingin menggunakan password default
                        'janitor123'.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 border-t flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-4 rounded-full text-xs"
                    onClick={() => setIsOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-9 px-6 rounded-full text-xs shadow-none"
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    )}
                    Simpan Janitor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-[300px] h-10">Informasi Akun</TableHead>
                <TableHead className="h-10">Board yang Ditugaskan</TableHead>
                <TableHead className="text-right h-10 px-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialJanitors.map((janitor) => (
                <TableRow
                  key={janitor.id}
                  className="group hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground tracking-tight">
                        {janitor.email}
                      </span>
                      <span className="text-[10px] tracking-tight text-muted-foreground opacity-60">
                        ID: {janitor.id.split("-")[0]}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
                      {janitor.assignedBoardIds.length > 0 ? (
                        janitor.assignedBoardIds.map((bid) => {
                          const board = allBoards.find((b) => b.id === bid);
                          return (
                            <Badge
                              key={bid}
                              variant="secondary"
                              className="bg-primary/5 border-none text-primary font-medium px-2 py-0.5 rounded-full text-[10px]"
                            >
                              /{board?.code || bid}/
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground italic opacity-60">
                          Tidak ada board yang ditugaskan
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-muted/50 shadow-none rounded-full h-8 px-3"
                        >
                          <LayoutGrid className="h-3.5 w-3.5 mr-2 opacity-60" />
                          Atur Board
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-accent" />
                            Board Access Control
                          </DialogTitle>
                          <DialogDescription>
                            Tentukan board mana saja yang dapat dikelola oleh{" "}
                            <span className="font-bold text-foreground">
                              {janitor.email}
                            </span>
                            .
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-6">
                          {allBoards.map((board) => {
                            const isAssigned =
                              janitor.assignedBoardIds.includes(board.id);
                            return (
                              <button
                                key={board.id}
                                onClick={() =>
                                  handleToggleAssignment(
                                    janitor.id,
                                    board.id,
                                    isAssigned,
                                  )
                                }
                                disabled={isPending}
                                className={cn(
                                  "flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                                  isAssigned
                                    ? "bg-accent/5 border-accent/40 shadow-sm"
                                    : "bg-background border-muted hover:border-accent/30 hover:bg-muted/20",
                                )}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className="font-mono font-bold text-primary/80 text-sm">
                                    /{board.code}/
                                  </span>
                                  {isAssigned && (
                                    <div className="bg-accent text-white rounded-full p-0.5">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-semibold truncate w-full">
                                  {board.name}
                                </span>

                                {isPending && (
                                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px]">
                                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <DialogFooter className="sm:justify-start">
                          <p className="text-[10px] text-muted-foreground italic">
                            * Perubahan dilakukan secara real-time saat Anda
                            mengeklik board.
                          </p>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(janitor.id)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1 rounded-full h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 opacity-40" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {initialJanitors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-20 bg-muted/5"
                  >
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <UserCog className="h-12 w-12" />
                      <p className="text-sm font-medium">
                        Belum ada janitor yang akunnya terdaftar.
                      </p>
                      <p className="text-xs">
                        Klik "Janitor Baru" untuk memulai.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border/50 rounded-xl max-w-2xl">
        <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0 opacity-60" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground opacity-80">
            Catatan Keamanan:
          </span>{" "}
          Janitor adalah peran moderator terbatas. Mereka hanya dapat melihat
          laporan dan melakukan tindakan moderasi (hapus, kunci, pin) pada board
          yang ditugaskan secara spesifik. Mereka tidak memiliki akses ke
          pengaturan sistem atau manajemen board lainnya.
        </p>
      </div>
    </>
  );
}
