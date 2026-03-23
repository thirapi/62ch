"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { createThread, getCaptcha } from "@/lib/actions/thread.actions";
import { ImageUploader } from "./image-uploader";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import posthog from "posthog-js";
import { useThreadWatcher } from "./thread-watcher-provider";

interface ThreadFormProps {
  boardId: number;
  boardCode: string;
  userRole?: string;
}

export function ThreadForm({ boardId, boardCode, userRole }: ThreadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [showTips, setShowTips] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { watchThread, addMyPost } = useThreadWatcher();

  const [content, setContent] = useState("");

  const refreshCaptcha = async () => {
    const data = await getCaptcha();
    setCaptchaQuestion(data.question);
  };

  useEffect(() => {
    if (isOpen) {
      refreshCaptcha();
    }
  }, [isOpen, resetTrigger]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("boardId", boardId.toString());
    formData.append("boardCode", boardCode);
    formData.set("content", content); // Use stated content

    if (!imageFile || imageFile.size === 0) {
      setError("Anda harus mengunggah gambar untuk membuat thread baru.");
      setIsSubmitting(false);
      return;
    }

    formData.append("image", imageFile);

    try {
      const result = await createThread(formData);

      if (result.success && result.threadId) {
        formRef.current?.reset();
        setImageFile(null);
        setContent(""); // Reset content
        setResetTrigger((prev) => prev + 1); // Trigger image uploader reset
        setIsOpen(false);

        // Update thread watcher
        if (result.postNumber) {
          addMyPost(result.postNumber);
        }
        watchThread({
          id: result.threadId,
          boardCode: boardCode,
          subject: (formData.get("subject") as string) || null,
          lastReadReplyCount: 0,
          snippet: content.substring(0, 50) + (content.length > 50 ? "..." : "")
        });

        router.push(`/${boardCode}/thread/${result.threadId}`);
        router.refresh();
        
        // Track thread creation
        posthog.capture("thread created", {
          board_code: boardCode,
          has_subject: !!formData.get("subject"),
          is_nsfw: !!formData.get("isNsfw"),
          is_spoiler: !!formData.get("isSpoiler"),
        });
      } else {
        // Log detailed error for debugging
        console.error("[ThreadForm] Action failed:", result.error);
        setError(result.error || "Gagal membuat thread. Silakan coba lagi.");
        refreshCaptcha(); // Refresh captcha on error
      }
    } catch (err) {
      console.error("[ThreadForm] Unexpected client error:", err);
      setError(
        `Terjadi kesalahan tak terduga: ${err instanceof Error ? err.message : "Internal Error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setImageFile(null);
    setContent(""); // Reset content
    setResetTrigger((prev) => prev + 1); // Also reset when closing
    formRef.current?.reset();
  };

  if (!isOpen) {
    return (
      <div className="text-center py-4">
        <button
          onClick={() => setIsOpen(true)}
          className="text-lg font-bold text-accent hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          [ <Plus className="h-5 w-5" /> Mulai Thread Baru ]
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-accent/20 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-300">
      <div className="bg-accent/5 px-6 py-3 border-b border-accent/10 flex items-center justify-between">
        <span className="font-bold text-sm tracking-wide text-accent">
          Mode: Posting Thread Baru
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="author"
              className="text-xs font-bold opacity-70"
            >
              Nama
            </Label>
            <Input
              id="author"
              name="author"
              placeholder="Awanama"
              maxLength={100}
              className="bg-muted/30 focus-visible:ring-accent"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="subject"
              className="text-xs font-bold opacity-70"
            >
              Subjek
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="(Opsional)"
              maxLength={200}
              className="bg-muted/30 focus-visible:ring-accent"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="content"
            className="text-xs font-bold opacity-70"
          >
            Pesan
          </Label>
          <div className="relative">
            <Textarea
              id="content"
              name="content"
              placeholder="Ketik pesan Anda di sini..."
              required
              rows={5}
              maxLength={2000}
              className="bg-muted/30 focus-visible:ring-accent resize-y min-h-[120px] pr-16"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground pointer-events-none opacity-50">
              {content.length}/2000
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold opacity-70">
                Gambar <span className="text-accent">(WAJIB)</span>
              </Label>
              <ImageUploader
                onImageSelect={setImageFile}
                maxSizeMB={10}
                resetTrigger={resetTrigger}
                hideLabel={true}
              />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2.5">
                <Checkbox id="isNsfw" name="isNsfw" />
                <Label
                  htmlFor="isNsfw"
                  className="text-xs text-destructive flex items-center gap-1 cursor-pointer font-medium"
                >
                  NSFW
                </Label>
              </div>

              <div className="flex items-center space-x-2.5">
                <Checkbox id="isSpoiler" name="isSpoiler" />
                <Label
                  htmlFor="isSpoiler"
                  className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1 cursor-pointer font-medium"
                >
                  Spoiler
                </Label>
              </div>

              {userRole && (userRole === "admin" || userRole === "moderator") && (
                <div className="flex items-center space-x-2.5">
                  <Checkbox id="withCapcode" name="withCapcode" />
                  <Label
                    htmlFor="withCapcode"
                    className="text-xs text-accent flex items-center gap-1 cursor-pointer font-medium"
                  >
                    Capcode ({userRole})
                  </Label>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label
                htmlFor="deletionPassword"
                className="text-xs font-bold opacity-70"
              >
                Sandi Penghapusan
              </Label>
              <Input
                id="deletionPassword"
                name="deletionPassword"
                type="password"
                placeholder="Untuk menghapus nanti"
                maxLength={255}
                className="bg-muted/30 focus-visible:ring-accent h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="captcha"
                className="text-xs font-bold opacity-70"
              >
                Verifikasi: {captchaQuestion}
              </Label>
              <Input
                id="captcha"
                name="captcha"
                placeholder="Jawaban..."
                required
                className="bg-muted/30 focus-visible:ring-accent h-8 text-sm w-32"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 font-bold text-base shadow-md group"
            >
              {isSubmitting ? (
                "Mengirim..."
              ) : (
                <>
                  Posting ke /{boardCode}/
                  <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-xs opacity-50 hover:opacity-100"
            >
              Lupakan (Batal)
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-muted/10">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1 mx-auto transition-colors"
          >
            {showTips ? "[ Sembunyikan Bantuan ]" : "[ Bantuan Posting ]"}
          </button>

          {showTips && (
            <div className="text-[10px] text-muted-foreground italic space-y-1 text-center mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <p>Tip: Gunakan {`>>NomorPost`} untuk membalas post tertentu.</p>
              <p>
                Gunakan {`[spoiler]teks[/spoiler]`} untuk menyembunyikan teks.
              </p>
              <p>
                Gunakan {`Nama#Sandi`} di kolom Nama untuk membuat Tripcode.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
