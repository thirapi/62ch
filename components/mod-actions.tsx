"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Lock, Pin, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  lockThread,
  unlockThread,
  pinThread,
  unpinThread,
  deleteThread,
  deleteReply,
  resolveReport,
  dismissReport,
  banUser,
  unbanUser,
  markAsNsfw,
  handleSpamMacro,
} from "@/lib/actions/moderation.actions";
import { Ban, ShieldAlert, LockKeyholeOpen, PinOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BanDialog } from "@/components/ban-dialog";

interface ModActionsProps {
  reportId: number;
  contentType: string;
  contentId: number;
  ipAddress?: string | null;
  isLocked?: boolean;
  isPinned?: boolean;
  isBanned?: boolean;
  onSuccess?: () => void;
}

export function ModActions({
  reportId,
  contentType,
  contentId,
  ipAddress,
  isLocked,
  isPinned,
  isBanned,
  onSuccess,
}: ModActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleAction(action: string) {
    if (action === "ban") {
      if (ipAddress) {
        if (isBanned) {
          toast({
            title: "Informasi",
            description: "IP ini sudah dalam daftar blokir",
          });
          return;
        }
        setIsBanDialogOpen(true);
      } else {
        toast({
          title: "Kesalahan",
          description: "IP Address tidak ditemukan",
          variant: "destructive",
        });
      }
      return;
    }

    setIsProcessing(true);
    try {
      let result;

      switch (action) {
        case "lock":
          if (contentType === "thread") {
            result = isLocked
              ? await unlockThread(contentId)
              : await lockThread(contentId);
          }
          break;
        case "pin":
          if (contentType === "thread") {
            result = isPinned
              ? await unpinThread(contentId)
              : await pinThread(contentId);
          }
          break;
        case "delete":
          if (contentType === "thread") {
            result = await deleteThread(contentId);
          } else {
            result = await deleteReply(contentId);
          }
          break;
        case "resolve":
          result = await resolveReport(reportId);
          break;
        case "dismiss":
          result = await dismissReport(reportId);
          break;
        case "markNsfw":
          result = await markAsNsfw(
            contentType as "thread" | "reply",
            contentId,
          );
          break;
        case "spamMacro":
          if (ipAddress) {
            result = await handleSpamMacro(reportId, contentType as "thread" | "reply", contentId, ipAddress);
          }
          break;
      }

      if (result?.success) {
        toast({
          title: "Sukses",
          description: "Tindakan berhasil diselesaikan",
        });
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast({
          title: "Kesalahan",
          description: result?.error || "Gagal melakukan tindakan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error performing action:", error);
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan tak terduga",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {contentType === "thread" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("lock")}
            disabled={isProcessing}
            className="flex-1"
          >
            {isLocked ? (
              <>
                <LockKeyholeOpen className="h-4 w-4 mr-2" />
                Buka Kunci
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Kunci Thread
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("pin")}
            disabled={isProcessing}
            className="flex-1"
          >
            {isPinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Lepas Sematan
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Sematkan Thread
              </>
            )}
          </Button>
        </>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleAction("delete")}
        disabled={isProcessing}
        className="flex-1"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Hapus
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("resolve")}
        disabled={isProcessing}
        className="flex-1"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Selesaikan
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("dismiss")}
        disabled={isProcessing}
        className="flex-1"
      >
        <XCircle className="h-4 w-4 mr-2" />
        Abaikan
      </Button>
      {ipAddress && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleAction("ban")}
          disabled={isProcessing || isBanned}
          className="flex-1"
        >
          <Ban className="h-4 w-4 mr-2" />
          {isBanned ? "Sudah Diblokir" : "Blokir IP"}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction("markNsfw")}
        disabled={isProcessing}
        className="flex-1"
      >
        <ShieldAlert className="h-4 w-4 mr-2 text-destructive" />
        Tandai NSFW
      </Button>

      {/* {ipAddress && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAction("spamMacro")}
          disabled={isProcessing}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          <ShieldAlert className="h-4 w-4 mr-2" />
          Quick Spam (Ban+Del)
        </Button>
      )} */}

      {ipAddress && (
        <BanDialog
          ipAddress={ipAddress}
          isOpen={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
        />
      )}
    </div>
  );
}
