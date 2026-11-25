"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useId } from "react";
import { IB_STYLES, useIbStyle } from "@/hooks/use-ib-style";
import { logout } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";
import { useNav } from "./nav-provider";

// Classic imageboard settings window, modelled on 5chan's: a small box pinned
// near the top of the screen in the post colours, a bold centred title with a
// rule under it, and plain checkboxes each with a short tip underneath.
export function SettingsModal({ user }: { user: { role: string; email: string } | null }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { style, setStyle } = useIbStyle();
  const {
    position,
    togglePosition,
    defaultBoardView,
    toggleDefaultBoardView,
    autoPlayGif,
    toggleAutoPlayGif,
    autoUpdateThread,
    toggleAutoUpdateThread,
    hoverPreview,
    toggleHoverPreview,
  } = useNav();

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          title="Pengaturan"
          aria-label="Pengaturan"
        >
          <Settings className="size-3.5" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/25" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-[101] top-[25px] left-1/2 -translate-x-1/2",
            "w-[min(395px,calc(100vw-16px))] max-h-[80vh] max-sm:max-h-[calc(100dvh-50px)] overflow-y-auto",
            "bg-ib-reply text-foreground text-sm p-0.5",
            "border-r border-b border-ib-border shadow-[0_0_5px_#00000040]",
            "focus:outline-none",
          )}
        >
          <div className="relative text-center border-b border-ib-border mt-1.5 mb-1.5 pb-1.5">
            <DialogPrimitive.Title className="text-base font-bold leading-[14px]">
              Pengaturan
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Pengaturan tampilan dan perilaku situs. Tersimpan di browser ini.
            </DialogPrimitive.Description>
            <DialogPrimitive.Close
              className="absolute -top-1 right-1 text-xs text-accent hover:underline cursor-pointer"
              aria-label="Tutup"
            >
              [×]
            </DialogPrimitive.Close>
          </div>

          <Section title="Gaya">
            <div role="radiogroup" aria-label="Gaya" className="flex flex-col gap-1">
              {IB_STYLES.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ib-style"
                    checked={style === s.id}
                    onChange={() => setStyle(s.id)}
                    className="cursor-pointer accent-accent"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Tampilan">
            {style === "hijau" && (
              <Toggle
                label="Mode gelap"
                tip="Ganti tema terang/gelap untuk gaya 62 Hijau."
                checked={resolvedTheme === "dark"}
                onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              />
            )}
            <Toggle
              label="Nav tetap"
              tip="Bar navigasi tetap terlihat saat menggulir."
              checked={position === "sticky"}
              onChange={togglePosition}
            />
            <Toggle
              label="Autoplay GIF"
              tip="Putar GIF otomatis di thumbnail."
              checked={autoPlayGif}
              onChange={toggleAutoPlayGif}
            />
            <Toggle
              label="Pratinjau hover"
              tip="Tampilkan gambar penuh saat kursor di atas thumbnail."
              checked={hoverPreview}
              onChange={toggleHoverPreview}
              className="hidden sm:block"
            />
          </Section>

          <Section title="Board & thread">
            <Toggle
              label="Buka katalog"
              tip="Board dibuka dalam tampilan katalog."
              checked={defaultBoardView === "catalog"}
              onChange={toggleDefaultBoardView}
            />
            <Toggle
              label="Perbarui otomatis"
              tip="Muat balasan baru di thread secara otomatis."
              checked={autoUpdateThread}
              onChange={toggleAutoUpdateThread}
            />
          </Section>

          {user && (
            <Section title="Akun">
              <p className="ml-1">
                <span className="font-bold text-accent">{user.role}</span>{" "}
                <span className="text-muted-foreground">{user.email}</span>
              </p>
              <form action={logout} className="ml-1 mt-1">
                [<button type="submit" className="text-destructive hover:underline cursor-pointer">
                  Keluar
                </button>]
              </form>
            </Section>
          )}

          <p className="mx-2.5 mt-3 mb-1.5 text-[0.85em] text-muted-foreground">
            Pengaturan tersimpan di browser ini.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-2.5 mt-3 pt-2 border-t border-ib-border first-of-type:mt-1 first-of-type:pt-0 first-of-type:border-t-0">
      <h3 className="text-sm font-bold mb-1.5">{title}</h3>
      <div className="ml-1 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  tip,
  checked,
  onChange,
  className,
}: {
  label: string;
  tip: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-center gap-1.5 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="cursor-pointer accent-accent"
        />
        {label}
      </label>
      <p className="pl-[19px] mt-0.5 text-[0.85em] text-muted-foreground">{tip}</p>
    </div>
  );
}
