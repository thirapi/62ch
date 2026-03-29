"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  selectedFile?: File | null;
  maxSizeMB?: number;
  resetTrigger?: number; // Add this to trigger reset from parent
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview when selectedFile changes from parent
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

  // Reset when parent triggers reset
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [resetTrigger]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      clearImage();
      return;
    }

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
        name="image"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="space-y-2">
        {!preview ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Upload className="h-8 w-8" />
              <div className="text-sm text-center">
                <span className="font-medium">Klik untuk mengunggah</span>
                <p className="text-xs mt-1">
                  PNG, JPG, GIF, WebP hingga {maxSizeMB}MB
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="relative border rounded-lg overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Pratinjau"
                fill
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
