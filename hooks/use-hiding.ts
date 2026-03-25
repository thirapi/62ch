"use client";

import { useState, useEffect } from "react";

export function useHiding() {
  const [hiddenThreads, setHiddenThreads] = useState<number[]>([]);
  const [hiddenReplies, setHiddenReplies] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedThreads = localStorage.getItem("62chan_hidden_threads");
    const storedReplies = localStorage.getItem("62chan_hidden_replies");
    
    if (storedThreads) {
      try {
        setHiddenThreads(JSON.parse(storedThreads));
      } catch (e) {
        console.error("Failed to parse hidden threads", e);
      }
    }
    
    if (storedReplies) {
      try {
        setHiddenReplies(JSON.parse(storedReplies));
      } catch (e) {
        console.error("Failed to parse hidden replies", e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  const hideThread = (id: number) => {
    const newHidden = [...hiddenThreads, id];
    setHiddenThreads(newHidden);
    localStorage.setItem("62chan_hidden_threads", JSON.stringify(newHidden));
  };

  const unhideThread = (id: number) => {
    const newHidden = hiddenThreads.filter((tId) => tId !== id);
    setHiddenThreads(newHidden);
    localStorage.setItem("62chan_hidden_threads", JSON.stringify(newHidden));
  };

  const hideReply = (id: number) => {
    const newHidden = [...hiddenReplies, id];
    setHiddenReplies(newHidden);
    localStorage.setItem("62chan_hidden_replies", JSON.stringify(newHidden));
  };

  const unhideReply = (id: number) => {
    const newHidden = hiddenReplies.filter((rId) => rId !== id);
    setHiddenReplies(newHidden);
    localStorage.setItem("62chan_hidden_replies", JSON.stringify(newHidden));
  };

  const clearHiddenThreads = () => {
    setHiddenThreads([]);
    localStorage.removeItem("62chan_hidden_threads");
  };

  const clearHiddenReplies = () => {
    setHiddenReplies([]);
    localStorage.removeItem("62chan_hidden_replies");
  };

  const isThreadHidden = (id: number) => hiddenThreads.includes(id);
  const isReplyHidden = (id: number) => hiddenReplies.includes(id);

  return {
    hiddenThreads,
    hiddenReplies,
    hideThread,
    unhideThread,
    hideReply,
    unhideReply,
    clearHiddenThreads,
    clearHiddenReplies,
    isThreadHidden,
    isReplyHidden,
    isLoaded,
  };
}
