"use client";

import { useNav } from "./nav-provider";
import { getThumbnailUrl } from "@/lib/utils/image";
import { Play } from "lucide-react";

interface RecentImageProps {
  imageUrl: string;
  isSpoiler: boolean;
  isNsfw: boolean;
  boardCode: string;
}

export function RecentImage({ imageUrl, isSpoiler, isNsfw, boardCode }: RecentImageProps) {
  const { autoPlayGif } = useNav();
  const isGif = imageUrl.toLowerCase().endsWith(".gif");
  const isStaticGif = isGif && !autoPlayGif;

  return (
    <div className="overflow-hidden rounded border border-muted/50 group-hover:border-accent transition-all bg-muted/20 relative">
      <img
        src={getThumbnailUrl(imageUrl, 300, 0, 'scale', !autoPlayGif)}
        alt={`Gambar terbaru di 62chan - ${boardCode}`}
        className={`w-full h-auto block transition-all ${
          isSpoiler || isNsfw
            ? "blur-xl opacity-60"
            : "grayscale-[0.2] group-hover:grayscale-0"
        }`}
        loading="lazy"
      />
      {(isSpoiler || isNsfw) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">
            {isSpoiler ? "SPOILER" : "NSFW"}
          </span>
        </div>
      )}
      {isStaticGif && !isSpoiler && !isNsfw && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-bold px-1 rounded border border-white/20">
            GIF
          </div>
        </div>
      )}
    </div>
  );
}
