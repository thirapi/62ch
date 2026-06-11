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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createStaffMember,
  assignBoardToStaff,
  unassignBoardFromStaff,
  deleteStaffMember,
} from "@/lib/actions/staff.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  assignedBoardIds: number[];
}

interface Board {
  id: number;
  code: string;
  name: string;
}

export function StaffManager({
  initialStaff,
  allBoards,
}: {
  initialStaff: StaffMember[];
  allBoards: Board[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    const email = formData.get("email") as string;

    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success) {
        setIsOpen(false);
        toast.success(`Anggota staf ${email} berhasil dibuat`);
      } else {
        toast.error(res.error || "Gagal membuat anggota staf");
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
        ? await unassignBoardFromStaff(userId, boardId)
        : await assignBoardToStaff(userId, boardId);

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
        "Apakah Anda yakin ingin menghapus anggota staf ini? Akun ini akan dihapus permanen.",
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteStaffMember(id);
      if (res.success) {
        toast.success("Anggota staf berhasil dihapus");
      } else {
        toast.error(res.error || "Gagal menghapus anggota staf");
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
                Daftar Staf Aktif
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 opacity-60">
                ({initialStaff.length} akun)
              </span>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-5 shadow-none h-9 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Staf
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0 rounded-2xl">
              <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/5">
                <span className="text-sm font-semibold tracking-tight">
                  Buat Anggota Staf Baru
                </span>
              </div>
              <form action={handleCreate}>
                <div className="p-6 space-y-4">
                  <p className="text-[11px] text-muted-foreground leading-relaxed -mt-2 mb-2">
                    Daftarkan akun moderator atau janitor baru. Moderator memiliki akses global, sementara Janitor terbatas pada board tertentu.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        Email Pengguna
                      </Label>
                      <input type="hidden" name="role" value="janitor" id="role-hidden" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="staff@example.com"
                        className="bg-muted/10 border-border/50 h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role-select" className="text-xs font-semibold">
                        Role Staf
                      </Label>
                      <Select 
                        name="role" 
                        defaultValue="janitor"
                        onValueChange={(v) => {
                          const hidden = document.getElementById('role-hidden') as HTMLInputElement;
                          if (hidden) hidden.value = v;
                        }}
                      >
                        <SelectTrigger id="role-select" className="bg-muted/10 border-border/50 h-9">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moderator">Moderator (Global)</SelectItem>
                          <SelectItem value="janitor">Janitor (Per-Board)</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder="staff123"
                        className="bg-muted/10 border-border/50 h-9"
                      />
                      <p className="text-[10px] text-muted-foreground italic">
                        * Kosongkan jika ingin menggunakan password default
                        'staff123'.
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
                    Simpan Staf
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
                <TableHead className="w-[250px] h-10">Informasi Akun</TableHead>
                <TableHead className="w-[120px] h-10">Role</TableHead>
                <TableHead className="h-10">Board yang Ditugaskan</TableHead>
                <TableHead className="text-right h-10 px-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialStaff.map((member) => (
                <TableRow
                  key={member.id}
                  className="group hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground tracking-tight">
                        {member.email}
                      </span>
                      <span className="text-[10px] tracking-tight text-muted-foreground opacity-60">
                        ID: {member.id.split("-")[0]}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        member.role === "moderator" ? "border-purple-500 text-purple-500 bg-purple-500/5" : "border-blue-500 text-blue-500 bg-blue-500/5"
                      )}
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
                      {member.role === "moderator" ? (
                        <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full italic">
                          Akses Global (Semua Board)
                        </span>
                      ) : member.assignedBoardIds.length > 0 ? (
                        member.assignedBoardIds.map((bid) => {
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
                    {member.role === "janitor" && (
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
                                {member.email}
                              </span>
                              .
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-6">
                            {allBoards.map((board) => {
                              const isAssigned =
                                member.assignedBoardIds.includes(board.id);
                              return (
                                <button
                                  key={board.id}
                                  onClick={() =>
                                    handleToggleAssignment(
                                      member.id,
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
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member.id)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1 rounded-full h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 opacity-40" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {initialStaff.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-20 bg-muted/5"
                  >
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <UserCog className="h-12 w-12" />
                      <p className="text-sm font-medium">
                        Belum ada anggota staf yang terdaftar.
                      </p>
                      <p className="text-xs">
                        Klik "Tambah Staf" untuk memulai.
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
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground opacity-80">
              Catatan Keamanan:
            </span>{" "}
            Moderator memiliki akses moderasi global (semua board) dan dapat melakukan Ban IP. Janitor hanya dapat mengelola board yang ditugaskan secara spesifik dan tidak memiliki izin untuk Ban IP.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Hanya Admin yang dapat mengelola anggota staf.
          </p>
        </div>
      </div>
    </>
  );
}
