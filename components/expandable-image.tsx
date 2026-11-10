"use client";

import { useEffect, useState } from "react";
import { HoverImagePreview } from "./hover-image-preview";
import { Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThumbnailUrl } from "@/lib/utils/image";
import { useNav } from "./nav-provider";
import { Play } from "lucide-react";

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
  const { autoPlayGif, hoverPreview } = useNav();
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isHidden = !showNsfw || !showSpoiler;
  const isGif = src.toLowerCase().endsWith(".gif");
  const isStaticGif = isGif && !autoPlayGif && !isExpanded;

  // Helper to parse metadata
  let fileInfo = {
    name: "image.png",
    size: "",
    dim: "",
  };
  let naturalSize: { width: number; height: number } | undefined;

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
        naturalSize = { width: parsed.width, height: parsed.height };
      }
    } catch (e) {
      // Fallback for non-JSON metadata
      fileInfo.name = metadata.split(" (")[0] || "image";
    }
  }

  const showHoverPreview = hoverPreview && canHover && !isExpanded && !isHidden;

  return (
    <>
      {showHoverPreview && hoverPos && (
        <HoverImagePreview
          src={src}
          x={hoverPos.x}
          y={hoverPos.y}
          width={naturalSize?.width}
          height={naturalSize?.height}
        />
      )}

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
          {(isNsfw || isSpoiler) && !isHidden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isNsfw) setShowNsfw(false);
                if (isSpoiler) setShowSpoiler(false);
              }}
              className="hover:text-destructive hover:underline text-[10px]"
              title="Sensor kembali gambar ini"
            >
              [{isNsfw ? "hide nsfw" : "hide spoiler"}]
            </button>
          )}
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
                  : "max-w-[150px] max-h-[150px] sm:max-w-[180px] sm:max-h-[180px]",
              ),
        )}
        onClick={() => {
          setIsExpanded(!isExpanded);
          setHoverPos(null);
        }}
        onMouseMove={(e) => {
          if (showHoverPreview) setHoverPos({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => setHoverPos(null)}
      >
        <img
          src={
            isExpanded
              ? src
              : getThumbnailUrl(src, isOP ? 300 : 180, isOP ? 300 : 180, "fit", !autoPlayGif)
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
                    : "max-w-[150px] max-h-[150px] sm:max-w-[180px] sm:max-h-[180px]",
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
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">
                NSFW
              </span>
            ) : (
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">
                SPOILER
              </span>
            )}
          </div>
        )}

        {/* GIF Indicator */}
        {isStaticGif && !isHidden && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded border border-white/20">
              GIF
            </div>
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
