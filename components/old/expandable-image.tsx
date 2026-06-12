"use client";

import { useState } from "react";

interface ExpandableImageProps {
  src: string;
  isBlurred?: boolean;
  blurLabel?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export function ExpandableImage({ 
  src, 
  isBlurred, 
  blurLabel, 
  maxWidth = "200px", 
  maxHeight = "200px" 
}: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src={src}
        alt=""
        style={{
          maxWidth: isExpanded ? "100%" : maxWidth,
          maxHeight: isExpanded ? "none" : maxHeight,
          filter: (isBlurred && !isExpanded) ? "blur(10px)" : "none",
          cursor: isExpanded ? "zoom-out" : "zoom-in",
          border: "1px solid #ccc",
          display: "block"
        }}
        onClick={toggleExpand}
      />
      {isBlurred && !isExpanded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            textShadow: "0 0 4px black",
            pointerEvents: "none",
            fontWeight: "bold",
          }}
        >
          {blurLabel}
        </div>
      )}
    </div>
  );
}
