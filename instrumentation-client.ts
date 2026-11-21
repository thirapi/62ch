// Client-side bootstrapping. Error monitoring (Sentry) runs on the server only
// (see instrumentation.ts), so no monitoring SDK ships in the browser bundle.

import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (key && !posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // Page view handled by PostHogPageView components
    });
  }
}
