"use client";

import { useState } from "react";
import { Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThumbnailUrl } from "@/lib/utils/image";

interface ExpandableImageProps {
  src: string;
  alt: string;
  metadata?: string;
  onFullScreen?: () => void;
  className?: string;
  isOP?: boolean;
  isNsfw?: boolean;
  isSpoiler?: boolean;
}

export function ExpandableImage({
  src,
  alt,
  metadata,
  onFullScreen,
  className,
  isOP = false,
  isNsfw = false,
  isSpoiler = false,
}: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNsfw, setShowNsfw] = useState(!isNsfw);
  const [showSpoiler, setShowSpoiler] = useState(!isSpoiler);

  const isHidden = !showNsfw || !showSpoiler;

  // Helper to parse metadata
  let fileInfo = {
    name: "image.png",
    size: "",
    dim: "",
  };

  if (metadata) {
    try {
      const parsed = JSON.parse(metadata);
      fileInfo.name = parsed.originalName || "image.png";
      if (parsed.bytes) {
        const kb = Math.round(parsed.bytes / 1024);
        fileInfo.size = `${kb} KB`;
      }
      if (parsed.width && parsed.height) {
        fileInfo.dim = `${parsed.width}x${parsed.height}`;
      }
    } catch (e) {
      // Fallback for non-JSON metadata
      fileInfo.name = metadata.split(" (")[0] || "image";
    }
  }

  return (
    <>
      {/* Metadata & Actions */}
      <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0 text-[10px] text-muted-foreground leading-tight mb-1", className)}>
        <span className="font-mono opacity-80">File:</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "font-bold hover:underline truncate max-w-[120px] sm:max-w-[200px]",
            isNsfw ? "text-destructive" : isSpoiler ? "text-yellow-600 dark:text-yellow-500" : "text-accent"
          )}
          title={fileInfo.name}
        >
          {fileInfo.name}
        </a>
        <span className="font-mono opacity-70">
          ({fileInfo.size}{fileInfo.size && fileInfo.dim && ", "}{fileInfo.dim})
        </span>
        
        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity ml-auto sm:ml-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFullScreen?.();
            }}
            className="hover:text-accent hover:underline"
          >
            [view]
          </button>
          <a
            href={src}
            download={fileInfo.name}
            className="hover:text-accent hover:underline hidden sm:inline"
          >
            [save]
          </a>
        </div>
      </div>

      {/* Image Container - Floated when not expanded */}
      <div
        className={cn(
          "relative group cursor-zoom-in overflow-hidden rounded-sm border shadow-sm transition-all duration-300",
          isExpanded
            ? "w-full cursor-zoom-out mb-4 clear-both block"
            : cn(
                "float-left mr-4 mb-2",
                isOP
                  ? "max-w-[200px] sm:max-w-[300px]"
                  : "max-w-[150px] sm:max-w-[250px]",
              ),
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img
          src={
            isExpanded
              ? src
              : getThumbnailUrl(src, isOP ? 300 : 250, isOP ? 300 : 250, "fit")
          }
          alt={alt}
          className={cn(
            "transition-all duration-300",
            isHidden && "blur-2xl scale-110",
            isExpanded
              ? "w-full h-auto object-contain max-h-[85vh]"
              : cn(
                  "object-contain",
                  isOP
                    ? "max-w-[200px] max-h-[200px] sm:max-w-[300px] sm:max-h-[300px]"
                    : "max-w-[150px] max-h-[150px] sm:max-w-[250px] sm:max-h-[250px]",
                ),
          )}
        />

        {/* Overlay - Classic Imageboard Style */}
        {isHidden && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 transition-opacity hover:bg-black/40 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowNsfw(true);
              setShowSpoiler(true);
            }}
          >
            {!showNsfw ? (
              <div className="border border-destructive bg-black px-4 py-2 text-destructive font-mono text-[12px] font-bold tracking-tight uppercase">
                [ NSFW ]
              </div>
            ) : (
              <div className="border border-yellow-500 bg-black px-4 py-2 text-yellow-500 font-mono text-[12px] font-bold tracking-tight uppercase">
                [ SPOILER ]
              </div>
            )}
          </div>
        )}

        {/* Hover Indicator */}
        <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </div>
      </div>
    </>
  );
}
