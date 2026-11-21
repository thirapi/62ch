"use client";

import type { PostHog } from "posthog-js";

// PostHog (~68 KB gzip) is loaded after the page is interactive instead of
// shipping in the first-load bundle. Events fired before it loads wait on the
// same promise, so nothing is dropped.

let client: Promise<PostHog | null> | null = null;

function load(): Promise<PostHog | null> {
  if (client) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") {
    client = Promise.resolve(null);
    return client;
  }
  client = import("posthog-js")
    .then(({ default: posthog }) => {
      if (!posthog.__loaded) {
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          person_profiles: "identified_only",
          capture_pageview: false, // sent by PostHogPageView
        });
      }
      return posthog;
    })
    .catch(() => null);
  return client;
}

/** Start loading PostHog once the browser is idle. */
export function initAnalytics() {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => void load(), { timeout: 4000 });
  } else {
    setTimeout(() => void load(), 2000);
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  void load().then((posthog) => posthog?.capture(event, properties));
}
