"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ErrorDisplayProps {
  statusCode: string;
  imageSrc: string;
  title: string;
  description: string;
  imageAlt: string;
}

export function ErrorDisplay({ statusCode, imageSrc, title, description, imageAlt }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col min-h-[85vh] px-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative w-full max-w-lg aspect-video mb-8">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        
        <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
          {description}
        </p>

        <Button asChild variant="outline" className="gap-2 shadow-sm border-accent/20 hover:bg-accent/5 transition-colors">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>

      <div className="py-8 flex justify-center">
        <div className="text-[10px] text-muted-foreground/60 dark:text-muted-foreground/40 flex items-center gap-1.5 grayscale opacity-80 dark:opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">
          <span>Image Source:</span>
          <a 
            href="https://github.com/Ender-Wiggin2019/ServiceLogos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-foreground/80 dark:text-inherit hover:text-accent underline decoration-dotted underline-offset-2"
          >
            Ender-Wiggin2019/ServiceLogos
            <ExternalLink className="h-2 w-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
