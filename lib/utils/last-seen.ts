/**
 * Per-thread "last seen post number", kept in localStorage so we can draw a
 * "new replies" divider the next time the user opens the thread.
 */
const KEY = "ib-thread-last-seen";
const MAX_ENTRIES = 300;

type LastSeenMap = Record<string, { p: number; t: number }>;

function read(): LastSeenMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastSeenMap) : {};
  } catch {
    return {};
  }
}

export function getLastSeenPost(threadId: number): number | null {
  return read()[threadId]?.p ?? null;
}

export function setLastSeenPost(threadId: number, postNumber: number) {
  try {
    const map = read();
    if ((map[threadId]?.p ?? 0) >= postNumber) return;
    map[threadId] = { p: postNumber, t: Date.now() };

    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      keys
        .sort((a, b) => map[a].t - map[b].t)
        .slice(0, keys.length - MAX_ENTRIES)
        .forEach((k) => delete map[k]);
    }
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // best-effort
  }
}
