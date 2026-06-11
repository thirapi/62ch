import { cn } from "@/lib/utils";

interface CapcodeMarkerProps {
  type: string | null | undefined;
  className?: string;
}

export function CapcodeMarker({ type, className }: CapcodeMarkerProps) {
  if (!type) return null;

  if (type === "mod" || type === "moderator") {
    return (
      <span
        className={cn(
          "text-purple-600 dark:text-purple-400 font-bold leading-none",
          className
        )}
      >
        ## Mod
      </span>
    );
  }

  if (type === "admin") {
    return (
      <span
        className={cn(
          "text-red-600 dark:text-red-400 font-bold leading-none",
          className
        )}
      >
        ## Admin
      </span>
    );
  }

  return null;
}
