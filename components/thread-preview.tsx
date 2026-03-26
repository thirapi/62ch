"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MessageSquare, Image as ImageIcon } from "lucide-react";
import { FormattedText } from "./formatted-text";
import { getThumbnailUrl } from "@/lib/utils/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNav } from "./nav-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThreadPreviewProps {
  children: React.ReactNode;
  subject?: string | null;
  excerpt?: string | null;
  image?: string | null;
  boardCode: string;
  isNsfw?: boolean;
  isSpoiler?: boolean;
}

export function ThreadPreview({
  children,
  subject,
  excerpt,
  image,
  boardCode,
  isNsfw = false,
  isSpoiler = false,
}: ThreadPreviewProps) {
  const { autoPlayGif } = useNav();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasContent = !!(subject || excerpt || image);
  const isEnabled = mounted && !isMobile && hasContent;

  const triggerContent = (
    <div className="inline-block w-full outline-none">
      {children}
    </div>
  );

  return (
    <HoverCard 
      openDelay={500} 
      closeDelay={100} 
      open={isEnabled ? undefined : false}
    >
      <HoverCardTrigger asChild>
        {triggerContent}
      </HoverCardTrigger>
      
      {isEnabled && (
        <HoverCardContent 
          side="right" 
          align="start" 
          className="w-80 p-0 overflow-hidden shadow-2xl border-accent/20 bg-card z-[100]"
        >
          <div className="px-3 py-1.5 bg-accent/5 border-b border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="size-3 text-accent/70" />
              <span className="text-[10px] font-bold text-accent/80">
                Pratinjau Utas
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-accent/40 text-right">
              /{boardCode}/
            </span>
          </div>
          
          <div className="p-4 flex gap-3">
            {image && (
              <div className="shrink-0 w-20 h-20 bg-muted rounded overflow-hidden border border-muted/50 relative">
                <img 
                  src={getThumbnailUrl(image, 200, 200, "fill", !autoPlayGif)} 
                  alt="Preview" 
                  className={cn(
                    "w-full h-full object-cover transition-all",
                    (isNsfw || isSpoiler) && "blur-xl grayscale-[0.5] scale-110 opacity-70"
                  )}
                />
                {(isNsfw || isSpoiler) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                    <span className="text-[7px] font-bold text-white bg-black/60 px-1 py-0.5 rounded border border-white/20 uppercase tracking-tighter">
                      {isNsfw ? "NSFW" : "Spoiler"}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {subject && (
                <h3 className="text-xs font-bold text-foreground mb-1.5 line-clamp-1 border-b pb-1 border-dashed border-muted">
                  {subject}
                </h3>
              )}
              {excerpt && (
                <div className="text-[11px] leading-relaxed text-foreground/80 line-clamp-4 italic">
                  <FormattedText content={excerpt} preview />
                </div>
              )}
              {!excerpt && !subject && (
                <span className="text-[10px] text-muted-foreground italic">
                  Tidak ada teks pratinjau.
                </span>
              )}
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
