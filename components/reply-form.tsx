"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
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
import { uploadImageClient } from "@/lib/utils/cloudinary-client";
import { PostFormRow } from "./post-form-row";
import { EmojiPicker } from "./emoji-picker";

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
  const [captchaId, setCaptchaId] = useState("");
  const [captcha, setLocalCaptcha] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setIsSage,
    resetForm,
  } = useReply();

  const handleClear = () => {
    setContent("");
    setImageFile(null);
  };
  const { watchThread, addMyPost } = useThreadWatcher();

  const refreshCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptchaQuestion(data.question);
      setCaptchaId(data.id);
      setLocalCaptcha("");
    } catch (err) {
      console.error("Failed to load captcha", err);
    }
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

    try {
      // Step 1: Client-side upload if image exists
      if (state.imageFile) {
        const uploadResult = await uploadImageClient(state.imageFile);
        formData.set("imageUrl", uploadResult.url);
        formData.set("imageMetadata", JSON.stringify({
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          originalName: uploadResult.originalName
        }));
      }

      // Step 2: Call Server Action
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
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            {error}
          </div>
        )}

        <PostFormRow label="Nama" htmlFor={`${prefix}reply-author`}>
          <Input
            id={`${prefix}reply-author`}
            name="author"
            placeholder="Awanama"
            maxLength={100}
            className="h-8 text-xs bg-muted/10 border-muted/30"
            value={state.author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </PostFormRow>

        <PostFormRow label="Sandi" htmlFor={`${prefix}reply-deletionPassword`}>
          <div className="relative">
            <Input
              id={`${prefix}reply-deletionPassword`}
              name="deletionPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Default password"
              maxLength={255}
              className="h-8 text-xs bg-muted/10 border-muted/30 pr-8"
              value={state.deletionPassword}
              onChange={(e) => setDeletionPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        </PostFormRow>

        <PostFormRow label="Balasan" htmlFor={`${prefix}reply-content`}>
          <div className="relative">
            <div className="relative">
              <Textarea
                id={`${prefix}reply-content`}
                name="content"
                placeholder="Ketik balasan Anda..."
                required
                rows={4}
                maxLength={2000}
                className="text-xs bg-muted/10 border-muted/30 focus-visible:ring-accent resize-y pr-8"
                value={state.content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="absolute bottom-1 right-1 flex items-center gap-1">
                <div className="text-[9px] font-mono text-muted-foreground/50 pointer-events-none">
                  {state.content.length}/2000
                </div>
                <EmojiPicker
                  onSelect={(tag) => {
                    setContent((prev) => prev + tag + " ");
                    const textarea = document.getElementById(`${prefix}reply-content`) as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.focus();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </PostFormRow>

        <PostFormRow label="Verifikasi" htmlFor={`${prefix}reply-captcha`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] opacity-70 truncate">
                {captchaQuestion || "Memuat..."}
              </span>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-[9px] text-accent hover:underline flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity shrink-0"
                title="Segarkan CAPTCHA"
              >
                <RefreshCcw className="h-2 w-2" />
                Ganti
              </button>
            </div>
            <input type="hidden" name="captchaId" value={captchaId} />
            <Input
              id={`${prefix}reply-captcha`}
              name="captcha"
              placeholder="Jawaban..."
              required
              className="h-8 text-xs bg-muted/10 border-muted/30 w-32"
              value={captcha}
              onChange={(e) => setLocalCaptcha(e.target.value)}
            />
          </div>
        </PostFormRow>

        <PostFormRow label="Gambar">
          <ImageUploader
            onImageSelect={setImageFile}
            selectedFile={state.imageFile}
            maxSizeMB={10}
            resetTrigger={resetTrigger}
            hideLabel={true}
            pasteTargetRef={formRef}
          />
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 text-xs">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}isNsfw`}
                name="isNsfw"
                checked={state.isNsfw}
                onCheckedChange={(val) => setIsNsfw(!!val)}
              />
              <Label
                htmlFor={`${prefix}isNsfw`}
                className="text-xs text-foreground flex items-center gap-1 cursor-pointer font-medium"
              >
                NSFW
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}isSpoiler`}
                name="isSpoiler"
                checked={state.isSpoiler}
                onCheckedChange={(val) => setIsSpoiler(!!val)}
              />
              <Label
                htmlFor={`${prefix}isSpoiler`}
                className="text-xs text-foreground flex items-center gap-1 cursor-pointer font-medium"
              >
                Spoiler
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}isSage`}
                name="isSage"
                checked={state.isSage}
                onCheckedChange={(val) => setIsSage(!!val)}
              />
              <Label
                htmlFor={`${prefix}isSage`}
                className="text-xs text-foreground flex items-center gap-1 cursor-pointer font-medium"
              >
                Sage
              </Label>
            </div>

            {userRole && (userRole === "admin" || userRole === "moderator") && (
              <div className="flex items-center space-x-2">
                <Checkbox id={`${prefix}withCapcode`} name="withCapcode" />
                <Label
                  htmlFor={`${prefix}withCapcode`}
                  className="text-xs text-foreground flex items-center gap-1 cursor-pointer font-medium"
                >
                  Capcode ({userRole})
                </Label>
              </div>
            )}
          </div>
        </PostFormRow>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-40 h-8 text-xs font-bold"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
          </Button>
        </div>

        <div className="mt-2 pt-2 border-t border-muted/10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="text-[10px] text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors"
            >
              {showTips ? "[ Sembunyikan Bantuan ]" : "[ Bantuan Posting ]"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              title="Bersihkan isi balasan"
            >
              <X className="h-3 w-3" />
              [ Bersihkan ]
            </button>
          </div>

          {showTips && (
            <div className="mt-2 text-[10px] text-muted-foreground italic space-y-1 text-center">
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
