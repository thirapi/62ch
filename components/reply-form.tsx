"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, X, Send, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createReply } from "@/lib/actions/reply.actions";
import { getCaptcha } from "@/lib/actions/thread.actions";
import { ImageUploader } from "./image-uploader";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, AlertTriangle, RefreshCcw } from "lucide-react";
import { useReply } from "./reply-context";
import { useThreadWatcher } from "./thread-watcher-provider";
import posthog from "posthog-js";

interface ReplyFormProps {
  threadId: number;
  boardCode: string;
  idPrefix?: string;
  userRole?: string;
}

export function ReplyForm({
  threadId,
  boardCode,
  idPrefix = "",
  userRole,
}: ReplyFormProps) {
  const prefix = idPrefix ? `${idPrefix}-` : "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captcha, setLocalCaptcha] = useState("");
  const [showTips, setShowTips] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const {
    state,
    setAuthor,
    setDeletionPassword,
    setContent,
    setImageFile,
    setIsNsfw,
    setIsSpoiler,
    resetForm,
  } = useReply();
  const { watchThread, addMyPost } = useThreadWatcher();

  const refreshCaptcha = async () => {
    const data = await getCaptcha();
    setCaptchaQuestion(data.question);
  };

  useEffect(() => {
    refreshCaptcha();
  }, [resetTrigger]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("threadId", threadId.toString());
    formData.append("boardCode", boardCode);

    if (state.imageFile) {
      formData.append("image", state.imageFile);
    }

    try {
      const result = await createReply(formData);

      if (result.success) {
        formRef.current?.reset();
        setLocalCaptcha("");
        resetForm();
        setError(null);
        setResetTrigger((prev) => prev + 1); // Trigger image uploader reset
        
        // Update thread watcher
        if (result.postNumber) {
          addMyPost(result.postNumber);
        }

        router.refresh();

        // Track reply creation
        posthog.capture("reply created", {
          thread_id: threadId,
          board_code: boardCode,
          has_image: !!state.imageFile,
          is_nsfw: !!state.isNsfw,
          is_spoiler: !!state.isSpoiler,
        });
      } else {
        console.error("[ReplyForm] Action failed:", result.error);
        setError(result.error || "Gagal mengirim balasan. Silakan coba lagi.");
        refreshCaptcha(); // Refresh captcha on error
      }
    } catch (err) {
      console.error("[ReplyForm] Unexpected client error:", err);
      setError(
        `Terjadi kesalahan tak terduga: ${err instanceof Error ? err.message : "Internal Error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label
              htmlFor={`${prefix}reply-author`}
              className="text-[10px] font-bold opacity-60"
            >
              Nama
            </Label>
            <Input
              id={`${prefix}reply-author`}
              name="author"
              placeholder="Awanama"
              maxLength={100}
              className="h-8 text-sm bg-muted/20"
              value={state.author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label
              htmlFor={`${prefix}reply-deletionPassword`}
              className="text-[10px] font-bold opacity-60"
            >
              Sandi Penghapusan
            </Label>
            <Input
              id={`${prefix}reply-deletionPassword`}
              name="deletionPassword"
              type="password"
              placeholder="(Opsional)"
              maxLength={255}
              className="h-8 text-sm bg-muted/20"
              value={state.deletionPassword}
              onChange={(e) => setDeletionPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor={`${prefix}reply-content`}
            className="text-[10px] font-bold opacity-60"
          >
            Balasan
          </Label>
          <div className="relative">
            <Textarea
              id={`${prefix}reply-content`}
              name="content"
              placeholder="Ketik balasan Anda..."
              required
              rows={5}
              maxLength={2000}
              className="text-sm bg-muted/20 focus-visible:ring-accent resize-y pr-16"
              value={state.content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground pointer-events-none opacity-50">
              {state.content.length}/2000
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`${prefix}reply-captcha`}
              className="text-[10px] font-bold opacity-60"
            >
              Verifikasi: {captchaQuestion || "Memuat..."}
            </Label>
            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-[10px] text-accent hover:underline flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              title="Segarkan CAPTCHA"
            >
              <RefreshCcw className="h-2.5 w-2.5" />
              Ganti
            </button>
          </div>
          <Input
            id={`${prefix}reply-captcha`}
            name="captcha"
            placeholder="Jawaban..."
            required
            className="h-8 text-sm bg-muted/20 w-32"
            value={captcha}
            onChange={(e) => setLocalCaptcha(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="w-full sm:w-auto">
            <ImageUploader
              onImageSelect={setImageFile}
              selectedFile={state.imageFile}
              maxSizeMB={10}
              resetTrigger={resetTrigger}
            />

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id={`${prefix}isNsfw`}
                  name="isNsfw"
                  checked={state.isNsfw}
                  onCheckedChange={(val) => setIsNsfw(!!val)}
                />
                <Label
                  htmlFor={`${prefix}isNsfw`}
                  className="text-xs text-destructive flex items-center gap-1 cursor-pointer font-medium"
                >
                  NSFW
                </Label>
              </div>

              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id={`${prefix}isSpoiler`}
                  name="isSpoiler"
                  checked={state.isSpoiler}
                  onCheckedChange={(val) => setIsSpoiler(!!val)}
                />
                <Label
                  htmlFor={`${prefix}isSpoiler`}
                  className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1 cursor-pointer font-medium"
                >
                  Spoiler
                </Label>
              </div>

              {userRole && (userRole === "admin" || userRole === "moderator") && (
                <div className="flex items-center space-x-2.5">
                  <Checkbox id={`${prefix}withCapcode`} name="withCapcode" />
                  <Label
                    htmlFor={`${prefix}withCapcode`}
                    className="text-xs text-accent flex items-center gap-1 cursor-pointer font-medium"
                  >
                    Capcode ({userRole})
                  </Label>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-48 h-10 font-bold group"
          >
            {isSubmitting ? (
              "Mengirim..."
            ) : (
              <>
                Kirim Balasan
                <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
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
                Format: [b]tebal[/b], [i]miring[/i], [u]garis bawah[/u], [s]coret[/s], [code]kode[/code].
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
