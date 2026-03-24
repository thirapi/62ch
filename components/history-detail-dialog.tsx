"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  X, 
  MessageSquare, 
  History as HistoryIcon, 
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Report {
  id: number;
  contentType: string;
  contentId: number;
  reason: string;
  reportedAt: Date;
  content: string;
  author: string;
  status: string;
  resolvedAt?: Date;
  boardCode?: string;
  parentThreadId?: number;
  postNumber?: number;
}

export function HistoryDetailDialog({ report }: { report: Report }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="h-8 w-8 hover:text-primary transition-colors"
        >
          <Eye className="h-4 w-4 opacity-60" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 rounded-2xl border-primary/20 shadow-2xl">
        {/* Header - Padat dan Minimalis */}
        <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Detail Penanganan</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono opacity-70">#{report.id}</Badge>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Section */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                <HistoryIcon className="h-3.5 w-3.5" /> Informasi Dasar
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="block text-[10px] text-muted-foreground font-medium mb-1">Status</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] font-medium px-2 h-5 rounded-full border-none",
                        report.status === "resolved" 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {report.status === "resolved" ? "Disetujui" : "Diabaikan"}
                    </Badge>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                    <span className="block text-[10px] text-muted-foreground font-medium mb-1">Target</span>
                    <span className="text-xs font-semibold">
                       {report.contentType === "thread" ? "Thread" : "Reply"} #{report.contentId}
                    </span>
                </div>
             </div>
          </section>

          {/* Reason Section */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                <ShieldCheck className="h-3.5 w-3.5" /> Alasan Pelaporan
             </div>
             <div className="bg-muted/20 p-4 rounded-xl border border-border/30 italic text-sm leading-relaxed">
                "{report.reason}"
             </div>
          </section>

          {/* Content Section */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                <MessageSquare className="h-3.5 w-3.5" /> Isi Konten Terkait
             </div>
             <div className="bg-muted/20 p-4 rounded-xl border border-border/30 text-sm leading-relaxed break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
                {report.content}
             </div>
             <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  Penulis: {report.author}
                </span>
                <Link 
                   href={`/${report.boardCode || 'all'}/thread/${report.parentThreadId}#p${report.postNumber}`}
                   target="_blank"
                   className="text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                   <ExternalLink className="h-3 w-3" /> Lihat Thread Asli
                </Link>
             </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
