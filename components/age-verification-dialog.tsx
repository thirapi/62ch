"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { useAgeVerification } from "./age-verification-provider";

export function AgeVerificationDialog() {
  const { isOpen, onAccept, onDecline } = useAgeVerification();

  const handleAccept = () => {
    onAccept();
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md max-h-[90dvh] overflow-y-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle className="text-xl">
              Perhatian
          </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            harap baca dan pahami ketentuan di bawah sebelum kamu lanjut.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-3 border border-muted">
            <p className="font-semibold mb-2 text-foreground">
              dengan masuk ke situs ini, kamu menyatakan kalau:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                kamu berusia{" "}
                <strong className="text-foreground">18 tahun atau lebih</strong>
                .
              </li>
              <li>
                kamu sudah baca dan setuju sama{" "}
                <Link
                  href="/rules"
                  target="_blank"
                  className="text-accent hover:underline font-medium"
                >
                  Peraturan & Ketentuan
                </Link>{" "}
                yang berlaku.
              </li>
              <li>
                semua posting adalah tanggung jawabmu sendiri sebagai
                pengunggah.
              </li>
              <li>
                kamu paham kalau konten di sini adalah User Generated Content
                (UGC) yang mungkin mengandung materi dewasa atau spoiler.
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-muted-foreground text-left italic leading-relaxed">
            * Dengan mengklik <strong>Setuju & Lanjutkan</strong>, Anda menyatakan
            bahwa Anda telah memenuhi syarat usia dan menyetujui seluruh
            ketentuan di atas.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            Saya Tidak Setuju
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto"
          >
            Setuju & Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
