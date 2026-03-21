"use client";

import { useState, useEffect, useRef } from "react";
import { X, GripHorizontal, Minimize2, Maximize2 } from "lucide-react";
import { ReplyForm } from "./reply-form";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface QuickReplyProps {
  threadId: number;
  boardId: number;
  boardCode: string;
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  userRole?: string;
}

export function QuickReply({
  threadId,
  boardId,
  boardCode,
  isOpen,
  onClose,
  initialContent = "",
  userRole,
}: QuickReplyProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const qrRef = useRef<HTMLDivElement>(null);

  // Set initial position on mount (right side of screen)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const width = Math.min(400, window.innerWidth - 16);
      const initialX =
        window.innerWidth > 640
          ? Math.max(10, window.innerWidth - 450)
          : (window.innerWidth - width) / 2;
      const initialY = window.innerWidth > 640 ? 150 : 80;
      setPosition({
        x: initialX,
        y: initialY,
      });
    }
  }, []);

  // Handle window resize to keep QR in bounds
  useEffect(() => {
    const handleResize = () => {
      if (qrRef.current) {
        setPosition((prev) => {
          const maxX = window.innerWidth - qrRef.current!.offsetWidth;
          const maxY = window.innerHeight - qrRef.current!.offsetHeight;
          return {
            x: Math.max(0, Math.min(prev.x, maxX)),
            y: Math.max(0, Math.min(prev.y, maxY)),
          };
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (qrRef.current) {
      setIsDragging(true);
      const rect = qrRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && qrRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Boundary checks
        const minX = 0;
        const maxX = window.innerWidth - qrRef.current.offsetWidth;
        const minY = 0;
        const maxY = window.innerHeight - qrRef.current.offsetHeight;

        setPosition({
          x: Math.max(minX, Math.min(newX, maxX)),
          y: Math.max(minY, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={qrRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        zIndex: 50,
      }}
      className={cn(
        "w-[calc(100vw-1rem)] sm:w-[400px] max-w-[400px] bg-card border shadow-2xl rounded-xl overflow-hidden transition-shadow duration-300",
        isDragging ? "shadow-blue-500/20 ring-1 ring-primary/20" : "",
        isMinimized ? "h-auto" : "max-h-[90vh] overflow-y-auto",
      )}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-muted/50 p-2 cursor-move flex items-center justify-between border-b"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Balasan Cepat
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div
        className={cn(
          "p-4 transition-all duration-300 origin-top",
          isMinimized ? "scale-y-0 h-0 p-0 overflow-hidden" : "scale-y-100",
        )}
      >
        <ReplyForm 
          threadId={threadId} 
          boardId={boardId}
          boardCode={boardCode} 
          idPrefix="qr" 
          userRole={userRole}
        />
      </div>
    </div>
  );
}
