// Shared (server + client) definitions for the selectable imageboard styles.

export const IB_STYLES = [
  { id: "hijau", label: "62 Hijau" },
  { id: "yotsuba", label: "Yotsuba" },
  { id: "yotsuba-b", label: "Yotsuba B" },
  { id: "tomorrow", label: "Tomorrow" },
] as const;

export type IbStyle = (typeof IB_STYLES)[number]["id"];

export const IB_STYLE_KEY = "ib-style";

/** Inline <head> script: apply the saved style before first paint (no flash). */
export const IB_STYLE_BOOT_SCRIPT = `try{var s=localStorage.getItem("${IB_STYLE_KEY}");if(s&&s!=="hijau")document.documentElement.dataset.style=s}catch(e){}`;
