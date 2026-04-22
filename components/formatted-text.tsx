"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getPostByNumber } from "@/lib/actions/home.actions";
import type { PostInfoEntity } from "@/lib/entities/post.entity";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { getThumbnailUrl } from "@/lib/utils/image";

interface FormattedTextProps {
  content: string;
  className?: string;
  disableEmbeds?: boolean;
  preview?: boolean;
}

export function FormattedText({
  content,
  className,
  disableEmbeds,
  preview,
}: FormattedTextProps) {
  // Normalize and split into lines
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");

  if (preview) {
    // Process each line, then join with spaces for a continuous preview
    const processedContent = rawLines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <TextLine
            text={line}
            disableEmbeds={disableEmbeds}
            preview={preview}
          />
        </React.Fragment>
      ));

    return (
      <span className={cn("break-words font-sans", className)}>
        {processedContent}
      </span>
    );
  }

  return (
    <div className={cn("whitespace-pre-wrap break-words font-sans", className)}>
      {rawLines.map((line, i) => (
        <React.Fragment key={i}>
          <TextLine
            text={line}
            disableEmbeds={disableEmbeds}
            preview={preview}
          />
          {i < rawLines.length - 1 && "\n"}
        </React.Fragment>
      ))}
    </div>
  );
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function TextLine({
  text,
  disableEmbeds,
  preview,
}: {
  text: string;
  disableEmbeds?: boolean;
  preview?: boolean;
}) {
  // Check if it's greentext
  const isPostQuote = /^>>\d+/.test(text);
  const isCrossBoardLink = /^>>>\/[a-zA-Z0-9_-]+\/?/.test(text);
  const isGreentext = text.startsWith(">") && !isPostQuote && !isCrossBoardLink;

  // Parse for quotes, spoilers, and URLs
  const parts = [];
  let lastIndex = 0;

  // Regex for >>>/board/, >>123, URLs, and various formatting tags
  const regex =
    />>>\/([a-zA-Z0-9_-]+)\/?|>>(\d+)|\[spoiler\](.*?)\[\/spoiler\]|(https?:\/\/[^\s]+)|(www\.[^\s]+)|\[b\](.*?)\[\/b\]|\[i\](.*?)\[\/i\]|\[u\](.*?)\[\/u\]|\[s\](.*?)\[\/s\]|\[code\](.*?)\[\/code\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // It's a cross-board link: >>>/board/
      const boardCode = match[1];
      const linkText = match[0];
      parts.push(
        <Link
          key={match.index}
          href={`/${boardCode}`}
          className="quote-link"
        >
          {linkText}
        </Link>
      );
    } else if (match[2]) {
      // It's a quote >>(\d+)
      const postNumber = parseInt(match[2]);
      parts.push(
        <PostQuote
          key={match.index}
          postNumber={postNumber}
          noLink={preview}
          className={preview ? "opacity-70" : ""}
        />,
      );
    } else if (match[3]) {
      // It's a spoiler
      if (preview) {
        parts.push(
          <span key={match.index} className="opacity-50 italic">
            [spoiler]
          </span>,
        );
      } else {
        parts.push(
          <span key={match.index} className="spoiler">
            {match[3]}
          </span>,
        );
      }
    } else if (match[4]) {
      // It's a URL with http:// or https://
      const url = match[4];
      const videoId = getYouTubeId(url);

      if (videoId && !disableEmbeds && !preview) {
        parts.push(<YouTubeEmbed key={match.index} videoId={videoId} />);
      } else if (preview) {
        parts.push(
          <span key={match.index} className="text-accent/70">
            {url}
          </span>,
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={url}
            className="url-link"
            target="_blank"
            rel="noopener noreferrer ugc"
          >
            {url}
          </a>,
        );
      }
    } else if (match[5]) {
      // It's a URL starting with www.
      const url = match[5];
      const fullUrl = `https://${url}`;
      const videoId = getYouTubeId(fullUrl);

      if (videoId && !disableEmbeds && !preview) {
        parts.push(<YouTubeEmbed key={match.index} videoId={videoId} />);
      } else if (preview) {
        parts.push(
          <span key={match.index} className="text-accent/70">
            {url}
          </span>,
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={fullUrl}
            className="url-link"
            target="_blank"
            rel="noopener noreferrer ugc"
          >
            {url}
          </a>,
        );
      }
    } else if (match[6]) {
      // [b] Bold
      parts.push(<strong key={match.index}>{match[6]}</strong>);
    } else if (match[7]) {
      // [i] Italic
      parts.push(<em key={match.index}>{match[7]}</em>);
    } else if (match[8]) {
      // [u] Underline
      parts.push(<u key={match.index}>{match[8]}</u>);
    } else if (match[9]) {
      // [s] Strikethrough
      parts.push(<s key={match.index}>{match[9]}</s>);
    } else if (match[10]) {
      // [code] Code
      parts.push(
        <code 
          key={match.index} 
          className="bg-muted px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-muted-foreground/10"
        >
          {match[10]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  const result = parts.length > 0 ? parts : text;

  if (isGreentext) {
    return <span className="greentext">{result}</span>;
  }

  return <>{result}</>;
}

function PostQuote({
  postNumber,
  noLink,
  className,
}: {
  postNumber: number;
  noLink?: boolean;
  className?: string;
}) {
  const [post, setPost] = useState<PostInfoEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !post && !isLoading && !hasError) {
      setIsLoading(true);
      getPostByNumber(postNumber)
        .then((data) => {
          if (data) {
            setPost(data);
          } else {
            setHasError(true);
          }
        })
        .catch(() => setHasError(true))
        .finally(() => setIsLoading(false));
    }
  };

  const href = post
    ? `/${post.boardCode}/thread/${post.threadId}#p${post.postNumber}`
    : "#";

  const handleClick = (e: React.MouseEvent) => {
    // If we are already on the same thread, do a smooth scroll + highlight
    const targetElement = document.getElementById(`p${postNumber}`);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Traditional imageboard highlight effect
      targetElement.classList.add("ring-4", "ring-accent/50", "transition-all");
      setTimeout(() => {
        targetElement.classList.remove("ring-4", "ring-accent/50");
      }, 2000);
    }
  };

  const content = <>&gt;&gt;{postNumber}</>;

  return (
    <HoverCard openDelay={200} closeDelay={100} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        {noLink ? (
          <span className={cn("quote-link cursor-help", className)}>
            {content}
          </span>
        ) : (
          <Link
            href={href}
            className={cn("quote-link", className)}
            onClick={handleClick}
          >
            {content}
          </Link>
        )}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-[calc(100vw-1rem)] sm:w-80 p-0 overflow-hidden border-accent/20 bg-card shadow-xl"
        collisionPadding={10}
      >
        {isLoading ? (
          <div className="p-4 text-xs text-muted-foreground animate-pulse">
            Memuat post...
          </div>
        ) : hasError ? (
          <div className="p-4 text-xs text-destructive">
            Post tidak ditemukan
          </div>
        ) : post ? (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono border-b pb-1">
              <span className="font-bold text-accent">#{post.postNumber}</span>
              <span className="text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              {post.image && (
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center border rounded overflow-hidden relative bg-muted/20">
                  <img
                    src={getThumbnailUrl(post.image, 100, 100, "fill")}
                    alt=""
                    className={`w-full h-full object-cover transition-all ${
                      post.isNsfw || post.isSpoiler
                        ? "blur-sm scale-110 opacity-60"
                        : ""
                    }`}
                  />
                  {(post.isNsfw || post.isSpoiler) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-bold text-white bg-black/60 px-1 py-0.5 rounded leading-none">
                        {post.isSpoiler ? "SPOIL" : "NSFW"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate mb-1">{post.author}</p>
                <p className="text-[11px] line-clamp-4 leading-relaxed opacity-90">
                  <FormattedText content={post.content} preview />
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
