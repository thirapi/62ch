"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  selectedFile?: File | null;
  maxSizeMB?: number;
  resetTrigger?: number; 
  hideLabel?: boolean;
}

export function ImageUploader({
  onImageSelect,
  selectedFile,
  maxSizeMB = 10,
  resetTrigger,
  hideLabel = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    if (resetTrigger !== undefined) {
      setPreview(null);
      setError(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [resetTrigger]);

  const validateAndProcessFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Silakan pilih file gambar");
      clearImage();
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ukuran gambar harus kurang dari ${maxSizeMB}MB`);
      clearImage();
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearImage();
      return;
    }
    validateAndProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {!hideLabel && <Label htmlFor="image">Gambar (opsional)</Label>}
      <input
        ref={fileInputRef}
        type="file"
        id="image"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="space-y-2">
        {!preview ? (
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-4 transition-all duration-200",
              isDragging 
                ? "border-accent bg-accent/5 scale-[1.02]" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-transparent"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className={cn("h-8 w-8", isDragging && "text-accent animate-bounce")} />
              <div className="text-sm text-center">
                <span className={cn("font-medium", isDragging && "text-accent")}>
                  {isDragging ? "Lepaskan untuk mengunggah" : "Klik atau seret gambar ke sini"}
                </span>
                <p className="text-[10px] mt-1 opacity-70">
                  PNG, JPG, GIF, WebP hingga {maxSizeMB}MB
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="relative border rounded-lg overflow-hidden group">
            <div className="relative aspect-video bg-muted/30">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Pratinjau"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 gap-1 font-bold"
                onClick={clearImage}
              >
                <X className="h-4 w-4" /> Ganti Gambar
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </div>
    </div>
  );
}
