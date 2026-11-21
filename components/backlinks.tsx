"use client";

import { IntentLink as Link } from "@/components/intent-link";

interface Backlink {
  type: "thread" | "reply";
  id: number;
  postNumber: number;
}

interface BacklinksProps {
  links: Backlink[];
}

export function Backlinks({ links }: BacklinksProps) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-muted">
      <span className="text-[10px] text-muted-foreground">
        Balasan:
      </span>
      {links.map((link) => (
        <Link
          key={link.postNumber}
          href={`#p${link.postNumber}`}
          className="text-[10px] text-accent hover:underline font-mono"
          onClick={(e) => {
            const target = document.getElementById(`p${link.postNumber}`);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth" });
              target.classList.add("ring-2", "ring-accent");
              setTimeout(
                () => target.classList.remove("ring-2", "ring-accent"),
                2000,
              );
            }
          }}
        >
          &gt;&gt;{link.postNumber}
        </Link>
      ))}
    </div>
  );
}
