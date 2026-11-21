"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { PostHogPageView } from "@/components/posthog-page-view";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // posthog.init runs once in instrumentation-client.ts
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
