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
          setShowTop(!drawerOpen && !fabOpen && window.scrollY > 300);
          setShowBottom(
            !drawerOpen &&
              !fabOpen &&
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
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-[90] opacity-80 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl border border-accent/30 bg-accent/10 p-1 shadow-lg backdrop-blur-md">
        {showTop && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl text-accent hover:bg-accent/15 hover:text-accent"
            onClick={scrollToTop}
            title="Ke Paling Atas"
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Ke Atas</span>
          </Button>
        )}
        {showBottom && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl text-accent hover:bg-accent/15 hover:text-accent"
            onClick={scrollToBottom}
            title="Ke Paling Bawah"
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Ke Bawah</span>
          </Button>
        )}
      </div>
    </div>
  );
}
