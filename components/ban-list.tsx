"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, ShieldCheck } from "lucide-react";
import { unbanUser, updateBan } from "@/lib/actions/moderation.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Ban {
  id: number;
  ipAddress: string;
  reason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface BanListProps {
  initialBans: Ban[];
}

export function BanList({ initialBans }: BanListProps) {
  const [bans, setBans] = useState(initialBans);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editBan, setEditBan] = useState<Ban | null>(null);
  const [banToDelete, setBanToDelete] = useState<Ban | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  async function handleUnban() {
    if (!banToDelete) return;

    setIsProcessing(true);
    try {
      const result = await unbanUser(banToDelete.ipAddress);
      if (result.success) {
        toast({ title: "Berhasil", description: "Blokir telah dihapus." });
        setBanToDelete(null);
        router.refresh();
      } else {
        toast({
          title: "Gagal",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan sistem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdateBan() {
    if (!editBan) return;

    setIsProcessing(true);
    try {
      const durationHours = editDuration ? Number.parseInt(editDuration) : null;
      const result = await updateBan(editBan.id, editReason, durationHours);
      if (result.success) {
        toast({ title: "Berhasil", description: "Data blokir diperbarui." });
        setEditBan(null);
        router.refresh();
      } else {
        toast({
          title: "Gagal",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan sistem.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const openEditDialog = (ban: Ban) => {
    setEditBan(ban);
    setEditReason(ban.reason || "");
    setEditDuration(""); // Reset duration input
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[180px]">Alamat IP</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead className="w-[200px]">Berakhir</TableHead>
            <TableHead className="w-[120px]">Dibuat</TableHead>
            <TableHead className="text-right w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialBans.map((ban) => {
            const isExpired =
              ban.expiresAt && new Date(ban.expiresAt) < new Date();
            return (
              <TableRow key={ban.id} className={cn("hover:bg-muted/30 transition-colors", isExpired && "opacity-50")}>
                <TableCell className="font-mono font-semibold text-sm tracking-tight text-primary/80">
                  {ban.ipAddress}
                  {isExpired && (
                    <Badge variant="outline" className="ml-2 text-[9px] h-4 rounded-full border-amber-500/20 text-amber-600 bg-amber-500/5">
                      Expired
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {ban.reason || "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {ban.expiresAt ? (
                    <span>
                      {new Date(ban.expiresAt).toLocaleString()}
                    </span>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none rounded-full px-2 font-medium text-[10px]"
                    >
                      Permanen
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground/60">
                  {new Date(ban.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(ban)}
                    disabled={isProcessing}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setBanToDelete(ban)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {initialBans.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-40 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2 opacity-30 italic">
                  <ShieldCheck className="h-10 w-10 mb-2" />
                  <p className="text-sm">Tidak ada IP yang sedang diblokir</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!editBan}
        onOpenChange={(open) => !open && setEditBan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Blokir</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Alamat IP</Label>
              <Input
                value={editBan?.ipAddress}
                disabled
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-reason">Alasan</Label>
              <Input
                id="edit-reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-duration">Tambah/Atur Durasi (Jam)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                placeholder="Biarkan kosong untuk tetap permanen/tidak berubah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBan(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateBan} disabled={isProcessing}>
              Terapkan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!banToDelete}
        onOpenChange={(open) => !open && setBanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka Blokir IP?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus IP{" "}
              <strong className="font-mono">{banToDelete?.ipAddress}</strong>{" "}
              dari daftar blokir. Pengguna tersebut akan dapat memposting
              kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleUnban();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? "Memproses..." : "Buka Blokir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
