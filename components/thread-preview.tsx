"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MessageSquare, Image as ImageIcon } from "lucide-react";
import { FormattedText } from "./formatted-text";
import { getThumbnailUrl } from "@/lib/utils/image";

interface ThreadPreviewProps {
  children: React.ReactNode;
  subject?: string | null;
  excerpt?: string | null;
  image?: string | null;
  boardCode: string;
}

export function ThreadPreview({
  children,
  subject,
  excerpt,
  image,
  boardCode,
}: ThreadPreviewProps) {
  if (!subject && !excerpt && !image) return <>{children}</>;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="inline-block w-full">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-80 p-0 overflow-hidden shadow-2xl border-accent/20 bg-card z-[100]"
      >
        <div className="p-3 bg-accent/5 border-b border-accent/10 flex items-center gap-2">
          <MessageSquare className="size-3.5 text-accent" />
          <span className="text-[11px] font-semibold text-accent">
            Pratinjau Utas /{boardCode}/
          </span>
        </div>
        
        <div className="p-4 flex gap-3">
          {image && (
            <div className="shrink-0 w-20 h-20 bg-muted rounded overflow-hidden border border-muted/50">
              <img 
                src={getThumbnailUrl(image, 200, 200)} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {subject && (
              <h3 className="text-xs font-bold text-accent mb-1 truncate">
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
    </HoverCard>
  );
}
