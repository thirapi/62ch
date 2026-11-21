"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function ScrollButtons() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const checkScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Hide when the reply drawer / thread floating bar is open to avoid overlap
          const drawerOpen = document.body.classList.contains("reply-drawer-open");
          const fabOpen = document.body.classList.contains("thread-fab-open");
          // Only appear once the reader has scrolled, so the buttons never sit
          // on top of the first screen (board toolbar, catalog toggle).
          const scrolled = window.scrollY > 300;
          setShowTop(!drawerOpen && !fabOpen && scrolled);
          setShowBottom(
            !drawerOpen &&
              !fabOpen &&
              scrolled &&
              window.innerHeight + window.scrollY <
                document.documentElement.scrollHeight - 300
          );
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    // Re-check when the reply drawer opens/closes
    window.addEventListener("reply-drawer-toggle", checkScroll);

    // Mengobservasi perubahan ukuran DOM langsung (misal: user expand gambar/postingan baru masuk via live update)
    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(document.documentElement);

    // Initial check
    checkScroll();

    // Fallback delay untuk layout shifts saat navigasi React/Next
    const timeoutId = setTimeout(checkScroll, 150);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("reply-drawer-toggle", checkScroll);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  if (!showTop && !showBottom) return null;

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-[90] opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col rounded-sm border border-border bg-background">
        {showTop && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-none text-accent hover:bg-muted hover:text-accent"
            onClick={scrollToTop}
            title="Ke Paling Atas"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span className="sr-only">Ke Atas</span>
          </Button>
        )}
        {showBottom && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-none text-accent hover:bg-muted hover:text-accent"
            onClick={scrollToBottom}
            title="Ke Paling Bawah"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span className="sr-only">Ke Bawah</span>
          </Button>
        )}
      </div>
    </div>
  );
}
