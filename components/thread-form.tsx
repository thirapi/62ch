"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, ChevronUp, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { createThread, getCaptcha } from "@/lib/actions/thread.actions";
import { ImageUploader } from "./image-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import posthog from "posthog-js";
import { useThreadWatcher } from "./thread-watcher-provider";

interface ThreadFormProps {
  boardId: number;
  boardCode: string;
  userRole?: string;
}

export function ThreadForm({ boardId, boardCode, userRole }: ThreadFormProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { addMyPost } = useThreadWatcher();

  const [content, setContent] = useState("");

  // Load preferences from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem(`threadForm_expanded_${boardCode}`);
    if (savedState !== null) {
      setIsExpanded(savedState === "true");
    }
  }, [boardCode]);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(`threadForm_expanded_${boardCode}`, newState.toString());
  };

  const refreshCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptchaQuestion(data.question);
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
    formData.append("boardId", boardId.toString());
    formData.append("boardCode", boardCode);
    formData.set("content", content);

    if (!imageFile || imageFile.size === 0) {
      setError("Anda harus mengunggah gambar untuk membuat thread baru.");
      setIsSubmitting(false);
      return;
    }

    formData.set("image", imageFile);

    try {
      const result = await createThread(formData);

      if (result.success && result.threadId) {
        formRef.current?.reset();
        setImageFile(null);
        setContent("");
        setResetTrigger((prev) => prev + 1);

        if (result.postNumber) {
          addMyPost(result.postNumber);
        }

        router.push(`/${boardCode}/thread/${result.threadId}`);
        router.refresh();
        
        posthog.capture("thread created", {
          board_code: boardCode,
          has_subject: !!formData.get("subject"),
          is_nsfw: !!formData.get("isNsfw"),
          is_spoiler: !!formData.get("isSpoiler"),
        });
      } else {
        setError(result.error || "Gagal membuat thread. Silakan coba lagi.");
        refreshCaptcha();
      }
    } catch (err) {
      setError(
        `Terjadi kesalahan tak terduga: ${err instanceof Error ? err.message : "Internal Error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) {
    return <div className="h-10 mb-6" />; // Placeholder transparan biar layout gak lompat
  }

  if (!isExpanded) {
    return (
      <div className="text-center py-4">
        <button
          onClick={toggleExpand}
          className="text-lg font-bold text-accent hover:underline cursor-pointer inline-flex items-center gap-1 group"
        >
          [ <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> Mulai Utas Baru ]
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto transition-all">
      <div className="bg-card border border-accent/20 rounded-xl overflow-hidden shadow-sm">
        {/* Header with Close Button */}
        <div className="px-4 py-2 border-b border-muted/10 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] text-muted-foreground">
              Unggah Utas Baru
            </span>
          </div>
          <button 
            onClick={toggleExpand}
            className="text-[10px] items-center gap-1 text-muted-foreground hover:text-destructive flex transition-colors font-bold"
          >
            Sembunyikan <ChevronUp className="h-3 w-3" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="author" className="text-xs font-bold opacity-70">
                Nama
              </Label>
              <Input
                id="author"
                name="author"
                placeholder="Awanama"
                maxLength={100}
                className="bg-muted/30 focus-visible:ring-accent h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs font-bold opacity-70">
                Subjek
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="(Opsional)"
                maxLength={200}
                className="bg-muted/30 focus-visible:ring-accent h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-xs font-bold opacity-70">
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
                className="bg-muted/30 focus-visible:ring-accent resize-y min-h-[120px] text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground opacity-50">
                {content.length}/2000
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="isNsfw" className="text-xs text-destructive flex items-center gap-1 cursor-pointer font-medium">NSFW</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Checkbox id="isSpoiler" name="isSpoiler" />
                  <Label htmlFor="isSpoiler" className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1 cursor-pointer font-medium">Spoiler</Label>
                </div>
                {userRole && (userRole === "admin" || userRole === "moderator") && (
                  <div className="flex items-center space-x-2.5">
                    <Checkbox id="withCapcode" name="withCapcode" />
                    <Label htmlFor="withCapcode" className="text-xs text-accent flex items-center gap-1 cursor-pointer font-medium">Capcode ({userRole})</Label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="deletionPassword" className="text-xs font-bold opacity-70">
                    Sandi Penghapusan
                  </Label>
                  <Input
                    id="deletionPassword"
                    name="deletionPassword"
                    type="password"
                    placeholder="Untuk hapus nanti"
                    className="bg-muted/30 focus-visible:ring-accent h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5 min-w-[120px]">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="captcha" className="text-[10px] font-bold opacity-70">
                      Verifikasi: {captchaQuestion || "..."}
                    </Label>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="text-[10px] text-accent hover:underline flex items-center gap-0.5 opacity-60"
                      title="Ganti Pertanyaan"
                    >
                      <RefreshCcw className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <Input
                    id="captcha"
                    name="captcha"
                    placeholder="Jawaban..."
                    required
                    className="bg-muted/30 focus-visible:ring-accent h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 font-bold text-base shadow-md group"
              >
                {isSubmitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    Posting Baru
                    <Send className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
